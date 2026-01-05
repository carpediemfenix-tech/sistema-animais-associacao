-- Verificar estrutura atual da tabela equipamentos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'equipamentos_2025_12_13_01_00'
ORDER BY ordinal_position;

-- Se a tabela não existir, criar com estrutura correta
CREATE TABLE IF NOT EXISTS equipamentos_2025_12_13_01_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_equipamento_id UUID REFERENCES tipos_equipamentos_2025_12_13_01_00(id),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  numero_serie VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'disponivel' CHECK (estado IN ('disponivel', 'em_uso', 'manutencao', 'danificado', 'perdido', 'descartado')),
  data_aquisicao DATE,
  valor_aquisicao DECIMAL(10,2),
  localizacao VARCHAR(100),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir alguns equipamentos de exemplo (corrigindo nome da coluna)
INSERT INTO equipamentos_2025_12_13_01_00 (tipo_equipamento_id, codigo, numero_serie, estado, data_aquisicao, valor_aquisicao, localizacao) VALUES
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP001'), 'TRP001-001', 'TP2024001', 'disponivel', '2024-01-15', 45.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP001'), 'TRP001-002', 'TP2024002', 'em_uso', '2024-01-15', 45.00, 'Em Campo'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP002'), 'TRP002-001', 'TG2024001', 'disponivel', '2024-02-10', 85.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RAD001'), 'RAD001-001', 'RC2024001', 'disponivel', '2024-03-05', 120.00, 'Escritório'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RAD001'), 'RAD001-002', 'RC2024002', 'manutencao', '2024-03-05', 120.00, 'Oficina'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'COL001'), 'COL001-001', 'CV2024001', 'disponivel', '2024-01-20', 25.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'COL001'), 'COL001-002', 'CV2024002', 'disponivel', '2024-01-20', 25.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TER001'), 'TER001-001', 'TD2024001', 'disponivel', '2024-02-15', 15.00, 'Kit Veterinário')
ON CONFLICT (codigo) DO NOTHING;