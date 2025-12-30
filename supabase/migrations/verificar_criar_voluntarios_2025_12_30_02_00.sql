-- Verificar se a tabela voluntarios existe
SELECT 
    'Tabela voluntarios' as status,
    COUNT(*) as total_voluntarios,
    COUNT(*) FILTER (WHERE ativo = true) as voluntarios_ativos
FROM public.voluntarios;

-- Se não existir, criar tabela voluntarios
CREATE TABLE IF NOT EXISTS public.voluntarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    endereco TEXT,
    data_nascimento DATE,
    profissao VARCHAR(100),
    especialidades TEXT[],
    disponibilidade JSONB,
    experiencia_animais TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_voluntarios_ativo ON public.voluntarios(ativo);
CREATE INDEX IF NOT EXISTS idx_voluntarios_nome ON public.voluntarios(nome);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_voluntarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_voluntarios_updated_at ON public.voluntarios;
CREATE TRIGGER update_voluntarios_updated_at BEFORE UPDATE ON public.voluntarios
    FOR EACH ROW EXECUTE FUNCTION update_voluntarios_updated_at();

-- Inserir voluntários de exemplo (apenas se não existirem)
INSERT INTO public.voluntarios (nome, email, telefone, especialidades, ativo, created_by) 
SELECT * FROM (VALUES
    ('João Silva', 'joao.silva@email.pt', '91-234-5678', ARRAY['Resgate', 'Primeiros Socorros'], true, 'admin'),
    ('Maria Santos', 'maria.santos@email.pt', '92-345-6789', ARRAY['Cuidados Veterinários', 'Reabilitação'], true, 'admin'),
    ('Pedro Costa', 'pedro.costa@email.pt', '93-456-7890', ARRAY['Transporte', 'Logística'], true, 'admin'),
    ('Ana Rodrigues', 'ana.rodrigues@email.pt', '94-567-8901', ARRAY['Administração', 'Coordenação'], true, 'admin'),
    ('Carlos Mendes', 'carlos.mendes@email.pt', '95-678-9012', ARRAY['Resgate', 'Emergências'], true, 'admin'),
    ('Sofia Oliveira', 'sofia.oliveira@email.pt', '96-789-0123', ARRAY['Cuidados Animais', 'Socialização'], true, 'admin'),
    ('Ricardo Ferreira', 'ricardo.ferreira@email.pt', '97-890-1234', ARRAY['Manutenção', 'Construção'], true, 'admin'),
    ('Catarina Lopes', 'catarina.lopes@email.pt', '98-901-2345', ARRAY['Educação', 'Sensibilização'], true, 'admin')
) AS v(nome, email, telefone, especialidades, ativo, created_by)
WHERE NOT EXISTS (SELECT 1 FROM public.voluntarios WHERE nome = v.nome);

-- Verificar resultado final
SELECT 
    'Voluntários finais' as status,
    COUNT(*) as total_voluntarios,
    COUNT(*) FILTER (WHERE ativo = true) as voluntarios_ativos
FROM public.voluntarios;