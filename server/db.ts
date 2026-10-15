import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  salt: string;
  perfil: 'Administrador' | 'Gestor' | 'Instrutor';
  ativo: boolean;
  criadoEm: string;
  ultimoLogin?: string;
}

export interface AppContent {
  tituloHero: string;
  subtituloHero: string;
  descricaoHero: string;
  avisoGeral: string;
  bannerAtivo: boolean;
  bannerTexto: string;
  contatoSuporteEmail: string;
  contatoSuporteTelefone: string;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return verifyHash === hash;
  } catch {
    return false;
  }
}

export interface Collaborator {
  id: string;
  matricula: string;
  nome: string;
  nomeNormalizado: string;
  base: string;
  funcao: string;
  gerencia: string;
  tipoVeiculo: 'Carro/Caminhonete' | 'Motocicleta' | 'Caminhão';
  statusGeral:
    | 'Aguardando prova teórica'
    | 'Prova teórica em andamento'
    | 'Reprovado na prova teórica'
    | 'Aprovado na prova teórica'
    | 'Aguardando avaliação prática'
    | 'Avaliação prática em andamento'
    | 'Reprovado na prova prática'
    | 'Aprovado na prova prática'
    | 'Processo concluído com aprovação'
    | 'Processo concluído sem aprovação'
    | 'Processo pendente de regularização'
    | 'Processo cancelado';
  statusTeorico: 'Pendente' | 'Em andamento' | 'Aprovado' | 'Reprovado' | 'Cancelado';
  notaTeorica?: number;
  tentativasTeoricasCount: number;
  statusPratico: 'Não iniciado' | 'Em andamento' | 'Aprovado' | 'Reprovado' | 'Não aplicável';
  notaPratica?: number;
  instrutorPraticoId?: string;
  instrutorPraticoNome?: string;
  convocadoEm: string;
  atualizadoEm: string;
  observacoes?: string;
  dadosCorretosConfirmados?: boolean;
}

export interface QuestionAlternative {
  letra: 'A' | 'B' | 'C' | 'D' | 'E';
  texto: string;
}

export interface Question {
  id: string;
  codigo: string;
  enunciado: string;
  categoriaVeiculo: 'Carro/Caminhonete' | 'Motocicleta' | 'Caminhão' | 'Ambos' | 'Todos';
  tema: string;
  alternativas: QuestionAlternative[];
  respostaCorreta: 'A' | 'B' | 'C' | 'D' | 'E';
  explicacao?: string;
  status: 'ativo' | 'inativo';
  versao: number;
  incompletaAlternativas: boolean;
  atualizadoEm: string;
}

export interface TheoreticalAttempt {
  id: string;
  colaboradorId: string;
  matricula: string;
  nomeColaborador: string;
  categoriaVeiculo: 'Carro/Caminhonete' | 'Motocicleta' | 'Caminhão';
  questoesIds: string[];
  respostas: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
  totalQuestoes: number;
  respostasCorretas: number;
  respostasIncorretas: number;
  naoRespondidas: number;
  percentualAproveitamento: number;
  notaFinal: number;
  aprovado: boolean;
  status: 'em_andamento' | 'concluido' | 'expirado' | 'cancelado';
  iniciadoEm: string;
  finalizadoEm?: string;
  duracaoSegundos?: number;
  versaoBanco: string;
}

export interface PracticalCriterion {
  id: string;
  categoriaVeiculo: 'Carro/Caminhonete' | 'Motocicleta' | 'Geral';
  titulo: string;
  descricao: string;
  ordem: number;
}

export interface PracticalCriterionResult {
  status: 'atende' | 'nao_atende' | 'nao_aplicavel';
  observacao?: string;
}

export interface PracticalAssessment {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorMatricula: string;
  colaboradorBase: string;
  colaboradorFuncao: string;
  colaboradorGerencia: string;
  tipoVeiculo: 'Carro/Caminhonete' | 'Motocicleta' | 'Caminhão';
  instrutorId: string;
  instrutorNome: string;
  instrutorCredencial?: string;
  dataAvaliacao: string;
  criterios: Record<string, PracticalCriterionResult>;
  totalItensAvaliados: number;
  totalAtende: number;
  totalNaoAtende: number;
  pontosFortes: string;
  pontosMelhoria: string;
  recomendacao: string;
  resultadoFinal: 'Aprovado' | 'Reprovado';
  registradoPor: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Instructor {
  id: string;
  nome: string;
  matricula?: string;
  credencial: string;
  base: string;
  email: string;
  telefone?: string;
  ativo: boolean;
}

export interface ImportHistory {
  id: string;
  arquivoNome: string;
  totalLinhas: number;
  adicionados: number;
  atualizados: number;
  rejeitados: number;
  erros: Array<{ linha: number; identificador: string; motivo: string }>;
  importadoPor: string;
  dataHora: string;
}

export interface SystemSettings {
  notaMinimaTeorica: number;
  quantidadeQuestoesTeorica: number;
  tempoMaximoMinutos: number;
  maxTentativasTeorica: number;
  ordemAleatoriaQuestoes: boolean;
  ordemAleatoriaAlternativas: boolean;
  permitirRevisao: boolean;
  notaMinimaPratica: number;
  permitirPraticaSemAprovacaoTeorica: boolean;
  modoHomologacao: boolean;
  mensagemAvisoOficial: string;
}

export interface AuditLog {
  id: string;
  dataHora: string;
  usuario: string;
  perfil: 'Administrador' | 'Gestor' | 'Instrutor' | 'Sistema' | 'Colaborador';
  acao: string;
  entidade: string;
  entidadeId?: string;
  detalhes: string;
  ip?: string;
}

export interface DatabaseSchema {
  usuarios: User[];
  conteudo: AppContent;
  colaboradores: Collaborator[];
  questoes: Question[];
  tentativasTeoricas: TheoreticalAttempt[];
  avaliacoesPraticas: PracticalAssessment[];
  criteriosAvaliacao: PracticalCriterion[];
  instrutores: Instructor[];
  importacoes: ImportHistory[];
  configuracoes: SystemSettings;
  logsAuditoria: AuditLog[];
}

const DB_FILE = path.resolve(process.cwd(), 'data', 'database.json');

// Helper to normalize search strings (strip accents, lower case, trim spaces)
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Initial Seed Data
const DEFAULT_CRITERIA: PracticalCriterion[] = [
  {
    id: 'crit-01',
    categoriaVeiculo: 'Geral',
    titulo: 'Inspeção Pré-Operacional do Veículo (Checklist 360°)',
    descricao: 'Verificação visual dos pneus, níveis de fluidos, iluminação, freios e integridade geral.',
    ordem: 1,
  },
  {
    id: 'crit-02',
    categoriaVeiculo: 'Geral',
    titulo: 'Uso Correto dos Equipamentos de Proteção / Cinto / Capacete',
    descricao: 'Ajuste e uso adequado dos EPIs exigidos para a atividade e condução do veículo.',
    ordem: 2,
  },
  {
    id: 'crit-03',
    categoriaVeiculo: 'Geral',
    titulo: 'Ergonomia e Ajustes Iniciais (Bancos, Espelhos, Postura)',
    descricao: 'Regulagem correta dos espelhos retrovisores, minimização de pontos cegos e postura ao volante/guidão.',
    ordem: 3,
  },
  {
    id: 'crit-04',
    categoriaVeiculo: 'Geral',
    titulo: 'Respeito à Sinalização e Limites de Velocidade',
    descricao: 'Cumprimento estrito da sinalização horizontal, vertical, semafórica e velocidade compatível.',
    ordem: 4,
  },
  {
    id: 'crit-05',
    categoriaVeiculo: 'Geral',
    titulo: 'Distância Segura de Seguimento e Reação',
    descricao: 'Manutenção da regra dos 2 segundos (ou 3-4s em pista molhada) em relação ao veículo à frente.',
    ordem: 5,
  },
  {
    id: 'crit-06',
    categoriaVeiculo: 'Geral',
    titulo: 'Atenção aos Pontos Cegos e Visão Periférica',
    descricao: 'Varredura visual ativa constante, uso de setas com antecedência e checagem prévia nas conversões.',
    ordem: 6,
  },
  {
    id: 'crit-07',
    categoriaVeiculo: 'Carro/Caminhonete',
    titulo: 'Controle de Frenagem e Condução Suave',
    descricao: 'Frenagens progressivas sem trancos, controle de embreagem e estabilidade em curvas.',
    ordem: 7,
  },
  {
    id: 'crit-08',
    categoriaVeiculo: 'Carro/Caminhonete',
    titulo: 'Manobras em Marcha à Ré e Estacionamento Seguro',
    descricao: 'Realização de baliza ou vaga a 90° com segurança, sem aceleração excessiva e com observação total.',
    ordem: 8,
  },
  {
    id: 'crit-09',
    categoriaVeiculo: 'Motocicleta',
    titulo: 'Posicionamento em Pista e Visibilidade da Motocicleta',
    descricao: 'Condução no centro da faixa sem trafegar em pontos cegos de caminhões ou automóveis.',
    ordem: 9,
  },
  {
    id: 'crit-10',
    categoriaVeiculo: 'Motocicleta',
    titulo: 'Equilíbrio, Frenagem Combinada e Curvas em Baixa Velocidade',
    descricao: 'Uso coordenado de freio dianteiro (70%) e traseiro (30%), apoio dos pés e postura nos joelhos.',
    ordem: 10,
  },
  {
    id: 'crit-11',
    categoriaVeiculo: 'Geral',
    titulo: 'Comportamento Defensivo e Previsão de Risco',
    descricao: 'Capacidade de antecipar pedestres, animais, cruzamentos sem visibilidade e condutas imprudentes de terceiros.',
    ordem: 11,
  },
  {
    id: 'crit-12',
    categoriaVeiculo: 'Geral',
    titulo: 'Encerramento Seguro e Desligamento',
    descricao: 'Parada em local autorizado, aplicação do freio de estacionamento, desligamento e trava.',
    ordem: 12,
  },
];

const DEFAULT_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-01',
    nome: 'Paulo Roberto da Silva',
    matricula: 'INS-8842',
    credencial: 'DETRAN-MA/84920-A/B',
    base: 'Base São Luís',
    email: 'paulo.silva@bomcondutor.corp',
    telefone: '(98) 98842-1020',
    ativo: true,
  },
  {
    id: 'inst-02',
    nome: 'Carlos Eduardo Mendes',
    matricula: 'INS-9214',
    credencial: 'DETRAN-MA/51029-A/B/D',
    base: 'Base Bacabal',
    email: 'carlos.mendes@bomcondutor.corp',
    telefone: '(99) 98411-9922',
    ativo: true,
  },
  {
    id: 'inst-03',
    nome: 'Renata Albuquerque',
    matricula: 'INS-7731',
    credencial: 'DETRAN-MA/33910-A/B',
    base: 'Base Imperatriz',
    email: 'renata.albuquerque@bomcondutor.corp',
    telefone: '(99) 99120-4455',
    ativo: true,
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  notaMinimaTeorica: 70, // 70% de aproveitamento mínimo
  quantidadeQuestoesTeorica: 15,
  tempoMaximoMinutos: 40,
  maxTentativasTeorica: 2,
  ordemAleatoriaQuestoes: true,
  ordemAleatoriaAlternativas: true,
  permitirRevisao: true,
  notaMinimaPratica: 75,
  permitirPraticaSemAprovacaoTeorica: false,
  modoHomologacao: true,
  mensagemAvisoOficial:
    'Ambiente corporativo de reavaliação. As provas teóricas utilizam questões de direção defensiva e legislação de trânsito específicas por veículo.',
};

export const DEFAULT_CONTENT: AppContent = {
  tituloHero: 'Escola do Bom Condutor',
  subtituloHero: 'Segurança no trânsito começa com conhecimento, responsabilidade e atitude.',
  descricaoHero: 'Central oficial corporativa para reavaliação teórica e prática de condutores envolvidos em ocorrências. Autoidentificação simplificada pela base corporativa e direcionamento exclusivo para a categoria do seu veículo.',
  avisoGeral: 'Ambiente oficial de capacitação e conformidade viária. O programa possui validade corporativa perante a gerência de segurança e operações.',
  bannerAtivo: true,
  bannerTexto: 'Campanha de Segurança Viária 2026: Direção Defensiva Salva Vidas. Mantenha suas avaliações em dia.',
  contatoSuporteEmail: 'segurancaviaria@bomcondutor.corp',
  contatoSuporteTelefone: '(98) 3210-4000',
};

const adminCgbCreds = hashPassword('180121');
const adminCreds = hashPassword('admin123');
const gestorCreds = hashPassword('gestor123');
const pauloCreds = hashPassword('instrutor123');
const carlosCreds = hashPassword('instrutor123');

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin-cgb',
    nome: 'Administrador CGB',
    email: '@AdminCGB',
    senhaHash: adminCgbCreds.hash,
    salt: adminCgbCreds.salt,
    perfil: 'Administrador',
    ativo: true,
    criadoEm: '2026-10-01T08:00:00Z',
  },
  {
    id: 'usr-admin',
    nome: 'Administrador Geral',
    email: 'admin@bomcondutor.corp',
    senhaHash: adminCreds.hash,
    salt: adminCreds.salt,
    perfil: 'Administrador',
    ativo: true,
    criadoEm: '2026-10-01T08:00:00Z',
  },
  {
    id: 'usr-gestor',
    nome: 'Gestor de Segurança Viária',
    email: 'gestor@bomcondutor.corp',
    senhaHash: gestorCreds.hash,
    salt: gestorCreds.salt,
    perfil: 'Gestor',
    ativo: true,
    criadoEm: '2026-10-01T08:00:00Z',
  },
  {
    id: 'usr-inst-01',
    nome: 'Paulo Roberto da Silva',
    email: 'paulo.silva@bomcondutor.corp',
    senhaHash: pauloCreds.hash,
    salt: pauloCreds.salt,
    perfil: 'Instrutor',
    ativo: true,
    criadoEm: '2026-10-01T08:00:00Z',
  },
  {
    id: 'usr-inst-02',
    nome: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@bomcondutor.corp',
    senhaHash: carlosCreds.hash,
    salt: carlosCreds.salt,
    perfil: 'Instrutor',
    ativo: true,
    criadoEm: '2026-10-01T08:00:00Z',
  },
];

// Seed questions with authentic defensive driving content for Carro/Caminhonete and Motocicleta
// Each has complete 5 options (A, B, C, D, E) and clear explanations
const DEFAULT_QUESTIONS: Question[] = [
  // --- CARRO / CAMINHONETE ---
  {
    id: 'q-car-01',
    codigo: 'CAR-001',
    categoriaVeiculo: 'Carro/Caminhonete',
    tema: 'Direção Defensiva / Aquaplanagem',
    enunciado:
      'Ao trafegar em rodovia durante chuva intensa, o condutor sente que a direção do veículo ficou repentinamente leve e que os pneus perderam aderência com o solo (aquaplanagem). Qual é o procedimento defensivo correto?',
    alternativas: [
      { letra: 'A', texto: 'Pisar bruscamente no pedal de freio e puxar o freio de mão imediatamente.' },
      { letra: 'B', texto: 'Desacelerar suavemente tirando o pé do acelerador, manter o volante firme em linha reta e não frear bruscamente.' },
      { letra: 'C', texto: 'Virar rapidamente o volante para a esquerda e para a direita até recuperar o atrito.' },
      { letra: 'D', texto: 'Acelerar para que a força centrífuga das rodas expulse a lâmina de água acumulada.' },
      { letra: 'E', texto: 'Engrenar marcha ré com o veículo em movimento para desacelerar o eixo motriz.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'Na aquaplanagem, qualquer freada brusca ou movimento repentino no volante pode causar derrapagem descontrolada e capotamento. O correto é retirar o pé do acelerador e manter a direção reta.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-car-02',
    codigo: 'CAR-002',
    categoriaVeiculo: 'Carro/Caminhonete',
    tema: 'Direção Defensiva / Distância de Seguimento',
    enunciado:
      'Para manter uma distância de segurança adequada em relação ao veículo que trafega à frente em pista seca e com boa visibilidade, qual regra de tempo mínima deve ser adotada por veículos leves?',
    alternativas: [
      { letra: 'A', texto: 'Regra de 0,5 segundo.' },
      { letra: 'B', texto: 'Regra de 1 segundo de intervalo.' },
      { letra: 'C', texto: 'Regra dos 2 segundos (ou 4 segundos em condições adversas de chuva ou neblina).' },
      { letra: 'D', texto: 'Regra dos 10 segundos ininterruptos.' },
      { letra: 'E', texto: 'Aproximar o veículo a menos de 1 metro para evitar que outros veículos realizem ultrapassagens.' },
    ],
    respostaCorreta: 'C',
    explicacao:
      'A regra dos dois segundos é a técnica de direção defensiva consagrada para tempo de reação e parada em pista seca. Havendo chuva, piso escorregadio ou carga pesada, dobra-se para 4 segundos.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-car-03',
    codigo: 'CAR-003',
    categoriaVeiculo: 'Carro/Caminhonete',
    tema: 'Inspeção e Pneus',
    enunciado:
      'Segundo as normas de segurança veicular e o Código de Trânsito Brasileiro, qual é a profundidade mínima dos sulcos da banda de rodagem dos pneus (indicador TWI) abaixo da qual o pneu é considerado irregular e perigoso?',
    alternativas: [
      { letra: 'A', texto: '0,5 milímetros.' },
      { letra: 'B', texto: '1,6 milímetros.' },
      { letra: 'C', texto: '3,0 milímetros.' },
      { letra: 'D', texto: '4,5 milímetros.' },
      { letra: 'E', texto: 'Não há limite estabelecido na legislação de trânsito.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'Pneus com profundidade de sulco inferior a 1,6 mm perdem a capacidade de escoamento de água, aumentando exponencialmente o risco de aquaplanagem e falha de frenagem.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-car-04',
    codigo: 'CAR-004',
    categoriaVeiculo: 'Carro/Caminhonete',
    tema: 'Pontos Cegos e Ultrapassagem',
    enunciado:
      'Ao planejar a ultrapassagem de um caminhão de grande porte em rodovia de pista simples, o condutor de carro/caminhonete deve:',
    alternativas: [
      { letra: 'A', texto: 'Colar na traseira do caminhão para aproveitar o vácuo aerodinâmico antes de sair da faixa.' },
      { letra: 'B', texto: 'Buzinar continuamente e forçar a passagem pelo acostamento da direita.' },
      { letra: 'C', texto: 'Guardar distância do caminhão para ter visibilidade ampla da pista contrária, sinalizar com antecedência e ultrapassar em local permitido.' },
      { letra: 'D', texto: 'Ultrapassar em curvas sinuosas caso o caminhão esteja em velocidade reduzida.' },
      { letra: 'E', texto: 'Desligar os faróis durante a manobra para não ofuscar o retrovisor do caminhão.' },
    ],
    respostaCorreta: 'C',
    explicacao:
      'Ficar colado na traseira de veículos pesados anula a visibilidade da pista à frente. É necessário afastar-se, ampliar o campo visual, conferir os espelhos e sinalizar com antecedência.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-car-05',
    codigo: 'CAR-005',
    categoriaVeiculo: 'Carro/Caminhonete',
    tema: 'Segurança Passiva / Cinto e Encosto de Cabeça',
    enunciado:
      'O encosto de cabeça do banco do motorista e dos passageiros tem função essencial de proteção contra qual lesão típica de colisão traseira?',
    alternativas: [
      { letra: 'A', texto: 'Fratura de fêmur e tíbia.' },
      { letra: 'B', texto: 'Efeito chicote (movimento brusco de hiperextensão e hiperflexão da coluna cervical).' },
      { letra: 'C', texto: 'Trauma facial decorrente do acionamento do cinto abdominal.' },
      { letra: 'D', texto: 'Lesão do tendão patelar.' },
      { letra: 'E', texto: 'Luxação do ombro em desacelerações laterais.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'O encosto de cabeça deve ser ajustado com o topo na altura dos olhos ou no topo da cabeça para evitar o efeito chicote na coluna cervical em batidas traseiras.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-car-06',
    codigo: 'CAR-006',
    categoriaVeiculo: 'Carro/Caminhonete',
    tema: 'Condições Adversas / Neblina e Cerração',
    enunciado:
      'Em trecho com neblina densa, fumaça ou cerração na pista, qual a conduta defensiva preconizada?',
    alternativas: [
      { letra: 'A', texto: 'Ligar a luz alta dos faróis para iluminar a neblina mais distante.' },
      { letra: 'B', texto: 'Ligar o pisca-alerta com o veículo em movimento contínuo na faixa de rolamento.' },
      { letra: 'C', texto: 'Utilizar farol baixo (ou farol de neblina), reduzir a velocidade e guiar-se pelas faixas de sinalização do solo.' },
      { letra: 'D', texto: 'Parar o veículo na faixa de tráfego e aguardar a neblina se dissipar.' },
      { letra: 'E', texto: 'Acelerar rapidamente para sair do trecho de neblina o mais depressa possível.' },
    ],
    respostaCorreta: 'C',
    explicacao:
      'O farol alto reflete nas gotículas em suspensão e ofusca o condutor. Usa-se farol baixo, velocidade reduzida, distância de segurança aumentada e não se para na pista.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-car-07',
    codigo: 'CAR-007',
    categoriaVeiculo: 'Carro/Caminhonete',
    tema: 'Fator Humano / Fadiga e Celular',
    enunciado:
      'Conforme estudos de segurança viária, digitar mensagens ou atender chamadas ao celular enquanto se dirige:',
    alternativas: [
      { letra: 'A', texto: 'Não altera o tempo de reação se o motorista possuir mais de 10 anos de experiência.' },
      { letra: 'B', texto: 'É seguro se realizado apenas em velocidades inferiores a 60 km/h.' },
      { letra: 'C', texto: 'Multiplica significativamente o risco de colisão devido à distração cognitiva, visual e motora simultânea.' },
      { letra: 'D', texto: 'É permitido nas rodovias estaduais e proibido nas federais.' },
      { letra: 'E', texto: 'É compensado pelo uso de freios ABS modernos.' },
    ],
    respostaCorreta: 'C',
    explicacao:
      'O uso do celular desvia o olhar, a mente e as mãos da direção, gerando cegueira por desatenção comparável ou superior ao estado de embriaguez moderada.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-car-08',
    codigo: 'CAR-008',
    categoriaVeiculo: 'Carro/Caminhonete',
    tema: 'Mecânica Básica e Freios ABS',
    enunciado:
      'Em frenagens de emergência em veículos equipados com freios ABS (Anti-lock Braking System), o motorista deve:',
    alternativas: [
      { letra: 'A', texto: 'Bombear o pedal de freio repetidamente para não deixar as rodas travarem.' },
      { letra: 'B', texto: 'Pressionar o pedal de freio com força máxima e mantê-lo pressionado, ignorando a vibração normal do sistema.' },
      { letra: 'C', texto: 'Puxar o freio de mão junto com o pedal para diminuir o curso do veículo.' },
      { letra: 'D', texto: 'Colocar o câmbio em ponto morto antes de aplicar qualquer pressão no freio.' },
      { letra: 'E', texto: 'Aliviar a pressão no freio assim que sentir a primeira trepidação no pedal.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'O sistema ABS atua automaticamente evitando o travamento das rodas e permitindo manobrar durante a frenagem. O pedal vibra indicando que o sistema está em ação, devendo ser mantido pressionado firmemente.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },

  // --- MOTOCICLETA ---
  {
    id: 'q-moto-01',
    codigo: 'MOT-001',
    categoriaVeiculo: 'Motocicleta',
    tema: 'Técnica de Frenagem de Motocicletas',
    enunciado:
      'Qual é a distribuição ideal recomendada de força de frenagem em motocicletas em linha reta e piso seco para garantir desaceleração eficiente sem derrapagem?',
    alternativas: [
      { letra: 'A', texto: '100% no freio traseiro e 0% no freio dianteiro.' },
      { letra: 'B', texto: 'Aproximadamente 70% da força no freio dianteiro e 30% no freio traseiro.' },
      { letra: 'C', texto: '90% no freio traseiro e 10% no dianteiro.' },
      { letra: 'D', texto: 'Somente uso do freio motor, sem pressionar as manetes.' },
      { letra: 'E', texto: '50% freio traseiro e pisar com as botas no asfalto.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'Durante a frenagem, ocorre transferência de massa para a dianteira da moto. Por isso, a roda dianteira tem maior aderência e responde por cerca de 70% da capacidade total de parada.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-moto-02',
    codigo: 'MOT-002',
    categoriaVeiculo: 'Motocicleta',
    tema: 'Equipamentos de Proteção / Capacete',
    enunciado:
      'Segundo a Resolução do CONTRAN referente ao uso de capacete por motociclistas e passageiros, qual das alternativas descreve a condição correta e obrigatória?',
    alternativas: [
      { letra: 'A', texto: 'A viseira pode ser substituída por óculos de sol comuns ou de grau sem proteção lateral.' },
      { letra: 'B', texto: 'A cinta jugular pode ficar frouxa ou solta para maior conforto térmico.' },
      { letra: 'C', texto: 'O capacete deve possuir selo do INMETRO, faixas retrorrefletivas e a viseira (ou óculos de proteção específico) deve estar abaixada durante o deslocamento.' },
      { letra: 'D', texto: 'Capacetes sem queixeira e sem viseira são permitidos em rodovias federais.' },
      { letra: 'E', texto: 'Capacete que sofreu forte impacto em colisão pode continuar sendo utilizado se a pintura estiver intacta.' },
    ],
    respostaCorreta: 'C',
    explicacao:
      'O capacete regulamentar requer certificação INMETRO, adesivos retrorrefletivos e uso com viseira fechada e jugular bem afivelada sob o maxilar.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-moto-03',
    codigo: 'MOT-003',
    categoriaVeiculo: 'Motocicleta',
    tema: 'Posicionamento em Pista e Pontos Cegos',
    enunciado:
      'Ao trafegar em vias urbanas de fluxo intenso, como o motociclista deve se posicionar para garantir sua segurança e visibilidade?',
    alternativas: [
      { letra: 'A', texto: 'Trafegar colado nas laterais cegas de ônibus e caminhões.' },
      { letra: 'B', texto: 'Ocupar o centro de sua faixa de trânsito onde os motoristas à frente consigam visualizá-lo pelo retrovisor central, mantendo distância segura.' },
      { letra: 'C', texto: 'Costurar continuamente entre os carros sem sinalizar para agilizar a entrega.' },
      { letra: 'D', texto: 'Trafegar prioritariamente sobre a linha de divisão entre as faixas em alta velocidade.' },
      { letra: 'E', texto: 'Utilizar calçadas e ciclovias em horários de pico.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'Ficar visível nos retrovisores de quem vai à frente e manter distância de segurança é a primeira regra de sobrevivência do motociclista defensivo.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-moto-04',
    codigo: 'MOT-004',
    categoriaVeiculo: 'Motocicleta',
    tema: 'Curvas e Técnica de Contra-Esterço',
    enunciado:
      'Ao abordar uma curva com a motocicleta em velocidade de cruzeiro, qual a sequência de procedimentos correta?',
    alternativas: [
      { letra: 'A', texto: 'Frear forte com o freio dianteiro no ápice da curva com a moto totalmente inclinada.' },
      { letra: 'B', texto: 'Reduzir a velocidade antes da entrada da curva, posicionar o corpo e manter aceleração suave e constante durante o contorno.' },
      { letra: 'C', texto: 'Entrar na curva acelerando ao máximo e frear apenas se a moto sair da pista.' },
      { letra: 'D', texto: 'Desengatar a marcha e contornar a curva em ponto morto.' },
      { letra: 'E', texto: 'Inclinar a moto para o lado contrário ao sentido da curva.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'A desaceleração e ajuste de marcha devem ocorrer antes da entrada da curva, quando a motocicleta ainda está reta. Dentro da curva, aceleração suave estabiliza a suspensão e tração.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-moto-05',
    codigo: 'MOT-005',
    categoriaVeiculo: 'Motocicleta',
    tema: 'Piso Molhado e Óleo no Asfalto',
    enunciado:
      'Logo no início de uma chuva fraca após período de estiagem, o asfalto torna-se extremamente escorregadio porque:',
    alternativas: [
      { letra: 'A', texto: 'A água da chuva evapora instantaneamente gerando vácuo.' },
      { letra: 'B', texto: 'A água inicial mistura-se com a poeira, resíduos de combustível e óleo acumulados na pista, formando uma película altamente lubrificante.' },
      { letra: 'C', texto: 'A calibragem dos pneus se eleva repentinamente com a umidade.' },
      { letra: 'D', texto: 'Os freios a disco perdem a pressão hidráulica com gotas de água.' },
      { letra: 'E', texto: 'As faixas pintadas aumentam a aderência dos pneus da moto.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'Os primeiros 15 minutos de chuva são os mais perigosos para motocicletas, pois a mistura de água com óleo e fuligem cria uma camada semelhante a sabão.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-moto-06',
    codigo: 'MOT-006',
    categoriaVeiculo: 'Motocicleta',
    tema: 'Manutenção Preventiva / Corrente e Pneus',
    enunciado:
      'A folga e lubrificação da corrente de transmissão secundária da motocicleta devem ser verificadas com qual frequência média nas frotas operacionais?',
    alternativas: [
      { letra: 'A', texto: 'Apenas uma vez ao ano nas revisões do fabricante.' },
      { letra: 'B', texto: 'Somente se a corrente arrebentar em trânsito.' },
      { letra: 'C', texto: 'Semanalmente ou a cada 500-1000 km (e sempre após chuvas intensas), mantendo a folga preconizada no manual (normalmente entre 2 e 3 cm).' },
      { letra: 'D', texto: 'A corrente deve permanecer o mais esticada possível sem folga alguma.' },
      { letra: 'E', texto: 'A corrente não requer óleo nem regulagem por ser blindada.' },
    ],
    respostaCorreta: 'C',
    explicacao:
      'Corrente frouxa pode descarrilar e travar a roda traseira, causando queda grave. Corrente muito esticada danifica o eixo do câmbio e os rolamentos.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },

  // --- CAMINHÃO (VEÍCULOS PESADOS E OPERACIONAIS) ---
  {
    id: 'q-cam-01',
    codigo: 'CAM-001',
    categoriaVeiculo: 'Caminhão',
    tema: 'Frenagem em Declives e Freio Motor',
    enunciado:
      'Ao descer trechos de serra ou declives acentuados e prolongados com um caminhão carregado, qual é o procedimento defensivo correto para evitar o superaquecimento dos freios (efeito "fading")?',
    alternativas: [
      { letra: 'A', texto: 'Descer em ponto morto (na "banguela") e utilizar intermitentemente o pedal de freio.' },
      { letra: 'B', texto: 'Descer com o caminhão engrenado na mesma marcha necessária para subir o aclive, utilizando o freio motor (top brake) e preservando o freio de serviço.' },
      { letra: 'C', texto: 'Desligar a ignição do motor para que os pistões travem mecanicamente o cardã.' },
      { letra: 'D', texto: 'Utilizar exclusivamente a válvula do freio de estacionamento (maneco) durante todo o declive.' },
      { letra: 'E', texto: 'Acelerar em velocidade máxima para vencer a descida depressa e resfriar os tambores pelo vento.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'Em declives acentuados, descer com o veículo engrenado em marcha reduzida associada ao freio motor alivia a carga térmica sobre os tambores e lonas, impedindo a perda total de eficiência de frenagem por superaquecimento (fading).',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-cam-02',
    codigo: 'CAM-002',
    categoriaVeiculo: 'Caminhão',
    tema: 'Sistema Pneumático de Freios e Pressão de Ar',
    enunciado:
      'No painel de instrumentos do caminhão, os manômetros indicam a pressão pneumática dos reservatórios primário e secundário de freio. O motorista só deve iniciar a marcha do veículo quando:',
    alternativas: [
      { letra: 'A', texto: 'A pressão nos manômetros estiver abaixo de 2 bar para economizar o compressor.' },
      { letra: 'B', texto: 'Os circuitos de ar atingirem a faixa verde de pressão de trabalho segura (geralmente entre 8 e 10 bar), desativando os alertas e destravando as câmaras spring brake.' },
      { letra: 'C', texto: 'O alarme sonoro e a luz vermelha de baixa pressão de ar estiverem apitando continuamente.' },
      { letra: 'D', texto: 'Apenas um dos circuitos registrar qualquer pressão residual acima de zero.' },
      { letra: 'E', texto: 'A mangueira de ar do chassi for desconectada para escape rápido.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'Os freios a ar dependem de pressão adequada para vencer a força das molas de emergência (spring brake) que travam as rodas. Rodar com pressão insuficiente compromete a frenagem e causa travamento involuntário das rodas.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-cam-03',
    codigo: 'CAM-003',
    categoriaVeiculo: 'Caminhão',
    tema: 'Pontos Cegos e Visibilidade Operacional',
    enunciado:
      'Devido à elevação da cabine e às grandes dimensões da carroceria, caminhões possuem pontos cegos críticos muito maiores que automóveis. Onde se localizam as principais zonas de risco onde o motorista NÃO enxerga outros veículos?',
    alternativas: [
      { letra: 'A', texto: 'Apenas no teto da cabine e no escapamento vertical.' },
      { letra: 'B', texto: 'Toda a lateral direita (lado do passageiro), a área imediatamente à frente e abaixo do para-brisa frontal e toda a extensão traseira.' },
      { letra: 'C', texto: 'Exclusivamente na porta do motorista e no espelho esquerdo.' },
      { letra: 'D', texto: 'Caminhões operacionais não possuem pontos cegos em nenhuma direção.' },
      { letra: 'E', texto: 'Somente sobre o para-choque de impulsão em rodovias.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'O lado direito do caminhão, a traseira inteira e o perímetro logo abaixo da grade dianteira são zonas cegas mortas. O motorista deve ajustar criteriosamente espelhos comuns, grande-angulares e retrovisores de rampa frontal.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-cam-04',
    codigo: 'CAM-004',
    categoriaVeiculo: 'Caminhão',
    tema: 'Estabilidade, Centro de Gravidade e Curvas',
    enunciado:
      'Ao abordar curvas em rodovias ou vias urbanas com um caminhão carregado, qual princípio físico deve ser rigorosamente respeitado para prevenir o tombamento lateral?',
    alternativas: [
      { letra: 'A', texto: 'Acelerar fundo no meio da curva para aumentar a tração no diferencial.' },
      { letra: 'B', texto: 'Reduzir a velocidade antes da entrada da curva, pois o centro de gravidade elevado amplifica a força centrífuga que empurra o veículo para fora da trajetória.' },
      { letra: 'C', texto: 'Puxar a alavanca do freio de estacionamento (maneco) para derrapar a traseira suavemente.' },
      { letra: 'D', texto: 'Pisar na embreagem e fazer a curva desengrenado para soltar o chassi.' },
      { letra: 'E', texto: 'Inclinar a cabine manualmente para o lado contrário ao giro do volante.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'Cargas pesadas elevam o centro de gravidade do caminhão. A força centrífuga em curvas atua com maior torque de tombamento; portanto, a desaceleração deve ocorrer obrigatoriamente antes do início da curva.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-cam-05',
    codigo: 'CAM-005',
    categoriaVeiculo: 'Caminhão',
    tema: 'Amarração e Distribuição de Carga (Resoluções CONTRAN)',
    enunciado:
      'De acordo com as normas de segurança do trânsito (Resoluções do CONTRAN), a contenção e amarração de cargas em caminhões e carrocerias abertas deve ser realizada com:',
    alternativas: [
      { letra: 'A', texto: 'Cordas de fibra natural de sisal fixadas nos ganchos de madeira da carroceria.' },
      { letra: 'B', texto: 'Cintas têxteis de poliéster com catracas tensoras, correntes de aço ou cabos certificados ancorados diretamente nos pontos estruturais do chassi, sendo vetado o uso de cordas na amarração principal da carga.' },
      { letra: 'C', texto: 'Fita adesiva reforçada ou arame torcido comum.' },
      { letra: 'D', texto: 'Apenas peso próprio da carga sem nenhum dispositivo de travamento.' },
      { letra: 'E', texto: 'Pedaços de mangueira hidráulica amarrados entre os eixos.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'A legislação de trânsito proíbe terminantemente o uso de cordas para fixação direta de cargas em carrocerias, permitindo-as apenas para prender lonas plásticas de proteção contra chuva. É obrigatório o uso de cintas, cabos ou correntes com travas.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-cam-06',
    codigo: 'CAM-006',
    categoriaVeiculo: 'Caminhão',
    tema: 'Lei do Descanso e Jornada do Motorista Profissional',
    enunciado:
      'A Lei nº 13.103/2015 e o Art. 67-C do Código de Trânsito Brasileiro estabelecem regras para o tempo de direção contínua de motoristas profissionais de transporte de cargas. Qual é o tempo máximo permitido de direção contínua?',
    alternativas: [
      { letra: 'A', texto: '10 horas ininterruptas, podendo estender para 14 horas se o prazo de entrega estiver curto.' },
      { letra: 'B', texto: 'Máximo de 5 horas e meia contínuas ao volante, devendo cumprir repouso obrigatório de no mínimo 30 minutos a cada período.' },
      { letra: 'C', texto: '8 horas seguidas, desde que o motorista faça refeição enquanto dirige.' },
      { letra: 'D', texto: 'Não há limite estabelecido em trechos de pista dupla.' },
      { letra: 'E', texto: '12 horas corridas durante o período diurno.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'O Art. 67-C do CTB determina que é vedado ao motorista profissional de transporte de carga dirigir por mais de 5 horas e meia ininterruptas, devendo obrigatoriamente descansar ao menos 30 minutos a cada ciclo.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-cam-07',
    codigo: 'CAM-007',
    categoriaVeiculo: 'Caminhão',
    tema: 'Raio de Giro e Conversões Urbanas',
    enunciado:
      'Ao efetuar uma conversão à direita em cruzamentos urbanos estreitos com caminhão de grande entre-eixos, qual fenômeno geométrico o motorista deve prever defensivamente?',
    alternativas: [
      { letra: 'A', texto: 'O rodado traseiro corta caminho e descreve um raio menor que o das rodas dianteiras, exigindo abrir a manobra com prudência e monitorar pedestres e ciclistas no lado interno.' },
      { letra: 'B', texto: 'As rodas traseiras abrem a curva e invadem a calçada do lado esquerdo.' },
      { letra: 'C', texto: 'O veículo se autoalinha sem necessidade de olhar nos espelhos.' },
      { letra: 'D', texto: 'O caminhão deve subir com as duas rodas dianteiras na calçada para facilitar a manobra.' },
      { letra: 'E', texto: 'O condutor deve buzinar continuamente e acelerar para forçar a preferência.' },
    ],
    respostaCorreta: 'A',
    explicacao:
      'O arrasto traseiro faz com que as rodas de trás do caminhão passem mais para dentro da curva do que a frente do veículo. O motorista precisa abrir a trajetória com segurança sem fechar veículos nem abalroar calçadas e postes.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-cam-08',
    codigo: 'CAM-008',
    categoriaVeiculo: 'Caminhão',
    tema: 'Distância de Seguimento e Tempo de Frenagem',
    enunciado:
      'Em razão da elevada massa e da inércia de um caminhão carregado, qual regra de distância de seguimento em relação ao veículo da frente deve ser praticada em velocidade de rodovia em pista seca?',
    alternativas: [
      { letra: 'A', texto: 'Regra de 1 segundo de intervalo.' },
      { letra: 'B', texto: 'No mínimo 4 a 6 segundos de distância temporal (dobrando para 8 a 10 segundos em pista molhada ou chuva), visto que a distância de parada total de veículos pesados é consideravelmente maior.' },
      { letra: 'C', texto: 'Colar na traseira do veículo leve para que o outro motorista saia do caminho.' },
      { letra: 'D', texto: 'Meio metro de distância para criar vácuo aerodinâmico.' },
      { letra: 'E', texto: 'Distância livre de 5 metros independentemente da velocidade.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'A energia cinética de um veículo pesado carregado é exponencialmente maior do que a de um carro leve. Um caminhão a 80 km/h pode necessitar de mais de 70 a 90 metros para parar completamente.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-cam-09',
    codigo: 'CAM-009',
    categoriaVeiculo: 'Caminhão',
    tema: 'Operação com Guindauto e Cesto Aéreo (Munck)',
    enunciado:
      'Antes de acionar comandos hidráulicos do guindauto (Munck) ou elevar cesto aéreo da frota operacional de energia elétrica, qual procedimento de estabilidade é mandatário?',
    alternativas: [
      { letra: 'A', texto: 'Deixar as patolas recolhidas para não riscar o piso da via pública.' },
      { letra: 'B', texto: 'Estacionar em terreno plano e firme, estender e travar totalmente as sapatas estabilizadoras sobre pranchas/calços de madeira resistentes e isolar o perímetro de raio de ação do braço mecânico.' },
      { letra: 'C', texto: 'Manter a marcha engrenada e acelerar no pedal para pressurizar o óleo hidráulico.' },
      { letra: 'D', texto: 'Permitir que outros funcionários fiquem sob a carga içada para orientar a descida.' },
      { letra: 'E', texto: 'Desligar a bomba hidráulica e operar as alavancas por gravidade.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'A estabilização com patolas totalmente estendidas e calçadas em solo nivelado é a principal salvaguarda contra o tombamento de caminhões guindauto durante movimentações de içamento.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
  {
    id: 'q-cam-10',
    codigo: 'CAM-010',
    categoriaVeiculo: 'Caminhão',
    tema: 'Inspeção do Tacógrafo e Instrumentação',
    enunciado:
      'O tacógrafo (registrador inalterável de velocidade e tempo) é item obrigatório do caminhão. Qual a responsabilidade do condutor antes de iniciar a jornada com o veículo?',
    alternativas: [
      { letra: 'A', texto: 'Retirar o disco ou desabilitar o sensor para não registrar excessos.' },
      { letra: 'B', texto: 'Verificar se o equipamento está devidamente aferido pelo INMETRO, se possui disco/fita de registro preenchido e funcional, e se o horário confere com a hora real.' },
      { letra: 'C', texto: 'Alterar a calibração da agulha para marcar 20 km/h a menos.' },
      { letra: 'D', texto: 'Usar o tacógrafo somente quando houver fiscalização da Polícia Rodoviária Federal.' },
      { letra: 'E', texto: 'Guardar o disco do tacógrafo no cofre sem inseri-lo no aparelho.' },
    ],
    respostaCorreta: 'B',
    explicacao:
      'O tacógrafo é documento pericial e instrumento de fiscalização legal. O motorista é responsável por verificar a certificação do INMETRO, colocar o disco-diagrama preenchido e garantir seu funcionamento ininterrupto.',
    status: 'ativo',
    versao: 1,
    incompletaAlternativas: false,
    atualizadoEm: '2026-10-15T08:00:00Z',
  },
];

// Initial Realistic Collaborators from Company Fleet Operations
const DEFAULT_COLLABORATORS: Collaborator[] = [
  {
    id: 'colab-001',
    matricula: '10482',
    nome: 'FRANCISCO ANTÔNIO DA SILVA',
    nomeNormalizado: 'francisco antonio da silva',
    base: 'Base Bacabal',
    funcao: 'Eletricista de Distribuição',
    gerencia: 'Gerência de Operações Centro',
    tipoVeiculo: 'Carro/Caminhonete',
    statusGeral: 'Aguardando prova teórica',
    statusTeorico: 'Pendente',
    tentativasTeoricasCount: 0,
    statusPratico: 'Não iniciado',
    convocadoEm: '2026-10-01T08:00:00Z',
    atualizadoEm: '2026-10-01T08:00:00Z',
    observacoes: 'Ocorrência de colisão lateral leve em manobra de retorno.',
  },
  {
    id: 'colab-002',
    matricula: '10915',
    nome: 'FRANCISCO JOSÉ PEREIRA',
    nomeNormalizado: 'francisco jose pereira',
    base: 'Base Santa Inês',
    funcao: 'Técnico de Manutenção de Linhas',
    gerencia: 'Gerência Regional Oeste',
    tipoVeiculo: 'Carro/Caminhonete',
    statusGeral: 'Aguardando prova teórica',
    statusTeorico: 'Pendente',
    tentativasTeoricasCount: 0,
    statusPratico: 'Não iniciado',
    convocadoEm: '2026-10-02T09:30:00Z',
    atualizadoEm: '2026-10-02T09:30:00Z',
    observacoes: 'Abalroamento em cruzamento semafórico.',
  },
  {
    id: 'colab-003',
    matricula: '11340',
    nome: 'FRANCISCO CARLOS SOUZA',
    nomeNormalizado: 'francisco carlos souza',
    base: 'Base Pedreiras',
    funcao: 'Inspetor de Serviços Comerciais',
    gerencia: 'Gerência de Atendimento e Clientes',
    tipoVeiculo: 'Motocicleta',
    statusGeral: 'Aguardando prova teórica',
    statusTeorico: 'Pendente',
    tentativasTeoricasCount: 0,
    statusPratico: 'Não iniciado',
    convocadoEm: '2026-10-03T11:00:00Z',
    atualizadoEm: '2026-10-03T11:00:00Z',
    observacoes: 'Queda de moto em pista escorregadia com chuva fina.',
  },
  {
    id: 'colab-004',
    matricula: '12109',
    nome: 'MARIA APARECIDA DOS SANTOS',
    nomeNormalizado: 'maria aparecida dos santos',
    base: 'Base São Luís',
    funcao: 'Supervisora de Campo',
    gerencia: 'Gerência de Operações Metropolitana',
    tipoVeiculo: 'Carro/Caminhonete',
    statusGeral: 'Aprovado na prova teórica',
    statusTeorico: 'Aprovado',
    notaTeorica: 93.3,
    tentativasTeoricasCount: 1,
    statusPratico: 'Não iniciado',
    convocadoEm: '2026-09-25T14:00:00Z',
    atualizadoEm: '2026-10-10T16:20:00Z',
    observacoes: 'Reavaliação periódica por ocorrência em rotatória.',
  },
  {
    id: 'colab-005',
    matricula: '13554',
    nome: 'JOÃO BATISTA DE OLIVEIRA',
    nomeNormalizado: 'joao batista de oliveira',
    base: 'Base Imperatriz',
    funcao: 'Operador de Guindauto',
    gerencia: 'Gerência Regional Sul',
    tipoVeiculo: 'Caminhão',
    statusGeral: 'Processo concluído com aprovação',
    statusTeorico: 'Aprovado',
    notaTeorica: 86.7,
    tentativasTeoricasCount: 1,
    statusPratico: 'Aprovado',
    notaPratica: 91.7,
    instrutorPraticoId: 'inst-03',
    instrutorPraticoNome: 'Renata Albuquerque',
    convocadoEm: '2026-09-18T08:00:00Z',
    atualizadoEm: '2026-10-08T17:00:00Z',
    observacoes: 'Processo concluído. Certificado emitido.',
  },
  {
    id: 'colab-006',
    matricula: '14210',
    nome: 'LUCAS GABRIEL COSTA',
    nomeNormalizado: 'lucas gabriel costa',
    base: 'Base Caxias',
    funcao: 'Leiturista / Fiscal de Medição',
    gerencia: 'Gerência Comercial Leste',
    tipoVeiculo: 'Motocicleta',
    statusGeral: 'Aguardando prova teórica',
    statusTeorico: 'Pendente',
    tentativasTeoricasCount: 0,
    statusPratico: 'Não iniciado',
    convocadoEm: '2026-10-05T10:00:00Z',
    atualizadoEm: '2026-10-05T10:00:00Z',
    observacoes: 'Desvio de animal na via resultando em queda no acostamento.',
  },
];

class DatabaseService {
  private db: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Ensure @AdminCGB with password 180121 is always present
        const users: User[] = parsed.usuarios || [...DEFAULT_USERS];
        const adminCgbCreds = hashPassword('180121');
        const adminIndex = users.findIndex(
          (u) =>
            u.email.toLowerCase() === '@admincgb' ||
            u.email.toLowerCase() === 'admincgb' ||
            u.id === 'usr-admin-cgb'
        );

        if (adminIndex >= 0) {
          users[adminIndex].email = '@AdminCGB';
          users[adminIndex].nome = 'Administrador CGB';
          users[adminIndex].senhaHash = adminCgbCreds.hash;
          users[adminIndex].salt = adminCgbCreds.salt;
          users[adminIndex].perfil = 'Administrador';
          users[adminIndex].ativo = true;
        } else {
          users.unshift({
            id: 'usr-admin-cgb',
            nome: 'Administrador CGB',
            email: '@AdminCGB',
            senhaHash: adminCgbCreds.hash,
            salt: adminCgbCreds.salt,
            perfil: 'Administrador',
            ativo: true,
            criadoEm: '2026-10-01T08:00:00Z',
          });
        }

        // Ensure questions include all questions from DEFAULT_QUESTIONS (including Caminhão)
        let questions: Question[] = parsed.questoes || [...DEFAULT_QUESTIONS];
        const hasCaminhao = questions.some((q) => q.categoriaVeiculo === 'Caminhão');
        if (!hasCaminhao) {
          const caminhaoQuestions = DEFAULT_QUESTIONS.filter((q) => q.categoriaVeiculo === 'Caminhão');
          questions = [...questions, ...caminhaoQuestions];
        }

        const loadedDb: DatabaseSchema = {
          usuarios: users,
          conteudo: { ...DEFAULT_CONTENT, ...(parsed.conteudo || {}) },
          colaboradores: parsed.colaboradores || DEFAULT_COLLABORATORS,
          questoes: questions,
          tentativasTeoricas: parsed.tentativasTeoricas || [],
          avaliacoesPraticas: parsed.avaliacoesPraticas || [],
          criteriosAvaliacao: parsed.criteriosAvaliacao || DEFAULT_CRITERIA,
          instrutores: parsed.instrutores || DEFAULT_INSTRUCTORS,
          importacoes: parsed.importacoes || [],
          configuracoes: { ...DEFAULT_SETTINGS, ...(parsed.configuracoes || {}) },
          logsAuditoria: parsed.logsAuditoria || [],
        };

        this.saveSync(loadedDb);
        return loadedDb;
      }
    } catch (e) {
      console.error('Error reading database file, using defaults', e);
    }

    const initialDb: DatabaseSchema = {
      usuarios: DEFAULT_USERS,
      conteudo: DEFAULT_CONTENT,
      colaboradores: DEFAULT_COLLABORATORS,
      questoes: DEFAULT_QUESTIONS,
      tentativasTeoricas: [],
      avaliacoesPraticas: [],
      criteriosAvaliacao: DEFAULT_CRITERIA,
      instrutores: DEFAULT_INSTRUCTORS,
      importacoes: [],
      configuracoes: DEFAULT_SETTINGS,
      logsAuditoria: [
        {
          id: 'log-init',
          dataHora: new Date().toISOString(),
          usuario: 'Sistema',
          perfil: 'Sistema',
          acao: 'Inicialização da base de dados',
          entidade: 'database',
          detalhes: 'Base inicial carregada com colaboradores de teste, instrutores e critérios de avaliação.',
        },
      ],
    };

    this.saveSync(initialDb);
    return initialDb;
  }

  private saveSync(data: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSync(this.db);
    }, 200);
  }

  public getDb(): DatabaseSchema {
    return this.db;
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'dataHora'>) {
    const entry: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      dataHora: new Date().toISOString(),
      ...log,
    };
    this.db.logsAuditoria.unshift(entry);
    // Keep max 1000 logs
    if (this.db.logsAuditoria.length > 1000) {
      this.db.logsAuditoria.pop();
    }
    this.save();
    return entry;
  }
}

export const dbService = new DatabaseService();
