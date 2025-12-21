-- Criar tabela de missões simplificada se a original tiver problemas
CREATE TABLE IF NOT EXISTS missoes_2025_12_21_19_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) UNIQUE NOT NULL,
  tipo_missao_id UUID REFERENCES tipos_missoes_2025_12_18_14_15(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  local_principal VARCHAR(255) NOT NULL,
  prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  orcamento_previsto DECIMAL(10,2) DEFAULT 0,
  pontos_totais INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_curso', 'concluida_sucesso', 'concluida_insucesso', 'arquivada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_missoes_2025_12_21_19_00_status ON missoes_2025_12_21_19_00(status);
CREATE INDEX IF NOT EXISTS idx_missoes_2025_12_21_19_00_data_inicio ON missoes_2025_12_21_19_00(data_inicio);
CREATE INDEX IF NOT EXISTS idx_missoes_2025_12_21_19_00_tipo ON missoes_2025_12_21_19_00(tipo_missao_id);

-- Habilitar RLS
ALTER TABLE missoes_2025_12_21_19_00 ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso total (temporário para testes)
CREATE POLICY "Permitir acesso total missoes" ON missoes_2025_12_21_19_00
FOR ALL USING (true) WITH CHECK (true);