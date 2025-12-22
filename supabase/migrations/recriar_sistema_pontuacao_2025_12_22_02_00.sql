-- Recriar sistema completo de pontuação de voluntários
-- Data: 2025-12-22 02:00 UTC

-- 1. Tabela de pontuação dos voluntários
CREATE TABLE IF NOT EXISTS pontuacao_voluntarios_2025_12_22_02_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id UUID NOT NULL REFERENCES voluntarios(id) ON DELETE CASCADE,
    pontos_totais INTEGER DEFAULT 0,
    nivel INTEGER DEFAULT 1,
    badges_conquistados TEXT[] DEFAULT '{}',
    total_missoes INTEGER DEFAULT 0,
    total_horas DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de histórico de pontos
CREATE TABLE IF NOT EXISTS historico_pontos_2025_12_22_02_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id UUID NOT NULL REFERENCES voluntarios(id) ON DELETE CASCADE,
    missao_id UUID REFERENCES missoes_2025_12_21_19_00(id) ON DELETE SET NULL,
    pontos_ganhos INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    data_acao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tipo_acao VARCHAR(50) DEFAULT 'participacao_missao'
);

-- 3. Tabela de badges do sistema
CREATE TABLE IF NOT EXISTS badges_sistema_2025_12_22_02_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50) DEFAULT 'award',
    cor VARCHAR(20) DEFAULT 'blue',
    pontos_necessarios INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir badges padrão
INSERT INTO badges_sistema_2025_12_22_02_00 (codigo, nome, descricao, icone, cor, pontos_necessarios) VALUES
('primeiro_passo', 'Primeiro Passo', 'Primeira participação numa missão', 'star', 'yellow', 10),
('dedicado', 'Dedicado', 'Participou em 5 missões', 'heart', 'red', 50),
('veterano', 'Veterano', 'Participou em 10 missões', 'shield', 'blue', 100),
('heroi', 'Herói', 'Participou em 25 missões', 'crown', 'gold', 250),
('lenda', 'Lenda', 'Participou em 50 missões', 'trophy', 'purple', 500),
('salvador', 'Salvador de Animais', 'Mais de 100 horas de serviço', 'heart-handshake', 'green', 1000)
ON CONFLICT (codigo) DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pontuacao_voluntarios_2025_12_22_02_00_voluntario_id ON pontuacao_voluntarios_2025_12_22_02_00(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_pontuacao_voluntarios_2025_12_22_02_00_pontos ON pontuacao_voluntarios_2025_12_22_02_00(pontos_totais DESC);
CREATE INDEX IF NOT EXISTS idx_historico_pontos_2025_12_22_02_00_voluntario_id ON historico_pontos_2025_12_22_02_00(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_historico_pontos_2025_12_22_02_00_data ON historico_pontos_2025_12_22_02_00(data_acao DESC);

-- Ativar RLS
ALTER TABLE pontuacao_voluntarios_2025_12_22_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_pontos_2025_12_22_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges_sistema_2025_12_22_02_00 ENABLE ROW LEVEL SECURITY;

-- Políticas RLS permissivas (temporárias)
CREATE POLICY "Permitir tudo pontuacao_voluntarios" ON pontuacao_voluntarios_2025_12_22_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo historico_pontos" ON historico_pontos_2025_12_22_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo badges_sistema" ON badges_sistema_2025_12_22_02_00 FOR ALL USING (true) WITH CHECK (true);

-- Função para calcular nível baseado nos pontos
CREATE OR REPLACE FUNCTION calcular_nivel_voluntario(pontos INTEGER)
RETURNS INTEGER AS $$
BEGIN
    CASE 
        WHEN pontos >= 1000 THEN RETURN 4; -- Lenda
        WHEN pontos >= 250 THEN RETURN 3;  -- Herói
        WHEN pontos >= 50 THEN RETURN 2;   -- Veterano
        ELSE RETURN 1;                     -- Iniciante
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar pontuação do voluntário
CREATE OR REPLACE FUNCTION atualizar_pontuacao_voluntario(
    p_voluntario_id UUID,
    p_pontos INTEGER,
    p_descricao TEXT,
    p_missao_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_pontos_atuais INTEGER := 0;
    v_novo_total INTEGER;
    v_novo_nivel INTEGER;
BEGIN
    -- Inserir no histórico
    INSERT INTO historico_pontos_2025_12_22_02_00 (voluntario_id, missao_id, pontos_ganhos, descricao)
    VALUES (p_voluntario_id, p_missao_id, p_pontos, p_descricao);
    
    -- Verificar se já existe registro de pontuação
    SELECT pontos_totais INTO v_pontos_atuais 
    FROM pontuacao_voluntarios_2025_12_22_02_00 
    WHERE voluntario_id = p_voluntario_id;
    
    v_novo_total := COALESCE(v_pontos_atuais, 0) + p_pontos;
    v_novo_nivel := calcular_nivel_voluntario(v_novo_total);
    
    -- Inserir ou atualizar pontuação
    INSERT INTO pontuacao_voluntarios_2025_12_22_02_00 (voluntario_id, pontos_totais, nivel)
    VALUES (p_voluntario_id, v_novo_total, v_novo_nivel)
    ON CONFLICT (voluntario_id) 
    DO UPDATE SET 
        pontos_totais = v_novo_total,
        nivel = v_novo_nivel,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;