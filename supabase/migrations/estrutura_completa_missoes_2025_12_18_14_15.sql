-- Estrutura completa de base de dados para módulo de missões
-- Criada em: 2025-12-18 14:15 UTC

-- 1. TABELA: Tipos de Missões
CREATE TABLE IF NOT EXISTS tipos_missoes_2025_12_18_14_15 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL, -- 'evento', 'resgate', 'campanha', 'representacao', 'tarefa'
    cor VARCHAR(20) DEFAULT '#3B82F6',
    icone VARCHAR(50) DEFAULT 'target',
    pontos_base INTEGER DEFAULT 10,
    requer_equipamentos BOOLEAN DEFAULT false,
    requer_veiculo BOOLEAN DEFAULT false,
    requer_aprovacao BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. TABELA: Missões
CREATE TABLE IF NOT EXISTS missoes_2025_12_18_14_15 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo_missao_id UUID REFERENCES tipos_missoes_2025_12_18_14_15(id),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    objetivo TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    hora_inicio TIME,
    hora_fim TIME,
    local_principal VARCHAR(200),
    locais_adicionais TEXT[], -- Array de locais adicionais
    animal_id UUID REFERENCES animais(id), -- Opcional: animal associado
    prioridade VARCHAR(20) DEFAULT 'media', -- 'baixa', 'media', 'alta', 'critica'
    status VARCHAR(30) DEFAULT 'pendente', -- 'pendente', 'em_curso', 'concluida', 'cancelada', 'pausada'
    pontos_totais INTEGER DEFAULT 0,
    orcamento_previsto DECIMAL(10,2) DEFAULT 0,
    custo_real DECIMAL(10,2) DEFAULT 0,
    max_participantes INTEGER,
    min_participantes INTEGER DEFAULT 1,
    observacoes TEXT,
    relatorio TEXT, -- Relatório final da missão
    resultado VARCHAR(50), -- 'sucesso', 'parcial', 'falhada'
    aprovada_por UUID REFERENCES auth.users(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    responsavel_id UUID REFERENCES voluntarios(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('pendente', 'em_curso', 'concluida', 'cancelada', 'pausada')),
    CONSTRAINT valid_prioridade CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    CONSTRAINT valid_resultado CHECK (resultado IN ('sucesso', 'parcial', 'falhada') OR resultado IS NULL),
    CONSTRAINT valid_dates CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

-- 3. TABELA: Participações em Missões
CREATE TABLE IF NOT EXISTS participacoes_missoes_2025_12_18_14_15 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID REFERENCES missoes_2025_12_18_14_15(id) ON DELETE CASCADE,
    voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE,
    funcao VARCHAR(100), -- 'coordenador', 'participante', 'apoio', 'especialista'
    status_participacao VARCHAR(30) DEFAULT 'confirmada', -- 'pendente', 'confirmada', 'cancelada', 'ausente'
    data_participacao DATE,
    hora_inicio TIME,
    hora_fim TIME,
    horas_dedicadas DECIMAL(4,2) DEFAULT 0,
    pontos_atribuidos INTEGER DEFAULT 0,
    avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
    comentario_avaliacao TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint para evitar duplicatas
    UNIQUE(missao_id, voluntario_id),
    
    -- Constraints
    CONSTRAINT valid_status_participacao CHECK (status_participacao IN ('pendente', 'confirmada', 'cancelada', 'ausente'))
);

-- 4. TABELA: Equipamentos por Missão
CREATE TABLE IF NOT EXISTS missoes_equipamentos_2025_12_18_14_15 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID REFERENCES missoes_2025_12_18_14_15(id) ON DELETE CASCADE,
    equipamento_id UUID REFERENCES equipamentos_2025_12_13_01_00(id) ON DELETE CASCADE,
    quantidade_necessaria INTEGER DEFAULT 1,
    quantidade_atribuida INTEGER DEFAULT 0,
    data_atribuicao TIMESTAMP WITH TIME ZONE,
    data_devolucao TIMESTAMP WITH TIME ZONE,
    responsavel_id UUID REFERENCES voluntarios(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint para evitar duplicatas
    UNIQUE(missao_id, equipamento_id)
);

-- 5. TABELA: Animais por Missão (para eventos como cãominhadas)
CREATE TABLE IF NOT EXISTS missoes_animais_2025_12_18_14_15 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID REFERENCES missoes_2025_12_18_14_15(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    funcao VARCHAR(100), -- 'participante', 'demonstracao', 'terapia', 'resgate'
    responsavel_id UUID REFERENCES voluntarios(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint para evitar duplicatas
    UNIQUE(missao_id, animal_id)
);

-- 6. TABELA: Controle Financeiro por Missão
CREATE TABLE IF NOT EXISTS missoes_financeiro_2025_12_18_14_15 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID REFERENCES missoes_2025_12_18_14_15(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL, -- 'orcamento', 'despesa', 'receita'
    categoria VARCHAR(100),
    descricao VARCHAR(200) NOT NULL,
    valor_previsto DECIMAL(10,2) DEFAULT 0,
    valor_real DECIMAL(10,2) DEFAULT 0,
    data_prevista DATE,
    data_real DATE,
    comprovativo VARCHAR(500), -- URL do documento
    aprovado BOOLEAN DEFAULT false,
    aprovado_por UUID REFERENCES auth.users(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_tipo_financeiro CHECK (tipo IN ('orcamento', 'despesa', 'receita'))
);

-- 7. TABELA: Sistema de Pontos dos Voluntários
CREATE TABLE IF NOT EXISTS voluntarios_pontos_2025_12_18_14_15 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE,
    missao_id UUID REFERENCES missoes_2025_12_18_14_15(id) ON DELETE CASCADE,
    pontos INTEGER NOT NULL,
    tipo_ponto VARCHAR(50) DEFAULT 'participacao', -- 'participacao', 'lideranca', 'bonus', 'penalizacao'
    descricao TEXT,
    data_atribuicao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atribuido_por UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_tipo_ponto CHECK (tipo_ponto IN ('participacao', 'lideranca', 'bonus', 'penalizacao'))
);

-- ÍNDICES para performance
CREATE INDEX IF NOT EXISTS idx_missoes_status ON missoes_2025_12_18_14_15(status);
CREATE INDEX IF NOT EXISTS idx_missoes_data_inicio ON missoes_2025_12_18_14_15(data_inicio);
CREATE INDEX IF NOT EXISTS idx_missoes_responsavel ON missoes_2025_12_18_14_15(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_voluntario ON participacoes_missoes_2025_12_18_14_15(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_missao ON participacoes_missoes_2025_12_18_14_15(missao_id);
CREATE INDEX IF NOT EXISTS idx_pontos_voluntario ON voluntarios_pontos_2025_12_18_14_15(voluntario_id);

-- INSERIR TIPOS DE MISSÕES PADRÃO
INSERT INTO tipos_missoes_2025_12_18_14_15 (codigo, nome, descricao, categoria, cor, icone, pontos_base, requer_equipamentos) VALUES
('EVT001', 'Evento de Adoção', 'Eventos para promover adoções de animais', 'evento', '#10B981', 'heart', 15, true),
('RES001', 'Missão de Resgate', 'Resgates de animais em situação de risco', 'resgate', '#EF4444', 'shield', 25, true),
('CAM001', 'Campanha de Sensibilização', 'Campanhas educativas e de sensibilização', 'campanha', '#8B5CF6', 'megaphone', 20, false),
('REP001', 'Representação Institucional', 'Representação da associação em eventos', 'representacao', '#F59E0B', 'users', 18, false),
('TAR001', 'Tarefa Administrativa', 'Tarefas de apoio administrativo', 'tarefa', '#6B7280', 'clipboard', 8, false),
('CAO001', 'Cãominhada', 'Passeios com cães para socialização', 'evento', '#06B6D4', 'activity', 12, true),
('FOR001', 'Formação/Workshop', 'Ações de formação e workshops', 'evento', '#84CC16', 'graduation-cap', 22, false),
('VET001', 'Apoio Veterinário', 'Assistência em consultas veterinárias', 'tarefa', '#EC4899', 'stethoscope', 20, true);

-- Comentários nas tabelas
COMMENT ON TABLE tipos_missoes_2025_12_18_14_15 IS 'Tipos de missões disponíveis no sistema';
COMMENT ON TABLE missoes_2025_12_18_14_15 IS 'Missões criadas no sistema';
COMMENT ON TABLE participacoes_missoes_2025_12_18_14_15 IS 'Participações de voluntários nas missões';
COMMENT ON TABLE missoes_equipamentos_2025_12_18_14_15 IS 'Equipamentos associados às missões';
COMMENT ON TABLE missoes_animais_2025_12_18_14_15 IS 'Animais participantes nas missões';
COMMENT ON TABLE missoes_financeiro_2025_12_18_14_15 IS 'Controle financeiro por missão';
COMMENT ON TABLE voluntarios_pontos_2025_12_18_14_15 IS 'Sistema de pontos dos voluntários';