import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Instructor } from '../../types/index.js';
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  X,
  Mail,
  Phone,
  Building2,
  Award,
} from 'lucide-react';

export const InstructorsView: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State
  const [nome, setNome] = useState('');
  const [credencial, setCredencial] = useState('');
  const [base, setBase] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getInstructors();
      setInstructors(data.instrutores);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !credencial || !base || !email) return;

    setIsSaving(true);
    try {
      await api.createInstructor({
        nome,
        credencial,
        base,
        email,
        telefone,
      });
      setIsNewModalOpen(false);
      setNome('');
      setCredencial('');
      setBase('');
      setEmail('');
      setTelefone('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar instrutor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Instrutores Credenciados de Trânsito
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profissionais autorizados a conduzir e homologar as avaliações veiculares práticas.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Instrutor</span>
        </button>
      </div>

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 py-12 text-center text-xs text-slate-500">
            Carregando instrutores...
          </div>
        ) : instructors.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            Nenhum instrutor cadastrado.
          </div>
        ) : (
          instructors.map((inst) => (
            <div
              key={inst.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1677FF] border border-blue-200 flex items-center justify-center font-bold text-sm">
                    {inst.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#101C2C]">{inst.nome}</h3>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      {inst.credencial}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Ativo
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-800">{inst.base}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{inst.email}</span>
                </div>
                {inst.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inst.telefone}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: New Instructor */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101C2C]">Cadastrar Novo Instrutor</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstructor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Paulo Roberto da Silva"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Credencial DETRAN *</label>
                <input
                  type="text"
                  required
                  value={credencial}
                  onChange={(e) => setCredencial(e.target.value)}
                  placeholder="Ex.: DETRAN-MA/84920-A/B"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base de Atuação *</label>
                <input
                  type="text"
                  required
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  placeholder="Ex.: Base São Luís"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paulo.silva@bomcondutor.corp"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefone / Ramal</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(98) 98842-1020"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#1677FF] text-white font-bold hover:bg-[#1677FF]/90 cursor-pointer"
                >
                  {isSaving ? 'Cadastrando...' : 'Salvar Instrutor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
