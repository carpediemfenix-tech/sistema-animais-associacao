-- CRIAR SISTEMA COMPLETO DE ALERTAS INTELIGENTES

-- 1. Criar tabela de alertas inteligentes
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

-- 2. Constraints para alertas
ALTER TABLE alertas_equipamentos_2025_12_16_07_00 
ADD CONSTRAINT alertas_tipo_check 
CHECK (tipo_alerta IN ('manutencao_vencida', 'manutencao_proxima', 'atribuicao_vencida', 'equipamento_danificado', 'stock_baixo', 'garantia_vencendo', 'vida_util_esgotada'));

ALTER TABLE alertas_equipamentos_2025_12_16_07_00 
ADD CONSTRAINT alertas_prioridade_check 
CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica'));

ALTER TABLE alertas_equipamentos_2025_12_16_07_00 
ADD CONSTRAINT alertas_status_check 
CHECK (status IN ('ativo', 'resolvido', 'ignorado'));

-- 3. Criar tabela de configurações de alertas
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

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_alertas_equipamento ON alertas_equipamentos_2025_12_16_07_00(equipamento_id);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas_equipamentos_2025_12_16_07_00(tipo_alerta);
CREATE INDEX IF NOT EXISTS idx_alertas_status ON alertas_equipamentos_2025_12_16_07_00(status);
CREATE INDEX IF NOT EXISTS idx_alertas_prioridade ON alertas_equipamentos_2025_12_16_07_00(prioridade);

-- 5. Inserir configurações padrão de alertas
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
 'garantia_vencendo', 60, true),

-- Alertas para Ferramentas
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FERRAMENTAS'), 
 'manutencao_proxima', 7, true),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FERRAMENTAS'), 
 'equipamento_danificado', 1, true);

-- 6. Inserir alertas de exemplo
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
 'alta', 'ativo', NULL, true),

-- Alerta de manutenção vencida
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'RES002'), 
 'manutencao_vencida', 'Manutenção em Atraso', 
 'Rede de captura RES002 tem manutenção agendada em atraso desde 18/12/2024', 
 'critica', 'ativo', '2024-12-18', true),

-- Alerta de stock baixo (exemplo genérico)
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'EPI001'), 
 'stock_baixo', 'Stock Baixo de Luvas', 
 'Categoria EPI - Luvas de proteção com stock baixo', 
 'media', 'ativo', NULL, true);

-- 7. Criar políticas RLS para as novas tabelas
-- Alertas
ALTER TABLE alertas_equipamentos_2025_12_16_07_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso total aos alertas" ON alertas_equipamentos_2025_12_16_07_00
FOR ALL USING (true) WITH CHECK (true);

-- Configurações de alertas
ALTER TABLE configuracoes_alertas_2025_12_16_07_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso total às configurações" ON configuracoes_alertas_2025_12_16_07_00
FOR ALL USING (true) WITH CHECK (true);

-- 8. Criar função para gerar alertas automáticos
CREATE OR REPLACE FUNCTION gerar_alertas_automaticos()
RETURNS void AS $$
BEGIN
    -- Alertas de manutenção próxima
    INSERT INTO alertas_equipamentos_2025_12_16_07_00 (
        equipamento_id, tipo_alerta, titulo, descricao, prioridade, status, data_vencimento
    )
    SELECT DISTINCT
        m.equipamento_id,
        'manutencao_proxima',
        'Manutenção Agendada Próxima',
        'Equipamento ' || e.codigo_interno || ' tem manutenção agendada para ' || m.data_manutencao::text,
        CASE 
            WHEN m.data_manutencao <= CURRENT_DATE THEN 'critica'
            WHEN m.data_manutencao <= CURRENT_DATE + INTERVAL '3 days' THEN 'alta'
            WHEN m.data_manutencao <= CURRENT_DATE + INTERVAL '7 days' THEN 'media'
            ELSE 'baixa'
        END,
        'ativo',
        m.data_manutencao
    FROM manutencoes_equipamentos_2025_12_13_01_00 m
    JOIN equipamentos_2025_12_13_01_00 e ON m.equipamento_id = e.id
    WHERE m.status = 'agendada'
    AND m.data_manutencao <= CURRENT_DATE + INTERVAL '30 days'
    AND NOT EXISTS (
        SELECT 1 FROM alertas_equipamentos_2025_12_16_07_00 a
        WHERE a.equipamento_id = m.equipamento_id
        AND a.tipo_alerta = 'manutencao_proxima'
        AND a.status = 'ativo'
        AND a.data_vencimento = m.data_manutencao
    );

    -- Alertas de garantia vencendo
    INSERT INTO alertas_equipamentos_2025_12_16_07_00 (
        equipamento_id, tipo_alerta, titulo, descricao, prioridade, status, data_vencimento
    )
    SELECT DISTINCT
        e.id,
        'garantia_vencendo',
        'Garantia Expirando',
        'Equipamento ' || e.codigo_interno || ' tem garantia expirando em ' || e.garantia_ate::text,
        CASE 
            WHEN e.garantia_ate <= CURRENT_DATE + INTERVAL '30 days' THEN 'alta'
            WHEN e.garantia_ate <= CURRENT_DATE + INTERVAL '60 days' THEN 'media'
            ELSE 'baixa'
        END,
        'ativo',
        e.garantia_ate
    FROM equipamentos_2025_12_13_01_00 e
    WHERE e.garantia_ate IS NOT NULL
    AND e.garantia_ate <= CURRENT_DATE + INTERVAL '90 days'
    AND e.ativo = true
    AND NOT EXISTS (
        SELECT 1 FROM alertas_equipamentos_2025_12_16_07_00 a
        WHERE a.equipamento_id = e.id
        AND a.tipo_alerta = 'garantia_vencendo'
        AND a.status = 'ativo'
    );
END;
$$ LANGUAGE plpgsql;

-- 9. Executar função para gerar alertas iniciais
SELECT gerar_alertas_automaticos();

-- 10. Verificar resultado final
SELECT 
    'Alertas inseridos' as tipo,
    COUNT(*) as quantidade
FROM alertas_equipamentos_2025_12_16_07_00
UNION ALL
SELECT 
    'Configurações inseridas',
    COUNT(*)
FROM configuracoes_alertas_2025_12_16_07_00
UNION ALL
SELECT 
    'Alertas por prioridade - Crítica',
    COUNT(*)
FROM alertas_equipamentos_2025_12_16_07_00
WHERE prioridade = 'critica' AND status = 'ativo'
UNION ALL
SELECT 
    'Alertas por prioridade - Alta',
    COUNT(*)
FROM alertas_equipamentos_2025_12_16_07_00
WHERE prioridade = 'alta' AND status = 'ativo';