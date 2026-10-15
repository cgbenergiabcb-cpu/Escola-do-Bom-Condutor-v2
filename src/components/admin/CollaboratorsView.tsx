import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Collaborator, TheoreticalAttempt, PracticalAssessment } from '../../types/index.js';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  Bike,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const CollaboratorsView: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [bases, setBases] = useState<string[]>([]);
  const [gerencias, setGerencias] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBase, setSelectedBase] = useState('Todas');
  const [selectedGerencia, setSelectedGerencia] = useState('Todas');
  const [selectedVeiculo, setSelectedVeiculo] = useState('Todos');
  const [selectedStatusGeral, setSelectedStatusGeral] = useState('Todos');

  // Modals
  const [selectedColabDetails, setSelectedColabDetails] = useState<Collaborator | null>(null);
  const [colabAttempts, setColabAttempts] = useState<TheoreticalAttempt[]>([]);
  const [colabPracticals, setColabPracticals] = useState<PracticalAssessment[]>([]);
  const [isNewColabOpen, setIsNewColabOpen] = useState(false);

  // New Colab Form
  const [newNome, setNewNome] = useState('');
  const [newMatricula, setNewMatricula] = useState('');
  const [newBase, setNewBase] = useState('');
  const [newFuncao, setNewFuncao] = useState('');
  const [newGerencia, setNewGerencia] = useState('');
  const [newTipoVeiculo, setNewTipoVeiculo] = useState<'Carro/Caminhonete' | 'Motocicleta'>('Carro/Caminhonete');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedBase !== 'Todas') params.base = selectedBase;
      if (selectedGerencia !== 'Todas') params.gerencia = selectedGerencia;
      if (selectedVeiculo !== 'Todos') params.tipoVeiculo = selectedVeiculo;
      if (selectedStatusGeral !== 'Todos') params.statusGeral = selectedStatusGeral;

      const data = await api.getCollaborators(params);
      setCollaborators(data.collaborators);
      setBases(data.bases);
      setGerencias(data.gerencias);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBase, selectedGerencia, selectedVeiculo, selectedStatusGeral]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenDetails = async (colab: Collaborator) => {
    setSelectedColabDetails(colab);
    try {
      const data = await api.getCollaborator(colab.id);
      setColabAttempts(data.attempts);
      setColabPracticals(data.practicalAssessments);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateColab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome || !newBase) return;

    setIsSaving(true);
    try {
      await api.createCollaborator({
        nome: newNome,
        matricula: newMatricula,
        base: newBase,
        funcao: newFuncao || 'Operacional',
        gerencia: newGerencia || 'Regional',
        tipoVeiculo: newTipoVeiculo,
      });
      setIsNewColabOpen(false);
      setNewNome('');
      setNewMatricula('');
      setNewBase('');
      setNewFuncao('');
      setNewGerencia('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportExcel = () => {
    const exportRows = collaborators.map((c) => ({
      Matrícula: c.matricula || 'S/N',
      Nome: c.nome,
      Base: c.base,
      Função: c.funcao,
      Gerência: c.gerencia,
      'Tipo de Veículo': c.tipoVeiculo,
      'Status Teórico': c.statusTeorico,
      'Nota Teórica (%)': c.notaTeorica !== undefined ? c.notaTeorica : '',
      'Status Prático': c.statusPratico,
      'Nota Prática (%)': c.notaPratica !== undefined ? c.notaPratica : '',
      'Instrutor Prático': c.instrutorPraticoNome || '',
      'Status Geral': c.statusGeral,
      'Última Atualização': new Date(c.atualizadoEm).toLocaleDateString('pt-BR'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Colaboradores');
    XLSX.writeFile(wb, `escola_bom_condutor_colaboradores_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Gestão de Colaboradores Convocados
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro unificado, histórico de tentativas e status consolidado do programa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar XLSX</span>
          </button>
          <button
            onClick={() => setIsNewColabOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Condutor</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, matrícula ou base..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            Filtrar
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Base</label>
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="Todas">Todas as Bases</option>
              {bases.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Veículo</label>
            <select
              value={selectedVeiculo}
              onChange={(e) => setSelectedVeiculo(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="Todos">Todos os Tipos</option>
              <option value="Carro/Caminhonete">Carro/Caminhonete</option>
              <option value="Motocicleta">Motocicleta</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status Geral</label>
            <select
              value={selectedStatusGeral}
              onChange={(e) => setSelectedStatusGeral(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="Todos">Todas as Situações</option>
              <option value="Aguardando prova teórica">Aguardando prova teórica</option>
              <option value="Aprovado na prova teórica">Aprovado na prova teórica</option>
              <option value="Reprovado na prova teórica">Reprovado na prova teórica</option>
              <option value="Processo concluído com aprovação">Processo concluído com aprovação</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBase('Todas');
                setSelectedGerencia('Todas');
                setSelectedVeiculo('Todos');
                setSelectedStatusGeral('Todos');
              }}
              className="w-full p-2 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Matrícula</th>
                <th className="px-4 py-3">Nome do Condutor</th>
                <th className="px-4 py-3">Base / Regional</th>
                <th className="px-4 py-3">Veículo</th>
                <th className="px-4 py-3 text-center">Teórica</th>
                <th className="px-4 py-3 text-center">Prática</th>
                <th className="px-4 py-3">Situação Geral</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Carregando condutores...
                  </td>
                </tr>
              ) : collaborators.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhum colaborador encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                collaborators.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-600">
                      {c.matricula || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 block">{c.nome}</span>
                      <span className="text-[11px] text-slate-500 block">{c.funcao}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800 block">{c.base}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{c.gerencia}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                        {c.tipoVeiculo === 'Motocicleta' ? (
                          <Bike className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Car className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{c.tipoVeiculo}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          c.statusTeorico === 'Aprovado'
                            ? 'bg-emerald-50 text-emerald-700'
                            : c.statusTeorico === 'Reprovado'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.notaTeorica !== undefined ? `${c.notaTeorica}%` : c.statusTeorico}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          c.statusPratico === 'Aprovado'
                            ? 'bg-emerald-50 text-emerald-700'
                            : c.statusPratico === 'Reprovado'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c.notaPratica !== undefined ? `${c.notaPratica}%` : c.statusPratico}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-semibold ${
                          c.statusGeral === 'Processo concluído com aprovação'
                            ? 'text-emerald-700'
                            : c.statusGeral.includes('Reprovado')
                            ? 'text-rose-600'
                            : 'text-amber-700'
                        }`}
                      >
                        {c.statusGeral}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenDetails(c)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detalhes</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Total exibido: {collaborators.length} condutores</span>
          <span className="font-mono text-[11px]">Base Escola do Bom Condutor</span>
        </div>
      </div>

      {/* Modal: View Details & History */}
      {selectedColabDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Matrícula: {selectedColabDetails.matricula || 'S/N'}
                </span>
                <h3 className="text-base font-bold text-[#101C2C]">
                  {selectedColabDetails.nome}
                </h3>
              </div>
              <button
                onClick={() => setSelectedColabDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Base</span>
                <span className="font-semibold text-slate-800">{selectedColabDetails.base}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Função</span>
                <span className="font-semibold text-slate-800">{selectedColabDetails.funcao}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Gerência</span>
                <span className="font-semibold text-slate-800">{selectedColabDetails.gerencia}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Veículo</span>
                <span className="font-bold text-[#1677FF]">{selectedColabDetails.tipoVeiculo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Geral</span>
                <span className="font-semibold text-emerald-700">{selectedColabDetails.statusGeral}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Convocado Em</span>
                <span className="font-mono text-slate-700">
                  {new Date(selectedColabDetails.convocadoEm).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* History of Theoretical Attempts */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Histórico de Provas Teóricas ({colabAttempts.length})
              </span>
              {colabAttempts.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                  Nenhuma tentativa teórica realizada até o momento.
                </p>
              ) : (
                <div className="space-y-2">
                  {colabAttempts.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          Sessão {att.id}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(att.iniciadoEm).toLocaleString('pt-BR')} · Acertos: {att.respostasCorretas}/{att.totalQuestoes}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold px-2.5 py-1 rounded-md text-xs ${
                          att.aprovado ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {att.percentualAproveitamento}% ({att.aprovado ? 'Aprovado' : 'Reprovado'})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History of Practical Assessments */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Histórico de Avaliações Práticas ({colabPracticals.length})
              </span>
              {colabPracticals.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                  Nenhuma avaliação prática registrada pelo instrutor ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {colabPracticals.map((prac) => (
                    <div
                      key={prac.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          Instrutor: {prac.instrutorNome}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(prac.dataAvaliacao).toLocaleDateString('pt-BR')} · Itens Atendidos: {prac.totalAtende}/{prac.totalItensAvaliados}
                        </span>
                      </div>
                      <span
                        className={`font-bold px-2.5 py-1 rounded-md text-xs ${
                          prac.resultadoFinal === 'Aprovado'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {prac.resultadoFinal}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedColabDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Novo Colaborador */}
      {isNewColabOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101C2C]">Cadastrar Novo Condutor</h3>
              <button
                onClick={() => setIsNewColabOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateColab} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  placeholder="Ex.: FRANCISCO DA SILVA ROCHA"
                  className="w-full p-2.5 rounded-xl border border-slate-300 uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Matrícula</label>
                <input
                  type="text"
                  value={newMatricula}
                  onChange={(e) => setNewMatricula(e.target.value)}
                  placeholder="Ex.: 15420"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base *</label>
                  <input
                    type="text"
                    required
                    value={newBase}
                    onChange={(e) => setNewBase(e.target.value)}
                    placeholder="Ex.: Base Bacabal"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Veículo *</label>
                  <select
                    value={newTipoVeiculo}
                    onChange={(e) => setNewTipoVeiculo(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Carro/Caminhonete">Carro/Caminhonete</option>
                    <option value="Motocicleta">Motocicleta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Função</label>
                <input
                  type="text"
                  value={newFuncao}
                  onChange={(e) => setNewFuncao(e.target.value)}
                  placeholder="Ex.: Eletricista de Redes"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gerência</label>
                <input
                  type="text"
                  value={newGerencia}
                  onChange={(e) => setNewGerencia(e.target.value)}
                  placeholder="Ex.: Gerência de Distribuição Central"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewColabOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#1677FF] text-white font-bold hover:bg-[#1677FF]/90 cursor-pointer"
                >
                  {isSaving ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
