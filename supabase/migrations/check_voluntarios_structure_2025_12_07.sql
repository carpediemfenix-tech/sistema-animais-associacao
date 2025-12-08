-- VERIFICAR E CORRIGIR ESTRUTURA DA TABELA VOLUNTARIOS
-- Identificar campos existentes e corrigir problemas de schema
-- Criado em: 2025-12-07 10:30 UTC

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA VOLUNTARIOS
SELECT 'Estrutura atual da tabela voluntarios:' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'voluntarios'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE CAMPO PROBLEMÁTICO EXISTE
SELECT 'Verificando campo nivel_formacao_atual:' as status;
SELECT COUNT(*) as campo_existe
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'voluntarios'
AND column_name = 'nivel_formacao_atual';

-- 3. VERIFICAR DADOS EXISTENTES
SELECT 'Dados existentes na tabela voluntarios:' as status;
SELECT COUNT(*) as total_voluntarios FROM public.voluntarios;

-- 4. LISTAR PRIMEIROS REGISTROS PARA VERIFICAR ESTRUTURA
SELECT 'Primeiros registros (estrutura):' as status;
SELECT id, nome, email, ativo, tem_formacao, especialidade, data_entrada
FROM public.voluntarios 
LIMIT 3;

-- 5. VERIFICAR CAMPOS RELACIONADOS À FORMAÇÃO
SELECT 'Campos relacionados à formação:' as status;
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'voluntarios'
AND (column_name LIKE '%formacao%' OR column_name LIKE '%nivel%')
ORDER BY column_name;