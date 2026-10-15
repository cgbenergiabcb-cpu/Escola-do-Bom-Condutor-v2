import React from 'react';
import { ShieldCheck, UserCheck, Lock, LogIn, UserPlus } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAComponents.js';
import { UserAuth } from '../../types/index.js';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: UserAuth | null;
  onOpenLogin: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#101C2C] text-white border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
        >
          <div className="w-9 h-9 rounded-lg bg-[#1677FF] flex items-center justify-center text-white shadow-md group-hover:bg-[#36D6E7] group-hover:text-[#101C2C] transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block leading-none">
              Escola do Bom Condutor
            </span>
            <span className="text-[11px] text-slate-400 font-normal block tracking-wide mt-1">
              Programa Corporativo de Segurança Viária
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`cursor-pointer whitespace-nowrap transition-colors hover:text-white ${
              currentView === 'home' ? 'text-[#36D6E7] font-semibold' : ''
            }`}
          >
            Início
          </button>
          <button
            onClick={() => onNavigate('identification')}
            className={`cursor-pointer whitespace-nowrap transition-colors hover:text-white ${
              currentView === 'identification' || currentView === 'exam'
                ? 'text-[#36D6E7] font-semibold'
                : ''
            }`}
          >
            Realizar Avaliação
          </button>
          <button
            onClick={() => onNavigate('status-check')}
            className={`cursor-pointer whitespace-nowrap transition-colors hover:text-white ${
              currentView === 'status-check' ? 'text-[#36D6E7] font-semibold' : ''
            }`}
          >
            Consultar Situação
          </button>
          {currentUser && (
            <button
              onClick={() => onNavigate('admin')}
              className={`cursor-pointer whitespace-nowrap transition-colors hover:text-white ${
                currentView === 'admin' ? 'text-[#36D6E7] font-semibold' : ''
              }`}
            >
              Painel de Gestão
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action & Install Button */}
        <div className="flex items-center gap-3 shrink-0">
          <PWAInstallButton variant="header" />

          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('admin')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium border border-white/10 transition cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#36D6E7]" />
                <span className="truncate max-w-[120px]">{currentUser.nome.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400">({currentUser.perfil})</span>
              </button>
              <button
                onClick={onLogout}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium transition cursor-pointer px-2 py-1"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenLogin('login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 text-xs font-semibold transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#36D6E7]" />
                <span>Entrar</span>
              </button>
              <button
                onClick={() => onOpenLogin('register')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1677FF] hover:bg-[#1677FF]/90 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Cadastre-se</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
