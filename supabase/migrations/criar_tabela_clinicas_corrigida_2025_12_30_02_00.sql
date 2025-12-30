-- Criar tabela clinicas se não existir
CREATE TABLE IF NOT EXISTS public.clinicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(100),
    responsavel_veterinario VARCHAR(100),
    especialidades TEXT[],
    horario_funcionamento JSONB,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_clinicas_ativo ON public.clinicas(ativo);
CREATE INDEX IF NOT EXISTS idx_clinicas_nome ON public.clinicas(nome);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_clinicas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_clinicas_updated_at ON public.clinicas;
CREATE TRIGGER update_clinicas_updated_at BEFORE UPDATE ON public.clinicas
    FOR EACH ROW EXECUTE FUNCTION update_clinicas_updated_at();

-- Inserir clínicas de exemplo (apenas se não existirem)
INSERT INTO public.clinicas (nome, endereco, telefone, email, responsavel_veterinario, especialidades, ativo, created_by) 
SELECT * FROM (VALUES
    ('Clínica Veterinária Central', 'Rua Principal, 123, Lisboa', '21-123-4567', 'central@clinica.pt', 'Dr. João Silva', ARRAY['Clínica Geral', 'Cirurgia'], true, 'admin'),
    ('Hospital Veterinário do Porto', 'Avenida da Boavista, 456, Porto', '22-987-6543', 'porto@hospital.pt', 'Dra. Maria Santos', ARRAY['Emergências', 'Cardiologia'], true, 'admin'),
    ('Clínica Animal Care', 'Rua das Flores, 789, Coimbra', '23-555-1234', 'care@animal.pt', 'Dr. Pedro Costa', ARRAY['Dermatologia', 'Oftalmologia'], true, 'admin'),
    ('Veterinária São Francisco', 'Largo São Francisco, 12, Braga', '25-333-7890', 'saofrancisco@vet.pt', 'Dra. Ana Rodrigues', ARRAY['Clínica Geral', 'Vacinação'], true, 'admin'),
    ('Clínica Veterinária Esperança', 'Rua da Esperança, 45, Faro', '28-777-2468', 'esperanca@clinica.pt', 'Dr. Carlos Mendes', ARRAY['Cirurgia', 'Radiologia'], true, 'admin')
) AS v(nome, endereco, telefone, email, responsavel_veterinario, especialidades, ativo, created_by)
WHERE NOT EXISTS (SELECT 1 FROM public.clinicas WHERE nome = v.nome);

-- Verificar resultado
SELECT 
    'Clínicas criadas' as status,
    COUNT(*) as total_clinicas,
    COUNT(*) FILTER (WHERE ativo = true) as clinicas_ativas
FROM public.clinicas;