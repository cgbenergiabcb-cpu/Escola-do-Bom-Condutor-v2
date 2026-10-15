import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  Collaborator,
  PracticalAssessment,
  PracticalCriterion,
  Instructor,
} from '../../types/index.js';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Car,
  Bike,
  Printer,
  Award,
  ChevronRight,
  ShieldCheck,
  User,
  Plus,
} from 'lucide-react';

export const PracticalAssessmentView: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [criteria, setCriteria] = useState<PracticalCriterion[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedColab, setSelectedColab] = useState<Collaborator | null>(null);

  // Form State
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [criterionResults, setCriterionResults] = useState<
    Record<string, { status: 'atende' | 'nao_atende' | 'nao_aplicavel'; observacao?: string }>
  >({});
  const [pontosFortes, setPontosFortes] = useState('');
  const [pontosMelhoria, setPontosMelhoria] = useState('');
  const [recomendacao, setRecomendacao] = useState('');
  const [resultadoFinal, setResultadoFinal] = useState<'Aprovado' | 'Reprovado'>('Aprovado');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAssessment, setSubmittedAssessment] = useState<PracticalAssessment | null>(null);

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  const loadInitial = async () => {
    try {
      const [colabsData, critData, instData] = await Promise.all([
        api.getCollaborators(),
        api.getPracticalCriteria(),
        api.getInstructors(),
      ]);
      setCollaborators(colabsData.collaborators);
      setCriteria(critData.criterios);
      setInstructors(instData.instrutores);
      if (instData.instrutores.length > 0) {
        setSelectedInstructorId(instData.instrutores[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const handleSelectCollaborator = (colab: Collaborator) => {
    setSelectedColab(colab);
    setSubmittedAssessment(null);
    // Initialize criteria status to 'atende' by default
    const initialCriteria: Record<string, any> = {};
    const relevantCriteria = criteria.filter(
      (c) =>
        c.categoriaVeiculo === 'Geral' ||
        c.categoriaVeiculo === colab.tipoVeiculo
    );
    relevantCriteria.forEach((crit) => {
      initialCriteria[crit.id] = { status: 'atende', observacao: '' };
    });
    setCriterionResults(initialCriteria);
    setPontosFortes('Excelente postura inicial e atenção aos limites de velocidade.');
    setPontosMelhoria('Atenção redobrada à distância de seguimento em curvas fechadas.');
    setRecomendacao('Apto para condução operacional de veículos da frota corporativa.');
    setResultadoFinal('Aprovado');
  };

  const handleCriterionChange = (
    critId: string,
    status: 'atende' | 'nao_atende' | 'nao_aplicavel',
    obs?: string
  ) => {
    setCriterionResults((prev) => {
      const updated = {
        ...prev,
        [critId]: {
          status,
          observacao: obs !== undefined ? obs : prev[critId]?.observacao || '',
        },
      };

      // Auto update recommendation if any "nao_atende"
      const hasNaoAtende = Object.values(updated).some((v) => v.status === 'nao_atende');
      if (hasNaoAtende) {
        setResultadoFinal('Reprovado');
      } else {
        setResultadoFinal('Aprovado');
      }

      return updated;
    });
  };

  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColab || !selectedInstructorId) {
      alert('Selecione o condutor e o instrutor credenciado.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitPracticalAssessment({
        colaboradorId: selectedColab.id,
        instrutorId: selectedInstructorId,
        tipoVeiculo: selectedColab.tipoVeiculo,
        criterios: criterionResults,
        pontosFortes,
        pontosMelhoria,
        recomendacao,
        resultadoFinal,
      });

      setSubmittedAssessment(res.assessment);
      // Reload collaborators
      const colabsData = await api.getCollaborators();
      setCollaborators(colabsData.collaborators);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar avaliação prática.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter criteria for selected collaborator's vehicle
  const relevantCriteria = selectedColab
    ? criteria.filter(
        (c) =>
          c.categoriaVeiculo === 'Geral' ||
          c.categoriaVeiculo === selectedColab.tipoVeiculo
      )
    : [];

  const filteredColabs = collaborators.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.matricula && c.matricula.includes(searchFilter)) ||
      c.base.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Módulo de Avaliação Prática em Pista
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro oficial da prova prática conduzida pelo instrutor credenciado de trânsito.
          </p>
        </div>
      </div>

      {/* Main Two-Column or Stepper Interface */}
      {!selectedColab ? (
        /* Step 1: Select Collaborator */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#101C2C]">
                1. Localizar Condutor para Avaliação Prática
              </h2>
              <span className="text-xs text-slate-500">
                Selecione um colaborador apto ou convoque pela busca:
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredColabs.length} condutores listados
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar por nome do colaborador, matrícula ou base..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#1677FF]"
            />
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            {filteredColabs.map((colab) => (
              <div
                key={colab.id}
                onClick={() => handleSelectCollaborator(colab)}
                className="p-3.5 hover:bg-blue-50/60 transition flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#1677FF] transition-colors">
                    {colab.nome}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono">Matrícula: {colab.matricula || 'S/N'}</span>
                    <span>·</span>
                    <span>{colab.base}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700">{colab.tipoVeiculo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span
                      className={`font-semibold block ${
                        colab.statusTeorico === 'Aprovado'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      Teoria: {colab.statusTeorico}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Prática: {colab.statusPratico}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1677FF] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : submittedAssessment ? (
        /* Evaluation Saved Confirmation & Printable Certificate */
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-emerald-950">
                  Laudo de Avaliação Prática Homologado!
                </h2>
                <span className="text-xs text-emerald-800">
                  Resultado: <strong>{submittedAssessment.resultadoFinal}</strong> · Registrado por {submittedAssessment.instrutorNome}
                </span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#101C2C] text-white font-bold text-xs hover:bg-[#101C2C]/90 transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#36D6E7]" />
              <span>Imprimir Laudo Oficial (PDF)</span>
            </button>
          </div>

          {/* Printable Report View */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-5 text-xs text-slate-800">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Escola do Bom Condutor · Ficha Prática
                </span>
                <h3 className="text-sm font-bold text-[#101C2C] mt-0.5">
                  Comprovante de Avaliação Veicular em Trânsito
                </h3>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                Laudo Nº: {submittedAssessment.id}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block font-semibold">Condutor</span>
                <span className="font-bold text-slate-900 block">{selectedColab.nome}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block font-semibold">Matrícula</span>
                <span className="font-mono text-slate-800 block">{selectedColab.matricula || 'S/N'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block font-semibold">Veículo Avaliado</span>
                <span className="font-bold text-[#1677FF] block">{selectedColab.tipoVeiculo}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block font-semibold">Instrutor</span>
                <span className="font-semibold text-slate-900 block">{submittedAssessment.instrutorNome}</span>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-700 block">Pontos Fortes Observados:</span>
              <p className="text-slate-600 italic">{submittedAssessment.pontosFortes || 'Sem observações adicionais.'}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700 block">Oportunidades de Melhoria:</span>
              <p className="text-slate-600 italic">{submittedAssessment.pontosMelhoria || 'Sem observações adicionais.'}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700 block">Recomendação do Instrutor:</span>
              <p className="text-slate-600 italic">{submittedAssessment.recomendacao}</p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-400">
                Data do Registro: {new Date(submittedAssessment.dataAvaliacao).toLocaleString('pt-BR')}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-md bg-emerald-100 text-emerald-800">
                Resultado Final: {submittedAssessment.resultadoFinal}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSelectedColab(null);
                setSubmittedAssessment(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
            >
              Avaliar Outro Condutor
            </button>
          </div>
        </div>
      ) : (
        /* Evaluation Form */
        <form onSubmit={handleSubmitAssessment} className="space-y-6">
          {/* Selected Condutor Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#1677FF] tracking-wider block">
                Condutor em Avaliação
              </span>
              <h2 className="text-base font-bold text-[#101C2C] mt-0.5">
                {selectedColab.nome}
              </h2>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                <span>Matrícula: {selectedColab.matricula || 'S/N'}</span>
                <span>·</span>
                <span>Base: {selectedColab.base}</span>
                <span>·</span>
                <span className="font-semibold text-slate-700">Categoria: {selectedColab.tipoVeiculo}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedColab(null)}
              className="text-xs text-slate-500 hover:text-slate-800 underline self-start sm:self-auto cursor-pointer"
            >
              Trocar condutor
            </button>
          </div>

          {/* Instructor & Vehicle Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Instrutor Credenciado Responsável *
              </label>
              <select
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nome} ({inst.credencial})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo de Veículo Utilizado no Teste *
              </label>
              <input
                type="text"
                disabled
                value={selectedColab.tipoVeiculo}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold"
              />
            </div>
          </div>

          {/* Rubric Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-[#101C2C]">
                Ficha Objetiva de Critérios Práticos ({relevantCriteria.length} itens)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Avalie cada critério operacional conforme o comportamento observado na pista.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {relevantCriteria.map((crit, idx) => {
                const currentStatus = criterionResults[crit.id]?.status || 'atende';
                const currentObs = criterionResults[crit.id]?.observacao || '';

                return (
                  <div key={crit.id} className="p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-0.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {crit.titulo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 pl-7 leading-relaxed">
                          {crit.descricao}
                        </p>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 pl-7 sm:pl-0">
                        <button
                          type="button"
                          onClick={() => handleCriterionChange(crit.id, 'atende')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            currentStatus === 'atende'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Atende
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCriterionChange(crit.id, 'nao_atende')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            currentStatus === 'nao_atende'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Não Atende
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCriterionChange(crit.id, 'nao_aplicavel')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                            currentStatus === 'nao_aplicavel'
                              ? 'bg-slate-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>

                    {/* Optional Note */}
                    <div className="pl-7">
                      <input
                        type="text"
                        value={currentObs}
                        onChange={(e) => handleCriterionChange(crit.id, currentStatus, e.target.value)}
                        placeholder="Observação pontual do instrutor para este critério (opcional)..."
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 text-slate-700 focus:ring-1 focus:ring-[#1677FF]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Qualitative Notes */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-[#101C2C]">
              Parecer Técnico do Instrutor
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pontos Fortes Observados na Condução:
                </label>
                <textarea
                  rows={2}
                  value={pontosFortes}
                  onChange={(e) => setPontosFortes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pontos que Necessitam de Melhoria / Reorientação:
                </label>
                <textarea
                  rows={2}
                  value={pontosMelhoria}
                  onChange={(e) => setPontosMelhoria(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recomendação e Parecer Conclusivo:
                </label>
                <textarea
                  rows={2}
                  value={recomendacao}
                  onChange={(e) => setRecomendacao(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            {/* Final Result selector */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Resultado Oficial da Etapa Prática:
                </span>
                <span className="text-[11px] text-slate-500">
                  Apenas condutores com aprovação em ambas as etapas concluem o programa.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resultadoPratico"
                    checked={resultadoFinal === 'Aprovado'}
                    onChange={() => setResultadoFinal('Aprovado')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-emerald-700">Aprovado</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resultadoPratico"
                    checked={resultadoFinal === 'Reprovado'}
                    onChange={() => setResultadoFinal('Reprovado')}
                    className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-700">Reprovado</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedColab(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer disabled:bg-slate-300"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registrando Laudo...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Concluir e Homologar Avaliação Prática</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
