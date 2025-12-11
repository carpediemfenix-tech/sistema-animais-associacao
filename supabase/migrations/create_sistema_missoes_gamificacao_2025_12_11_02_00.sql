-- Sistema de Missões e Gamificação para Voluntários
-- Criado em: 2025-12-11 02:00 UTC

-- 1. Tabela de Tipos de Missões
CREATE TABLE IF NOT EXISTS tipos_missoes_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  icone VARCHAR(50), -- Nome do ícone Lucide
  cor VARCHAR(7) DEFAULT '#3B82F6', -- Cor em hex
  pontos_base INTEGER DEFAULT 10,
  categoria VARCHAR(50) DEFAULT 'geral', -- geral, cuidados, formacao, administrativo
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Missões
CREATE TABLE IF NOT EXISTS missoes_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  tipo_missao_id UUID REFERENCES tipos_missoes_2025_12_11_02_00(id),
  pontos_recompensa INTEGER DEFAULT 10,
  dificuldade VARCHAR(20) DEFAULT 'facil', -- facil, medio, dificil, expert
  prazo_dias INTEGER DEFAULT 7,
  max_participantes INTEGER DEFAULT 1,
  requisitos TEXT, -- Requisitos para participar
  instrucoes TEXT, -- Instruções detalhadas
  status VARCHAR(20) DEFAULT 'ativa', -- ativa, pausada, concluida, cancelada
  criado_por UUID REFERENCES auth.users(id),
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Tarefas (sub-missões)
CREATE TABLE IF NOT EXISTS tarefas_missoes_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  missao_id UUID REFERENCES missoes_2025_12_11_02_00(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 1,
  pontos INTEGER DEFAULT 5,
  obrigatoria BOOLEAN DEFAULT true,
  tipo_verificacao VARCHAR(20) DEFAULT 'manual', -- manual, automatica, foto
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Participações em Missões
CREATE TABLE IF NOT EXISTS participacoes_missoes_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  missao_id UUID REFERENCES missoes_2025_12_11_02_00(id) ON DELETE CASCADE,
  voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'inscrito', -- inscrito, em_progresso, concluida, abandonada
  progresso_percentual INTEGER DEFAULT 0,
  pontos_ganhos INTEGER DEFAULT 0,
  data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(missao_id, voluntario_id)
);

-- 5. Tabela de Progresso de Tarefas
CREATE TABLE IF NOT EXISTS progresso_tarefas_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participacao_id UUID REFERENCES participacoes_missoes_2025_12_11_02_00(id) ON DELETE CASCADE,
  tarefa_id UUID REFERENCES tarefas_missoes_2025_12_11_02_00(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pendente', -- pendente, em_progresso, concluida, verificada
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  evidencia_url TEXT, -- URL da foto/documento de evidência
  observacoes TEXT,
  verificado_por UUID REFERENCES auth.users(id),
  data_verificacao TIMESTAMP WITH TIME ZONE,
  pontos_ganhos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participacao_id, tarefa_id)
);

-- 6. Sistema de Pontuação e Níveis
CREATE TABLE IF NOT EXISTS niveis_gamificacao_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  pontos_minimos INTEGER NOT NULL,
  pontos_maximos INTEGER,
  icone VARCHAR(50),
  cor VARCHAR(7) DEFAULT '#3B82F6',
  beneficios TEXT, -- Descrição dos benefícios do nível
  ordem INTEGER NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Pontuação dos Voluntários
CREATE TABLE IF NOT EXISTS pontuacao_voluntarios_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE UNIQUE,
  pontos_totais INTEGER DEFAULT 0,
  nivel_atual_id UUID REFERENCES niveis_gamificacao_2025_12_11_02_00(id),
  missoes_concluidas INTEGER DEFAULT 0,
  streak_dias INTEGER DEFAULT 0, -- Dias consecutivos ativos
  melhor_streak INTEGER DEFAULT 0,
  ultima_atividade DATE DEFAULT CURRENT_DATE,
  ranking_posicao INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Conquistas/Badges
CREATE TABLE IF NOT EXISTS conquistas_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  icone VARCHAR(50),
  cor VARCHAR(7) DEFAULT '#FFD700',
  criterio TEXT NOT NULL, -- Critério para obter a conquista
  pontos_bonus INTEGER DEFAULT 0,
  raridade VARCHAR(20) DEFAULT 'comum', -- comum, raro, epico, lendario
  categoria VARCHAR(50) DEFAULT 'geral',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabela de Conquistas dos Voluntários
CREATE TABLE IF NOT EXISTS voluntarios_conquistas_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE,
  conquista_id UUID REFERENCES conquistas_2025_12_11_02_00(id) ON DELETE CASCADE,
  data_obtencao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voluntario_id, conquista_id)
);

-- 10. Tabela de Recompensas
CREATE TABLE IF NOT EXISTS recompensas_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  tipo VARCHAR(20) DEFAULT 'virtual', -- virtual, fisica, desconto, experiencia
  custo_pontos INTEGER NOT NULL,
  quantidade_disponivel INTEGER,
  quantidade_resgatada INTEGER DEFAULT 0,
  validade_dias INTEGER,
  imagem_url TEXT,
  instrucoes_resgate TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Tabela de Resgates de Recompensas
CREATE TABLE IF NOT EXISTS resgates_recompensas_2025_12_11_02_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE,
  recompensa_id UUID REFERENCES recompensas_2025_12_11_02_00(id) ON DELETE CASCADE,
  pontos_gastos INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente', -- pendente, processando, entregue, expirado
  data_resgate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_validade TIMESTAMP WITH TIME ZONE,
  codigo_resgate VARCHAR(50),
  observacoes TEXT,
  processado_por UUID REFERENCES auth.users(id),
  data_processamento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_missoes_status ON missoes_2025_12_11_02_00(status);
CREATE INDEX IF NOT EXISTS idx_missoes_tipo ON missoes_2025_12_11_02_00(tipo_missao_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_voluntario ON participacoes_missoes_2025_12_11_02_00(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_status ON participacoes_missoes_2025_12_11_02_00(status);
CREATE INDEX IF NOT EXISTS idx_pontuacao_ranking ON pontuacao_voluntarios_2025_12_11_02_00(pontos_totais DESC);
CREATE INDEX IF NOT EXISTS idx_progresso_participacao ON progresso_tarefas_2025_12_11_02_00(participacao_id);

-- Triggers para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tipos_missoes_updated_at BEFORE UPDATE ON tipos_missoes_2025_12_11_02_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missoes_updated_at BEFORE UPDATE ON missoes_2025_12_11_02_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON tarefas_missoes_2025_12_11_02_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participacoes_updated_at BEFORE UPDATE ON participacoes_missoes_2025_12_11_02_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progresso_updated_at BEFORE UPDATE ON progresso_tarefas_2025_12_11_02_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pontuacao_updated_at BEFORE UPDATE ON pontuacao_voluntarios_2025_12_11_02_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recompensas_updated_at BEFORE UPDATE ON recompensas_2025_12_11_02_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resgates_updated_at BEFORE UPDATE ON resgates_recompensas_2025_12_11_02_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();