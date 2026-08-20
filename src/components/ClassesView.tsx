import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { TurmaClass, Student } from '../types';
import {
  Users,
  Clock,
  MapPin,
  BookOpen,
  CheckSquare,
  FileSpreadsheet,
  Target,
  FolderOpen,
  X,
  Search,
  Award,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export const ClassesView: React.FC = () => {
  const { classes, setSelectedClassId, setActiveTab, gradebooks, getStudentAverage, getStudentSituation } = useAcademic();
  const [inspectClass, setInspectClass] = useState<TurmaClass | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  const handleAction = (classId: string, targetTab: string) => {
    setSelectedClassId(classId);
    setActiveTab(targetTab);
  };

  const filteredStudents = inspectClass
    ? inspectClass.students.filter(
        (s) =>
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.matricula.includes(studentSearch)
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Minhas Turmas Ativas
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Você está lecionando em <strong className="text-slate-700">{classes.length} disciplinas</strong> neste semestre letivo (2026/1).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('disponibilidade')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            Minha Disponibilidade Semanal
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls) => {
          const book = gradebooks[cls.id];
          const classAvg = book && book.grades.length > 0
            ? (
                book.grades.reduce((sum, g) => sum + (getStudentAverage(g, book.weights) || 0), 0) /
                book.grades.length
              ).toFixed(1)
            : '8.1';

          return (
            <div
              key={cls.id}
              id={`class-card-${cls.id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Header colored banner */}
              <div className="p-6 border-b border-slate-100 relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wider text-white uppercase shadow-xs"
                        style={{ backgroundColor: cls.color }}
                      >
                        {cls.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">
                        {cls.period}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {cls.course} • {cls.semester}
                    </p>
                  </div>
                </div>

                {/* Quick Info badges */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{cls.studentsCount}</span> alunos
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{cls.workloadHours}h</span> aula
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      Média: <span className="font-bold text-slate-800">{classAvg}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body: Room & Schedule & Syllabus Preview */}
              <div className="p-6 space-y-3 bg-slate-50/50 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700">{cls.room}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700">{cls.scheduleDescription}</span>
                </div>
                <div className="text-xs text-slate-500 line-clamp-2 bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <strong className="text-slate-700">Ementa:</strong> {cls.syllabus}
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAction(cls.id, 'chamada')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Fazer chamada para esta turma"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Chamada
                  </button>
                  <button
                    onClick={() => handleAction(cls.id, 'notas')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Lançar notas da turma"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Notas
                  </button>
                  <button
                    onClick={() => handleAction(cls.id, 'avaliar-turma')}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Avaliar turma e gerar diagnóstico com IA"
                  >
                    <Target className="w-3.5 h-3.5" />
                    Avaliação IA
                  </button>
                  <button
                    onClick={() => handleAction(cls.id, 'materiais')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Gerenciar materiais da aula"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Materiais
                  </button>
                </div>

                <button
                  onClick={() => setInspectClass(cls)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                >
                  Lista de Alunos
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Full Student Roster */}
      {inspectClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold text-white uppercase"
                    style={{ backgroundColor: inspectClass.color }}
                  >
                    {inspectClass.code}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {inspectClass.name} - Lista de Alunos ({inspectClass.students.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {inspectClass.course} • {inspectClass.period} • Sala: {inspectClass.room}
                </p>
              </div>
              <button
                onClick={() => setInspectClass(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Buscar aluno por nome ou matrícula..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {filteredStudents.length} de {inspectClass.students.length} estudantes
              </span>
            </div>

            {/* Modal Student List */}
            <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const book = gradebooks[inspectClass.id];
                const gradeItem = book?.grades.find((g) => g.studentId === student.id);
                const avg = getStudentAverage(gradeItem, book?.weights);
                const situation = getStudentSituation(avg, book?.passingGrade, book?.recoveryGrade);

                return (
                  <div
                    key={student.id}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-slate-400">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs ring-1 ring-slate-200">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{student.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          Matrícula: <span className="font-mono">{student.matricula}</span> • {student.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      {/* Attendance */}
                      <div>
                        <div className="text-xs font-bold text-slate-700">
                          {student.currentAttendancePercent}%
                        </div>
                        <div className="text-[10px] text-slate-400">Presença</div>
                      </div>

                      {/* Average */}
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {avg !== null ? avg.toFixed(1) : '-'}
                        </div>
                        <div className="text-[10px] text-slate-400">Média</div>
                      </div>

                      {/* Situation Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${situation.color}`}>
                        {situation.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setInspectClass(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
