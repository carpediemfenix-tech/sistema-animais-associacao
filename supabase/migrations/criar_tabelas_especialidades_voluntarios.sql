-- Criar tabela de especialidades de voluntários
CREATE TABLE IF NOT EXISTS public.especialidades_voluntarios_2025_12_21_22_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL DEFAULT 'Geral',
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de relacionamento voluntário-especialidades
CREATE TABLE IF NOT EXISTS public.voluntario_especialidades_2025_12_21_22_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id UUID NOT NULL,
    especialidade_id UUID NOT NULL REFERENCES public.especialidades_voluntarios_2025_12_21_22_00(id) ON DELETE CASCADE,
    data_atribuicao DATE DEFAULT CURRENT_DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(voluntario_id, especialidade_id)
);

-- Inserir especialidades padrão
INSERT INTO public.especialidades_voluntarios_2025_12_21_22_00 (nome, categoria, descricao) VALUES
('Cuidados Básicos', 'Cuidados Animais', 'Alimentação, higiene e cuidados básicos com animais'),
('Primeiros Socorros', 'Veterinária', 'Conhecimentos básicos de primeiros socorros para animais'),
('Administração', 'Gestão', 'Tarefas administrativas e de escritório'),
('Comunicação', 'Marketing', 'Redes sociais, comunicação e marketing'),
('Transporte', 'Logística', 'Transporte de animais e materiais'),
('Captação de Fundos', 'Financeiro', 'Organização de eventos e captação de recursos'),
('Formação', 'Educação', 'Formação de novos voluntários e educação'),
('Veterinária', 'Veterinária', 'Conhecimentos veterinários avançados'),
('Reabilitação', 'Cuidados Especiais', 'Reabilitação de animais feridos ou traumatizados'),
('Adoções', 'Gestão', 'Processo de adoções e acompanhamento')
ON CONFLICT DO NOTHING;

-- Políticas RLS
ALTER TABLE public.especialidades_voluntarios_2025_12_21_22_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voluntario_especialidades_2025_12_21_22_00 ENABLE ROW LEVEL SECURITY;

-- Política para especialidades (leitura para todos autenticados)
CREATE POLICY "Especialidades visíveis para autenticados" ON public.especialidades_voluntarios_2025_12_21_22_00
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para voluntário-especialidades (leitura para todos autenticados)
CREATE POLICY "Voluntário especialidades visíveis para autenticados" ON public.voluntario_especialidades_2025_12_21_22_00
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção/atualização (apenas admins)
CREATE POLICY "Apenas admins podem modificar especialidades" ON public.especialidades_voluntarios_2025_12_21_22_00
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem modificar voluntário especialidades" ON public.voluntario_especialidades_2025_12_21_22_00
    FOR ALL USING (auth.role() = 'authenticated');