-- Remover constraint problemática da especialidade
DO $$ 
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    -- Verificar se existe constraint voluntarios_especialidade_check
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'voluntarios_especialidade_check' 
        AND conrelid = 'public.voluntarios'::regclass
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        ALTER TABLE public.voluntarios DROP CONSTRAINT voluntarios_especialidade_check;
        RAISE NOTICE 'Constraint voluntarios_especialidade_check removida com sucesso';
    ELSE
        RAISE NOTICE 'Constraint voluntarios_especialidade_check não encontrada';
    END IF;
END $$;

-- Garantir que a coluna especialidade aceita qualquer valor texto
ALTER TABLE public.voluntarios ALTER COLUMN especialidade TYPE TEXT;
ALTER TABLE public.voluntarios ALTER COLUMN especialidade DROP NOT NULL;

-- Atualizar valores NULL para 'Geral' se necessário
UPDATE public.voluntarios 
SET especialidade = 'Geral' 
WHERE especialidade IS NULL OR especialidade = '';

COMMENT ON COLUMN public.voluntarios.especialidade IS 'Especialidade do voluntário (campo livre, opcional)';