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

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir leitura de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15;
DROP POLICY IF EXISTS "Permitir inserção de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15;
DROP POLICY IF EXISTS "Permitir atualização de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15;

DROP POLICY IF EXISTS "Permitir leitura de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00;
DROP POLICY IF EXISTS "Permitir inserção de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00;
DROP POLICY IF EXISTS "Permitir atualização de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00;

-- Criar políticas RLS para missões
CREATE POLICY "Permitir leitura de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Criar políticas RLS para participações
CREATE POLICY "Permitir leitura de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00
    FOR UPDATE USING (auth.role() = 'authenticated');