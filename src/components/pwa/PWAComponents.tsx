import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../../hooks/usePWA.js';
import { Download, Smartphone, X, WifiOff, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'hero' | 'footer' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    if (variant === 'hero') {
      return (
        <button
          onClick={install}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-sm transition shadow-sm backdrop-blur-md cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#36D6E7]" />
          <span>Instalar Aplicativo (PWA)</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1677FF] hover:bg-[#1677FF]/90 text-white font-medium text-xs transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-2 rounded-lg font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
            variant === 'hero'
              ? 'px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm'
              : 'px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#101C2C] flex items-center justify-center text-[#36D6E7]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-[#101C2C]">Instalar no iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1677FF] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    No navegador Safari, toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima na barra inferior).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1677FF] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Role a lista e selecione <strong>Adicionar à Tela de Início</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1677FF] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Toque em <strong>Adicionar</strong> no canto superior direito para acessar o aplicativo diretamente.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-[#101C2C] py-2.5 text-sm font-medium text-white hover:bg-[#101C2C]/90 transition"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside aria-label="Aviso de conexão" className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Modo Offline — O envio oficial de avaliações requer restabelecimento de conexão.</span>
    </aside>
  );
};
