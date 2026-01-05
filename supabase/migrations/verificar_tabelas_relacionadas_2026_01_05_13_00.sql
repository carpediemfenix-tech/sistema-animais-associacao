-- Verificar todas as tabelas que podem ser relacionadas a intervenções
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name ILIKE '%intervenc%' OR table_name ILIKE '%animal%' OR table_name ILIKE '%medic%' OR table_name ILIKE '%veterinar%')
ORDER BY table_name;

-- Se não existir tabela de intervenções, vamos criar uma simples para demonstração
-- Primeiro verificar se existe alguma tabela relacionada
SELECT COUNT(*) as total_tabelas_intervencoes
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%intervenc%';