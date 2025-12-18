-- Verificação simples da base de dados criada
-- Criada em: 2025-12-18 14:32 UTC

-- 1. Listar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%2025_12_18_14_15%'
ORDER BY table_name;

-- 2. Verificar tipos de missões
SELECT codigo, nome, categoria, pontos_base 
FROM tipos_missoes_2025_12_18_14_15 
ORDER BY categoria;

-- 3. Contar registros em cada tabela
SELECT 
    'tipos_missoes_2025_12_18_14_15' as tabela,
    COUNT(*) as registros
FROM tipos_missoes_2025_12_18_14_15

UNION ALL

SELECT 
    'missoes_2025_12_18_14_15' as tabela,
    COUNT(*) as registros
FROM missoes_2025_12_18_14_15;