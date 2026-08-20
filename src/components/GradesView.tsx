import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { GradeItem } from '../types';
import {
  FileSpreadsheet,
  Settings2,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Download,
  Save,
  Plus,
  HelpCircle,
  X,
} from 'lucide-react';

export const GradesView: React.FC = () => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    activeClass,
    gradebooks,
    updateStudentGrade,
    updateGradeWeights,
    getStudentAverage,
    getStudentSituation,
  } = useAcademic();

  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const gradebook = gradebooks[activeClass.id] || {
    classId: activeClass.id,
    weights: { p1: 0.35, p2: 0.35, trabalho: 0.20, atividades: 0.10 },
    passingGrade: 7.0,
    recoveryGrade: 5.0,
    grades: [],
  };

  const [tempWeights, setTempWeights] = useState(gradebook.weights);
  const [tempPassing, setTempPassing] = useState(gradebook.passingGrade);

  // Statistics
  const studentAverages = activeClass.students.map((student) => {
    const item = gradebook.grades.find((g) => g.studentId === student.id);
    return getStudentAverage(item, gradebook.weights);
  });

  const validAverages = studentAverages.filter((a): a is number => a !== null);
  const classMean = validAverages.length > 0
    ? (validAverages.reduce((sum, a) => sum + a, 0) / validAverages.length).toFixed(1)
    : '0.0';

  const approvedCount = studentAverages.filter((a) => a !== null && a >= gradebook.passingGrade).length;
  const recoveryCount = studentAverages.filter(
    (a) => a !== null && a >= gradebook.recoveryGrade && a < gradebook.passingGrade
  ).length;
  const failedCount = studentAverages.filter((a) => a !== null && a < gradebook.recoveryGrade).length;
  const approvalRate = validAverages.length > 0 ? Math.round((approvedCount / validAverages.length) * 100) : 0;

  const handleGradeChange = (studentId: string, field: keyof GradeItem, valStr: string) => {
    if (field === 'notes') {
      updateStudentGrade(activeClass.id, studentId, field, valStr);
      return;
    }

    if (valStr === '') {
      updateStudentGrade(activeClass.id, studentId, field, undefined);
      return;
    }

    const num = parseFloat(valStr.replace(',', '.'));
    if (!isNaN(num) && num >= 0 && num <= 10) {
      updateStudentGrade(activeClass.id, studentId, field, num);
    }
  };

  const handleSaveWeights = () => {
    updateGradeWeights(activeClass.id, tempWeights);
    setIsWeightsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Matricula', 'Nome', 'P1', 'P2', 'Trabalho', 'Atividades', 'Exame', 'Media Final', 'Situacao'];
    const rows = activeClass.students.map((student) => {
      const g = gradebook.grades.find((x) => x.studentId === student.id);
      const avg = getStudentAverage(g, gradebook.weights);
      const sit = getStudentSituation(avg, gradebook.passingGrade, gradebook.recoveryGrade);
      return [
        student.matricula,
        `"${student.name}"`,
        g?.p1 ?? '',
        g?.p2 ?? '',
        g?.trabalho ?? '',
        g?.atividades ?? '',
        g?.exameFinal ?? '',
        avg ?? '',
        sit.label,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `notas_${activeClass.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Diário e Lançamento de Notas
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Lance avaliações, projetos e exames. As médias ponderadas e situações são calculadas em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWeightsModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4 text-slate-500" />
            Configurar Pesos
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Exportar CSV
          </button>
          <button
            onClick={handleManualSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-200 cursor-pointer flex items-center gap-2"
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
            {saveSuccess ? 'Notas Salvas!' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Class Selector & Weights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <label className="block text-xs font-bold text-slate-600 mb-1">Turma Ativa:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.code} - {cls.name} ({cls.period})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs md:col-span-2 flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Pesos Ponderados Vigentes:</span>
            <span className="text-[11px] font-normal text-slate-500">Média de Aprovação: <strong>7.0</strong> | Recuperação: <strong>5.0</strong></span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold">
              P1: <strong>{(gradebook.weights.p1 * 100).toFixed(0)}%</strong>
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold">
              P2: <strong>{(gradebook.weights.p2 * 100).toFixed(0)}%</strong>
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold">
              Trabalho: <strong>{(gradebook.weights.trabalho * 100).toFixed(0)}%</strong>
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold">
              Atividades: <strong>{(gradebook.weights.atividades * 100).toFixed(0)}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
            {classMean}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Média da Turma</div>
            <div className="text-sm font-extrabold text-slate-800">Desempenho Geral</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            {approvalRate}%
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Aprovação Direta</div>
            <div className="text-sm font-extrabold text-emerald-700">{approvedCount} alunos</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
            {recoveryCount}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Em Recuperação</div>
            <div className="text-sm font-extrabold text-amber-700">Média 5.0 a 6.9</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-sm">
            {failedCount}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Reprovados / Risco</div>
            <div className="text-sm font-extrabold text-rose-700">Média &lt; 5.0</div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[200px]">Estudante</th>
                <th className="py-3.5 px-3 text-center w-24">P1 (0-10)</th>
                <th className="py-3.5 px-3 text-center w-24">P2 (0-10)</th>
                <th className="py-3.5 px-3 text-center w-24">Trab (0-10)</th>
                <th className="py-3.5 px-3 text-center w-24">Ativ (0-10)</th>
                <th className="py-3.5 px-3 text-center w-24">Exame</th>
                <th className="py-3.5 px-3 text-center w-28">Média Final</th>
                <th className="py-3.5 px-4 text-center w-36">Situação</th>
                <th className="py-3.5 px-4 min-w-[200px]">Parecer / Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {activeClass.students.map((student, idx) => {
                const gradeItem = gradebook.grades.find((g) => g.studentId === student.id) || {
                  studentId: student.id,
                };
                const avg = getStudentAverage(gradeItem, gradebook.weights);
                const situation = getStudentSituation(avg, gradebook.passingGrade, gradebook.recoveryGrade);

                return (
                  <tr
                    key={student.id}
                    id={`grade-row-${student.id}`}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-bold">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">RA: {student.matricula}</div>
                    </td>

                    {/* P1 Input */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={gradeItem.p1 ?? ''}
                        onChange={(e) => handleGradeChange(student.id, 'p1', e.target.value)}
                        placeholder="-"
                        className="w-18 text-center text-xs font-bold py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </td>

                    {/* P2 Input */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={gradeItem.p2 ?? ''}
                        onChange={(e) => handleGradeChange(student.id, 'p2', e.target.value)}
                        placeholder="-"
                        className="w-18 text-center text-xs font-bold py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </td>

                    {/* Trabalho Input */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={gradeItem.trabalho ?? ''}
                        onChange={(e) => handleGradeChange(student.id, 'trabalho', e.target.value)}
                        placeholder="-"
                        className="w-18 text-center text-xs font-bold py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </td>

                    {/* Atividades Input */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={gradeItem.atividades ?? ''}
                        onChange={(e) => handleGradeChange(student.id, 'atividades', e.target.value)}
                        placeholder="-"
                        className="w-18 text-center text-xs font-bold py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </td>

                    {/* Exame Final Input */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={gradeItem.exameFinal ?? ''}
                        onChange={(e) => handleGradeChange(student.id, 'exameFinal', e.target.value)}
                        placeholder="-"
                        className="w-18 text-center text-xs font-bold py-1.5 bg-amber-50/50 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
                      />
                    </td>

                    {/* Média Final */}
                    <td className="py-3 px-3 text-center">
                      <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {avg !== null ? avg.toFixed(1) : '-'}
                      </span>
                    </td>

                    {/* Situação */}
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-block ${situation.color}`}>
                        {situation.label}
                      </span>
                    </td>

                    {/* Notes Input */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={gradeItem.notes ?? ''}
                        onChange={(e) => handleGradeChange(student.id, 'notes', e.target.value)}
                        placeholder="Comentário sobre o aluno..."
                        className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Weights configuration */}
      {isWeightsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-600" />
                Configurar Pesos e Critérios
              </h3>
              <button
                onClick={() => setIsWeightsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              A soma de todos os pesos deve totalizar 100% (1.0).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peso Prova P1: {(tempWeights.p1 * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={tempWeights.p1}
                  onChange={(e) => setTempWeights({ ...tempWeights, p1: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peso Prova P2: {(tempWeights.p2 * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={tempWeights.p2}
                  onChange={(e) => setTempWeights({ ...tempWeights, p2: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peso Trabalho Semestral: {(tempWeights.trabalho * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="0.5"
                  step="0.05"
                  value={tempWeights.trabalho}
                  onChange={(e) => setTempWeights({ ...tempWeights, trabalho: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peso Atividades Contínuas: {(tempWeights.atividades * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="0.4"
                  step="0.05"
                  value={tempWeights.atividades}
                  onChange={(e) => setTempWeights({ ...tempWeights, atividades: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="pt-2 text-xs font-bold flex justify-between">
                <span>Soma Total:</span>
                <span
                  className={
                    Math.abs(tempWeights.p1 + tempWeights.p2 + tempWeights.trabalho + tempWeights.atividades - 1.0) < 0.01
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }
                >
                  {((tempWeights.p1 + tempWeights.p2 + tempWeights.trabalho + tempWeights.atividades) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setIsWeightsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveWeights}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Salvar Pesos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
