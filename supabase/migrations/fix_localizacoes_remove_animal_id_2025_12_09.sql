-- Verificar estrutura atual da tabela localizacoes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'localizacoes'
ORDER BY ordinal_position;

-- Remover a constraint NOT NULL da coluna animal_id se existir
ALTER TABLE public.localizacoes 
ALTER COLUMN animal_id DROP NOT NULL;

-- Remover a coluna animal_id se existir (localizacoes não devem ter animal_id)
ALTER TABLE public.localizacoes 
DROP COLUMN IF EXISTS animal_id;

-- Garantir que a tabela tem a estrutura correta
ALTER TABLE public.localizacoes 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

ALTER TABLE public.localizacoes 
ADD COLUMN IF NOT EXISTS nome VARCHAR(255);

ALTER TABLE public.localizacoes 
ADD COLUMN IF NOT EXISTS descricao TEXT;

ALTER TABLE public.localizacoes 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

ALTER TABLE public.localizacoes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.localizacoes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar registos existentes que não tenham nome
UPDATE public.localizacoes 
SET nome = COALESCE(nome, 'Localização ' || id::text)
WHERE nome IS NULL OR nome = '';

-- Tornar a coluna nome obrigatória
ALTER TABLE public.localizacoes 
ALTER COLUMN nome SET NOT NULL;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'localizacoes'
ORDER BY ordinal_position;