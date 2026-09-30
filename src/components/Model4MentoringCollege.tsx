import React, { useState, useEffect } from 'react';
import { 
  UserAccount, 
  StudentProfileDetails, 
  ProfileChangeRequest, 
  MentoringMessage 
} from '../types';
import { storageService } from '../utils/storage';
import { requestMentorHelp } from '../services/api';
import { 
  Users, 
  GraduationCap, 
  FileCheck, 
  Mail, 
  HelpCircle, 
  Check, 
  X, 
  Send, 
  Sparkles, 
  Edit3, 
  School, 
  User, 
  FileText, 
  Clock, 
  AlertCircle,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface Model4Props {
  currentUser: UserAccount | null;
}

export const Model4MentoringCollege: React.FC<Model4Props> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'mentoring'>('mentoring');
  const [profiles, setProfiles] = useState<Record<string, StudentProfileDetails>>(() => storageService.getProfiles());
  const [requests, setRequests] = useState<ProfileChangeRequest[]>(() => storageService.getProfileRequests());
  const [messages, setMessages] = useState<MentoringMessage[]>(() => storageService.getMentorMessages());

  // Real-time synchronization subscription
  useEffect(() => {
    const unsub = storageService.subscribe((entity) => {
      if (entity === 'mentorMessages' || entity === 'all') {
        setMessages(storageService.getMentorMessages());
      }
      if (entity === 'profileRequests' || entity === 'all') {
        setRequests(storageService.getProfileRequests());
      }
      if (entity === 'profiles' || entity === 'all') {
        setProfiles(storageService.getProfiles());
      }
    });
    return unsub;
  }, []);

  // Current active profile
  const studentKey = currentUser?.id || 'user-student-1';
  const myProfile: StudentProfileDetails = profiles[studentKey] || {
    studentId: studentKey,
    studentName: currentUser?.name || 'Rohit Kulkarni',
    academicYear: '2025-2026',
    institutionName: currentUser?.institutionName || 'Apex Institute of Technology & AI',
    classGroup: currentUser?.classGroup || 'TY Computer Science & AI',
    division: currentUser?.division || 'Div A',
    rollNo: currentUser?.rollNo || 'CS-108',
    mentorId: 'user-teach-1',
    mentorName: 'Prof. Ananya Sharma',
    documentName: 'Student_ID_Card_Verified.pdf',
  };

  // Student Edit Request Modal State
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [reqClass, setReqClass] = useState(myProfile.classGroup);
  const [reqDiv, setReqDiv] = useState(myProfile.division);
  const [reqRoll, setReqRoll] = useState(myProfile.rollNo);
  const [reqYear, setReqYear] = useState(myProfile.academicYear);
  const [reqReason, setReqReason] = useState('');

  // Mentoring query/email state
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgType, setMsgType] = useState<'doubt' | 'difficulty' | 'formal_email'>('doubt');
  const [notification, setNotification] = useState('');

  // Mentor response modal state (for teachers)
  const [selectedMsgForReply, setSelectedMsgForReply] = useState<MentoringMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loadingAiSuggestion, setLoadingAiSuggestion] = useState(false);

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'institution' || currentUser?.role === 'owner';
  const isStudent = currentUser?.role === 'student';

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Student submits profile change request
  const handleSubmitProfileChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqReason.trim()) return;

    const newReq: ProfileChangeRequest = {
      id: `req-${Date.now()}`,
      studentId: myProfile.studentId,
      studentName: myProfile.studentName,
      mentorId: myProfile.mentorId,
      mentorName: myProfile.mentorName,
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'pending',
      proposedChanges: {
        classGroup: reqClass,
        division: reqDiv,
        rollNo: reqRoll,
        academicYear: reqYear,
      },
      reason: reqReason,
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    storageService.saveProfileRequests(updated);
    setShowEditRequestModal(false);
    setReqReason('');
    showToast('Profile modification request sent to your mentor for approval.');
  };

  // Mentor approves profile change
  const handleApproveRequest = (req: ProfileChangeRequest) => {
    const updatedProfiles = { ...profiles };
    const cur = updatedProfiles[req.studentId] || myProfile;
    updatedProfiles[req.studentId] = {
      ...cur,
      ...req.proposedChanges,
    };

    const updatedReqs = requests.map((r) =>
      r.id === req.id ? { ...r, status: 'approved' as const, mentorNote: 'Approved by mentor.' } : r
    );

    setProfiles(updatedProfiles);
    setRequests(updatedReqs);
    storageService.saveProfiles(updatedProfiles);
    storageService.saveProfileRequests(updatedReqs);
    showToast(`Request approved! Student details updated for ${req.studentName}.`);
  };

  // Mentor rejects profile change
  const handleRejectRequest = (req: ProfileChangeRequest) => {
    const updatedReqs = requests.map((r) =>
      r.id === req.id ? { ...r, status: 'rejected' as const, mentorNote: 'Requires departmental sign-off.' } : r
    );
    setRequests(updatedReqs);
    storageService.saveProfileRequests(updatedReqs);
    showToast(`Request marked as rejected.`);
  };

  // Student sends question/email to mentor
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgSubject.trim() || !msgContent.trim()) return;

    const newMsg: MentoringMessage = {
      id: `msg-${Date.now()}`,
      studentId: myProfile.studentId,
      studentName: myProfile.studentName,
      mentorId: myProfile.mentorId,
      mentorName: myProfile.mentorName,
      subject: msgSubject,
      messageType: msgType,
      content: msgContent,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    const updated = [newMsg, ...messages];
    setMessages(updated);
    storageService.saveMentorMessages(updated);
    setMsgSubject('');
    setMsgContent('');
    showToast('Your message has been delivered to your mentor.');
  };

  // Mentor uses AI to draft reply
  const handleGenerateAiReply = async (msg: MentoringMessage) => {
    setLoadingAiSuggestion(true);
    try {
      const guidance = await requestMentorHelp({
        studentName: msg.studentName,
        subject: msg.subject,
        question: msg.content,
      });

      setReplyText(guidance.suggestedResponse);
      showToast('AI draft generated! Review and personalize before sending.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiSuggestion(false);
    }
  };

  // Mentor sends reply
  const handleSendMentorReply = (msgId: string) => {
    if (!replyText.trim()) return;

    const updated = messages.map((m) => {
      if (m.id === msgId) {
        return {
          ...m,
          reply: replyText,
          repliedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return m;
    });

    setMessages(updated);
    storageService.saveMentorMessages(updated);
    setSelectedMsgForReply(null);
    setReplyText('');
    showToast('Reply delivered to student!');
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
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
            Model 4
          </span>
          <h1 className="text-xl font-bold text-gray-900">Mentoring & College</h1>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center p-1 bg-gray-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('mentoring')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'mentoring'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>Mentoring</span>
          </button>
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'profile'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Student Profile</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MENTORING INTERACTION */}
      {activeSubTab === 'mentoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Ask Doubts / Formal Email Form (Left column) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Communicate with Mentor</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Assigned Mentor: <strong className="text-gray-800">{myProfile.mentorName}</strong>
                </p>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Communication Type</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'doubt', label: 'Academic Doubt' },
                      { id: 'difficulty', label: 'Learning Difficulty' },
                      { id: 'formal_email', label: 'Formal Email' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMsgType(t.id as any)}
                        className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border text-center transition-colors ${
                          msgType === t.id
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Line</label>
                  <input
                    type="text"
                    required
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    placeholder={
                      msgType === 'formal_email'
                        ? 'e.g. Formal Request for Internship Endorsement Letter'
                        : 'e.g. Question regarding Loss Curves in Convolutional Networks'
                    }
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {msgType === 'formal_email' ? 'Formal Email Body' : 'Describe your doubt or difficulty'}
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                    placeholder="Convey your message clearly. You can mention specific video timestamps, visual concept stages, or exam questions..."
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to {myProfile.mentorName}</span>
                </button>
              </form>
            </div>

            {/* Mentor Office Hours Card */}
            <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-4 text-xs space-y-2">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Mentor Clinic & Office Hours
              </span>
              <p className="text-gray-700 leading-relaxed font-medium">
                Prof. Ananya Sharma is available for live 1-on-1 virtual mentoring every Tuesday and Thursday at 4:30 PM.
              </p>
              <div className="text-[11px] text-amber-800 font-semibold">
                Venue: Vedh Virtual Meeting Room • Division A Assigned
              </div>
            </div>
          </div>

          {/* Mentoring Inbox / Conversation Thread (Right column) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Mentoring Messages</h3>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {messages.length} Records
                </span>
              </div>

              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{msg.subject}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                          msg.messageType === 'formal_email'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {msg.messageType.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">{msg.sentAt}</span>
                    </div>

                    {/* Query Content */}
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {msg.content}
                    </p>

                    <div className="text-[11px] text-gray-400 flex items-center justify-between">
                      <span>From: <strong>{msg.studentName}</strong></span>
                      <span>To Mentor: <strong>{msg.mentorName}</strong></span>
                    </div>

                    {/* Reply Section */}
                    {msg.reply ? (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Mentor Advice ({msg.mentorName})
                          </span>
                          <span className="text-[10px] text-emerald-700">{msg.repliedAt}</span>
                        </div>
                        <p className="text-gray-800 leading-relaxed font-medium">{msg.reply}</p>

                        {msg.suggestedActionPlan && (
                          <div className="mt-2 pt-2 border-t border-emerald-200 text-[11px] space-y-1">
                            <span className="font-bold text-emerald-900">Recommended Action Plan:</span>
                            {msg.suggestedActionPlan.map((act, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-gray-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : isTeacherOrAdmin ? (
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
                        <button
                          onClick={() => {
                            setSelectedMsgForReply(msg);
                            setReplyText('');
                            handleGenerateAiReply(msg);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Respond to Student</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting mentor response</span>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: STUDENT PROFILE & PERMISSION WORKFLOW */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Official Student Card (Left) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {myProfile.studentName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{myProfile.studentName}</h2>
                    <span className="text-xs text-blue-600 font-semibold">{myProfile.institutionName}</span>
                  </div>
                </div>

                {isStudent && (
                  <button
                    onClick={() => {
                      setReqClass(myProfile.classGroup);
                      setReqDiv(myProfile.division);
                      setReqRoll(myProfile.rollNo);
                      setReqYear(myProfile.academicYear);
                      setShowEditRequestModal(true);
                    }}
                    className="p-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 border border-blue-200"
                    title="Request to edit details with mentor permission"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit with Permission</span>
                  </button>
                )}
              </div>

              {/* Detail Items */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Class & Program</span>
                  <span className="font-semibold text-gray-900">{myProfile.classGroup}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Division & Roll No</span>
                  <span className="font-semibold text-gray-900">{myProfile.division} • {myProfile.rollNo}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Academic Year</span>
                  <span className="font-semibold text-gray-900">{myProfile.academicYear}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Assigned Mentor</span>
                  <span className="font-semibold text-gray-900">{myProfile.mentorName}</span>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Verified Student Credentials & Documents:</span>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-semibold text-gray-800">{myProfile.documentName || 'Institutional_ID_Verified.pdf'}</span>
                      <span className="text-[10px] text-gray-400 block">Digitally endorsed by Dean of Academics</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Verified
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Mentor Permission & Change Requests Roster (Right) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Detail Change Requests with Mentor Permission</h3>
                  <p className="text-xs text-gray-500">Students cannot alter records unilaterally without mentor sign-off</p>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {requests.length} Requests
                </span>
              </div>

              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-900">{req.studentName}</span>
                        <span className="text-xs text-gray-500 ml-2">Requested on {req.requestedAt}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Proposed changes */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-1">
                      <span className="font-bold text-gray-700">Proposed Adjustments:</span>
                      <div className="grid grid-cols-2 gap-2 text-gray-600">
                        {req.proposedChanges.classGroup && <div>Class: <strong>{req.proposedChanges.classGroup}</strong></div>}
                        {req.proposedChanges.division && <div>Division: <strong>{req.proposedChanges.division}</strong></div>}
                        {req.proposedChanges.rollNo && <div>Roll No: <strong>{req.proposedChanges.rollNo}</strong></div>}
                        {req.proposedChanges.academicYear && <div>Academic Year: <strong>{req.proposedChanges.academicYear}</strong></div>}
                      </div>
                      <div className="pt-1 text-gray-500">
                        <span className="font-semibold text-gray-700">Reason:</span> {req.reason}
                      </div>
                    </div>

                    {/* Actions for Mentor */}
                    {isTeacherOrAdmin && req.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleRejectRequest(req)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Reject Request
                        </button>
                        <button
                          onClick={() => handleApproveRequest(req)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Update Profile
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STUDENT PROFILE EDIT REQUEST MODAL */}
      {showEditRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Request Profile Modification</h3>
                <p className="text-xs text-gray-500">Requires formal mentor permission</p>
              </div>
              <button onClick={() => setShowEditRequestModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSubmitProfileChange} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Class / Program</label>
                <input
                  type="text"
                  value={reqClass}
                  onChange={(e) => setReqClass(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Division</label>
                  <input
                    type="text"
                    value={reqDiv}
                    onChange={(e) => setReqDiv(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Roll No</label>
                  <input
                    type="text"
                    value={reqRoll}
                    onChange={(e) => setReqRoll(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={reqYear}
                  onChange={(e) => setReqYear(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Detail Change (Required for Mentor Approval)
                </label>
                <textarea
                  rows={3}
                  required
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Explain why details need modification (e.g. branch change, division reassignment)..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditRequestModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Submit Request to Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MENTOR REPLY MODAL (TEACHER) */}
      {selectedMsgForReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Reply to Student Query</h3>
                <p className="text-xs text-gray-500">Student: {selectedMsgForReply.studentName}</p>
              </div>
              <button onClick={() => setSelectedMsgForReply(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                <div className="font-bold text-gray-900 mb-1">{selectedMsgForReply.subject}</div>
                <div className="text-gray-700">{selectedMsgForReply.content}</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">Mentor Advice</label>
                  <button
                    onClick={() => handleGenerateAiReply(selectedMsgForReply)}
                    disabled={loadingAiSuggestion}
                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{loadingAiSuggestion ? 'Drafting...' : 'Redraft with AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide educational guidance, action steps, or scheduled review time..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setSelectedMsgForReply(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendMentorReply(selectedMsgForReply.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Deliver Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
