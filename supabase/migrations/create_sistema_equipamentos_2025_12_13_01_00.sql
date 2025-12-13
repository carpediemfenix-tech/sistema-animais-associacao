-- Sistema de Equipamentos e Materiais para Voluntários
-- Criado em: 2025-12-13 01:00 UTC

-- 1. Tabela de Categorias de Equipamentos
CREATE TABLE IF NOT EXISTS categorias_equipamentos_2025_12_13_01_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  codigo VARCHAR(20) UNIQUE NOT NULL, -- EPI, MAT_RESGATE, PRIMEIROS_SOCORROS, REGISTO_DIGITAL, FARDAMENTO
  cor VARCHAR(7) DEFAULT '#6B7280', -- Cor em hex para identificação visual
  icone VARCHAR(50), -- Nome do ícone Lucide
  ordem INTEGER DEFAULT 0, -- Para ordenação na interface
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Tipos de Equipamentos
CREATE TABLE IF NOT EXISTS tipos_equipamentos_2025_12_13_01_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria_id UUID REFERENCES categorias_equipamentos_2025_12_13_01_00(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  unidade_medida VARCHAR(20) DEFAULT 'unidade', -- unidade, par, conjunto, metro, litro, etc.
  vida_util_meses INTEGER DEFAULT 12, -- Vida útil em meses
  requer_manutencao BOOLEAN DEFAULT false,
  intervalo_manutencao_dias INTEGER DEFAULT 30,
  valor_unitario DECIMAL(10,2) DEFAULT 0.00,
  fornecedor VARCHAR(200),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Equipamentos (Inventário)
CREATE TABLE IF NOT EXISTS equipamentos_2025_12_13_01_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_equipamento_id UUID REFERENCES tipos_equipamentos_2025_12_13_01_00(id) ON DELETE CASCADE,
  codigo_interno VARCHAR(50) UNIQUE NOT NULL, -- Código único do item
  numero_serie VARCHAR(100),
  data_aquisicao DATE,
  data_validade DATE, -- Para itens com validade
  estado VARCHAR(50) DEFAULT 'disponivel', -- disponivel, em_uso, manutencao, danificado, perdido, descartado
  localizacao VARCHAR(200), -- Onde está guardado
  condicao VARCHAR(50) DEFAULT 'novo', -- novo, bom, regular, mau
  valor_aquisicao DECIMAL(10,2) DEFAULT 0.00,
  garantia_ate DATE,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Atribuições de Equipamentos a Voluntários
CREATE TABLE IF NOT EXISTS atribuicoes_equipamentos_2025_12_13_01_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipamento_id UUID REFERENCES equipamentos_2025_12_13_01_00(id) ON DELETE CASCADE,
  voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE,
  data_atribuicao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_devolucao TIMESTAMP WITH TIME ZONE,
  motivo_atribuicao TEXT,
  estado_entrega VARCHAR(50) DEFAULT 'bom', -- novo, bom, regular, mau
  estado_devolucao VARCHAR(50),
  observacoes_entrega TEXT,
  observacoes_devolucao TEXT,
  responsavel_entrega_id UUID REFERENCES voluntarios(id),
  responsavel_devolucao_id UUID REFERENCES voluntarios(id),
  ativo BOOLEAN DEFAULT true, -- true = equipamento ainda com o voluntário
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Manutenções
CREATE TABLE IF NOT EXISTS manutencoes_equipamentos_2025_12_13_01_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipamento_id UUID REFERENCES equipamentos_2025_12_13_01_00(id) ON DELETE CASCADE,
  tipo_manutencao VARCHAR(50) NOT NULL, -- preventiva, corretiva, revisao, limpeza
  data_manutencao DATE NOT NULL,
  data_proxima_manutencao DATE,
  descricao TEXT NOT NULL,
  custo DECIMAL(10,2) DEFAULT 0.00,
  fornecedor_servico VARCHAR(200),
  responsavel_id UUID REFERENCES voluntarios(id),
  status VARCHAR(50) DEFAULT 'concluida', -- agendada, em_andamento, concluida, cancelada
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Histórico de Utilização
CREATE TABLE IF NOT EXISTS historico_utilizacao_2025_12_13_01_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipamento_id UUID REFERENCES equipamentos_2025_12_13_01_00(id) ON DELETE CASCADE,
  voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE,
  data_utilizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atividade VARCHAR(200), -- Resgate, Formação, Evento, Manutenção, etc.
  duracao_horas DECIMAL(5,2),
  condicao_antes VARCHAR(50) DEFAULT 'bom',
  condicao_depois VARCHAR(50) DEFAULT 'bom',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Alertas de Reposição
CREATE TABLE IF NOT EXISTS alertas_reposicao_2025_12_13_01_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_equipamento_id UUID REFERENCES tipos_equipamentos_2025_12_13_01_00(id) ON DELETE CASCADE,
  quantidade_minima INTEGER NOT NULL DEFAULT 1,
  quantidade_atual INTEGER NOT NULL DEFAULT 0,
  quantidade_recomendada INTEGER NOT NULL DEFAULT 5,
  alerta_ativo BOOLEAN DEFAULT true,
  data_ultimo_alerta TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Inserir categorias padrão
INSERT INTO categorias_equipamentos_2025_12_13_01_00 (nome, descricao, codigo, cor, icone, ordem) VALUES
('EPI - Equipamento de Proteção Individual', 'Equipamentos de segurança pessoal', 'EPI', '#EF4444', 'Shield', 1),
('Material de Resgate', 'Equipamentos para operações de resgate', 'MAT_RESGATE', '#F97316', 'Truck', 2),
('Primeiros Socorros', 'Material médico e de primeiros socorros', 'PRIMEIROS_SOCORROS', '#10B981', 'Heart', 3),
('Registo Digital', 'Equipamentos tecnológicos e digitais', 'REGISTO_DIGITAL', '#3B82F6', 'Smartphone', 4),
('Fardamento', 'Uniformes e vestuário da associação', 'FARDAMENTO', '#8B5CF6', 'Shirt', 5);

-- 9. Inserir tipos de equipamentos padrão
INSERT INTO tipos_equipamentos_2025_12_13_01_00 (categoria_id, nome, descricao, codigo, unidade_medida, vida_util_meses, requer_manutencao, valor_unitario) VALUES
-- EPI
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 'Luvas de Proteção', 'Luvas resistentes para manuseamento de animais', 'EPI_LUVAS', 'par', 6, false, 15.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 'Máscara de Proteção', 'Máscaras N95 ou equivalente', 'EPI_MASCARA', 'unidade', 1, false, 2.50),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 'Óculos de Proteção', 'Óculos de segurança', 'EPI_OCULOS', 'unidade', 24, false, 25.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 'Botas de Segurança', 'Calçado de proteção', 'EPI_BOTAS', 'par', 18, false, 80.00),

-- Material de Resgate
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'MAT_RESGATE'), 'Transportadora Grande', 'Transportadora para cães grandes', 'RESGATE_TRANSP_G', 'unidade', 60, true, 120.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'MAT_RESGATE'), 'Transportadora Pequena', 'Transportadora para gatos e cães pequenos', 'RESGATE_TRANSP_P', 'unidade', 60, true, 80.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'MAT_RESGATE'), 'Rede de Captura', 'Rede para captura de animais', 'RESGATE_REDE', 'unidade', 36, true, 45.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'MAT_RESGATE'), 'Corda de Segurança', 'Corda para operações de resgate', 'RESGATE_CORDA', 'metro', 24, true, 3.50),

-- Primeiros Socorros
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'PRIMEIROS_SOCORROS'), 'Kit Primeiros Socorros', 'Kit completo de primeiros socorros', 'PS_KIT_COMPLETO', 'unidade', 12, false, 65.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'PRIMEIROS_SOCORROS'), 'Termómetro Digital', 'Termómetro para animais', 'PS_TERMOMETRO', 'unidade', 36, false, 25.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'PRIMEIROS_SOCORROS'), 'Seringas Descartáveis', 'Seringas para medicação', 'PS_SERINGAS', 'unidade', 60, false, 0.50),

-- Registo Digital
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'REGISTO_DIGITAL'), 'Tablet', 'Tablet para registo digital', 'DIGITAL_TABLET', 'unidade', 48, true, 300.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'REGISTO_DIGITAL'), 'Câmara Fotográfica', 'Câmara para documentação', 'DIGITAL_CAMERA', 'unidade', 60, true, 450.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'REGISTO_DIGITAL'), 'Leitor de Microchip', 'Leitor para identificação de animais', 'DIGITAL_LEITOR_CHIP', 'unidade', 84, true, 180.00),

-- Fardamento
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FARDAMENTO'), 'T-shirt Associação', 'T-shirt com logótipo da associação', 'FARD_TSHIRT', 'unidade', 24, false, 18.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FARDAMENTO'), 'Colete Refletor', 'Colete de alta visibilidade', 'FARD_COLETE', 'unidade', 36, false, 35.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FARDAMENTO'), 'Boné Associação', 'Boné com logótipo', 'FARD_BONE', 'unidade', 18, false, 12.00);

-- 10. Configurar RLS para todas as tabelas
ALTER TABLE categorias_equipamentos_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_equipamentos_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE atribuicoes_equipamentos_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_utilizacao_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_reposicao_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para usuários autenticados
CREATE POLICY "Allow all for authenticated users" ON categorias_equipamentos_2025_12_13_01_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON tipos_equipamentos_2025_12_13_01_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON equipamentos_2025_12_13_01_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON atribuicoes_equipamentos_2025_12_13_01_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON manutencoes_equipamentos_2025_12_13_01_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON historico_utilizacao_2025_12_13_01_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON alertas_reposicao_2025_12_13_01_00 FOR ALL USING (true) WITH CHECK (true);

-- 11. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tipos_equipamentos_categoria ON tipos_equipamentos_2025_12_13_01_00(categoria_id);
CREATE INDEX IF NOT EXISTS idx_equipamentos_tipo ON equipamentos_2025_12_13_01_00(tipo_equipamento_id);
CREATE INDEX IF NOT EXISTS idx_equipamentos_estado ON equipamentos_2025_12_13_01_00(estado);
CREATE INDEX IF NOT EXISTS idx_atribuicoes_equipamento ON atribuicoes_equipamentos_2025_12_13_01_00(equipamento_id);
CREATE INDEX IF NOT EXISTS idx_atribuicoes_voluntario ON atribuicoes_equipamentos_2025_12_13_01_00(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_atribuicoes_ativo ON atribuicoes_equipamentos_2025_12_13_01_00(ativo);
CREATE INDEX IF NOT EXISTS idx_manutencoes_equipamento ON manutencoes_equipamentos_2025_12_13_01_00(equipamento_id);
CREATE INDEX IF NOT EXISTS idx_historico_equipamento ON historico_utilizacao_2025_12_13_01_00(equipamento_id);
CREATE INDEX IF NOT EXISTS idx_historico_voluntario ON historico_utilizacao_2025_12_13_01_00(voluntario_id);

-- 12. Triggers para atualizar timestamps
CREATE TRIGGER update_categorias_equipamentos_updated_at 
BEFORE UPDATE ON categorias_equipamentos_2025_12_13_01_00 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipos_equipamentos_updated_at 
BEFORE UPDATE ON tipos_equipamentos_2025_12_13_01_00 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipamentos_updated_at 
BEFORE UPDATE ON equipamentos_2025_12_13_01_00 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atribuicoes_equipamentos_updated_at 
BEFORE UPDATE ON atribuicoes_equipamentos_2025_12_13_01_00 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alertas_reposicao_updated_at 
BEFORE UPDATE ON alertas_reposicao_2025_12_13_01_00 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();