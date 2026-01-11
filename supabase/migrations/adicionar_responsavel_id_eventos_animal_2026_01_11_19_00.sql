-- Primeiro, verificar se a coluna responsavel_id existe
DO $$
BEGIN
    -- Verificar se a coluna existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'eventos_animal' 
        AND column_name = 'responsavel_id'
        AND table_schema = 'public'
    ) THEN
        -- Se não existe, adicionar a coluna
        ALTER TABLE public.eventos_animal 
        ADD COLUMN responsavel_id UUID REFERENCES public.voluntarios(id);
        
        RAISE NOTICE 'Coluna responsavel_id adicionada à tabela eventos_animal';
    ELSE
        RAISE NOTICE 'Coluna responsavel_id já existe na tabela eventos_animal';
    END IF;
END $$;