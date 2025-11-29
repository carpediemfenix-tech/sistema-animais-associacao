-- ========================================
-- SISTEMA COMPLETO DE RESPONSABILIDADES
-- ========================================

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

-- Verificar estrutura atual da tabela responsabilidades_animal
SELECT 
    'Estrutura atual da tabela responsabilidades_animal:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'responsabilidades_animal' 
ORDER BY ordinal_position;

-- Adicionar colunas faltantes se necessário
DO $$
BEGIN
    -- Adicionar coluna observacoes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'responsabilidades_animal' AND column_name = 'observacoes') THEN
        ALTER TABLE responsabilidades_animal ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Coluna observacoes adicionada';
    END IF;

    -- Adicionar coluna data_fim para histórico
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'responsabilidades_animal' AND column_name = 'data_fim') THEN
        ALTER TABLE responsabilidades_animal ADD COLUMN data_fim DATE;
        RAISE NOTICE 'Coluna data_fim adicionada';
    END IF;

    -- Adicionar coluna ativa para controlar responsabilidades atuais
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'responsabilidades_animal' AND column_name = 'ativa') THEN
        ALTER TABLE responsabilidades_animal ADD COLUMN ativa BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna ativa adicionada';
    END IF;

    -- Adicionar coluna prioridade para ordenação
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

-- Verificar estrutura final
SELECT 
    'Estrutura final da tabela responsabilidades_animal:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'responsabilidades_animal' 
ORDER BY ordinal_position;

-- Verificar tipos de responsabilidades criados
SELECT 
    'Tipos de responsabilidades criados:' as status,
    (SELECT COUNT(*) FROM tipos_responsabilidades WHERE ativo = true) as tipos_ativos;

-- Testar inserção de responsabilidade
INSERT INTO responsabilidades_animal (
    animal_id, 
    voluntario_id,
    tipo_responsabilidade, 
    data_inicio, 
    observacoes,
    ativa,
    prioridade
) 
SELECT 
    (SELECT id FROM animais LIMIT 1),
    (SELECT id FROM voluntarios LIMIT 1),
    '🧪 Teste Responsabilidade',
    CURRENT_DATE,
    'Responsabilidade de teste do sistema',
    true,
    1
WHERE EXISTS (SELECT 1 FROM animais LIMIT 1) 
AND EXISTS (SELECT 1 FROM voluntarios LIMIT 1);

-- Verificar se o teste funcionou
SELECT 
    'Teste de inserção:' as info,
    COUNT(*) as responsabilidades_teste
FROM responsabilidades_animal 
WHERE tipo_responsabilidade = '🧪 Teste Responsabilidade';

-- Limpar teste
DELETE FROM responsabilidades_animal WHERE tipo_responsabilidade = '🧪 Teste Responsabilidade';