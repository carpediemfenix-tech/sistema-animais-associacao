-- ===== SISTEMA DE PONTUAÇÃO CONFIGURÁVEL =====

-- 1. Configuração de pontuação por função
CREATE TABLE IF NOT EXISTS public.config_pontuacao_funcoes_2026_01_05_15_00 (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    funcao varchar(50) NOT NULL UNIQUE,
    pontos_base integer NOT NULL DEFAULT 10,
    multiplicador_coordenacao decimal(3,2) DEFAULT 1.0,
    multiplicador_especialista decimal(3,2) DEFAULT 1.0,
    bonus_lideranca integer DEFAULT 0,
    descricao text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Configuração de pontuação por especialidade e nível
CREATE TABLE IF NOT EXISTS public.config_pontuacao_especialidades_2026_01_05_15_00 (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    especialidade_codigo varchar(50) NOT NULL,
    nivel_experiencia varchar(20) NOT NULL, -- iniciante, intermediario, avancado, especialista
    pontos_base integer NOT NULL DEFAULT 5,
    multiplicador_certificado decimal(3,2) DEFAULT 1.2,
    bonus_experiencia integer DEFAULT 0,
    descricao text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(especialidade_codigo, nivel_experiencia)
);

-- 3. Configuração de valor por hora dedicada
CREATE TABLE IF NOT EXISTS public.config_pontuacao_horas_2026_01_05_15_00 (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_atividade varchar(50) NOT NULL UNIQUE, -- missao, formacao, voluntariado_geral, emergencia
    pontos_por_hora decimal(4,2) NOT NULL DEFAULT 2.0,
    minimo_horas decimal(3,1) DEFAULT 0.5, -- Mínimo de horas para pontuar
    maximo_horas_dia decimal(3,1) DEFAULT 8.0, -- Máximo de horas por dia
    multiplicador_fim_semana decimal(3,2) DEFAULT 1.2,
    multiplicador_feriado decimal(3,2) DEFAULT 1.5,
    multiplicador_noturno decimal(3,2) DEFAULT 1.3, -- 22h-6h
    descricao text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Configuração de multiplicadores por prioridade/complexidade
CREATE TABLE IF NOT EXISTS public.config_multiplicadores_2026_01_05_15_00 (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo varchar(30) NOT NULL, -- prioridade, complexidade, urgencia, duracao
    valor varchar(20) NOT NULL, -- baixa/media/alta, simples/media/complexa, etc
    multiplicador decimal(3,2) NOT NULL DEFAULT 1.0,
    bonus_adicional integer DEFAULT 0,
    descricao text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(tipo, valor)
);

-- 5. Tabela para armazenar pontos definidos em missões
ALTER TABLE public.missoes_2025_12_18_14_15 
ADD COLUMN IF NOT EXISTS pontos_base integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS multiplicador_dificuldade decimal(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS bonus_urgencia integer DEFAULT 0;

-- 6. Verificar se tabela de formações existe e adicionar pontos
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'formacoes' AND table_schema = 'public') THEN
        ALTER TABLE public.formacoes 
        ADD COLUMN IF NOT EXISTS pontos_base integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS multiplicador_certificacao decimal(3,2) DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS bonus_conclusao integer DEFAULT 0;
    END IF;
END $$;

-- 7. Tabela de histórico detalhado de pontuação (expandida)
DROP TABLE IF EXISTS public.historico_pontos_detalhado_2026_01_05_15_00;
CREATE TABLE public.historico_pontos_detalhado_2026_01_05_15_00 (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id uuid REFERENCES public.voluntarios(id),
    
    -- Origem dos pontos
    tipo_origem varchar(20) NOT NULL, -- missao, formacao, especialidade, horas_dedicadas
    origem_id uuid, -- ID da missão, formação, etc.
    
    -- Cálculo detalhado
    pontos_base integer NOT NULL DEFAULT 0,
    horas_dedicadas decimal(4,2) DEFAULT 0,
    pontos_por_hora decimal(4,2) DEFAULT 0,
    
    -- Multiplicadores aplicados
    multiplicador_funcao decimal(3,2) DEFAULT 1.0,
    multiplicador_especialidade decimal(3,2) DEFAULT 1.0,
    multiplicador_prioridade decimal(3,2) DEFAULT 1.0,
    multiplicador_complexidade decimal(3,2) DEFAULT 1.0,
    multiplicador_temporal decimal(3,2) DEFAULT 1.0, -- fim de semana, feriado, noturno
    
    -- Bônus
    bonus_lideranca integer DEFAULT 0,
    bonus_certificacao integer DEFAULT 0,
    bonus_experiencia integer DEFAULT 0,
    bonus_especial integer DEFAULT 0,
    
    -- Total calculado
    pontos_total integer NOT NULL,
    
    -- Metadados
    funcao varchar(50),
    especialidade_codigo varchar(50),
    nivel_experiencia varchar(20),
    data_atividade timestamp with time zone,
    observacoes text,
    calculado_por varchar(50) DEFAULT 'sistema',
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.config_pontuacao_funcoes_2026_01_05_15_00 (funcao, pontos_base, multiplicador_coordenacao, multiplicador_especialista, bonus_lideranca, descricao) VALUES
('coordenador', 25, 2.0, 1.5, 10, 'Coordenação geral de atividades'),
('participante', 10, 1.0, 1.0, 0, 'Participação ativa em atividades'),
('apoio', 8, 1.0, 1.0, 0, 'Apoio logístico e operacional'),
('especialista', 15, 1.2, 2.0, 5, 'Conhecimento técnico especializado'),
('voluntario', 12, 1.0, 1.0, 2, 'Voluntário geral'),
('observador', 5, 1.0, 1.0, 0, 'Observação e aprendizagem'),
('instrutor', 20, 1.5, 1.8, 8, 'Formação e instrução'),
('veterinario', 30, 1.3, 2.5, 5, 'Cuidados veterinários especializados')
ON CONFLICT (funcao) DO UPDATE SET
    pontos_base = EXCLUDED.pontos_base,
    multiplicador_coordenacao = EXCLUDED.multiplicador_coordenacao,
    multiplicador_especialista = EXCLUDED.multiplicador_especialista,
    bonus_lideranca = EXCLUDED.bonus_lideranca,
    descricao = EXCLUDED.descricao,
    updated_at = now();

-- Configurações de especialidades
INSERT INTO public.config_pontuacao_especialidades_2026_01_05_15_00 (especialidade_codigo, nivel_experiencia, pontos_base, multiplicador_certificado, bonus_experiencia, descricao) VALUES
('veterinaria', 'iniciante', 8, 1.2, 2, 'Conhecimentos básicos veterinários'),
('veterinaria', 'intermediario', 15, 1.4, 5, 'Experiência veterinária moderada'),
('veterinaria', 'avancado', 25, 1.6, 10, 'Veterinário experiente'),
('veterinaria', 'especialista', 40, 2.0, 20, 'Especialista veterinário certificado'),
('resgate', 'iniciante', 5, 1.1, 1, 'Noções básicas de resgate'),
('resgate', 'intermediario', 10, 1.3, 3, 'Experiência em resgates'),
('resgate', 'avancado', 18, 1.5, 8, 'Especialista em resgates complexos'),
('transporte', 'iniciante', 3, 1.1, 1, 'Transporte básico de animais'),
('transporte', 'intermediario', 6, 1.2, 2, 'Transporte especializado'),
('cuidados', 'iniciante', 4, 1.1, 1, 'Cuidados básicos com animais'),
('cuidados', 'intermediario', 8, 1.3, 3, 'Cuidados especializados'),
('cuidados', 'avancado', 15, 1.5, 6, 'Cuidados veterinários avançados')
ON CONFLICT (especialidade_codigo, nivel_experiencia) DO UPDATE SET
    pontos_base = EXCLUDED.pontos_base,
    multiplicador_certificado = EXCLUDED.multiplicador_certificado,
    bonus_experiencia = EXCLUDED.bonus_experiencia,
    descricao = EXCLUDED.descricao,
    updated_at = now();

-- Configurações de horas
INSERT INTO public.config_pontuacao_horas_2026_01_05_15_00 (tipo_atividade, pontos_por_hora, minimo_horas, maximo_horas_dia, multiplicador_fim_semana, multiplicador_feriado, multiplicador_noturno, descricao) VALUES
('missao', 3.0, 1.0, 12.0, 1.3, 1.6, 1.4, 'Horas dedicadas em missões'),
('formacao', 2.5, 0.5, 8.0, 1.2, 1.3, 1.2, 'Horas de formação e treino'),
('voluntariado_geral', 2.0, 0.5, 8.0, 1.2, 1.4, 1.3, 'Voluntariado geral'),
('emergencia', 5.0, 0.5, 16.0, 1.5, 2.0, 1.8, 'Situações de emergência'),
('administrativo', 1.5, 1.0, 6.0, 1.1, 1.2, 1.0, 'Trabalho administrativo')
ON CONFLICT (tipo_atividade) DO UPDATE SET
    pontos_por_hora = EXCLUDED.pontos_por_hora,
    minimo_horas = EXCLUDED.minimo_horas,
    maximo_horas_dia = EXCLUDED.maximo_horas_dia,
    multiplicador_fim_semana = EXCLUDED.multiplicador_fim_semana,
    multiplicador_feriado = EXCLUDED.multiplicador_feriado,
    multiplicador_noturno = EXCLUDED.multiplicador_noturno,
    descricao = EXCLUDED.descricao,
    updated_at = now();

-- Multiplicadores
INSERT INTO public.config_multiplicadores_2026_01_05_15_00 (tipo, valor, multiplicador, bonus_adicional, descricao) VALUES
('prioridade', 'baixa', 0.8, 0, 'Prioridade baixa'),
('prioridade', 'media', 1.0, 0, 'Prioridade média'),
('prioridade', 'alta', 1.5, 5, 'Prioridade alta'),
('prioridade', 'critica', 2.0, 15, 'Prioridade crítica'),
('complexidade', 'simples', 0.9, 0, 'Atividade simples'),
('complexidade', 'media', 1.0, 0, 'Atividade de complexidade média'),
('complexidade', 'complexa', 1.4, 3, 'Atividade complexa'),
('complexidade', 'muito_complexa', 1.8, 8, 'Atividade muito complexa'),
('urgencia', 'normal', 1.0, 0, 'Situação normal'),
('urgencia', 'urgente', 1.3, 2, 'Situação urgente'),
('urgencia', 'muito_urgente', 1.6, 5, 'Situação muito urgente'),
('duracao', 'curta', 1.0, 0, 'Atividade de curta duração (< 2h)'),
('duracao', 'media', 1.1, 1, 'Atividade de duração média (2-6h)'),
('duracao', 'longa', 1.2, 3, 'Atividade de longa duração (6-12h)'),
('duracao', 'muito_longa', 1.4, 8, 'Atividade muito longa (> 12h)')
ON CONFLICT (tipo, valor) DO UPDATE SET
    multiplicador = EXCLUDED.multiplicador,
    bonus_adicional = EXCLUDED.bonus_adicional,
    descricao = EXCLUDED.descricao,
    updated_at = now();

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.config_pontuacao_funcoes_2026_01_05_15_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_pontuacao_especialidades_2026_01_05_15_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_pontuacao_horas_2026_01_05_15_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_multiplicadores_2026_01_05_15_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_pontos_detalhado_2026_01_05_15_00 ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas
CREATE POLICY "config_pontuacao_funcoes_all" ON public.config_pontuacao_funcoes_2026_01_05_15_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "config_pontuacao_especialidades_all" ON public.config_pontuacao_especialidades_2026_01_05_15_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "config_pontuacao_horas_all" ON public.config_pontuacao_horas_2026_01_05_15_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "config_multiplicadores_all" ON public.config_multiplicadores_2026_01_05_15_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "historico_pontos_detalhado_all" ON public.historico_pontos_detalhado_2026_01_05_15_00 FOR ALL USING (true) WITH CHECK (true);

-- Verificar dados inseridos
SELECT 'Funções' as tabela, COUNT(*) as registros FROM public.config_pontuacao_funcoes_2026_01_05_15_00
UNION ALL
SELECT 'Especialidades' as tabela, COUNT(*) as registros FROM public.config_pontuacao_especialidades_2026_01_05_15_00
UNION ALL
SELECT 'Horas' as tabela, COUNT(*) as registros FROM public.config_pontuacao_horas_2026_01_05_15_00
UNION ALL
SELECT 'Multiplicadores' as tabela, COUNT(*) as registros FROM public.config_multiplicadores_2026_01_05_15_00;