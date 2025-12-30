-- Verificar tipos de dados das colunas created_by e updated_by
SELECT 
    'Tipos de dados problemáticos' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND column_name IN ('created_by', 'updated_by', 'responsavel_id', 'especie_id')
ORDER BY column_name;

-- Se created_by e updated_by forem UUID, alterar para VARCHAR
-- Verificar primeiro se são UUID
DO $$
BEGIN
    -- Alterar created_by para VARCHAR se for UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'animais' 
        AND column_name = 'created_by' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.animais ALTER COLUMN created_by TYPE VARCHAR(100);
    END IF;
    
    -- Alterar updated_by para VARCHAR se for UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'animais' 
        AND column_name = 'updated_by' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.animais ALTER COLUMN updated_by TYPE VARCHAR(100);
    END IF;
END $$;

-- Verificar resultado final
SELECT 
    'Tipos corrigidos' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND column_name IN ('created_by', 'updated_by', 'responsavel_id', 'especie_id')
ORDER BY column_name;