-- Criar tabela tipos_responsabilidades
CREATE TABLE IF NOT EXISTS public.tipos_responsabilidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir dados padrão para tipos de responsabilidades
INSERT INTO public.tipos_responsabilidades (nome, descricao, ativo) VALUES
('👨‍⚕️ Cuidador Principal', 'Responsável principal pelos cuidados diários do animal', true),
('🩺 Veterinário Responsável', 'Veterinário que acompanha o animal regularmente', true),
('🚗 Transporte', 'Responsável pelo transporte do animal para consultas e eventos', true),
('🍽️ Alimentação', 'Responsável pela alimentação e nutrição do animal', true),
('🏃‍♂️ Exercício e Passeios', 'Responsável pelos exercícios e passeios do animal', true),
('🤝 Socialização', 'Responsável pela socialização e interação do animal', true),
('💊 Administração de Medicação', 'Responsável pela administração de medicamentos', true),
('🛁 Higiene e Limpeza', 'Responsável pela higiene e limpeza do animal', true),
('🏡 Processo de Adoção', 'Responsável pelo processo de adoção do animal', true),
('🚨 Contacto de Emergência', 'Contacto para situações de emergência', true);

-- Inserir dados padrão para tipos de localizações (se não existirem)
INSERT INTO public.tipos_localizacoes (nome, descricao, ativo) 
SELECT nome, descricao, ativo FROM (VALUES
    ('🏠 Casa de Acolhimento', 'Animal em casa de acolhimento temporário', true),
    ('🏥 Clínica Veterinária', 'Animal internado em clínica veterinária', true),
    ('🏡 Família Adotiva', 'Animal com família adotiva permanente', true),
    ('🏢 Sede da Associação', 'Animal nas instalações da associação', true),
    ('🚗 Em Transporte', 'Animal em transporte entre localizações', true),
    ('🌳 Lar Temporário', 'Animal em lar temporário de voluntário', true),
    ('🏥 Hospital Veterinário', 'Animal em hospital veterinário para tratamento', true),
    ('🏠 Casa de Repouso', 'Animal em casa de repouso para recuperação', true),
    ('❓ Localização Desconhecida', 'Localização atual do animal desconhecida', true),
    ('🌈 Ponte do Arco-Íris', 'Animal falecido', false)
) AS dados(nome, descricao, ativo)
WHERE NOT EXISTS (
    SELECT 1 FROM public.tipos_localizacoes WHERE nome = dados.nome
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tipos_responsabilidades_ativo ON public.tipos_responsabilidades(ativo);
CREATE INDEX IF NOT EXISTS idx_tipos_responsabilidades_nome ON public.tipos_responsabilidades(nome);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tipos_responsabilidades_updated_at 
    BEFORE UPDATE ON public.tipos_responsabilidades 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para tipos_responsabilidades
ALTER TABLE public.tipos_responsabilidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver tipos de responsabilidades ativas" ON public.tipos_responsabilidades
    FOR SELECT USING (ativo = true);

CREATE POLICY "Administradores podem gerir tipos de responsabilidades" ON public.tipos_responsabilidades
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE public.tipos_responsabilidades IS 'Tipos de responsabilidades que podem ser atribuídas aos voluntários para cuidar dos animais';
COMMENT ON COLUMN public.tipos_responsabilidades.nome IS 'Nome do tipo de responsabilidade (com emoji)';
COMMENT ON COLUMN public.tipos_responsabilidades.descricao IS 'Descrição detalhada da responsabilidade';
COMMENT ON COLUMN public.tipos_responsabilidades.ativo IS 'Se o tipo está ativo e disponível para seleção';