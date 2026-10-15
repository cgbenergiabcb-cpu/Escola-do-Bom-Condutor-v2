import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Collaborator, PracticalAssessment } from '../../types/index.js';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  Bike,
  Building2,
  Calendar,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState('geral');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [practicals, setPracticals] = useState<PracticalAssessment[]>([]);
  const [bases, setBases] = useState<string[]>([]);
  const [selectedBase, setSelectedBase] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [colabsData, pracsData] = await Promise.all([
        api.getCollaborators({ base: selectedBase !== 'Todas' ? selectedBase : '' }),
        api.getDashboardStats(),
      ]);
      setCollaborators(colabsData.collaborators);
      setBases(colabsData.bases);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBase]);

  // Filter list by report type
  let filteredRows = [...collaborators];
  let reportTitle = 'Relação Geral de Condutores Convocados';

  if (reportType === 'pendentes') {
    reportTitle = 'Relação de Condutores com Avaliação Pendente';
    filteredRows = filteredRows.filter(
      (c) => c.statusGeral !== 'Processo concluído com aprovação'
    );
  } else if (reportType === 'concluidos') {
    reportTitle = 'Relação de Condutores Regularizados (Concluídos com Aprovação)';
    filteredRows = filteredRows.filter(
      (c) => c.statusGeral === 'Processo concluído com aprovação'
    );
  } else if (reportType === 'reprovados') {
    reportTitle = 'Relação de Condutores com Aproveitamento Insuficiente';
    filteredRows = filteredRows.filter(
      (c) => c.statusTeorico === 'Reprovado' || c.statusPratico === 'Reprovado'
    );
  } else if (reportType === 'teorico_aprovados') {
    reportTitle = 'Resultados da Avaliação Teórica (Aprovados)';
    filteredRows = filteredRows.filter((c) => c.statusTeorico === 'Aprovado');
  }

  const handleExportExcel = () => {
    const dataToExport = filteredRows.map((c) => ({
      Matrícula: c.matricula || 'S/N',
      Nome: c.nome,
      Base: c.base,
      Função: c.funcao,
      Gerência: c.gerencia,
      Veículo: c.tipoVeiculo,
      'Status Teórico': c.statusTeorico,
      'Nota Teórica (%)': c.notaTeorica !== undefined ? c.notaTeorica : '',
      'Status Prático': c.statusPratico,
      'Nota Prática (%)': c.notaPratica !== undefined ? c.notaPratica : '',
      'Status Geral': c.statusGeral,
      'Data de Convocação': new Date(c.convocadoEm).toLocaleDateString('pt-BR'),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
    XLSX.writeFile(wb, `relatorio_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Central de Relatórios & Exportações
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geração de relatórios operacionais em PDF, Excel ou CSV com filtros customizados.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Gerar PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar em Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Report Selector Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 no-print text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-slate-700 shrink-0">Tipo de Relatório:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white w-full sm:w-72 font-medium"
          >
            <option value="geral">Relação Geral de Condutores</option>
            <option value="concluidos">Processos Concluídos com Aprovação</option>
            <option value="pendentes">Condutores Pendentes de Avaliação</option>
            <option value="teorico_aprovados">Aprovados na Prova Teórica</option>
            <option value="reprovados">Reprovados / Necessitam Reciclagem</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-slate-700 shrink-0">Filtrar por Base:</span>
          <select
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white w-full sm:w-56 font-medium"
          >
            <option value="Todas">Todas as Bases</option>
            {bases.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Document Header */}
        <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
              Escola do Bom Condutor · Relatório Oficial
            </span>
            <h2 className="text-lg font-bold text-[#101C2C] mt-0.5">
              {reportTitle}
            </h2>
            <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
              <span>Base: <strong>{selectedBase}</strong></span>
              <span>·</span>
              <span>Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xl font-bold text-[#1677FF] block">
              {filteredRows.length}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Registros no filtro
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2.5">Matrícula</th>
                <th className="px-3 py-2.5">Nome do Colaborador</th>
                <th className="px-3 py-2.5">Base</th>
                <th className="px-3 py-2.5">Veículo</th>
                <th className="px-3 py-2.5 text-center">Nota Teoria</th>
                <th className="px-3 py-2.5 text-center">Nota Prática</th>
                <th className="px-3 py-2.5">Status Geral</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    Nenhum registro para este filtro de relatório.
                  </td>
                </tr>
              ) : (
                filteredRows.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-slate-600 font-bold">{c.matricula || '—'}</td>
                    <td className="px-3 py-2 font-semibold text-slate-900">{c.nome}</td>
                    <td className="px-3 py-2 text-slate-600">{c.base}</td>
                    <td className="px-3 py-2 text-slate-700">{c.tipoVeiculo}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-slate-800">
                      {c.notaTeorica !== undefined ? `${c.notaTeorica}%` : '—'}
                    </td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-slate-800">
                      {c.notaPratica !== undefined ? `${c.notaPratica}%` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`font-semibold ${
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Report Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Relatório gerado pelo sistema Escola do Bom Condutor</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
};
