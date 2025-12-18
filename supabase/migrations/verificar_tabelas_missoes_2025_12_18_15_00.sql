-- Verificar se as tabelas de missões existem
-- Criada em: 2025-12-18 15:00 UTC

-- 1. Listar todas as tabelas relacionadas a missões
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%missoes%'
ORDER BY table_name;

-- 2. Verificar se a tabela principal existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'missoes_2025_12_18_14_15'
) as tabela_missoes_existe;

-- 3. Verificar se a tabela de tipos existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tipos_missoes_2025_12_18_14_15'
) as tabela_tipos_existe;

-- 4. Se existir, contar registros
SELECT 
    (SELECT COUNT(*) FROM tipos_missoes_2025_12_18_14_15) as tipos_count,
    (SELECT COUNT(*) FROM missoes_2025_12_18_14_15) as missoes_count;