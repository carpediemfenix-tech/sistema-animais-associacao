-- ========================================
-- SISTEMA DE CLÍNICAS VETERINÁRIAS
-- ========================================

-- Criar tabela de clínicas veterinárias
CREATE TABLE IF NOT EXISTS clinicas_veterinarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    contacto_responsavel TEXT,
    especialidades TEXT[], -- Array de especialidades
    tem_protocolo BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clinicas_nome ON clinicas_veterinarias(nome);
CREATE INDEX IF NOT EXISTS idx_clinicas_ativo ON clinicas_veterinarias(ativo);
CREATE INDEX IF NOT EXISTS idx_clinicas_protocolo ON clinicas_veterinarias(tem_protocolo);

-- Desabilitar RLS para simplicidade
ALTER TABLE clinicas_veterinarias DISABLE ROW LEVEL SECURITY;

-- Inserir clínicas de exemplo
INSERT INTO clinicas_veterinarias (nome, endereco, telefone, especialidades, tem_protocolo, observacoes) 
SELECT * FROM (VALUES
    ('Clínica Veterinária Central', 'Rua Principal, 123', '123-456-789', ARRAY['Cirurgia', 'Consultas Gerais'], false, 'Clínica de referência na cidade'),
    ('Hospital Veterinário São Francisco', 'Av. da Liberdade, 456', '987-654-321', ARRAY['Emergências', 'Cirurgia', 'Internamento'], false, 'Hospital com serviço 24h'),
    ('Clínica dos Bichos', 'Rua dos Animais, 789', '555-123-456', ARRAY['Consultas Gerais', 'Vacinação'], false, 'Clínica especializada em animais de companhia'),
    ('Centro Veterinário Amigo Fiel', 'Praça dos Pets, 321', '444-789-123', ARRAY['Dermatologia', 'Oftalmologia'], false, 'Centro especializado'),
    ('Clínica Veterinária Municipal', 'Rua do Município, 654', '333-555-777', ARRAY['Consultas Gerais', 'Castrações'], true, 'Parceria com a câmara municipal'),
    ('Hospital de Animais 24h', 'Centro da Cidade, 999', '111-222-333', ARRAY['Emergências', 'UTI'], false, 'Atendimento de emergência'),
    ('Clínica Veterinária do Bairro', 'Rua Local, 147', '666-777-888', ARRAY['Consultas Gerais'], false, 'Clínica de bairro')
) AS v(nome, endereco, telefone, especialidades, tem_protocolo, observacoes)
WHERE NOT EXISTS (
    SELECT 1 FROM clinicas_veterinarias WHERE clinicas_veterinarias.nome = v.nome
);

-- Adicionar coluna clinica_id na tabela intervencoes se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intervencoes' AND column_name = 'clinica_id') THEN
        ALTER TABLE intervencoes ADD COLUMN clinica_id UUID REFERENCES clinicas_veterinarias(id);
        CREATE INDEX IF NOT EXISTS idx_intervencoes_clinica ON intervencoes(clinica_id);
    END IF;
END $$;

-- Verificar estruturas criadas
SELECT 
    'Sistema de clínicas criado!' as status,
    (SELECT COUNT(*) FROM clinicas_veterinarias WHERE ativo = true) as clinicas_ativas,
    (SELECT COUNT(*) FROM clinicas_veterinarias WHERE tem_protocolo = true) as clinicas_com_protocolo;