import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Car,
  Bike,
  FileCheck2,
  Award,
  Lock,
  Search,
  CheckCircle2,
  Calendar,
  Users,
} from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAComponents.js';

import { AppContent } from '../../types/index.js';

interface HomeViewProps {
  onStart: () => void;
  onCheckStatus: () => void;
  onOpenLogin: () => void;
  content?: AppContent | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStart,
  onCheckStatus,
  onOpenLogin,
  content,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Campaign Banner Announcement if active */}
      {content?.bannerAtivo && content?.bannerTexto && (
        <div className="bg-gradient-to-r from-[#1677FF] to-[#0d5ac7] text-white py-2.5 px-4 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 border-b border-blue-400/30">
          <span className="w-2 h-2 rounded-full bg-[#36D6E7] animate-pulse" />
          <span className="tracking-wide">{content.bannerTexto}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#101C2C] text-white pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#36D6E7] font-medium backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-[#36D6E7]" />
                <span>Programa Oficial de Reavaliação de Condutores</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                {content?.tituloHero || 'Escola do Bom Condutor'}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                {content?.subtituloHero || 'Segurança no trânsito começa com conhecimento, responsabilidade e atitude.'}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                {content?.descricaoHero || 'Central oficial corporativa para reavaliação teórica e prática de condutores envolvidos em acidentes. Autoidentificação simplificada pela base corporativa e direcionamento exclusivo para a categoria do seu veículo.'}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  onClick={onStart}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  <span>INICIAR AVALIAÇÃO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onCheckStatus}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/20 font-semibold text-sm transition flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#36D6E7]" />
                  <span>Consultar Minha Situação</span>
                </button>

                <PWAInstallButton variant="hero" />
              </div>

              {/* Badges strip */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sem necessidade de cadastro prévio</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Correção segura no servidor</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Generated Hero Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl aspect-16/10 lg:aspect-4/3 bg-slate-900">
                <img
                  src="/src/assets/images/hero_defensive_driving_1792071112135.jpg"
                  alt="Direção Defensiva em Frotas Corporativas"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101C2C]/90 via-transparent to-transparent flex items-end p-5">
                  <div className="text-xs text-slate-200 space-y-0.5">
                    <span className="font-bold text-white block">Frotas Seguras & Prevenção Ativa</span>
                    <span className="text-[11px] text-slate-300">Capacitação contínua para preservação de vidas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Two Mandatory Stages Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1677FF]">
            Estrutura do Programa
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#101C2C] tracking-tight">
            Duas Etapas Obrigatórias de Avaliação
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            O processo de reavaliação garante a reciclagem teórica e a validação prática das condutas operacionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stage 1 Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677FF] border border-blue-200 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <span className="text-xs font-bold text-[#1677FF] uppercase tracking-wider">
                  Primeira Etapa
                </span>
                <h3 className="text-lg font-bold text-[#101C2C] mt-0.5">
                  Prova Teórica por Categoria
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Avaliação digital com questões específicas de acordo com o veículo de operação do colaborador:
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[#1677FF]" />
                    <span>Carro / Caminhonete</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Aquaplanagem, distância de seguimento, freios ABS e pontos cegos.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-[#1677FF]" />
                    <span>Motocicleta</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Frenagem combinada 70/30, EPIs, piso molhado e contra-esterço.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>5 alternativas por questão (A a E)</span>
              <span className="font-bold text-slate-700">Nota mínima: 70%</span>
            </div>
          </div>

          {/* Stage 2 Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Segunda Etapa
                </span>
                <h3 className="text-lg font-bold text-[#101C2C] mt-0.5">
                  Avaliação Prática em Veículo
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conduzida presencialmente por um instrutor de trânsito credenciado em rota operacional:
              </p>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Inspeção pré-operacional 360° e verificação de fluidos/pneus</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Ajustes ergonômicos, postura ao volante/guidão e uso de EPIs</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Controle de embreagem, marcha à ré, baliza e condução defensiva</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Laudo oficial homologado pelo instrutor</span>
              <span className="font-bold text-emerald-700">Certificação final</span>
            </div>
          </div>
        </div>
      </section>

      {/* Practical Inspection Visual Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#101C2C] text-white rounded-3xl overflow-hidden shadow-xl border border-white/10 grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-5 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#36D6E7]">
              Responsabilidade & Integridade
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Acompanhamento Integral dos Condutores
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              O sistema centraliza todo o fluxo de capacitação corporativa: da identificação inteligente por planilha Excel à consolidação dos laudos práticos. Todos os registros são mantidos com rastreabilidade auditável e em conformidade estrita com a LGPD.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onStart}
                className="px-6 py-3 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white font-bold text-xs transition cursor-pointer"
              >
                Iniciar Avaliação Agora
              </button>
              <button
                onClick={onOpenLogin}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 font-semibold text-xs transition cursor-pointer"
              >
                Painel do Instrutor / Gestor
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-4/3 lg:aspect-auto">
            <img
              src="/src/assets/images/practical_inspection_1792071111559.jpg"
              alt="Avaliação Prática com Instrutor de Trânsito"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
