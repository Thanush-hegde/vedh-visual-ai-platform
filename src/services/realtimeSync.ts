import { 
  StudyMaterial, 
  VisualConceptModel, 
  AssessmentItem, 
  StudentSubmission, 
  DailyAttendanceRecord, 
  StudentProfileDetails, 
  ProfileChangeRequest, 
  MentoringMessage, 
  UserAccount, 
  Institution 
} from '../types';

export interface CloudDbState {
  users: UserAccount[];
  institutions: Institution[];
  materials: StudyMaterial[];
  concepts: VisualConceptModel[];
  assessments: AssessmentItem[];
  submissions: StudentSubmission[];
  attendance: DailyAttendanceRecord[];
  profiles: Record<string, StudentProfileDetails>;
  profileRequests: ProfileChangeRequest[];
  mentorMessages: MentoringMessage[];
  syncLogs: {
    id: string;
    entity: string;
    action: string;
    summary: string;
    senderDeviceId: string;
    senderName: string;
    timestamp: string;
  }[];
}

export interface ConnectedDeviceMeta {
  socketId: string;
  deviceId: string;
  clientName: string;
  role: string;
  userAgent?: string;
  connectedAt: string;
  lastActive: string;
}

type SyncStateListener = (state: CloudDbState) => void;
type PresenceListener = (count: number, devices: ConnectedDeviceMeta[]) => void;
type MutationListener = (mutation: {
  entity: string;
  action: string;
  data: any;
  senderDeviceId: string;
  timestamp: string;
  summary?: string;
}) => void;
type StatusListener = (status: 'connected' | 'connecting' | 'reconnecting' | 'disconnected') => void;

class RealtimeSyncManager {
  private ws: WebSocket | null = null;
  private deviceId: string;
  private status: 'connected' | 'connecting' | 'reconnecting' | 'disconnected' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectDelay = 10000;
  private activeDevicesCount = 1;
  private connectedDevices: ConnectedDeviceMeta[] = [];
  
  private stateListeners: Set<SyncStateListener> = new Set();
  private presenceListeners: Set<PresenceListener> = new Set();
  private mutationListeners: Set<MutationListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();

  private currentUser: UserAccount | null = null;

  constructor() {
    // Generate or retrieve persistent Device ID
    let storedId = '';
    try {
      storedId = localStorage.getItem('vedh_device_id') || '';
    } catch {}
    if (!storedId) {
      storedId = `dev_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36).slice(-4)}`;
      try {
        localStorage.setItem('vedh_device_id', storedId);
      } catch {}
    }
    this.deviceId = storedId;
  }

  public getDeviceId(): string {
    return this.deviceId;
  }

  public getStatus() {
    return this.status;
  }

  public getDevicesCount() {
    return this.activeDevicesCount;
  }

  public getDevices(): ConnectedDeviceMeta[] {
    return this.connectedDevices;
  }

  public setUser(user: UserAccount | null) {
    this.currentUser = user;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendAuthRegister();
    }
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.sendAuthRegister();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
        this.setStatus('disconnected');
      };
    } catch (err) {
      console.warn('WebSocket initialization failed, using HTTP polling fallback:', err);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  private sendAuthRegister() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      type: 'auth:register',
      deviceId: this.deviceId,
      clientName: this.currentUser?.name || 'Vedh User',
      role: this.currentUser?.role || 'guest',
      userId: this.currentUser?.id,
    }));
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private setStatus(newStatus: 'connected' | 'connecting' | 'reconnecting' | 'disconnected') {
    this.status = newStatus;
    this.statusListeners.forEach((l) => l(newStatus));
  }

  private handleServerMessage(msg: any) {
    if (msg.type === 'sync:init') {
      if (msg.activeDevicesCount !== undefined) {
        this.activeDevicesCount = msg.activeDevicesCount;
      }
      if (msg.devices) {
        this.connectedDevices = msg.devices;
        this.presenceListeners.forEach((l) => l(this.activeDevicesCount, this.connectedDevices));
      }
      if (msg.state) {
        this.stateListeners.forEach((l) => l(msg.state));
      }
      return;
    }

    if (msg.type === 'presence:update') {
      this.activeDevicesCount = msg.activeDevicesCount || 1;
      this.connectedDevices = msg.devices || [];
      this.presenceListeners.forEach((l) => l(this.activeDevicesCount, this.connectedDevices));
      return;
    }

    if (msg.type === 'sync:mutation') {
      this.mutationListeners.forEach((l) =>
        l({
          entity: msg.entity,
          action: msg.action,
          data: msg.data,
          senderDeviceId: msg.senderDeviceId,
          timestamp: msg.timestamp,
          summary: msg.logItem?.summary,
        })
      );
      return;
    }
  }

  // Broadcast mutation to cloud and all connected devices
  public async sendMutation(entity: string, action: string, data: any, summary?: string) {
    const payload = {
      type: 'sync:mutation',
      entity,
      action,
      data,
      senderDeviceId: this.deviceId,
      senderName: this.currentUser?.name || 'Vedh User',
      summary: summary || `${action} ${entity}`,
      timestamp: new Date().toISOString(),
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
        return;
      } catch (err) {
        console.warn('WS send failed, falling back to HTTP mutate:', err);
      }
    }

    // Fallback: send via REST API
    try {
      await fetch('/api/sync/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('REST sync mutation fallback failed:', err);
    }
  }

  public async fetchFullCloudState(): Promise<CloudDbState | null> {
    try {
      const res = await fetch('/api/sync/state');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.state) {
        this.stateListeners.forEach((l) => l(data.state));
        return data.state;
      }
      return null;
    } catch (err) {
      console.warn('Failed to fetch full cloud state:', err);
      return null;
    }
  }

  public async resetCloudDatabase() {
    try {
      await fetch('/api/sync/reset', { method: 'POST' });
    } catch (err) {
      console.error('Reset cloud error:', err);
    }
  }

  // Subscription APIs
  public onStateSync(fn: SyncStateListener) {
    this.stateListeners.add(fn);
    return () => { this.stateListeners.delete(fn); };
  }

  public onPresence(fn: PresenceListener) {
    this.presenceListeners.add(fn);
    return () => { this.presenceListeners.delete(fn); };
  }

  public onMutation(fn: MutationListener) {
    this.mutationListeners.add(fn);
    return () => { this.mutationListeners.delete(fn); };
  }

  public onStatusChange(fn: StatusListener) {
    this.statusListeners.add(fn);
    return () => { this.statusListeners.delete(fn); };
  }
}

// Export singleton instance
export const realtimeSync = new RealtimeSyncManager();
