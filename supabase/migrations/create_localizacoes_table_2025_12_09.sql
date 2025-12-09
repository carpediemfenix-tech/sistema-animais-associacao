-- Verificar se a tabela localizacoes existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'localizacoes';

-- Se não existir, criar a tabela localizacoes
CREATE TABLE IF NOT EXISTS public.localizacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir algumas localizações padrão se a tabela estiver vazia
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