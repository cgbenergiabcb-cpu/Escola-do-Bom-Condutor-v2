import React from 'react';
import { Collaborator, TheoreticalAttempt } from '../../types/index.js';
import {
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Calendar,
  FileCheck2,
  AlertCircle,
  Home,
  Clock,
} from 'lucide-react';

interface ExamResultStepProps {
  collaborator: Collaborator;
  result: {
    attempt: TheoreticalAttempt;
    message: string;
  };
  onFinish: () => void;
  onGoToStatus: () => void;
}

export const ExamResultStep: React.FC<ExamResultStepProps> = ({
  collaborator,
  result,
  onFinish,
  onGoToStatus,
}) => {
  const { attempt } = result;
  const isApproved = attempt.aprovado;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Result Header Badge */}
        <div className="text-center space-y-2">
          {isApproved ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-sm">
              <XCircle className="w-9 h-9" />
            </div>
          )}

          <span
            className={`text-xs font-bold uppercase tracking-wider block ${
              isApproved ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isApproved ? 'Etapa Teórica Aprovada' : 'Aproveitamento Insuficiente'}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#101C2C] tracking-tight">
            {isApproved ? 'Parabéns, Condutor!' : 'Resultado da Prova Teórica'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {result.message}
          </p>
        </div>

        {/* Score & Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 block mb-0.5">Aproveitamento</span>
            <span
              className={`text-xl font-bold font-mono tabular-nums block ${
                isApproved ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {attempt.percentualAproveitamento}%
            </span>
            <span className="text-[10px] text-slate-400">
              Mínimo: {attempt.notaFinal ? 70 : 70}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 block mb-0.5">Acertos</span>
            <span className="text-xl font-bold font-mono text-emerald-600 block">
              {attempt.respostasCorretas}
            </span>
            <span className="text-[10px] text-slate-400">
              de {attempt.totalQuestoes} questões
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 block mb-0.5">Incorretas</span>
            <span className="text-xl font-bold font-mono text-rose-500 block">
              {attempt.respostasIncorretas}
            </span>
            <span className="text-[10px] text-slate-400">questões</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 block mb-0.5">Duração</span>
            <span className="text-xl font-bold font-mono text-[#101C2C] block">
              {Math.round((attempt.duracaoSegundos || 60) / 60)} min
            </span>
            <span className="text-[10px] text-slate-400">tempo total</span>
          </div>
        </div>

        {/* Next Stage Instructions */}
        {isApproved ? (
          <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Próximo Passo: Avaliação Prática em Veículo</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Sua aprovação teórica foi registrada com sucesso na base corporativa. Você está apto para realizar a <strong>Avaliação Prática de Direção Defensiva</strong> com um instrutor credenciado na sua base operacional ({collaborator.base}).
            </p>
            <div className="text-[11px] text-emerald-800 bg-white/70 p-3 rounded-lg border border-emerald-200/60 space-y-1">
              <p className="font-semibold">O que levar no dia do teste prático:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>CNH válida compatível com a categoria ({collaborator.tipoVeiculo}).</li>
                <li>EPIs obrigatórios para condução (calçado adequado, cinto/capacete regulamentar).</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wide">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Diretrizes para Nova Tentativa</span>
            </div>
            <p className="text-xs text-rose-950 leading-relaxed">
              O aproveitamento mínimo exigido pela política de segurança da empresa é de 70%. Conforme as regras da Escola do Bom Condutor, procure a gestão de frotas da sua regional para revisão de conteúdo e agendamento de nova oportunidade.
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onFinish}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Voltar à Página Inicial</span>
          </button>

          <button
            onClick={onGoToStatus}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#101C2C] hover:bg-[#101C2C]/90 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-[#36D6E7]" />
            <span>Acompanhar Histórico do Processo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
