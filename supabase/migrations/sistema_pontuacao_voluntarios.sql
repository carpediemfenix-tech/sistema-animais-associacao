-- Sistema de Pontuação para Voluntários
-- Tabela de pontuação de voluntários
CREATE TABLE IF NOT EXISTS pontuacao_voluntarios_2025_12_21_21_15 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id UUID NOT NULL,
    pontos_totais INTEGER DEFAULT 0,
    nivel VARCHAR(20) DEFAULT 'iniciante' CHECK (nivel IN ('iniciante', 'experiente', 'veterano', 'lenda')),
    badges TEXT[] DEFAULT '{}',
    missoes_participadas INTEGER DEFAULT 0,
    horas_totais DECIMAL(10,2) DEFAULT 0,
    ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de pontos
CREATE TABLE IF NOT EXISTS historico_pontos_2025_12_21_21_15 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id UUID NOT NULL,
    missao_id UUID,
    participacao_id UUID,
    pontos_ganhos INTEGER NOT NULL,
    tipo_acao VARCHAR(50) NOT NULL, -- 'participacao', 'coordenacao', 'bonus', 'penalidade'
    descricao TEXT,
    data_acao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de badges e conquistas
CREATE TABLE IF NOT EXISTS badges_sistema_2025_12_21_21_15 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    cor VARCHAR(20),
    pontos_necessarios INTEGER,
    criterio_especial TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir badges padrão
INSERT INTO badges_sistema_2025_12_21_21_15 (codigo, nome, descricao, icone, cor, pontos_necessarios) VALUES
('primeira_missao', 'Primeira Missão', 'Participou na primeira missão', 'Star', 'yellow', 0),
('veterano_10', 'Veterano', '10 missões completadas', 'Award', 'blue', 100),
('heroi_25', 'Herói Animal', '25 missões completadas', 'Heart', 'red', 250),
('lenda_50', 'Lenda da Associação', '50 missões completadas', 'Crown', 'purple', 500),
('coordenador', 'Coordenador Experiente', 'Coordenou 5 missões', 'Shield', 'green', 150),
('dedicado_100h', 'Dedicação Total', '100 horas de voluntariado', 'Clock', 'orange', 300);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pontuacao_voluntarios_voluntario_id ON pontuacao_voluntarios_2025_12_21_21_15(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_historico_pontos_voluntario_id ON historico_pontos_2025_12_21_21_15(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_historico_pontos_missao_id ON historico_pontos_2025_12_21_21_15(missao_id);

-- RLS Policies
ALTER TABLE pontuacao_voluntarios_2025_12_21_21_15 ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_pontos_2025_12_21_21_15 ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges_sistema_2025_12_21_21_15 ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Acesso total pontuacao_voluntarios" ON pontuacao_voluntarios_2025_12_21_21_15 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total historico_pontos" ON historico_pontos_2025_12_21_21_15 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total badges_sistema" ON badges_sistema_2025_12_21_21_15 FOR ALL USING (true) WITH CHECK (true);

-- Função para calcular nível baseado em pontos
CREATE OR REPLACE FUNCTION calcular_nivel_voluntario(pontos INTEGER)
RETURNS VARCHAR(20) AS $$
BEGIN
    IF pontos >= 500 THEN
        RETURN 'lenda';
    ELSIF pontos >= 200 THEN
        RETURN 'veterano';
    ELSIF pontos >= 50 THEN
        RETURN 'experiente';
    ELSE
        RETURN 'iniciante';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar pontuação do voluntário
CREATE OR REPLACE FUNCTION atualizar_pontuacao_voluntario(
    p_voluntario_id UUID,
    p_pontos_ganhos INTEGER,
    p_missao_id UUID DEFAULT NULL,
    p_participacao_id UUID DEFAULT NULL,
    p_tipo_acao VARCHAR(50) DEFAULT 'participacao',
    p_descricao TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_pontos_atuais INTEGER;
    v_novo_nivel VARCHAR(20);
BEGIN
    -- Inserir no histórico
    INSERT INTO historico_pontos_2025_12_21_21_15 (
        voluntario_id, missao_id, participacao_id, pontos_ganhos, tipo_acao, descricao
    ) VALUES (
        p_voluntario_id, p_missao_id, p_participacao_id, p_pontos_ganhos, p_tipo_acao, p_descricao
    );
    
    -- Atualizar ou criar registro de pontuação
    INSERT INTO pontuacao_voluntarios_2025_12_21_21_15 (voluntario_id, pontos_totais, ultima_atividade)
    VALUES (p_voluntario_id, p_pontos_ganhos, NOW())
    ON CONFLICT (voluntario_id) DO UPDATE SET
        pontos_totais = pontuacao_voluntarios_2025_12_21_21_15.pontos_totais + p_pontos_ganhos,
        ultima_atividade = NOW(),
        updated_at = NOW();
    
    -- Obter pontos atuais e calcular novo nível
    SELECT pontos_totais INTO v_pontos_atuais 
    FROM pontuacao_voluntarios_2025_12_21_21_15 
    WHERE voluntario_id = p_voluntario_id;
    
    v_novo_nivel := calcular_nivel_voluntario(v_pontos_atuais);
    
    -- Atualizar nível
    UPDATE pontuacao_voluntarios_2025_12_21_21_15 
    SET nivel = v_novo_nivel 
    WHERE voluntario_id = p_voluntario_id;
END;
$$ LANGUAGE plpgsql;