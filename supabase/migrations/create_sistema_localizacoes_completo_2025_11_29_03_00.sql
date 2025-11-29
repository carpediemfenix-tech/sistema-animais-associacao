-- ========================================
-- SISTEMA COMPLETO DE LOCALIZAÇÕES
-- ========================================

-- Inserir tipos de localizações predefinidos
INSERT INTO tipos_localizacoes (nome, descricao, ativo) 
SELECT * FROM (VALUES
    ('🏠 Canil da Associação', 'Localização principal da associação', true),
    ('🏥 Clínica Veterinária', 'Em tratamento médico', true),
    ('👨‍👩‍👧‍👦 Casa de Acolhimento', 'Família temporária de acolhimento', true),
    ('❤️ Família Adotiva', 'Adoção definitiva', true),
    ('🔄 Em Transferência', 'Processo de mudança em curso', true),
    ('🏥 Internamento', 'Cuidados médicos intensivos', true),
    ('🌟 Lar Definitivo', 'Adoção confirmada e estável', true),
    ('🏠 Lar Temporário', 'Acolhimento temporário', true),
    ('🚑 Emergência', 'Localização de emergência', true),
    ('📋 Em Avaliação', 'Período de avaliação comportamental', true)
) AS v(nome, descricao, ativo)
WHERE NOT EXISTS (
    SELECT 1 FROM tipos_localizacoes WHERE tipos_localizacoes.nome = v.nome
);

-- Verificar estrutura atual da tabela localizacoes_animal
SELECT 
    'Estrutura atual da tabela localizacoes_animal:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
ORDER BY ordinal_position;

-- Adicionar colunas faltantes se necessário
DO $$
BEGIN
    -- Adicionar coluna endereco_detalhes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'localizacoes_animal' AND column_name = 'endereco_detalhes') THEN
        ALTER TABLE localizacoes_animal ADD COLUMN endereco_detalhes TEXT;
        RAISE NOTICE 'Coluna endereco_detalhes adicionada';
    END IF;

    -- Adicionar coluna responsavel_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'localizacoes_animal' AND column_name = 'responsavel_id') THEN
        ALTER TABLE localizacoes_animal ADD COLUMN responsavel_id UUID REFERENCES voluntarios(id);
        RAISE NOTICE 'Coluna responsavel_id adicionada';
    END IF;

    -- Adicionar coluna motivo_transferencia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'localizacoes_animal' AND column_name = 'motivo_transferencia') THEN
        ALTER TABLE localizacoes_animal ADD COLUMN motivo_transferencia TEXT;
        RAISE NOTICE 'Coluna motivo_transferencia adicionada';
    END IF;

    -- Adicionar coluna observacoes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'localizacoes_animal' AND column_name = 'observacoes') THEN
        ALTER TABLE localizacoes_animal ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Coluna observacoes adicionada';
    END IF;

    -- Adicionar coluna ativa para controlar localização atual
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'localizacoes_animal' AND column_name = 'ativa') THEN
        ALTER TABLE localizacoes_animal ADD COLUMN ativa BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna ativa adicionada';
    END IF;
END $$;

-- Criar função para garantir apenas uma localização ativa por animal
CREATE OR REPLACE FUNCTION garantir_localizacao_unica()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a nova localização está sendo marcada como ativa
    IF NEW.ativa = TRUE THEN
        -- Desativar todas as outras localizações do mesmo animal
        UPDATE localizacoes_animal 
        SET ativa = FALSE, 
            data_fim = NEW.data_inicio
        WHERE animal_id = NEW.animal_id 
        AND id != NEW.id 
        AND ativa = TRUE;
        
        RAISE NOTICE 'Localizações anteriores do animal % desativadas', NEW.animal_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para garantir localização única
DROP TRIGGER IF EXISTS trigger_localizacao_unica ON localizacoes_animal;
CREATE TRIGGER trigger_localizacao_unica
    BEFORE INSERT OR UPDATE ON localizacoes_animal
    FOR EACH ROW
    EXECUTE FUNCTION garantir_localizacao_unica();

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_localizacoes_animal_ativa ON localizacoes_animal(animal_id, ativa);
CREATE INDEX IF NOT EXISTS idx_localizacoes_animal_data ON localizacoes_animal(data_inicio);
CREATE INDEX IF NOT EXISTS idx_localizacoes_animal_responsavel ON localizacoes_animal(responsavel_id);

-- Verificar estrutura final
SELECT 
    'Estrutura final da tabela localizacoes_animal:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
ORDER BY ordinal_position;

-- Verificar tipos de localizações criados
SELECT 
    'Tipos de localizações criados:' as status,
    (SELECT COUNT(*) FROM tipos_localizacoes WHERE ativo = true) as tipos_ativos;