import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TeacherProfile,
  TurmaClass,
  AttendanceSession,
  ClassGradeBook,
  ClassEvaluation,
  NotificationItem,
  TeacherAvailabilitySubmission,
  ClassMaterial,
  TimetableSlot,
  AcademicCalendarEvent,
  GeminiSessionTracker,
  GeminiUsageMetadata,
  PresenceStatus,
  GradeItem,
} from '../types';
import {
  INITIAL_TEACHER_PROFILE,
  INITIAL_CLASSES,
  INITIAL_ATTENDANCE,
  INITIAL_GRADEBOOKS,
  INITIAL_EVALUATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AVAILABILITY_SUBMISSION,
  INITIAL_MATERIALS,
  INITIAL_TIMETABLE,
  INITIAL_CALENDAR_EVENTS,
} from '../mockData';

interface AcademicContextType {
  // Teacher
  teacher: TeacherProfile;
  updateTeacher: (updated: Partial<TeacherProfile>) => void;

  // Classes
  classes: TurmaClass[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  activeClass: TurmaClass;

  // Attendance (Chamada)
  attendanceSessions: AttendanceSession[];
  saveAttendanceSession: (session: AttendanceSession) => void;
  getAttendanceForClass: (classId: string) => AttendanceSession[];
  getStudentAttendanceRate: (classId: string, studentId: string) => number;

  // Grades (Notas)
  gradebooks: Record<string, ClassGradeBook>;
  updateStudentGrade: (classId: string, studentId: string, field: keyof GradeItem, value: number | string | undefined) => void;
  updateGradeWeights: (classId: string, weights: ClassGradeBook['weights']) => void;
  getStudentAverage: (gradeItem?: GradeItem, weights?: ClassGradeBook['weights']) => number | null;
  getStudentSituation: (avg: number | null, passingGrade?: number, recoveryGrade?: number) => { label: string; color: string };

  // Evaluations (Avaliação da Turma)
  evaluations: ClassEvaluation[];
  saveClassEvaluation: (evalData: ClassEvaluation) => void;
  getEvaluationForClass: (classId: string) => ClassEvaluation | undefined;

  // Notifications (Notificações)
  notifications: NotificationItem[];
  sendNotification: (notif: Omit<NotificationItem, 'id' | 'date' | 'isRead' | 'type'>) => void;
  markNotificationAsRead: (id: string) => void;
  unreadCount: number;

  // Availability Form (Disponibilidade para Horário)
  availabilitySubmission: TeacherAvailabilitySubmission;
  updateAvailabilitySubmission: (sub: Partial<TeacherAvailabilitySubmission>) => void;
  submitAvailability: () => void;

  // Materials (Materiais da Aula)
  materials: ClassMaterial[];
  addMaterial: (material: Omit<ClassMaterial, 'id' | 'uploadDate' | 'downloadsCount'>) => void;
  deleteMaterial: (id: string) => void;
  toggleMaterialPublish: (id: string) => void;

  // Timetable (Horário de Aula)
  timetable: TimetableSlot[];

  // Calendar (Calendário Acadêmico)
  calendarEvents: AcademicCalendarEvent[];

  // Gemini Metrics Tracker
  geminiMetrics: GeminiSessionTracker;
  recordGeminiUsage: (usage: GeminiUsageMetadata) => void;
  resetGeminiSession: () => void;
  setUsdToBrlRate: (rate: number) => void;
  isCostModalOpen: boolean;
  setIsCostModalOpen: (open: boolean) => void;

  // Active View Tab
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage if available
  const [teacher, setTeacher] = useState<TeacherProfile>(() => {
    const saved = localStorage.getItem('portal_teacher');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_PROFILE;
  });

  const [classes] = useState<TurmaClass[]>(INITIAL_CLASSES);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'turma-eng301');

  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    const saved = localStorage.getItem('portal_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [gradebooks, setGradebooks] = useState<Record<string, ClassGradeBook>>(() => {
    const saved = localStorage.getItem('portal_gradebooks');
    return saved ? JSON.parse(saved) : INITIAL_GRADEBOOKS;
  });

  const [evaluations, setEvaluations] = useState<ClassEvaluation[]>(() => {
    const saved = localStorage.getItem('portal_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('portal_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [availabilitySubmission, setAvailabilitySubmission] = useState<TeacherAvailabilitySubmission>(() => {
    const saved = localStorage.getItem('portal_availability');
    return saved ? JSON.parse(saved) : INITIAL_AVAILABILITY_SUBMISSION;
  });

  const [materials, setMaterials] = useState<ClassMaterial[]>(() => {
    const saved = localStorage.getItem('portal_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [timetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [calendarEvents] = useState<AcademicCalendarEvent[]>(INITIAL_CALENDAR_EVENTS);

  // Gemini Metrics State
  const [geminiMetrics, setGeminiMetrics] = useState<GeminiSessionTracker>(() => {
    const saved = localStorage.getItem('portal_gemini_metrics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      totalCalls: 0,
      totalPromptTokens: 0,
      totalCandidatesTokens: 0,
      totalTokens: 0,
      totalCostUSD: 0,
      totalCostBRL: 0,
      usdToBrlRate: 5.80,
      history: [],
    };
  });

  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('turmas'); // default view

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('portal_teacher', JSON.stringify(teacher));
  }, [teacher]);

  useEffect(() => {
    localStorage.setItem('portal_attendance', JSON.stringify(attendanceSessions));
  }, [attendanceSessions]);

  useEffect(() => {
    localStorage.setItem('portal_gradebooks', JSON.stringify(gradebooks));
  }, [gradebooks]);

  useEffect(() => {
    localStorage.setItem('portal_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('portal_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('portal_availability', JSON.stringify(availabilitySubmission));
  }, [availabilitySubmission]);

  useEffect(() => {
    localStorage.setItem('portal_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('portal_gemini_metrics', JSON.stringify(geminiMetrics));
  }, [geminiMetrics]);

  // Active class lookup
  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const updateTeacher = (updated: Partial<TeacherProfile>) => {
    setTeacher((prev) => ({ ...prev, ...updated }));
  };

  // Attendance
  const saveAttendanceSession = (session: AttendanceSession) => {
    setAttendanceSessions((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === session.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = session;
        return copy;
      }
      return [session, ...prev];
    });
  };

  const getAttendanceForClass = (classId: string) => {
    return attendanceSessions.filter((s) => s.classId === classId);
  };

  const getStudentAttendanceRate = (classId: string, studentId: string): number => {
    const classSessions = attendanceSessions.filter((s) => s.classId === classId);
    if (classSessions.length === 0) return 100;

    let presentCount = 0;
    classSessions.forEach((session) => {
      const rec = session.records.find((r) => r.studentId === studentId);
      if (rec && (rec.status === 'presente' || rec.status === 'justificada')) {
        presentCount++;
      }
    });

    return Math.round((presentCount / classSessions.length) * 100);
  };

  // Grades
  const updateStudentGrade = (classId: string, studentId: string, field: keyof GradeItem, value: number | string | undefined) => {
    setGradebooks((prev) => {
      const book = prev[classId] || {
        classId,
        weights: { p1: 0.35, p2: 0.35, trabalho: 0.20, atividades: 0.10 },
        passingGrade: 7.0,
        recoveryGrade: 5.0,
        grades: [],
      };

      const grades = [...book.grades];
      const sIdx = grades.findIndex((g) => g.studentId === studentId);

      if (sIdx >= 0) {
        grades[sIdx] = { ...grades[sIdx], [field]: value };
      } else {
        grades.push({ studentId, [field]: value });
      }

      return {
        ...prev,
        [classId]: {
          ...book,
          grades,
        },
      };
    });
  };

  const updateGradeWeights = (classId: string, weights: ClassGradeBook['weights']) => {
    setGradebooks((prev) => {
      const book = prev[classId];
      if (!book) return prev;
      return {
        ...prev,
        [classId]: { ...book, weights },
      };
    });
  };

  const getStudentAverage = (gradeItem?: GradeItem, weights?: ClassGradeBook['weights']): number | null => {
    if (!gradeItem) return null;
    const w = weights || { p1: 0.35, p2: 0.35, trabalho: 0.20, atividades: 0.10 };

    let totalWeight = 0;
    let sum = 0;

    if (gradeItem.p1 !== undefined && !isNaN(gradeItem.p1)) {
      sum += gradeItem.p1 * w.p1;
      totalWeight += w.p1;
    }
    if (gradeItem.p2 !== undefined && !isNaN(gradeItem.p2)) {
      sum += gradeItem.p2 * w.p2;
      totalWeight += w.p2;
    }
    if (gradeItem.trabalho !== undefined && !isNaN(gradeItem.trabalho)) {
      sum += gradeItem.trabalho * w.trabalho;
      totalWeight += w.trabalho;
    }
    if (gradeItem.atividades !== undefined && !isNaN(gradeItem.atividades)) {
      sum += gradeItem.atividades * w.atividades;
      totalWeight += w.atividades;
    }

    if (totalWeight === 0) return null;
    const regularAvg = sum / totalWeight;

    if (gradeItem.exameFinal !== undefined && !isNaN(gradeItem.exameFinal)) {
      // Exame formula: (Media + Exame) / 2
      return Number(((regularAvg + gradeItem.exameFinal) / 2).toFixed(1));
    }

    return Number(regularAvg.toFixed(1));
  };

  const getStudentSituation = (avg: number | null, passingGrade: number = 7.0, recoveryGrade: number = 5.0) => {
    if (avg === null) return { label: 'Cursando', color: 'text-slate-600 bg-slate-100' };
    if (avg >= passingGrade) return { label: 'Aprovado', color: 'text-emerald-700 bg-emerald-100 border border-emerald-300' };
    if (avg >= recoveryGrade) return { label: 'Em Recuperação', color: 'text-amber-700 bg-amber-100 border border-amber-300' };
    return { label: 'Reprovado', color: 'text-rose-700 bg-rose-100 border border-rose-300' };
  };

  // Evaluations
  const saveClassEvaluation = (evalData: ClassEvaluation) => {
    setEvaluations((prev) => {
      const idx = prev.findIndex((e) => e.id === evalData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = evalData;
        return copy;
      }
      return [evalData, ...prev];
    });
  };

  const getEvaluationForClass = (classId: string) => {
    return evaluations.find((e) => e.classId === classId);
  };

  // Notifications
  const sendNotification = (notif: Omit<NotificationItem, 'id' | 'date' | 'isRead' | 'type'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-sent-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      isRead: true,
      type: 'sent',
      readByCount: 0,
      totalTargetCount: notif.targetClassId && notif.targetClassId !== 'all' 
        ? (classes.find(c => c.id === notif.targetClassId)?.studentsCount || 20)
        : classes.reduce((acc, c) => acc + c.studentsCount, 0),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => n.type === 'received' && !n.isRead).length;

  // Availability Form
  const updateAvailabilitySubmission = (sub: Partial<TeacherAvailabilitySubmission>) => {
    setAvailabilitySubmission((prev) => ({ ...prev, ...sub }));
  };

  const submitAvailability = () => {
    setAvailabilitySubmission((prev) => ({
      ...prev,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Pendente',
    }));
  };

  // Materials
  const addMaterial = (mat: Omit<ClassMaterial, 'id' | 'uploadDate' | 'downloadsCount'>) => {
    const newMat: ClassMaterial = {
      ...mat,
      id: `mat-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      downloadsCount: 0,
    };
    setMaterials((prev) => [newMat, ...prev]);
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleMaterialPublish = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPublished: !m.isPublished } : m))
    );
  };

  // Gemini Metrics
  const recordGeminiUsage = (usage: GeminiUsageMetadata) => {
    setGeminiMetrics((prev) => {
      const newCalls = prev.totalCalls + 1;
      const newPromptTokens = prev.totalPromptTokens + usage.promptTokenCount;
      const newCandidatesTokens = prev.totalCandidatesTokens + usage.candidatesTokenCount;
      const newTotalTokens = prev.totalTokens + usage.totalTokenCount;
      const newCostUSD = prev.totalCostUSD + usage.costUSD;
      const newCostBRL = newCostUSD * prev.usdToBrlRate;

      return {
        ...prev,
        totalCalls: newCalls,
        totalPromptTokens: newPromptTokens,
        totalCandidatesTokens: newCandidatesTokens,
        totalTokens: newTotalTokens,
        totalCostUSD: newCostUSD,
        totalCostBRL: newCostBRL,
        history: [usage, ...prev.history],
      };
    });
  };

  const resetGeminiSession = () => {
    setGeminiMetrics({
      totalCalls: 0,
      totalPromptTokens: 0,
      totalCandidatesTokens: 0,
      totalTokens: 0,
      totalCostUSD: 0,
      totalCostBRL: 0,
      usdToBrlRate: 5.80,
      history: [],
    });
  };

  const setUsdToBrlRate = (rate: number) => {
    setGeminiMetrics((prev) => ({
      ...prev,
      usdToBrlRate: rate,
      totalCostBRL: prev.totalCostUSD * rate,
    }));
  };

  return (
    <AcademicContext.Provider
      value={{
        teacher,
        updateTeacher,
        classes,
        selectedClassId,
        setSelectedClassId,
        activeClass,
        attendanceSessions,
        saveAttendanceSession,
        getAttendanceForClass,
        getStudentAttendanceRate,
        gradebooks,
        updateStudentGrade,
        updateGradeWeights,
        getStudentAverage,
        getStudentSituation,
        evaluations,
        saveClassEvaluation,
        getEvaluationForClass,
        notifications,
        sendNotification,
        markNotificationAsRead,
        unreadCount,
        availabilitySubmission,
        updateAvailabilitySubmission,
        submitAvailability,
        materials,
        addMaterial,
        deleteMaterial,
        toggleMaterialPublish,
        timetable,
        calendarEvents,
        geminiMetrics,
        recordGeminiUsage,
        resetGeminiSession,
        setUsdToBrlRate,
        isCostModalOpen,
        setIsCostModalOpen,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
