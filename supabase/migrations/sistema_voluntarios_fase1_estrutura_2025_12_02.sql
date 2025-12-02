-- Sistema de Voluntários com Formação Valentão - Fase 1
-- Criado em: 2025-12-02 02:00 UTC

-- 1. Tabela de Níveis de Formação Valentão
CREATE TABLE IF NOT EXISTS niveis_formacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE, -- 'FORMA_BASE', 'FORMA_N1', etc.
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL, -- 0=BASE, 1=N1, 2=N2, 3=N3
    pre_requisitos JSONB DEFAULT '[]', -- IDs dos níveis pré-requisito
    tempo_minimo_meses INTEGER DEFAULT 0,
    missoes_minimas INTEGER DEFAULT 0,
    competencias JSONB DEFAULT '[]', -- Lista de competências
    cor VARCHAR(7) DEFAULT '#6B7280', -- Cor para UI
    icone VARCHAR(50) DEFAULT 'User', -- Ícone Lucide
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Especializações
CREATE TABLE IF NOT EXISTS especializacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE, -- 'FORMA_VET', 'FORMA_RESCUE'
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    nivel_pre_requisito UUID REFERENCES niveis_formacao(id),
    competencias JSONB DEFAULT '[]',
    cor VARCHAR(7) DEFAULT '#10B981',
    icone VARCHAR(50) DEFAULT 'Award',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Expandir tabela de voluntários (se não existir, criar)
DO $$ 
BEGIN
    -- Verificar se a tabela voluntarios existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'voluntarios') THEN
        CREATE TABLE voluntarios (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefone VARCHAR(20),
            morada TEXT,
            nif VARCHAR(20),
            data_nascimento DATE,
            profissao VARCHAR(100),
            nivel_formacao_atual UUID REFERENCES niveis_formacao(id),
            data_ingresso DATE DEFAULT CURRENT_DATE,
            ativo BOOLEAN DEFAULT true,
            data_inativacao DATE,
            motivo_inativacao TEXT,
            observacoes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Adicionar colunas se não existirem
        ALTER TABLE voluntarios 
        ADD COLUMN IF NOT EXISTS nif VARCHAR(20),
        ADD COLUMN IF NOT EXISTS data_nascimento DATE,
        ADD COLUMN IF NOT EXISTS profissao VARCHAR(100),
        ADD COLUMN IF NOT EXISTS nivel_formacao_atual UUID REFERENCES niveis_formacao(id),
        ADD COLUMN IF NOT EXISTS data_ingresso DATE DEFAULT CURRENT_DATE,
        ADD COLUMN IF NOT EXISTS data_inativacao DATE,
        ADD COLUMN IF NOT EXISTS motivo_inativacao TEXT,
        ADD COLUMN IF NOT EXISTS observacoes TEXT;
    END IF;
END $$;

-- 4. Tabela de Progressão dos Voluntários
CREATE TABLE IF NOT EXISTS voluntario_progressao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id UUID NOT NULL REFERENCES voluntarios(id) ON DELETE CASCADE,
    nivel_id UUID NOT NULL REFERENCES niveis_formacao(id),
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_conclusao DATE,
    certificado_emitido BOOLEAN DEFAULT false,
    formador_id UUID REFERENCES voluntarios(id),
    avaliacao_final DECIMAL(3,2), -- 0.00 a 10.00
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(voluntario_id, nivel_id)
);

-- 5. Tabela de Especializações dos Voluntários
CREATE TABLE IF NOT EXISTS voluntario_especializacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id UUID NOT NULL REFERENCES voluntarios(id) ON DELETE CASCADE,
    especializacao_id UUID NOT NULL REFERENCES especializacoes(id),
    data_obtencao DATE NOT NULL DEFAULT CURRENT_DATE,
    certificado_emitido BOOLEAN DEFAULT false,
    formador_id UUID REFERENCES voluntarios(id),
    avaliacao_final DECIMAL(3,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(voluntario_id, especializacao_id)
);

-- 6. Tabela de Conquistas/Medalhas
CREATE TABLE IF NOT EXISTS conquistas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50) DEFAULT 'Award', -- Ícone Lucide
    cor VARCHAR(7) DEFAULT '#F59E0B', -- Cor dourada
    criterios JSONB DEFAULT '{}', -- Critérios para obter
    pontos_requeridos INTEGER DEFAULT 0,
    nivel_minimo UUID REFERENCES niveis_formacao(id),
    categoria VARCHAR(50) DEFAULT 'geral', -- geral, formacao, missoes, tempo
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Conquistas dos Voluntários
CREATE TABLE IF NOT EXISTS voluntario_conquistas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id UUID NOT NULL REFERENCES voluntarios(id) ON DELETE CASCADE,
    conquista_id UUID NOT NULL REFERENCES conquistas(id),
    data_obtencao DATE NOT NULL DEFAULT CURRENT_DATE,
    detalhes JSONB DEFAULT '{}', -- Detalhes específicos da conquista
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(voluntario_id, conquista_id)
);

-- 8. Inserir dados iniciais dos Níveis de Formação Valentão
INSERT INTO niveis_formacao (codigo, nome, descricao, ordem, tempo_minimo_meses, missoes_minimas, competencias, cor, icone) VALUES
('FORMA_BASE', 'FORMA BASE', 'Introdução Institucional e Valores Éticos', 0, 0, 0, 
 '["Sensibilização pública", "Apoio em eventos", "Campanhas educativas"]', 
 '#10B981', 'Seedling'),
('FORMA_N1', 'FORMA N1', 'Formação Inicial e Integração Operacional', 1, 1, 5, 
 '["Apoio logístico", "Transporte não urgente", "Preparação de material"]', 
 '#3B82F6', 'Shield'),
('FORMA_N2', 'FORMA N2', 'Formação Técnica e Operacional de Campo', 2, 3, 20, 
 '["Resgate básico", "Primeiros socorros", "Intervenção de campo", "Comunicação com autoridades"]', 
 '#F59E0B', 'Sword'),
('FORMA_N3', 'FORMA N3', 'Chefia, Coordenação e Formação Avançada', 3, 6, 100, 
 '["Liderança de equipas", "Coordenação operacional", "Formação de voluntários", "Planeamento estratégico"]', 
 '#8B5CF6', 'Crown');

-- 9. Inserir especializações
INSERT INTO especializacoes (codigo, nome, descricao, nivel_pre_requisito, competencias, cor, icone) VALUES
('FORMA_VET', 'FORMA-VET', 'Especialização em Apoio Veterinário e Biossegurança', 
 (SELECT id FROM niveis_formacao WHERE codigo = 'FORMA_N2'), 
 '["Apoio veterinário", "Campanhas esterilização", "Controlo zoonótico", "Biossegurança"]', 
 '#EF4444', 'Stethoscope'),
('FORMA_RESCUE', 'FORMA-RESCUE', 'Especialização em Resgate Técnico e Emergências', 
 (SELECT id FROM niveis_formacao WHERE codigo = 'FORMA_N2'), 
 '["Resgate técnico", "Operações emergência", "Coordenação Proteção Civil", "Primeiros socorros avançados"]', 
 '#F97316', 'Zap');

-- 10. Inserir conquistas iniciais
INSERT INTO conquistas (nome, descricao, icone, cor, categoria, criterios) VALUES
('Semente Valentão', 'Completou a formação FORMA BASE', 'Seedling', '#10B981', 'formacao', '{"nivel": "FORMA_BASE"}'),
('Guardião Iniciante', 'Completou a formação FORMA N1', 'Shield', '#3B82F6', 'formacao', '{"nivel": "FORMA_N1"}'),
('Operacional Ativo', 'Completou a formação FORMA N2', 'Sword', '#F59E0B', 'formacao', '{"nivel": "FORMA_N2"}'),
('Líder Valentão', 'Completou a formação FORMA N3', 'Crown', '#8B5CF6', 'formacao', '{"nivel": "FORMA_N3"}'),
('Anjo da Saúde', 'Especialização FORMA-VET obtida', 'Heart', '#EF4444', 'especializacao', '{"especializacao": "FORMA_VET"}'),
('Herói de Emergência', 'Especialização FORMA-RESCUE obtida', 'Zap', '#F97316', 'especializacao', '{"especializacao": "FORMA_RESCUE"}'),
('Veterano Valentão', 'Dois anos de serviço ativo', 'Award', '#F59E0B', 'tempo', '{"anos_servico": 2}'),
('Mentor Exemplar', 'Formou 10 ou mais voluntários', 'Users', '#8B5CF6', 'formacao', '{"voluntarios_formados": 10}');

-- 11. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_voluntarios_nivel_atual ON voluntarios(nivel_formacao_atual);
CREATE INDEX IF NOT EXISTS idx_voluntarios_ativo ON voluntarios(ativo);
CREATE INDEX IF NOT EXISTS idx_voluntario_progressao_voluntario ON voluntario_progressao(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_voluntario_progressao_nivel ON voluntario_progressao(nivel_id);
CREATE INDEX IF NOT EXISTS idx_voluntario_conquistas_voluntario ON voluntario_conquistas(voluntario_id);

-- 12. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger às tabelas
DROP TRIGGER IF EXISTS update_niveis_formacao_updated_at ON niveis_formacao;
CREATE TRIGGER update_niveis_formacao_updated_at BEFORE UPDATE ON niveis_formacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_especializacoes_updated_at ON especializacoes;
CREATE TRIGGER update_especializacoes_updated_at BEFORE UPDATE ON especializacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_voluntarios_updated_at ON voluntarios;
CREATE TRIGGER update_voluntarios_updated_at BEFORE UPDATE ON voluntarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_voluntario_progressao_updated_at ON voluntario_progressao;
CREATE TRIGGER update_voluntario_progressao_updated_at BEFORE UPDATE ON voluntario_progressao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Políticas RLS (Row Level Security)
ALTER TABLE niveis_formacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE especializacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntario_progressao ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntario_especializacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntario_conquistas ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver níveis de formação" ON niveis_formacao FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem ver especializações" ON especializacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem ver progressão" ON voluntario_progressao FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem ver especializações voluntários" ON voluntario_especializacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem ver conquistas" ON conquistas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem ver conquistas voluntários" ON voluntario_conquistas FOR SELECT TO authenticated USING (true);

-- Políticas de escrita para administradores (assumindo que existe um campo role)
CREATE POLICY "Administradores podem gerenciar níveis" ON niveis_formacao FOR ALL TO authenticated USING (true);
CREATE POLICY "Administradores podem gerenciar especializações" ON especializacoes FOR ALL TO authenticated USING (true);
CREATE POLICY "Administradores podem gerenciar progressão" ON voluntario_progressao FOR ALL TO authenticated USING (true);
CREATE POLICY "Administradores podem gerenciar especializações voluntários" ON voluntario_especializacoes FOR ALL TO authenticated USING (true);
CREATE POLICY "Administradores podem gerenciar conquistas" ON conquistas FOR ALL TO authenticated USING (true);
CREATE POLICY "Administradores podem gerenciar conquistas voluntários" ON voluntario_conquistas FOR ALL TO authenticated USING (true);

-- 14. Comentários para documentação
COMMENT ON TABLE niveis_formacao IS 'Níveis de formação do sistema Valentão (FORMA BASE, N1, N2, N3)';
COMMENT ON TABLE especializacoes IS 'Especializações disponíveis (FORMA-VET, FORMA-RESCUE)';
COMMENT ON TABLE voluntario_progressao IS 'Histórico de progressão formativa dos voluntários';
COMMENT ON TABLE voluntario_especializacoes IS 'Especializações obtidas pelos voluntários';
COMMENT ON TABLE conquistas IS 'Medalhas e conquistas disponíveis no sistema';
COMMENT ON TABLE voluntario_conquistas IS 'Conquistas obtidas pelos voluntários';

-- 15. Verificação final
SELECT 'Estrutura de base de dados criada com sucesso!' as status;
SELECT 'Níveis de formação inseridos: ' || COUNT(*) as niveis FROM niveis_formacao;
SELECT 'Especializações inseridas: ' || COUNT(*) as especializacoes FROM especializacoes;
SELECT 'Conquistas inseridas: ' || COUNT(*) as conquistas FROM conquistas;