-- Verificar se todas as colunas necessárias existem
DO $$
BEGIN
    -- Verificar se a coluna data_fim existe, se não, adicionar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'localizacoes_animal' 
        AND column_name = 'data_fim'
    ) THEN
        ALTER TABLE localizacoes_animal ADD COLUMN data_fim DATE;
    END IF;

    -- Verificar se a coluna created_at existe, se não, adicionar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'localizacoes_animal' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE localizacoes_animal ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Verificar se a coluna updated_at existe, se não, adicionar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'localizacoes_animal' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE localizacoes_animal ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal'
ORDER BY ordinal_position;