-- Verificar estrutura atual da tabela tipos_eventos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tipos_eventos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Adicionar campos que podem estar em falta
DO $$
BEGIN
    -- Adicionar emoji se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tipos_eventos' AND column_name = 'emoji'
    ) THEN
        ALTER TABLE public.tipos_eventos ADD COLUMN emoji VARCHAR(10) DEFAULT '📅';
        RAISE NOTICE 'Campo emoji adicionado à tipos_eventos';
    END IF;
    
    -- Adicionar cor se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tipos_eventos' AND column_name = 'cor'
    ) THEN
        ALTER TABLE public.tipos_eventos ADD COLUMN cor VARCHAR(20) DEFAULT '#3B82F6';
        RAISE NOTICE 'Campo cor adicionado à tipos_eventos';
    END IF;
    
    -- Adicionar descricao se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tipos_eventos' AND column_name = 'descricao'
    ) THEN
        ALTER TABLE public.tipos_eventos ADD COLUMN descricao TEXT;
        RAISE NOTICE 'Campo descricao adicionado à tipos_eventos';
    END IF;
    
    -- Adicionar ativo se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tipos_eventos' AND column_name = 'ativo'
    ) THEN
        ALTER TABLE public.tipos_eventos ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Campo ativo adicionado à tipos_eventos';
    END IF;
END $$;

-- Mostrar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tipos_eventos' 
AND table_schema = 'public'
ORDER BY ordinal_position;