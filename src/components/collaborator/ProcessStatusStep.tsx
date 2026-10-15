import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { Collaborator, TheoreticalAttempt, PracticalAssessment } from '../../types/index.js';
import {
  Search,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  Car,
  Bike,
  ShieldCheck,
  ChevronRight,
  FileText,
  Printer,
  Calendar,
} from 'lucide-react';

interface ProcessStatusStepProps {
  onBack: () => void;
  onStartExam: () => void;
}

export const ProcessStatusStep: React.FC<ProcessStatusStepProps> = ({
  onBack,
  onStartExam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [attempts, setAttempts] = useState<TheoreticalAttempt[]>([]);
  const [practicalAssessments, setPracticalAssessments] = useState<PracticalAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setCollaborator(null);

    try {
      const searchRes = await api.searchCollaborators(searchTerm);
      if (searchRes.results.length === 0) {
        setErrorMsg('Colaborador não localizado com o nome ou matrícula informada.');
        setIsLoading(false);
        return;
      }

      // Load full details for first match
      const colab = searchRes.results[0];
      const details = await api.getCollaborator(colab.id);
      setCollaborator(details.collaborator);
      setAttempts(details.attempts);
      setPracticalAssessments(details.practicalAssessments);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao consultar base.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-semibold text-[#1677FF] uppercase tracking-wider block mb-1">
          Autoatendimento do Condutor
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#101C2C] tracking-tight">
          Consultar Situação do Processo
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
          Acompanhe o andamento das etapas teórica e prática e visualize a situação consolidada da sua reavaliação.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite seu nome completo ou número de matrícula..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 transition"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:bg-slate-300 shrink-0"
          >
            {isLoading ? 'Consultando...' : 'Consultar'}
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-600 mt-3 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </p>
        )}
      </form>

      {/* Results View */}
      {collaborator && (
        <div className="space-y-6">
          {/* Main Status Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Matrícula: {collaborator.matricula || 'S/N'}
                </span>
                <h2 className="text-xl font-bold text-[#101C2C] mt-0.5">
                  {collaborator.nome}
                </h2>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                  <span>{collaborator.base}</span>
                  <span>·</span>
                  <span>{collaborator.funcao}</span>
                  <span>·</span>
                  <span className="font-semibold text-[#1677FF] flex items-center gap-1">
                    {collaborator.tipoVeiculo === 'Motocicleta' ? (
                      <Bike className="w-3.5 h-3.5" />
                    ) : (
                      <Car className="w-3.5 h-3.5" />
                    )}
                    {collaborator.tipoVeiculo}
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border ${
                    collaborator.statusGeral === 'Processo concluído com aprovação'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : collaborator.statusGeral.includes('Reprovado')
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{collaborator.statusGeral}</span>
                </span>
              </div>
            </div>

            {/* Stages timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stage 1: Theoretical */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    1ª Etapa · Prova Teórica
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      collaborator.statusTeorico === 'Aprovado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : collaborator.statusTeorico === 'Reprovado'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {collaborator.statusTeorico}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <strong>Nota final:</strong>{' '}
                    <span className="font-mono font-bold text-slate-800">
                      {collaborator.notaTeorica !== undefined ? `${collaborator.notaTeorica}%` : 'Não realizada'}
                    </span>
                  </p>
                  <p>
                    <strong>Tentativas registradas:</strong> {collaborator.tentativasTeoricasCount}
                  </p>
                </div>

                {collaborator.statusTeorico === 'Pendente' && (
                  <button
                    onClick={onStartExam}
                    className="w-full mt-2 py-2 rounded-lg bg-[#1677FF] hover:bg-[#1677FF]/90 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Realizar Prova Teórica Agora
                  </button>
                )}
              </div>

              {/* Stage 2: Practical */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    2ª Etapa · Avaliação Prática
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      collaborator.statusPratico === 'Aprovado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : collaborator.statusPratico === 'Reprovado'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {collaborator.statusPratico}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <strong>Instrutor responsável:</strong>{' '}
                    {collaborator.instrutorPraticoNome || 'Aguardando agendamento'}
                  </p>
                  <p>
                    <strong>Aproveitamento prático:</strong>{' '}
                    <span className="font-mono font-bold text-slate-800">
                      {collaborator.notaPratica !== undefined ? `${collaborator.notaPratica}%` : 'Pendente'}
                    </span>
                  </p>
                </div>

                {collaborator.statusTeorico === 'Aprovado' && collaborator.statusPratico !== 'Aprovado' && (
                  <div className="text-[11px] text-[#1677FF] bg-blue-50 p-2.5 rounded-lg border border-blue-200 font-medium">
                    Apto para a realização da prova prática em veículo com o instrutor credenciado.
                  </div>
                )}
              </div>
            </div>

            {/* Official Certificate / Conclusion Box */}
            {collaborator.statusGeral === 'Processo concluído com aprovação' && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                      Certificado de Reavaliação Concluído
                    </span>
                    <span className="text-xs text-emerald-800 block mt-0.5">
                      Processo homologado com aprovação nas avaliações teórica e prática.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-100/50 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Comprovante</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Back to Home Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
        >
          Voltar para a Página Inicial
        </button>
      </div>
    </div>
  );
};
