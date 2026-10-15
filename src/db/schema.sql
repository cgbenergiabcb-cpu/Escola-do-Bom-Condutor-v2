-- ==============================================================================
-- ESCOLA DO BOM CONDUTOR - ESQUEMA DE BANCO DE DADOS RELACIONAL (POSTGRESQL)
-- Versão 1.0.0 - Gestão de Reavaliação Teórica e Prática de Condutores
-- ==============================================================================

-- Habilita extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE USUÁRIOS ADMINISTRATIVOS E INSTRUTORES
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(30) NOT NULL CHECK (perfil IN ('Administrador', 'Gestor', 'Instrutor')),
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE INSTRUTORES DE TRÂNSITO
CREATE TABLE IF NOT EXISTS instrutores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nome VARCHAR(150) NOT NULL,
    matricula VARCHAR(50),
    credencial_detran VARCHAR(80) NOT NULL,
    base_operacional VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefone VARCHAR(30),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE COLABORADORES CONVOCADOS
CREATE TABLE IF NOT EXISTS colaboradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricula VARCHAR(50),
    nome VARCHAR(150) NOT NULL,
    nome_normalizado VARCHAR(150) NOT NULL,
    base VARCHAR(100) NOT NULL,
    funcao VARCHAR(120) NOT NULL,
    gerencia VARCHAR(120) NOT NULL,
    tipo_veiculo VARCHAR(30) NOT NULL CHECK (tipo_veiculo IN ('Carro/Caminhonete', 'Motocicleta')),
    status_geral VARCHAR(50) NOT NULL DEFAULT 'Aguardando prova teórica' CHECK (
        status_geral IN (
            'Aguardando prova teórica',
            'Prova teórica em andamento',
            'Reprovado na prova teórica',
            'Aprovado na prova teórica',
            'Aguardando avaliação prática',
            'Avaliação prática em andamento',
            'Reprovado na prova prática',
            'Aprovado na prova prática',
            'Processo concluído com aprovação',
            'Processo concluído sem aprovação',
            'Processo pendente de regularização',
            'Processo cancelado'
        )
    ),
    status_teorico VARCHAR(30) NOT NULL DEFAULT 'Pendente' CHECK (status_teorico IN ('Pendente', 'Em andamento', 'Aprovado', 'Reprovado', 'Cancelado')),
    nota_teorica NUMERIC(5,2),
    tentativas_teoricas_count INT DEFAULT 0,
    status_pratico VARCHAR(30) NOT NULL DEFAULT 'Não iniciado' CHECK (status_pratico IN ('Não iniciado', 'Em andamento', 'Aprovado', 'Reprovado', 'Não aplicável')),
    nota_pratica NUMERIC(5,2),
    instrutor_pratico_id UUID REFERENCES instrutores(id) ON DELETE SET NULL,
    convocado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT
);

CREATE INDEX IF NOT EXISTS idx_colaboradores_nome_norm ON colaboradores (nome_normalizado);
CREATE INDEX IF NOT EXISTS idx_colaboradores_matricula ON colaboradores (matricula);
CREATE INDEX IF NOT EXISTS idx_colaboradores_base ON colaboradores (base);
CREATE INDEX IF NOT EXISTS idx_colaboradores_status_geral ON colaboradores (status_geral);
CREATE INDEX IF NOT EXISTS idx_colaboradores_tipo_veiculo ON colaboradores (tipo_veiculo);

-- 4. HISTÓRICO DE IMPORTAÇÃO DE PLANILHAS
CREATE TABLE IF NOT EXISTS importacoes_colaboradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arquivo_nome VARCHAR(255) NOT NULL,
    total_linhas INT NOT NULL,
    adicionados INT NOT NULL,
    atualizados INT NOT NULL,
    rejeitados INT NOT NULL,
    erros JSONB,
    importado_por VARCHAR(150) NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BANCO DE QUESTÕES
CREATE TABLE IF NOT EXISTS questoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    enunciado TEXT NOT NULL,
    categoria_veiculo VARCHAR(30) NOT NULL CHECK (categoria_veiculo IN ('Carro/Caminhonete', 'Motocicleta', 'Ambos')),
    tema VARCHAR(120) NOT NULL,
    alternativa_a TEXT NOT NULL,
    alternativa_b TEXT NOT NULL,
    alternativa_c TEXT NOT NULL,
    alternativa_d TEXT NOT NULL,
    alternativa_e TEXT NOT NULL,
    resposta_correta CHAR(1) NOT NULL CHECK (resposta_correta IN ('A', 'B', 'C', 'D', 'E')),
    explicacao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    versao INT DEFAULT 1,
    incompleta_alternativas BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questoes_categoria ON questoes (categoria_veiculo);
CREATE INDEX IF NOT EXISTS idx_questoes_status ON questoes (status);

-- 6. TENTATIVAS TEÓRICAS (SESSÕES IMUTÁVEIS)
CREATE TABLE IF NOT EXISTS tentativas_teoricas (
    id VARCHAR(80) PRIMARY KEY,
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    categoria_veiculo VARCHAR(30) NOT NULL,
    questoes_ids JSONB NOT NULL,
    respostas JSONB NOT NULL,
    total_questoes INT NOT NULL,
    respostas_corretas INT NOT NULL,
    respostas_incorretas INT NOT NULL,
    nao_respondidas INT NOT NULL,
    percentual_aproveitamento NUMERIC(5,2) NOT NULL,
    nota_final NUMERIC(5,2) NOT NULL,
    aprovado BOOLEAN NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('em_andamento', 'concluido', 'expirado', 'cancelado')),
    iniciado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finalizado_em TIMESTAMP WITH TIME ZONE,
    duracao_segundos INT,
    versao_banco VARCHAR(50) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tentativas_colaborador ON tentativas_teoricas (colaborador_id);
CREATE INDEX IF NOT EXISTS idx_tentativas_status ON tentativas_teoricas (status);

-- 7. CRITÉRIOS DE AVALIAÇÃO PRÁTICA
CREATE TABLE IF NOT EXISTS criterios_avaliacao (
    id VARCHAR(50) PRIMARY KEY,
    categoria_veiculo VARCHAR(30) NOT NULL CHECK (categoria_veiculo IN ('Carro/Caminhonete', 'Motocicleta', 'Geral')),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    ordem INT NOT NULL,
    obrigatorio BOOLEAN DEFAULT TRUE
);

-- 8. AVALIAÇÕES PRÁTICAS CONDUZIDAS PELO INSTRUTOR
CREATE TABLE IF NOT EXISTS avaliacoes_praticas (
    id VARCHAR(80) PRIMARY KEY,
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    instrutor_id UUID NOT NULL REFERENCES instrutores(id),
    instrutor_nome VARCHAR(150) NOT NULL,
    instrutor_credencial VARCHAR(80),
    tipo_veiculo VARCHAR(30) NOT NULL,
    data_avaliacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    criterios JSONB NOT NULL,
    total_itens_avaliados INT NOT NULL,
    total_atende INT NOT NULL,
    total_nao_atende INT NOT NULL,
    pontos_fortes TEXT,
    pontos_melhoria TEXT,
    recomendacao TEXT,
    resultado_final VARCHAR(20) NOT NULL CHECK (resultado_final IN ('Aprovado', 'Reprovado')),
    registrado_por VARCHAR(150) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_praticas_colab ON avaliacoes_praticas (colaborador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_praticas_instrutor ON avaliacoes_praticas (instrutor_id);

-- 9. CONFIGURAÇÕES GLOBAIS DO SISTEMA
CREATE TABLE IF NOT EXISTS configuracoes (
    chave VARCHAR(50) PRIMARY KEY,
    nota_minima_teorica NUMERIC(5,2) NOT NULL DEFAULT 70.0,
    quantidade_questoes_teorica INT NOT NULL DEFAULT 15,
    tempo_maximo_minutos INT NOT NULL DEFAULT 40,
    max_tentativas_teorica INT NOT NULL DEFAULT 2,
    ordem_aleatoria_questoes BOOLEAN DEFAULT TRUE,
    ordem_aleatoria_alternativas BOOLEAN DEFAULT TRUE,
    permitir_revisao BOOLEAN DEFAULT TRUE,
    nota_minima_pratica NUMERIC(5,2) NOT NULL DEFAULT 75.0,
    permitir_pratica_sem_aprovacao_teorica BOOLEAN DEFAULT FALSE,
    modo_homologacao BOOLEAN DEFAULT TRUE,
    mensagem_aviso_oficial TEXT,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. AUDITORIA E CONFORMIDADE LGPD
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id VARCHAR(80) PRIMARY KEY,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(150) NOT NULL,
    perfil VARCHAR(30) NOT NULL,
    acao VARCHAR(100) NOT NULL,
    entidade VARCHAR(80) NOT NULL,
    entidade_id VARCHAR(80),
    detalhes TEXT NOT NULL,
    ip VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_auditoria_data ON logs_auditoria (data_hora);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON logs_auditoria (entidade);
