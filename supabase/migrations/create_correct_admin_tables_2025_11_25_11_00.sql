-- Criar tabelas corretas para campos de seleção dos formulários
-- Data: 2025-11-25 11:00 UTC

-- 1. TABELA DE ESPÉCIES (para formulário Novo Animal)
CREATE TABLE IF NOT EXISTS public.especies (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE SEXOS (para formulário Novo Animal)
CREATE TABLE IF NOT EXISTS public.sexos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(20) NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE ESPECIALIDADES DE VOLUNTÁRIOS (para formulário Gestão Voluntários)
CREATE TABLE IF NOT EXISTS public.especialidades_voluntarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT,
  cor VARCHAR(7), -- Para cores hex como #FF0000
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE TIPOS DE GRUPOS (para formulário Gestão Grupos)
CREATE TABLE IF NOT EXISTS public.tipos_grupos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(30) NOT NULL UNIQUE,
  descricao TEXT,
  icone VARCHAR(20), -- Para ícones como 'Dog', 'Cat'
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE TIPOS DE EVENTOS (para formulário Eventos)
CREATE TABLE IF NOT EXISTS public.tipos_eventos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT,
  cor VARCHAR(7),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE TIPOS DE LOCALIZAÇÕES (para formulário Localizações)
CREATE TABLE IF NOT EXISTS public.tipos_localizacoes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INSERIR DADOS INICIAIS

-- Espécies (baseado no código hardcoded)
INSERT INTO public.especies (nome, descricao) VALUES
('Cão', 'Canis lupus familiaris'),
('Gato', 'Felis catus'),
('Coelho', 'Oryctolagus cuniculus'),
('Hamster', 'Cricetinae'),
('Pássaro', 'Aves diversas'),
('Tartaruga', 'Testudines'),
('Outro', 'Outras espécies não listadas')
ON CONFLICT (nome) DO NOTHING;

-- Sexos (baseado no código hardcoded)
INSERT INTO public.sexos (nome, descricao) VALUES
('Macho', 'Sexo masculino'),
('Fêmea', 'Sexo feminino'),
('Indefinido', 'Sexo não determinado ou não identificado')
ON CONFLICT (nome) DO NOTHING;

-- Especialidades de Voluntários (baseado no código hardcoded)
INSERT INTO public.especialidades_voluntarios (nome, descricao, cor) VALUES
('Veterinário', 'Profissional veterinário qualificado', '#3B82F6'),
('Cuidador', 'Cuidador de animais', '#10B981'),
('Transporte', 'Responsável pelo transporte de animais', '#8B5CF6'),
('Administrativo', 'Funções administrativas e de gestão', '#F59E0B'),
('Geral', 'Voluntário para funções gerais', '#6B7280')
ON CONFLICT (nome) DO NOTHING;

-- Tipos de Grupos (baseado no código hardcoded)
INSERT INTO public.tipos_grupos (nome, descricao, icone) VALUES
('matilha', 'Grupo de cães', 'Dog'),
('colonia', 'Colónia de gatos', 'Cat')
ON CONFLICT (nome) DO NOTHING;

-- Tipos de Eventos (dados comuns)
INSERT INTO public.tipos_eventos (nome, descricao, cor) VALUES
('Consulta Médica', 'Consulta veterinária agendada', '#3B82F6'),
('Vacinação', 'Sessão de vacinação', '#10B981'),
('Adoção', 'Processo de adoção', '#F59E0B'),
('Resgate', 'Operação de resgate de animal', '#EF4444'),
('Transferência', 'Transferência para outra instituição', '#8B5CF6'),
('Evento Público', 'Evento de sensibilização pública', '#06B6D4'),
('Formação', 'Sessão de formação para voluntários', '#84CC16'),
('Outro', 'Outros tipos de eventos', '#6B7280')
ON CONFLICT (nome) DO NOTHING;

-- Tipos de Localizações (dados comuns)
INSERT INTO public.tipos_localizacoes (nome, descricao) VALUES
('Canil Municipal', 'Canil da câmara municipal'),
('Casa de Acolhimento', 'Casa de acolhimento temporário'),
('Família de Acolhimento', 'Família voluntária de acolhimento'),
('Clínica Veterinária', 'Instalações de clínica veterinária'),
('Quinta/Terreno', 'Quinta ou terreno rural'),
('Apartamento', 'Apartamento urbano'),
('Moradia', 'Moradia com quintal'),
('Rua', 'Animal encontrado na rua'),
('Outro', 'Outro tipo de localização')
ON CONFLICT (nome) DO NOTHING;

-- CONFIGURAR RLS (Row Level Security)
ALTER TABLE public.especies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades_voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_localizacoes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS (Leitura para todos autenticados, Escrita para admins)
-- Espécies
CREATE POLICY "Todos podem ler espécies" ON public.especies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins podem gerir espécies" ON public.especies FOR ALL USING (auth.jwt() ->> 'perfil' = 'administrador');

-- Sexos
CREATE POLICY "Todos podem ler sexos" ON public.sexos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins podem gerir sexos" ON public.sexos FOR ALL USING (auth.jwt() ->> 'perfil' = 'administrador');

-- Especialidades Voluntários
CREATE POLICY "Todos podem ler especialidades" ON public.especialidades_voluntarios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins podem gerir especialidades" ON public.especialidades_voluntarios FOR ALL USING (auth.jwt() ->> 'perfil' = 'administrador');

-- Tipos Grupos
CREATE POLICY "Todos podem ler tipos grupos" ON public.tipos_grupos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins podem gerir tipos grupos" ON public.tipos_grupos FOR ALL USING (auth.jwt() ->> 'perfil' = 'administrador');

-- Tipos Eventos
CREATE POLICY "Todos podem ler tipos eventos" ON public.tipos_eventos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins podem gerir tipos eventos" ON public.tipos_eventos FOR ALL USING (auth.jwt() ->> 'perfil' = 'administrador');

-- Tipos Localizações
CREATE POLICY "Todos podem ler tipos localizações" ON public.tipos_localizacoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins podem gerir tipos localizações" ON public.tipos_localizacoes FOR ALL USING (auth.jwt() ->> 'perfil' = 'administrador');

-- CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_especies_ativo ON public.especies(ativo);
CREATE INDEX IF NOT EXISTS idx_sexos_ativo ON public.sexos(ativo);
CREATE INDEX IF NOT EXISTS idx_especialidades_voluntarios_ativo ON public.especialidades_voluntarios(ativo);
CREATE INDEX IF NOT EXISTS idx_tipos_grupos_ativo ON public.tipos_grupos(ativo);
CREATE INDEX IF NOT EXISTS idx_tipos_eventos_ativo ON public.tipos_eventos(ativo);
CREATE INDEX IF NOT EXISTS idx_tipos_localizacoes_ativo ON public.tipos_localizacoes(ativo);

-- VERIFICAR DADOS INSERIDOS
SELECT 'especies' as tabela, COUNT(*) as total FROM public.especies;
SELECT 'sexos' as tabela, COUNT(*) as total FROM public.sexos;
SELECT 'especialidades_voluntarios' as tabela, COUNT(*) as total FROM public.especialidades_voluntarios;
SELECT 'tipos_grupos' as tabela, COUNT(*) as total FROM public.tipos_grupos;
SELECT 'tipos_eventos' as tabela, COUNT(*) as total FROM public.tipos_eventos;
SELECT 'tipos_localizacoes' as tabela, COUNT(*) as total FROM public.tipos_localizacoes;