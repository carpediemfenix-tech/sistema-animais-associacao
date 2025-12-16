-- VERIFICAR E CORRIGIR ESTRUTURA DE MANUTENÇÕES
-- Primeiro verificar a estrutura atual da tabela

-- 1. Verificar estrutura da tabela de manutenções
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00' 
ORDER BY ordinal_position;

-- 2. Adicionar campos necessários se não existirem
DO $$
BEGIN
    -- Adicionar campo ativo se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'ativo'
    ) THEN
        ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;

    -- Adicionar campo created_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;

    -- Adicionar campo updated_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;

    -- Adicionar campo para custo se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'custo_real'
    ) THEN
        ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN custo_real DECIMAL(10,2);
    END IF;

    -- Adicionar campo para técnico responsável se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'tecnico_responsavel'
    ) THEN
        ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN tecnico_responsavel VARCHAR(255);
    END IF;

    -- Adicionar campo para prioridade se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'prioridade'
    ) THEN
        ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN prioridade VARCHAR(20) DEFAULT 'media';
    END IF;

    -- Adicionar campo para tipo de manutenção se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00' 
        AND column_name = 'tipo'
    ) THEN
        ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 
        ADD COLUMN tipo VARCHAR(20) DEFAULT 'preventiva';
    END IF;
END $$;

-- 3. Criar constraints se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'manutencoes_status_check'
    ) THEN
        ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 
        ADD CONSTRAINT manutencoes_status_check 
        CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'manutencoes_prioridade_check'
    ) THEN
        ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 
        ADD CONSTRAINT manutencoes_prioridade_check 
        CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'manutencoes_tipo_check'
    ) THEN
        ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 
        ADD CONSTRAINT manutencoes_tipo_check 
        CHECK (tipo IN ('preventiva', 'corretiva', 'preditiva'));
    END IF;
END $$;

-- 4. Limpar dados existentes e inserir novos dados de exemplo
DELETE FROM manutencoes_equipamentos_2025_12_13_01_00;

-- Inserir dados usando apenas campos que existem com certeza
INSERT INTO manutencoes_equipamentos_2025_12_13_01_00 (
    equipamento_id, data_manutencao, data_proxima_manutencao, 
    descricao, status, observacoes
) VALUES 

-- Manutenção preventiva do berbequim (em manutenção)
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'FER001'), 
 '2024-12-10', '2025-03-10', 
 'Manutenção preventiva trimestral - lubrificação e verificação de componentes', 
 'em_andamento', 
 'Equipamento apresentava ruído excessivo'),

-- Manutenção corretiva das botas EPI (concluída)
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'EPI002'), 
 '2024-11-20', '2025-05-20', 
 'Substituição de sola danificada', 
 'concluida', 
 'Sola estava desgastada, substituída por nova'),

-- Manutenção preventiva agendada para tablet
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG001'), 
 '2024-12-20', '2025-06-20', 
 'Atualização de software e limpeza interna', 
 'agendada', 
 'Manutenção preventiva semestral'),

-- Manutenção corretiva agendada para rede de captura
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'RES002'), 
 '2024-12-18', '2025-03-18', 
 'Reparo de malha danificada', 
 'agendada', 
 'Pequeno rasgo na rede detectado durante inspeção');

-- Atualizar campos adicionais se existirem
UPDATE manutencoes_equipamentos_2025_12_13_01_00 SET
    tipo = CASE 
        WHEN descricao LIKE '%preventiva%' THEN 'preventiva'
        WHEN descricao LIKE '%corretiva%' OR descricao LIKE '%reparo%' THEN 'corretiva'
        ELSE 'preventiva'
    END,
    prioridade = CASE 
        WHEN status = 'em_andamento' THEN 'alta'
        WHEN status = 'agendada' AND data_manutencao <= CURRENT_DATE + INTERVAL '7 days' THEN 'media'
        ELSE 'baixa'
    END,
    custo_real = CASE 
        WHEN descricao LIKE '%substituição%' THEN 15.00
        WHEN descricao LIKE '%lubrificação%' THEN 25.00
        WHEN descricao LIKE '%reparo%' THEN 12.00
        ELSE 0.00
    END,
    tecnico_responsavel = CASE 
        WHEN descricao LIKE '%software%' THEN 'Pedro IT'
        WHEN descricao LIKE '%sola%' THEN 'Maria Reparos'
        WHEN descricao LIKE '%malha%' THEN 'Ana Costura'
        ELSE 'João Técnico'
    END,
    ativo = true,
    created_at = NOW(),
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00' 
    AND column_name = 'tipo'
);

-- 5. Verificar resultado
SELECT 
    'Manutenções inseridas' as tipo,
    COUNT(*) as quantidade
FROM manutencoes_equipamentos_2025_12_13_01_00;