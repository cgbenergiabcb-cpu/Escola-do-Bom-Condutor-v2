import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { Collaborator, TheoreticalAttempt } from '../../types/index.js';
import {
  ShieldCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ListOrdered,
  X,
  FileCheck,
  Check,
} from 'lucide-react';

interface QuestionItem {
  id: string;
  index: number;
  codigo: string;
  enunciado: string;
  categoriaVeiculo: string;
  tema: string;
  alternativas: Array<{ letra: 'A' | 'B' | 'C' | 'D' | 'E'; texto: string }>;
}

interface ExamSessionStepProps {
  collaborator: Collaborator;
  attemptId: string;
  questions: QuestionItem[];
  tempoMaximoMinutos: number;
  onCompleted: (result: any) => void;
  onAbort: () => void;
}

export const ExamSessionStep: React.FC<ExamSessionStepProps> = ({
  collaborator,
  attemptId,
  questions,
  tempoMaximoMinutos,
  onCompleted,
  onAbort,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(tempoMaximoMinutos * 60);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const pendingCount = totalQuestions - answeredCount;

  const handleSelectOption = (letra: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: letra,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleAutoSubmit = () => {
    handleFinalSubmit(true);
  };

  const handleFinalSubmit = async (isTimeout = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsSubmitModalOpen(false);

    const duration = Math.round((Date.now() - startTime) / 1000);

    try {
      const response = await api.submitExam({
        attemptId,
        respostas: answers,
        duracaoSegundos: duration,
      });
      onCompleted(response);
    } catch (err: any) {
      alert(err.message || 'Erro ao submeter prova. Verifique sua conexão e tente novamente.');
      setIsSubmitting(false);
    }
  };

  if (!currentQ) {
    return (
      <div className="max-w-md mx-auto p-8 text-center text-slate-500">
        Carregando avaliação teórica...
      </div>
    );
  }

  const isLowTime = secondsRemaining <= 300; // less than 5 min

  return (
    <div className="min-h-screen bg-[#F4F7FB] pb-16">
      {/* Sticky Top Exam Header */}
      <header className="sticky top-0 z-30 bg-[#101C2C] text-white border-b border-white/10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo and Candidate */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1677FF] flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {collaborator.nome}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>{collaborator.base}</span>
                <span>·</span>
                <span className="text-[#36D6E7] font-semibold">{collaborator.tipoVeiculo}</span>
              </div>
            </div>
          </div>

          {/* Progress and Timer */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:block text-right">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                Progresso
              </span>
              <span className="text-xs font-mono font-bold text-slate-200">
                Questão {String(currentIndex + 1).padStart(2, '0')} de {String(totalQuestions).padStart(2, '0')}
              </span>
            </div>

            {/* Countdown Clock */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors ${
                isLowTime
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-white/10 text-white border border-white/15'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Finish CTA */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span className="hidden sm:inline">Finalizar Prova</span>
              <span className="sm:hidden">Finalizar</span>
            </button>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-[#36D6E7] h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation / Review Bar */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Questão {currentIndex + 1} de {totalQuestions}
            </span>
            <span>·</span>
            <span className="text-slate-500">{currentQ.tema}</span>
          </div>

          <button
            onClick={() => setIsReviewOpen(true)}
            className="text-[#1677FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
            <span>Grade de Questões ({answeredCount}/{totalQuestions})</span>
          </button>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Item {currentQ.codigo} · {currentQ.categoriaVeiculo}
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-[#101C2C] leading-relaxed">
              {currentQ.enunciado}
            </h2>
          </div>

          {/* 5 Selectable Alternatives (A to E) */}
          <div className="space-y-3 pt-2">
            {currentQ.alternativas.map((alt) => {
              const isSelected = answers[currentQ.id] === alt.letra;
              return (
                <div
                  key={alt.letra}
                  onClick={() => handleSelectOption(alt.letra)}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-3.5 group cursor-pointer select-none ${
                    isSelected
                      ? 'border-[#1677FF] bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#1677FF] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}
                  >
                    {alt.letra}
                  </div>
                  <span
                    className={`text-xs sm:text-sm leading-relaxed transition-colors mt-0.5 ${
                      isSelected ? 'font-medium text-[#101C2C]' : 'text-slate-700'
                    }`}
                  >
                    {alt.texto}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Previous / Next Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                currentIndex === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="text-xs text-slate-400">
              {answers[currentQ.id] ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Alternativa {answers[currentQ.id]} selecionada
                </span>
              ) : (
                <span>Nenhuma alternativa marcada</span>
              )}
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Revisar e Finalizar</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Drawer: Question Review Grid */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#101C2C]">Mapa de Questões</h3>
                <span className="text-xs text-slate-500">
                  {answeredCount} respondidas · {pendingCount} pendentes
                </span>
              </div>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto grid grid-cols-5 gap-2.5 flex-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsReviewOpen(false);
                    }}
                    className={`py-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isCurrent
                        ? 'border-[#1677FF] bg-blue-100/70 text-[#1677FF] ring-2 ring-[#1677FF]/30'
                        : isAnswered
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="text-[10px] font-mono">
                      {answers[q.id] || '—'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setIsReviewOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Continuar Prova
              </button>

              <button
                onClick={() => {
                  setIsReviewOpen(false);
                  setIsSubmitModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
              >
                Finalizar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Submission */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101C2C]">Confirmar Envio da Prova</h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Total de Questões:</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{totalQuestions}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Respondidas:</span>
                  <span className="text-sm font-bold text-emerald-600 font-mono">{answeredCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Pendentes:</span>
                  <span className={`text-sm font-bold font-mono ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                    {pendingCount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tempo Restante:</span>
                  <span className="text-sm font-bold text-[#1677FF] font-mono">{formatTimer(secondsRemaining)}</span>
                </div>
              </div>

              {pendingCount > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Atenção: você possui <strong>{pendingCount} questão(ões) pendente(s)</strong>. Questões em branco serão computadas como incorretas.
                  </span>
                </div>
              )}

              <p className="text-slate-600 leading-relaxed">
                Ao confirmar o envio, sua tentativa será finalizada, as respostas serão processadas no servidor e você visualizará imediatamente o resultado de aproveitamento.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Voltar à Prova
              </button>

              <button
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer disabled:bg-slate-300"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar e Enviar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
