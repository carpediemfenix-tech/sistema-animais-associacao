-- Remover tabelas antigas do sistema de missões
DROP TABLE IF EXISTS resgates_recompensas_2025_12_11_02_00 CASCADE;
DROP TABLE IF EXISTS recompensas_2025_12_11_02_00 CASCADE;
DROP TABLE IF EXISTS voluntarios_conquistas_2025_12_11_02_00 CASCADE;
DROP TABLE IF EXISTS conquistas_2025_12_11_02_00 CASCADE;
DROP TABLE IF EXISTS pontuacao_voluntarios_2025_12_11_02_00 CASCADE;
DROP TABLE IF EXISTS niveis_gamificacao_2025_12_11_02_00 CASCADE;
DROP TABLE IF EXISTS progresso_tarefas_2025_12_11_02_00 CASCADE;
DROP TABLE IF EXISTS participacoes_missoes_2025_12_11_02_00 CASCADE;
DROP TABLE IF EXISTS tarefas_missoes_2025_12_11_02_00 CASCADE;
DROP TABLE IF EXISTS missoes_2025_12_11_02_00 CASCADE;
DROP TABLE IF EXISTS tipos_missoes_2025_12_11_02_00 CASCADE;

-- Criar nova estrutura focada em missões práticas
-- 1. Tipos de Missões
CREATE TABLE tipos_missoes_2025_12_13_09_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    icone VARCHAR(50) DEFAULT 'target',
    categoria VARCHAR(50) NOT NULL, -- resgate, transporte, cuidados, limpeza, campanha, administrativo
    requer_equipamentos BOOLEAN DEFAULT false,
    requer_veiculo BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Missões
CREATE TABLE missoes_2025_12_13_09_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    tipo_missao_id UUID REFERENCES tipos_missoes_2025_12_13_09_00(id),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    objetivo TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    hora_inicio TIME,
    hora_fim TIME,
    local_principal VARCHAR(200),
    locais_adicionais TEXT[], -- Array de locais se houver múltiplos
    animal_id UUID REFERENCES animais(id), -- Se a missão for específica para um animal
    prioridade VARCHAR(20) DEFAULT 'media', -- baixa, media, alta, urgente
    status VARCHAR(20) DEFAULT 'planejada', -- planejada, em_andamento, concluida, cancelada
    orcamento_previsto DECIMAL(10,2) DEFAULT 0,
    custo_real DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    resultado TEXT, -- Resultado/relatório da missão
    criado_por UUID REFERENCES voluntarios(id),
    responsavel_id UUID REFERENCES voluntarios(id), -- Responsável principal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Participações de Voluntários nas Missões
CREATE TABLE participacoes_missoes_2025_12_13_09_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID REFERENCES missoes_2025_12_13_09_00(id) ON DELETE CASCADE,
    voluntario_id UUID REFERENCES voluntarios(id),
    funcao VARCHAR(100), -- motorista, veterinario, auxiliar, coordenador, etc.
    horas_dedicadas DECIMAL(5,2) DEFAULT 0,
    data_participacao DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    observacoes TEXT,
    avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
    comentario_avaliacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(missao_id, voluntario_id, data_participacao)
);

-- 4. Equipamentos Utilizados nas Missões
CREATE TABLE equipamentos_missoes_2025_12_13_09_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID REFERENCES missoes_2025_12_13_09_00(id) ON DELETE CASCADE,
    equipamento_id UUID REFERENCES equipamentos_2025_12_13_01_00(id),
    quantidade INTEGER DEFAULT 1,
    estado_antes VARCHAR(50), -- novo, bom, regular, danificado
    estado_depois VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Movimentos Financeiros das Missões
CREATE TABLE movimentos_financeiros_missoes_2025_12_13_09_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID REFERENCES missoes_2025_12_13_09_00(id) ON DELETE CASCADE,
    movimento_financeiro_id UUID REFERENCES movimentos_financeiros_2025_12_13_06_00(id),
    tipo VARCHAR(20) NOT NULL, -- receita, despesa
    categoria VARCHAR(100), -- combustivel, alimentacao, medicamentos, equipamentos, etc.
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_movimento DATE NOT NULL,
    comprovante VARCHAR(500), -- URL do comprovante
    aprovado_por UUID REFERENCES voluntarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_missoes_data_inicio ON missoes_2025_12_13_09_00(data_inicio);
CREATE INDEX idx_missoes_status ON missoes_2025_12_13_09_00(status);
CREATE INDEX idx_missoes_tipo ON missoes_2025_12_13_09_00(tipo_missao_id);
CREATE INDEX idx_participacoes_voluntario ON participacoes_missoes_2025_12_13_09_00(voluntario_id);
CREATE INDEX idx_participacoes_missao ON participacoes_missoes_2025_12_13_09_00(missao_id);
CREATE INDEX idx_equipamentos_missoes ON equipamentos_missoes_2025_12_13_09_00(missao_id);
CREATE INDEX idx_movimentos_missoes ON movimentos_financeiros_missoes_2025_12_13_09_00(missao_id);