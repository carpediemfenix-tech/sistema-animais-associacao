-- Criar tabela de categorias de equipamentos
CREATE TABLE categorias_equipamentos_2025_12_13_01_00 (
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
CREATE TABLE tipos_equipamentos_2025_12_13_01_00 (
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
CREATE TABLE equipamentos_2025_12_13_01_00 (
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

-- Criar tabela de atribuições de equipamentos
CREATE TABLE atribuicoes_equipamentos_2025_12_13_01_00 (
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
CREATE TABLE manutencoes_equipamentos_2025_12_13_01_00 (
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
CREATE TABLE alertas_equipamentos_2025_12_16_07_00 (
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

-- Criar políticas RLS básicas
ALTER TABLE categorias_equipamentos_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_equipamentos_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE atribuicoes_equipamentos_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes_equipamentos_2025_12_13_01_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_equipamentos_2025_12_16_07_00 ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver categorias" ON categorias_equipamentos_2025_12_13_01_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver tipos" ON tipos_equipamentos_2025_12_13_01_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver equipamentos" ON equipamentos_2025_12_13_01_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver atribuições" ON atribuicoes_equipamentos_2025_12_13_01_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver manutenções" ON manutencoes_equipamentos_2025_12_13_01_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver alertas" ON alertas_equipamentos_2025_12_16_07_00 FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para inserção/atualização (usuários autenticados)
CREATE POLICY "Usuários autenticados podem inserir categorias" ON categorias_equipamentos_2025_12_13_01_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem inserir tipos" ON tipos_equipamentos_2025_12_13_01_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem inserir equipamentos" ON equipamentos_2025_12_13_01_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem inserir atribuições" ON atribuicoes_equipamentos_2025_12_13_01_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem inserir manutenções" ON manutencoes_equipamentos_2025_12_13_01_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem inserir alertas" ON alertas_equipamentos_2025_12_16_07_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar categorias" ON categorias_equipamentos_2025_12_13_01_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem atualizar tipos" ON tipos_equipamentos_2025_12_13_01_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem atualizar equipamentos" ON equipamentos_2025_12_13_01_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem atualizar atribuições" ON atribuicoes_equipamentos_2025_12_13_01_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem atualizar manutenções" ON manutencoes_equipamentos_2025_12_13_01_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem atualizar alertas" ON alertas_equipamentos_2025_12_16_07_00 FOR UPDATE USING (auth.role() = 'authenticated');