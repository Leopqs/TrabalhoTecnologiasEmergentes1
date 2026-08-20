export type PresenceStatus = 'presente' | 'ausente' | 'justificada';

export interface Student {
  id: string;
  name: string;
  matricula: string;
  email: string;
  avatarUrl?: string;
  currentAttendancePercent: number;
}

export interface AttendanceItem {
  studentId: string;
  status: PresenceStatus;
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  lessonNumber: number; // e.g. 1 (Aula 1 & 2)
  subjectTopic: string;
  records: AttendanceItem[];
  createdAt: string;
}

export interface GradeItem {
  studentId: string;
  p1?: number;
  p2?: number;
  trabalho?: number;
  atividades?: number;
  exameFinal?: number;
  notes?: string;
}

export interface ClassGradeBook {
  classId: string;
  weights: {
    p1: number; // e.g. 0.3
    p2: number; // e.g. 0.4
    trabalho: number; // e.g. 0.2
    atividades: number; // e.g. 0.1
  };
  passingGrade: number; // usually 7.0
  recoveryGrade: number; // usually 5.0
  grades: GradeItem[];
}

export interface TurmaClass {
  id: string;
  code: string; // e.g. "ENG-301"
  name: string; // e.g. "Engenharia de Software"
  course: string; // e.g. "Ciência da Computação"
  semester: string; // e.g. "2026/1 - 5º Semestre"
  period: 'Matutino' | 'Vespertino' | 'Noturno';
  room: string; // e.g. "Lab 402 - Bloco B"
  workloadHours: number; // e.g. 80h
  studentsCount: number;
  scheduleDescription: string; // e.g. "Terça e Quinta, 19:00 - 20:40"
  color: string;
  syllabus: string;
  students: Student[];
}

export interface QualitativeMetric {
  id: string;
  title: string;
  description: string;
  rating: number; // 1 to 5
}

export interface ClassEvaluation {
  id: string;
  classId: string;
  date: string;
  academicPeriod: string;
  engagementRating: number;
  disciplineRating: number;
  homeworkDeliveryRating: number;
  criticalThinkingRating: number;
  qualitativeSummary: string;
  pedagogicalActionPlan?: string;
  strengths: string[];
  attentionPoints: string[];
  aiGenerated?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  sender: string;
  targetClassId?: string; // 'all' or class ID
  category: 'aviso' | 'urgente' | 'prova' | 'material' | 'institucional';
  date: string;
  isRead: boolean;
  type: 'received' | 'sent';
  readByCount?: number;
  totalTargetCount?: number;
}

export interface TeacherProfile {
  id: string;
  name: string;
  titulacao: string; // e.g. "Dr. em Ciência da Computação"
  matricula: string;
  email: string;
  phone: string;
  department: string;
  officeRoom: string;
  officeHours: string;
  bio: string;
  avatarUrl: string;
  weeklyWorkloadHours: number;
  admissionYear: number;
  lattesUrl?: string;
}

export type AvailabilitySlotStatus = 'disponivel' | 'preferencial' | 'indisponivel';

export interface WeeklyAvailabilityGrid {
  [daySlotKey: string]: AvailabilitySlotStatus; // e.g. "seg-m1": "disponivel"
}

export interface TeacherAvailabilitySubmission {
  id: string;
  submissionDate: string;
  semester: string;
  grid: WeeklyAvailabilityGrid;
  maxClassesPerDay: number;
  preferredDaysOff: string[];
  allowConsecutiveClasses: boolean;
  preferredModality: 'Presencial' | 'Híbrido' | 'Indiferente';
  healthOrTravelRestrictions: string;
  justifications: string;
  status: 'Pendente' | 'Aprovado' | 'Em Análise';
}

export interface ClassMaterial {
  id: string;
  classId: string;
  title: string;
  description: string;
  type: 'pdf' | 'slide' | 'link' | 'video' | 'exercicio' | 'codigo';
  category: string; // e.g. "Unidade 1 - Fundamentos"
  fileUrl?: string;
  fileSize?: string;
  externalLink?: string;
  uploadDate: string;
  isPublished: boolean;
  downloadsCount: number;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6; // 1 = Seg, 2 = Ter, ..., 6 = Sab
  dayName: string;
  startTime: string; // "07:30"
  endTime: string; // "09:10"
  periodName: 'Matutino' | 'Vespertino' | 'Noturno';
  slotIndex: number; // 1, 2, 3
  classId?: string;
  className?: string;
  classCode?: string;
  room?: string;
  color?: string;
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  category: 'feriado' | 'provas' | 'notas' | 'reuniao' | 'recesso' | 'academico';
  isImportant: boolean;
}

export interface GeminiUsageMetadata {
  model: string;
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  costUSD: number;
  costBRL: number;
  timestamp: string;
  operationType: string;
  summaryTitle: string;
}

export interface GeminiSessionTracker {
  totalCalls: number;
  totalPromptTokens: number;
  totalCandidatesTokens: number;
  totalTokens: number;
  totalCostUSD: number;
  totalCostBRL: number;
  usdToBrlRate: number;
  history: GeminiUsageMetadata[];
}
