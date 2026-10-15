import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { AuditLog } from '../../types/index.js';
import { ShieldCheck, Search, Filter, RefreshCw } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPerfil, setSelectedPerfil] = useState('Todos');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs({
        perfil: selectedPerfil !== 'Todos' ? selectedPerfil : '',
      });
      setLogs(data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedPerfil]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Auditoria & Conformidade LGPD
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trilha de auditoria imutável registrando operações administrativas, cadastros e avaliações.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition self-start sm:self-auto cursor-pointer"
          title="Recarregar logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Filtrar por Perfil:</span>
          <select
            value={selectedPerfil}
            onChange={(e) => setSelectedPerfil(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white font-medium"
          >
            <option value="Todos">Todos os Perfis</option>
            <option value="Administrador">Administrador</option>
            <option value="Instrutor">Instrutor</option>
            <option value="Colaborador">Colaborador</option>
            <option value="Sistema">Sistema</option>
          </select>
        </div>

        <span className="font-mono text-slate-400 text-[11px]">
          {logs.length} eventos registrados
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Data / Hora</th>
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Ação Realizada</th>
                <th className="px-4 py-3">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic font-sans text-xs">
                    Carregando eventos de auditoria...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic font-sans text-xs">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.dataHora).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 font-sans">
                      {log.usuario}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {log.perfil}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans font-semibold text-[#1677FF]">
                      {log.acao}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-sans text-xs max-w-md">
                      {log.detalhes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
