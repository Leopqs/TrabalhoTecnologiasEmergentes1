import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  Calculator,
  Sparkles,
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  Copy,
  Check,
  HelpCircle,
  FileCode,
  ShieldCheck,
} from 'lucide-react';

export const GeminiCostView: React.FC = () => {
  const { geminiMetrics } = useAcademic();
  const [copied, setCopied] = useState(false);

  // Simulation State
  const [simStudents, setSimStudents] = useState<number>(300);
  const [simEvaluations, setSimEvaluations] = useState<number>(10);
  const [simNotifications, setSimNotifications] = useState<number>(20);
  const [simMaterials, setSimMaterials] = useState<number>(15);

  const priceInputPerMillion = 0.15; // USD for gemini-3.7-flash (<= 128k)
  const priceOutputPerMillion = 0.60; // USD for gemini-3.7-flash (<= 128k)
  const exchangeRateBRL = 5.80;

  // Estimated tokens per call
  // Evaluation: ~800 in, ~500 out
  // Notification: ~300 in, ~200 out
  // Material: ~600 in, ~800 out
  const simInputTokens = (simEvaluations * 800) + (simNotifications * 300) + (simMaterials * 600);
  const simOutputTokens = (simEvaluations * 500) + (simNotifications * 200) + (simMaterials * 800);
  const simCostUSD = (simInputTokens / 1_000_000) * priceInputPerMillion + (simOutputTokens / 1_000_000) * priceOutputPerMillion;
  const simCostBRL = simCostUSD * exchangeRateBRL;

  const handleCopyMarkdown = () => {
    fetch('/CUSTOS_GEMINI.md')
      .then((r) => r.text())
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Auditoria de Custos da API Gemini (CUSTOS_GEMINI.md)
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Cálculo em tempo real de tokens consumidos, custos oficiais por milhão e auditoria da sessão.
          </p>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado para Área de Transferência!' : 'Copiar CUSTOS_GEMINI.md'}
        </button>
      </div>

      {/* Session Live Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total de Requisições</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{geminiMetrics.totalCalls}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Chamadas nesta sessão</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Tokens de Entrada</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {geminiMetrics.totalInputTokens.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">$0.15 por 1M tokens</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Tokens de Saída</div>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">
            {geminiMetrics.totalOutputTokens.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">$0.60 por 1M tokens</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="text-xs text-amber-800 font-bold">Custo Total (USD)</div>
          <div className="text-2xl font-extrabold text-amber-950 mt-1">
            ${geminiMetrics.totalCostUSD.toFixed(5)}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">Tabela oficial Google AI</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="text-xs text-emerald-800 font-bold">Custo Total (BRL)</div>
          <div className="text-2xl font-extrabold text-emerald-950 mt-1">
            R$ {geminiMetrics.totalCostBRL.toFixed(4)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Cotação base R$ 5,80</div>
        </div>
      </div>

      {/* Official Formula Documentation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <FileCode className="w-4 h-4 text-indigo-600" />
          Fórmula Oficial de Cálculo de Custo
        </h3>

        <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          <div className="text-emerald-400 font-bold">// Fórmula para cada chamada da API Gemini:</div>
          <div className="mt-1 text-amber-300">
            custo_chamada_USD = (tokens_input / 1_000_000) * preco_input + (tokens_output / 1_000_000) * preco_output;
          </div>
          <div className="mt-1 text-slate-300">
            custo_chamada_BRL = custo_chamada_USD * taxa_cambio_BRL;
          </div>
          <div className="mt-2 text-indigo-300">
            custo_sessao_total = Σ (custos de todas as chamadas realizadas);
          </div>
        </div>

        <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <strong className="text-slate-900">Nota sobre Free Tier vs Custo Hipotético:</strong> Conforme solicitado, mesmo quando as requisições utilizam chaves com cota gratuita (Free Tier), o sistema aplica a tabela de preços oficial do modelo pago (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] text-slate-800 font-bold">gemini-3.7-flash</code>: <strong className="text-slate-900">$0.15/1M input</strong> e <strong className="text-slate-900">$0.60/1M output</strong>), permitindo estimar com precisão o custo de escalabilidade para instituições de ensino e departamentos acadêmicos.
        </div>
      </div>

      {/* Real-Time Call History Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Histórico Auditável de Chamadas à API Gemini nesta Sessão ({geminiMetrics.callHistory.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Modelo: gemini-3.7-flash</span>
        </div>

        {geminiMetrics.callHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Nenhuma chamada de IA realizada nesta sessão ainda. Utilize o botão "Avaliar Turma com IA", "Criar com IA" em Materiais ou o Assistente de Notificações para gerar chamadas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Funcionalidade / Endpoint</th>
                  <th className="py-3 px-3 text-right">Tokens In</th>
                  <th className="py-3 px-3 text-right">Tokens Out</th>
                  <th className="py-3 px-3 text-right">Total Tokens</th>
                  <th className="py-3 px-3 text-right">Custo USD</th>
                  <th className="py-3 px-4 text-right">Custo BRL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {geminiMetrics.callHistory.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      {new Date(call.timestamp).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">
                      {call.feature}
                    </td>
                    <td className="py-2.5 px-3 text-right text-indigo-600 font-bold">
                      {call.inputTokens}
                    </td>
                    <td className="py-2.5 px-3 text-right text-purple-600 font-bold">
                      {call.outputTokens}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {call.totalTokens}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-700 font-bold">
                      ${call.costUSD.toFixed(5)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">
                      R$ {call.costBRL.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive University Cost Simulator */}
      <div className="bg-gradient-to-br from-indigo-50/60 via-slate-50 to-amber-50/50 p-6 rounded-2xl border border-indigo-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Simulador de Custo Departamental / Semestral (Escalabilidade)
            </h3>
            <p className="text-xs text-slate-500">
              Calcule quanto custaria o uso massivo da IA do Gemini para todo o departamento acadêmico.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pareceres Pedagógicos de Turmas:
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={simEvaluations}
              onChange={(e) => setSimEvaluations(Number(e.target.value))}
              className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Comunicados e Avisos Redigidos:
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={simNotifications}
              onChange={(e) => setSimNotifications(Number(e.target.value))}
              className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Materiais e Listas de Exercícios Criadas:
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={simMaterials}
              onChange={(e) => setSimMaterials(Number(e.target.value))}
              className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2"
            />
          </div>
        </div>

        {/* Simulator Results */}
        <div className="p-4 bg-white rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            Estimativa de volume: <strong className="text-indigo-600">{simInputTokens.toLocaleString()} tokens de entrada</strong> e <strong className="text-purple-600">{simOutputTokens.toLocaleString()} tokens de saída</strong>.
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-semibold">Custo Estimado do Departamento:</div>
            <div className="text-base font-extrabold text-slate-900">
              R$ {simCostBRL.toFixed(3)} <span className="text-xs text-slate-500 font-normal">(${simCostUSD.toFixed(4)} USD)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
