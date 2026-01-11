-- Verificar se existe campo documento_referencia e adicioná-lo se necessário
DO $$
BEGIN
    -- Verificar se a coluna documento_referencia existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'eventos_animal' 
        AND column_name = 'documento_referencia'
        AND table_schema = 'public'
    ) THEN
        -- Se não existe, adicionar a coluna
        ALTER TABLE public.eventos_animal 
        ADD COLUMN documento_referencia TEXT;
        
        RAISE NOTICE 'Coluna documento_referencia adicionada à tabela eventos_animal';
    ELSE
        RAISE NOTICE 'Coluna documento_referencia já existe na tabela eventos_animal';
    END IF;
END $$;