export type UserRole = 'owner' | 'institution' | 'teacher' | 'student';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  institutionId?: string;
  institutionName?: string;
  mentorId?: string;
  mentorName?: string;
  classGroup?: string;
  division?: string;
  rollNo?: string;
  academicYear?: string;
  createdAt: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  category: 'University' | 'College' | 'School' | 'Corporate Organization';
  email: string;
  contactPerson: string;
  phone: string;
  address: string;
  status: 'active' | 'pending' | 'suspended';
  createdById: string;
  teachersCount: number;
  studentsCount: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  description: string;
  category: 'Remedial Class' | 'Core Lecture' | 'Case Study' | 'Skill Workshop';
  type: 'video' | 'pdf' | 'ppt' | 'audio' | 'image' | 'textbook';
  url?: string;
  fileUrl?: string;
  fileName?: string;
  duration?: string;
  uploadedByTeacherName: string;
  uploadedByTeacherId: string;
  divisionTarget: string;
  createdAt: string;
  remedialClassScheduled?: string;
  contentSnippet?: string;
}

export interface VisualConceptStep {
  id: number;
  title: string;
  description: string;
  badge: string;
  icon: string;
  color: string;
  metrics: string;
  state: string;
}

export interface VisualConceptModel {
  id: string;
  conceptName: string;
  sourceType: 'youtube' | 'video' | 'picture' | 'pdf' | 'text' | 'ppt' | 'audio' | 'drive';
  sourceTitle: string;
  sourceContent: string;
  description: string;
  steps: VisualConceptStep[];
  relationships: { from: number; to: number; label: string }[];
  interactiveElements?: { key: string; label: string; min: number; max: number; default: number; unit: string }[];
  keyTakeaway: string;
  createdAt: string;
  createdByStudentId: string;
  createdByStudentName: string;
}

export interface DailyAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  division: string;
  date: string; // YYYY-MM-DD
  minutesSpent: number;
  requiredMinutes: number;
  status: 'Present' | 'In-Progress' | 'Absent';
  beaconDetected: boolean;
  beaconName: string;
  onlineConnection: boolean;
  verifiedAt?: string;
}

export interface AssessmentItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string;
  teacherId: string;
  teacherName: string;
  divisionTarget: string;
  maxMarks: number;
  rubricCriteria: string;
  allowedFormats: ('video' | 'pdf' | 'ppt' | 'audio' | 'case_study' | 'qa_exam' | 'visual_concept')[];
  submissionsCount?: number;
}

export interface StudentSubmission {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  division: string;
  submittedAt: string;
  formatType: 'video' | 'pdf' | 'ppt' | 'audio' | 'case_study' | 'qa_exam' | 'visual_concept';
  contentSummary: string;
  attachedVisualConceptId?: string;
  fileAttachmentName?: string;
  // Evaluation
  evaluated: boolean;
  evaluationMethod?: 'ai' | 'practical_manual';
  score?: number;
  maxMarks: number;
  grade?: string;
  teacherFeedback?: string;
  aiRubricBreakdown?: { criterion: string; score: number; max: number; feedback: string }[];
  evaluatedAt?: string;
}

export interface StudentProfileDetails {
  studentId: string;
  studentName: string;
  academicYear: string;
  institutionName: string;
  classGroup: string;
  division: string;
  rollNo: string;
  mentorId: string;
  mentorName: string;
  idCardUrl?: string;
  documentName?: string;
}

export interface ProfileChangeRequest {
  id: string;
  studentId: string;
  studentName: string;
  mentorId: string;
  mentorName: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  proposedChanges: Partial<StudentProfileDetails>;
  reason: string;
  mentorNote?: string;
}

export interface MentoringMessage {
  id: string;
  studentId: string;
  studentName: string;
  mentorId: string;
  mentorName: string;
  subject: string;
  messageType: 'doubt' | 'difficulty' | 'formal_email';
  content: string;
  sentAt: string;
  reply?: string;
  repliedAt?: string;
  suggestedActionPlan?: string[];
}
