-- Investigação profunda e remoção definitiva da constraint especie
-- Data: 2025-11-25 16:30 UTC
-- Objetivo: Resolver definitivamente o problema da constraint 🔧

-- 1. INVESTIGAÇÃO COMPLETA DE TODAS AS CONSTRAINTS DA TABELA ANIMAIS
SELECT 
    'TODAS AS CONSTRAINTS DA TABELA ANIMAIS:' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.animais'::regclass 
ORDER BY contype, conname;

-- 2. BUSCAR ESPECIFICAMENTE A CONSTRAINT PROBLEMÁTICA
SELECT 
    'CONSTRAINT PROBLEMÁTICA:' as info,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.animais'::regclass 
    AND conname = 'animais_especie_check';

-- 3. REMOVER A CONSTRAINT PROBLEMÁTICA DEFINITIVAMENTE
DO $$ 
BEGIN
    -- Verificar se a constraint existe e removê-la
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.animais'::regclass 
            AND conname = 'animais_especie_check'
    ) THEN
        ALTER TABLE public.animais DROP CONSTRAINT animais_especie_check;
        RAISE NOTICE 'Constraint animais_especie_check removida com sucesso! ✅';
    ELSE
        RAISE NOTICE 'Constraint animais_especie_check não encontrada';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover constraint: %', SQLERRM;
END $$;

-- 4. VERIFICAR SE A CONSTRAINT FOI REMOVIDA
SELECT 
    'VERIFICAÇÃO PÓS-REMOÇÃO:' as info,
    COUNT(*) as constraints_restantes
FROM pg_constraint 
WHERE conrelid = 'public.animais'::regclass 
    AND conname = 'animais_especie_check';

-- 5. BUSCAR MÓNICA VIDAL NA TABELA VOLUNTÁRIOS
SELECT 
    'DADOS DA MÓNICA VIDAL:' as info,
    id,
    nome,
    email,
    especialidade,
    ativo
FROM public.voluntarios 
WHERE UPPER(nome) LIKE '%MÓNICA%' 
    OR UPPER(nome) LIKE '%MONICA%'
    OR UPPER(nome) LIKE '%VIDAL%';

-- 6. LISTAR ANIMAIS SEM VOLUNTÁRIO RESPONSÁVEL
SELECT 
    'ANIMAIS SEM VOLUNTÁRIO RESPONSÁVEL:' as info,
    COUNT(*) as quantidade
FROM public.animais 
WHERE voluntario_responsavel_id IS NULL;

SELECT 'INVESTIGAÇÃO COMPLETA REALIZADA! 🔍' as status;