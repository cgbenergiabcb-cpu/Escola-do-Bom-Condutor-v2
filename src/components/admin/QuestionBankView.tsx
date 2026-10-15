import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Question, VehicleType } from '../../types/index.js';
import {
  HelpCircle,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Car,
  Bike,
  Download,
  Edit,
  X,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const QuestionBankView: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [temas, setTemas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | 'Carro/Caminhonete' | 'Motocicleta'>('Todas');
  const [selectedTema, setSelectedTema] = useState('Todos');

  // Modals
  const [isNewQuestionOpen, setIsNewQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form State
  const [formEnunciado, setFormEnunciado] = useState('');
  const [formCategoria, setFormCategoria] = useState<VehicleType>('Carro/Caminhonete');
  const [formTema, setFormTema] = useState('');
  const [formAltA, setFormAltA] = useState('');
  const [formAltB, setFormAltB] = useState('');
  const [formAltC, setFormAltC] = useState('');
  const [formAltD, setFormAltD] = useState('');
  const [formAltE, setFormAltE] = useState('');
  const [formCorreta, setFormCorreta] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [formExplicacao, setFormExplicacao] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedCategory !== 'Todas') params.categoria = selectedCategory;
      if (selectedTema !== 'Todos') params.tema = selectedTema;

      const data = await api.getQuestions(params);
      setQuestions(data.questoes);
      setTemas(data.temas);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedTema]);

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setFormEnunciado('');
    setFormCategoria('Carro/Caminhonete');
    setFormTema('');
    setFormAltA('');
    setFormAltB('');
    setFormAltC('');
    setFormAltD('');
    setFormAltE('');
    setFormCorreta('A');
    setFormExplicacao('');
    setIsNewQuestionOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormEnunciado(q.enunciado);
    setFormCategoria(q.categoriaVeiculo === 'Motocicleta' ? 'Motocicleta' : 'Carro/Caminhonete');
    setFormTema(q.tema);
    setFormAltA(q.alternativas.find((a) => a.letra === 'A')?.texto || '');
    setFormAltB(q.alternativas.find((a) => a.letra === 'B')?.texto || '');
    setFormAltC(q.alternativas.find((a) => a.letra === 'C')?.texto || '');
    setFormAltD(q.alternativas.find((a) => a.letra === 'D')?.texto || '');
    setFormAltE(q.alternativas.find((a) => a.letra === 'E')?.texto || '');
    setFormCorreta(q.respostaCorreta);
    setFormExplicacao(q.explicacao || '');
    setIsNewQuestionOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEnunciado || !formAltA || !formAltB || !formAltC || !formAltD || !formAltE) {
      alert('Preencha o enunciado e todas as 5 alternativas (A, B, C, D e E).');
      return;
    }

    setIsSaving(true);
    const alternativas = [
      { letra: 'A' as const, texto: formAltA.trim() },
      { letra: 'B' as const, texto: formAltB.trim() },
      { letra: 'C' as const, texto: formAltC.trim() },
      { letra: 'D' as const, texto: formAltD.trim() },
      { letra: 'E' as const, texto: formAltE.trim() },
    ];

    try {
      if (editingQuestion) {
        await api.updateQuestion(editingQuestion.id, {
          enunciado: formEnunciado,
          categoriaVeiculo: formCategoria,
          tema: formTema || 'Direção Defensiva',
          alternativas,
          respostaCorreta: formCorreta,
          explicacao: formExplicacao,
        });
      } else {
        await api.createQuestion({
          enunciado: formEnunciado,
          categoriaVeiculo: formCategoria,
          tema: formTema || 'Direção Defensiva',
          alternativas,
          respostaCorreta: formCorreta,
          explicacao: formExplicacao,
        });
      }
      setIsNewQuestionOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar questão.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (q: Question) => {
    const nextStatus = q.status === 'ativo' ? 'inativo' : 'ativo';
    try {
      await api.updateQuestion(q.id, { status: nextStatus });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadQuestionsExcel = () => {
    const rows = questions.map((q) => ({
      Código: q.codigo,
      Enunciado: q.enunciado,
      Categoria: q.categoriaVeiculo,
      Tema: q.tema,
      'Alternativa A': q.alternativas.find((a) => a.letra === 'A')?.texto || '',
      'Alternativa B': q.alternativas.find((a) => a.letra === 'B')?.texto || '',
      'Alternativa C': q.alternativas.find((a) => a.letra === 'C')?.texto || '',
      'Alternativa D': q.alternativas.find((a) => a.letra === 'D')?.texto || '',
      'Alternativa E': q.alternativas.find((a) => a.letra === 'E')?.texto || '',
      'Resposta Correta': q.respostaCorreta,
      'Explicação': q.explicacao || '',
      Versão: q.versao,
      Status: q.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questoes');
    XLSX.writeFile(wb, 'banco_questoes_bom_condutor.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Banco de Questões da Avaliação Teórica
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão das questões categorizadas por veículo com 5 alternativas (A a E) e correção segura no servidor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadQuestionsExcel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#1677FF]" />
            <span>Exportar Banco (.xlsx)</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Questão (5 Alternativas)</span>
          </button>
        </div>
      </div>

      {/* Mandatory Notice from Section 8 & 25 */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">
            Diretriz Oficial de Integridade do Banco de Questões
          </span>
          <p className="leading-relaxed">
            Conforme especificado no programa, cada questão oficial deve conter rigorosamente 5 alternativas (A, B, C, D e E). O sistema impede a apresentação de questões com alternativas incompletas aos condutores e permite que a comissão técnica cadastre, audite ou importe o conjunto completo validado antes da emissão de laudos definitivos.
          </p>
        </div>
      </div>

      {/* Category Tabs & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Segmented Category Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'Todas'
                ? 'bg-white text-[#101C2C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas as Categorias
          </button>
          <button
            onClick={() => setSelectedCategory('Carro/Caminhonete')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedCategory === 'Carro/Caminhonete'
                ? 'bg-white text-[#101C2C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Carro/Caminhonete</span>
          </button>
          <button
            onClick={() => setSelectedCategory('Motocicleta')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedCategory === 'Motocicleta'
                ? 'bg-white text-[#101C2C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Motocicleta</span>
          </button>
        </div>

        {/* Theme select */}
        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <span className="text-slate-500 font-semibold shrink-0">Tema:</span>
          <select
            value={selectedTema}
            onChange={(e) => setSelectedTema(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-xs w-full sm:w-56"
          >
            <option value="Todos">Todos os Assuntos</option>
            {temas.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Carregando banco de questões...
          </div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            Nenhuma questão cadastrada para este filtro.
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 space-y-4 transition shadow-xs ${
                q.status === 'ativo' ? 'border-slate-200/90' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                    {q.codigo}
                  </span>
                  <span className="text-xs font-semibold text-[#1677FF] bg-blue-50 px-2 py-0.5 rounded-md">
                    {q.categoriaVeiculo}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    · {q.tema}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    (Versão {q.versao})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(q)}
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                      q.status === 'ativo'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {q.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1 text-slate-500 hover:text-slate-800 rounded-md transition cursor-pointer"
                    title="Editar questão"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Statement */}
              <h3 className="text-sm font-semibold text-[#101C2C] leading-relaxed">
                {q.enunciado}
              </h3>

              {/* 5 Alternatives view */}
              <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
                {q.alternativas.map((alt) => {
                  const isCorrect = alt.letra === q.respostaCorreta;
                  return (
                    <div
                      key={alt.letra}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                        isCorrect
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {alt.letra}
                      </span>
                      <span className="mt-0.5 flex-1">{alt.texto}</span>
                      {isCorrect && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm shrink-0 uppercase">
                          Gabarito Oficial
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explicacao && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900">
                  <span className="font-bold">Fundamentação técnica: </span>
                  <span>{q.explicacao}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Create or Edit Question */}
      {isNewQuestionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101C2C]">
                {editingQuestion ? `Editar Questão ${editingQuestion.codigo}` : 'Cadastrar Nova Questão'}
              </h3>
              <button
                onClick={() => setIsNewQuestionOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enunciado da Questão *</label>
                <textarea
                  required
                  rows={3}
                  value={formEnunciado}
                  onChange={(e) => setFormEnunciado(e.target.value)}
                  placeholder="Ex.: Ao deparar-se com pista molhada e início de aquaplanagem, qual conduta o motorista deve adotar..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-1 focus:ring-[#1677FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria de Veículo *</label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Carro/Caminhonete">Carro/Caminhonete</option>
                    <option value="Motocicleta">Motocicleta</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tema / Assunto</label>
                  <input
                    type="text"
                    value={formTema}
                    onChange={(e) => setFormTema(e.target.value)}
                    placeholder="Ex.: Aquaplanagem, Frenagem, CTB..."
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* 5 Alternatives Inputs */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-700 block">
                  As 5 Alternativas (A a E) e Marcação da Resposta Correta:
                </span>

                {(['A', 'B', 'C', 'D', 'E'] as const).map((letra) => {
                  const val =
                    letra === 'A'
                      ? formAltA
                      : letra === 'B'
                      ? formAltB
                      : letra === 'C'
                      ? formAltC
                      : letra === 'D'
                      ? formAltD
                      : formAltE;

                  const setter =
                    letra === 'A'
                      ? setFormAltA
                      : letra === 'B'
                      ? setFormAltB
                      : letra === 'C'
                      ? setFormAltC
                      : letra === 'D'
                      ? setFormAltD
                      : setFormAltE;

                  return (
                    <div key={letra} className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="respostaCorreta"
                          checked={formCorreta === letra}
                          onChange={() => setFormCorreta(letra)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800">
                          {letra}
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={val}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={`Texto da alternativa ${letra}...`}
                        className="flex-1 p-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Explicação / Fundamentação Técnica (Opcional)
                </label>
                <input
                  type="text"
                  value={formExplicacao}
                  onChange={(e) => setFormExplicacao(e.target.value)}
                  placeholder="Justificativa da resposta correta baseada no CTB e normas de direção defensiva..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewQuestionOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#1677FF] text-white font-bold hover:bg-[#1677FF]/90 cursor-pointer"
                >
                  {isSaving ? 'Salvando...' : editingQuestion ? 'Atualizar Questão' : 'Salvar Questão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
