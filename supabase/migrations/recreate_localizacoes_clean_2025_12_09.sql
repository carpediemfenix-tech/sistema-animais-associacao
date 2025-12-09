-- Verificar todas as colunas da tabela localizacoes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'localizacoes'
ORDER BY ordinal_position;

-- Remover constraint NOT NULL da coluna localizacao se existir
ALTER TABLE public.localizacoes 
ALTER COLUMN localizacao DROP NOT NULL;

-- Remover a coluna localizacao se existir (é redundante com nome)
ALTER TABLE public.localizacoes 
DROP COLUMN IF EXISTS localizacao;

-- Remover outras colunas desnecessárias se existirem
ALTER TABLE public.localizacoes 
DROP COLUMN IF EXISTS animal_id;

ALTER TABLE public.localizacoes 
DROP COLUMN IF EXISTS responsavel_id;

-- Garantir que apenas as colunas necessárias existem
-- Se a tabela estiver muito bagunçada, recriar do zero
DROP TABLE IF EXISTS public.localizacoes_backup;
CREATE TABLE public.localizacoes_backup AS SELECT * FROM public.localizacoes;

DROP TABLE IF EXISTS public.localizacoes;

CREATE TABLE public.localizacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrar dados da backup se houver
INSERT INTO public.localizacoes (nome, descricao, ativo)
SELECT 
    COALESCE(nome, 'Localização ' || id::text) as nome,
    descricao,
    COALESCE(ativo, true) as ativo
FROM public.localizacoes_backup
WHERE nome IS NOT NULL AND nome != '';

-- Se não houver dados, inserir dados padrão
INSERT INTO public.localizacoes (nome, descricao, ativo) 
SELECT * FROM (VALUES 
    ('Canil Principal', 'Área principal para cães adultos', true),
    ('Canil Quarentena', 'Área de quarentena para novos animais', true),
    ('Gatil Principal', 'Área principal para gatos adultos', true),
    ('Gatil Quarentena', 'Área de quarentena para gatos', true),
    ('Enfermaria', 'Área para animais em tratamento médico', true),
    ('Área Externa', 'Pátio e área de exercício', true)
) AS v(nome, descricao, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.localizacoes LIMIT 1);

-- Conceder permissões
GRANT ALL PRIVILEGES ON public.localizacoes TO authenticated;
GRANT ALL PRIVILEGES ON public.localizacoes TO anon;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'localizacoes'
ORDER BY ordinal_position;