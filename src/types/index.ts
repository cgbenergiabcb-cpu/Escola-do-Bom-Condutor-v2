export type VehicleType = 'Carro/Caminhonete' | 'Motocicleta' | 'Caminhão';

export type GeneralStatus =
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

export type TheoreticalStatus = 'Pendente' | 'Em andamento' | 'Aprovado' | 'Reprovado' | 'Cancelado';

export type PracticalStatus = 'Não iniciado' | 'Em andamento' | 'Aprovado' | 'Reprovado' | 'Não aplicável';

export interface Collaborator {
  id: string;
  matricula: string;
  nome: string;
  nomeNormalizado: string;
  base: string;
  funcao: string;
  gerencia: string;
  tipoVeiculo: VehicleType;
  statusGeral: GeneralStatus;
  statusTeorico: TheoreticalStatus;
  notaTeorica?: number;
  tentativasTeoricasCount: number;
  statusPratico: PracticalStatus;
  notaPratica?: number;
  instrutorPraticoId?: string;
  instrutorPraticoNome?: string;
  convocadoEm: string;
  atualizadoEm: string;
  observacoes?: string;
}

export interface QuestionAlternative {
  letra: 'A' | 'B' | 'C' | 'D' | 'E';
  texto: string;
}

export interface Question {
  id: string;
  codigo: string;
  enunciado: string;
  categoriaVeiculo: VehicleType | 'Ambos' | 'Todos';
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
  categoriaVeiculo: VehicleType;
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
  categoriaVeiculo: VehicleType | 'Geral';
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
  tipoVeiculo: VehicleType;
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

export interface UserAuth {
  id: string;
  nome: string;
  email: string;
  perfil: 'Administrador' | 'Gestor' | 'Instrutor';
  credencial?: string;
  base?: string;
  token?: string;
  ativo?: boolean;
}

export interface UserItem {
  id: string;
  nome: string;
  email: string;
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

export interface AuditLog {
  id: string;
  dataHora: string;
  usuario: string;
  perfil: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  detalhes: string;
  ip?: string;
}
