import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { draftNotificationWithGemini } from '../services/geminiService';
import {
  Bell,
  Send,
  Sparkles,
  Inbox,
  AlertTriangle,
  FileCheck,
  CheckCheck,
  Plus,
  Loader2,
  Calendar,
  Users,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    sendNotification,
    markNotificationAsRead,
    classes,
    teacher,
    recordGeminiUsage,
  } = useAcademic();

  const [subTab, setSubTab] = useState<'received' | 'sent' | 'compose'>('received');

  // Form State
  const [targetClassId, setTargetClassId] = useState<string>('all');
  const [category, setCategory] = useState<'aviso' | 'urgente' | 'prova' | 'material' | 'institucional'>('aviso');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // AI Drafter state
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('Claro, encorajador e profissional');
  const [aiKeyPoints, setAiKeyPoints] = useState('');
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [aiDraftError, setAiDraftError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const receivedNotifications = notifications.filter((n) => n.type === 'received');
  const sentNotifications = notifications.filter((n) => n.type === 'sent');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    sendNotification({
      title,
      content,
      sender: teacher.name,
      targetClassId: targetClassId === 'all' ? undefined : targetClassId,
      category,
    });

    setTitle('');
    setContent('');
    setAiTopic('');
    setAiKeyPoints('');
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setSubTab('sent');
    }, 1500);
  };

  const handleAiDraft = async () => {
    if (!aiTopic.trim()) {
      setAiDraftError('Por favor informe o assunto ou objetivo principal do comunicado.');
      return;
    }

    setIsDraftingAi(true);
    setAiDraftError(null);

    const targetClassObj = classes.find((c) => c.id === targetClassId);
    const targetAudience = targetClassId === 'all' ? 'Todas as turmas do professor' : `${targetClassObj?.code} - ${targetClassObj?.name}`;

    try {
      const res = await draftNotificationWithGemini({
        topic: aiTopic,
        category,
        targetAudience,
        tone: aiTone,
        keyPoints: aiKeyPoints || 'Informar prazos, canais de contato e orientações gerais.',
      });

      if (res.success && res.data) {
        setTitle(res.data.title || aiTopic);
        setContent(res.data.content || '');
        recordGeminiUsage(res.usage);
      }
    } catch (err: any) {
      console.error(err);
      setAiDraftError(err.message || 'Falha ao redigir notificação com IA.');
    } finally {
      setIsDraftingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Central de Notificações e Avisos
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Receba comunicados da coordenação acadêmica e envie avisos oficiais para seus alunos.
          </p>
        </div>

        {/* SubTab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('received')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'received' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            Recebidas ({receivedNotifications.length})
          </button>
          <button
            onClick={() => setSubTab('sent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'sent' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Enviadas ({sentNotifications.length})
          </button>
          <button
            onClick={() => setSubTab('compose')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'compose' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Comunicado
          </button>
        </div>
      </div>

      {/* 1. Received Notifications List */}
      {subTab === 'received' && (
        <div className="space-y-4">
          {receivedNotifications.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Nenhuma notificação recebida no momento.
            </div>
          ) : (
            receivedNotifications.map((notif) => {
              return (
                <div
                  key={notif.id}
                  id={`notif-card-${notif.id}`}
                  className={`bg-white p-6 rounded-2xl border transition-all shadow-xs space-y-3 ${
                    notif.isRead ? 'border-slate-200' : 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          notif.category === 'urgente'
                            ? 'bg-rose-100 text-rose-700'
                            : notif.category === 'prova'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {notif.category === 'urgente' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              notif.category === 'urgente'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {notif.category}
                          </span>
                          {!notif.isRead && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                              Novo
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-medium">{notif.date}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mt-1">{notif.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">De: {notif.sender}</p>
                      </div>
                    </div>

                    {!notif.isRead && (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80 whitespace-pre-line">
                    {notif.content}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Sent Notifications List */}
      {subTab === 'sent' && (
        <div className="space-y-4">
          {sentNotifications.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Você ainda não enviou nenhum comunicado neste semestre.
            </div>
          ) : (
            sentNotifications.map((notif) => {
              const targetClass = classes.find((c) => c.id === notif.targetClassId);
              return (
                <div
                  key={notif.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {notif.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Enviado em {notif.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{notif.title}</h3>
                      <p className="text-xs text-indigo-600 font-bold">
                        Destinatário: {targetClass ? `${targetClass.code} - ${targetClass.name}` : 'Todas as turmas'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-700">
                        {notif.readByCount} de {notif.totalTargetCount || 30}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Alunos confirmaram leitura</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80 whitespace-pre-line">
                    {notif.content}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. Compose New Notification with AI Draft Assistant */}
      {subTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Composer (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              Redigir e Enviar Comunicado Oficial
            </h3>

            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Turma Destinatária:</label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Todas as minhas turmas</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.code} - {cls.name} ({cls.studentsCount} alunos)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="aviso">Aviso Geral</option>
                    <option value="urgente">Aviso Urgente</option>
                    <option value="prova">Avaliação / Prova</option>
                    <option value="material">Novo Material de Aula</option>
                    <option value="institucional">Institucional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Comunicado:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Orientações para a Prova P1 e Liberação do Gabarito"
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Conteúdo da Mensagem:</label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Digite aqui o texto que será disparado no portal dos alunos..."
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-medium">
                  Remetente: <strong className="text-slate-700">{teacher.name}</strong>
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200 cursor-pointer flex items-center gap-2"
                >
                  {sendSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Send className="w-4 h-4" />}
                  {sendSuccess ? 'Enviado com Sucesso!' : 'Disparar Notificação'}
                </button>
              </div>
            </form>
          </div>

          {/* AI Redaction Assistant Sidebar (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-indigo-500/10 p-6 rounded-2xl border border-amber-200 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Assistente de Redação com IA (Gemini)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Informe apenas tópicos e deixe o Gemini estruturar um texto formal.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Qual é o objetivo principal?
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ex: Adiar a entrega do trabalho para sexta-feira"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tom de Voz Desejado:
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="Claro, encorajador e profissional">Incentivador e Acolhedor</option>
                  <option value="Formal, direto e institucional">Formal e Institucional</option>
                  <option value="Urgente, rigoroso e explicativo">Urgente com Instruções Claras</option>
                  <option value="Didático com tópicos numerados">Didático em Tópicos</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pontos-chave a incluir (opcional):
                </label>
                <textarea
                  rows={3}
                  value={aiKeyPoints}
                  onChange={(e) => setAiKeyPoints(e.target.value)}
                  placeholder="Ex: Nova data 28/08 às 23h59, dúvidas no plantão de quarta, formato PDF..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {aiDraftError && (
                <p className="text-xs text-rose-600 font-medium">{aiDraftError}</p>
              )}

              <button
                id="btn-draft-with-gemini"
                type="button"
                onClick={handleAiDraft}
                disabled={isDraftingAi}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDraftingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isDraftingAi ? 'Redigindo com IA...' : 'Gerar Rascunho com IA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
