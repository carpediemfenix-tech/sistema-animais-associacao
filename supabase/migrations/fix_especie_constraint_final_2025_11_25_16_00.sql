-- Corrigir constraint especie removendo view temporariamente
-- Data: 2025-11-25 16:00 UTC
-- Objetivo: Remover constraint CHECK problemática 🔧

-- 1. SALVAR DEFINIÇÃO DA VIEW ANTES DE REMOVER
DO $$
DECLARE
    view_definition TEXT;
BEGIN
    SELECT pg_get_viewdef('responsabilidades_ativas') INTO view_definition;
    RAISE NOTICE 'View definition saved: %', view_definition;
END $$;

-- 2. REMOVER VIEW TEMPORARIAMENTE
DROP VIEW IF EXISTS responsabilidades_ativas;

-- 3. REMOVER CONSTRAINT CHECK DA COLUNA ESPECIE
DO $$ 
BEGIN
    -- Buscar e remover constraint CHECK na coluna especie
    DECLARE
        constraint_name TEXT;
    BEGIN
        SELECT conname INTO constraint_name
        FROM pg_constraint 
        WHERE conrelid = 'public.animais'::regclass 
            AND contype = 'c' 
            AND pg_get_constraintdef(oid) LIKE '%especie%'
        LIMIT 1;
        
        IF constraint_name IS NOT NULL THEN
            EXECUTE 'ALTER TABLE public.animais DROP CONSTRAINT ' || constraint_name;
            RAISE NOTICE 'Constraint % removida com sucesso', constraint_name;
        ELSE
            RAISE NOTICE 'Nenhuma constraint CHECK encontrada para especie';
        END IF;
    END;
END $$;

-- 4. RECRIAR VIEW RESPONSABILIDADES_ATIVAS
CREATE OR REPLACE VIEW responsabilidades_ativas AS
SELECT 
  r.*,
  a.nome as animal_nome,
  a.numero_processo,
  a.especie,
  v.nome as voluntario_nome,
  v.email as voluntario_email,
  v.telefone as voluntario_telefone
FROM public.responsabilidades_voluntarios r
JOIN public.animais a ON r.animal_id = a.id
JOIN public.voluntarios v ON r.voluntario_id = v.id
WHERE r.data_fim IS NULL AND r.ativo = true;

-- 5. VERIFICAR SE A CONSTRAINT FOI REMOVIDA
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.animais'::regclass 
    AND contype = 'c'  -- CHECK constraints
    AND pg_get_constraintdef(oid) LIKE '%especie%';

-- 6. TESTAR INSERÇÃO COM VALORES DA TABELA ESPECIES
DO $$
DECLARE
    test_especie TEXT;
    test_id UUID;
BEGIN
    -- Buscar um valor válido da tabela especies
    SELECT nome INTO test_especie 
    FROM public.especies 
    WHERE ativo = true 
    LIMIT 1;
    
    IF test_especie IS NOT NULL THEN
        RAISE NOTICE 'Testando inserção com espécie: %', test_especie;
        
        -- Tentar inserir um registro de teste
        INSERT INTO public.animais (
            nome, 
            especie, 
            sexo, 
            data_entrada, 
            estado, 
            arquivado
        ) VALUES (
            'TESTE_CONSTRAINT_FIX', 
            test_especie, 
            'Macho', 
            CURRENT_DATE, 
            'Ativo', 
            false
        ) RETURNING id INTO test_id;
        
        -- Remover o registro de teste
        DELETE FROM public.animais WHERE id = test_id;
        
        RAISE NOTICE 'Teste de inserção bem-sucedido! ✅';
    END IF;
END $$;

SELECT 'PROBLEMA DA CONSTRAINT ESPECIE CORRIGIDO! 🎉' as status;