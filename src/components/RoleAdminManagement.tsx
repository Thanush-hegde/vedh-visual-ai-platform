import React, { useState, useEffect } from 'react';
import { UserAccount, Institution } from '../types';
import { storageService } from '../utils/storage';
import { 
  ShieldCheck, 
  School, 
  GraduationCap, 
  UserPlus, 
  Key, 
  Edit3, 
  Check, 
  Users, 
  Award, 
  Layers, 
  Building, 
  Lock, 
  Mail, 
  UserCheck 
} from 'lucide-react';

interface RoleAdminProps {
  currentUser: UserAccount | null;
  onUpdateCurrentUser: (user: UserAccount) => void;
}

export const RoleAdminManagement: React.FC<RoleAdminProps> = ({
  currentUser,
  onUpdateCurrentUser,
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => storageService.getUsers());
  const [institutions, setInstitutions] = useState<Institution[]>(() => storageService.getInstitutions());
  const [notification, setNotification] = useState('');

  // Real-time synchronization subscription
  useEffect(() => {
    const unsub = storageService.subscribe((entity) => {
      if (entity === 'users' || entity === 'all') {
        setUsers(storageService.getUsers());
      }
      if (entity === 'institutions' || entity === 'all') {
        setInstitutions(storageService.getInstitutions());
      }
    });
    return unsub;
  }, []);

  // Owner Self-Credential Edit State
  const [ownerEmail, setOwnerEmail] = useState(currentUser?.email || '');
  const [ownerPassword, setOwnerPassword] = useState(currentUser?.password || '');
  const [ownerName, setOwnerName] = useState(currentUser?.name || '');

  // Add Institution Modal (Owner only)
  const [showAddInstModal, setShowAddInstModal] = useState(false);
  const [instName, setInstName] = useState('');
  const [instCode, setInstCode] = useState('');
  const [instCategory, setInstCategory] = useState<'University' | 'College' | 'School' | 'Corporate Organization'>('College');
  const [instEmail, setInstEmail] = useState('');
  const [instPassword, setInstPassword] = useState('');
  const [instContact, setInstContact] = useState('');

  // Add Teacher Modal (Institution only)
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [teachName, setTeachName] = useState('');
  const [teachEmail, setTeachEmail] = useState('');
  const [teachPassword, setTeachPassword] = useState('');
  const [teachClass, setTeachClass] = useState('TY Computer Science & AI');
  const [teachDivision, setTeachDivision] = useState('Div A');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Owner updates own credentials
  const handleUpdateOwnerCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedUser: UserAccount = {
      ...currentUser,
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
    };

    const updatedList = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedList);
    storageService.saveUsers(updatedList);
    storageService.setCurrentUser(updatedUser);
    onUpdateCurrentUser(updatedUser);
    showToast('App Regulator credentials updated successfully!');
  };

  // Owner provisions new Institution & login details
  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName.trim() || !instEmail.trim() || !instPassword.trim()) return;

    const instId = `inst-${Date.now()}`;
    const newInst: Institution = {
      id: instId,
      name: instName,
      code: instCode || `INST-${Math.floor(1000 + Math.random() * 9000)}`,
      category: instCategory,
      email: instEmail,
      contactPerson: instContact || 'Head of Academy',
      phone: '+91 98000 00000',
      address: 'Main Campus',
      status: 'active',
      createdById: currentUser?.id || 'user-owner-1',
      teachersCount: 1,
      studentsCount: 20,
    };

    // Also create login account for institution
    const instUser: UserAccount = {
      id: `user-inst-${Date.now()}`,
      name: instName,
      email: instEmail,
      role: 'institution',
      password: instPassword,
      institutionId: instId,
      institutionName: instName,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedInsts = [newInst, ...institutions];
    const updatedUsers = [instUser, ...users];
    setInstitutions(updatedInsts);
    setUsers(updatedUsers);
    storageService.saveInstitutions(updatedInsts);
    storageService.saveUsers(updatedUsers);

    setShowAddInstModal(false);
    setInstName('');
    setInstEmail('');
    setInstPassword('');
    showToast(`Institution & login credentials provisioned for "${instName}"!`);
  };

  // Institution provisions new Teacher/Mentor login details
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachName.trim() || !teachEmail.trim() || !teachPassword.trim()) return;

    const teacherUser: UserAccount = {
      id: `user-teach-${Date.now()}`,
      name: teachName,
      email: teachEmail,
      role: 'teacher',
      password: teachPassword,
      institutionId: currentUser?.institutionId || 'inst-1',
      institutionName: currentUser?.name || 'Apex Institute of Technology & AI',
      classGroup: teachClass,
      division: teachDivision,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedUsers = [teacherUser, ...users];
    setUsers(updatedUsers);
    storageService.saveUsers(updatedUsers);

    setShowAddTeacherModal(false);
    setTeachName('');
    setTeachEmail('');
    setTeachPassword('');
    showToast(`Teacher/Mentor credentials set for "${teachName}" assigned to ${teachDivision}!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-gray-700 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-800">
            Administration
          </span>
          <h1 className="text-xl font-bold text-gray-900">
            {currentUser?.role === 'owner' ? 'App Regulator & Institutional Provisioning' :
             currentUser?.role === 'institution' ? 'Institution Portal & Faculty Provisioning' :
             currentUser?.role === 'teacher' ? 'Faculty Mentor Roster' : 'Student Academic Dossier'}
          </h1>
        </div>
      </div>

      {/* VIEW 1: OWNER / APP REGULATOR CONTROLS */}
      {currentUser?.role === 'owner' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Owner Self-Login Editor Card (Left) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Regulator Credentials Setting</h3>
                    <p className="text-xs text-gray-500">Edit and update your own login credentials anytime</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateOwnerCredentials} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Owner / Regulator Name</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Regulator Email</label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Regulator Password</label>
                    <input
                      type="text"
                      required
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-lg font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors"
                  >
                    Save & Update My Credentials
                  </button>
                </form>
              </div>

              {/* System Metrics */}
              <div className="bg-purple-50/50 rounded-2xl border border-purple-200 p-5 space-y-3">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Platform Health</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-purple-100">
                    <span className="text-gray-400 block text-[10px]">Active Institutions</span>
                    <span className="font-bold text-gray-900 text-lg">{institutions.length}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-purple-100">
                    <span className="text-gray-400 block text-[10px]">Total Accounts</span>
                    <span className="font-bold text-gray-900 text-lg">{users.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutions Management List (Right) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Provisioned Institutions & Organizations</h3>
                    <p className="text-xs text-gray-500">Universities, colleges, schools, and corporate academies</p>
                  </div>
                  <button
                    onClick={() => setShowAddInstModal(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Set New Institution Login</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {institutions.map((inst) => {
                    const instUser = users.find((u) => u.institutionId === inst.id || u.email === inst.email);
                    return (
                      <div
                        key={inst.id}
                        className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{inst.name}</span>
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {inst.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-500">{inst.code}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <div>Contact: <strong>{inst.contactPerson}</strong></div>
                          <div>Phone: {inst.phone}</div>
                          <div>Address: {inst.address}</div>
                          <div>Affiliated Faculty: {inst.teachersCount}</div>
                        </div>

                        {/* Login credentials set by Owner */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                          <div className="text-gray-500 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>Login: <strong className="font-mono text-gray-800">{inst.email}</strong></span>
                            <span>• Password: <strong className="font-mono text-gray-800">{instUser?.password || 'apex'}</strong></span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Active
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: INSTITUTION CONTROLS (Add teachers / mentors) */}
      {currentUser?.role === 'institution' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Faculty & Mentor Provisioning Portal</h3>
                <p className="text-xs text-gray-500">
                  {currentUser.name} • Set login credentials for Teachers & assign to Divisions
                </p>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Set New Teacher/Mentor Login</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.filter((u) => u.role === 'teacher').map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{t.name}</h4>
                        <span className="text-[11px] text-gray-500">{t.classGroup || 'AI & Computer Science'}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {t.division || 'Div A'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-gray-600">
                      <span>Login Email:</span>
                      <strong className="font-mono text-gray-900">{t.email}</strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Password:</span>
                      <strong className="font-mono text-gray-900">{t.password || 'teacher'}</strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Assigned Batch:</span>
                      <strong className="text-emerald-700">Roll No 101 to 140 (Div A)</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TEACHER / MENTOR ROSTER */}
      {currentUser?.role === 'teacher' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Assigned Student Roster</h3>
              <p className="text-xs text-gray-500">
                Mentor: <strong className="text-gray-800">{currentUser.name}</strong> • Division A ({currentUser.classGroup})
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.filter((u) => u.role === 'student').map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl border border-gray-200 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-gray-900">{s.name}</span>
                      <span className="font-mono font-bold text-blue-700">{s.rollNo}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">{s.classGroup}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{s.email}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold">Verified Student</span>
                    <span className="text-gray-400">{s.academicYear}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: STUDENT DOSSIER SUMMARY */}
      {currentUser?.role === 'student' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{currentUser.name}</h3>
              <p className="text-xs text-blue-600">{currentUser.institutionName} • Roll: {currentUser.rollNo}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-400 block text-[10px]">Division</span>
              <span className="font-bold text-gray-900">{currentUser.division || 'Div A'}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-400 block text-[10px]">Mentor</span>
              <span className="font-bold text-gray-900">{currentUser.mentorName || 'Prof. Ananya Sharma'}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-400 block text-[10px]">Academic Year</span>
              <span className="font-bold text-gray-900">{currentUser.academicYear || '2025-2026'}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OWNER ADDS INSTITUTION */}
      {showAddInstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Provision Institution / Organization</h3>
              <button onClick={() => setShowAddInstModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleAddInstitution} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  placeholder="e.g. Symbiosis Institute of Digital Skills"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={instCategory}
                    onChange={(e: any) => setInstCategory(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="School">School</option>
                    <option value="Corporate Organization">Corporate Organization</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={instCode}
                    onChange={(e) => setInstCode(e.target.value)}
                    placeholder="e.g. SIDS-PUNE"
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Institution Admin Login Email</label>
                <input
                  type="email"
                  required
                  value={instEmail}
                  onChange={(e) => setInstEmail(e.target.value)}
                  placeholder="admin@institution.edu"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  value={instPassword}
                  onChange={(e) => setInstPassword(e.target.value)}
                  placeholder="Enter initial password"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddInstModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Provision Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSTITUTION ADDS TEACHER */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Provision Teacher / Mentor Login</h3>
              <button onClick={() => setShowAddTeacherModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Faculty Name</label>
                <input
                  type="text"
                  required
                  value={teachName}
                  onChange={(e) => setTeachName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Verma"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Faculty Login Email</label>
                <input
                  type="email"
                  required
                  value={teachEmail}
                  onChange={(e) => setTeachEmail(e.target.value)}
                  placeholder="e.g. prof.verma@vedh.edu"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="text"
                  required
                  value={teachPassword}
                  onChange={(e) => setTeachPassword(e.target.value)}
                  placeholder="Set initial password"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Class / Department</label>
                  <input
                    type="text"
                    value={teachClass}
                    onChange={(e) => setTeachClass(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Division</label>
                  <input
                    type="text"
                    value={teachDivision}
                    onChange={(e) => setTeachDivision(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Provision Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
