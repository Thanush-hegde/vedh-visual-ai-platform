import React, { useState, useEffect } from 'react';
import { realtimeSync, ConnectedDeviceMeta } from '../services/realtimeSync';
import { storageService } from '../utils/storage';
import { 
  Cloud, 
  CloudLightning, 
  Radio, 
  Laptop, 
  Smartphone, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Activity, 
  X, 
  Clock, 
  Wifi, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
  activeDevicesCount: number;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  activeDevicesCount,
}) => {
  const [devices, setDevices] = useState<ConnectedDeviceMeta[]>(() => realtimeSync.getDevices());
  const [logs, setLogs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState('');

  const myDeviceId = realtimeSync.getDeviceId();

  useEffect(() => {
    if (!isOpen) return;

    // Fetch full cloud state on open to get latest logs
    realtimeSync.fetchFullCloudState().then((state) => {
      if (state?.syncLogs) {
        setLogs(state.syncLogs);
      }
    });

    const unsubscribePresence = realtimeSync.onPresence((_count, devList) => {
      setDevices(devList);
    });

    const unsubscribeMutation = realtimeSync.onMutation((mut) => {
      setLogs((prev) => [
        {
          id: `local-${Date.now()}`,
          entity: mut.entity,
          action: mut.action,
          summary: mut.summary || `${mut.action} on ${mut.entity}`,
          senderDeviceId: mut.senderDeviceId,
          timestamp: mut.timestamp,
        },
        ...prev.slice(0, 49),
      ]);
    });

    return () => {
      unsubscribePresence();
      unsubscribeMutation();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleForceSync = async () => {
    setRefreshing(true);
    const state = await realtimeSync.fetchFullCloudState();
    if (state) {
      storageService.applyRemoteState(state);
      setLogs(state.syncLogs || []);
      showToast('Authoritative state synchronized with cloud server!');
    }
    setRefreshing(false);
  };

  const handleTestBroadcast = () => {
    realtimeSync.sendMutation(
      'system',
      'ping',
      { pingAt: new Date().toISOString() },
      `Ping broadcast from Device ${myDeviceId.slice(0, 8)}`
    );
    showToast('Real-time test ping dispatched to all devices!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${
              syncStatus === 'connected' ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              <CloudLightning className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>Real-Time Cloud Synchronization</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  syncStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  {syncStatus === 'connected' ? 'LIVE' : syncStatus.toUpperCase()}
                </span>
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {toast && (
            <div className="p-3 bg-gray-900 text-white text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toast}</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Cloud Status</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                WebSocket Open
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Connected Devices</span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                {activeDevicesCount} Active Online
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">This Device ID</span>
              <span className="font-mono font-bold text-blue-700 truncate block mt-0.5">
                {myDeviceId.slice(0, 14)}...
              </span>
            </div>
          </div>

          {/* Connected Devices Roster */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>Active Connected Devices in Session ({devices.length || 1})</span>
              </h3>
              <span className="text-[10px] text-gray-400">Live heartbeat</span>
            </div>

            <div className="space-y-2">
              {devices.length === 0 ? (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-gray-900">Current Device (Active Client)</span>
                      <span className="text-[10px] text-gray-500 block font-mono">ID: {myDeviceId}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">This Device</span>
                </div>
              ) : (
                devices.map((dev, idx) => {
                  const isCurrent = dev.deviceId === myDeviceId;
                  return (
                    <div
                      key={dev.socketId || idx}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        isCurrent ? 'bg-blue-50/60 border-blue-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                          {dev.userAgent?.includes('Mobi') ? (
                            <Smartphone className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Laptop className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{dev.clientName || 'Connected Client'}</span>
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded uppercase">
                              {dev.role || 'user'}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Device: {dev.deviceId.slice(0, 16)} • Connected {new Date(dev.connectedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                          Current Device
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Remote Syncing
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Cross-Device Split-Screen Testing Helper */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs flex items-center justify-between">
            <span className="font-bold text-purple-900 flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-purple-600" /> Multi-Device Split Window Testing
            </span>
            <a
              href={window.location.href}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-purple-700 hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-purple-200"
            >
              <span>Open 2nd Window</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Real-time Cloud Event Stream */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Event Stream (Audit Log)</span>
              </h3>
              <span className="text-[10px] text-gray-400">Sync history</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 rounded-lg">
                  No events recorded yet. Perform an action to see real-time sync.
                </div>
              ) : (
                logs.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs flex items-center justify-between"
                  >
                    <div className="truncate mr-3">
                      <div className="font-medium text-gray-900 truncate">{item.summary}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-2">
                        <span>Device: {item.senderDeviceId?.slice(0, 10)}</span>
                        <span>•</span>
                        <span>Entity: {item.entity}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
          <button
            onClick={handleTestBroadcast}
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            Dispatch Test Ping
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleForceSync}
              disabled={refreshing}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Force Pull Cloud State</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-xs"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
