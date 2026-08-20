import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { ClassEvaluation } from '../types';
import { evaluateClassWithGemini } from '../services/geminiService';
import {
  Target,
  Sparkles,
  Star,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  FileText,
  Save,
  Loader2,
  HelpCircle,
} from 'lucide-react';

export const ClassEvaluationView: React.FC = () => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    activeClass,
    gradebooks,
    getStudentAverage,
    evaluations,
    saveClassEvaluation,
    recordGeminiUsage,
    setIsCostModalOpen,
  } = useAcademic();

  const currentEval = evaluations.find((e) => e.classId === activeClass.id) || {
    id: `eval-${activeClass.id}`,
    classId: activeClass.id,
    date: new Date().toISOString().split('T')[0],
    academicPeriod: '2026/1 - 1º Semestre',
    engagementRating: 4,
    disciplineRating: 4.5,
    homeworkDeliveryRating: 4,
    criticalThinkingRating: 4.5,
    qualitativeSummary: '',
    strengths: [],
    attentionPoints: [],
    pedagogicalActionPlan: '',
  };

  const [engagement, setEngagement] = useState<number>(currentEval.engagementRating);
  const [discipline, setDiscipline] = useState<number>(currentEval.disciplineRating);
  const [homework, setHomework] = useState<number>(currentEval.homeworkDeliveryRating);
  const [criticalThinking, setCriticalThinking] = useState<number>(currentEval.criticalThinkingRating);
  const [teacherNotes, setTeacherNotes] = useState<string>(currentEval.qualitativeSummary || '');

  const [aiReport, setAiReport] = useState<any>(
    currentEval.strengths?.length > 0
      ? {
          summary: currentEval.qualitativeSummary,
          strengths: currentEval.strengths,
          attentionPoints: currentEval.attentionPoints,
          pedagogicalActionPlan: currentEval.pedagogicalActionPlan,
        }
      : null
  );

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute live data for the class
  const book = gradebooks[activeClass.id];
  const studentAverages = activeClass.students.map((student) => {
    const item = book?.grades.find((g) => g.studentId === student.id);
    return getStudentAverage(item, book?.weights);
  });
  const validAvgs = studentAverages.filter((a): a is number => a !== null);
  const gradeAverage = validAvgs.length > 0
    ? (validAvgs.reduce((sum, a) => sum + a, 0) / validAvgs.length).toFixed(1)
    : '8.0';

  const attendanceAverage = `${Math.round(
    activeClass.students.reduce((acc, s) => acc + s.currentAttendancePercent, 0) / activeClass.students.length
  )}%`;

  const distribution = {
    excelente: validAvgs.filter((a) => a >= 9.0).length,
    bom: validAvgs.filter((a) => a >= 7.0 && a < 9.0).length,
    regular: validAvgs.filter((a) => a >= 5.0 && a < 7.0).length,
    critico: validAvgs.filter((a) => a < 5.0).length,
  };

  const handleGenerateAiDiagnostic = async () => {
    setIsLoadingAi(true);
    setAiError(null);

    try {
      const res = await evaluateClassWithGemini({
        className: `${activeClass.code} - ${activeClass.name}`,
        course: activeClass.course,
        studentCount: activeClass.students.length,
        attendanceAverage,
        gradeAverage: `${gradeAverage} / 10.0`,
        distribution,
        qualitativeNotes: teacherNotes || 'Turma engajada nas aulas expositivas, porém alguns alunos apresentam dificuldades nas entregas de projetos intermediários.',
      });

      if (res.success && res.data) {
        setAiReport(res.data);
        recordGeminiUsage(res.usage);

        // Update local state and save evaluation
        const updatedEvaluation: ClassEvaluation = {
          id: `eval-${activeClass.id}`,
          classId: activeClass.id,
          date: new Date().toISOString().split('T')[0],
          academicPeriod: '2026/1 - 1º Semestre',
          engagementRating: engagement,
          disciplineRating: discipline,
          homeworkDeliveryRating: homework,
          criticalThinkingRating: criticalThinking,
          qualitativeSummary: res.data.summary,
          strengths: res.data.strengths || [],
          attentionPoints: res.data.attentionPoints || [],
          pedagogicalActionPlan: res.data.pedagogicalActionPlan || '',
          aiGenerated: true,
        };
        saveClassEvaluation(updatedEvaluation);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Falha ao processar parecer com Gemini.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleManualSave = () => {
    const updatedEvaluation: ClassEvaluation = {
      id: `eval-${activeClass.id}`,
      classId: activeClass.id,
      date: new Date().toISOString().split('T')[0],
      academicPeriod: '2026/1 - 1º Semestre',
      engagementRating: engagement,
      disciplineRating: discipline,
      homeworkDeliveryRating: homework,
      criticalThinkingRating: criticalThinking,
      qualitativeSummary: teacherNotes || aiReport?.summary || '',
      strengths: aiReport?.strengths || [],
      attentionPoints: aiReport?.attentionPoints || [],
      pedagogicalActionPlan: aiReport?.pedagogicalActionPlan || '',
      aiGenerated: !!aiReport,
    };
    saveClassEvaluation(updatedEvaluation);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Target className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Avaliação e Diagnóstico Pedagógico da Turma
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Avalie o desempenho coletivo, critérios qualitativos e gere pareceres pedagógicos estruturados com IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.code} - {cls.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleManualSave}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Salvo!' : 'Salvar Avaliação'}
          </button>
        </div>
      </div>

      {/* Turma Stats Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Média Geral da Turma</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1">
            <span>{gradeAverage}</span>
            <span className="text-xs font-normal text-slate-400">/ 10.0</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Baseado nas notas lançadas</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Taxa Média de Frequência</div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">
            {attendanceAverage}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{activeClass.students.length} estudantes matriculados</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs md:col-span-2">
          <div className="text-xs font-medium text-slate-500 mb-2">Distribuição de Desempenho</div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
              <div className="text-xs font-bold text-emerald-800">{distribution.excelente}</div>
              <div className="text-[10px] text-emerald-600 font-medium">Excelente (&gt;9)</div>
            </div>
            <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
              <div className="text-xs font-bold text-blue-800">{distribution.bom}</div>
              <div className="text-[10px] text-blue-600 font-medium">Bom (7 a 8.9)</div>
            </div>
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
              <div className="text-xs font-bold text-amber-800">{distribution.regular}</div>
              <div className="text-[10px] text-amber-600 font-medium">Regular (5 a 6.9)</div>
            </div>
            <div className="bg-rose-50 p-2 rounded-xl border border-rose-100">
              <div className="text-xs font-bold text-rose-800">{distribution.critico}</div>
              <div className="text-[10px] text-rose-600 font-medium">Crítico (&lt;5)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Qualitative Rating Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          Métricas Qualitativas de Percepção Docente
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Engagement */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Engajamento e Participação em Aula:</span>
              <span className="text-indigo-600 font-extrabold">{engagement} / 5.0</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={engagement}
              onChange={(e) => setEngagement(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-[11px] text-slate-500">
              Interesse dos estudantes durante debates, perguntas e dinâmicas ativas.
            </p>
          </div>

          {/* Discipline */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Disciplina, Foco e Pontualidade:</span>
              <span className="text-indigo-600 font-extrabold">{discipline} / 5.0</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={discipline}
              onChange={(e) => setDiscipline(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-[11px] text-slate-500">
              Respeito ao horário de início e ambiente propício ao aprendizado.
            </p>
          </div>

          {/* Homework delivery */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Entrega de Trabalhos e Exercícios:</span>
              <span className="text-indigo-600 font-extrabold">{homework} / 5.0</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={homework}
              onChange={(e) => setHomework(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-[11px] text-slate-500">
              Pontualidade e profundidade técnica nas atividades extraclasse.
            </p>
          </div>

          {/* Critical thinking */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Raciocínio Crítico e Autonomia:</span>
              <span className="text-indigo-600 font-extrabold">{criticalThinking} / 5.0</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={criticalThinking}
              onChange={(e) => setCriticalThinking(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-[11px] text-slate-500">
              Capacidade de propor soluções criativas para problemas não triviais.
            </p>
          </div>
        </div>

        {/* Notes Area */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Observações e Anotações Qualitativas do Professor:
          </label>
          <textarea
            rows={3}
            value={teacherNotes}
            onChange={(e) => setTeacherNotes(e.target.value)}
            placeholder="Digite considerações sobre o ritmo da turma, dificuldades com tópicos específicos ou projetos..."
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* AI Action Button */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Gerador de Diagnóstico Pedagógico com IA (Gemini 3.7 Flash)
              </h4>
              <p className="text-[11px] text-slate-500">
                Analisa notas reais, assiduidade e percepções para gerar um plano de ação e parecer pedagógico completo.
              </p>
            </div>
          </div>

          <button
            id="btn-generate-ai-evaluation"
            onClick={handleGenerateAiDiagnostic}
            disabled={isLoadingAi}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-200 cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {isLoadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {isLoadingAi ? 'Analisando Turma com IA...' : 'Gerar Diagnóstico com IA'}
          </button>
        </div>

        {aiError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}
      </div>

      {/* AI Diagnostic Report Display */}
      {aiReport && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Parecer Pedagógico e Plano de Ação Institucional
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {activeClass.code} - {activeClass.name} • 2026/1
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
              Validado por IA
            </span>
          </div>

          {/* Analytical Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              1. Resumo Analítico Geral
            </h4>
            <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
              {aiReport.summary}
            </div>
          </div>

          {/* Strengths & Attention Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Pontos Fortes Identificados
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-800 list-disc list-inside">
                {aiReport.strengths?.map((str: string, i: number) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Pontos de Atenção e Vulnerabilidades
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-800 list-disc list-inside">
                {aiReport.attentionPoints?.map((att: string, i: number) => (
                  <li key={i}>{att}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Plan */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              2. Recomendações e Plano de Intervenção Pedagógica
            </h4>
            <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
              {aiReport.pedagogicalActionPlan}
            </div>
          </div>

          {/* Interventions table if available */}
          {aiReport.suggestedInterventions && aiReport.suggestedInterventions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                3. Ações Didáticas Práticas Sugeridas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiReport.suggestedInterventions.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                      <span>{item.topic}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                        {item.targetGroup}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
