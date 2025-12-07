-- VERIFICAR E CORRIGIR ESTRUTURA DAS TABELAS DE FORMAÇÃO
-- Diagnóstico completo das tabelas e correção de problemas
-- Criado em: 2025-12-07 09:30 UTC

-- 1. VERIFICAR ESTRUTURA DA TABELA TIPOS_FORMACAO
SELECT 'Verificando estrutura da tabela tipos_formacao...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tipos_formacao'
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS EXISTENTES EM TIPOS_FORMACAO
SELECT 'Dados existentes em tipos_formacao:' as status;
SELECT id, codigo, nome, nivel_ordem, ativo 
FROM public.tipos_formacao 
ORDER BY nivel_ordem
LIMIT 10;

-- 3. VERIFICAR ESTRUTURA DA TABELA ACOES_FORMACAO
SELECT 'Verificando estrutura da tabela acoes_formacao...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'acoes_formacao'
ORDER BY ordinal_position;

-- 4. VERIFICAR DADOS EXISTENTES EM ACOES_FORMACAO
SELECT 'Dados existentes em acoes_formacao:' as status;
SELECT COUNT(*) as total_acoes FROM public.acoes_formacao;

-- 5. VERIFICAR FOREIGN KEY ENTRE TABELAS
SELECT 'Verificando foreign keys...' as status;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('acoes_formacao', 'tipos_formacao');

-- 6. TESTAR CONSULTA PROBLEMÁTICA
SELECT 'Testando consulta de tipos_formacao...' as status;
SELECT id, codigo, nome, descricao, nivel_ordem, carga_horaria_minima, competencias, pre_requisitos, cor, icone, ativo
FROM public.tipos_formacao
WHERE ativo = true
ORDER BY nivel_ordem;

-- 7. VERIFICAR PERMISSÕES RLS
SELECT 'Verificando políticas RLS...' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('tipos_formacao', 'acoes_formacao')
ORDER BY tablename, policyname;