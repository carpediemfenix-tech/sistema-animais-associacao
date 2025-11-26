-- Corrigir constraint CHECK da coluna especie
-- Data: 2025-11-25 16:00 UTC
-- Objetivo: Permitir valores dinâmicos da tabela especies 🔧

-- 1. REMOVER CONSTRAINT CHECK EXISTENTE (se existir)
DO $$ 
BEGIN
    -- Tentar remover constraint que pode estar causando o problema
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.animais'::regclass 
            AND contype = 'c' 
            AND conname LIKE '%especie%'
    ) THEN
        -- Buscar o nome exato da constraint
        DECLARE
            constraint_name TEXT;
        BEGIN
            SELECT conname INTO constraint_name
            FROM pg_constraint 
            WHERE conrelid = 'public.animais'::regclass 
                AND contype = 'c' 
                AND conname LIKE '%especie%'
            LIMIT 1;
            
            IF constraint_name IS NOT NULL THEN
                EXECUTE 'ALTER TABLE public.animais DROP CONSTRAINT ' || constraint_name;
                RAISE NOTICE 'Constraint % removida com sucesso', constraint_name;
            END IF;
        END;
    END IF;
END $$;

-- 2. ALTERAR COLUNA ESPECIE PARA TEXT (sem restrições)
ALTER TABLE public.animais 
ALTER COLUMN especie TYPE TEXT;

-- 3. VERIFICAR SE A ALTERAÇÃO FOI BEM-SUCEDIDA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
    AND column_name = 'especie';

-- 4. VERIFICAR SE AINDA EXISTEM CONSTRAINTS CHECK NA COLUNA ESPECIE
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.animais'::regclass 
    AND contype = 'c'  -- CHECK constraints
    AND pg_get_constraintdef(oid) LIKE '%especie%';

-- 5. TESTAR INSERÇÃO COM VALORES DA TABELA ESPECIES
-- Buscar um valor válido da tabela especies para teste
DO $$
DECLARE
    test_especie TEXT;
BEGIN
    SELECT nome INTO test_especie 
    FROM public.especies 
    WHERE ativo = true 
    LIMIT 1;
    
    IF test_especie IS NOT NULL THEN
        RAISE NOTICE 'Valor de teste disponível: %', test_especie;
        
        -- Tentar inserir um registro de teste (será removido depois)
        INSERT INTO public.animais (
            nome, 
            especie, 
            sexo, 
            data_entrada, 
            estado, 
            arquivado
        ) VALUES (
            'TESTE_CONSTRAINT', 
            test_especie, 
            'Macho', 
            CURRENT_DATE, 
            'Ativo', 
            false
        );
        
        -- Remover o registro de teste
        DELETE FROM public.animais WHERE nome = 'TESTE_CONSTRAINT';
        
        RAISE NOTICE 'Teste de inserção bem-sucedido com espécie: %', test_especie;
    END IF;
END $$;

SELECT 'CONSTRAINT CHECK CORRIGIDA COM SUCESSO! ✅' as status;