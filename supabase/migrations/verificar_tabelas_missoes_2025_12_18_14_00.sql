-- Verificar tabelas existentes relacionadas a missões
-- Criada em: 2025-12-18 14:00 UTC

-- 1. Listar todas as tabelas que contêm "missao" ou "missoes" no nome
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%missao%' OR table_name LIKE '%missoes%')
ORDER BY table_name;

-- 2. Verificar estrutura das tabelas de missões se existirem
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND (t.table_name LIKE '%missao%' OR t.table_name LIKE '%missoes%')
ORDER BY t.table_name, c.ordinal_position;

-- 3. Verificar se existe tabela de tipos de missões
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%tipos_missoes%';

-- 4. Verificar se existe tabela de participações
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%participacao%';