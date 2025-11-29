-- ========================================
-- CRIAR TABELAS DO SISTEMA DE RESPONSABILIDADES
-- ========================================

-- Criar tabela tipos_responsabilidades se não existir
CREATE TABLE IF NOT EXISTS tipos_responsabilidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar se tabela responsabilidades_animal existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'responsabilidades_animal') THEN
        -- Criar tabela responsabilidades_animal
        CREATE TABLE responsabilidades_animal (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
            voluntario_id UUID NOT NULL REFERENCES voluntarios(id) ON DELETE CASCADE,
            tipo_responsabilidade TEXT NOT NULL,
            data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
            data_fim DATE,
            observacoes TEXT,
            ativa BOOLEAN DEFAULT TRUE,
            prioridade INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela responsabilidades_animal criada';
    ELSE
        RAISE NOTICE 'Tabela responsabilidades_animal já existe';
    END IF;
END $$;

-- Desabilitar RLS para as tabelas
ALTER TABLE tipos_responsabilidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE responsabilidades_animal DISABLE ROW LEVEL SECURITY;

-- Inserir tipos de responsabilidades predefinidos
INSERT INTO tipos_responsabilidades (nome, descricao, ativo) 
SELECT * FROM (VALUES
    ('🏠 Cuidador Principal', 'Responsável pelos cuidados diários do animal', true),
    ('❤️ Padrinho/Madrinha', 'Apoio financeiro e emocional ao animal', true),
    ('🩺 Responsável Médico', 'Acompanhamento veterinário e tratamentos', true),
    ('🎓 Educador/Treinador', 'Treino, socialização e educação comportamental', true),
    ('📞 Contacto de Emergência', 'Pessoa a contactar em situações urgentes', true),
    ('🚗 Responsável Transporte', 'Deslocações e transportes do animal', true),
    ('📸 Responsável Divulgação', 'Fotos, redes sociais e promoção para adoção', true),
    ('🏡 Família de Acolhimento', 'Acolhimento temporário em casa', true),
    ('💊 Administração Medicação', 'Responsável por medicamentos e tratamentos', true),
    ('🎾 Atividades e Exercício', 'Passeios, brincadeiras e atividade física', true)
) AS v(nome, descricao, ativo)
WHERE NOT EXISTS (
    SELECT 1 FROM tipos_responsabilidades WHERE tipos_responsabilidades.nome = v.nome
);

-- Adicionar colunas faltantes à tabela responsabilidades_animal se necessário
DO $$
BEGIN
    -- Adicionar coluna observacoes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'responsabilidades_animal' AND column_name = 'observacoes') THEN
        ALTER TABLE responsabilidades_animal ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Coluna observacoes adicionada';
    END IF;

    -- Adicionar coluna data_fim
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'responsabilidades_animal' AND column_name = 'data_fim') THEN
        ALTER TABLE responsabilidades_animal ADD COLUMN data_fim DATE;
        RAISE NOTICE 'Coluna data_fim adicionada';
    END IF;

    -- Adicionar coluna ativa
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'responsabilidades_animal' AND column_name = 'ativa') THEN
        ALTER TABLE responsabilidades_animal ADD COLUMN ativa BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna ativa adicionada';
    END IF;

    -- Adicionar coluna prioridade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'responsabilidades_animal' AND column_name = 'prioridade') THEN
        ALTER TABLE responsabilidades_animal ADD COLUMN prioridade INTEGER DEFAULT 1;
        RAISE NOTICE 'Coluna prioridade adicionada';
    END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_responsabilidades_animal_ativa ON responsabilidades_animal(animal_id, ativa);
CREATE INDEX IF NOT EXISTS idx_responsabilidades_animal_voluntario ON responsabilidades_animal(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_responsabilidades_animal_tipo ON responsabilidades_animal(tipo_responsabilidade);
CREATE INDEX IF NOT EXISTS idx_responsabilidades_animal_data ON responsabilidades_animal(data_inicio);

-- Verificar estruturas finais
SELECT 
    'Estrutura da tabela tipos_responsabilidades:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tipos_responsabilidades' 
ORDER BY ordinal_position;

SELECT 
    'Estrutura da tabela responsabilidades_animal:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'responsabilidades_animal' 
ORDER BY ordinal_position;

-- Verificar dados inseridos
SELECT 
    'Tipos de responsabilidades criados:' as status,
    (SELECT COUNT(*) FROM tipos_responsabilidades WHERE ativo = true) as tipos_ativos;