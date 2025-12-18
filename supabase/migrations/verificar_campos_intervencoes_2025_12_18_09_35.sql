-- Query simples para verificar campos da tabela intervencoes
-- Criada em: 2025-12-18 09:35 UTC

-- 1. Listar todas as colunas da tabela intervencoes
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'intervencoes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Mostrar dados reais de uma intervenção específica
SELECT *
FROM public.intervencoes 
WHERE animal_id = '1685ea69-0598-4850-90c4-536c32323b35'
LIMIT 1;