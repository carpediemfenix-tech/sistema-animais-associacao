-- Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
ORDER BY ordinal_position;

-- Adicionar colunas básicas que ainda faltam
ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS hora_denuncia TIME;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS data_denuncia DATE;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS local_encontrado TEXT;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS descricao_situacao TEXT;

-- Verificar estrutura final
SELECT 
    'Estrutura FINAL da tabela denuncias' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00';

-- Listar todas as colunas para confirmar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
ORDER BY ordinal_position;