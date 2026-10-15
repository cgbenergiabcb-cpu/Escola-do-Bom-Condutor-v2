import React, { useState, useEffect } from 'react';
import { api } from './services/api.js';
import { Collaborator, UserAuth, SystemSettings, AppContent } from './types/index.js';
import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';
import { OfflineIndicator } from './components/pwa/PWAComponents.js';
import { HomeView } from './components/home/HomeView.js';
import { IdentificationStep } from './components/collaborator/IdentificationStep.js';
import { DataConfirmationStep } from './components/collaborator/DataConfirmationStep.js';
import { ExamInstructionsStep } from './components/collaborator/ExamInstructionsStep.js';
import { ExamSessionStep } from './components/collaborator/ExamSessionStep.js';
import { ExamResultStep } from './components/collaborator/ExamResultStep.js';
import { ProcessStatusStep } from './components/collaborator/ProcessStatusStep.js';
import { AdminLoginModal } from './components/admin/AdminLoginModal.js';
import { AdminLayout } from './components/admin/AdminLayout.js';
import { DashboardView } from './components/admin/DashboardView.js';
import { CollaboratorsView } from './components/admin/CollaboratorsView.js';
import { ImportExcelView } from './components/admin/ImportExcelView.js';
import { QuestionBankView } from './components/admin/QuestionBankView.js';
import { PracticalAssessmentView } from './components/admin/PracticalAssessmentView.js';
import { InstructorsView } from './components/admin/InstructorsView.js';
import { ReportsView } from './components/admin/ReportsView.js';
import { SettingsView } from './components/admin/SettingsView.js';
import { AuditLogsView } from './components/admin/AuditLogsView.js';
import { UsersView } from './components/admin/UsersView.js';
import { ContentView } from './components/admin/ContentView.js';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(() => {
    try {
      const saved = localStorage.getItem('ebc_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [adminSection, setAdminSection] = useState('dashboard');

  const handleOpenLogin = (mode: 'login' | 'register' = 'login') => {
    setLoginModalMode(mode);
    setIsLoginModalOpen(true);
  };
  const [settings, setSettings] = useState<SystemSettings>({
    notaMinimaTeorica: 70,
    quantidadeQuestoesTeorica: 15,
    tempoMaximoMinutos: 40,
    maxTentativasTeorica: 2,
    ordemAleatoriaQuestoes: true,
    ordemAleatoriaAlternativas: true,
    permitirRevisao: true,
    notaMinimaPratica: 75,
    permitirPraticaSemAprovacaoTeorica: false,
    modoHomologacao: true,
    mensagemAvisoOficial: 'Ambiente corporativo oficial da Escola do Bom Condutor.',
  });
  const [appContent, setAppContent] = useState<AppContent | null>(null);

  // Active collaborator evaluation session state
  const [activeCollaborator, setActiveCollaborator] = useState<Collaborator | null>(null);
  const [activeExamData, setActiveExamData] = useState<{
    attemptId: string;
    questions: any[];
    tempoMaximoMinutos: number;
  } | null>(null);
  const [examResult, setExamResult] = useState<any>(null);

  useEffect(() => {
    // Fetch global system settings on mount
    api.getSettings()
      .then((res) => setSettings(res.settings))
      .catch((e) => console.error('Settings load error:', e));

    // Fetch dynamic content on mount
    api.getContent()
      .then((res) => setAppContent(res.content))
      .catch((e) => console.error('Content load error:', e));
  }, []);

  const handleLoginSuccess = (user: UserAuth) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('ebc_current_user', JSON.stringify(user));
    } catch {}
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ebc_current_user');
    } catch {}
    setCurrentView('home');
  };

  const handleStartExamFlow = async () => {
    if (!activeCollaborator) return;
    try {
      const examData = await api.startExam(activeCollaborator.id);
      setActiveExamData({
        attemptId: examData.attemptId,
        questions: examData.questoes,
        tempoMaximoMinutos: examData.tempoMaximoMinutos || settings.tempoMaximoMinutos,
      });
      setCurrentView('exam');
    } catch (err: any) {
      alert(err.message || 'Falha ao iniciar avaliação teórica.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-[#172337]">
      {/* Offline Connectivity Notification Banner */}
      <OfflineIndicator />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        initialMode={loginModalMode}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Top Header - hidden during full-screen exam and admin portal */}
      {currentView !== 'admin' && currentView !== 'exam' && (
        <Header
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          currentUser={currentUser}
          onOpenLogin={handleOpenLogin}
          onLogout={handleLogout}
        />
      )}

      {/* Viewport Router */}
      <div className="flex-1 flex flex-col">
        {/* 1. Homepage */}
        {currentView === 'home' && (
          <HomeView
            onStart={() => {
              setActiveCollaborator(null);
              setCurrentView('identification');
            }}
            onCheckStatus={() => setCurrentView('status-check')}
            onOpenLogin={() => handleOpenLogin('login')}
            content={appContent}
          />
        )}

        {/* 2. Step 1: Identification */}
        {currentView === 'identification' && (
          <IdentificationStep
            onSelected={(colab) => {
              setActiveCollaborator(colab);
              setCurrentView('confirmation');
            }}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {/* 3. Step 2: Data Confirmation */}
        {currentView === 'confirmation' && activeCollaborator && (
          <DataConfirmationStep
            collaborator={activeCollaborator}
            onConfirm={() => setCurrentView('instructions')}
            onBack={() => setCurrentView('identification')}
          />
        )}

        {/* 4. Step 3: Instructions */}
        {currentView === 'instructions' && activeCollaborator && (
          <ExamInstructionsStep
            collaborator={activeCollaborator}
            settings={settings}
            onStart={handleStartExamFlow}
            onBack={() => setCurrentView('confirmation')}
          />
        )}

        {/* 5. Step 4: Theoretical Exam Session */}
        {currentView === 'exam' && activeCollaborator && activeExamData && (
          <ExamSessionStep
            collaborator={activeCollaborator}
            attemptId={activeExamData.attemptId}
            questions={activeExamData.questions}
            tempoMaximoMinutos={activeExamData.tempoMaximoMinutos}
            onCompleted={(res) => {
              setExamResult(res);
              setCurrentView('result');
            }}
            onAbort={() => setCurrentView('home')}
          />
        )}

        {/* 6. Step 5: Result Screen */}
        {currentView === 'result' && activeCollaborator && examResult && (
          <ExamResultStep
            collaborator={activeCollaborator}
            result={examResult}
            onFinish={() => {
              setActiveCollaborator(null);
              setActiveExamData(null);
              setExamResult(null);
              setCurrentView('home');
            }}
            onGoToStatus={() => setCurrentView('status-check')}
          />
        )}

        {/* 7. Status Consultation */}
        {currentView === 'status-check' && (
          <ProcessStatusStep
            onBack={() => setCurrentView('home')}
            onStartExam={() => {
              setActiveCollaborator(null);
              setCurrentView('identification');
            }}
          />
        )}

        {/* 8. Administrative Portal */}
        {currentView === 'admin' && currentUser && (
          <AdminLayout
            currentUser={currentUser}
            currentSection={adminSection}
            onSelectSection={(sec) => setAdminSection(sec)}
            onLogout={handleLogout}
            onExitAdmin={() => setCurrentView('home')}
          >
            {adminSection === 'dashboard' && (
              <DashboardView onNavigate={(sec) => setAdminSection(sec)} />
            )}
            {adminSection === 'collaborators' && <CollaboratorsView />}
            {adminSection === 'users' && <UsersView />}
            {adminSection === 'content' && <ContentView />}
            {adminSection === 'import' && <ImportExcelView />}
            {adminSection === 'questions' && <QuestionBankView />}
            {adminSection === 'practical' && <PracticalAssessmentView />}
            {adminSection === 'instructors' && <InstructorsView />}
            {adminSection === 'reports' && <ReportsView />}
            {adminSection === 'settings' && <SettingsView />}
            {adminSection === 'audit' && <AuditLogsView />}
          </AdminLayout>
        )}
      </div>

      {/* Footer - hidden during full exam and admin views */}
      {currentView !== 'admin' && currentView !== 'exam' && (
        <Footer
          onNavigate={(view) => setCurrentView(view)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      )}
    </div>
  );
}
