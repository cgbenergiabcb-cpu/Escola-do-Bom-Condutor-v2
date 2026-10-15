import React from 'react';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLogin }) => {
  return (
    <footer className="bg-[#101C2C] text-slate-400 text-xs border-t border-white/10 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#1677FF] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">Escola do Bom Condutor</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Programa corporativo obrigatório de reavaliação teórica e prática para colaboradores envolvidos em ocorrências de trânsito. Foco em direção defensiva, respeito às vidas e preservação de frotas operacionais.
            </p>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>Em conformidade com a LGPD</span>
              <span>·</span>
              <span>Código de Trânsito Brasileiro (CTB)</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <span className="text-xs font-semibold text-slate-200 block mb-3 uppercase tracking-wider">
              Acesso Rápido
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('identification')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Iniciar Avaliação Teórica
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('status-check')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Consultar Andamento
                </button>
              </li>
            </ul>
          </div>

          {/* Administration & Institutional */}
          <div>
            <span className="text-xs font-semibold text-slate-200 block mb-3 uppercase tracking-wider">
              Gestão & Instrutores
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenLogin}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-[#36D6E7]" />
                  <span>Painel Administrativo</span>
                </button>
              </li>
              <li>
                <span className="text-slate-500">Avaliações Práticas em Pista</span>
              </li>
              <li>
                <span className="text-slate-500">Auditoria & Indicadores</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Escola do Bom Condutor. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span>Privacidade & Tratamento de Dados</span>
            <span>·</span>
            <span>Suporte de TI & Frotas</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
