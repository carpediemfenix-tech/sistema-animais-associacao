-- ========================================
-- CORRIGIR ESTRUTURA DA TABELA EVENTOS_ANIMAL
-- ========================================

-- Verificar estrutura atual da tabela
SELECT 
    'Estrutura atual da tabela eventos_animal:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'eventos_animal' 
ORDER BY ordinal_position;

-- Adicionar colunas faltantes se não existirem
DO $$
BEGIN
    -- Adicionar coluna documento_referencia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'eventos_animal' AND column_name = 'documento_referencia') THEN
        ALTER TABLE eventos_animal ADD COLUMN documento_referencia TEXT;
        RAISE NOTICE 'Coluna documento_referencia adicionada';
    END IF;

    -- Adicionar coluna importante
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'eventos_animal' AND column_name = 'importante') THEN
        ALTER TABLE eventos_animal ADD COLUMN importante BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna importante adicionada';
    END IF;

    -- Adicionar coluna voluntario_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'eventos_animal' AND column_name = 'voluntario_id') THEN
        ALTER TABLE eventos_animal ADD COLUMN voluntario_id UUID REFERENCES voluntarios(id);
        RAISE NOTICE 'Coluna voluntario_id adicionada';
    END IF;

    -- Verificar se coluna descricao existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'eventos_animal' AND column_name = 'descricao') THEN
        ALTER TABLE eventos_animal ADD COLUMN descricao TEXT;
        RAISE NOTICE 'Coluna descricao adicionada';
    END IF;

    -- Verificar se coluna observacoes existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'eventos_animal' AND column_name = 'observacoes') THEN
        ALTER TABLE eventos_animal ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Coluna observacoes adicionada';
    END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_eventos_animal_voluntario ON eventos_animal(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_eventos_animal_importante ON eventos_animal(importante);
CREATE INDEX IF NOT EXISTS idx_eventos_animal_data ON eventos_animal(data_evento);

-- Verificar estrutura final
SELECT 
    'Estrutura final da tabela eventos_animal:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'eventos_animal' 
ORDER BY ordinal_position;

-- Verificar se existem dados na tabela
SELECT 
    'Status da tabela:' as info,
    COUNT(*) as total_eventos
FROM eventos_animal;