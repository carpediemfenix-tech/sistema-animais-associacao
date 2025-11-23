-- ========================================
-- ADICIONAR CAMPOS GEOGRÁFICOS À TABELA GRUPOS
-- ========================================

-- Adicionar novos campos geográficos
ALTER TABLE public.grupos 
ADD COLUMN IF NOT EXISTS coordenadas_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS coordenadas_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS localidade VARCHAR(255),
ADD COLUMN IF NOT EXISTS concelho VARCHAR(255),
ADD COLUMN IF NOT EXISTS distrito VARCHAR(255);

-- Verificar estrutura atualizada
SELECT 
    'ESTRUTURA ATUALIZADA DA TABELA GRUPOS:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'grupos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar dados existentes
SELECT 
    'GRUPOS EXISTENTES:' as info;

SELECT 
    nome,
    tipo,
    localizacao,
    endereco,
    coordenadas_latitude,
    coordenadas_longitude,
    localidade,
    concelho,
    distrito
FROM public.grupos
ORDER BY tipo, nome;