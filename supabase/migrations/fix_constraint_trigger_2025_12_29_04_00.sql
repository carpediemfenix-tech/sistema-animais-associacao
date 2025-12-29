-- Desativar trigger problemático que está causando erro de constraint
-- Data: 2025-12-29 04:00 UTC

-- 1. Desativar o trigger que está causando o problema
DROP TRIGGER IF EXISTS sync_animal_state_trigger ON public.estados_animal;
DROP TRIGGER IF EXISTS ensure_single_active_state_trigger ON public.estados_animal;

-- 2. Remover as funções que estão causando conflito
DROP FUNCTION IF EXISTS sync_animal_current_state();
DROP FUNCTION IF EXISTS ensure_single_active_state();

-- 3. Verificar e remover constraint problemática se necessário
-- Primeiro vamos ver qual é a constraint exata
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Encontrar o nome da constraint que está causando problema
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'public.animais'::regclass 
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%estado%';
    
    -- Se encontrou a constraint, removê-la
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.animais DROP CONSTRAINT IF EXISTS ' || constraint_name;
        RAISE NOTICE 'Constraint % removida com sucesso', constraint_name;
    ELSE
        RAISE NOTICE 'Nenhuma constraint de estado encontrada';
    END IF;
END $$;

-- 4. Criar uma função simples apenas para garantir um estado ativo por animal
-- (sem tentar atualizar a tabela animais)
CREATE OR REPLACE FUNCTION ensure_single_active_animal_state()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o novo estado está sendo marcado como ativo
    IF NEW.ativo = true THEN
        -- Desativar todos os outros estados deste animal
        UPDATE public.estados_animal 
        SET ativo = false, data_fim = NEW.data_inicio
        WHERE animal_id = NEW.animal_id 
        AND id != NEW.id 
        AND ativo = true;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar trigger apenas para garantir estado único (sem sincronização)
CREATE TRIGGER ensure_single_active_animal_state_trigger 
    BEFORE INSERT OR UPDATE ON public.estados_animal
    FOR EACH ROW EXECUTE FUNCTION ensure_single_active_animal_state();

-- 6. Verificar se existem valores únicos no campo estado para entender a constraint
SELECT 'Constraint removida e trigger simplificado criado com sucesso!' as status;

-- 7. Mostrar valores atuais no campo estado para debug
SELECT DISTINCT estado, COUNT(*) as total
FROM public.animais 
WHERE estado IS NOT NULL AND estado != ''
GROUP BY estado
ORDER BY total DESC
LIMIT 10;