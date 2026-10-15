import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { Collaborator } from '../../types/index.js';
import {
  Search,
  User,
  Building2,
  Briefcase,
  Layers,
  Car,
  Bike,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface IdentificationStepProps {
  onSelected: (colaborador: Collaborator) => void;
  onCancel: () => void;
}

export const IdentificationStep: React.FC<IdentificationStepProps> = ({
  onSelected,
  onCancel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionText, setCorrectionText] = useState('');
  const [correctionSent, setCorrectionSent] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const data = await api.searchCollaborators(searchTerm);
        setSuggestions(data.results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  const handleSelect = (colab: Collaborator) => {
    setSelectedCollaborator(colab);
    setSearchTerm(colab.nome);
    setSuggestions([]);
  };

  const handleProceed = () => {
    if (selectedCollaborator) {
      onSelected(selectedCollaborator);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="text-center mb-8">
        <span className="text-xs font-semibold text-[#1677FF] uppercase tracking-wider block mb-1">
          Etapa 1 de 4 · Identificação Corporativa
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#101C2C] tracking-tight">
          Identificação do Colaborador
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
          Digite parte do seu nome completo para que o sistema localize seu registro na base oficial de colaboradores convocados.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Search input with debounce */}
        <div>
          <label htmlFor="colab-search-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Nome do Colaborador ou Matrícula
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="colab-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedCollaborator && e.target.value !== selectedCollaborator.nome) {
                  setSelectedCollaborator(null);
                }
              }}
              placeholder="Ex.: Francisco Antônio ou número da matrícula..."
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 transition bg-slate-50/50 hover:bg-white"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCollaborator(null);
                  setSuggestions([]);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
            <span>Dica: Digite pelo menos 2 letras do seu primeiro ou segundo nome</span>
            <button
              onClick={() => setShowNotFoundModal(true)}
              className="text-[#1677FF] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Não encontrou seu cadastro?</span>
            </button>
          </div>
        </div>

        {/* Suggestions dropdown / list */}
        {isLoading && (
          <div className="py-6 text-center text-sm text-slate-500">
            <div className="inline-block w-5 h-5 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Consultando base de condutores...</p>
          </div>
        )}

        {!isLoading && !selectedCollaborator && suggestions.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm bg-white">
            <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
              Selecione seu registro ({suggestions.length} encontrados):
            </div>
            {suggestions.map((colab) => (
              <button
                key={colab.id}
                onClick={() => handleSelect(colab)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50/60 transition flex items-center justify-between gap-4 group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-sm text-[#101C2C] group-hover:text-[#1677FF] transition-colors">
                    {colab.nome}
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                    {colab.matricula && (
                      <span className="font-mono text-slate-600">Matrícula: {colab.matricula}</span>
                    )}
                    <span>·</span>
                    <span className="font-medium text-slate-700">{colab.base}</span>
                    <span>·</span>
                    <span>{colab.funcao}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 group-hover:bg-[#1677FF] group-hover:text-white transition-colors">
                    {colab.tipoVeiculo}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1677FF] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {!isLoading && hasSearched && suggestions.length === 0 && !selectedCollaborator && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Nenhum registro correspondente localizado.</p>
              <p className="text-xs text-amber-800 mt-1">
                Verifique a grafia do seu nome ou informe a matrícula. Se você esteve envolvido em ocorrência recente e ainda não foi cadastrado na base oficial, solicite a inclusão junto à gerência responsável ou ao gestor do programa.
              </p>
              <button
                onClick={() => setShowNotFoundModal(true)}
                className="mt-2 text-xs font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
              >
                Orientação para solicitação de cadastro
              </button>
            </div>
          </div>
        )}

        {/* Selected Collaborator Display - Automatic Profile Loading */}
        {selectedCollaborator && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Colaborador Identificado com Sucesso
                </span>
              </div>
              <button
                onClick={() => setSelectedCollaborator(null)}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Trocar registro
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Nome Completo:</span>
                <span className="text-sm font-bold text-[#101C2C] block mt-0.5">
                  {selectedCollaborator.nome}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Matrícula:</span>
                <span className="text-sm font-mono font-semibold text-slate-800 block mt-0.5">
                  {selectedCollaborator.matricula || 'Não informada'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Base Operacional:</span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                  {selectedCollaborator.base}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Cargo / Função:</span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                  {selectedCollaborator.funcao}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Gerência:</span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                  {selectedCollaborator.gerencia}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Categoria da Avaliação:</span>
                <span className="text-sm font-bold text-[#1677FF] flex items-center gap-1.5 mt-0.5">
                  {selectedCollaborator.tipoVeiculo === 'Motocicleta' ? (
                    <Bike className="w-4 h-4" />
                  ) : (
                    <Car className="w-4 h-4" />
                  )}
                  <span>{selectedCollaborator.tipoVeiculo}</span>
                </span>
              </div>
            </div>

            {/* Inability to edit official records directly by collaborator */}
            <div className="pt-3 border-t border-emerald-100/60 flex items-center justify-between text-xs text-slate-500">
              <span>* Dados obtidos da base corporativa oficial.</span>
              <button
                onClick={() => setShowCorrectionModal(true)}
                className="text-[#1677FF] hover:underline font-medium cursor-pointer"
              >
                Solicitar retificação de dados
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Voltar ao Início
          </button>

          <button
            onClick={handleProceed}
            disabled={!selectedCollaborator}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-sm ${
              selectedCollaborator
                ? 'bg-[#1677FF] hover:bg-[#1677FF]/90 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <span>Confirmar e Prosseguir</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal: Request Correction */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101C2C]">Solicitar Retificação Cadastral</h3>
              <button
                onClick={() => {
                  setShowCorrectionModal(false);
                  setCorrectionSent(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {correctionSent ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-800">Solicitação Registrada</p>
                <p className="text-xs text-slate-600">
                  O responsável pelo programa foi notificado para validar as alterações solicitadas.
                </p>
                <button
                  onClick={() => {
                    setShowCorrectionModal(false);
                    setCorrectionSent(false);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#101C2C] text-white text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-slate-600">
                  Caso sua base, função ou categoria de veículo estejam desatualizados na base oficial, informe abaixo o ajuste necessário:
                </p>
                <textarea
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  placeholder="Ex.: Mudança de base de Bacabal para Pedreiras, ou troca de veículo de Carro para Motocicleta..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1677FF]/20 focus:border-[#1677FF]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowCorrectionModal(false)}
                    className="px-4 py-2 text-xs text-slate-600 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (correctionText.trim()) {
                        setCorrectionSent(true);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1677FF] text-white text-xs font-semibold hover:bg-[#1677FF]/90"
                  >
                    Enviar Solicitação
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Cadastro Não Encontrado */}
      {showNotFoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101C2C]">Condutor Não Cadastrado</h3>
              <button
                onClick={() => setShowNotFoundModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                A <strong>Escola do Bom Condutor</strong> opera sob base corporativa prévia. Se o seu nome não aparece nas sugestões:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verifique se o seu nome está sendo digitado conforme registrado na admissão (sem apelidos).</li>
                <li>Tente pesquisar apenas pelo número da sua matrícula funcional.</li>
                <li>Caso a ocorrência de trânsito tenha ocorrido recentemente, a planilha de convocação pode estar em processo de importação pela gestão.</li>
                <li>Entre em contato com o <strong>Gestor de Frotas e Segurança Viária</strong> da sua regional para solicitar a inclusão cadastral.</li>
              </ul>
            </div>
            <button
              onClick={() => setShowNotFoundModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#101C2C] text-white text-xs font-semibold"
            >
              Compreendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
