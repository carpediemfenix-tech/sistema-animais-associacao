-- Criar tabela acoes_formacao se não existir
CREATE TABLE IF NOT EXISTS acoes_formacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'curso',
    duracao_horas INTEGER DEFAULT 0,
    data_inicio DATE,
    data_fim DATE,
    local VARCHAR(200),
    instrutor VARCHAR(100),
    max_participantes INTEGER DEFAULT 20,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir algumas ações de formação de exemplo
INSERT INTO acoes_formacao (titulo, descricao, tipo, duracao_horas, ativo) VALUES
('Primeiros Socorros para Animais', 'Curso básico de primeiros socorros veterinários', 'curso', 8, true),
('Técnicas de Resgate', 'Formação em técnicas de resgate de animais', 'workshop', 4, true),
('Cuidados com Animais Feridos', 'Workshop sobre cuidados básicos com animais feridos', 'workshop', 6, true),
('Legislação Animal', 'Seminário sobre legislação de proteção animal', 'seminario', 3, true),
('Nutrição Animal', 'Curso sobre nutrição adequada para diferentes espécies', 'curso', 12, true),
('Comportamento Animal', 'Workshop sobre comportamento e bem-estar animal', 'workshop', 5, true)
ON CONFLICT DO NOTHING;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_acoes_formacao_ativo ON acoes_formacao(ativo);
CREATE INDEX IF NOT EXISTS idx_acoes_formacao_tipo ON acoes_formacao(tipo);

-- Ativar RLS
ALTER TABLE acoes_formacao ENABLE ROW LEVEL SECURITY;

-- Política RLS permissiva
CREATE POLICY "Permitir tudo acoes_formacao" ON acoes_formacao FOR ALL USING (true) WITH CHECK (true);