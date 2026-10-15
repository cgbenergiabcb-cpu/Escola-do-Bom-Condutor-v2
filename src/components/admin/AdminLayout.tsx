import React, { useState } from 'react';
import { UserAuth } from '../../types/index.js';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  HelpCircle,
  FileCheck2,
  GraduationCap,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  UserCog,
  FileEdit,
} from 'lucide-react';

interface AdminLayoutProps {
  currentUser: UserAuth;
  currentSection: string;
  onSelectSection: (section: string) => void;
  onLogout: () => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  currentSection,
  onSelectSection,
  onLogout,
  onExitAdmin,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define authorized menus based on role
  // Instrutor can access Dashboard, Colaboradores, Avaliações Práticas, Relatórios
  const isInstructor = currentUser.perfil === 'Instrutor';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'collaborators', label: 'Colaboradores', icon: Users },
    ...(!isInstructor
      ? [{ id: 'users', label: 'Gestão de Usuários', icon: UserCog }]
      : []),
    ...(!isInstructor
      ? [{ id: 'content', label: 'Conteúdo do App', icon: FileEdit }]
      : []),
    ...(!isInstructor
      ? [{ id: 'import', label: 'Importação de Excel', icon: FileSpreadsheet }]
      : []),
    ...(!isInstructor
      ? [{ id: 'questions', label: 'Banco de Questões', icon: HelpCircle }]
      : []),
    { id: 'practical', label: 'Avaliações Práticas', icon: FileCheck2 },
    ...(!isInstructor
      ? [{ id: 'instructors', label: 'Instrutores', icon: GraduationCap }]
      : []),
    { id: 'reports', label: 'Relatórios & Exportações', icon: BarChart3 },
    ...(!isInstructor
      ? [{ id: 'settings', label: 'Configurações', icon: Settings }]
      : []),
    ...(!isInstructor
      ? [{ id: 'audit', label: 'Auditoria LGPD', icon: ShieldAlert }]
      : []),
  ];

  const currentItem = navItems.find((n) => n.id === currentSection);

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#101C2C] text-slate-300 border-r border-white/10 shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1677FF] flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-sm font-bold text-white block truncate leading-tight">
              Escola do Bom Condutor
            </span>
            <span className="text-[10px] text-slate-400 block tracking-wider uppercase mt-0.5">
              Portal Administrativo
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-xs font-semibold text-white truncate">{currentUser.nome}</div>
          <div className="text-[11px] text-[#36D6E7] font-medium flex items-center gap-1.5 mt-0.5">
            <span>{currentUser.perfil}</span>
            {currentUser.base && <span>· {currentUser.base}</span>}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#1677FF] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <span>Ir para Área Pública</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header / Breadcrumb */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="hidden sm:inline">Gestão Corporativa</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
              <span className="font-bold text-[#101C2C] text-sm">
                {currentItem?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Servidor Online & Conectado</span>
            </div>
            <button
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Visão Pública
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Modal */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-[#101C2C] text-white flex flex-col z-10 p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-sm">Menu Administrativo</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-[#1677FF] text-white' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
