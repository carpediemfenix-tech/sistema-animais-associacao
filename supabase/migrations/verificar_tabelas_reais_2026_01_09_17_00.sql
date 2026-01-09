-- VERIFICAR TABELAS QUE REALMENTE EXISTEM
-- Parar de gastar créditos em tabelas inexistentes

-- 1. TABELAS FINANCEIRAS REAIS
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%financeiro%' OR table_name LIKE '%categoria%')
ORDER BY table_name;

-- 2. VERIFICAR SE EXISTE TABELA DE CATEGORIAS SEM TIMESTAMP
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('categorias_financeiras', 'categorias_financeiras_2025_12_13_06_00')
ORDER BY table_name;