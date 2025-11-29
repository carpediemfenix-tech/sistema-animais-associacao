-- ========================================
-- SISTEMA AVANÇADO DE INTEGRAÇÃO FINANCEIRA
-- ========================================

-- Adicionar campos de custo às tabelas existentes
DO $$
BEGIN
    -- Adicionar custo às intervenções
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intervencoes' AND column_name = 'custo') THEN
        ALTER TABLE intervencoes ADD COLUMN custo DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Coluna custo adicionada à tabela intervencoes';
    END IF;

    -- Adicionar desconto_protocolo às intervenções
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intervencoes' AND column_name = 'desconto_protocolo') THEN
        ALTER TABLE intervencoes ADD COLUMN desconto_protocolo DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE 'Coluna desconto_protocolo adicionada à tabela intervencoes';
    END IF;

    -- Adicionar custo_final às intervenções
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intervencoes' AND column_name = 'custo_final') THEN
        ALTER TABLE intervencoes ADD COLUMN custo_final DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Coluna custo_final adicionada à tabela intervencoes';
    END IF;
END $$;

-- Criar tabela de custos por tipo de localização
CREATE TABLE IF NOT EXISTS custos_localizacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_localizacao TEXT NOT NULL UNIQUE,
    custo_diario DECIMAL(10,2) NOT NULL DEFAULT 0,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir custos padrão para localizações
INSERT INTO custos_localizacoes (tipo_localizacao, custo_diario, descricao, ativo) 
SELECT * FROM (VALUES
    ('🏠 Canil da Associação', 5.00, 'Custo diário de manutenção no canil', true),
    ('🏥 Clínica Veterinária', 25.00, 'Custo diário de internamento em clínica', true),
    ('👨‍👩‍👧‍👦 Casa de Acolhimento', 3.00, 'Subsídio diário para família de acolhimento', true),
    ('❤️ Família Adotiva', 0.00, 'Sem custo - animal adotado', true),
    ('🔄 Em Transferência', 10.00, 'Custo de transporte e logística', true),
    ('🏥 Internamento', 35.00, 'Custo diário de cuidados intensivos', true),
    ('🌟 Lar Definitivo', 0.00, 'Sem custo - animal em lar definitivo', true),
    ('🏠 Lar Temporário', 2.00, 'Subsídio mínimo para lar temporário', true),
    ('🚑 Emergência', 50.00, 'Custo elevado para cuidados de emergência', true),
    ('📋 Em Avaliação', 8.00, 'Custo de avaliação comportamental', true)
) AS v(tipo_localizacao, custo_diario, descricao, ativo)
WHERE NOT EXISTS (
    SELECT 1 FROM custos_localizacoes WHERE custos_localizacoes.tipo_localizacao = v.tipo_localizacao
);

-- Criar tabela de subsídios para responsabilidades
CREATE TABLE IF NOT EXISTS subsidios_responsabilidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_responsabilidade TEXT NOT NULL UNIQUE,
    subsidio_mensal DECIMAL(10,2) NOT NULL DEFAULT 0,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir subsídios padrão para responsabilidades
INSERT INTO subsidios_responsabilidades (tipo_responsabilidade, subsidio_mensal, descricao, ativo) 
SELECT * FROM (VALUES
    ('🏠 Cuidador Principal', 30.00, 'Subsídio mensal para cuidados diários', true),
    ('❤️ Padrinho/Madrinha', 0.00, 'Sem subsídio - contribuição voluntária', true),
    ('🩺 Responsável Médico', 20.00, 'Subsídio para deslocações médicas', true),
    ('🎓 Educador/Treinador', 15.00, 'Subsídio para materiais de treino', true),
    ('📞 Contacto de Emergência', 5.00, 'Subsídio mínimo para disponibilidade', true),
    ('🚗 Responsável Transporte', 25.00, 'Subsídio para combustível e manutenção', true),
    ('📸 Responsável Divulgação', 10.00, 'Subsídio para materiais de divulgação', true),
    ('🏡 Família de Acolhimento', 40.00, 'Subsídio mensal para acolhimento', true),
    ('💊 Administração Medicação', 12.00, 'Subsídio para deslocações e materiais', true),
    ('🎾 Atividades e Exercício', 8.00, 'Subsídio para atividades e materiais', true)
) AS v(tipo_responsabilidade, subsidio_mensal, descricao, ativo)
WHERE NOT EXISTS (
    SELECT 1 FROM subsidios_responsabilidades WHERE subsidios_responsabilidades.tipo_responsabilidade = v.tipo_responsabilidade
);

-- Desabilitar RLS para as novas tabelas
ALTER TABLE custos_localizacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE subsidios_responsabilidades DISABLE ROW LEVEL SECURITY;

-- Verificar estruturas criadas
SELECT 
    'Tabelas criadas:' as info,
    COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_name IN ('custos_localizacoes', 'subsidios_responsabilidades');

SELECT 
    'Custos de localizações inseridos:' as info,
    COUNT(*) as total_custos
FROM custos_localizacoes;

SELECT 
    'Subsídios de responsabilidades inseridos:' as info,
    COUNT(*) as total_subsidios
FROM subsidios_responsabilidades;