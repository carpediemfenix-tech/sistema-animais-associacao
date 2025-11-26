-- Verificar se constraint especie foi corrigida
-- Data: 2025-11-25 16:00 UTC
-- Objetivo: Confirmar que o problema foi resolvido ✅

-- 1. VERIFICAR SE AINDA EXISTEM CONSTRAINTS CHECK NA COLUNA ESPECIE
SELECT 
    'VERIFICAÇÃO DE CONSTRAINTS CHECK:' as status,
    COUNT(*) as quantidade_constraints
FROM pg_constraint 
WHERE conrelid = 'public.animais'::regclass 
    AND contype = 'c'  -- CHECK constraints
    AND pg_get_constraintdef(oid) LIKE '%especie%';

-- 2. LISTAR TODAS AS CONSTRAINTS CHECK DA TABELA ANIMAIS
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.animais'::regclass 
    AND contype = 'c'  -- CHECK constraints
ORDER BY conname;

-- 3. VERIFICAR ESTRUTURA ATUAL DA COLUNA ESPECIE
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
    AND column_name = 'especie';

-- 4. VERIFICAR VALORES DISPONÍVEIS NA TABELA ESPECIES
SELECT 
    'VALORES DISPONÍVEIS NA TABELA ESPECIES:' as info,
    id,
    nome,
    ativo
FROM public.especies 
WHERE ativo = true 
ORDER BY nome;

-- 5. VERIFICAR SE A VIEW FOI RECRIADA CORRETAMENTE
SELECT 
    'VIEW RESPONSABILIDADES_ATIVAS:' as info,
    COUNT(*) as registros_na_view
FROM responsabilidades_ativas;

SELECT 'DIAGNÓSTICO COMPLETO REALIZADO! 🔍' as status;