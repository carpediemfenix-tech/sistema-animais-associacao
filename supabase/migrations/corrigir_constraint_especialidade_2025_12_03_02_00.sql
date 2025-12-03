-- Corrigir constraint NOT NULL da coluna especialidade na tabela voluntarios
-- Data: 2025-12-03 02:00 UTC

-- 1. Verificar se a coluna especialidade existe e tem constraint NOT NULL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'voluntarios' AND column_name = 'especialidade';

-- 2. Remover constraint NOT NULL da coluna especialidade se existir
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' 
               AND column_name = 'especialidade' 
               AND is_nullable = 'NO') THEN
        ALTER TABLE public.voluntarios ALTER COLUMN especialidade DROP NOT NULL;
        COMMENT ON COLUMN public.voluntarios.especialidade IS 'Especialidade do voluntário (opcional)';
    END IF;
END $$;

-- 3. Se a coluna não existir, criá-la como opcional
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'especialidade') THEN
        ALTER TABLE public.voluntarios ADD COLUMN especialidade TEXT;
        COMMENT ON COLUMN public.voluntarios.especialidade IS 'Especialidade do voluntário (opcional)';
    END IF;
END $$;

-- 4. Verificar outras colunas que podem ter constraint NOT NULL desnecessária
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'voluntarios' 
AND is_nullable = 'NO'
AND column_name NOT IN ('id', 'nome', 'email', 'created_at', 'updated_at')
ORDER BY column_name;

-- 5. Remover constraint NOT NULL de outras colunas opcionais se necessário
DO $$ 
BEGIN
    -- Tornar telefone opcional
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' 
               AND column_name = 'telefone' 
               AND is_nullable = 'NO') THEN
        ALTER TABLE public.voluntarios ALTER COLUMN telefone DROP NOT NULL;
    END IF;
    
    -- Tornar morada opcional
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' 
               AND column_name = 'morada' 
               AND is_nullable = 'NO') THEN
        ALTER TABLE public.voluntarios ALTER COLUMN morada DROP NOT NULL;
    END IF;
    
    -- Tornar nif opcional
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' 
               AND column_name = 'nif' 
               AND is_nullable = 'NO') THEN
        ALTER TABLE public.voluntarios ALTER COLUMN nif DROP NOT NULL;
    END IF;
    
    -- Tornar profissao opcional
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' 
               AND column_name = 'profissao' 
               AND is_nullable = 'NO') THEN
        ALTER TABLE public.voluntarios ALTER COLUMN profissao DROP NOT NULL;
    END IF;
    
    -- Tornar data_nascimento opcional
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' 
               AND column_name = 'data_nascimento' 
               AND is_nullable = 'NO') THEN
        ALTER TABLE public.voluntarios ALTER COLUMN data_nascimento DROP NOT NULL;
    END IF;
END $$;

-- 6. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'voluntarios'
ORDER BY ordinal_position;