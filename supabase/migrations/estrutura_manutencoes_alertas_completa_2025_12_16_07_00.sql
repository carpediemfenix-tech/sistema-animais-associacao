-- ESTRUTURA COMPLETA PARA MANUTENÇÕES E ALERTAS INTELIGENTES
-- Melhorar e expandir sistema de manutenções e criar sistema de alertas

-- 1. Verificar e melhorar tabela de manutenções
-- Adicionar campos necessários para sistema completo
DO $$
BEGIN
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

-- 2. Criar constraints para manutenções se não existirem
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

-- 3. Criar tabela de alertas inteligentes
CREATE TABLE IF NOT EXISTS alertas_equipamentos_2025_12_16_07_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    equipamento_id UUID REFERENCES equipamentos_2025_12_13_01_00(id) ON DELETE CASCADE,
    tipo_alerta VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    prioridade VARCHAR(20) DEFAULT 'media',
    status VARCHAR(20) DEFAULT 'ativo',
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_vencimento DATE,
    data_resolucao TIMESTAMP,
    resolvido_por UUID REFERENCES auth.users(id),
    observacoes_resolucao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Constraints para alertas
ALTER TABLE alertas_equipamentos_2025_12_16_07_00 
ADD CONSTRAINT alertas_tipo_check 
CHECK (tipo_alerta IN ('manutencao_vencida', 'manutencao_proxima', 'atribuicao_vencida', 'equipamento_danificado', 'stock_baixo', 'garantia_vencendo', 'vida_util_esgotada'));

ALTER TABLE alertas_equipamentos_2025_12_16_07_00 
ADD CONSTRAINT alertas_prioridade_check 
CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica'));

ALTER TABLE alertas_equipamentos_2025_12_16_07_00 
ADD CONSTRAINT alertas_status_check 
CHECK (status IN ('ativo', 'resolvido', 'ignorado'));

-- 4. Criar tabela de configurações de alertas
CREATE TABLE IF NOT EXISTS configuracoes_alertas_2025_12_16_07_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_equipamento_id UUID REFERENCES tipos_equipamentos_2025_12_13_01_00(id),
    categoria_id UUID REFERENCES categorias_equipamentos_2025_12_13_01_00(id),
    tipo_alerta VARCHAR(50) NOT NULL,
    dias_antecedencia INTEGER DEFAULT 7,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_alertas_equipamento ON alertas_equipamentos_2025_12_16_07_00(equipamento_id);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas_equipamentos_2025_12_16_07_00(tipo_alerta);
CREATE INDEX IF NOT EXISTS idx_alertas_status ON alertas_equipamentos_2025_12_16_07_00(status);
CREATE INDEX IF NOT EXISTS idx_alertas_prioridade ON alertas_equipamentos_2025_12_16_07_00(prioridade);
CREATE INDEX IF NOT EXISTS idx_manutencoes_equipamento ON manutencoes_equipamentos_2025_12_13_01_00(equipamento_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_status ON manutencoes_equipamentos_2025_12_13_01_00(status);

-- 6. Inserir dados de exemplo para manutenções
DELETE FROM manutencoes_equipamentos_2025_12_13_01_00;

INSERT INTO manutencoes_equipamentos_2025_12_13_01_00 (
    equipamento_id, tipo, data_manutencao, data_proxima_manutencao, 
    descricao, custo_real, tecnico_responsavel, prioridade, status, 
    observacoes, ativo, created_at, updated_at
) VALUES 

-- Manutenção preventiva do berbequim (em manutenção)
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'FER001'), 
 'preventiva', '2024-12-10', '2025-03-10', 
 'Manutenção preventiva trimestral - lubrificação e verificação de componentes', 
 25.00, 'João Técnico', 'media', 'em_andamento', 
 'Equipamento apresentava ruído excessivo', true, NOW(), NOW()),

-- Manutenção corretiva das botas EPI (concluída)
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'EPI002'), 
 'corretiva', '2024-11-20', '2025-05-20', 
 'Substituição de sola danificada', 
 15.00, 'Maria Reparos', 'alta', 'concluida', 
 'Sola estava desgastada, substituída por nova', true, NOW(), NOW()),

-- Manutenção preventiva agendada para tablet
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG001'), 
 'preventiva', '2024-12-20', '2025-06-20', 
 'Atualização de software e limpeza interna', 
 0.00, 'Pedro IT', 'baixa', 'agendada', 
 'Manutenção preventiva semestral', true, NOW(), NOW()),

-- Manutenção corretiva agendada para rede de captura
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'RES002'), 
 'corretiva', '2024-12-18', '2025-03-18', 
 'Reparo de malha danificada', 
 12.00, 'Ana Costura', 'media', 'agendada', 
 'Pequeno rasgo na rede detectado durante inspeção', true, NOW(), NOW());

-- 7. Inserir configurações padrão de alertas
INSERT INTO configuracoes_alertas_2025_12_16_07_00 (
    categoria_id, tipo_alerta, dias_antecedencia, ativo
) VALUES 
-- Alertas para EPI
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 
 'manutencao_proxima', 7, true),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 
 'garantia_vencendo', 30, true),

-- Alertas para Material de Resgate
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE'), 
 'manutencao_proxima', 14, true),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE'), 
 'vida_util_esgotada', 30, true),

-- Alertas para Equipamentos Digitais
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'DIGITAL'), 
 'manutencao_proxima', 30, true),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'DIGITAL'), 
 'garantia_vencendo', 60, true);

-- 8. Inserir alertas de exemplo
INSERT INTO alertas_equipamentos_2025_12_16_07_00 (
    equipamento_id, tipo_alerta, titulo, descricao, prioridade, 
    status, data_vencimento, ativo
) VALUES 

-- Alerta de manutenção próxima para tablet
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG001'), 
 'manutencao_proxima', 'Manutenção Preventiva Agendada', 
 'Tablet DIG001 tem manutenção preventiva agendada para 20/12/2024', 
 'media', 'ativo', '2024-12-20', true),

-- Alerta de atribuição vencida
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG001'), 
 'atribuicao_vencida', 'Devolução em Atraso', 
 'Tablet DIG001 deveria ter sido devolvido em 15/05/2025', 
 'alta', 'ativo', '2025-05-15', true),

-- Alerta de garantia vencendo
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG002'), 
 'garantia_vencendo', 'Garantia Expira em Breve', 
 'Leitor de microchips DIG002 tem garantia expirando em 10/01/2029', 
 'baixa', 'ativo', '2029-01-10', true),

-- Alerta de equipamento danificado
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'FER001'), 
 'equipamento_danificado', 'Equipamento em Manutenção', 
 'Berbequim FER001 está em manutenção devido a ruído excessivo', 
 'alta', 'ativo', NULL, true);

-- 9. Criar políticas RLS para as novas tabelas
-- Alertas
ALTER TABLE alertas_equipamentos_2025_12_16_07_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso total aos alertas" ON alertas_equipamentos_2025_12_16_07_00
FOR ALL USING (true) WITH CHECK (true);

-- Configurações de alertas
ALTER TABLE configuracoes_alertas_2025_12_16_07_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso total às configurações" ON configuracoes_alertas_2025_12_16_07_00
FOR ALL USING (true) WITH CHECK (true);

-- 10. Verificar resultado final
SELECT 
    'Manutenções inseridas' as tipo,
    COUNT(*) as quantidade
FROM manutencoes_equipamentos_2025_12_13_01_00
UNION ALL
SELECT 
    'Alertas inseridos',
    COUNT(*)
FROM alertas_equipamentos_2025_12_16_07_00
UNION ALL
SELECT 
    'Configurações inseridas',
    COUNT(*)
FROM configuracoes_alertas_2025_12_16_07_00;