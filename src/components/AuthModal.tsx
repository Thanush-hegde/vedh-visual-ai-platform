import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { storageService } from '../utils/storage';
import { Shield, School, GraduationCap, UserCheck, X, Check, ArrowRight, Lock, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'quick_select'>('quick_select');

  if (!isOpen) return null;

  const users = storageService.getUsers();

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const matched = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!matched) {
      setError('User not found with this email. Check credentials or select a pre-configured account below.');
      return;
    }

    if (matched.password && matched.password !== password) {
      setError('Invalid password. Default demo password for all accounts is displayed below.');
      return;
    }

    storageService.setCurrentUser(matched);
    onLoginSuccess(matched);
    onClose();
  };

  const handleQuickLogin = (user: UserAccount) => {
    storageService.setCurrentUser(user);
    onLoginSuccess(user);
    onClose();
  };

  const rolesConfig: {
    role: UserRole;
    title: string;
    description: string;
    authority: string;
    icon: any;
    color: string;
    badgeColor: string;
    defaultUser: UserAccount | undefined;
  }[] = [
    {
      role: 'owner',
      title: 'Owner / App Regulator',
      description: 'Supreme app control, configures platform rules, creates & provisions Institutions/Organizations.',
      authority: 'Sets login details for Institutions & can update own credentials anytime.',
      icon: Shield,
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50',
      badgeColor: 'bg-purple-100 text-purple-800',
      defaultUser: users.find((u) => u.role === 'owner'),
    },
    {
      role: 'institution',
      title: 'Institution / Organisation',
      description: 'Colleges, Universities, and Corporate skill academies. Reviews users and assigns mentors.',
      authority: 'Credentials set by Owner/Admin. Provisions Teacher & Mentor logins.',
      icon: School,
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50',
      badgeColor: 'bg-blue-100 text-blue-800',
      defaultUser: users.find((u) => u.role === 'institution'),
    },
    {
      role: 'teacher',
      title: 'Teacher / Mentor',
      description: 'Posts remedial classes, study materials, evaluates assessments with AI, answers student doubts.',
      authority: 'Credentials set by Institution. Assigned to student divisions/batches.',
      icon: GraduationCap,
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      defaultUser: users.find((u) => u.role === 'teacher'),
    },
    {
      role: 'student',
      title: 'Student / User',
      description: 'Primary platform learner. Accesses study material, runs Visual Concept AI, tracks attendance.',
      authority: 'Learner account mapped to college/mentor. Requests detail edits with mentor approval.',
      icon: UserCheck,
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50',
      badgeColor: 'bg-amber-100 text-amber-800',
      defaultUser: users.find((u) => u.role === 'student'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Vedh Multi-Role Authentication</h2>
            <p className="text-xs text-gray-500">4-Tier Hierarchical Access Control System</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Current User Pill */}
          {currentUser && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Currently logged in as:</span>
                <span className="font-bold text-gray-900">{currentUser.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase text-[10px]">
                  {currentUser.role}
                </span>
              </div>
              <span className="text-gray-400 font-mono">{currentUser.email}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setMode('quick_select')}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                mode === 'quick_select'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              1-Click Demo Persona Switcher (Recommended)
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Email & Password Login Form
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {mode === 'quick_select' ? (
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 flex items-center justify-between">
                <span>Select a tier to test role-specific features:</span>
                <span className="text-[11px] text-blue-600 font-semibold">Instant Access</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rolesConfig.map((item) => {
                  const Icon = item.icon;
                  const user = item.defaultUser;
                  const isCurrent = currentUser?.id === user?.id;

                  return (
                    <div
                      key={item.role}
                      onClick={() => user && handleQuickLogin(user)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${item.color} ${
                        isCurrent ? 'ring-2 ring-blue-600 border-transparent shadow-sm' : ''
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md shadow-xs">
                          <Check className="w-3 h-3 text-blue-600" /> Active
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="p-1.5 rounded-lg bg-white shadow-xs text-gray-700">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                              {item.role.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200/60 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-gray-700 font-medium">
                          <span>User: {user?.name}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="text-gray-500 text-[10px] truncate">
                          Email: <span className="font-mono text-gray-700">{user?.email}</span> | Pass: <span className="font-mono text-gray-700">{user?.password}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 italic">
                          {item.authority}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. owner@vedh.ai, prof.ananya@vedh.edu"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px] text-blue-800 space-y-1">
                <span className="font-bold">Available Accounts:</span>
                <div>• Owner: <code className="font-mono">owner@vedh.ai</code> (pass: <code className="font-mono">admin</code>)</div>
                <div>• Institution: <code className="font-mono">admin@apextech.edu</code> (pass: <code className="font-mono">apex</code>)</div>
                <div>• Teacher: <code className="font-mono">prof.ananya@vedh.edu</code> (pass: <code className="font-mono">teacher</code>)</div>
                <div>• Student: <code className="font-mono">rohit.student@vedh.edu</code> (pass: <code className="font-mono">student</code>)</div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Log In with Email & Password
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Vedh Visual AI Platform • 2026</span>
          <button
            onClick={() => storageService.resetAll()}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            Reset Demo Data
          </button>
        </div>

      </div>
    </div>
  );
};
