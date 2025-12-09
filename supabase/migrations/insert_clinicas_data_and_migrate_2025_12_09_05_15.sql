-- Inserir dados de exemplo de clínicas veterinárias
INSERT INTO public.clinicas_veterinarias (nome, codigo, endereco, telefone, email, especialidades, tem_protocolo, desconto_protocolo, observacoes) VALUES
('Clínica Veterinária Central', 'CVC001', 'Rua Principal, 123, Lisboa', '213456789', 'geral@clinicacentral.pt', ARRAY['Clínica Geral', 'Cirurgia', 'Medicina Interna'], true, 15.00, 'Clínica com protocolo - desconto de 15%'),
('Hospital Veterinário do Norte', 'HVN002', 'Av. da República, 456, Porto', '223456789', 'contacto@hvnorte.pt', ARRAY['Emergências', 'Cirurgia Especializada', 'Imagiologia'], true, 20.00, 'Hospital 24h com protocolo especial'),
('Clínica dos Bichos', 'CDB003', 'Rua dos Animais, 789, Coimbra', '239456789', 'info@clinicabichos.pt', ARRAY['Clínica Geral', 'Vacinação', 'Consultas de Rotina'], false, 0.00, 'Clínica sem protocolo - preços normais'),
('Veterinária São Francisco', 'VSF004', 'Largo São Francisco, 12, Braga', '253456789', 'saofrancisco@vet.pt', ARRAY['Medicina Preventiva', 'Dermatologia', 'Oftalmologia'], true, 10.00, 'Especializada em medicina preventiva'),
('Clínica Veterinária Moderna', 'CVM005', 'Centro Comercial Moderno, Loja 45, Faro', '289456789', 'moderna@vetclinica.pt', ARRAY['Clínica Geral', 'Análises Clínicas', 'Radiologia'], false, 0.00, 'Equipamentos modernos de diagnóstico');

-- Adicionar coluna clinica_id à tabela intervenções se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'clinica_id') THEN
        ALTER TABLE public.intervencoes ADD COLUMN clinica_id UUID REFERENCES public.clinicas_veterinarias(id);
        CREATE INDEX idx_intervencoes_clinica_id ON public.intervencoes(clinica_id);
    END IF;
END $$;

-- Migrar dados existentes de clínica (texto) para clinica_id
DO $$
DECLARE
    clinica_nome TEXT;
    clinica_uuid UUID;
BEGIN
    -- Para cada clínica única nas intervenções que não existe na tabela de clínicas
    FOR clinica_nome IN 
        SELECT DISTINCT clinica 
        FROM public.intervencoes 
        WHERE clinica IS NOT NULL 
        AND clinica != ''
        AND NOT EXISTS (
            SELECT 1 FROM public.clinicas_veterinarias 
            WHERE nome = clinica_nome
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

-- Verificar resultado da migração
SELECT 
    'Clínicas criadas' as tipo,
    COUNT(*) as quantidade
FROM public.clinicas_veterinarias
UNION ALL
SELECT 
    'Intervenções com clínica_id' as tipo,
    COUNT(*) as quantidade
FROM public.intervencoes
WHERE clinica_id IS NOT NULL;