import React, { useState, useEffect } from 'react';
import { UserAccount, VisualConceptModel } from './types';
import { storageService } from './utils/storage';
import { realtimeSync } from './services/realtimeSync';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { Model1StudyMaterial } from './components/Model1StudyMaterial';
import { Model2ConceptVisualizer } from './components/Model2ConceptVisualizer';
import { Model3AttendanceAssessment } from './components/Model3AttendanceAssessment';
import { Model4MentoringCollege } from './components/Model4MentoringCollege';
import { RoleAdminManagement } from './components/RoleAdminManagement';
import { CloudLightning, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => storageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'model1' | 'model2' | 'model3' | 'model4' | 'admin'>('model1');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cloudSyncModalOpen, setCloudSyncModalOpen] = useState(false);

  // Real-Time Cloud Sync State
  const [syncStatus, setSyncStatus] = useState<'connected' | 'connecting' | 'reconnecting' | 'disconnected'>('connecting');
  const [activeDevicesCount, setActiveDevicesCount] = useState<number>(1);
  const [remoteSyncToast, setRemoteSyncToast] = useState<string | null>(null);

  // Active duration attendance tracking (Model 3)
  const todayStr = new Date().toISOString().split('T')[0];
  const [activeSeconds, setActiveSeconds] = useState<number>(() => {
    const user = storageService.getCurrentUser();
    return user ? storageService.getSessionSeconds(user.id, todayStr) : 1850;
  });

  // Simulated Bluetooth Campus Beacon (Model 3)
  const [bluetoothConnected, setBluetoothConnected] = useState<boolean>(true);

  // Cross-model handoffs
  const [visualizerSourcePayload, setVisualizerSourcePayload] = useState<{ title: string; content: string; type: string } | null>(null);
  const [attachedConceptForAssessment, setAttachedConceptForAssessment] = useState<VisualConceptModel | null>(null);

  // Real-time Cloud Synchronization Lifecycle
  useEffect(() => {
    realtimeSync.setUser(currentUser);
    realtimeSync.connect();

    // 1. Authoritative initial cloud state from server
    const unsubState = realtimeSync.onStateSync((cloudState) => {
      storageService.applyRemoteState(cloudState);
    });

    // 2. Real-time delta mutations from other connected devices!
    const unsubMutation = realtimeSync.onMutation((mut) => {
      if (mut.senderDeviceId !== realtimeSync.getDeviceId()) {
        storageService.applyRemoteMutation(mut);

        // Flash notification banner when a remote device updates state
        const actionLabel = mut.summary || `Updated ${mut.entity} from remote device`;
        setRemoteSyncToast(`Cloud Sync • ${actionLabel}`);
        setTimeout(() => setRemoteSyncToast(null), 4000);
      }
    });

    // 3. Presence & connection status
    const unsubPresence = realtimeSync.onPresence((count) => {
      setActiveDevicesCount(count);
    });

    const unsubStatus = realtimeSync.onStatusChange((st) => {
      setSyncStatus(st);
    });

    return () => {
      unsubState();
      unsubMutation();
      unsubPresence();
      unsubStatus();
    };
  }, []);

  // Update user in realtime sync when changed
  useEffect(() => {
    realtimeSync.setUser(currentUser);
  }, [currentUser]);

  // Continuous active duration ticker (when student or user is using the app)
  useEffect(() => {
    if (!currentUser) return;

    const timer = setInterval(() => {
      setActiveSeconds((prev) => {
        const next = prev + 1;
        storageService.setSessionSeconds(currentUser.id, todayStr, next);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser, todayStr]);

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
    setAuthModalOpen(true);
  };

  const handleSendToVisualizer = (title: string, content: string, type: string) => {
    setVisualizerSourcePayload({ title, content, type });
    setActiveTab('model2');
  };

  const handleAttachToAssessment = (concept: VisualConceptModel) => {
    setAttachedConceptForAssessment(concept);
    setActiveTab('model3');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Real-time remote sync floating alert banner */}
      {remoteSyncToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-gray-700 flex items-center gap-2.5 animate-bounce">
          <CloudLightning className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>{remoteSyncToast}</span>
          <button 
            onClick={() => setRemoteSyncToast(null)} 
            className="text-gray-400 hover:text-white ml-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        activeSeconds={activeSeconds}
        bluetoothConnected={bluetoothConnected}
        onToggleBluetooth={() => setBluetoothConnected(!bluetoothConnected)}
        syncStatus={syncStatus}
        activeDevicesCount={activeDevicesCount}
        onOpenCloudSync={() => setCloudSyncModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'model1' && (
          <Model1StudyMaterial
            currentUser={currentUser}
            onSendToVisualizer={handleSendToVisualizer}
          />
        )}

        {activeTab === 'model2' && (
          <Model2ConceptVisualizer
            currentUser={currentUser}
            initialSource={visualizerSourcePayload}
            onAttachToAssessment={handleAttachToAssessment}
          />
        )}

        {activeTab === 'model3' && (
          <Model3AttendanceAssessment
            currentUser={currentUser}
            activeSeconds={activeSeconds}
            bluetoothConnected={bluetoothConnected}
            onToggleBluetooth={() => setBluetoothConnected(!bluetoothConnected)}
            attachedConcept={attachedConceptForAssessment}
            onClearAttachedConcept={() => setAttachedConceptForAssessment(null)}
          />
        )}

        {activeTab === 'model4' && (
          <Model4MentoringCollege
            currentUser={currentUser}
          />
        )}

        {activeTab === 'admin' && (
          <RoleAdminManagement
            currentUser={currentUser}
            onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Vedh Visual AI Platform</span>
            <span>• Real-Time Cloud Sync Enabled</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCloudSyncModalOpen(true)}
              className="text-purple-600 hover:underline font-semibold flex items-center gap-1"
            >
              <CloudLightning className="w-3.5 h-3.5" />
              <span>{activeDevicesCount} {activeDevicesCount === 1 ? 'Device' : 'Devices'} Connected</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              Switch Role / View Logins
            </button>
            <span>•</span>
            <button
              onClick={() => storageService.resetAll()}
              className="text-gray-400 hover:text-red-600 transition-colors"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* Authentication & Persona Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveSeconds(storageService.getSessionSeconds(user.id, todayStr));
        }}
      />

      {/* Real-time Cloud Sync & Devices Modal */}
      <CloudSyncModal
        isOpen={cloudSyncModalOpen}
        onClose={() => setCloudSyncModalOpen(false)}
        syncStatus={syncStatus}
        activeDevicesCount={activeDevicesCount}
      />

    </div>
  );
}
