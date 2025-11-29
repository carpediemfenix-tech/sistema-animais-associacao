-- ========================================
-- SISTEMA COMPLETO DE GESTÃO DE ANIMAIS
-- ========================================

-- 1. TABELA DE INTERVENÇÕES MÉDICAS
-- ========================================
CREATE TABLE IF NOT EXISTS intervencoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    tipo_intervencao_id UUID REFERENCES tipos_intervencoes(id),
    voluntario_id UUID REFERENCES voluntarios(id),
    data_intervencao DATE NOT NULL,
    veterinario TEXT,
    clinica TEXT,
    observacoes TEXT,
    custo DECIMAL(10,2),
    proxima_data DATE,
    urgente BOOLEAN DEFAULT FALSE,
    concluida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE EVENTOS DA VIDA DO ANIMAL
-- ========================================
CREATE TABLE IF NOT EXISTS eventos_animal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    tipo_evento_id UUID REFERENCES tipos_eventos(id),
    data_evento DATE NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE LOCALIZAÇÕES DO ANIMAL
-- ========================================
CREATE TABLE IF NOT EXISTS localizacoes_animal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    tipo_localizacao_id UUID REFERENCES tipos_localizacoes(id),
    data_inicio DATE NOT NULL,
    data_fim DATE, -- NULL se for a localização atual
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE, -- Apenas uma localização ativa por animal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE RESPONSABILIDADES DE VOLUNTÁRIOS
-- ========================================
CREATE TABLE IF NOT EXISTS responsabilidades_animal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    voluntario_id UUID NOT NULL REFERENCES voluntarios(id),
    data_inicio DATE NOT NULL,
    data_fim DATE, -- NULL se ainda for responsável
    tipo_responsabilidade TEXT NOT NULL, -- 'cuidador', 'padrinho', 'responsavel_medico', etc.
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Intervenções
CREATE INDEX IF NOT EXISTS idx_intervencoes_animal_id ON intervencoes(animal_id);
CREATE INDEX IF NOT EXISTS idx_intervencoes_data ON intervencoes(data_intervencao);
CREATE INDEX IF NOT EXISTS idx_intervencoes_tipo ON intervencoes(tipo_intervencao_id);

-- Eventos
CREATE INDEX IF NOT EXISTS idx_eventos_animal_animal_id ON eventos_animal(animal_id);
CREATE INDEX IF NOT EXISTS idx_eventos_animal_data ON eventos_animal(data_evento);

-- Localizações
CREATE INDEX IF NOT EXISTS idx_localizacoes_animal_animal_id ON localizacoes_animal(animal_id);
CREATE INDEX IF NOT EXISTS idx_localizacoes_animal_ativo ON localizacoes_animal(ativo);

-- Responsabilidades
CREATE INDEX IF NOT EXISTS idx_responsabilidades_animal_animal_id ON responsabilidades_animal(animal_id);
CREATE INDEX IF NOT EXISTS idx_responsabilidades_animal_voluntario ON responsabilidades_animal(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_responsabilidades_animal_ativo ON responsabilidades_animal(ativo);

-- ========================================
-- POLÍTICAS RLS (SIMPLES)
-- ========================================

-- Intervenções
ALTER TABLE intervencoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON intervencoes;
CREATE POLICY "Permitir tudo para autenticados" ON intervencoes
    FOR ALL USING (auth.role() = 'authenticated');

-- Eventos
ALTER TABLE eventos_animal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON eventos_animal;
CREATE POLICY "Permitir tudo para autenticados" ON eventos_animal
    FOR ALL USING (auth.role() = 'authenticated');

-- Localizações
ALTER TABLE localizacoes_animal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON localizacoes_animal;
CREATE POLICY "Permitir tudo para autenticados" ON localizacoes_animal
    FOR ALL USING (auth.role() = 'authenticated');

-- Responsabilidades
ALTER TABLE responsabilidades_animal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON responsabilidades_animal;
CREATE POLICY "Permitir tudo para autenticados" ON responsabilidades_animal
    FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- TRIGGERS PARA LOCALIZAÇÕES (LÓGICA ÚNICA)
-- ========================================

-- Função para garantir apenas uma localização ativa por animal
CREATE OR REPLACE FUNCTION garantir_localizacao_unica()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a nova localização está sendo marcada como ativa
    IF NEW.ativo = TRUE THEN
        -- Desativar todas as outras localizações do mesmo animal
        UPDATE localizacoes_animal 
        SET ativo = FALSE, 
            data_fim = NEW.data_inicio
        WHERE animal_id = NEW.animal_id 
        AND id != NEW.id 
        AND ativo = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para localizações
DROP TRIGGER IF EXISTS trigger_localizacao_unica ON localizacoes_animal;
CREATE TRIGGER trigger_localizacao_unica
    BEFORE INSERT OR UPDATE ON localizacoes_animal
    FOR EACH ROW
    EXECUTE FUNCTION garantir_localizacao_unica();

-- ========================================
-- VERIFICAÇÕES E DADOS DE TESTE
-- ========================================

-- Verificar se existem tipos de intervenções
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tipos_intervencoes WHERE ativo = true) THEN
        -- Inserir alguns tipos básicos se não existirem
        INSERT INTO tipos_intervencoes (nome, descricao, ativo) VALUES
        ('Consulta Geral', 'Consulta veterinária de rotina', true),
        ('Vacinação', 'Administração de vacinas', true),
        ('Cirurgia', 'Procedimento cirúrgico', true),
        ('Castração', 'Procedimento de castração/esterilização', true),
        ('Tratamento', 'Tratamento médico específico', true),
        ('Emergência', 'Atendimento de emergência', true);
    END IF;
END $$;

-- Verificar estruturas criadas
SELECT 
    'intervencoes' as tabela,
    COUNT(*) as registros
FROM intervencoes
UNION ALL
SELECT 
    'eventos_animal' as tabela,
    COUNT(*) as registros
FROM eventos_animal
UNION ALL
SELECT 
    'localizacoes_animal' as tabela,
    COUNT(*) as registros
FROM localizacoes_animal
UNION ALL
SELECT 
    'responsabilidades_animal' as tabela,
    COUNT(*) as registros
FROM responsabilidades_animal;