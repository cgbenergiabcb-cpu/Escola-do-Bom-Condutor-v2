import {
  Collaborator,
  Question,
  TheoreticalAttempt,
  PracticalAssessment,
  PracticalCriterion,
  Instructor,
  SystemSettings,
  AuditLog,
  UserAuth,
  UserItem,
  AppContent,
} from '../types/index.js';

const API_BASE = '/api';

export const api = {
  // Authentication
  async login(credentials: { email: string; password?: string; role?: string }): Promise<{ user: UserAuth; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao autenticar.');
    }
    return res.json();
  },

  async register(data: { nome: string; email: string; password: string; perfil?: string }): Promise<{ user: UserAuth; token: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao realizar cadastro.');
    }
    return res.json();
  },

  // Users Management
  async getUsers(params?: Record<string, string>): Promise<{ users: UserItem[]; total: number }> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/users?${query}`);
    if (!res.ok) throw new Error('Erro ao listar usuários.');
    return res.json();
  },

  async createUser(data: { nome: string; email: string; password: string; perfil: string; ativo?: boolean }): Promise<{ user: UserItem }> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao cadastrar usuário.');
    }
    return res.json();
  },

  async updateUser(id: string, data: Partial<{ nome: string; email: string; password?: string; perfil: string; ativo: boolean }>): Promise<{ user: UserItem }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar usuário.');
    }
    return res.json();
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao excluir usuário.');
    }
    return res.json();
  },

  // App Content Management
  async getContent(): Promise<{ content: AppContent }> {
    const res = await fetch(`${API_BASE}/content`);
    if (!res.ok) throw new Error('Erro ao obter conteúdo do aplicativo.');
    return res.json();
  },

  async updateContent(data: Partial<AppContent>): Promise<{ content: AppContent; message: string }> {
    const res = await fetch(`${API_BASE}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar conteúdo.');
    }
    return res.json();
  },

  // Collaborator search with debounce
  async searchCollaborators(q: string): Promise<{ results: Collaborator[]; total: number }> {
    const res = await fetch(`${API_BASE}/collaborators/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Erro ao buscar colaboradores.');
    return res.json();
  },

  // Collaborators List & CRUD
  async getCollaborators(params?: Record<string, string>): Promise<{
    collaborators: Collaborator[];
    total: number;
    bases: string[];
    gerencias: string[];
    funcoes: string[];
  }> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/collaborators?${query}`);
    if (!res.ok) throw new Error('Erro ao listar colaboradores.');
    return res.json();
  },

  async getCollaborator(id: string): Promise<{
    collaborator: Collaborator;
    attempts: TheoreticalAttempt[];
    practicalAssessments: PracticalAssessment[];
  }> {
    const res = await fetch(`${API_BASE}/collaborators/${id}`);
    if (!res.ok) throw new Error('Colaborador não encontrado.');
    return res.json();
  },

  async createCollaborator(data: Partial<Collaborator>): Promise<{ collaborator: Collaborator }> {
    const res = await fetch(`${API_BASE}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao cadastrar colaborador.');
    }
    return res.json();
  },

  async updateCollaborator(id: string, data: Partial<Collaborator>): Promise<{ collaborator: Collaborator }> {
    const res = await fetch(`${API_BASE}/collaborators/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar colaborador.');
    }
    return res.json();
  },

  // Spreadsheet Import
  async importCollaborators(payload: {
    rows: any[];
    filename: string;
    user?: string;
  }): Promise<{ success: boolean; importRecord: any; totalBase: number }> {
    const res = await fetch(`${API_BASE}/collaborators/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro na importação da planilha.');
    }
    return res.json();
  },

  // Questions Bank
  async getQuestions(params?: Record<string, string>): Promise<{
    questoes: Question[];
    total: number;
    temas: string[];
  }> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/questions?${query}`);
    if (!res.ok) throw new Error('Erro ao listar questões.');
    return res.json();
  },

  async createQuestion(data: Partial<Question>): Promise<{ question: Question }> {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao cadastrar questão.');
    }
    return res.json();
  },

  async updateQuestion(id: string, data: Partial<Question>): Promise<{ question: Question }> {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar questão.');
    }
    return res.json();
  },

  // Theoretical Exam
  async startExam(collaboratorId: string): Promise<{
    attemptId: string;
    collaborator: Collaborator;
    tempoMaximoMinutos: number;
    totalQuestoes: number;
    questoes: Array<{
      id: string;
      index: number;
      codigo: string;
      enunciado: string;
      categoriaVeiculo: string;
      tema: string;
      alternativas: Array<{ letra: 'A' | 'B' | 'C' | 'D' | 'E'; texto: string }>;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/exam/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collaboratorId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao iniciar avaliação.');
    }
    return res.json();
  },

  async submitExam(payload: {
    attemptId: string;
    respostas: Record<string, string>;
    duracaoSegundos: number;
  }): Promise<{
    attempt: TheoreticalAttempt;
    message: string;
    alreadySubmitted?: boolean;
  }> {
    const res = await fetch(`${API_BASE}/exam/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao enviar respostas.');
    }
    return res.json();
  },

  // Practical Assessment
  async getPracticalCriteria(): Promise<{ criterios: PracticalCriterion[] }> {
    const res = await fetch(`${API_BASE}/practical/criteria`);
    if (!res.ok) throw new Error('Erro ao carregar critérios práticos.');
    return res.json();
  },

  async submitPracticalAssessment(payload: any): Promise<{ assessment: PracticalAssessment; collaborator: Collaborator }> {
    const res = await fetch(`${API_BASE}/practical/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao salvar avaliação prática.');
    }
    return res.json();
  },

  async getPracticalAssessment(id: string): Promise<{
    assessment: PracticalAssessment;
    collaborator: Collaborator;
    criteriosDefinicao: PracticalCriterion[];
  }> {
    const res = await fetch(`${API_BASE}/practical/assessments/${id}`);
    if (!res.ok) throw new Error('Avaliação prática não encontrada.');
    return res.json();
  },

  // Instructors
  async getInstructors(): Promise<{ instrutores: Instructor[] }> {
    const res = await fetch(`${API_BASE}/instructors`);
    if (!res.ok) throw new Error('Erro ao carregar instrutores.');
    return res.json();
  },

  async createInstructor(data: Partial<Instructor>): Promise<{ instructor: Instructor }> {
    const res = await fetch(`${API_BASE}/instructors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao cadastrar instrutor.');
    }
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Erro ao obter métricas do dashboard.');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<{ settings: SystemSettings }> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Erro ao obter configurações.');
    return res.json();
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<{ settings: SystemSettings }> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao atualizar configurações.');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(params?: Record<string, string>): Promise<{ logs: AuditLog[]; total: number }> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/audit-logs?${query}`);
    if (!res.ok) throw new Error('Erro ao carregar logs de auditoria.');
    return res.json();
  },
};
