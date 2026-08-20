import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CheckSquare,
  Printer,
  Sparkles,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const TimetableScheduleView: React.FC = () => {
  const { teacher, classes, setSelectedClassId, setActiveTab } = useAcademic();
  const [selectedShift, setSelectedShift] = useState<'all' | 'matutino' | 'vespertino' | 'noturno'>('all');

  const days = [
    { key: 'seg', label: 'Segunda-feira' },
    { key: 'ter', label: 'Terça-feira' },
    { key: 'qua', label: 'Quarta-feira' },
    { key: 'qui', label: 'Quinta-feira' },
    { key: 'sex', label: 'Sexta-feira' },
  ];

  const timeSlots = [
    { id: 'm1', shift: 'matutino', time: '07:30 - 09:10', label: 'Manhã (1º Bloco)' },
    { id: 'm2', shift: 'matutino', time: '09:30 - 11:10', label: 'Manhã (2º Bloco)' },
    { id: 't1', shift: 'vespertino', time: '13:30 - 15:10', label: 'Tarde (1º Bloco)' },
    { id: 't2', shift: 'vespertino', time: '15:30 - 17:10', label: 'Tarde (2º Bloco)' },
    { id: 'n1', shift: 'noturno', time: '18:50 - 20:30', label: 'Noite (1º Bloco)' },
    { id: 'n2', shift: 'noturno', time: '20:45 - 22:25', label: 'Noite (2º Bloco)' },
  ];

  // Schedule mapping: key is `${dayKey}-${timeSlotId}`
  const scheduleMatrix: Record<string, { classId: string; room: string; activityType: 'aula' | 'atendimento' | 'pesquisa' }> = {
    'seg-m1': { classId: 'cls-1', room: 'Lab Inf 04 (Prédio 3)', activityType: 'aula' },
    'seg-m2': { classId: 'cls-1', room: 'Lab Inf 04 (Prédio 3)', activityType: 'aula' },
    'seg-t1': { classId: 'cls-3', room: 'Lab Redes e SO 02', activityType: 'aula' },
    'seg-t2': { classId: 'cls-3', room: 'Lab Redes e SO 02', activityType: 'aula' },
    
    'ter-t1': { classId: 'cls-2', room: 'Sala 204 - Bloco B', activityType: 'aula' },
    'ter-t2': { classId: 'cls-2', room: 'Sala 204 - Bloco B', activityType: 'aula' },

    'qua-m1': { classId: 'cls-1', room: 'Lab Inf 04 (Prédio 3)', activityType: 'aula' },
    'qua-m2': { classId: 'cls-1', room: 'Lab Inf 04 (Prédio 3)', activityType: 'aula' },
    'qua-t1': { classId: 'cls-4', room: 'Auditório 01 / Remoto', activityType: 'aula' },
    'qua-t2': { classId: 'cls-4', room: 'Auditório 01 / Remoto', activityType: 'aula' },

    'qui-t1': { classId: 'cls-2', room: 'Sala 204 - Bloco B', activityType: 'aula' },
    'qui-t2': { classId: 'cls-2', room: 'Sala 204 - Bloco B', activityType: 'aula' },

    'sex-m1': { classId: 'office', room: 'Gabinete Docente 304', activityType: 'atendimento' },
    'sex-m2': { classId: 'office', room: 'Gabinete Docente 304', activityType: 'atendimento' },
  };

  const handleClassClick = (classId: string) => {
    if (classId === 'office') return;
    setSelectedClassId(classId);
    setActiveTab('chamada');
  };

  const filteredTimeSlots = timeSlots.filter(
    (slot) => selectedShift === 'all' || slot.shift === selectedShift
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Quadro de Horário Semanal de Aulas
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Grade oficial de alocação de salas e horários para o semestre letivo 2026/1.
          </p>
        </div>

        {/* Filter shifts */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedShift('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedShift === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os Turnos
            </button>
            <button
              onClick={() => setSelectedShift('matutino')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedShift === 'matutino' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manhã
            </button>
            <button
              onClick={() => setSelectedShift('vespertino')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedShift === 'vespertino' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tarde
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Carga Didática em Sala</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">14h / semana</div>
          <div className="text-[11px] text-slate-500 mt-0.5">4 turmas ativas</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Atendimento ao Aluno</div>
          <div className="text-xl font-extrabold text-indigo-600 mt-1">04h / semana</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sextas-feiras pela manhã</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Pesquisa e Extensão</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">16h / semana</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Projetos CNPq e Orientação</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Regime de Trabalho</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">DE (40h)</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Dedicação Exclusiva</div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="py-3 px-4 w-36 text-center">Horário</th>
                {days.map((d) => (
                  <th key={d.key} className="py-3 px-4 text-center min-w-[170px]">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTimeSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-slate-50/50">
                  {/* Time label */}
                  <td className="py-4 px-3 text-center font-bold text-slate-800 bg-slate-50/70 border-r border-slate-200">
                    <div className="text-xs font-extrabold">{slot.time}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{slot.label}</div>
                  </td>

                  {/* Days columns */}
                  {days.map((day) => {
                    const key = `${day.key}-${slot.id}`;
                    const entry = scheduleMatrix[key];

                    if (!entry) {
                      return (
                        <td key={key} className="p-2 text-center text-slate-300 font-medium text-xs">
                          <span className="text-[11px] text-slate-300">—</span>
                        </td>
                      );
                    }

                    if (entry.activityType === 'atendimento') {
                      return (
                        <td key={key} className="p-2">
                          <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-left">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 uppercase">
                              <Users className="w-3 h-3" /> Plantão de Dúvidas
                            </div>
                            <div className="text-xs font-bold text-indigo-950 mt-1">Atendimento ao Aluno</div>
                            <div className="text-[10px] text-indigo-600 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {entry.room}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    const classObj = classes.find((c) => c.id === entry.classId);

                    return (
                      <td key={key} className="p-2">
                        <button
                          type="button"
                          onClick={() => handleClassClick(entry.classId)}
                          className="w-full p-3 rounded-xl border text-left transition-all hover:scale-[1.02] shadow-2xs cursor-pointer group"
                          style={{
                            backgroundColor: `${classObj?.color}10`,
                            borderColor: `${classObj?.color}40`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white uppercase"
                              style={{ backgroundColor: classObj?.color }}
                            >
                              {classObj?.code}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {classObj?.period}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-900 mt-2 line-clamp-1 group-hover:text-indigo-600">
                            {classObj?.name}
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{entry.room}</span>
                          </div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
