import React, { useState, useEffect } from 'react';
import { 
  UserAccount, 
  AssessmentItem, 
  StudentSubmission, 
  DailyAttendanceRecord, 
  VisualConceptModel 
} from '../types';
import { storageService } from '../utils/storage';
import { evaluateAssessment } from '../services/api';
import { 
  CheckCircle2, 
  Clock, 
  Radio, 
  Wifi, 
  FileText, 
  Upload, 
  Sparkles, 
  Award, 
  ChevronRight, 
  Check, 
  Layers, 
  Video, 
  Headphones, 
  FileCheck, 
  HelpCircle,
  Calendar,
  AlertCircle,
  UserCheck
} from 'lucide-react';

interface Model3Props {
  currentUser: UserAccount | null;
  activeSeconds: number;
  bluetoothConnected: boolean;
  onToggleBluetooth: () => void;
  attachedConcept?: VisualConceptModel | null;
  onClearAttachedConcept?: () => void;
}

export const Model3AttendanceAssessment: React.FC<Model3Props> = ({
  currentUser,
  activeSeconds,
  bluetoothConnected,
  onToggleBluetooth,
  attachedConcept,
  onClearAttachedConcept,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'assessment'>('assessment');
  const [assessments, setAssessments] = useState<AssessmentItem[]>(() => storageService.getAssessments());
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => storageService.getSubmissions());
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>(() => storageService.getAttendance());

  // Real-time synchronization subscription
  useEffect(() => {
    const unsub = storageService.subscribe((entity) => {
      if (entity === 'assessments' || entity === 'all') {
        setAssessments(storageService.getAssessments());
      }
      if (entity === 'submissions' || entity === 'all') {
        setSubmissions(storageService.getSubmissions());
      }
      if (entity === 'attendance' || entity === 'all') {
        setAttendanceRecords(storageService.getAttendance());
      }
    });
    return unsub;
  }, []);

  // Assessment submission state (Student)
  const [selectedAssessmentForSubmit, setSelectedAssessmentForSubmit] = useState<AssessmentItem | null>(null);
  const [submissionFormat, setSubmissionFormat] = useState<'video' | 'pdf' | 'ppt' | 'audio' | 'case_study' | 'qa_exam' | 'visual_concept'>('visual_concept');
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState('');
  const [notification, setNotification] = useState('');

  // Assessment creation state (Teacher)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Visual AI & Deep Learning');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('2026-04-15');
  const [newMaxMarks, setNewMaxMarks] = useState(50);
  const [newRubric, setNewRubric] = useState('Concept Clarity (15), Visual Structure (15), Technical Depth (10), Real-World Application (10)');

  // Evaluation modal (Teacher)
  const [activeSubForEval, setActiveSubForEval] = useState<StudentSubmission | null>(null);
  const [evalMode, setEvalMode] = useState<'ai' | 'manual'>('ai');
  const [evalLoading, setEvalLoading] = useState(false);
  const [manualScore, setManualScore] = useState(45);
  const [manualGrade, setManualGrade] = useState('A+');
  const [manualFeedback, setManualFeedback] = useState('');

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'institution' || currentUser?.role === 'owner';
  const isStudent = currentUser?.role === 'student';

  const requiredMinutes = 30;
  const currentMinutes = Math.floor(activeSeconds / 60);
  const isAttendancePresent = currentMinutes >= requiredMinutes && bluetoothConnected;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handlePostAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: AssessmentItem = {
      id: `assess-${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      description: newDesc,
      deadline: newDeadline,
      teacherId: currentUser?.id || 'teacher-default',
      teacherName: currentUser?.name || 'Prof. Faculty',
      divisionTarget: 'Div A',
      maxMarks: newMaxMarks,
      rubricCriteria: newRubric,
      allowedFormats: ['visual_concept', 'pdf', 'ppt', 'case_study', 'video', 'qa_exam'],
      submissionsCount: 0,
    };

    const updated = [item, ...assessments];
    setAssessments(updated);
    storageService.saveAssessments(updated);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    showToast('Assessment posted successfully to division students!');
  };

  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessmentForSubmit) return;

    const newSub: StudentSubmission = {
      id: `sub-${Date.now()}`,
      assessmentId: selectedAssessmentForSubmit.id,
      assessmentTitle: selectedAssessmentForSubmit.title,
      studentId: currentUser?.id || 'user-student-1',
      studentName: currentUser?.name || 'Rohit Kulkarni',
      rollNo: currentUser?.rollNo || 'CS-108',
      division: currentUser?.division || 'Div A',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      formatType: submissionFormat,
      contentSummary: submissionText || 'Student submitted requested coursework.',
      attachedVisualConceptId: submissionFormat === 'visual_concept' ? (attachedConcept?.id || 'concept-1') : undefined,
      fileAttachmentName: submissionFile || (submissionFormat === 'pdf' ? 'Coursework_Answers.pdf' : undefined),
      evaluated: false,
      maxMarks: selectedAssessmentForSubmit.maxMarks,
    };

    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    storageService.saveSubmissions(updated);
    setSelectedAssessmentForSubmit(null);
    setSubmissionText('');
    setSubmissionFile('');
    if (onClearAttachedConcept) onClearAttachedConcept();
    showToast('Assessment submitted successfully for faculty evaluation!');
  };

  const handleEvaluateAi = async (sub: StudentSubmission) => {
    setEvalLoading(true);
    try {
      const matchAssess = assessments.find((a) => a.id === sub.assessmentId);
      const evalResult = await evaluateAssessment({
        assignmentTitle: sub.assessmentTitle,
        studentSubmission: sub.contentSummary + (sub.attachedVisualConceptId ? ' [Visual Concept Model Attached]' : ''),
        rubricCriteria: matchAssess?.rubricCriteria || 'Clarity, Depth, and Accuracy',
        maxMarks: sub.maxMarks || 50,
      });

      const updated = submissions.map((s) => {
        if (s.id === sub.id) {
          return {
            ...s,
            evaluated: true,
            evaluationMethod: 'ai' as const,
            score: evalResult.score,
            grade: evalResult.grade,
            teacherFeedback: evalResult.overallFeedback,
            aiRubricBreakdown: evalResult.rubricBreakdown,
            evaluatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return s;
      });

      setSubmissions(updated);
      storageService.saveSubmissions(updated);
      setActiveSubForEval(null);
      showToast('AI System evaluated the submission against rubric!');
    } catch (err) {
      console.error(err);
      showToast('Evaluation failed. Please try manual review.');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleEvaluateManual = (sub: StudentSubmission) => {
    const updated = submissions.map((s) => {
      if (s.id === sub.id) {
        return {
          ...s,
          evaluated: true,
          evaluationMethod: 'practical_manual' as const,
          score: manualScore,
          grade: manualGrade,
          teacherFeedback: manualFeedback || 'Reviewed manually by faculty without AI.',
          evaluatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return s;
    });

    setSubmissions(updated);
    storageService.saveSubmissions(updated);
    setActiveSubForEval(null);
    showToast('Manual faculty evaluation saved successfully!');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-gray-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
            Model 3
          </span>
          <h1 className="text-xl font-bold text-gray-900">Attendance & Assessment</h1>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center p-1 bg-gray-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('assessment')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'assessment'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assessments</span>
          </button>
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'attendance'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Attendance</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ATTENDANCE & INFRASTRUCTURE */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          
          {/* Infrastructure Live Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Daily Duration Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" /> Daily Active Duration
                </span>
                <span className="font-mono text-[11px] text-gray-400">Target: {requiredMinutes}m</span>
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900 font-mono">
                  {currentMinutes}m {activeSeconds % 60}s
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (activeSeconds / (requiredMinutes * 60)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bluetooth Campus Beacon Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-600" /> Bluetooth Proximity
                </span>
                <button
                  onClick={onToggleBluetooth}
                  className="text-[10px] font-semibold text-blue-600 hover:underline"
                >
                  Toggle Beacon
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${bluetoothConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-sm font-bold text-gray-900">
                    {bluetoothConnected ? 'Beacon Connected' : 'Beacon Not Detected'}
                  </span>
                </div>
                <div className="text-xs text-gray-600 font-mono mt-1">
                  {bluetoothConnected ? 'Vedh Hall 4 AI Beacon [RSSI: -58dBm]' : 'Scan for campus gateway...'}
                </div>
              </div>
            </div>

            {/* Connection & Status Verification Seal */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-purple-600" /> Infrastructure Verdict
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Live
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {isAttendancePresent ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" /> Verified Present
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" /> In-Progress ({Math.round((activeSeconds / (requiredMinutes * 60)) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Daily Attendance Logs Roster */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Official Daily Attendance Records</h3>
                <p className="text-xs text-gray-500">Division A • Academic Session 2025-2026</p>
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                Date: {new Date().toISOString().split('T')[0]}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-y border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Time Spent</th>
                    <th className="py-2.5 px-3">Beacon Infrastructure</th>
                    <th className="py-2.5 px-3">Connection</th>
                    <th className="py-2.5 px-3 text-right">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Current Active User Record */}
                  <tr className="bg-blue-50/30 font-medium">
                    <td className="py-3 px-3 font-mono font-bold text-blue-900">
                      {currentUser?.rollNo || 'CS-108'}
                    </td>
                    <td className="py-3 px-3 text-gray-900 flex items-center gap-1.5">
                      <span>{currentUser?.name || 'Current User'}</span>
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">You</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{currentUser?.division || 'Div A'}</td>
                    <td className="py-3 px-3 font-mono text-gray-900 font-bold">{currentMinutes} mins</td>
                    <td className="py-3 px-3 text-gray-600">
                      {bluetoothConnected ? '✓ Hall 4 Beacon (Near)' : '— Offline'}
                    </td>
                    <td className="py-3 px-3 text-emerald-600">Active High-Speed</td>
                    <td className="py-3 px-3 text-right">
                      {isAttendancePresent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3 text-emerald-600" /> Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" /> In-Progress
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Seeded Records */}
                  {attendanceRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-mono text-gray-700">{rec.rollNo}</td>
                      <td className="py-3 px-3 text-gray-800 font-semibold">{rec.studentName}</td>
                      <td className="py-3 px-3 text-gray-600">{rec.division}</td>
                      <td className="py-3 px-3 font-mono text-gray-700">{rec.minutesSpent} mins</td>
                      <td className="py-3 px-3 text-gray-500 truncate max-w-xs">{rec.beaconName}</td>
                      <td className="py-3 px-3 text-gray-600">{rec.onlineConnection ? 'Online' : 'Offline'}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3 text-emerald-600" /> {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: ASSESSMENTS & EVALUATIONS */}
      {activeSubTab === 'assessment' && (
        <div className="space-y-6">
          
          {/* Post Assessment Trigger (For Teachers) */}
          {isTeacherOrAdmin && (
            <div className="flex justify-between items-center bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Teacher Assessment Suite</h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Post New Assessment</span>
              </button>
            </div>
          )}

          {/* Active Assessments List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Assigned Coursework & Visual Assessments</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-blue-600">{item.subject}</span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Due: {item.deadline}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">{item.title}</h3>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">{item.description}</p>

                    {/* Rubric criteria */}
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-[11px] text-gray-600 mb-3">
                      <span className="font-bold text-gray-800">Rubric Criteria: </span>
                      {item.rubricCriteria}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
                      <span className="font-semibold">Allowed Formats:</span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">Visual Concept</span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">PDF</span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">Video</span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">Q&A</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Max Marks: {item.maxMarks}</span>
                    
                    {isStudent && (
                      <button
                        onClick={() => setSelectedAssessmentForSubmit(item)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" /> Submit Assessment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submissions & Evaluation Queue */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Student Submissions & Faculty Evaluation</h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                Total: {submissions.length}
              </span>
            </div>

            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{sub.assessmentTitle}</span>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase">
                        {sub.formatType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 leading-relaxed">
                      {sub.contentSummary}
                    </div>

                    <div className="text-[11px] text-gray-400 flex items-center gap-3">
                      <span>Student: <strong className="text-gray-700">{sub.studentName}</strong> ({sub.rollNo})</span>
                      <span>Submitted: {sub.submittedAt}</span>
                    </div>

                    {/* Teacher / AI feedback display if evaluated */}
                    {sub.evaluated && (
                      <div className="mt-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            Grade: {sub.grade} ({sub.score}/{sub.maxMarks} marks)
                          </span>
                          <span className="text-[10px] uppercase font-bold text-emerald-700">
                            {sub.evaluationMethod === 'ai' ? 'Evaluated via AI System' : 'Reviewed Manually'}
                          </span>
                        </div>
                        <p className="text-gray-700 font-medium">{sub.teacherFeedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {sub.evaluated ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Evaluated
                      </span>
                    ) : isTeacherOrAdmin ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveSubForEval(sub);
                            setEvalMode('ai');
                            handleEvaluateAi(sub);
                          }}
                          disabled={evalLoading}
                          className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>{evalLoading ? 'Evaluating...' : 'Evaluate with AI'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveSubForEval(sub);
                            setEvalMode('manual');
                            setManualScore(Math.floor(sub.maxMarks * 0.85));
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-gray-600" />
                          <span>Manual Review</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        Pending Evaluation
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* STUDENT SUBMISSION MODAL */}
      {selectedAssessmentForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Submit Assessment Coursework</h3>
                <p className="text-xs text-gray-500">{selectedAssessmentForSubmit.title}</p>
              </div>
              <button onClick={() => setSelectedAssessmentForSubmit(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSubmitAssessment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Submission Format</label>
                <select
                  value={submissionFormat}
                  onChange={(e: any) => setSubmissionFormat(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="visual_concept">Interactive Visual Concept (from Model 2)</option>
                  <option value="pdf">PDF / Document File</option>
                  <option value="ppt">PowerPoint / Presentation</option>
                  <option value="video">Video Recording</option>
                  <option value="audio">Audio Explanation</option>
                  <option value="case_study">Case Study Written Answer</option>
                  <option value="qa_exam">Examination Q&A Response</option>
                </select>
              </div>

              {submissionFormat === 'visual_concept' && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Attached Visual Concept Model:
                  </span>
                  <p className="text-purple-800">
                    {attachedConcept ? attachedConcept.conceptName : 'Default: Neural Network Forward-Propagation Pipeline'}
                  </p>
                  <span className="text-[10px] text-purple-600 block">
                    Interactive simulation stages, parameters & diagrams will be evaluated by faculty.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Answer / Synthesis & Notes
                </label>
                <textarea
                  rows={4}
                  required
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Provide comprehensive written answer, methodology, explanation, or case study responses..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Attachment Name (Simulated Document / Video / Audio / PPT)
                </label>
                <input
                  type="text"
                  value={submissionFile}
                  onChange={(e) => setSubmissionFile(e.target.value)}
                  placeholder="e.g. Rohit_Attention_Architecture_Visual_Exam.pdf"
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssessmentForSubmit(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Submit Coursework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER CREATE ASSESSMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Post New Assessment / Examination</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handlePostAssessment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Model 2 Concept Examination: Attention Matrices"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(parseInt(e.target.value))}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Submission Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assignment Requirements</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Students should upload video/audio/pdf or attach visualization..."
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rubric Criteria (for AI & Manual Grading)</label>
                <textarea
                  rows={2}
                  value={newRubric}
                  onChange={(e) => setNewRubric(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Post Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER PRACTICAL MANUAL EVALUATION MODAL */}
      {activeSubForEval && evalMode === 'manual' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Manual Faculty Review (Without AI)</h3>
                <p className="text-xs text-gray-500">Student: {activeSubForEval.studentName} ({activeSubForEval.rollNo})</p>
              </div>
              <button onClick={() => setActiveSubForEval(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                <div className="font-bold text-gray-900 mb-1">Student Answer:</div>
                <div className="text-gray-700">{activeSubForEval.contentSummary}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Score (Out of {activeSubForEval.maxMarks})</label>
                  <input
                    type="number"
                    max={activeSubForEval.maxMarks}
                    value={manualScore}
                    onChange={(e) => setManualScore(parseInt(e.target.value))}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Letter Grade</label>
                  <select
                    value={manualGrade}
                    onChange={(e) => setManualGrade(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="C">C (Pass)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Faculty Remarks & Feedback</label>
                <textarea
                  rows={3}
                  value={manualFeedback}
                  onChange={(e) => setManualFeedback(e.target.value)}
                  placeholder="Enter constructive remarks, commendations, or areas for improvement..."
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setActiveSubForEval(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEvaluateManual(activeSubForEval)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Save Manual Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
