-- Verificar tabelas relacionadas a intervenções
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%intervenc%'
ORDER BY table_name;

-- Verificar tabelas relacionadas a participações e missões
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name ILIKE '%participac%' OR table_name ILIKE '%missoes%')
ORDER BY table_name;

-- Verificar estrutura da tabela de participações
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'participacoes_missoes_2025_12_29_07_00'
ORDER BY ordinal_position;