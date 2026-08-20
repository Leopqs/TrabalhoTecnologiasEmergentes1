import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { AcademicCalendarEvent } from '../types';
import {
  CalendarRange,
  Calendar as CalendarIcon,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AcademicCalendarView: React.FC = () => {
  const { calendarEvents } = useAcademic();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const types = [
    { key: 'all', label: 'Todos os Eventos' },
    { key: 'prova', label: 'Provas e Avaliações' },
    { key: 'prazo_notas', label: 'Prazos de Notas' },
    { key: 'feriado', label: 'Feriados / Pontes' },
    { key: 'reuniao', label: 'Reuniões Pedagógicas' },
    { key: 'recesso', label: 'Recessos e Férias' },
    { key: 'inicio_aulas', label: 'Início / Fim de Período' },
  ];

  const months = [
    { key: 'all', label: 'Semestre Inteiro' },
    { key: '02', label: 'Fevereiro 2026' },
    { key: '03', label: 'Março 2026' },
    { key: '04', label: 'Abril 2026' },
    { key: '05', label: 'Maio 2026' },
    { key: '06', label: 'Junho 2026' },
    { key: '07', label: 'Julho 2026' },
  ];

  const filteredEvents = calendarEvents.filter((event) => {
    const matchType = selectedType === 'all' || event.type === selectedType;
    const eventMonth = event.date.split('-')[1];
    const matchMonth = selectedMonth === 'all' || eventMonth === selectedMonth;
    return matchType && matchMonth;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'prova':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Avaliação / Prova</span>;
      case 'prazo_notas':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">Prazo Crítico de Notas</span>;
      case 'feriado':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Feriado Nacional</span>;
      case 'reuniao':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">Reunião Colegiado</span>;
      case 'recesso':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800">Recesso Escolar</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">Calendário Geral</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <CalendarRange className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Calendário Acadêmico Oficial 2026/1
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Consulte datas regimentais, semanas de provas, feriados institucionais e prazos finais de digitação de notas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800">
            Total de 100 dias letivos
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Filtrar por Tipo de Evento:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {types.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Filtrar por Mês:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Timeline / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 divide-y divide-slate-100">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            Nenhum evento acadêmico correspondente aos filtros selecionados.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const dateParts = event.date.split('-');
            const day = dateParts[2];
            const monthNames = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const monthName = monthNames[parseInt(dateParts[1], 10)];

            return (
              <div
                key={event.id}
                id={`calendar-event-${event.id}`}
                className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Date Badge */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <span className="text-base font-extrabold text-indigo-900 leading-none">{day}</span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase mt-0.5">{monthName}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      {getEventBadge(event.type)}
                      {event.isHoliday && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Sem aulas
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{event.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-slate-400">
                    Ano Letivo 2026
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
