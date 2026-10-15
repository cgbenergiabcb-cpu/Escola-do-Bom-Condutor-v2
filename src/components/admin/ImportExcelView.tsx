import React, { useState, useRef } from 'react';
import { api } from '../../services/api.js';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ArrowRight,
  FileText,
  Clock,
  RotateCcw,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const ImportExcelView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState({
    nome: '',
    matricula: '',
    base: '',
    funcao: '',
    gerencia: '',
    tipoVeiculo: '',
  });

  // Validation results
  const [validationPreview, setValidationPreview] = useState<{
    valid: number;
    warnings: number;
    errors: Array<{ linha: number; identificador: string; motivo: string }>;
  } | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setImportResult(null);
    setValidationPreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          alert('A planilha está vazia ou não possui linhas de dados.');
          return;
        }

        const rawHeaders = (jsonData[0] as string[]).map((h) => String(h || '').trim());
        setHeaders(rawHeaders);

        // Convert rows to array of objects
        const rows: any[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const rowVals = jsonData[i] as any[];
          if (!rowVals || rowVals.length === 0) continue;
          const obj: any = {};
          rawHeaders.forEach((h, colIdx) => {
            obj[h] = rowVals[colIdx] !== undefined ? String(rowVals[colIdx]).trim() : '';
          });
          rows.push(obj);
        }

        setParsedRows(rows);

        // Auto-match headers based on keywords
        const mapping = {
          nome: rawHeaders.find((h) => /nome/i.test(h)) || rawHeaders[1] || '',
          matricula: rawHeaders.find((h) => /matr/i.test(h)) || rawHeaders[0] || '',
          base: rawHeaders.find((h) => /base/i.test(h)) || '',
          funcao: rawHeaders.find((h) => /func|cargo/i.test(h)) || '',
          gerencia: rawHeaders.find((h) => /geren/i.test(h)) || '',
          tipoVeiculo: rawHeaders.find((h) => /veic|tipo/i.test(h)) || '',
        };
        setFieldMapping(mapping);

        // Run client preview validation
        runValidation(rows, mapping);
      } catch (err) {
        console.error('Error parsing spreadsheet:', err);
        alert('Erro ao processar arquivo. Certifique-se de que é um arquivo XLSX ou CSV válido.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const runValidation = (rows: any[], mapping: typeof fieldMapping) => {
    let validCount = 0;
    let warningCount = 0;
    const errors: Array<{ linha: number; identificador: string; motivo: string }> = [];

    rows.forEach((r, idx) => {
      const lineNum = idx + 2;
      const nome = r[mapping.nome];
      const base = r[mapping.base];
      const matricula = r[mapping.matricula];

      if (!nome) {
        errors.push({ linha: lineNum, identificador: matricula || `Linha ${lineNum}`, motivo: 'Nome ausente' });
      } else if (!base) {
        errors.push({ linha: lineNum, identificador: nome, motivo: 'Base operacional ausente' });
      } else {
        validCount++;
      }
    });

    setValidationPreview({
      valid: validCount,
      warnings: warningCount,
      errors,
    });
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0 || !fieldMapping.nome || !fieldMapping.base) {
      alert('Mapeie pelo menos as colunas de Nome e Base antes de importar.');
      return;
    }

    setIsImporting(true);
    try {
      // Map rows according to user's column association
      const mappedRows = parsedRows.map((r) => ({
        nome: r[fieldMapping.nome] || '',
        matricula: r[fieldMapping.matricula] || '',
        base: r[fieldMapping.base] || '',
        funcao: r[fieldMapping.funcao] || 'Não informada',
        gerencia: r[fieldMapping.gerencia] || 'Regional',
        tipoVeiculo: r[fieldMapping.tipoVeiculo] || 'Carro/Caminhonete',
      }));

      const res = await api.importCollaborators({
        rows: mappedRows,
        filename: file?.name || 'base_importada.xlsx',
      });

      setImportResult(res);
    } catch (err: any) {
      alert(err.message || 'Erro ao importar base.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSample = () => {
    const sample = [
      {
        Matrícula: '10482',
        Nome: 'FRANCISCO ANTÔNIO DA SILVA',
        Base: 'Base Bacabal',
        Função: 'Eletricista de Distribuição',
        Gerência: 'Gerência de Operações Centro',
        'Tipo de Veículo': 'Carro/Caminhonete',
      },
      {
        Matrícula: '10915',
        Nome: 'FRANCISCO JOSÉ PEREIRA',
        Base: 'Base Santa Inês',
        Função: 'Técnico de Manutenção de Linhas',
        Gerência: 'Gerência Regional Oeste',
        'Tipo de Veículo': 'Carro/Caminhonete',
      },
      {
        Matrícula: '11340',
        Nome: 'FRANCISCO CARLOS SOUZA',
        Base: 'Base Pedreiras',
        Função: 'Inspetor de Serviços Comerciais',
        Gerência: 'Gerência de Atendimento e Clientes',
        'Tipo de Veículo': 'Motocicleta',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
    XLSX.writeFile(wb, 'modelo_importacao_colaboradores.xlsx');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Importação da Base de Colaboradores
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atualize o cadastro oficial corporativo a partir de arquivos XLSX ou CSV sem duplicar colaboradores.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#1677FF]" />
          <span>Baixar Modelo Oficial (.xlsx)</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-[#1677FF] bg-white rounded-2xl p-8 text-center transition cursor-pointer space-y-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1677FF] flex items-center justify-center mx-auto">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <span className="text-sm font-bold text-slate-800 block">
            {file ? file.name : 'Arraste a planilha de colaboradores aqui ou clique para selecionar'}
          </span>
          <span className="text-xs text-slate-500 block mt-1">
            Formatos suportados: Microsoft Excel (.xlsx, .xls) ou Texto delimitado (.csv)
          </span>
        </div>
      </div>

      {/* File Loaded & Mapping Stage */}
      {headers.length > 0 && !importResult && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#101C2C]">Mapeamento de Cabeçalhos</h3>
              <span className="text-xs text-slate-500">
                Associe as colunas do seu arquivo aos campos do sistema:
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {parsedRows.length} linhas identificadas
            </span>
          </div>

          {/* Mapping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nome do Colaborador *
              </label>
              <select
                value={fieldMapping.nome}
                onChange={(e) => {
                  const m = { ...fieldMapping, nome: e.target.value };
                  setFieldMapping(m);
                  runValidation(parsedRows, m);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Selecione a coluna...</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Matrícula Funcional
              </label>
              <select
                value={fieldMapping.matricula}
                onChange={(e) => {
                  const m = { ...fieldMapping, matricula: e.target.value };
                  setFieldMapping(m);
                  runValidation(parsedRows, m);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Selecione a coluna...</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Base Operacional *
              </label>
              <select
                value={fieldMapping.base}
                onChange={(e) => {
                  const m = { ...fieldMapping, base: e.target.value };
                  setFieldMapping(m);
                  runValidation(parsedRows, m);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Selecione a coluna...</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Função / Cargo
              </label>
              <select
                value={fieldMapping.funcao}
                onChange={(e) => {
                  const m = { ...fieldMapping, funcao: e.target.value };
                  setFieldMapping(m);
                  runValidation(parsedRows, m);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Selecione a coluna...</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gerência
              </label>
              <select
                value={fieldMapping.gerencia}
                onChange={(e) => {
                  const m = { ...fieldMapping, gerencia: e.target.value };
                  setFieldMapping(m);
                  runValidation(parsedRows, m);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Selecione a coluna...</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo de Veículo
              </label>
              <select
                value={fieldMapping.tipoVeiculo}
                onChange={(e) => {
                  const m = { ...fieldMapping, tipoVeiculo: e.target.value };
                  setFieldMapping(m);
                  runValidation(parsedRows, m);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Selecione a coluna...</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Validation Summary */}
          {validationPreview && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Prévia da Validação:</span>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {validationPreview.valid} registros válidos
                </span>
                {validationPreview.errors.length > 0 && (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {validationPreview.errors.length} inconsistências (serão rejeitadas)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Table Preview (First 5 lines) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              Pré-visualização dos Primeiros Registros:
            </span>
            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="px-3 py-2">Matrícula</th>
                    <th className="px-3 py-2">Nome</th>
                    <th className="px-3 py-2">Base</th>
                    <th className="px-3 py-2">Função</th>
                    <th className="px-3 py-2">Veículo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono">{row[fieldMapping.matricula] || '—'}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{row[fieldMapping.nome] || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row[fieldMapping.base] || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row[fieldMapping.funcao] || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row[fieldMapping.tipoVeiculo] || 'Carro/Caminhonete'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Execution Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setFile(null);
                setHeaders([]);
                setParsedRows([]);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={isImporting || !fieldMapping.nome || !fieldMapping.base}
              className="px-6 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer disabled:bg-slate-300"
            >
              {isImporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processando Base...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Confirmar Importação</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Import Result Feedback */}
      {importResult && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Importação Concluída com Sucesso!
              </h3>
              <p className="text-xs text-emerald-800">
                A base corporativa foi sincronizada e preservou o histórico de avaliações já realizadas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Total de Linhas</span>
              <span className="text-lg font-bold font-mono text-slate-800">
                {importResult.importRecord.totalLinhas}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 block">Novos Condutores</span>
              <span className="text-lg font-bold font-mono text-emerald-700">
                +{importResult.importRecord.adicionados}
              </span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-blue-700 block">Registros Atualizados</span>
              <span className="text-lg font-bold font-mono text-[#1677FF]">
                {importResult.importRecord.atualizados}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Total Atual na Base</span>
              <span className="text-lg font-bold font-mono text-[#101C2C]">
                {importResult.totalBase}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                setFile(null);
                setHeaders([]);
                setParsedRows([]);
                setImportResult(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
            >
              Realizar Nova Importação
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
