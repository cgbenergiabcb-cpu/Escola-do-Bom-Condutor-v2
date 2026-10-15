import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { UserAuth } from '../../types/index.js';
import { Lock, Mail, Key, ShieldCheck, X, UserPlus, LogIn, AlertCircle, CheckCircle2, User } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAuth) => void;
  initialMode?: 'login' | 'register';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [perfil, setPerfil] = useState<'Gestor' | 'Instrutor' | 'Administrador'>('Gestor');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await api.login({ email, password });
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.register({
        nome,
        email,
        password,
        perfil,
      });
      setSuccessMsg('Conta criada com sucesso! Entrando...');
      setTimeout(() => {
        onSuccess(data.user);
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar inscrição.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string, presetPass: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.login({ email: presetEmail, password: presetPass });
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#101C2C] text-[#36D6E7] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#101C2C]">Autenticação Corporativa</h2>
              <span className="text-[11px] text-slate-500 block">Gestão, Instrutores e Administradores</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher: Entrar vs Cadastre-se */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#101C2C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Fazer Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#101C2C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Nova Conta</span>
          </button>
        </div>

        {mode === 'login' ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Quick demo presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Atalhos Rápidos de Acesso (Homologação):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@bomcondutor.corp', 'admin123')}
                  className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-left transition cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#1677FF] block">Administrador</span>
                  <span className="text-[10px] text-slate-500 block">Acesso irrestrito</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('paulo.silva@bomcondutor.corp', 'instrutor123')}
                  className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition cursor-pointer"
                >
                  <span className="text-xs font-bold text-emerald-700 block">Instrutor Paulo</span>
                  <span className="text-[10px] text-slate-500 block">Avaliação prática</span>
                </button>
              </div>
            </div>

            <div className="relative flex py-0.5 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-2 text-slate-400 text-[10px] uppercase tracking-wider">
                Ou use suas credenciais
              </span>
              <div className="grow border-t border-slate-200"></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com.br"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#101C2C] hover:bg-[#101C2C]/90 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 shadow-sm"
            >
              {isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Carlos Mendes Rocha"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#1677FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Corporativo *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos.mendes@empresa.com.br"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#1677FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha (mín. 6 chars) *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#1677FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#1677FF]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perfil de Acesso Solicitado
              </label>
              <select
                value={perfil}
                onChange={(e) => setPerfil(e.target.value as any)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="Gestor">Gestor do Programa (Acompanhamento e Relatórios)</option>
                <option value="Instrutor">Instrutor Credenciado (Avaliação Prática)</option>
                <option value="Administrador">Administrador Geral (Acesso Integral)</option>
              </select>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 shadow-sm"
            >
              {isLoading ? 'Cadastrando...' : 'Criar Conta e Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
