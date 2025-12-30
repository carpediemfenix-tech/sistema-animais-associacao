-- Verificar constraints da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
AND column_name LIKE '%local%'
ORDER BY ordinal_position;

-- Verificar todas as constraints NOT NULL
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- Remover constraint NOT NULL da coluna local_completo se existir
ALTER TABLE public.denuncias_2025_12_29_23_00 
ALTER COLUMN local_completo DROP NOT NULL;

-- Ou adicionar valor padrão se preferir manter NOT NULL
-- ALTER TABLE public.denuncias_2025_12_29_23_00 
-- ALTER COLUMN local_completo SET DEFAULT '';

-- Verificar se a coluna local_completo existe, se não, criar
ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS local_completo TEXT;

-- Verificar resultado final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
AND column_name LIKE '%local%'
ORDER BY ordinal_position;