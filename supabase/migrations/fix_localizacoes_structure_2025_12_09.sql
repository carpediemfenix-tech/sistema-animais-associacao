-- Adicionar coluna nome se não existir
ALTER TABLE public.localizacoes 
ADD COLUMN IF NOT EXISTS nome VARCHAR(255);

-- Adicionar coluna descricao se não existir
ALTER TABLE public.localizacoes 
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Adicionar coluna ativo se não existir
ALTER TABLE public.localizacoes 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Atualizar registos existentes que não tenham nome
UPDATE public.localizacoes 
SET nome = COALESCE(nome, 'Localização ' || id::text)
WHERE nome IS NULL OR nome = '';

-- Tornar a coluna nome obrigatória
ALTER TABLE public.localizacoes 
ALTER COLUMN nome SET NOT NULL;

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
WHERE NOT EXISTS (SELECT 1 FROM public.localizacoes WHERE nome IS NOT NULL LIMIT 1);

-- Conceder permissões
GRANT ALL PRIVILEGES ON public.localizacoes TO authenticated;
GRANT ALL PRIVILEGES ON public.localizacoes TO anon;