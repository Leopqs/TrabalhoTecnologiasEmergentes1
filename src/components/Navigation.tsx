import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  Users,
  CheckSquare,
  FileSpreadsheet,
  Target,
  Bell,
  Clock,
  FolderOpen,
  CalendarDays,
  CalendarRange,
  UserCheck,
  Sparkles,
  Calculator,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, unreadCount } = useAcademic();

  const navItems = [
    { id: 'turmas', label: 'Minhas Turmas', icon: Users, badge: null },
    { id: 'chamada', label: 'Fazer Chamada', icon: CheckSquare, badge: null },
    { id: 'notas', label: 'Lançar Notas', icon: FileSpreadsheet, badge: null },
    { id: 'avaliar-turma', label: 'Avaliar Turma', icon: Target, badge: 'IA' },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'disponibilidade', label: 'Disponibilidade', icon: Clock, badge: null },
    { id: 'materiais', label: 'Materiais de Aula', icon: FolderOpen, badge: null },
    { id: 'horario', label: 'Horário de Aula', icon: CalendarDays, badge: null },
    { id: 'calendario', label: 'Calendário Acadêmico', icon: CalendarRange, badge: null },
    { id: 'meus-dados', label: 'Meus Dados', icon: UserCheck, badge: null },
    { id: 'custos-ia', label: 'Custos Gemini (MD)', icon: Calculator, badge: '$' },
  ];

  return (
    <nav id="main-navigation" className="bg-white border-b border-slate-200 sticky top-[61px] z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isActive
                        ? 'bg-indigo-800 text-indigo-100'
                        : item.badge === 'IA'
                        ? 'bg-amber-100 text-amber-800'
                        : typeof item.badge === 'number'
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
