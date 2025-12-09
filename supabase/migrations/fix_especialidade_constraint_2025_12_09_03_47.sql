-- Remover constraint problemática da especialidade
DO $$ 
BEGIN
    -- Verificar se existe constraint voluntarios_especialidade_check
    IF EXISTS (SELECT 1 FROM pg_constraint 
               WHERE conname = 'voluntarios_especialidade_check' 
               AND conrelid = 'public.voluntarios'::regclass) THEN
        ALTER TABLE public.voluntarios DROP CONSTRAINT voluntarios_especialidade_check;
        RAISE NOTICE 'Constraint voluntarios_especialidade_check removida com sucesso';
    ELSE
        RAISE NOTICE 'Constraint voluntarios_especialidade_check não encontrada';
    END IF;
    
    -- Verificar outras constraints check na tabela voluntarios
    FOR rec IN (SELECT conname FROM pg_constraint 
                WHERE conrelid = 'public.voluntarios'::regclass 
                AND contype = 'c') LOOP
        RAISE NOTICE 'Constraint encontrada: %', rec.conname;
    END LOOP;
END $$;

-- Garantir que a coluna especialidade aceita qualquer valor texto
ALTER TABLE public.voluntarios ALTER COLUMN especialidade TYPE TEXT;
ALTER TABLE public.voluntarios ALTER COLUMN especialidade DROP NOT NULL;

-- Atualizar valores NULL para 'Geral' se necessário
UPDATE public.voluntarios 
SET especialidade = 'Geral' 
WHERE especialidade IS NULL OR especialidade = '';

COMMENT ON COLUMN public.voluntarios.especialidade IS 'Especialidade do voluntário (campo livre, opcional)';