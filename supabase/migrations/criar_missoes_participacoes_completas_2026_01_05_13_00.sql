-- Criar tabela de missões se não existir
CREATE TABLE IF NOT EXISTS public.missoes_2025_12_18_14_15 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativa', 'concluida', 'cancelada')),
    prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
    local_principal TEXT,
    orcamento_previsto DECIMAL(10,2),
    responsavel_id UUID REFERENCES public.voluntarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de participações se não existir
CREATE TABLE IF NOT EXISTS public.participacoes_missoes_2025_12_29_07_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    missao_id UUID REFERENCES public.missoes_2025_12_18_14_15(id) ON DELETE CASCADE,
    voluntario_id UUID REFERENCES public.voluntarios(id) ON DELETE CASCADE,
    funcao TEXT NOT NULL,
    data_participacao DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(missao_id, voluntario_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.missoes_2025_12_18_14_15 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para missões
CREATE POLICY IF NOT EXISTS "Permitir leitura de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Permitir inserção de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Permitir atualização de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas RLS para participações
CREATE POLICY IF NOT EXISTS "Permitir leitura de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Permitir inserção de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Permitir atualização de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Inserir dados de exemplo para missões
INSERT INTO public.missoes_2025_12_18_14_15 (titulo, descricao, data_inicio, data_fim, status, prioridade, local_principal, orcamento_previsto, responsavel_id)
SELECT 
    'Missão de Resgate - ' || EXTRACT(MONTH FROM CURRENT_DATE) || '/' || EXTRACT(YEAR FROM CURRENT_DATE),
    'Operação de resgate e cuidados veterinários para animais em situação de risco',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE - INTERVAL '10 days',
    'concluida',
    'alta',
    'Centro da Cidade',
    500.00,
    v.id
FROM public.voluntarios v
WHERE v.ativo = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.missoes_2025_12_18_14_15 (titulo, descricao, data_inicio, status, prioridade, local_principal, orcamento_previsto, responsavel_id)
SELECT 
    'Campanha de Vacinação',
    'Campanha de vacinação antirrábica para animais da comunidade',
    CURRENT_DATE + INTERVAL '5 days',
    'ativa',
    'media',
    'Parque Municipal',
    300.00,
    v.id
FROM public.voluntarios v
WHERE v.ativo = true
LIMIT 1
ON CONFLICT DO NOTHING;

-- Inserir participações de exemplo
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    v.id as voluntario_id,
    'Coordenador' as funcao,
    m.data_inicio as data_participacao,
    'Responsável pela coordenação geral da missão' as observacoes
FROM public.missoes_2025_12_18_14_15 m
CROSS JOIN public.voluntarios v
WHERE v.ativo = true
LIMIT 3
ON CONFLICT (missao_id, voluntario_id) DO NOTHING;

INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    v.id as voluntario_id,
    'Voluntário' as funcao,
    m.data_inicio as data_participacao,
    'Apoio nas atividades de campo' as observacoes
FROM public.missoes_2025_12_18_14_15 m
CROSS JOIN public.voluntarios v
WHERE v.ativo = true
AND v.id != m.responsavel_id
LIMIT 5
ON CONFLICT (missao_id, voluntario_id) DO NOTHING;