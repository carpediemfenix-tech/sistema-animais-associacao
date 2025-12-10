-- Criar tabela de tipos de responsabilidades
CREATE TABLE IF NOT EXISTS public.tipos_responsabilidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir tipos de responsabilidades padrão
INSERT INTO public.tipos_responsabilidades (nome, descricao) VALUES
('Cuidador Principal', 'Responsável principal pelos cuidados diários do animal'),
('Administração de Medicação', 'Responsável pela administração de medicamentos'),
('Acompanhamento Veterinário', 'Responsável por levar o animal às consultas veterinárias'),
('Socialização', 'Responsável pela socialização e treino comportamental'),
('Transporte', 'Responsável pelo transporte do animal quando necessário'),
('Alimentação Especial', 'Responsável pela alimentação especial ou dieta específica'),
('Fisioterapia', 'Responsável pelos exercícios de fisioterapia e reabilitação'),
('Higiene e Grooming', 'Responsável pela higiene e cuidados estéticos'),
('Monitorização Médica', 'Responsável pela monitorização de condições médicas específicas'),
('Preparação para Adoção', 'Responsável pela preparação do animal para adoção')
ON CONFLICT (nome) DO NOTHING;

-- Verificar se a tabela responsabilidades_voluntarios tem o campo tipo_responsabilidade_id
ALTER TABLE public.responsabilidades_voluntarios 
ADD COLUMN IF NOT EXISTS tipo_responsabilidade_id UUID REFERENCES public.tipos_responsabilidades(id);

-- Se não tiver, adicionar campo tipo_responsabilidade (texto) temporário
ALTER TABLE public.responsabilidades_voluntarios 
ADD COLUMN IF NOT EXISTS tipo_responsabilidade VARCHAR(255);

-- Atualizar responsabilidades existentes com tipos padrão
UPDATE public.responsabilidades_voluntarios 
SET tipo_responsabilidade = 'Cuidador Principal'
WHERE tipo_responsabilidade IS NULL;

-- Políticas RLS
ALTER TABLE public.tipos_responsabilidades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users on tipos_responsabilidades" ON public.tipos_responsabilidades;
CREATE POLICY "Allow all for authenticated users on tipos_responsabilidades" ON public.tipos_responsabilidades
    FOR ALL USING (true) WITH CHECK (true);

-- Permissões
GRANT ALL ON public.tipos_responsabilidades TO authenticated;
GRANT ALL ON public.tipos_responsabilidades TO anon;

-- Verificar dados inseridos
SELECT nome, descricao, ativo FROM public.tipos_responsabilidades ORDER BY nome;