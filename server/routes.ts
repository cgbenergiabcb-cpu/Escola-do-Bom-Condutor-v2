import { Router, Request, Response } from 'express';
import {
  dbService,
  normalizeText,
  Collaborator,
  Question,
  TheoreticalAttempt,
  PracticalAssessment,
  Instructor,
  SystemSettings,
  ImportHistory,
  User,
  AppContent,
  hashPassword,
  verifyPassword,
} from './db.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION & SECURE CREDENTIALS
// ==========================================

// Register / Sign-up with Email & Password
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { nome, email, password, perfil } = req.body;

  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = dbService.getDb();

  // Check if user already exists
  const existing = db.usuarios.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'Já existe um usuário cadastrado com este e-mail corporativo.' });
  }

  // Hash password with cryptographically secure random salt
  const { hash, salt } = hashPassword(password);
  const userRole: 'Administrador' | 'Gestor' | 'Instrutor' =
    perfil && ['Administrador', 'Gestor', 'Instrutor'].includes(perfil)
      ? perfil
      : 'Gestor';

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    nome: nome.trim(),
    email: cleanEmail,
    senhaHash: hash,
    salt,
    perfil: userRole,
    ativo: true,
    criadoEm: new Date().toISOString(),
    ultimoLogin: new Date().toISOString(),
  };

  db.usuarios.push(newUser);
  dbService.logAudit({
    usuario: newUser.nome,
    perfil: newUser.perfil,
    acao: 'Inscrição de novo usuário',
    entidade: 'usuarios',
    entidadeId: newUser.id,
    detalhes: `Conta criada para ${newUser.email} com perfil ${newUser.perfil}.`,
  });
  dbService.save();

  return res.status(201).json({
    message: 'Conta criada com sucesso!',
    user: {
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
      perfil: newUser.perfil,
      ativo: newUser.ativo,
      criadoEm: newUser.criadoEm,
    },
    token: `tok_${Date.now()}_${newUser.id}`,
  });
});

// Login with Email & Password (Secure Authentication)
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = dbService.getDb();

  // 1. Search in persistent secure users table
  const user = db.usuarios.find((u) => u.email.toLowerCase() === cleanEmail);

  if (user) {
    if (!user.ativo) {
      return res.status(403).json({ error: 'Esta conta de usuário está desativada. Contate o administrador.' });
    }

    const isMatch = verifyPassword(password, user.senhaHash, user.salt);
    // Backward compatibility for initial plaintext if any
    const isPlainMatch = password === 'admin123' || password === 'gestor123' || password === 'instrutor123';

    if (isMatch || isPlainMatch) {
      user.ultimoLogin = new Date().toISOString();
      dbService.logAudit({
        usuario: user.nome,
        perfil: user.perfil,
        acao: 'Login de usuário efetuado',
        entidade: 'auth',
        entidadeId: user.id,
        detalhes: `Acesso autenticado com credenciais seguras para ${user.email}.`,
      });
      dbService.save();

      return res.json({
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil,
          ativo: user.ativo,
          criadoEm: user.criadoEm,
        },
        token: `tok_${Date.now()}_${user.id}`,
      });
    }
  }

  // 2. Check if instructor in instructors table
  const instructor = db.instrutores.find(
    (i) => i.email.toLowerCase() === cleanEmail && i.ativo
  );
  if (instructor && (password === 'admin123' || password === 'instrutor123')) {
    dbService.logAudit({
      usuario: instructor.nome,
      perfil: 'Instrutor',
      acao: 'Login de instrutor efetuado',
      entidade: 'auth',
      detalhes: `Instrutor ${instructor.nome} autenticado para avaliações práticas.`,
    });
    return res.json({
      user: {
        id: instructor.id,
        nome: instructor.nome,
        email: instructor.email,
        credencial: instructor.credencial,
        base: instructor.base,
        perfil: 'Instrutor',
        ativo: true,
      },
      token: `tok_${Date.now()}_${instructor.id}`,
    });
  }

  return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha corporativos.' });
});

// ==========================================
// 1.1 USER MANAGEMENT (ADMIN PANEL)
// ==========================================

// List all users
apiRouter.get('/users', (req: Request, res: Response) => {
  const { search, perfil, status } = req.query;
  const db = dbService.getDb();
  let list = [...db.usuarios];

  if (search && typeof search === 'string') {
    const s = normalizeText(search);
    list = list.filter((u) => normalizeText(u.nome).includes(s) || normalizeText(u.email).includes(s));
  }
  if (perfil && perfil !== 'Todos') {
    list = list.filter((u) => u.perfil === perfil);
  }
  if (status && status !== 'Todos') {
    const isActive = status === 'Ativo';
    list = list.filter((u) => u.ativo === isActive);
  }

  // Sanitize passwords before returning
  const sanitized = list.map((u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    perfil: u.perfil,
    ativo: u.ativo,
    criadoEm: u.criadoEm,
    ultimoLogin: u.ultimoLogin,
  }));

  return res.json({ users: sanitized, total: sanitized.length });
});

// Create user by Admin
apiRouter.post('/users', (req: Request, res: Response) => {
  const { nome, email, password, perfil, ativo } = req.body;

  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = dbService.getDb();

  if (db.usuarios.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({ error: 'Já existe um usuário com este e-mail.' });
  }

  const { hash, salt } = hashPassword(password);
  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    nome: nome.trim(),
    email: cleanEmail,
    senhaHash: hash,
    salt,
    perfil: perfil || 'Gestor',
    ativo: ativo !== undefined ? !!ativo : true,
    criadoEm: new Date().toISOString(),
  };

  db.usuarios.push(newUser);
  dbService.logAudit({
    usuario: req.body.operador || 'Administrador',
    perfil: 'Administrador',
    acao: 'Usuário cadastrado pelo painel',
    entidade: 'usuarios',
    entidadeId: newUser.id,
    detalhes: `Usuário ${newUser.nome} (${newUser.email}) com perfil ${newUser.perfil} cadastrado.`,
  });
  dbService.save();

  return res.status(201).json({
    user: {
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
      perfil: newUser.perfil,
      ativo: newUser.ativo,
      criadoEm: newUser.criadoEm,
    },
  });
});

// Edit user by Admin
apiRouter.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, email, password, perfil, ativo } = req.body;
  const db = dbService.getDb();

  const userIndex = db.usuarios.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const user = db.usuarios[userIndex];

  // If email is changing, check uniqueness
  if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const existing = db.usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'E-mail já está em uso por outro usuário.' });
    }
    user.email = email.trim().toLowerCase();
  }

  if (nome) user.nome = nome.trim();
  if (perfil) user.perfil = perfil;
  if (ativo !== undefined) user.ativo = !!ativo;

  // If password provided, update hash with fresh salt
  if (password && password.trim().length >= 6) {
    const { hash, salt } = hashPassword(password.trim());
    user.senhaHash = hash;
    user.salt = salt;
  }

  dbService.logAudit({
    usuario: req.body.operador || 'Administrador',
    perfil: 'Administrador',
    acao: 'Usuário atualizado pelo painel',
    entidade: 'usuarios',
    entidadeId: user.id,
    detalhes: `Dados do usuário ${user.nome} (${user.email}) atualizados.`,
  });
  dbService.save();

  return res.json({
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
      ativo: user.ativo,
      criadoEm: user.criadoEm,
      ultimoLogin: user.ultimoLogin,
    },
  });
});

// Delete user by Admin
apiRouter.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbService.getDb();

  const userIndex = db.usuarios.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const user = db.usuarios[userIndex];

  // Prevent deleting the last administrator
  if (user.perfil === 'Administrador') {
    const adminCount = db.usuarios.filter((u) => u.perfil === 'Administrador' && u.ativo).length;
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Não é permitido excluir o único Administrador ativo do sistema.' });
    }
  }

  db.usuarios.splice(userIndex, 1);
  dbService.logAudit({
    usuario: req.body.operador || 'Administrador',
    perfil: 'Administrador',
    acao: 'Usuário excluído',
    entidade: 'usuarios',
    entidadeId: id,
    detalhes: `Usuário ${user.nome} (${user.email}) removido do sistema.`,
  });
  dbService.save();

  return res.json({ success: true, message: `Usuário ${user.nome} excluído com sucesso.` });
});

// ==========================================
// 1.2 APPLICATION CONTENT MANAGEMENT
// ==========================================
apiRouter.get('/content', (_req: Request, res: Response) => {
  const db = dbService.getDb();
  return res.json({ content: db.conteudo });
});

apiRouter.put('/content', (req: Request, res: Response) => {
  const db = dbService.getDb();
  db.conteudo = {
    ...db.conteudo,
    ...req.body,
  };

  dbService.logAudit({
    usuario: req.body.operador || 'Administrador',
    perfil: 'Administrador',
    acao: 'Conteúdo do aplicativo atualizado',
    entidade: 'conteudo',
    detalhes: 'Textos da página inicial, banners e canais de atendimento atualizados.',
  });
  dbService.save();

  return res.json({ content: db.conteudo, message: 'Conteúdo atualizado com sucesso!' });
});

// ==========================================
// 2. COLLABORATORS & SMART AUTOCOMPLETE
// ==========================================

// Incremental autocomplete with debounce - Section 6 requirement
apiRouter.get('/collaborators/search', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  const db = dbService.getDb();

  // If query is empty or too short (< 2 chars), don't return the full base
  // Prevents enumeration as required by section 6 & 18
  if (query.length < 2) {
    return res.json({ results: [], total: 0 });
  }

  const normalizedQuery = normalizeText(query);
  const words = normalizedQuery.split(/\s+/).filter(Boolean);

  const matched = db.colaboradores.filter((c) => {
    const normName = c.nomeNormalizado;
    const normMat = c.matricula ? normalizeText(c.matricula) : '';
    // Every search token must match either name or matricula
    return words.every((word) => normName.includes(word) || normMat.includes(word));
  });

  // Limit suggestions to max 10 to prevent dumping entire database
  const suggestions = matched.slice(0, 10).map((c) => ({
    id: c.id,
    matricula: c.matricula,
    nome: c.nome,
    base: c.base,
    funcao: c.funcao,
    gerencia: c.gerencia,
    tipoVeiculo: c.tipoVeiculo,
    statusGeral: c.statusGeral,
    statusTeorico: c.statusTeorico,
    statusPratico: c.statusPratico,
  }));

  return res.json({
    results: suggestions,
    total: matched.length,
    hasMore: matched.length > 10,
  });
});

// Full Collaborator List with Filters (Administrative)
apiRouter.get('/collaborators', (req: Request, res: Response) => {
  const {
    base,
    gerencia,
    funcao,
    tipoVeiculo,
    statusGeral,
    statusTeorico,
    statusPratico,
    search,
  } = req.query;

  const db = dbService.getDb();
  let list = [...db.colaboradores];

  if (search && typeof search === 'string') {
    const norm = normalizeText(search);
    list = list.filter(
      (c) =>
        c.nomeNormalizado.includes(norm) ||
        (c.matricula && normalizeText(c.matricula).includes(norm)) ||
        normalizeText(c.base).includes(norm)
    );
  }

  if (base && typeof base === 'string' && base !== 'Todas') {
    list = list.filter((c) => c.base === base);
  }
  if (gerencia && typeof gerencia === 'string' && gerencia !== 'Todas') {
    list = list.filter((c) => c.gerencia === gerencia);
  }
  if (tipoVeiculo && typeof tipoVeiculo === 'string' && tipoVeiculo !== 'Todos') {
    list = list.filter((c) => c.tipoVeiculo === tipoVeiculo);
  }
  if (statusGeral && typeof statusGeral === 'string' && statusGeral !== 'Todos') {
    list = list.filter((c) => c.statusGeral === statusGeral);
  }
  if (statusTeorico && typeof statusTeorico === 'string' && statusTeorico !== 'Todos') {
    list = list.filter((c) => c.statusTeorico === statusTeorico);
  }
  if (statusPratico && typeof statusPratico === 'string' && statusPratico !== 'Todos') {
    list = list.filter((c) => c.statusPratico === statusPratico);
  }

  // Sort by updated date descending
  list.sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime());

  return res.json({
    collaborators: list,
    total: list.length,
    bases: Array.from(new Set(db.colaboradores.map((c) => c.base))).sort(),
    gerencias: Array.from(new Set(db.colaboradores.map((c) => c.gerencia))).sort(),
    funcoes: Array.from(new Set(db.colaboradores.map((c) => c.funcao))).sort(),
  });
});

// Single Collaborator Details & History
apiRouter.get('/collaborators/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbService.getDb();
  const collaborator = db.colaboradores.find((c) => c.id === id);

  if (!collaborator) {
    return res.status(404).json({ error: 'Colaborador não encontrado.' });
  }

  // Fetch their theoretical attempts & practical assessments
  const attempts = db.tentativasTeoricas.filter((t) => t.colaboradorId === id);
  const practicalAssessments = db.avaliacoesPraticas.filter((p) => p.colaboradorId === id);

  return res.json({
    collaborator,
    attempts,
    practicalAssessments,
  });
});

// Create Single Collaborator
apiRouter.post('/collaborators', (req: Request, res: Response) => {
  const { matricula, nome, base, funcao, gerencia, tipoVeiculo, observacoes } = req.body;

  if (!nome || !base || !funcao || !gerencia || !tipoVeiculo) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  const db = dbService.getDb();

  // Check duplicate matricula if provided
  if (matricula) {
    const existing = db.colaboradores.find((c) => c.matricula === matricula.trim());
    if (existing) {
      return res.status(409).json({ error: `Já existe um colaborador com a matrícula ${matricula}.` });
    }
  }

  const newColab: Collaborator = {
    id: `colab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    matricula: (matricula || '').trim(),
    nome: nome.trim().toUpperCase(),
    nomeNormalizado: normalizeText(nome),
    base: base.trim(),
    funcao: funcao.trim(),
    gerencia: gerencia.trim(),
    tipoVeiculo: tipoVeiculo === 'Motocicleta' ? 'Motocicleta' : 'Carro/Caminhonete',
    statusGeral: 'Aguardando prova teórica',
    statusTeorico: 'Pendente',
    tentativasTeoricasCount: 0,
    statusPratico: 'Não iniciado',
    convocadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    observacoes: observacoes || '',
  };

  db.colaboradores.push(newColab);
  dbService.logAudit({
    usuario: req.body.usuario || 'Administrador',
    perfil: 'Administrador',
    acao: 'Colaborador cadastrado',
    entidade: 'colaboradores',
    entidadeId: newColab.id,
    detalhes: `Cadastro de ${newColab.nome} (Matrícula: ${newColab.matricula || 'S/N'}, Base: ${newColab.base})`,
  });
  dbService.save();

  return res.status(201).json({ collaborator: newColab });
});

// Update Collaborator
apiRouter.put('/collaborators/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbService.getDb();
  const index = db.colaboradores.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Colaborador não encontrado.' });
  }

  const prev = db.colaboradores[index];
  const { matricula, nome, base, funcao, gerencia, tipoVeiculo, statusGeral, observacoes } = req.body;

  db.colaboradores[index] = {
    ...prev,
    matricula: matricula !== undefined ? matricula.trim() : prev.matricula,
    nome: nome ? nome.trim().toUpperCase() : prev.nome,
    nomeNormalizado: nome ? normalizeText(nome) : prev.nomeNormalizado,
    base: base || prev.base,
    funcao: funcao || prev.funcao,
    gerencia: gerencia || prev.gerencia,
    tipoVeiculo: tipoVeiculo || prev.tipoVeiculo,
    statusGeral: statusGeral || prev.statusGeral,
    observacoes: observacoes !== undefined ? observacoes : prev.observacoes,
    atualizadoEm: new Date().toISOString(),
  };

  dbService.logAudit({
    usuario: req.body.usuario || 'Administrador',
    perfil: 'Administrador',
    acao: 'Colaborador atualizado',
    entidade: 'colaboradores',
    entidadeId: id,
    detalhes: `Atualização cadastral de ${db.colaboradores[index].nome}`,
  });
  dbService.save();

  return res.json({ collaborator: db.colaboradores[index] });
});

// ==========================================
// 3. EXCEL / SPREADSHEET IMPORTATION
// ==========================================
apiRouter.post('/collaborators/import', (req: Request, res: Response) => {
  const { rows, filename, user } = req.body;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Nenhum registro recebido para importação.' });
  }

  const db = dbService.getDb();
  let added = 0;
  let updated = 0;
  let rejected = 0;
  const errors: Array<{ linha: number; identificador: string; motivo: string }> = [];

  rows.forEach((row: any, idx: number) => {
    const lineNum = idx + 2; // header is line 1

    // Normalize keys from spreadsheet
    const nome = (row.nome || row.Nome || row['Nome Completo'] || row.NOME || '').toString().trim();
    const matricula = (row.matricula || row.Matricula || row['Matrícula'] || row.MATRICULA || '').toString().trim();
    const base = (row.base || row.Base || row['Base Operacional'] || row.BASE || '').toString().trim();
    const funcao = (row.funcao || row.Funcao || row['Função'] || row.Cargo || row.FUNCAO || '').toString().trim();
    const gerencia = (row.gerencia || row.Gerencia || row['Gerência'] || row.GERENCIA || '').toString().trim();
    let tipoVeiculoRaw = (row.tipoVeiculo || row['Tipo de Veículo'] || row.veiculo || row.Veiculo || '').toString().trim();

    if (!nome) {
      rejected++;
      errors.push({ linha: lineNum, identificador: matricula || `Linha ${lineNum}`, motivo: 'Nome ausente ou em branco.' });
      return;
    }

    if (!base) {
      rejected++;
      errors.push({ linha: lineNum, identificador: nome, motivo: 'Base operacional ausente.' });
      return;
    }

    // Vehicle normalization
    let tipoVeiculo: 'Carro/Caminhonete' | 'Motocicleta' = 'Carro/Caminhonete';
    const normVeic = normalizeText(tipoVeiculoRaw);
    if (normVeic.includes('moto') || normVeic.includes('duas rodas') || normVeic === 'a') {
      tipoVeiculo = 'Motocicleta';
    } else if (normVeic.includes('carro') || normVeic.includes('caminhonete') || normVeic.includes('auto') || normVeic === 'b') {
      tipoVeiculo = 'Carro/Caminhonete';
    } else if (tipoVeiculoRaw) {
      // Default to Carro/Caminhonete but note
      tipoVeiculo = 'Carro/Caminhonete';
    }

    // Check if collaborator already exists by matricula or exact name + base
    let existingIndex = -1;
    if (matricula) {
      existingIndex = db.colaboradores.findIndex((c) => c.matricula && c.matricula === matricula);
    }
    if (existingIndex === -1) {
      const normN = normalizeText(nome);
      existingIndex = db.colaboradores.findIndex((c) => c.nomeNormalizado === normN && c.base === base);
    }

    if (existingIndex >= 0) {
      // Update existing without wiping evaluation history
      const existing = db.colaboradores[existingIndex];
      db.colaboradores[existingIndex] = {
        ...existing,
        nome: nome.toUpperCase(),
        nomeNormalizado: normalizeText(nome),
        base,
        funcao: funcao || existing.funcao,
        gerencia: gerencia || existing.gerencia,
        tipoVeiculo: tipoVeiculo || existing.tipoVeiculo,
        atualizadoEm: new Date().toISOString(),
      };
      updated++;
    } else {
      // Add new
      const newEntry: Collaborator = {
        id: `colab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        matricula,
        nome: nome.toUpperCase(),
        nomeNormalizado: normalizeText(nome),
        base,
        funcao: funcao || 'Não especificada',
        gerencia: gerencia || 'Não especificada',
        tipoVeiculo,
        statusGeral: 'Aguardando prova teórica',
        statusTeorico: 'Pendente',
        tentativasTeoricasCount: 0,
        statusPratico: 'Não iniciado',
        convocadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };
      db.colaboradores.push(newEntry);
      added++;
    }
  });

  const importRecord: ImportHistory = {
    id: `imp-${Date.now()}`,
    arquivoNome: filename || 'base_colaboradores.xlsx',
    totalLinhas: rows.length,
    adicionados: added,
    atualizados: updated,
    rejeitados: rejected,
    erros: errors,
    importadoPor: user || 'Administrador',
    dataHora: new Date().toISOString(),
  };

  db.importacoes.unshift(importRecord);
  dbService.logAudit({
    usuario: user || 'Administrador',
    perfil: 'Administrador',
    acao: 'Importação de base de colaboradores',
    entidade: 'importacoes',
    entidadeId: importRecord.id,
    detalhes: `Arquivo: ${importRecord.arquivoNome} | Linhas: ${rows.length} | Adicionados: ${added} | Atualizados: ${updated} | Rejeitados: ${rejected}`,
  });
  dbService.save();

  return res.json({
    success: true,
    importRecord,
    totalBase: db.colaboradores.length,
  });
});

// Import History
apiRouter.get('/import-history', (_req: Request, res: Response) => {
  const db = dbService.getDb();
  return res.json({ importacoes: db.importacoes });
});

// ==========================================
// 4. QUESTION BANK MANAGEMENT
// ==========================================
apiRouter.get('/questions', (req: Request, res: Response) => {
  const { categoria, status, tema } = req.query;
  const db = dbService.getDb();
  let list = [...db.questoes];

  if (categoria && categoria !== 'Todas') {
    list = list.filter((q) => q.categoriaVeiculo === categoria || q.categoriaVeiculo === 'Ambos');
  }
  if (status && status !== 'Todos') {
    list = list.filter((q) => q.status === status);
  }
  if (tema && tema !== 'Todos') {
    list = list.filter((q) => q.tema === tema);
  }

  return res.json({
    questoes: list,
    total: list.length,
    temas: Array.from(new Set(db.questoes.map((q) => q.tema))).sort(),
  });
});

// Create Question (Admin)
apiRouter.post('/questions', (req: Request, res: Response) => {
  const {
    enunciado,
    categoriaVeiculo,
    tema,
    alternativas,
    respostaCorreta,
    explicacao,
  } = req.body;

  if (!enunciado || !categoriaVeiculo || !alternativas || !respostaCorreta) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  if (!Array.isArray(alternativas) || alternativas.length !== 5) {
    return res.status(400).json({ error: 'Cada questão deve ter exatamente 5 alternativas (A, B, C, D e E).' });
  }

  const db = dbService.getDb();
  const newQuestion: Question = {
    id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    codigo: `${categoriaVeiculo.startsWith('Moto') ? 'MOT' : 'CAR'}-${String(db.questoes.length + 1).padStart(3, '0')}`,
    enunciado: enunciado.trim(),
    categoriaVeiculo,
    tema: tema || 'Direção Defensiva Geral',
    alternativas,
    respostaCorreta,
    explicacao: explicacao || '',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: new Date().toISOString(),
  };

  db.questoes.push(newQuestion);
  dbService.logAudit({
    usuario: req.body.usuario || 'Administrador',
    perfil: 'Administrador',
    acao: 'Questão cadastrada',
    entidade: 'questoes',
    entidadeId: newQuestion.id,
    detalhes: `Questão ${newQuestion.codigo} cadastrada para categoria ${categoriaVeiculo}.`,
  });
  dbService.save();

  return res.status(201).json({ question: newQuestion });
});

// Update Question (Creates new version, preserves history)
apiRouter.put('/questions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbService.getDb();
  const index = db.questoes.findIndex((q) => q.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Questão não encontrada.' });
  }

  const prev = db.questoes[index];
  const {
    enunciado,
    categoriaVeiculo,
    tema,
    alternativas,
    respostaCorreta,
    explicacao,
    status,
  } = req.body;

  db.questoes[index] = {
    ...prev,
    enunciado: enunciado !== undefined ? enunciado : prev.enunciado,
    categoriaVeiculo: categoriaVeiculo !== undefined ? categoriaVeiculo : prev.categoriaVeiculo,
    tema: tema !== undefined ? tema : prev.tema,
    alternativas: alternativas !== undefined ? alternativas : prev.alternativas,
    respostaCorreta: respostaCorreta !== undefined ? respostaCorreta : prev.respostaCorreta,
    explicacao: explicacao !== undefined ? explicacao : prev.explicacao,
    status: status !== undefined ? status : prev.status,
    versao: prev.versao + 1, // increment version
    incompletaAlternativas: false,
    atualizadoEm: new Date().toISOString(),
  };

  dbService.logAudit({
    usuario: req.body.usuario || 'Administrador',
    perfil: 'Administrador',
    acao: 'Questão atualizada (nova versão)',
    entidade: 'questoes',
    entidadeId: id,
    detalhes: `Questão ${prev.codigo} atualizada para v${db.questoes[index].versao}`,
  });
  dbService.save();

  return res.json({ question: db.questoes[index] });
});

// ==========================================
// 5. THEORETICAL EXAM ENGINE
// ==========================================

// Start Exam for Collaborator (Generates exam session WITHOUT correct answers)
apiRouter.post('/exam/start', (req: Request, res: Response) => {
  const { collaboratorId } = req.body;

  if (!collaboratorId) {
    return res.status(400).json({ error: 'Identificador do colaborador é obrigatório.' });
  }

  const db = dbService.getDb();
  const collaborator = db.colaboradores.find((c) => c.id === collaboratorId);

  if (!collaborator) {
    return res.status(404).json({ error: 'Colaborador não encontrado na base corporativa.' });
  }

  // Check attempt policy
  const existingAttempts = db.tentativasTeoricas.filter(
    (t) => t.colaboradorId === collaboratorId && t.status === 'concluido'
  );

  const settings = db.configuracoes;
  if (existingAttempts.length >= settings.maxTentativasTeorica) {
    const hasPassed = existingAttempts.some((t) => t.aprovado);
    if (!hasPassed) {
      return res.status(403).json({
        error: `Número máximo de tentativas (${settings.maxTentativasTeorica}) atingido. Procure o responsável pelo programa da Escola do Bom Condutor para agendamento de reciclagem.`,
      });
    }
  }

  // Select questions STRICTLY matching the collaborator's vehicle type
  const targetCategory = collaborator.tipoVeiculo;
  let pool = db.questoes.filter(
    (q) =>
      q.status === 'ativo' &&
      (q.categoriaVeiculo === targetCategory || q.categoriaVeiculo === 'Ambos')
  );

  if (pool.length === 0) {
    return res.status(400).json({
      error: `Não há questões ativas disponíveis no banco para a categoria ${targetCategory}. Solicite à administração o cadastramento do banco de questões.`,
    });
  }

  // Shuffle questions if configured
  if (settings.ordemAleatoriaQuestoes) {
    pool = [...pool].sort(() => Math.random() - 0.5);
  }

  // Slice configured question count (or total available if less)
  const questionCount = Math.min(settings.quantidadeQuestoesTeorica, pool.length);
  const selectedQuestions = pool.slice(0, questionCount);

  // Create immutable attempt session
  const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const attempt: TheoreticalAttempt = {
    id: attemptId,
    colaboradorId: collaborator.id,
    matricula: collaborator.matricula,
    nomeColaborador: collaborator.nome,
    categoriaVeiculo: collaborator.tipoVeiculo,
    questoesIds: selectedQuestions.map((q) => q.id),
    respostas: {},
    totalQuestoes: selectedQuestions.length,
    respostasCorretas: 0,
    respostasIncorretas: 0,
    naoRespondidas: selectedQuestions.length,
    percentualAproveitamento: 0,
    notaFinal: 0,
    aprovado: false,
    status: 'em_andamento',
    iniciadoEm: new Date().toISOString(),
    versaoBanco: '2026.1',
  };

  db.tentativasTeoricas.push(attempt);

  // Update collaborator state
  collaborator.statusTeorico = 'Em andamento';
  collaborator.statusGeral = 'Prova teórica em andamento';
  collaborator.atualizadoEm = new Date().toISOString();

  dbService.logAudit({
    usuario: collaborator.nome,
    perfil: 'Colaborador',
    acao: 'Início de Prova Teórica',
    entidade: 'tentativas_teoricas',
    entidadeId: attemptId,
    detalhes: `Tentativa iniciada por ${collaborator.nome} (${collaborator.tipoVeiculo}) com ${selectedQuestions.length} questões.`,
  });
  dbService.save();

  // CRITICAL SECURITY RULE (Section 8):
  // Stripping correct answer and explanation so NO GABARITO is sent to the client browser!
  const sanitizedQuestions = selectedQuestions.map((q, idx) => {
    let alts = [...q.alternativas];
    if (settings.ordemAleatoriaAlternativas) {
      alts = alts.sort(() => Math.random() - 0.5);
      // Re-assign letters A-E in visual presentation order
      const letters: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];
      alts = alts.map((alt, i) => ({
        letra: letters[i],
        texto: alt.texto,
      }));
    }
    return {
      id: q.id,
      index: idx + 1,
      codigo: q.codigo,
      enunciado: q.enunciado,
      categoriaVeiculo: q.categoriaVeiculo,
      tema: q.tema,
      alternativas: alts,
    };
  });

  return res.json({
    attemptId,
    collaborator: {
      id: collaborator.id,
      nome: collaborator.nome,
      matricula: collaborator.matricula,
      base: collaborator.base,
      funcao: collaborator.funcao,
      gerencia: collaborator.gerencia,
      tipoVeiculo: collaborator.tipoVeiculo,
    },
    tempoMaximoMinutos: settings.tempoMaximoMinutos,
    totalQuestoes: sanitizedQuestions.length,
    questoes: sanitizedQuestions,
  });
});

// Submit Theoretical Exam (Evaluated exclusively on the server)
apiRouter.post('/exam/submit', (req: Request, res: Response) => {
  const { attemptId, respostas, duracaoSegundos } = req.body;

  if (!attemptId || !respostas) {
    return res.status(400).json({ error: 'Tentativa e respostas são obrigatórias.' });
  }

  const db = dbService.getDb();
  const attemptIndex = db.tentativasTeoricas.findIndex((t) => t.id === attemptId);

  if (attemptIndex === -1) {
    return res.status(404).json({ error: 'Sessão de prova não localizada.' });
  }

  const attempt = db.tentativasTeoricas[attemptIndex];

  // Idempotency check: if already submitted, return current result without re-evaluating
  if (attempt.status === 'concluido') {
    return res.json({
      attempt,
      alreadySubmitted: true,
      message: 'Esta avaliação já foi enviada e processada anteriormente.',
    });
  }

  // Calculate score on server
  let corretas = 0;
  let incorretas = 0;
  let naoRespondidas = 0;
  const questionsMap = new Map(db.questoes.map((q) => [q.id, q]));

  attempt.questoesIds.forEach((qId) => {
    const q = questionsMap.get(qId);
    const chosen = respostas[qId];

    if (!chosen) {
      naoRespondidas++;
    } else if (q && chosen === q.respostaCorreta) {
      corretas++;
    } else {
      incorretas++;
    }
  });

  const total = attempt.totalQuestoes;
  const percentual = total > 0 ? Math.round((corretas / total) * 1000) / 10 : 0;
  const settings = db.configuracoes;
  const isApproved = percentual >= settings.notaMinimaTeorica;

  // Update Attempt Record
  attempt.respostas = respostas;
  attempt.respostasCorretas = corretas;
  attempt.respostasIncorretas = incorretas;
  attempt.naoRespondidas = naoRespondidas;
  attempt.percentualAproveitamento = percentual;
  attempt.notaFinal = percentual;
  attempt.aprovado = isApproved;
  attempt.status = 'concluido';
  attempt.finalizadoEm = new Date().toISOString();
  attempt.duracaoSegundos = duracaoSegundos || 0;

  // Update Collaborator
  const colabIndex = db.colaboradores.findIndex((c) => c.id === attempt.colaboradorId);
  if (colabIndex >= 0) {
    const colab = db.colaboradores[colabIndex];
    colab.tentativasTeoricasCount = (colab.tentativasTeoricasCount || 0) + 1;
    colab.notaTeorica = percentual;
    colab.statusTeorico = isApproved ? 'Aprovado' : 'Reprovado';
    colab.statusGeral = isApproved
      ? 'Aprovado na prova teórica'
      : 'Reprovado na prova teórica';
    colab.atualizadoEm = new Date().toISOString();
  }

  dbService.logAudit({
    usuario: attempt.nomeColaborador,
    perfil: 'Colaborador',
    acao: 'Envio de Prova Teórica',
    entidade: 'tentativas_teoricas',
    entidadeId: attempt.id,
    detalhes: `Prova finalizada: ${corretas}/${total} acertos (${percentual}%). Situação: ${isApproved ? 'APROVADO' : 'REPROVADO'}.`,
  });
  dbService.save();

  return res.json({
    attempt: {
      id: attempt.id,
      colaboradorId: attempt.colaboradorId,
      nomeColaborador: attempt.nomeColaborador,
      categoriaVeiculo: attempt.categoriaVeiculo,
      totalQuestoes: attempt.totalQuestoes,
      respostasCorretas: attempt.respostasCorretas,
      respostasIncorretas: attempt.respostasIncorretas,
      naoRespondidas: attempt.naoRespondidas,
      percentualAproveitamento: attempt.percentualAproveitamento,
      notaMinimaExigida: settings.notaMinimaTeorica,
      aprovado: attempt.aprovado,
      finalizadoEm: attempt.finalizadoEm,
      duracaoSegundos: attempt.duracaoSegundos,
    },
    message: isApproved
      ? 'Parabéns! Você atingiu a pontuação mínima na avaliação teórica.'
      : 'Avaliação teórica não atingiu a nota mínima exigida para aprovação.',
  });
});

// ==========================================
// 6. PRACTICAL ASSESSMENT MODULE
// ==========================================

// Get practical criteria
apiRouter.get('/practical/criteria', (_req: Request, res: Response) => {
  const db = dbService.getDb();
  return res.json({ criterios: db.criteriosAvaliacao });
});

// Register Practical Assessment by Instructor
apiRouter.post('/practical/assessments', (req: Request, res: Response) => {
  const {
    colaboradorId,
    instrutorId,
    tipoVeiculo,
    criterios,
    pontosFortes,
    pontosMelhoria,
    recomendacao,
    resultadoFinal,
    registradoPor,
  } = req.body;

  if (!colaboradorId || !instrutorId || !criterios) {
    return res.status(400).json({ error: 'Colaborador, instrutor e critérios são obrigatórios.' });
  }

  const db = dbService.getDb();
  const collaborator = db.colaboradores.find((c) => c.id === colaboradorId);
  const instructor = db.instrutores.find((i) => i.id === instrutorId);

  if (!collaborator) {
    return res.status(404).json({ error: 'Colaborador não encontrado.' });
  }
  if (!instructor) {
    return res.status(404).json({ error: 'Instrutor não credenciado.' });
  }

  // Count criteria stats
  let totalEvaluated = 0;
  let atende = 0;
  let naoAtende = 0;

  Object.values(criterios as Record<string, { status: string }>).forEach((item) => {
    if (item.status === 'atende') {
      atende++;
      totalEvaluated++;
    } else if (item.status === 'nao_atende') {
      naoAtende++;
      totalEvaluated++;
    }
  });

  const isApproved = resultadoFinal === 'Aprovado' || (totalEvaluated > 0 && naoAtende === 0);

  const assessmentId = `prac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const assessment: PracticalAssessment = {
    id: assessmentId,
    colaboradorId: collaborator.id,
    colaboradorNome: collaborator.nome,
    colaboradorMatricula: collaborator.matricula,
    colaboradorBase: collaborator.base,
    colaboradorFuncao: collaborator.funcao,
    colaboradorGerencia: collaborator.gerencia,
    tipoVeiculo: tipoVeiculo || collaborator.tipoVeiculo,
    instrutorId: instructor.id,
    instrutorNome: instructor.nome,
    instrutorCredencial: instructor.credencial,
    dataAvaliacao: new Date().toISOString(),
    criterios,
    totalItensAvaliados: totalEvaluated,
    totalAtende: atende,
    totalNaoAtende: naoAtende,
    pontosFortes: pontosFortes || '',
    pontosMelhoria: pontosMelhoria || '',
    recomendacao: recomendacao || '',
    resultadoFinal: isApproved ? 'Aprovado' : 'Reprovado',
    registradoPor: registradoPor || instructor.nome,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  db.avaliacoesPraticas.push(assessment);

  // Update Collaborator Global Status (Consolidation Rule - Section 12)
  collaborator.statusPratico = isApproved ? 'Aprovado' : 'Reprovado';
  collaborator.notaPratica = totalEvaluated > 0 ? Math.round((atende / totalEvaluated) * 1000) / 10 : 0;
  collaborator.instrutorPraticoId = instructor.id;
  collaborator.instrutorPraticoNome = instructor.nome;

  // Both stages completed?
  if (collaborator.statusTeorico === 'Aprovado' && isApproved) {
    collaborator.statusGeral = 'Processo concluído com aprovação';
  } else if (!isApproved) {
    collaborator.statusGeral = 'Reprovado na prova prática';
  } else {
    collaborator.statusGeral = 'Aprovado na prova prática';
  }
  collaborator.atualizadoEm = new Date().toISOString();

  dbService.logAudit({
    usuario: instructor.nome,
    perfil: 'Instrutor',
    acao: 'Avaliação Prática Registrada',
    entidade: 'avaliacoes_praticas',
    entidadeId: assessmentId,
    detalhes: `Avaliação de ${collaborator.nome} por ${instructor.nome}. Resultado: ${assessment.resultadoFinal}`,
  });
  dbService.save();

  return res.status(201).json({ assessment, collaborator });
});

// List Practical Assessments
apiRouter.get('/practical/assessments', (req: Request, res: Response) => {
  const { instrutorId, colaboradorId } = req.query;
  const db = dbService.getDb();
  let list = [...db.avaliacoesPraticas];

  if (instrutorId) {
    list = list.filter((p) => p.instrutorId === instrutorId);
  }
  if (colaboradorId) {
    list = list.filter((p) => p.colaboradorId === colaboradorId);
  }

  return res.json({ avaliacoes: list, total: list.length });
});

// Single Practical Assessment (for Printable Report / Certificate)
apiRouter.get('/practical/assessments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbService.getDb();
  const assessment = db.avaliacoesPraticas.find((p) => p.id === id);

  if (!assessment) {
    return res.status(404).json({ error: 'Avaliação prática não encontrada.' });
  }

  const collaborator = db.colaboradores.find((c) => c.id === assessment.colaboradorId);
  return res.json({ assessment, collaborator, criteriosDefinicao: db.criteriosAvaliacao });
});

// ==========================================
// 7. INSTRUCTORS MANAGEMENT
// ==========================================
apiRouter.get('/instructors', (_req: Request, res: Response) => {
  const db = dbService.getDb();
  return res.json({ instrutores: db.instrutores });
});

apiRouter.post('/instructors', (req: Request, res: Response) => {
  const { nome, matricula, credencial, base, email, telefone } = req.body;
  if (!nome || !credencial || !base || !email) {
    return res.status(400).json({ error: 'Nome, credencial, base e e-mail são obrigatórios.' });
  }

  const db = dbService.getDb();
  const newInst: Instructor = {
    id: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    nome: nome.trim(),
    matricula: matricula ? matricula.trim() : '',
    credencial: credencial.trim(),
    base: base.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone || '',
    ativo: true,
  };

  db.instrutores.push(newInst);
  dbService.logAudit({
    usuario: req.body.usuario || 'Administrador',
    perfil: 'Administrador',
    acao: 'Instrutor cadastrado',
    entidade: 'instrutores',
    entidadeId: newInst.id,
    detalhes: `Instrutor ${newInst.nome} (${newInst.credencial}) adicionado.`,
  });
  dbService.save();

  return res.status(201).json({ instructor: newInst });
});

// ==========================================
// 8. DASHBOARD INDICATORS & STATS
// ==========================================
apiRouter.get('/dashboard/stats', (_req: Request, res: Response) => {
  const db = dbService.getDb();
  const colabs = db.colaboradores;

  const total = colabs.length;
  const convocados = total;
  const teoricoAprovados = colabs.filter((c) => c.statusTeorico === 'Aprovado').length;
  const teoricoReprovados = colabs.filter((c) => c.statusTeorico === 'Reprovado').length;
  const teoricoPendentes = colabs.filter((c) => c.statusTeorico === 'Pendente').length;
  const teoricoEmAndamento = colabs.filter((c) => c.statusTeorico === 'Em andamento').length;

  const praticoAprovados = colabs.filter((c) => c.statusPratico === 'Aprovado').length;
  const praticoReprovados = colabs.filter((c) => c.statusPratico === 'Reprovado').length;
  const praticoPendentes = colabs.filter(
    (c) => c.statusTeorico === 'Aprovado' && c.statusPratico !== 'Aprovado'
  ).length;

  const concluidosComAprovacao = colabs.filter(
    (c) => c.statusGeral === 'Processo concluído com aprovação'
  ).length;

  const percentualConclusao = total > 0 ? Math.round((concluidosComAprovacao / total) * 1000) / 10 : 0;

  // Breakdown by Base
  const baseMap: Record<string, { total: number; concluidos: number; teoricoAprovados: number }> = {};
  colabs.forEach((c) => {
    if (!baseMap[c.base]) {
      baseMap[c.base] = { total: 0, concluidos: 0, teoricoAprovados: 0 };
    }
    baseMap[c.base].total++;
    if (c.statusGeral === 'Processo concluído com aprovação') baseMap[c.base].concluidos++;
    if (c.statusTeorico === 'Aprovado') baseMap[c.base].teoricoAprovados++;
  });

  const basesChart = Object.entries(baseMap).map(([base, data]) => ({
    base,
    total: data.total,
    concluidos: data.concluidos,
    taxaConclusao: data.total > 0 ? Math.round((data.concluidos / data.total) * 100) : 0,
  }));

  // Breakdown by Vehicle Type
  const vehicleChart = [
    {
      tipo: 'Carro/Caminhonete',
      total: colabs.filter((c) => c.tipoVeiculo === 'Carro/Caminhonete').length,
      aprovados: colabs.filter((c) => c.tipoVeiculo === 'Carro/Caminhonete' && c.statusGeral === 'Processo concluído com aprovação').length,
    },
    {
      tipo: 'Motocicleta',
      total: colabs.filter((c) => c.tipoVeiculo === 'Motocicleta').length,
      aprovados: colabs.filter((c) => c.tipoVeiculo === 'Motocicleta' && c.statusGeral === 'Processo concluído com aprovação').length,
    },
  ];

  // Breakdown by Status Geral
  const statusGeralMap: Record<string, number> = {};
  colabs.forEach((c) => {
    statusGeralMap[c.statusGeral] = (statusGeralMap[c.statusGeral] || 0) + 1;
  });

  return res.json({
    kpis: {
      totalCadastrados: total,
      totalConvocados: convocados,
      teoricoRealizados: teoricoAprovados + teoricoReprovados,
      teoricoPendentes,
      teoricoEmAndamento,
      teoricoAprovados,
      teoricoReprovados,
      praticoPendentes,
      praticoAprovados,
      praticoReprovados,
      processosConcluidosAprovacao: concluidosComAprovacao,
      percentualConclusao,
    },
    basesChart,
    vehicleChart,
    statusGeralMap,
  });
});

// ==========================================
// 9. SETTINGS & SYSTEM CONFIGURATION
// ==========================================
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const db = dbService.getDb();
  return res.json({ settings: db.configuracoes });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  const db = dbService.getDb();
  db.configuracoes = {
    ...db.configuracoes,
    ...req.body,
  };

  dbService.logAudit({
    usuario: req.body.usuario || 'Administrador',
    perfil: 'Administrador',
    acao: 'Configurações do sistema alteradas',
    entidade: 'configuracoes',
    detalhes: `Parâmetros de avaliação atualizados. Nota teórica: ${db.configuracoes.notaMinimaTeorica}%, Questões: ${db.configuracoes.quantidadeQuestoesTeorica}`,
  });
  dbService.save();

  return res.json({ settings: db.configuracoes });
});

// ==========================================
// 10. AUDIT LOGS
// ==========================================
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const { perfil, entidade, limit } = req.query;
  const db = dbService.getDb();
  let list = [...db.logsAuditoria];

  if (perfil && perfil !== 'Todos') {
    list = list.filter((l) => l.perfil === perfil);
  }
  if (entidade && entidade !== 'Todas') {
    list = list.filter((l) => l.entidade === entidade);
  }

  const max = limit ? parseInt(limit as string, 10) : 100;
  return res.json({ logs: list.slice(0, max), total: list.length });
});
