import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { UserItem } from '../../types/index.js';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  Key,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Calendar,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerfil, setSelectedPerfil] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  // Modals
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState<'Administrador' | 'Gestor' | 'Instrutor'>('Gestor');
  const [ativo, setAtivo] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers({
        search: searchTerm,
        perfil: selectedPerfil !== 'Todos' ? selectedPerfil : '',
        status: selectedStatus !== 'Todos' ? selectedStatus : '',
      });
      setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedPerfil, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setNome('');
    setEmail('');
    setPassword('');
    setPerfil('Gestor');
    setAtivo(true);
    setFormError('');
    setIsNewUserModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setNome(user.nome);
    setEmail(user.email);
    setPassword(''); // optional reset
    setPerfil(user.perfil);
    setAtivo(user.ativo);
    setFormError('');
    setIsNewUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          nome,
          email,
          perfil,
          ativo,
          ...(password ? { password } : {}),
        });
      } else {
        if (!password || password.length < 6) {
          setFormError('A senha deve conter no mínimo 6 caracteres.');
          setIsSaving(false);
          return;
        }
        await api.createUser({
          nome,
          email,
          password,
          perfil,
          ativo,
        });
      }
      setIsNewUserModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar usuário.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await api.deleteUser(deletingUser.id);
      setDeletingUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir usuário.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101C2C] tracking-tight">
            Gestão de Usuários e Permissões
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre, edite perfis e controle o acesso administrativo de gestores e instrutores.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar usuário por nome ou e-mail corporativo..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#1677FF] text-xs"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedPerfil}
            onChange={(e) => setSelectedPerfil(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white font-medium text-xs"
          >
            <option value="Todos">Todos os Perfis</option>
            <option value="Administrador">Administrador</option>
            <option value="Gestor">Gestor</option>
            <option value="Instrutor">Instrutor</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white font-medium text-xs"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Apenas Ativos</option>
            <option value="Inativo">Apenas Inativos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Nome / Usuário</th>
                <th className="px-4 py-3">E-mail Corporativo</th>
                <th className="px-4 py-3">Perfil de Acesso</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Último Login</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Carregando usuários...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Nenhum usuário localizado.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{u.nome}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold text-[11px] px-2.5 py-0.5 rounded-md ${
                          u.perfil === 'Administrador'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.perfil === 'Instrutor'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {u.perfil}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                          u.ativo ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${u.ativo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {u.ultimoLogin
                        ? new Date(u.ultimoLogin).toLocaleString('pt-BR')
                        : 'Nunca acessou'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1 text-slate-500 hover:text-slate-900 transition rounded-md hover:bg-slate-100 cursor-pointer"
                          title="Editar usuário"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1 text-rose-500 hover:text-rose-700 transition rounded-md hover:bg-rose-50 cursor-pointer"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit User */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101C2C]">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
              </h3>
              <button
                onClick={() => setIsNewUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Carlos Mendes Rocha"
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
                  placeholder="carlos.mendes@empresa.com.br"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso (mín. 6 chars) *'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Perfil de Acesso *</label>
                  <select
                    value={perfil}
                    onChange={(e) => setPerfil(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Gestor">Gestor</option>
                    <option value="Instrutor">Instrutor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status da Conta</label>
                  <select
                    value={ativo ? 'ativo' : 'inativo'}
                    onChange={(e) => setAtivo(e.target.value === 'ativo')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-xs text-rose-600 font-medium">{formError}</p>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#1677FF] text-white font-bold hover:bg-[#1677FF]/90 cursor-pointer"
                >
                  {isSaving ? 'Salvando...' : editingUser ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete User */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-[#101C2C]">Excluir Usuário</h3>
            <p className="text-xs text-slate-600">
              Tem certeza de que deseja remover a conta de <strong>{deletingUser.nome}</strong> ({deletingUser.email})? Esta ação não pode ser desfeita.
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-xs text-slate-600 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
