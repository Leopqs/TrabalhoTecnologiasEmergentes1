import React from 'react';
import { AcademicProvider, useAcademic } from './context/AcademicContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ClassesView } from './components/ClassesView';
import { AttendanceView } from './components/AttendanceView';
import { GradesView } from './components/GradesView';
import { ClassEvaluationView } from './components/ClassEvaluationView';
import { NotificationsView } from './components/NotificationsView';
import { AvailabilityFormView } from './components/AvailabilityFormView';
import { MaterialsView } from './components/MaterialsView';
import { TimetableScheduleView } from './components/TimetableScheduleView';
import { AcademicCalendarView } from './components/AcademicCalendarView';
import { TeacherProfileView } from './components/TeacherProfileView';
import { GeminiCostView } from './components/GeminiCostView';
import { GeminiCostModal } from './components/GeminiCostModal';

const AppContent: React.FC = () => {
  const { activeTab } = useAcademic();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'turmas':
        return <ClassesView />;
      case 'chamada':
        return <AttendanceView />;
      case 'notas':
        return <GradesView />;
      case 'avaliar-turma':
        return <ClassEvaluationView />;
      case 'notificacoes':
        return <NotificationsView />;
      case 'disponibilidade':
        return <AvailabilityFormView />;
      case 'materiais':
        return <MaterialsView />;
      case 'horario':
        return <TimetableScheduleView />;
      case 'calendario':
        return <AcademicCalendarView />;
      case 'meus-dados':
        return <TeacherProfileView />;
      case 'custos-ia':
        return <GeminiCostView />;
      default:
        return <ClassesView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Main Header with Live Gemini AI Cost Widget */}
      <Header />

      {/* Main Navigation Bar */}
      <Navigation />

      {/* Main Application Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {renderActiveView()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Portal Acadêmico do Professor</strong> • Sistema Integrado de Gestão Universitária (SIGA)
          </div>
          <div className="text-slate-400">
            Semestre 2026/1 • IA Integrada com Google Gemini 3.7 Flash
          </div>
        </div>
      </footer>

      {/* Global Cost Audit Modal */}
      <GeminiCostModal />
    </div>
  );
};

export default function App() {
  return (
    <AcademicProvider>
      <AppContent />
    </AcademicProvider>
  );
}
