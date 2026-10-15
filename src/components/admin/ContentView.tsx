import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { AppContent } from '../../types/index.js';
import {
  FileEdit,
  Save,
  CheckCircle2,
  Eye,
  Megaphone,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const ContentView: React.FC = () => {
  const [content, setContent] = useState<AppContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const data = await api.getContent();
      setContent(data.content);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await api.updateContent(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar conteúdo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !content) {
    return <div className="py-12 text-center text-xs text-slate-500">Carregando conteúdo...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Gestão do Conteúdo Principal do Aplicativo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalize os títulos institucionais, avisos, banners de campanhas de segurança e canais de contato.
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Conteúdo publicado com sucesso!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Main Hero texts */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileEdit className="w-4 h-4 text-[#1677FF]" />
              <h2 className="text-sm font-bold text-[#101C2C]">
                Títulos e Descrição da Página Inicial (Hero)
              </h2>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Título Principal da Aplicação *
              </label>
              <input
                type="text"
                required
                value={content.tituloHero}
                onChange={(e) => setContent({ ...content, tituloHero: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subtítulo Institucional *
              </label>
              <input
                type="text"
                required
                value={content.subtituloHero}
                onChange={(e) => setContent({ ...content, subtituloHero: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Descrição do Programa
              </label>
              <textarea
                rows={3}
                value={content.descricaoHero}
                onChange={(e) => setContent({ ...content, descricaoHero: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aviso Institucional de Validade Corporativa
              </label>
              <textarea
                rows={2}
                value={content.avisoGeral}
                onChange={(e) => setContent({ ...content, avisoGeral: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Campaign Banner Announcement */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#36D6E7]" />
                <h2 className="text-sm font-bold text-[#101C2C]">
                  Banner de Campanha de Trânsito
                </h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={content.bannerAtivo}
                  onChange={(e) => setContent({ ...content, bannerAtivo: e.target.checked })}
                  className="w-4 h-4 text-[#1677FF] rounded-sm border-slate-300"
                />
                <span className="font-semibold text-slate-700">Exibir Banner no Topo</span>
              </label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Texto do Comunicado / Campanha
              </label>
              <input
                type="text"
                value={content.bannerTexto}
                onChange={(e) => setContent({ ...content, bannerTexto: e.target.value })}
                placeholder="Ex.: Campanha Maio Amarelo: Respeite a vida no trânsito."
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Contact and Support */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#101C2C] pb-3 border-b border-slate-100">
              Canais de Contato e Suporte ao Condutor
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail de Suporte</label>
                <input
                  type="email"
                  value={content.contatoSuporteEmail}
                  onChange={(e) => setContent({ ...content, contatoSuporteEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefone / Ramal</label>
                <input
                  type="text"
                  value={content.contatoSuporteTelefone}
                  onChange={(e) => setContent({ ...content, contatoSuporteTelefone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer disabled:bg-slate-300"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Publicando...' : 'Salvar e Publicar Conteúdo'}</span>
            </button>
          </div>
        </form>

        {/* Live Preview Pane */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-[#1677FF]" />
            <span>Prévia em Tempo Real (Página Inicial)</span>
          </div>

          <div className="bg-[#101C2C] text-white rounded-2xl p-6 shadow-md border border-white/10 space-y-4">
            {content.bannerAtivo && content.bannerTexto && (
              <div className="bg-[#1677FF] text-white text-[11px] p-2 rounded-lg font-medium flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-[#36D6E7] shrink-0" />
                <span className="truncate">{content.bannerTexto}</span>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#36D6E7] tracking-wider block">
                Visualização do Hero
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
                {content.tituloHero || 'Escola do Bom Condutor'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {content.subtituloHero}
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {content.descricaoHero}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 text-[10px] text-slate-400 flex flex-col gap-1">
              <span>Suporte: {content.contatoSuporteEmail}</span>
              <span>Contato: {content.contatoSuporteTelefone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
