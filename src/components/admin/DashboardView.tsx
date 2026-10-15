import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Car,
  Bike,
  Building2,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (section: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao carregar indicadores.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block w-8 h-8 border-3 border-[#1677FF] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Consolidando indicadores em tempo real...</p>
      </div>
    );
  }

  if (errorMsg || !stats) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>Erro ao carregar dados do dashboard</span>
        </div>
        <p className="text-xs">{errorMsg}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { kpis, basesChart, vehicleChart, statusGeralMap } = stats;

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Painel Executivo de Indicadores
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas reais consolidadas de conformidade, avaliações teóricas e práticas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('import')}
            className="px-3.5 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Importar Planilha</span>
          </button>
          <button
            onClick={loadData}
            title="Atualizar dados"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Convocados */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Colaboradores</span>
            <Users className="w-4 h-4 text-[#1677FF]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#101C2C]">
            {kpis.totalCadastrados}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {kpis.totalConvocados} condutores convocados
          </div>
        </div>

        {/* Prova Teórica Aprovados */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Teoria Aprovados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            {kpis.teoricoAprovados}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {kpis.teoricoReprovados} reprovados · {kpis.teoricoPendentes} pendentes
          </div>
        </div>

        {/* Avaliação Prática Aprovados */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Prática Aprovados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            {kpis.praticoAprovados}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {kpis.praticoPendentes} aptos aguardando pista
          </div>
        </div>

        {/* Conclusão Geral */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Processo Concluído</span>
            <Award className="w-4 h-4 text-[#36D6E7]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#101C2C]">
            {kpis.processosConcluidosAprovacao}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {kpis.percentualConclusao}% da frota regularizada
          </div>
        </div>
      </div>

      {/* Progress Bar of Whole Fleet Regularization */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Taxa Global de Regularização do Programa</span>
          <span className="font-mono tabular-nums text-[#1677FF]">
            {kpis.percentualConclusao}% ({kpis.processosConcluidosAprovacao}/{kpis.totalCadastrados})
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#1677FF] h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, kpis.percentualConclusao)}%` }}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#101C2C]">Desempenho por Base Operacional</h3>
              <span className="text-[11px] text-slate-500">Conclusão de processos por regional</span>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {basesChart.map((b: any) => (
              <div key={b.base} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{b.base}</span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {b.concluidos}/{b.total} ({b.taxaConclusao}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#1677FF] h-2 rounded-full"
                    style={{ width: `${b.taxaConclusao}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#101C2C]">Indicadores por Tipo de Veículo</h3>
              <span className="text-[11px] text-slate-500">Proporção e taxa de aprovação final</span>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {vehicleChart.map((vc: any) => {
              const rate = vc.total > 0 ? Math.round((vc.aprovados / vc.total) * 100) : 0;
              return (
                <div
                  key={vc.tipo}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#101C2C] text-[#36D6E7] flex items-center justify-center">
                      {vc.tipo === 'Motocicleta' ? (
                        <Bike className="w-4 h-4" />
                      ) : (
                        <Car className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#101C2C] truncate">{vc.tipo}</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="text-xl font-bold font-mono text-slate-800">
                      {vc.total} condutores
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {vc.aprovados} regularizados ({rate}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* General Status distribution pills */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Status Geral Consolidado
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(statusGeralMap).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                >
                  <span className="truncate pr-2">{status}</span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
