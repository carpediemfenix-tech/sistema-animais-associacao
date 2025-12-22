-- Criar índices, RLS e funções para sistema de pontuação
-- Data: 2025-12-22 02:00 UTC

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