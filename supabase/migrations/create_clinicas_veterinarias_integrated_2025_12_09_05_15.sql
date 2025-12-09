-- Criar tabela de clínicas veterinárias integrada com o sistema existente
CREATE TABLE IF NOT EXISTS public.clinicas_veterinarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE, -- Código único para identificação
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    contacto_responsavel VARCHAR(255),
    especialidades TEXT[], -- Array de especialidades
    tem_protocolo BOOLEAN DEFAULT false, -- Se tem protocolo/convénio
    desconto_protocolo DECIMAL(5,2) DEFAULT 0, -- Percentual de desconto
    horario_funcionamento JSONB, -- Horários de funcionamento
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clinicas_veterinarias_nome ON public.clinicas_veterinarias(nome);
CREATE INDEX IF NOT EXISTS idx_clinicas_veterinarias_ativo ON public.clinicas_veterinarias(ativo);
CREATE INDEX IF NOT EXISTS idx_clinicas_veterinarias_protocolo ON public.clinicas_veterinarias(tem_protocolo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinicas_veterinarias_updated_at 
    BEFORE UPDATE ON public.clinicas_veterinarias 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS
ALTER TABLE public.clinicas_veterinarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados" ON public.clinicas_veterinarias
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON public.clinicas_veterinarias
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON public.clinicas_veterinarias
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON public.clinicas_veterinarias
    FOR DELETE USING (auth.role() = 'authenticated');

-- Inserir dados de exemplo
INSERT INTO public.clinicas_veterinarias (nome, codigo, endereco, telefone, email, especialidades, tem_protocolo, desconto_protocolo, observacoes) VALUES
('Clínica Veterinária Central', 'CVC001', 'Rua Principal, 123, Lisboa', '213456789', 'geral@clinicacentral.pt', ARRAY['Clínica Geral', 'Cirurgia', 'Medicina Interna'], true, 15.00, 'Clínica com protocolo - desconto de 15%'),
('Hospital Veterinário do Norte', 'HVN002', 'Av. da República, 456, Porto', '223456789', 'contacto@hvnorte.pt', ARRAY['Emergências', 'Cirurgia Especializada', 'Imagiologia'], true, 20.00, 'Hospital 24h com protocolo especial'),
('Clínica dos Bichos', 'CDB003', 'Rua dos Animais, 789, Coimbra', '239456789', 'info@clinicabichos.pt', ARRAY['Clínica Geral', 'Vacinação', 'Consultas de Rotina'], false, 0.00, 'Clínica sem protocolo - preços normais'),
('Veterinária São Francisco', 'VSF004', 'Largo São Francisco, 12, Braga', '253456789', 'saofrancisco@vet.pt', ARRAY['Medicina Preventiva', 'Dermatologia', 'Oftalmologia'], true, 10.00, 'Especializada em medicina preventiva'),
('Clínica Veterinária Moderna', 'CVM005', 'Centro Comercial Moderno, Loja 45, Faro', '289456789', 'moderna@vetclinica.pt', ARRAY['Clínica Geral', 'Análises Clínicas', 'Radiologia'], false, 0.00, 'Equipamentos modernos de diagnóstico');

-- Atualizar tabela de intervenções para referenciar clínicas
-- Adicionar coluna clinica_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'clinica_id') THEN
        ALTER TABLE public.intervencoes ADD COLUMN clinica_id UUID REFERENCES public.clinicas_veterinarias(id);
        CREATE INDEX IF NOT EXISTS idx_intervencoes_clinica_id ON public.intervencoes(clinica_id);
    END IF;
END $$;

-- Migrar dados existentes de clínica (texto) para clinica_id
-- Criar clínicas para os nomes existentes que não foram mapeados
DO $$
DECLARE
    clinica_nome TEXT;
    clinica_uuid UUID;
BEGIN
    -- Para cada clínica única nas intervenções
    FOR clinica_nome IN 
        SELECT DISTINCT clinica 
        FROM public.intervencoes 
        WHERE clinica IS NOT NULL 
        AND clinica != ''
        AND NOT EXISTS (
            SELECT 1 FROM public.clinicas_veterinarias 
            WHERE nome = clinica
        )
    LOOP
        -- Inserir nova clínica
        INSERT INTO public.clinicas_veterinarias (nome, codigo, observacoes, ativo)
        VALUES (
            clinica_nome, 
            'AUTO' || EXTRACT(EPOCH FROM NOW())::INTEGER,
            'Clínica migrada automaticamente do sistema de intervenções',
            true
        )
        RETURNING id INTO clinica_uuid;
        
        -- Atualizar intervenções para referenciar a nova clínica
        UPDATE public.intervencoes 
        SET clinica_id = clinica_uuid
        WHERE clinica = clinica_nome;
    END LOOP;
    
    -- Atualizar intervenções que já têm clínicas correspondentes
    UPDATE public.intervencoes 
    SET clinica_id = cv.id
    FROM public.clinicas_veterinarias cv
    WHERE intervencoes.clinica = cv.nome
    AND intervencoes.clinica_id IS NULL;
END $$;