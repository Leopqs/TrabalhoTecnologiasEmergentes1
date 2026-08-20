import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  GraduationCap,
  Sparkles,
  Bell,
  User,
  BookOpen,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    teacher,
    classes,
    selectedClassId,
    setSelectedClassId,
    activeClass,
    unreadCount,
    geminiMetrics,
    setIsCostModalOpen,
    setActiveTab,
  } = useAcademic();

  return (
    <header id="app-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Institution Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                Portal do Professor
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                2026/1
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[240px] sm:max-w-none">
              Universidade Federal Tecnológica • DCTI
            </p>
          </div>
        </div>

        {/* Center / Class Selector */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <BookOpen className="w-4 h-4 text-slate-500 ml-2" />
          <label htmlFor="quick-class-select" className="text-xs font-semibold text-slate-600">
            Turma Ativa:
          </label>
          <select
            id="quick-class-select"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.code} - {cls.name} ({cls.period})
              </option>
            ))}
          </select>
        </div>

        {/* Right Tools & Metrics */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gemini AI Cost Badge */}
          <button
            id="btn-open-gemini-cost-modal"
            onClick={() => setIsCostModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 text-amber-900 transition-all cursor-pointer shadow-xs group"
            title="Clique para ver o relatório detalhado de consumo de tokens e custos da API Gemini"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">IA Gemini</span>
                <span className="text-[10px] text-amber-600">({geminiMetrics.totalCalls} reqs)</span>
              </div>
              <div className="text-xs font-extrabold text-amber-950 flex items-center gap-1 mt-0.5">
                <span>R$ {geminiMetrics.totalCostBRL.toFixed(4)}</span>
                <span className="text-[10px] font-normal text-slate-500">(${geminiMetrics.totalCostUSD.toFixed(4)} USD)</span>
              </div>
            </div>
          </button>

          {/* Notifications Bell */}
          <button
            id="btn-notifications-header"
            onClick={() => setActiveTab('notificacoes')}
            className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="Notificações e Comunicados"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Teacher Profile Shortcut */}
          <button
            id="btn-profile-header"
            onClick={() => setActiveTab('meus-dados')}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
            title="Visualizar meus dados cadastrados"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-200 overflow-hidden">
              {teacher.avatarUrl ? (
                <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="text-left hidden lg:block pr-1">
              <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
                {teacher.name.replace('Prof. Dr. ', '')}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Matrícula: {teacher.matricula}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
