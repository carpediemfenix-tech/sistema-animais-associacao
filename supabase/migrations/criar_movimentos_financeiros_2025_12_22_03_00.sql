-- Criar tabela de movimentos financeiros para missões
-- Data: 2025-12-22 03:00 UTC

CREATE TABLE IF NOT EXISTS movimentos_financeiros_2025_12_22_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    missao_id UUID NOT NULL REFERENCES missoes_2025_12_21_19_00(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_movimento DATE NOT NULL DEFAULT CURRENT_DATE,
    categoria VARCHAR(50) DEFAULT 'geral',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_2025_12_22_03_00_missao_id ON movimentos_financeiros_2025_12_22_03_00(missao_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_2025_12_22_03_00_tipo ON movimentos_financeiros_2025_12_22_03_00(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_2025_12_22_03_00_data ON movimentos_financeiros_2025_12_22_03_00(data_movimento);

-- Ativar RLS
ALTER TABLE movimentos_financeiros_2025_12_22_03_00 ENABLE ROW LEVEL SECURITY;

-- Política RLS permissiva (temporária)
CREATE POLICY "Permitir tudo movimentos_financeiros" ON movimentos_financeiros_2025_12_22_03_00 FOR ALL USING (true) WITH CHECK (true);

-- Inserir alguns dados de teste para a missão específica
INSERT INTO movimentos_financeiros_2025_12_22_03_00 (missao_id, tipo, descricao, valor, data_movimento, categoria, observacoes)
VALUES 
    ('69b7cddb-7441-4f08-acc1-c49e62d561a1', 'despesa', 'Compra de medicamentos veterinários', 150.00, '2024-12-20', 'medicamentos', 'Antibióticos e anti-inflamatórios'),
    ('69b7cddb-7441-4f08-acc1-c49e62d561a1', 'despesa', 'Combustível para transporte', 45.50, '2024-12-21', 'transporte', 'Deslocação para local de resgate'),
    ('69b7cddb-7441-4f08-acc1-c49e62d561a1', 'receita', 'Doação de apoiante', 200.00, '2024-12-19', 'doacoes', 'Doação para apoio à missão')
ON CONFLICT DO NOTHING;