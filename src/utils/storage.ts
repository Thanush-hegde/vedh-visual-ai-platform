import {
  UserAccount,
  Institution,
  StudyMaterial,
  VisualConceptModel,
  DailyAttendanceRecord,
  AssessmentItem,
  StudentSubmission,
  StudentProfileDetails,
  ProfileChangeRequest,
  MentoringMessage
} from '../types';
import { realtimeSync, CloudDbState } from '../services/realtimeSync';

const STORAGE_KEYS = {
  USERS: 'vedh_users_v2',
  CURRENT_USER: 'vedh_current_user_v2',
  INSTITUTIONS: 'vedh_institutions_v2',
  MATERIALS: 'vedh_materials_v2',
  CONCEPTS: 'vedh_concepts_v2',
  ATTENDANCE: 'vedh_attendance_v2',
  ASSESSMENTS: 'vedh_assessments_v2',
  SUBMISSIONS: 'vedh_submissions_v2',
  PROFILES: 'vedh_profiles_v2',
  PROFILE_REQUESTS: 'vedh_profile_requests_v2',
  MENTOR_MESSAGES: 'vedh_mentor_messages_v2',
  ACTIVE_TIME: 'vedh_active_time_v2',
};

// Seed Users
const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-owner-1',
    name: 'Dr. Vedh Patel (Supreme Regulator)',
    email: 'owner@vedh.ai',
    role: 'owner',
    password: 'admin',
    createdAt: '2026-01-01',
  },
  {
    id: 'user-inst-1',
    name: 'Apex Institute of Technology & AI',
    email: 'admin@apextech.edu',
    role: 'institution',
    password: 'apex',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & AI',
    createdAt: '2026-01-10',
  },
  {
    id: 'user-teach-1',
    name: 'Prof. Ananya Sharma',
    email: 'prof.ananya@vedh.edu',
    role: 'teacher',
    password: 'teacher',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & AI',
    classGroup: 'TY Computer Science & AI',
    division: 'Div A',
    createdAt: '2026-01-15',
  },
  {
    id: 'user-student-1',
    name: 'Rohit Kulkarni',
    email: 'rohit.student@vedh.edu',
    role: 'student',
    password: 'student',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & AI',
    mentorId: 'user-teach-1',
    mentorName: 'Prof. Ananya Sharma',
    classGroup: 'TY Computer Science & AI',
    division: 'Div A',
    rollNo: 'CS-108',
    academicYear: '2025-2026',
    createdAt: '2026-02-01',
  },
  {
    id: 'user-student-2',
    name: 'Neha Deshmukh',
    email: 'neha.deshmukh@vedh.edu',
    role: 'student',
    password: 'student',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & AI',
    mentorId: 'user-teach-1',
    mentorName: 'Prof. Ananya Sharma',
    classGroup: 'TY Computer Science & AI',
    division: 'Div A',
    rollNo: 'CS-109',
    academicYear: '2025-2026',
    createdAt: '2026-02-02',
  }
];

const DEFAULT_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1',
    name: 'Apex Institute of Technology & AI',
    code: 'AIT-AI-2026',
    category: 'College',
    email: 'admin@apextech.edu',
    contactPerson: 'Dean Dr. M. K. Rao',
    phone: '+91 98230 45678',
    address: 'Knowledge Corridor, Tech Park, Pune',
    status: 'active',
    createdById: 'user-owner-1',
    teachersCount: 14,
    studentsCount: 280,
  },
  {
    id: 'inst-2',
    name: 'Global Business & Innovation Academy',
    code: 'GBIA-CORP',
    category: 'Corporate Organization',
    email: 'skills@globalbiz.org',
    contactPerson: 'Director Sarah Jenkins',
    phone: '+91 98451 12345',
    address: 'Cyber Towers, Bangalore',
    status: 'active',
    createdById: 'user-owner-1',
    teachersCount: 8,
    studentsCount: 145,
  }
];

const DEFAULT_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Remedial Class: Convolutional Neural Networks & Feature Extraction',
    subject: 'Visual AI & Deep Learning',
    description: 'Special catch-up remedial video session covering kernel convolutions, pooling layers, and spatial feature maps for students needing foundational reinforcement.',
    category: 'Remedial Class',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=FmpDIaiMIeA',
    duration: '34 mins',
    uploadedByTeacherName: 'Prof. Ananya Sharma',
    uploadedByTeacherId: 'user-teach-1',
    divisionTarget: 'Div A',
    createdAt: '2026-03-15',
    remedialClassScheduled: 'Every Tuesday & Thursday 4:00 PM',
    contentSnippet: 'Convolutional neural networks apply learnable filters over 2D input matrices. Key concepts: Kernel Size, Stride, Padding, Receptive Field, and Pooling reduction.'
  },
  {
    id: 'mat-2',
    title: 'Transformer Architecture & Attention Mechanisms (Comprehensive PDF)',
    subject: 'Natural Language & Multimodal AI',
    description: 'Detailed textbook chapter and slides on query-key-value self-attention matrices and feed-forward projection.',
    category: 'Core Lecture',
    type: 'pdf',
    fileName: 'Transformers_Deep_Dive_v3.pdf',
    uploadedByTeacherName: 'Prof. Ananya Sharma',
    uploadedByTeacherId: 'user-teach-1',
    divisionTarget: 'Div A',
    createdAt: '2026-03-12',
    contentSnippet: 'Self-Attention formula: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V. Multi-head attention allows the model to jointly attend to information at different positions.'
  },
  {
    id: 'mat-3',
    title: 'Case Study: AI-Powered Autonomous Fleet Routing in Smart Cities',
    subject: 'Applied Systems Engineering',
    description: 'Real-world business case study on how edge IoT sensors and dynamic graphs optimize urban electric vehicle dispatch.',
    category: 'Case Study',
    type: 'ppt',
    fileName: 'Autonomous_Fleet_Case_Study.pptx',
    uploadedByTeacherName: 'Prof. Ananya Sharma',
    uploadedByTeacherId: 'user-teach-1',
    divisionTarget: 'Div A',
    createdAt: '2026-03-10',
    contentSnippet: 'Case Study parameters: Fleet size 500 EVs, graph nodes 14,200. Evaluates Dijkstra vs A* vs Reinforcement Learning routing under grid congestion constraints.'
  },
  {
    id: 'mat-4',
    title: 'Audio Lecture: Heuristic Optimization & Genetic Algorithms',
    subject: 'Advanced Algorithms',
    description: 'Audio recording breakdown of mutation, crossover, and fitness landscapes for stochastic optimization problems.',
    category: 'Core Lecture',
    type: 'audio',
    fileName: 'Genetic_Algorithms_Audio_Explainer.mp3',
    duration: '22 mins',
    uploadedByTeacherName: 'Prof. Ananya Sharma',
    uploadedByTeacherId: 'user-teach-1',
    divisionTarget: 'Div A',
    createdAt: '2026-03-08',
    contentSnippet: 'Genetic algorithms simulate natural selection. Core operators: Selection (Roulette wheel / Tournament), Crossover (Single-point / Uniform), and Mutation with low probability.'
  }
];

const DEFAULT_CONCEPTS: VisualConceptModel[] = [
  {
    id: 'concept-1',
    conceptName: 'Neural Network Visual Forward-Propagation Pipeline',
    sourceType: 'youtube',
    sourceTitle: 'MIT 6.034 Deep Learning Lecture Summary',
    sourceContent: 'Input vectors enter through sensory nodes, multiplied by synaptic weight matrices, offset by biases, activated via non-linear ReLU functions, and projected to probability distribution via Softmax.',
    description: 'Interactive animated data flow showing input feature matrices traversing weighted hidden layers into probability classifications.',
    steps: [
      {
        id: 1,
        title: 'Input Ingestion Layer',
        description: 'Receives raw normalized pixels or numerical vectors from source dataset.',
        badge: 'Layer 0',
        icon: 'Layers',
        color: '#2563EB',
        metrics: 'Input Dim: 784 nodes',
        state: 'Streaming'
      },
      {
        id: 2,
        title: 'Weighted Dot-Product & Bias',
        description: 'Multiplies input matrix by synaptic weight tensor (W) and injects bias offset (b).',
        badge: 'Hidden Layer 1',
        icon: 'Cpu',
        color: '#7C3AED',
        metrics: 'Params: 100K weights',
        state: 'Computing'
      },
      {
        id: 3,
        title: 'Non-Linear Activation (ReLU)',
        description: 'Zeroes out negative activation signals, introducing non-linearity to learn complex boundaries.',
        badge: 'Activation',
        icon: 'Activity',
        color: '#EC4899',
        metrics: 'f(x) = max(0, x)',
        state: 'Saturated'
      },
      {
        id: 4,
        title: 'Softmax Probability Projection',
        description: 'Normalizes final logits into a verified multi-class probability distribution summing to 1.0.',
        badge: 'Output Head',
        icon: 'Sparkles',
        color: '#10B981',
        metrics: 'Confidence: 98.7%',
        state: 'Classified'
      }
    ],
    relationships: [
      { from: 1, to: 2, label: 'Feed Forward' },
      { from: 2, to: 3, label: 'Matrix Multiplication' },
      { from: 3, to: 4, label: 'Softmax Normalization' }
    ],
    interactiveElements: [
      { key: 'learningRate', label: 'Signal Velocity', min: 1, max: 5, default: 2, unit: 'x' },
      { key: 'activationThreshold', label: 'Neuron Sensitivity', min: 1, max: 10, default: 6, unit: 'thresh' }
    ],
    keyTakeaway: 'Forward propagation maps complex multi-dimensional signals into high-confidence semantic categories through cascading affine transformations.',
    createdAt: '2026-03-18',
    createdByStudentId: 'user-student-1',
    createdByStudentName: 'Rohit Kulkarni'
  }
];

const DEFAULT_ASSESSMENTS: AssessmentItem[] = [
  {
    id: 'assess-1',
    title: 'Model 2 Visual Assessment: Architectural Diagram of Multi-Head Attention',
    subject: 'Visual AI & Deep Learning',
    description: 'Generate an interactive concept visualization from the lecture slides or YouTube link. Upload your generated visualization or submit a breakdown highlighting Query, Key, and Value interactions.',
    deadline: '2026-04-10',
    teacherId: 'user-teach-1',
    teacherName: 'Prof. Ananya Sharma',
    divisionTarget: 'Div A',
    maxMarks: 50,
    rubricCriteria: 'Conceptual Accuracy (15 marks), Visual Clarity & Flow (15 marks), Depth of Step Breakdown (10 marks), Real-world Application (10 marks)',
    allowedFormats: ['visual_concept', 'pdf', 'ppt', 'case_study'],
    submissionsCount: 2
  },
  {
    id: 'assess-2',
    title: 'Remedial Mini-Exam: Convolution & Pooling Calculations',
    subject: 'Visual AI & Deep Learning',
    description: 'Submit answers to the remedial examination questions covering receptive field growth, max pooling output dimensions, and padding types.',
    deadline: '2026-04-05',
    teacherId: 'user-teach-1',
    teacherName: 'Prof. Ananya Sharma',
    divisionTarget: 'Div A',
    maxMarks: 30,
    rubricCriteria: 'Mathematical Correctness (15 marks), Step-by-step reasoning (10 marks), Diagram illustration (5 marks)',
    allowedFormats: ['qa_exam', 'pdf', 'video'],
    submissionsCount: 1
  }
];

const DEFAULT_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-1',
    assessmentId: 'assess-1',
    assessmentTitle: 'Model 2 Visual Assessment: Architectural Diagram of Multi-Head Attention',
    studentId: 'user-student-1',
    studentName: 'Rohit Kulkarni',
    rollNo: 'CS-108',
    division: 'Div A',
    submittedAt: '2026-03-20 14:30',
    formatType: 'visual_concept',
    contentSummary: 'Attached generated visual model from Vedh Concept Visualizer displaying the Q-K-V scaled dot-product attention cycle and feed-forward projections.',
    attachedVisualConceptId: 'concept-1',
    evaluated: true,
    evaluationMethod: 'ai',
    score: 47,
    maxMarks: 50,
    grade: 'A+',
    teacherFeedback: 'Outstanding visual abstraction! The student accurately separated Q-K dot products from the final softmax scaling step. Interactive animation parameters are intuitive.',
    aiRubricBreakdown: [
      { criterion: 'Conceptual Accuracy', score: 14, max: 15, feedback: 'Strong mathematical fidelity to the Vaswani et al. architecture.' },
      { criterion: 'Visual Clarity & Flow', score: 15, max: 15, feedback: 'Clean linear progression with high readability and contrast.' },
      { criterion: 'Depth of Step Breakdown', score: 9, max: 10, feedback: 'Clear labels for each computational transformation node.' },
      { criterion: 'Real-world Application', score: 9, max: 10, feedback: 'Good context on why multi-head parallelizes better than RNNs.' }
    ],
    evaluatedAt: '2026-03-21 09:15'
  },
  {
    id: 'sub-2',
    assessmentId: 'assess-2',
    assessmentTitle: 'Remedial Mini-Exam: Convolution & Pooling Calculations',
    studentId: 'user-student-2',
    studentName: 'Neha Deshmukh',
    rollNo: 'CS-109',
    division: 'Div A',
    submittedAt: '2026-03-22 11:00',
    formatType: 'qa_exam',
    contentSummary: 'Complete step-by-step solutions for 2D convolution matrix output sizing: ((W - K + 2P)/S) + 1, followed by 2x2 max-pooling dimension reduction proofs.',
    fileAttachmentName: 'Neha_Remedial_Exam_Answers.pdf',
    evaluated: false,
    maxMarks: 30
  }
];

const DEFAULT_ATTENDANCE: DailyAttendanceRecord[] = [
  {
    id: 'att-1',
    studentId: 'user-student-1',
    studentName: 'Rohit Kulkarni',
    rollNo: 'CS-108',
    division: 'Div A',
    date: '2026-03-29',
    minutesSpent: 48,
    requiredMinutes: 30,
    status: 'Present',
    beaconDetected: true,
    beaconName: 'Vedh AI Lab Beacon [Room 302 - 5GHz]',
    onlineConnection: true,
    verifiedAt: '2026-03-29 16:45'
  },
  {
    id: 'att-2',
    studentId: 'user-student-2',
    studentName: 'Neha Deshmukh',
    rollNo: 'CS-109',
    division: 'Div A',
    date: '2026-03-29',
    minutesSpent: 35,
    requiredMinutes: 30,
    status: 'Present',
    beaconDetected: true,
    beaconName: 'Vedh AI Lab Beacon [Room 302 - 5GHz]',
    onlineConnection: true,
    verifiedAt: '2026-03-29 15:30'
  }
];

const DEFAULT_PROFILES: Record<string, StudentProfileDetails> = {
  'user-student-1': {
    studentId: 'user-student-1',
    studentName: 'Rohit Kulkarni',
    academicYear: '2025-2026',
    institutionName: 'Apex Institute of Technology & AI',
    classGroup: 'TY Computer Science & AI',
    division: 'Div A',
    rollNo: 'CS-108',
    mentorId: 'user-teach-1',
    mentorName: 'Prof. Ananya Sharma',
    documentName: 'Student_ID_Card_Verified.pdf'
  },
  'user-student-2': {
    studentId: 'user-student-2',
    studentName: 'Neha Deshmukh',
    academicYear: '2025-2026',
    institutionName: 'Apex Institute of Technology & AI',
    classGroup: 'TY Computer Science & AI',
    division: 'Div A',
    rollNo: 'CS-109',
    mentorId: 'user-teach-1',
    mentorName: 'Prof. Ananya Sharma',
    documentName: 'Neha_Bonafide_Certificate.pdf'
  }
};

const DEFAULT_PROFILE_REQUESTS: ProfileChangeRequest[] = [
  {
    id: 'req-1',
    studentId: 'user-student-1',
    studentName: 'Rohit Kulkarni',
    mentorId: 'user-teach-1',
    mentorName: 'Prof. Ananya Sharma',
    requestedAt: '2026-03-28 10:15',
    status: 'pending',
    proposedChanges: {
      classGroup: 'Final Year B.Tech Honors in Generative AI',
      academicYear: '2026-2027',
      division: 'Div A'
    },
    reason: 'Upgrading specialization to Honors in Generative AI track as approved by academic council.',
  }
];

const DEFAULT_MESSAGES: MentoringMessage[] = [
  {
    id: 'msg-1',
    studentId: 'user-student-1',
    studentName: 'Rohit Kulkarni',
    mentorId: 'user-teach-1',
    mentorName: 'Prof. Ananya Sharma',
    subject: 'Clarification on Backpropagation Gradient Vanishing',
    messageType: 'doubt',
    content: 'Dear Prof. Sharma, during the remedial video session on deep networks, I struggled to intuitively visualize why sigmoid saturation stops gradients from reaching the earliest layers. Could you advise the best visual diagram to study this?',
    sentAt: '2026-03-26 15:10',
    reply: 'Hello Rohit, excellent question. When sigmoid values exceed |x| > 3, the derivative approaches zero (< 0.05). Multiplying ten such decimals results in 10^-13, effectively freezing weight updates. I recommend using the Model 2 Visualizer with ReLU vs Sigmoid activation curves to see this live.',
    repliedAt: '2026-03-26 18:20',
    suggestedActionPlan: [
      'Load the activation curve preset in Model 2',
      'Compare gradient flow through 4 successive layers',
      'Discuss in Thursday remedial session'
    ]
  },
  {
    id: 'msg-2',
    studentId: 'user-student-1',
    studentName: 'Rohit Kulkarni',
    mentorId: 'user-teach-1',
    mentorName: 'Prof. Ananya Sharma',
    subject: 'Formal Request for Academic Internship Endorsement',
    messageType: 'formal_email',
    content: 'Respected Mentor, I am writing to convey that I have been shortlisted for an AI Research Internship at SmartGrid Labs. As per institutional guidelines, I kindly request your verification and sign-off on my student profile dossier.',
    sentAt: '2026-03-28 09:30',
  }
];

// Helpers for localStorage persistence
export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage write error', err);
  }
}

// State management facade
// Listeners for store changes (triggered on remote WebSocket mutation or local writes)
const storeChangeListeners = new Set<(entity: string) => void>();

export const storageService = {
  // Subscribers
  subscribe: (fn: (entity: string) => void) => {
    storeChangeListeners.add(fn);
    return () => { storeChangeListeners.delete(fn); };
  },
  notifyChange: (entity: string) => {
    storeChangeListeners.forEach((l) => l(entity));
  },

  // Apply complete cloud-authoritative state (e.g. on sync:init)
  applyRemoteState: (cloudState: CloudDbState) => {
    if (cloudState.materials) setStoredData(STORAGE_KEYS.MATERIALS, cloudState.materials);
    if (cloudState.concepts) setStoredData(STORAGE_KEYS.CONCEPTS, cloudState.concepts);
    if (cloudState.assessments) setStoredData(STORAGE_KEYS.ASSESSMENTS, cloudState.assessments);
    if (cloudState.submissions) setStoredData(STORAGE_KEYS.SUBMISSIONS, cloudState.submissions);
    if (cloudState.attendance) setStoredData(STORAGE_KEYS.ATTENDANCE, cloudState.attendance);
    if (cloudState.profiles) setStoredData(STORAGE_KEYS.PROFILES, cloudState.profiles);
    if (cloudState.profileRequests) setStoredData(STORAGE_KEYS.PROFILE_REQUESTS, cloudState.profileRequests);
    if (cloudState.mentorMessages) setStoredData(STORAGE_KEYS.MENTOR_MESSAGES, cloudState.mentorMessages);
    if (cloudState.institutions) setStoredData(STORAGE_KEYS.INSTITUTIONS, cloudState.institutions);
    if (cloudState.users) setStoredData(STORAGE_KEYS.USERS, cloudState.users);

    storeChangeListeners.forEach((l) => l('all'));
  },

  // Apply specific delta mutation from remote device
  applyRemoteMutation: (mutation: { entity: string; action: string; data: any }) => {
    const { entity, action, data } = mutation;
    if (!data) return;

    switch (entity) {
      case 'materials': {
        const current = storageService.getMaterials();
        if (action === 'create') {
          if (!current.some((m) => m.id === data.id)) {
            setStoredData(STORAGE_KEYS.MATERIALS, [data, ...current]);
          }
        }
        break;
      }
      case 'concepts': {
        const current = storageService.getConcepts();
        if (action === 'create') {
          if (!current.some((c) => c.id === data.id)) {
            setStoredData(STORAGE_KEYS.CONCEPTS, [data, ...current]);
          }
        }
        break;
      }
      case 'assessments': {
        const current = storageService.getAssessments();
        if (action === 'create') {
          if (!current.some((a) => a.id === data.id)) {
            setStoredData(STORAGE_KEYS.ASSESSMENTS, [data, ...current]);
          }
        }
        break;
      }
      case 'submissions': {
        const current = storageService.getSubmissions();
        if (action === 'create') {
          if (!current.some((s) => s.id === data.id)) {
            setStoredData(STORAGE_KEYS.SUBMISSIONS, [data, ...current]);
          }
        } else if (action === 'update' || action === 'evaluate') {
          setStoredData(
            STORAGE_KEYS.SUBMISSIONS,
            current.map((s) => (s.id === data.id ? { ...s, ...data } : s))
          );
        }
        break;
      }
      case 'attendance': {
        const current = storageService.getAttendance();
        const idx = current.findIndex((a) => a.id === data.id);
        if (idx >= 0) {
          current[idx] = { ...current[idx], ...data };
          setStoredData(STORAGE_KEYS.ATTENDANCE, [...current]);
        } else {
          setStoredData(STORAGE_KEYS.ATTENDANCE, [data, ...current]);
        }
        break;
      }
      case 'profiles': {
        const current = storageService.getProfiles();
        if (data.studentId) {
          current[data.studentId] = { ...(current[data.studentId] || {}), ...data };
          setStoredData(STORAGE_KEYS.PROFILES, { ...current });
        }
        break;
      }
      case 'profileRequests': {
        const current = storageService.getProfileRequests();
        if (action === 'create') {
          if (!current.some((r) => r.id === data.id)) {
            setStoredData(STORAGE_KEYS.PROFILE_REQUESTS, [data, ...current]);
          }
        } else if (action === 'update' || action === 'approve' || action === 'reject') {
          setStoredData(
            STORAGE_KEYS.PROFILE_REQUESTS,
            current.map((r) => (r.id === data.id ? { ...r, ...data } : r))
          );
          if (data.status === 'approved' && data.studentId && data.proposedChanges) {
            const profs = storageService.getProfiles();
            profs[data.studentId] = { ...(profs[data.studentId] || {}), ...data.proposedChanges };
            setStoredData(STORAGE_KEYS.PROFILES, { ...profs });
          }
        }
        break;
      }
      case 'mentorMessages': {
        const current = storageService.getMentorMessages();
        if (action === 'create') {
          if (!current.some((m) => m.id === data.id)) {
            setStoredData(STORAGE_KEYS.MENTOR_MESSAGES, [data, ...current]);
          }
        } else if (action === 'reply' || action === 'update') {
          setStoredData(
            STORAGE_KEYS.MENTOR_MESSAGES,
            current.map((m) => (m.id === data.id ? { ...m, ...data } : m))
          );
        }
        break;
      }
      case 'users': {
        const current = storageService.getUsers();
        if (action === 'create') {
          if (!current.some((u) => u.id === data.id)) {
            setStoredData(STORAGE_KEYS.USERS, [data, ...current]);
          }
        } else if (action === 'update') {
          setStoredData(
            STORAGE_KEYS.USERS,
            current.map((u) => (u.id === data.id ? { ...u, ...data } : u))
          );
        }
        break;
      }
      case 'institutions': {
        const current = storageService.getInstitutions();
        if (action === 'create') {
          if (!current.some((i) => i.id === data.id)) {
            setStoredData(STORAGE_KEYS.INSTITUTIONS, [data, ...current]);
          }
        }
        break;
      }
    }

    storeChangeListeners.forEach((l) => l(entity));
  },

  // Users
  getUsers: (): UserAccount[] => getStoredData(STORAGE_KEYS.USERS, DEFAULT_USERS),
  saveUsers: (users: UserAccount[], skipSync = false) => {
    setStoredData(STORAGE_KEYS.USERS, users);
    storeChangeListeners.forEach((l) => l('users'));
    if (!skipSync) {
      realtimeSync.sendMutation('users', 'update_all', users, 'Updated user directory');
    }
  },
  
  getCurrentUser: (): UserAccount | null => {
    const user = getStoredData<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (user) return user;
    return DEFAULT_USERS[3];
  },
  setCurrentUser: (user: UserAccount | null) => {
    setStoredData(STORAGE_KEYS.CURRENT_USER, user);
    realtimeSync.setUser(user);
    storeChangeListeners.forEach((l) => l('currentUser'));
  },

  // Institutions
  getInstitutions: (): Institution[] => getStoredData(STORAGE_KEYS.INSTITUTIONS, DEFAULT_INSTITUTIONS),
  saveInstitutions: (data: Institution[], skipSync = false) => {
    setStoredData(STORAGE_KEYS.INSTITUTIONS, data);
    storeChangeListeners.forEach((l) => l('institutions'));
    if (!skipSync && data.length > 0) {
      realtimeSync.sendMutation('institutions', 'create', data[0], `Provisioned ${data[0].name}`);
    }
  },

  // Study Materials (Model 1)
  getMaterials: (): StudyMaterial[] => getStoredData(STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS),
  saveMaterials: (data: StudyMaterial[], skipSync = false) => {
    setStoredData(STORAGE_KEYS.MATERIALS, data);
    storeChangeListeners.forEach((l) => l('materials'));
    if (!skipSync && data.length > 0) {
      realtimeSync.sendMutation('materials', 'create', data[0], `Posted: ${data[0].title}`);
    }
  },

  // Visual Concepts (Model 2)
  getConcepts: (): VisualConceptModel[] => getStoredData(STORAGE_KEYS.CONCEPTS, DEFAULT_CONCEPTS),
  saveConcepts: (data: VisualConceptModel[], skipSync = false) => {
    setStoredData(STORAGE_KEYS.CONCEPTS, data);
    storeChangeListeners.forEach((l) => l('concepts'));
    if (!skipSync && data.length > 0) {
      realtimeSync.sendMutation('concepts', 'create', data[0], `Generated Visual: ${data[0].conceptName}`);
    }
  },

  // Attendance (Model 3)
  getAttendance: (): DailyAttendanceRecord[] => getStoredData(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE),
  saveAttendance: (data: DailyAttendanceRecord[], skipSync = false) => {
    setStoredData(STORAGE_KEYS.ATTENDANCE, data);
    storeChangeListeners.forEach((l) => l('attendance'));
    if (!skipSync && data.length > 0) {
      realtimeSync.sendMutation('attendance', 'update', data[0], `Attendance logged: ${data[0].studentName} (${data[0].status})`);
    }
  },

  // Assessments (Model 3)
  getAssessments: (): AssessmentItem[] => getStoredData(STORAGE_KEYS.ASSESSMENTS, DEFAULT_ASSESSMENTS),
  saveAssessments: (data: AssessmentItem[], skipSync = false) => {
    setStoredData(STORAGE_KEYS.ASSESSMENTS, data);
    storeChangeListeners.forEach((l) => l('assessments'));
    if (!skipSync && data.length > 0) {
      realtimeSync.sendMutation('assessments', 'create', data[0], `New assessment: ${data[0].title}`);
    }
  },

  // Submissions (Model 3)
  getSubmissions: (): StudentSubmission[] => getStoredData(STORAGE_KEYS.SUBMISSIONS, DEFAULT_SUBMISSIONS),
  saveSubmissions: (data: StudentSubmission[], skipSync = false) => {
    setStoredData(STORAGE_KEYS.SUBMISSIONS, data);
    storeChangeListeners.forEach((l) => l('submissions'));
    if (!skipSync && data.length > 0) {
      const top = data[0];
      const action = top.evaluated ? 'evaluate' : 'create';
      const summary = top.evaluated
        ? `Evaluated ${top.studentName}'s assessment (${top.grade})`
        : `Submitted coursework for "${top.assessmentTitle}" by ${top.studentName}`;
      realtimeSync.sendMutation('submissions', action, top, summary);
    }
  },

  // Profiles (Model 4)
  getProfiles: (): Record<string, StudentProfileDetails> => getStoredData(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES),
  saveProfiles: (data: Record<string, StudentProfileDetails>, skipSync = false) => {
    setStoredData(STORAGE_KEYS.PROFILES, data);
    storeChangeListeners.forEach((l) => l('profiles'));
  },

  getProfileRequests: (): ProfileChangeRequest[] => getStoredData(STORAGE_KEYS.PROFILE_REQUESTS, DEFAULT_PROFILE_REQUESTS),
  saveProfileRequests: (data: ProfileChangeRequest[], skipSync = false) => {
    setStoredData(STORAGE_KEYS.PROFILE_REQUESTS, data);
    storeChangeListeners.forEach((l) => l('profileRequests'));
    if (!skipSync && data.length > 0) {
      const top = data[0];
      const summary = `Profile modification request ${top.status} for ${top.studentName}`;
      realtimeSync.sendMutation('profileRequests', top.status === 'pending' ? 'create' : 'update', top, summary);
    }
  },

  // Mentoring Messages (Model 4)
  getMentorMessages: (): MentoringMessage[] => getStoredData(STORAGE_KEYS.MENTOR_MESSAGES, DEFAULT_MESSAGES),
  saveMentorMessages: (data: MentoringMessage[], skipSync = false) => {
    setStoredData(STORAGE_KEYS.MENTOR_MESSAGES, data);
    storeChangeListeners.forEach((l) => l('mentorMessages'));
    if (!skipSync && data.length > 0) {
      const top = data[0];
      const action = top.reply ? 'reply' : 'create';
      const summary = top.reply
        ? `Mentor replied to: ${top.subject}`
        : `New student doubt: ${top.subject}`;
      realtimeSync.sendMutation('mentorMessages', action, top, summary);
    }
  },

  // Session Time
  getSessionSeconds: (userId: string, date: string): number => {
    const key = `${STORAGE_KEYS.ACTIVE_TIME}_${userId}_${date}`;
    return getStoredData<number>(key, 1850);
  },
  setSessionSeconds: (userId: string, date: string, seconds: number): void => {
    const key = `${STORAGE_KEYS.ACTIVE_TIME}_${userId}_${date}`;
    setStoredData(key, seconds);
  },

  // Reset to demo defaults across all devices
  resetAll: async () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    await realtimeSync.resetCloudDatabase();
    window.location.reload();
  }
};
