-- Verificar estrutura atual da tabela voluntarios
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voluntarios' 
ORDER BY ordinal_position;

-- Adicionar campos display_name e nickname se não existirem
DO $$
BEGIN
    -- Adicionar nickname se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'voluntarios' AND column_name = 'nickname') THEN
        ALTER TABLE voluntarios ADD COLUMN nickname TEXT;
        RAISE NOTICE 'Coluna nickname adicionada à tabela voluntarios';
    END IF;
    
    -- Adicionar display_name se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'voluntarios' AND column_name = 'display_name') THEN
        ALTER TABLE voluntarios ADD COLUMN display_name TEXT;
        RAISE NOTICE 'Coluna display_name adicionada à tabela voluntarios';
    END IF;
END $$;

-- Atualizar display_name com base no nome (se estiver vazio)
UPDATE voluntarios 
SET display_name = nome 
WHERE display_name IS NULL OR display_name = '';

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voluntarios' 
ORDER BY ordinal_position;