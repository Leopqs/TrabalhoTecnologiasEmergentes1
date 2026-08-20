import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  Sparkles,
  X,
  Calculator,
  TrendingUp,
  DollarSign,
  FileCode,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const GeminiCostModal: React.FC = () => {
  const { isCostModalOpen, setIsCostModalOpen, geminiMetrics, setActiveTab } = useAcademic();

  if (!isCostModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Relatório de Custos e Auditoria Gemini AI
              </h3>
              <p className="text-xs text-slate-600">
                Consumo detalhado em conformidade com <span className="font-mono font-bold">CUSTOS_GEMINI.md</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCostModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Requisições</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">{geminiMetrics.totalCalls}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Tokens Entrada</div>
              <div className="text-lg font-extrabold text-indigo-600 mt-0.5">
                {geminiMetrics.totalInputTokens.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Tokens Saída</div>
              <div className="text-lg font-extrabold text-purple-600 mt-0.5">
                {geminiMetrics.totalOutputTokens.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <div className="text-[11px] text-emerald-800 font-bold">Total em Reais</div>
              <div className="text-lg font-extrabold text-emerald-950 mt-0.5">
                R$ {geminiMetrics.totalCostBRL.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Formula Box */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-1.5 border border-slate-800">
            <div className="text-emerald-400 font-bold">// Fórmula aplicada para cada chamada:</div>
            <div className="text-amber-300">
              custo = (tokens_input / 1_000_000) * $0.15 + (tokens_output / 1_000_000) * $0.60
            </div>
            <div className="text-slate-400 text-[11px] mt-1">
              Modelo ativo: <strong className="text-slate-200">gemini-3.7-flash</strong> (Cotação dólar: R$ 5,80)
            </div>
          </div>

          {/* Call History preview */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Últimas Requisições ({geminiMetrics.callHistory.length}):
            </h4>
            {geminiMetrics.callHistory.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                Nenhuma chamada realizada até o momento nesta sessão.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {geminiMetrics.callHistory.slice(-5).reverse().map((call) => (
                  <div
                    key={call.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{call.feature}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {call.inputTokens} in / {call.outputTokens} out tokens
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-emerald-700">R$ {call.costBRL.toFixed(4)}</div>
                      <div className="text-[10px] text-slate-400">${call.costUSD.toFixed(5)} USD</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => {
              setIsCostModalOpen(false);
              setActiveTab('custos-ia');
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            Ver Relatório Completo e Simulador
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsCostModalOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
