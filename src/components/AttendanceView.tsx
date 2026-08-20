import React, { useState, useEffect } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { AttendanceItem, AttendanceSession, PresenceStatus } from '../types';
import {
  CheckSquare,
  UserCheck,
  UserX,
  AlertTriangle,
  Save,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  History,
  CheckCircle2,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    activeClass,
    saveAttendanceSession,
    getAttendanceForClass,
  } = useAcademic();

  const [date, setDate] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  });
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [subjectTopic, setSubjectTopic] = useState<string>(
    'Padrões de Projeto GoF - Implementação Prática e Análise de Complexidade'
  );
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceItem>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize records when activeClass changes or component mounts
  useEffect(() => {
    if (!activeClass) return;
    const initialMap: Record<string, AttendanceItem> = {};
    activeClass.students.forEach((student) => {
      // Default to 'presente'
      initialMap[student.id] = {
        studentId: student.id,
        status: 'presente',
        notes: '',
      };
    });
    setAttendanceRecords(initialMap);
  }, [activeClass]);

  const updateStudentStatus = (studentId: string, status: PresenceStatus) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status,
      },
    }));
  };

  const updateStudentNotes = (studentId: string, notes: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        notes,
      },
    }));
  };

  const markAll = (status: PresenceStatus) => {
    setAttendanceRecords((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((id) => {
        copy[id] = { ...copy[id], status };
      });
      return copy;
    });
  };

  const invertAttendance = () => {
    setAttendanceRecords((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((id) => {
        const current = copy[id].status;
        copy[id] = {
          ...copy[id],
          status: current === 'presente' ? 'ausente' : 'presente',
        };
      });
      return copy;
    });
  };

  // Metrics
  const recordsList: AttendanceItem[] = Object.values(attendanceRecords);
  const totalStudents = activeClass ? activeClass.students.length : 0;
  const presentCount = recordsList.filter((r) => r.status === 'presente').length;
  const absentCount = recordsList.filter((r) => r.status === 'ausente').length;
  const justifiedCount = recordsList.filter((r) => r.status === 'justificada').length;
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + justifiedCount) / totalStudents) * 100) : 0;

  const handleSave = () => {
    const session: AttendanceSession = {
      id: `att-${activeClass.id}-${date}-l${lessonNumber}`,
      classId: activeClass.id,
      date,
      lessonNumber,
      subjectTopic,
      records: recordsList,
      createdAt: new Date().toISOString(),
    };
    saveAttendanceSession(session);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const pastSessions = getAttendanceForClass(activeClass.id);

  const loadPastSession = (session: AttendanceSession) => {
    setDate(session.date);
    setLessonNumber(session.lessonNumber);
    setSubjectTopic(session.subjectTopic);
    const map: Record<string, AttendanceItem> = {};
    session.records.forEach((r) => {
      map[r.studentId] = r;
    });
    setAttendanceRecords(map);
    setShowHistory(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <CheckSquare className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Chamada e Diário de Presença
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Registre a frequência dos estudantes e anote o conteúdo programático ministrado na aula.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
            >
              <History className="w-4 h-4 text-slate-500" />
              Histórico ({pastSessions.length} aulas)
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              id="btn-save-attendance"
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200 cursor-pointer flex items-center gap-2"
            >
              {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              {savedSuccess ? 'Chamada Salva com Sucesso!' : 'Salvar Chamada'}
            </button>
          </div>
        </div>

        {/* Filters & Lesson Details Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Turma Selecionada:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.code} - {cls.name} ({cls.period})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Data da Aula:</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Bloco de Aulas:</label>
            <select
              value={lessonNumber}
              onChange={(e) => setLessonNumber(Number(e.target.value))}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value={1}>Aula 1 & 2 (1º Bloco - 2 horas/aula)</option>
              <option value={2}>Aula 3 & 4 (2º Bloco - 2 horas/aula)</option>
              <option value={3}>Aula Prática / Laboratório</option>
              <option value={4}>Aula de Reposição / Plantão</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Local e Horário:</label>
            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 truncate font-medium">
              {activeClass.room} • {activeClass.period}
            </div>
          </div>
        </div>

        {/* Lesson Topic */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Conteúdo Programático / Assunto Ministrado:
          </label>
          <input
            type="text"
            value={subjectTopic}
            onChange={(e) => setSubjectTopic(e.target.value)}
            placeholder="Ex: Introdução aos microsserviços e mensageria com RabbitMQ..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* History Drawer if open */}
      {showHistory && (
        <div className="bg-indigo-50/70 p-6 rounded-2xl border border-indigo-200 animate-in fade-in space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Diários de Frequência Anteriores ({activeClass.name})
            </h3>
            <span className="text-xs text-indigo-700">Clique em qualquer registro para carregar</span>
          </div>

          {pastSessions.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">Nenhuma chamada registrada anteriormente nesta turma.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pastSessions.map((s) => {
                const p = s.records.filter((r) => r.status === 'presente').length;
                const percent = Math.round((p / s.records.length) * 100);
                return (
                  <button
                    key={s.id}
                    onClick={() => loadPastSession(s)}
                    className="p-3 bg-white hover:bg-indigo-50/50 rounded-xl border border-indigo-100 text-left transition-all hover:border-indigo-300 shadow-2xs cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Data: {s.date}</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                        {percent}% presença
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-1">{s.subjectTopic}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Aula Bloco #{s.lessonNumber}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Metrics Bar & Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
            {totalStudents}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total de Alunos</div>
            <div className="text-sm font-extrabold text-slate-800">Matriculados</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
            {presentCount}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Presentes Hoje</div>
            <div className="text-sm font-extrabold text-emerald-700">
              {attendanceRate}% da turma
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
            {absentCount}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Ausentes</div>
            <div className="text-sm font-extrabold text-rose-700">
              {totalStudents > 0 ? Math.round((absentCount / totalStudents) * 100) : 0}% faltas
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
            {justifiedCount}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Faltas Justificadas</div>
            <div className="text-sm font-extrabold text-amber-700">Atestados/Ofício</div>
          </div>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Ações Rápidas em Massa:</span>
            <button
              onClick={() => markAll('presente')}
              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Todos Presentes
            </button>
            <button
              onClick={() => markAll('ausente')}
              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Todos Ausentes
            </button>
            <button
              onClick={invertAttendance}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Inverter
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Clique no status de cada estudante para alternar: <strong className="text-emerald-700">P</strong> (Presente), <strong className="text-rose-700">F</strong> (Falta), <strong className="text-amber-700">FJ</strong> (Justificada).
          </div>
        </div>

        {/* Student Rows */}
        <div className="divide-y divide-slate-100">
          {activeClass.students.map((student, idx) => {
            const record = attendanceRecords[student.id] || { studentId: student.id, status: 'presente', notes: '' };
            const isCriticalAttendance = student.currentAttendancePercent < 75;

            return (
              <div
                key={student.id}
                id={`attendance-row-${student.id}`}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  record.status === 'ausente'
                    ? 'bg-rose-50/40'
                    : record.status === 'justificada'
                    ? 'bg-amber-50/40'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-6 text-center text-xs font-bold text-slate-400 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs ring-1 ring-slate-200 shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{student.name}</h4>
                      {isCriticalAttendance && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700" title="Abaixo de 75% de presença">
                          <AlertTriangle className="w-3 h-3" /> Frequência Crítica
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      Matrícula: <span className="font-mono">{student.matricula}</span> • Frequência Global: <span className="font-bold text-slate-700">{student.currentAttendancePercent}%</span>
                    </p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateStudentStatus(student.id, 'presente')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      record.status === 'presente'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Presente
                  </button>

                  <button
                    onClick={() => updateStudentStatus(student.id, 'ausente')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      record.status === 'ausente'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Falta
                  </button>

                  <button
                    onClick={() => updateStudentStatus(student.id, 'justificada')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      record.status === 'justificada'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Justificada
                  </button>
                </div>

                {/* Notes Input */}
                <div className="sm:w-64 shrink-0">
                  <input
                    type="text"
                    value={record.notes || ''}
                    onChange={(e) => updateStudentNotes(student.id, e.target.value)}
                    placeholder="Observação (atraso, justificativa)..."
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer save */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {presentCount} presentes, {absentCount} faltas e {justifiedCount} justificadas nesta sessão.
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200 cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar e Concluir Chamada
          </button>
        </div>
      </div>
    </div>
  );
};
