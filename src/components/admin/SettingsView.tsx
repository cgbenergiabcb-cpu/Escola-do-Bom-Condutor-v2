import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { SystemSettings } from '../../types/index.js';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Clock,
  Award,
  Layers,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data.settings);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await api.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="py-12 text-center text-xs text-slate-500">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Parâmetros & Regras do Programa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Definição de notas de corte, tempo limite de prova, tentativas e diretrizes operacionais.
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Configurações salvas no servidor!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theoretical Exam Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-[#1677FF]" />
            <h2 className="text-sm font-bold text-[#101C2C]">
              Parâmetros da Avaliação Teórica
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nota Mínima para Aprovação Teórica (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={settings.notaMinimaTeorica}
                onChange={(e) =>
                  setSettings({ ...settings, notaMinimaTeorica: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Padrão corporativo sugerido: 70% de acertos
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantidade de Questões por Prova
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={settings.quantidadeQuestoesTeorica}
                onChange={(e) =>
                  setSettings({ ...settings, quantidadeQuestoesTeorica: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Itens sorteados da categoria correspondente (Carro ou Moto)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Duração Máxima da Prova (Minutos)
              </label>
              <input
                type="number"
                min={10}
                max={180}
                value={settings.tempoMaximoMinutos}
                onChange={(e) =>
                  setSettings({ ...settings, tempoMaximoMinutos: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Cronômetro regressivo na tela do condutor
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Número Máximo de Tentativas Permitidas
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={settings.maxTentativasTeorica}
                onChange={(e) =>
                  setSettings({ ...settings, maxTentativasTeorica: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Após este limite, o condutor necessita de autorização administrativa
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.ordemAleatoriaQuestoes}
                onChange={(e) =>
                  setSettings({ ...settings, ordemAleatoriaQuestoes: e.target.checked })
                }
                className="w-4 h-4 rounded-sm text-[#1677FF] border-slate-300"
              />
              <span className="font-medium text-slate-700">
                Sortear ordem aleatória das questões para cada tentativa
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.ordemAleatoriaAlternativas}
                onChange={(e) =>
                  setSettings({ ...settings, ordemAleatoriaAlternativas: e.target.checked })
                }
                className="w-4 h-4 rounded-sm text-[#1677FF] border-slate-300"
              />
              <span className="font-medium text-slate-700">
                Embaralhar a ordem das alternativas (A, B, C, D, E) a cada exibição
              </span>
            </label>
          </div>
        </div>

        {/* Practical Exam Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-[#101C2C]">
              Parâmetros da Avaliação Prática
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aproveitamento Mínimo Prático Exigido (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={settings.notaMinimaPratica}
                onChange={(e) =>
                  setSettings({ ...settings, notaMinimaPratica: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.permitirPraticaSemAprovacaoTeorica}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      permitirPraticaSemAprovacaoTeorica: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded-sm text-[#1677FF] border-slate-300"
                />
                <span className="font-medium text-slate-700">
                  Permitir realização da prova prática antes da aprovação teórica
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Official Warnings & Homologation Mode */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-[#101C2C]">
              Modo de Operação e Mensagem Institucional
            </h2>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Aviso Institucional exibido ao Condutor na Identificação:
            </label>
            <textarea
              rows={2}
              value={settings.mensagemAvisoOficial}
              onChange={(e) =>
                setSettings({ ...settings, mensagemAvisoOficial: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="homolog-toggle"
              checked={settings.modoHomologacao}
              onChange={(e) =>
                setSettings({ ...settings, modoHomologacao: e.target.checked })
              }
              className="w-4 h-4 rounded-sm text-amber-600 border-amber-300 mt-0.5 cursor-pointer"
            />
            <label htmlFor="homolog-toggle" className="cursor-pointer select-none">
              <span className="font-bold block">Modo Homologação Ativo</span>
              <span className="text-[11px] leading-relaxed">
                Permite a realização de provas com conjunto de validação técnica enquanto as alternativas oficiais do formulário Google e da planilha passam por aprovação final da diretoria corporativa.
              </span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer disabled:bg-slate-300"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando Parâmetros...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
