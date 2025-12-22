-- Sistema de Especialidades para Voluntários
CREATE TABLE IF NOT EXISTS especialidades_voluntarios_2025_12_21_22_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) DEFAULT 'geral',
    cor VARCHAR(20) DEFAULT 'blue',
    icone VARCHAR(50) DEFAULT 'User',
    pontos_bonus INTEGER DEFAULT 0,
    requer_certificacao BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento voluntário-especialidade (muitos para muitos)
CREATE TABLE IF NOT EXISTS voluntario_especialidades_2025_12_21_22_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id UUID NOT NULL,
    especialidade_id UUID NOT NULL REFERENCES especialidades_voluntarios_2025_12_21_22_00(id) ON DELETE CASCADE,
    nivel_experiencia VARCHAR(20) DEFAULT 'iniciante' CHECK (nivel_experiencia IN ('iniciante', 'intermediario', 'avancado', 'expert')),
    data_certificacao DATE,
    certificado_valido_ate DATE,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(voluntario_id, especialidade_id)
);

-- Inserir especialidades padrão
INSERT INTO especialidades_voluntarios_2025_12_21_22_00 (codigo, nome, descricao, categoria, cor, icone, pontos_bonus, requer_certificacao) VALUES
('resgate_emergencia', 'Resgate de Emergência', 'Especialista em resgates urgentes de animais em situação de perigo', 'resgate', 'red', 'Shield', 15, true),
('cuidados_veterinarios', 'Cuidados Veterinários', 'Conhecimentos em primeiros socorros e cuidados básicos veterinários', 'saude', 'green', 'Heart', 20, true),
('adestramento', 'Adestramento e Comportamento', 'Especialista em comportamento animal e técnicas de adestramento', 'comportamento', 'purple', 'Brain', 12, false),
('transporte_animais', 'Transporte de Animais', 'Experiência no transporte seguro de animais', 'logistica', 'blue', 'Truck', 8, false),
('eventos_adocao', 'Eventos de Adoção', 'Organização e gestão de eventos de adoção', 'eventos', 'yellow', 'Calendar', 10, false),
('fotografia', 'Fotografia de Animais', 'Especialista em fotografia para perfis de adoção', 'marketing', 'pink', 'Camera', 5, false),
('redes_sociais', 'Gestão de Redes Sociais', 'Marketing digital e gestão de redes sociais', 'marketing', 'cyan', 'Share', 8, false),
('administracao', 'Administração e Gestão', 'Apoio administrativo e gestão de processos', 'admin', 'gray', 'FileText', 6, false),
('captacao_fundos', 'Captação de Fundos', 'Organização de campanhas de angariação de fundos', 'financeiro', 'orange', 'DollarSign', 12, false),
('educacao_ambiental', 'Educação Ambiental', 'Ações de sensibilização e educação sobre proteção animal', 'educacao', 'green', 'BookOpen', 10, false);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_voluntario_especialidades_voluntario_id ON voluntario_especialidades_2025_12_21_22_00(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_voluntario_especialidades_especialidade_id ON voluntario_especialidades_2025_12_21_22_00(especialidade_id);
CREATE INDEX IF NOT EXISTS idx_especialidades_categoria ON especialidades_voluntarios_2025_12_21_22_00(categoria);

-- RLS Policies
ALTER TABLE especialidades_voluntarios_2025_12_21_22_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntario_especialidades_2025_12_21_22_00 ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Acesso total especialidades_voluntarios" ON especialidades_voluntarios_2025_12_21_22_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total voluntario_especialidades" ON voluntario_especialidades_2025_12_21_22_00 FOR ALL USING (true) WITH CHECK (true);