import React, { useState } from 'react';
import { Collaborator } from '../../types/index.js';
import {
  ShieldAlert,
  Car,
  Bike,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface DataConfirmationStepProps {
  collaborator: Collaborator;
  onConfirm: () => void;
  onBack: () => void;
}

export const DataConfirmationStep: React.FC<DataConfirmationStepProps> = ({
  collaborator,
  onConfirm,
  onBack,
}) => {
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-xs font-semibold text-[#1677FF] uppercase tracking-wider block mb-1">
          Etapa 2 de 4 · Conferência de Dados
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#101C2C] tracking-tight">
          Confirmação do Perfil de Avaliação
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Confira atentamente os dados cadastrais e a categoria de veículo antes de iniciar a prova.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Profile Card */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ficha do Colaborador
            </span>
            <span className="text-xs font-mono font-bold text-[#1677FF] bg-blue-50 px-2 py-0.5 rounded-md">
              Matrícula: {collaborator.matricula || 'S/N'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-500 block">Nome Completo:</span>
              <span className="text-base font-bold text-[#101C2C] block">
                {collaborator.nome}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Base Operacional:</span>
                <span className="font-semibold text-slate-800">{collaborator.base}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Função / Cargo:</span>
                <span className="font-semibold text-slate-800">{collaborator.funcao}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Gerência de Lotação:</span>
                <span className="font-semibold text-slate-800">{collaborator.gerencia}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Category Banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1677FF] text-white flex items-center justify-center shrink-0">
              {collaborator.tipoVeiculo === 'Motocicleta' ? (
                <Bike className="w-5 h-5" />
              ) : (
                <Car className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-xs text-blue-800 font-semibold uppercase tracking-wider block">
                Matriz da Avaliação Teórica
              </span>
              <span className="text-sm font-bold text-[#101C2C] block">
                {collaborator.tipoVeiculo}
              </span>
            </div>
          </div>
          <span className="text-xs text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200 font-medium shrink-0">
            Questões Específicas
          </span>
        </div>

        {/* Notice of vehicle segregation */}
        <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#1677FF] shrink-0 mt-0.5" />
          <p>
            O banco de questões carregará exclusivamente tópicos pertinentes a <strong>{collaborator.tipoVeiculo}</strong> (legislação, pontos cegos, técnicas de frenagem e direção defensiva da categoria).
          </p>
        </div>

        {/* Agreement Checkbox */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/80 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAgreementChecked}
            onChange={(e) => setIsAgreementChecked(e.target.checked)}
            className="w-4 h-4 rounded-sm border-slate-300 text-[#1677FF] focus:ring-[#1677FF] mt-0.5 cursor-pointer"
          />
          <span className="text-xs text-slate-700 leading-relaxed font-medium">
            Confirmo que as informações acima correspondem fielmente aos meus dados e à categoria de veículo utilizada na minha rotina de trabalho. Estou ciente de que esta avaliação possui validade corporativa oficial.
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Alterar Seleção</span>
          </button>

          <button
            onClick={onConfirm}
            disabled={!isAgreementChecked}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-sm ${
              isAgreementChecked
                ? 'bg-[#1677FF] hover:bg-[#1677FF]/90 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <span>Prosseguir para Instruções</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
