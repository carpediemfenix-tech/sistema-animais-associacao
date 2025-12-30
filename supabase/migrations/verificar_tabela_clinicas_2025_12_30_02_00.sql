-- Verificar se a tabela clinicas existe e sua estrutura
DO $$
BEGIN
    -- Verificar se a tabela clinicas existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clinicas') THEN
        RAISE NOTICE 'Tabela clinicas encontrada!';
        
        -- Mostrar estrutura da tabela
        RAISE NOTICE 'Estrutura da tabela clinicas:';
        
        -- Contar registros
        RAISE NOTICE 'Número de clínicas: %', (SELECT COUNT(*) FROM clinicas);
        RAISE NOTICE 'Clínicas ativas: %', (SELECT COUNT(*) FROM clinicas WHERE ativo = true);
        
        -- Mostrar algumas clínicas
        RAISE NOTICE 'Primeiras 5 clínicas:';
        
    ELSE
        RAISE NOTICE 'Tabela clinicas NÃO encontrada! Criando tabela...';
        
        -- Criar tabela clinicas
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
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = TIMEZONE('utc'::text, NOW());
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_clinicas_updated_at BEFORE UPDATE ON public.clinicas
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- Inserir clínicas de exemplo
        INSERT INTO public.clinicas (nome, endereco, telefone, email, responsavel_veterinario, especialidades, ativo, created_by) VALUES
        ('Clínica Veterinária Central', 'Rua Principal, 123, Lisboa', '21-123-4567', 'central@clinica.pt', 'Dr. João Silva', ARRAY['Clínica Geral', 'Cirurgia'], true, 'admin'),
        ('Hospital Veterinário do Porto', 'Avenida da Boavista, 456, Porto', '22-987-6543', 'porto@hospital.pt', 'Dra. Maria Santos', ARRAY['Emergências', 'Cardiologia'], true, 'admin'),
        ('Clínica Animal Care', 'Rua das Flores, 789, Coimbra', '23-555-1234', 'care@animal.pt', 'Dr. Pedro Costa', ARRAY['Dermatologia', 'Oftalmologia'], true, 'admin'),
        ('Veterinária São Francisco', 'Largo São Francisco, 12, Braga', '25-333-7890', 'saofrancisco@vet.pt', 'Dra. Ana Rodrigues', ARRAY['Clínica Geral', 'Vacinação'], true, 'admin'),
        ('Clínica Veterinária Esperança', 'Rua da Esperança, 45, Faro', '28-777-2468', 'esperanca@clinica.pt', 'Dr. Carlos Mendes', ARRAY['Cirurgia', 'Radiologia'], true, 'admin');

        RAISE NOTICE 'Tabela clinicas criada com % registros!', (SELECT COUNT(*) FROM clinicas);
    END IF;
END $$;