-- Criar tabela tipos_intervencoes se não existir
CREATE TABLE IF NOT EXISTS tipos_intervencoes_2025_12_24_06_32 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) DEFAULT 'consulta',
    icone VARCHAR(10) DEFAULT '🏥',
    cor VARCHAR(7) DEFAULT '#3B82F6',
    custo_estimado DECIMAL(10,2) DEFAULT 0,
    duracao_estimada INTEGER DEFAULT 60,
    requer_anestesia BOOLEAN DEFAULT false,
    requer_internamento BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir alguns tipos básicos se a tabela estiver vazia
INSERT INTO tipos_intervencoes_2025_12_24_06_32 (nome, descricao, categoria, icone, cor, custo_estimado, duracao_estimada, requer_anestesia, requer_internamento)
VALUES 
    ('Consulta Geral', 'Consulta veterinária de rotina', 'consulta', '🩺', '#3B82F6', 25.00, 30, false, false),
    ('Vacinação', 'Administração de vacinas', 'vacinacao', '💉', '#10B981', 15.00, 15, false, false),
    ('Esterilização', 'Cirurgia de esterilização', 'cirurgia', '✂️', '#EF4444', 80.00, 120, true, true),
    ('Consulta de Emergência', 'Atendimento de urgência', 'emergencia', '⚡', '#F59E0B', 50.00, 45, false, false),
    ('Exame de Sangue', 'Análises laboratoriais', 'diagnostico', '🔬', '#8B5CF6', 30.00, 20, false, false)
ON CONFLICT (nome) DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tipos_intervencoes_categoria_2025_12_24_06_32 ON tipos_intervencoes_2025_12_24_06_32(categoria);
CREATE INDEX IF NOT EXISTS idx_tipos_intervencoes_ativo_2025_12_24_06_32 ON tipos_intervencoes_2025_12_24_06_32(ativo);

-- Comentários para documentação
COMMENT ON TABLE tipos_intervencoes_2025_12_24_06_32 IS 'Tipos de intervenções médicas e veterinárias';
COMMENT ON COLUMN tipos_intervencoes_2025_12_24_06_32.categoria IS 'Categoria: cirurgia, consulta, vacinacao, tratamento, emergencia, preventivo, diagnostico';
COMMENT ON COLUMN tipos_intervencoes_2025_12_24_06_32.icone IS 'Emoji ou ícone para representação visual';
COMMENT ON COLUMN tipos_intervencoes_2025_12_24_06_32.cor IS 'Cor em formato hexadecimal (#RRGGBB)';
COMMENT ON COLUMN tipos_intervencoes_2025_12_24_06_32.custo_estimado IS 'Custo estimado em euros';
COMMENT ON COLUMN tipos_intervencoes_2025_12_24_06_32.duracao_estimada IS 'Duração estimada em minutos';