-- VERIFICAR E MELHORAR ESTRUTURA DE ATRIBUIÇÕES
-- Verificar estrutura atual da tabela de atribuições

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'atribuicoes_equipamentos_2025_12_13_01_00' 
ORDER BY ordinal_position;

-- 2. Verificar dados existentes
SELECT COUNT(*) as total_atribuicoes 
FROM atribuicoes_equipamentos_2025_12_13_01_00;

-- 3. Verificar se há campos em falta e adicionar se necessário
-- Adicionar campos para melhorar o sistema de atribuições
DO $$
BEGIN
    -- Adicionar campo para observações se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'atribuicoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE atribuicoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN observacoes TEXT;
    END IF;

    -- Adicionar campo para data de devolução prevista se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'atribuicoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'data_devolucao_prevista'
    ) THEN
        ALTER TABLE atribuicoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN data_devolucao_prevista DATE;
    END IF;

    -- Adicionar campo para estado da atribuição se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'atribuicoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'estado'
    ) THEN
        ALTER TABLE atribuicoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN estado VARCHAR(20) DEFAULT 'ativa';
    END IF;

    -- Adicionar campo para quem fez a devolução se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'atribuicoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'devolvido_por'
    ) THEN
        ALTER TABLE atribuicoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN devolvido_por UUID REFERENCES auth.users(id);
    END IF;

    -- Adicionar campo para observações da devolução se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'atribuicoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'observacoes_devolucao'
    ) THEN
        ALTER TABLE atribuicoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN observacoes_devolucao TEXT;
    END IF;
END $$;

-- 4. Criar constraint para estado se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'atribuicoes_estado_check'
    ) THEN
        ALTER TABLE atribuicoes_equipamentos_2025_12_13_01_00 
        ADD CONSTRAINT atribuicoes_estado_check 
        CHECK (estado IN ('ativa', 'devolvida', 'perdida', 'danificada'));
    END IF;
END $$;

-- 5. Inserir dados de exemplo realistas para atribuições
-- Limpar dados existentes
DELETE FROM atribuicoes_equipamentos_2025_12_13_01_00;

-- Inserir atribuições de exemplo
INSERT INTO atribuicoes_equipamentos_2025_12_13_01_00 (
    equipamento_id, voluntario_id, data_atribuicao, data_devolucao_prevista,
    estado, observacoes, ativo, created_at, updated_at
) VALUES 

-- Atribuição ativa - Botas EPI para João Silva
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'EPI002'), 
 (SELECT id FROM voluntarios WHERE nome ILIKE '%joão%silva%' LIMIT 1), 
 '2024-12-01', '2025-06-01', 'ativa', 
 'Botas de segurança para trabalho de campo', true, NOW(), NOW()),

-- Atribuição ativa - Tablet para Maria Santos
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG001'), 
 (SELECT id FROM voluntarios WHERE nome ILIKE '%maria%santos%' LIMIT 1), 
 '2024-11-15', '2025-05-15', 'ativa', 
 'Tablet para registo digital de animais', true, NOW(), NOW()),

-- Atribuição ativa - Colete para Pedro Costa
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'FAR002'), 
 (SELECT id FROM voluntarios WHERE nome ILIKE '%pedro%costa%' LIMIT 1), 
 '2024-12-05', '2025-12-05', 'ativa', 
 'Colete de alta visibilidade para missões', true, NOW(), NOW()),

-- Atribuição devolvida - Transportadora (exemplo histórico)
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'RES001'), 
 (SELECT id FROM voluntarios WHERE nome ILIKE '%ana%' LIMIT 1), 
 '2024-10-01', '2024-11-01', 'devolvida', 
 'Transportadora para resgate de cão grande porte', true, NOW(), NOW());

-- Atualizar a última atribuição com data de devolução
UPDATE atribuicoes_equipamentos_2025_12_13_01_00 
SET data_devolucao = '2024-11-02',
    observacoes_devolucao = 'Equipamento devolvido em bom estado após resgate bem-sucedido'
WHERE equipamento_id = (SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'RES001')
  AND estado = 'devolvida';

-- 6. Verificar resultado final
SELECT 
    'Estrutura atualizada' as status,
    COUNT(*) as total_atribuicoes
FROM atribuicoes_equipamentos_2025_12_13_01_00
UNION ALL
SELECT 
    'Atribuições ativas',
    COUNT(*)
FROM atribuicoes_equipamentos_2025_12_13_01_00
WHERE estado = 'ativa'
UNION ALL
SELECT 
    'Atribuições devolvidas',
    COUNT(*)
FROM atribuicoes_equipamentos_2025_12_13_01_00
WHERE estado = 'devolvida';