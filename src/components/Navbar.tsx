import React from 'react';
import { UserAccount } from '../types';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Clock, 
  Radio, 
  Wifi, 
  User, 
  Layers,
  CloudLightning
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount | null;
  activeTab: 'model1' | 'model2' | 'model3' | 'model4' | 'admin';
  setActiveTab: (tab: 'model1' | 'model2' | 'model3' | 'model4' | 'admin') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeSeconds: number;
  bluetoothConnected: boolean;
  onToggleBluetooth: () => void;
  syncStatus: 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
  activeDevicesCount: number;
  onOpenCloudSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  activeSeconds,
  bluetoothConnected,
  onToggleBluetooth,
  syncStatus,
  activeDevicesCount,
  onOpenCloudSync,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'owner':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">Owner / Admin</span>;
      case 'institution':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Institution</span>;
      case 'teacher':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Teacher / Mentor</span>;
      case 'student':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Student</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-gray-900">VEDH</span>
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200/60">Visual AI</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Indicators & Attendance Duration Status */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            {/* Live active duration */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
              <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Time Today:</span>
              <span className="font-mono font-bold text-gray-900">{formatTime(activeSeconds)}</span>
              {activeSeconds >= 1800 ? (
                <span className="ml-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Present</span>
              ) : (
                <span className="ml-1 text-[10px] text-amber-600">({Math.round((activeSeconds / 1800) * 100)}% of 30m)</span>
              )}
            </div>

            {/* Bluetooth Proximity Beacon */}
            <button
              onClick={onToggleBluetooth}
              title="Click to toggle campus Bluetooth beacon simulation"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                bluetoothConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${bluetoothConnected ? 'text-emerald-600 animate-pulse' : 'text-gray-400'}`} />
              <span>{bluetoothConnected ? 'Beacon: Connected' : 'Beacon: Disconnected'}</span>
            </button>

            {/* Online Connection */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span>Online</span>
            </div>

            {/* Real-time Cloud Sync & Active Devices Indicator */}
            <button
              onClick={onOpenCloudSync}
              title="Click to view real-time connected devices & cloud sync details"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                syncStatus === 'connected'
                  ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <CloudLightning className={`w-3.5 h-3.5 ${syncStatus === 'connected' ? 'text-purple-600 animate-pulse' : 'text-amber-500'}`} />
              <span>Cloud Sync</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-200/70 text-purple-800 text-[10px] font-bold">
                {activeDevicesCount} {activeDevicesCount === 1 ? 'Device' : 'Devices'}
              </span>
            </button>
          </div>

          {/* User Account & Role Switcher */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-sm font-semibold text-gray-900">{currentUser.name}</span>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <span className="text-xs text-gray-500">{currentUser.email}</span>
                </div>
                
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Switch accounts or view logins"
                >
                  <User className="w-3.5 h-3.5 text-gray-600" />
                  <span>Switch Role</span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Log In / Register
              </button>
            )}
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar gap-1 border-t border-gray-100 pt-1 pb-1">
          <button
            onClick={() => setActiveTab('model1')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'model1'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Model 1: Study Materials</span>
          </button>

          <button
            onClick={() => setActiveTab('model2')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'model2'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Model 2: Visual Concept Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('model3')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'model3'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Model 3: Attendance & Assessment</span>
          </button>

          <button
            onClick={() => setActiveTab('model4')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'model4'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>Model 4: Mentoring & College</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ml-auto ${
              activeTab === 'admin'
                ? 'bg-gray-100 text-gray-900 border border-gray-300'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-gray-700" />
            <span>
              {currentUser?.role === 'owner' ? 'Owner / App Regulator' :
               currentUser?.role === 'institution' ? 'Institution Portal' :
               currentUser?.role === 'teacher' ? 'Mentor Roster' : 'My Academic Dossier'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
