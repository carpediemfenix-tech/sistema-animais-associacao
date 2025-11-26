-- Investigar constraint CHECK na coluna especie
-- Data: 2025-11-25 16:00 UTC
-- Objetivo: Identificar e corrigir problema de constraint 🔍

-- 1. VERIFICAR CONSTRAINTS DA TABELA ANIMAIS
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.animais'::regclass 
    AND contype = 'c'  -- CHECK constraints
    AND conname LIKE '%especie%';

-- 2. VERIFICAR ESTRUTURA DA COLUNA ESPECIE
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
    AND column_name = 'especie';

-- 3. VERIFICAR VALORES ÚNICOS EXISTENTES NA COLUNA ESPECIE
SELECT DISTINCT especie, COUNT(*) as quantidade
FROM public.animais 
GROUP BY especie 
ORDER BY quantidade DESC;

-- 4. VERIFICAR DADOS DA TABELA ESPECIES (nova tabela dinâmica)
SELECT id, nome, ativo 
FROM public.especies 
WHERE ativo = true 
ORDER BY nome;

-- 5. VERIFICAR SE HÁ DISCREPÂNCIA ENTRE OS VALORES
SELECT 'COMPARAÇÃO DE VALORES:' as status;

-- Valores na tabela animais
SELECT 'Valores em animais:' as tipo, especie as valor
FROM public.animais 
GROUP BY especie
UNION ALL
-- Valores na tabela especies
SELECT 'Valores em especies:' as tipo, nome as valor
FROM public.especies 
WHERE ativo = true;