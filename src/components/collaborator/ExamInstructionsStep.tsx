import React from 'react';
import { Collaborator, SystemSettings } from '../../types/index.js';
import {
  Clock,
  Award,
  HelpCircle,
  AlertTriangle,
  Play,
  ArrowLeft,
  CheckCircle2,
  ListOrdered,
  Eye,
} from 'lucide-react';

interface ExamInstructionsStepProps {
  collaborator: Collaborator;
  settings: SystemSettings;
  onStart: () => void;
  onBack: () => void;
}

export const ExamInstructionsStep: React.FC<ExamInstructionsStepProps> = ({
  collaborator,
  settings,
  onStart,
  onBack,
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-xs font-semibold text-[#1677FF] uppercase tracking-wider block mb-1">
          Etapa 3 de 4 · Orientações Oficiais
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#101C2C] tracking-tight">
          Instruções da Prova Teórica
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Leia atentamente as diretrizes antes de iniciar o cronômetro da sua avaliação.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Rules summary strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-center">
            <span className="text-slate-500 text-xs block mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#1677FF]" />
              Duração
            </span>
            <span className="text-lg font-bold font-mono text-[#101C2C] block">
              {settings.tempoMaximoMinutos} min
            </span>
            <span className="text-[10px] text-slate-400">Cronômetro ativo</span>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-center">
            <span className="text-slate-500 text-xs block mb-1 flex items-center justify-center gap-1">
              <ListOrdered className="w-3.5 h-3.5 text-[#1677FF]" />
              Questões
            </span>
            <span className="text-lg font-bold font-mono text-[#101C2C] block">
              {settings.quantidadeQuestoesTeorica} itens
            </span>
            <span className="text-[10px] text-slate-400">Alternativas A a E</span>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-center">
            <span className="text-slate-500 text-xs block mb-1 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Aprovação
            </span>
            <span className="text-lg font-bold font-mono text-emerald-600 block">
              ≥ {settings.notaMinimaTeorica}%
            </span>
            <span className="text-[10px] text-slate-400">Nota mínima</span>
          </div>
        </div>

        {/* Detailed Guidelines list */}
        <div className="space-y-3.5 text-xs text-slate-700">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <p className="leading-relaxed">
              <strong>Formato das questões:</strong> Cada questão apresenta 5 alternativas identificadas pelas letras <strong>A, B, C, D e E</strong>. Apenas uma alternativa é rigorosamente correta.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <p className="leading-relaxed">
              <strong>Navegação e Revisão:</strong> Você pode avançar e retroceder livremente entre as questões utilizando os botões <em>Anterior</em> e <em>Próxima</em>, ou abrir a grade de revisão antes do envio definitivo.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <p className="leading-relaxed">
              <strong>Correção no Servidor:</strong> O gabarito não fica gravado no navegador. Ao clicar em <em>Finalizar Avaliação</em>, suas respostas serão enviadas de forma segura ao servidor corporativo para cômputo imediato do aproveitamento.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </span>
            <p className="leading-relaxed">
              <strong>Segunda Etapa (Prática):</strong> A conclusão da prova teórica com aproveitamento igual ou superior a {settings.notaMinimaTeorica}% libera a etapa seguinte com o instrutor credenciado.
            </p>
          </div>
        </div>

        {/* Warning callout */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Atenção ao Iniciar</span>
            <span>
              Ao clicar no botão abaixo, o cronômetro oficial de {settings.tempoMaximoMinutos} minutos será disparado. Certifique-se de estar em ambiente tranquilo e com conexão estável.
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <button
            onClick={onStart}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#1677FF] hover:bg-[#1677FF]/90 transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>INICIAR PROVA TEÓRICA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
