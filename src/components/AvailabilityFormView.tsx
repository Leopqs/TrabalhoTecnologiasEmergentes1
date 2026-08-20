import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { AvailabilitySlotStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Save,
  HelpCircle,
  Info,
  CalendarCheck,
} from 'lucide-react';

export const AvailabilityFormView: React.FC = () => {
  const {
    availabilitySubmission,
    updateAvailabilitySubmission,
    submitAvailability,
  } = useAcademic();

  const [grid, setGrid] = useState(availabilitySubmission.grid);
  const [maxClassesPerDay, setMaxClassesPerDay] = useState(availabilitySubmission.maxClassesPerDay);
  const [preferredDaysOff, setPreferredDaysOff] = useState<string[]>(availabilitySubmission.preferredDaysOff || []);
  const [allowConsecutive, setAllowConsecutive] = useState(availabilitySubmission.allowConsecutiveClasses);
  const [modality, setModality] = useState(availabilitySubmission.preferredModality);
  const [healthRestrictions, setHealthRestrictions] = useState(availabilitySubmission.healthOrTravelRestrictions);
  const [justifications, setJustifications] = useState(availabilitySubmission.justifications);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const days = [
    { key: 'seg', label: 'Segunda-feira' },
    { key: 'ter', label: 'Terça-feira' },
    { key: 'qua', label: 'Quarta-feira' },
    { key: 'qui', label: 'Quinta-feira' },
    { key: 'sex', label: 'Sexta-feira' },
    { key: 'sab', label: 'Sábado' },
  ];

  const slots = [
    { key: 'm1', label: 'Manhã 1', time: '07:30 - 09:10' },
    { key: 'm2', label: 'Manhã 2', time: '09:30 - 11:10' },
    { key: 't1', label: 'Tarde 1', time: '13:30 - 15:10' },
    { key: 't2', label: 'Tarde 2', time: '15:30 - 17:10' },
    { key: 'n1', label: 'Noite 1', time: '18:50 - 20:30' },
    { key: 'n2', label: 'Noite 2', time: '20:45 - 22:25' },
  ];

  const toggleSlot = (dayKey: string, slotKey: string) => {
    const key = `${dayKey}-${slotKey}`;
    const current = grid[key] || 'disponivel';
    let next: AvailabilitySlotStatus = 'disponivel';
    if (current === 'disponivel') next = 'preferencial';
    else if (current === 'preferencial') next = 'indisponivel';
    else next = 'disponivel';

    setGrid((prev) => ({
      ...prev,
      [key]: next,
    }));
  };

  const setAllSlots = (status: AvailabilitySlotStatus) => {
    const newGrid: any = {};
    days.forEach((d) => {
      slots.forEach((s) => {
        newGrid[`${d.key}-${s.key}`] = status;
      });
    });
    setGrid(newGrid);
  };

  const handleToggleDayOff = (dayName: string) => {
    if (preferredDaysOff.includes(dayName)) {
      setPreferredDaysOff(preferredDaysOff.filter((d) => d !== dayName));
    } else {
      setPreferredDaysOff([...preferredDaysOff, dayName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAvailabilitySubmission({
      grid,
      maxClassesPerDay,
      preferredDaysOff,
      allowConsecutiveClasses: allowConsecutive,
      preferredModality: modality,
      healthOrTravelRestrictions: healthRestrictions,
      justifications,
    });
    submitAvailability();
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  // Count slot stats
  const allValues = Object.values(grid);
  const prefCount = allValues.filter((v) => v === 'preferencial').length;
  const dispCount = allValues.filter((v) => v === 'disponivel').length;
  const indispCount = allValues.filter((v) => v === 'indisponivel').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Clock className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Formulário de Disponibilidade Semanal Docente
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Preencha seus horários preferenciais e restrições para a coordenação acadêmica gerar a grade de horários do semestre.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Status do Formulário:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {availabilitySubmission.status} ({availabilitySubmission.semester})
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interactive Availability Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Grade Semanal de Horários (Clique nas células para alternar)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Alterne entre: <strong className="text-emerald-700">Disponível</strong>, <strong className="text-blue-700">Preferencial (Estrela)</strong> e <strong className="text-rose-700">Indisponível</strong>.
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setAllSlots('disponivel')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Tudo Disponível
              </button>
              <button
                type="button"
                onClick={() => setAllSlots('indisponivel')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Limpar Tudo
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              Disponível ({dispCount})
            </div>
            <div className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              Horário Preferencial ({prefCount})
            </div>
            <div className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              Indisponível ({indispCount})
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                  <th className="py-3 px-3 text-left w-36">Turno / Horário</th>
                  {days.map((d) => (
                    <th key={d.key} className="py-3 px-2 min-w-[110px]">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {slots.map((slot) => (
                  <tr key={slot.key} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-left font-bold text-slate-800 bg-slate-50/70 border-r border-slate-200">
                      <div>{slot.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{slot.time}</div>
                    </td>

                    {days.map((day) => {
                      const key = `${day.key}-${slot.key}`;
                      const status: AvailabilitySlotStatus = grid[key] || 'disponivel';

                      let cellBg = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200';
                      let cellText = 'Disponível';
                      if (status === 'preferencial') {
                        cellBg = 'bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300 font-bold';
                        cellText = '⭐ Preferencial';
                      } else if (status === 'indisponivel') {
                        cellBg = 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200';
                        cellText = '✕ Indisponível';
                      }

                      return (
                        <td key={key} className="p-1.5">
                          <button
                            type="button"
                            onClick={() => toggleSlot(day.key, slot.key)}
                            className={`w-full py-2.5 px-1.5 rounded-xl border text-[11px] transition-all cursor-pointer shadow-2xs font-medium ${cellBg}`}
                          >
                            {cellText}
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

        {/* Preference Questions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            2. Critérios Didáticos e Preferências Pedagógicas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Max classes per day */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número Máximo de Aulas por Dia:
              </label>
              <select
                value={maxClassesPerDay}
                onChange={(e) => setMaxClassesPerDay(Number(e.target.value))}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value={2}>Até 2 aulas (1 bloco diário)</option>
                <option value={4}>Até 4 aulas (2 blocos diários - Padrão)</option>
                <option value={6}>Até 6 aulas (3 blocos diários)</option>
              </select>
            </div>

            {/* Preferred modality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Modalidade de Ensino Preferencial:
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as any)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="Presencial">100% Presencial</option>
                <option value="Híbrido">Híbrido (Aulas teóricas EAD / Práticas Presenciais)</option>
                <option value="Indiferente">Indiferente / A critério da coordenação</option>
              </select>
            </div>
          </div>

          {/* Preferred day off */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Dias Preferenciais de Dedicação Exclusiva (Pesquisa, Extensão ou Gabinete):
            </label>
            <div className="flex flex-wrap gap-2">
              {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'].map((day) => {
                const isSelected = preferredDaysOff.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDayOff(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consecutive classes checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="consecutive-classes"
              checked={allowConsecutive}
              onChange={(e) => setAllowConsecutive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="consecutive-classes" className="text-xs font-medium text-slate-700 cursor-pointer">
              Permitir blocos consecutivos de aula no mesmo dia (ex: 4 horas ininterruptas).
            </label>
          </div>

          {/* Health and travel restrictions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Restrições de Deslocamento ou Questões Médicas:
            </label>
            <textarea
              rows={2}
              value={healthRestrictions}
              onChange={(e) => setHealthRestrictions(e.target.value)}
              placeholder="Ex: Não alocar aulas antes das 09h às terças por necessidade de tratamento médico..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Justifications */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Justificativas e Observações para a Coordenação Acadêmica:
            </label>
            <textarea
              rows={3}
              value={justifications}
              onChange={(e) => setJustifications(e.target.value)}
              placeholder="Informações adicionais sobre projetos de iniciação científica, orientação de mestrado ou comissões..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Última submissão: <strong className="text-slate-700">{availabilitySubmission.submissionDate}</strong>
            </span>

            <button
              id="btn-submit-availability"
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200 cursor-pointer flex items-center gap-2"
            >
              {submittedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Send className="w-4 h-4" />}
              {submittedSuccess ? 'Formulário Submetido com Sucesso!' : 'Enviar para Coordenação de Horários'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
