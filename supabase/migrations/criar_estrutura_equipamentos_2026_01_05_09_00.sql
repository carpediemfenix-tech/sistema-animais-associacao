-- Criar tabela de categorias de equipamentos
CREATE TABLE IF NOT EXISTS categorias_equipamentos_2025_12_13_01_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  cor VARCHAR(7) DEFAULT '#3B82F6',
  icone VARCHAR(50) DEFAULT 'Package',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de tipos de equipamentos
CREATE TABLE IF NOT EXISTS tipos_equipamentos_2025_12_13_01_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID REFERENCES categorias_equipamentos_2025_12_13_01_00(id),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  unidade_medida VARCHAR(20) DEFAULT 'unidade',
  vida_util_meses INTEGER DEFAULT 12,
  requer_manutencao BOOLEAN DEFAULT false,
  intervalo_manutencao_dias INTEGER DEFAULT 30,
  valor_unitario DECIMAL(10,2) DEFAULT 0,
  fornecedor VARCHAR(100),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipamentos_2025_12_13_01_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_id UUID REFERENCES tipos_equipamentos_2025_12_13_01_00(id),
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

-- Criar tabela de atribuições de equipamentos
CREATE TABLE IF NOT EXISTS atribuicoes_equipamentos_2025_12_13_01_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id UUID REFERENCES equipamentos_2025_12_13_01_00(id),
  voluntario_id UUID REFERENCES voluntarios(id),
  missao_id UUID REFERENCES missoes_2025_12_18_14_15(id),
  data_atribuicao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_devolucao_prevista DATE,
  data_devolucao_real TIMESTAMP WITH TIME ZONE,
  estado VARCHAR(20) DEFAULT 'ativo' CHECK (estado IN ('ativo', 'devolvido', 'perdido', 'danificado')),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de manutenções de equipamentos
CREATE TABLE IF NOT EXISTS manutencoes_equipamentos_2025_12_13_01_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id UUID REFERENCES equipamentos_2025_12_13_01_00(id),
  tipo_manutencao VARCHAR(20) DEFAULT 'preventiva' CHECK (tipo_manutencao IN ('preventiva', 'corretiva', 'emergencia')),
  data_agendada DATE,
  data_realizada DATE,
  status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  descricao TEXT,
  custo DECIMAL(10,2),
  responsavel VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de alertas de equipamentos
CREATE TABLE IF NOT EXISTS alertas_equipamentos_2025_12_16_07_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id UUID REFERENCES equipamentos_2025_12_13_01_00(id),
  tipo_alerta VARCHAR(30) DEFAULT 'manutencao' CHECK (tipo_alerta IN ('manutencao', 'vencimento', 'devolucao', 'dano', 'perda')),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  prioridade VARCHAR(10) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'resolvido', 'ignorado')),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_resolucao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO categorias_equipamentos_2025_12_13_01_00 (nome, descricao, codigo, cor, icone, ordem) VALUES
('Proteção Individual', 'Equipamentos de proteção individual para voluntários', 'EPI', '#10B981', 'Shield', 1),
('Transporte', 'Equipamentos para transporte de animais', 'TRANS', '#3B82F6', 'Truck', 2),
('Cuidados Veterinários', 'Equipamentos médicos e veterinários', 'VET', '#EF4444', 'Heart', 3),
('Comunicação', 'Equipamentos de comunicação e tecnologia', 'COM', '#8B5CF6', 'Smartphone', 4),
('Vestuário', 'Uniformes e vestuário da associação', 'VEST', '#F59E0B', 'Shirt', 5)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir tipos padrão
INSERT INTO tipos_equipamentos_2025_12_13_01_00 (categoria_id, nome, descricao, codigo, unidade_medida, vida_util_meses, requer_manutencao, valor_unitario) VALUES
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 'Luvas de Proteção', 'Luvas descartáveis para manuseio de animais', 'LUV001', 'par', 1, false, 2.50),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 'Máscara de Proteção', 'Máscaras N95 para proteção respiratória', 'MAS001', 'unidade', 1, false, 1.20),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRANS'), 'Transportadora Pequena', 'Transportadora para animais pequenos', 'TRP001', 'unidade', 60, true, 45.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRANS'), 'Transportadora Grande', 'Transportadora para animais grandes', 'TRP002', 'unidade', 60, true, 85.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'VET'), 'Termômetro Digital', 'Termômetro para medição de temperatura', 'TER001', 'unidade', 24, false, 15.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'COM'), 'Rádio Comunicador', 'Rádio para comunicação em campo', 'RAD001', 'unidade', 36, true, 120.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'VEST'), 'Colete Identificação', 'Colete com logotipo da associação', 'COL001', 'unidade', 24, false, 25.00)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir alguns equipamentos de exemplo
INSERT INTO equipamentos_2025_12_13_01_00 (tipo_id, codigo, numero_serie, estado, data_aquisicao, valor_aquisicao, localizacao) VALUES
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP001'), 'TRP001-001', 'TP2024001', 'disponivel', '2024-01-15', 45.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP001'), 'TRP001-002', 'TP2024002', 'em_uso', '2024-01-15', 45.00, 'Em Campo'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP002'), 'TRP002-001', 'TG2024001', 'disponivel', '2024-02-10', 85.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RAD001'), 'RAD001-001', 'RC2024001', 'disponivel', '2024-03-05', 120.00, 'Escritório'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RAD001'), 'RAD001-002', 'RC2024002', 'manutencao', '2024-03-05', 120.00, 'Oficina'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'COL001'), 'COL001-001', 'CV2024001', 'disponivel', '2024-01-20', 25.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'COL001'), 'COL001-002', 'CV2024002', 'disponivel', '2024-01-20', 25.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TER001'), 'TER001-001', 'TD2024001', 'disponivel', '2024-02-15', 15.00, 'Kit Veterinário')
ON CONFLICT (codigo) DO NOTHING;

-- Criar alguns alertas de exemplo
INSERT INTO alertas_equipamentos_2025_12_16_07_00 (equipamento_id, tipo_alerta, titulo, descricao, prioridade) VALUES
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo = 'RAD001-002'), 'manutencao', 'Manutenção Preventiva Pendente', 'Rádio comunicador necessita de manutenção preventiva', 'media'),
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP001-002'), 'devolucao', 'Devolução em Atraso', 'Transportadora deveria ter sido devolvida há 3 dias', 'alta')
ON CONFLICT DO NOTHING;