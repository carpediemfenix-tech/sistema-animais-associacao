-- Criar tabela de participações em missões
CREATE TABLE IF NOT EXISTS participacoes_missoes_2025_12_21_20_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  missao_id UUID REFERENCES missoes_2025_12_21_19_00(id) ON DELETE CASCADE,
  voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE,
  funcao VARCHAR(100) DEFAULT 'Voluntário',
  data_participacao DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  horas_dedicadas INTEGER DEFAULT 0,
  pontos_atribuidos INTEGER DEFAULT 0,
  status_participacao VARCHAR(30) DEFAULT 'ativa' CHECK (status_participacao IN ('ativa', 'concluida', 'cancelada')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de animais vinculados às missões
CREATE TABLE IF NOT EXISTS missoes_animais_2025_12_21_20_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  missao_id UUID REFERENCES missoes_2025_12_21_19_00(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
  funcao_animal VARCHAR(100) DEFAULT 'Beneficiário',
  data_vinculacao DATE DEFAULT CURRENT_DATE,
  data_desvinculacao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_participacoes_missoes_2025_12_21_20_00_missao ON participacoes_missoes_2025_12_21_20_00(missao_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_missoes_2025_12_21_20_00_voluntario ON participacoes_missoes_2025_12_21_20_00(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_missoes_animais_2025_12_21_20_00_missao ON missoes_animais_2025_12_21_20_00(missao_id);
CREATE INDEX IF NOT EXISTS idx_missoes_animais_2025_12_21_20_00_animal ON missoes_animais_2025_12_21_20_00(animal_id);

-- Habilitar RLS
ALTER TABLE participacoes_missoes_2025_12_21_20_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes_animais_2025_12_21_20_00 ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso total (temporário para testes)
CREATE POLICY "Permitir acesso total participacoes" ON participacoes_missoes_2025_12_21_20_00
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso total missoes_animais" ON missoes_animais_2025_12_21_20_00
FOR ALL USING (true) WITH CHECK (true);