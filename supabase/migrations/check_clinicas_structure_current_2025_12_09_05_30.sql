-- Verificar se a tabela clinicas_veterinarias existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'clinicas_veterinarias';

-- Verificar estrutura da tabela intervencoes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'intervencoes'
ORDER BY ordinal_position;

-- Verificar se existe a coluna clinica_id
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'intervencoes' 
    AND column_name = 'clinica_id'
) as clinica_id_exists;

-- Contar registos nas tabelas
SELECT 
    'intervencoes' as tabela,
    COUNT(*) as registos
FROM public.intervencoes
UNION ALL
SELECT 
    'clinicas_veterinarias' as tabela,
    COUNT(*) as registos
FROM public.clinicas_veterinarias;