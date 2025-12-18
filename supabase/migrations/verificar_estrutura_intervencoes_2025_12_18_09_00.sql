-- Verificar estrutura da tabela de intervenções
-- Criada em: 2025-12-18 09:00 UTC

-- Listar todas as colunas da tabela intervencoes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'intervencoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se existem dados na tabela
SELECT COUNT(*) as total_intervencoes FROM public.intervencoes;

-- Mostrar uma amostra dos dados (primeiros 3 registros)
SELECT * FROM public.intervencoes LIMIT 3;