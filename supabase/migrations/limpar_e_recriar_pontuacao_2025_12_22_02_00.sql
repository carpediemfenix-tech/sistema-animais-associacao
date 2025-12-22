-- Remover funções existentes e recriar sistema de pontuação
-- Data: 2025-12-22 02:00 UTC

-- Remover funções existentes
DROP FUNCTION IF EXISTS calcular_nivel_voluntario(integer);
DROP FUNCTION IF EXISTS atualizar_pontuacao_voluntario(uuid, integer, text, uuid);

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(voluntario_id)
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