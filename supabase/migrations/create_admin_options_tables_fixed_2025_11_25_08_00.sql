-- Criar tabelas para gestão de campos com opções (CORRIGIDO)
-- Data: 2025-11-25 08:00 UTC

-- Tabela para gestão de espécies
CREATE TABLE IF NOT EXISTS public.especies_opcoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para gestão de sexos
CREATE TABLE IF NOT EXISTS public.sexos_opcoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para gestão de especialidades médicas
CREATE TABLE IF NOT EXISTS public.especialidades_opcoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    categoria VARCHAR(50), -- Para definir categoria da especialidade
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para gestão de estados dos animais
CREATE TABLE IF NOT EXISTS public.estados_opcoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(20), -- Para definir cor no frontend
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para gestão de tipos de intervenções
CREATE TABLE IF NOT EXISTS public.tipos_intervencoes_opcoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    categoria VARCHAR(50), -- Médica, Cirúrgica, Preventiva, etc.
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados padrão para espécies
INSERT INTO public.especies_opcoes (nome, descricao) VALUES
('Cão', 'Canis lupus familiaris'),
('Gato', 'Felis catus'),
('Coelho', 'Oryctolagus cuniculus'),
('Hamster', 'Cricetinae'),
('Pássaro', 'Aves diversas'),
('Tartaruga', 'Testudines'),
('Outro', 'Outras espécies não listadas')
ON CONFLICT (nome) DO NOTHING;

-- Inserir dados padrão para sexos
INSERT INTO public.sexos_opcoes (nome, descricao) VALUES
('Macho', 'Sexo masculino'),
('Fêmea', 'Sexo feminino'),
('Indefinido', 'Sexo não determinado ou indefinido')
ON CONFLICT (nome) DO NOTHING;

-- Inserir dados padrão para especialidades (com categoria)
INSERT INTO public.especialidades_opcoes (nome, descricao, categoria) VALUES
('Clínica Geral', 'Atendimento veterinário geral', 'Médica'),
('Cirurgia', 'Procedimentos cirúrgicos', 'Cirúrgica'),
('Dermatologia', 'Tratamento de pele e pelo', 'Médica'),
('Cardiologia', 'Tratamento do coração', 'Médica'),
('Ortopedia', 'Tratamento de ossos e articulações', 'Cirúrgica'),
('Oftalmologia', 'Tratamento dos olhos', 'Médica'),
('Vacinação', 'Aplicação de vacinas', 'Preventiva'),
('Castração', 'Procedimento de esterilização', 'Cirúrgica'),
('Desparasitação', 'Tratamento contra parasitas', 'Preventiva'),
('Emergência', 'Atendimento de urgência', 'Urgente')
ON CONFLICT (nome) DO NOTHING;

-- Inserir dados padrão para estados
INSERT INTO public.estados_opcoes (nome, descricao, cor) VALUES
('Ativo', 'Animal ativo no sistema', 'green'),
('Adotado', 'Animal foi adotado', 'blue'),
('Óbito', 'Animal faleceu', 'red'),
('Transferido', 'Animal foi transferido', 'yellow'),
('Crítico', 'Animal em estado crítico', 'red'),
('Recuperação', 'Animal em recuperação', 'orange'),
('Quarentena', 'Animal em quarentena', 'purple')
ON CONFLICT (nome) DO NOTHING;

-- Inserir dados padrão para tipos de intervenções
INSERT INTO public.tipos_intervencoes_opcoes (nome, descricao, categoria) VALUES
('Consulta Geral', 'Consulta veterinária de rotina', 'Médica'),
('Vacinação', 'Aplicação de vacinas', 'Preventiva'),
('Castração', 'Cirurgia de esterilização', 'Cirúrgica'),
('Desparasitação', 'Tratamento contra parasitas', 'Preventiva'),
('Tratamento Feridas', 'Cuidado de ferimentos', 'Médica'),
('Cirurgia Geral', 'Procedimentos cirúrgicos diversos', 'Cirúrgica'),
('Exames Laboratoriais', 'Análises clínicas', 'Diagnóstica'),
('Radiografia', 'Exame de imagem', 'Diagnóstica'),
('Emergência', 'Atendimento de urgência', 'Urgente'),
('Reabilitação', 'Fisioterapia e recuperação', 'Terapêutica')
ON CONFLICT (nome) DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_especies_opcoes_ativo ON public.especies_opcoes(ativo);
CREATE INDEX IF NOT EXISTS idx_sexos_opcoes_ativo ON public.sexos_opcoes(ativo);
CREATE INDEX IF NOT EXISTS idx_especialidades_opcoes_ativo ON public.especialidades_opcoes(ativo);
CREATE INDEX IF NOT EXISTS idx_estados_opcoes_ativo ON public.estados_opcoes(ativo);
CREATE INDEX IF NOT EXISTS idx_tipos_intervencoes_opcoes_ativo ON public.tipos_intervencoes_opcoes(ativo);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.especies_opcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sexos_opcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades_opcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados_opcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_intervencoes_opcoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Leitura para todos os usuários autenticados
CREATE POLICY "Leitura espécies para usuários autenticados" ON public.especies_opcoes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Leitura sexos para usuários autenticados" ON public.sexos_opcoes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Leitura especialidades para usuários autenticados" ON public.especialidades_opcoes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Leitura estados para usuários autenticados" ON public.estados_opcoes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Leitura tipos intervenções para usuários autenticados" ON public.tipos_intervencoes_opcoes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Verificar tabelas criadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%_opcoes'
ORDER BY table_name;