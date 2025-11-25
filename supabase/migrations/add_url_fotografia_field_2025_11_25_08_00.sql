-- Adicionar campo URL da fotografia na tabela animais
-- Data: 2025-11-25 08:00 UTC

-- Adicionar coluna url_fotografia
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS url_fotografia TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.animais.url_fotografia IS 'URL da fotografia do animal (link externo)';

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND table_schema = 'public'
ORDER BY ordinal_position;