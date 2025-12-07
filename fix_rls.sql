-- Desabilitar RLS completamente para tabela niveis_formacao
-- Criado em: 2025-12-07 03:00 UTC

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir leitura de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir inserção de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir atualização de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir exclusão de níveis de formação" ON public.niveis_formacao;

-- DESABILITAR RLS COMPLETAMENTE
ALTER TABLE public.niveis_formacao DISABLE ROW LEVEL SECURITY;

-- Garantir permissões máximas
GRANT ALL PRIVILEGES ON public.niveis_formacao TO authenticated;
GRANT ALL PRIVILEGES ON public.niveis_formacao TO anon;

-- Verificar se a tabela existe e tem a estrutura correta
CREATE TABLE IF NOT EXISTS public.niveis_formacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL DEFAULT 0,
    tempo_minimo_meses INTEGER DEFAULT 0,
    missoes_minimas INTEGER DEFAULT 0,
    competencias JSONB DEFAULT '[]'::jsonb,
    cor TEXT DEFAULT '#3B82F6',
    icone TEXT DEFAULT '🎓',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados padrão se não existirem
INSERT INTO public.niveis_formacao (codigo, nome, descricao, ordem, tempo_minimo_meses, missoes_minimas, competencias, cor, icone)
VALUES 
    ('FORMA_BASE', 'FORMA BASE', 'Nível inicial de formação básica', 1, 0, 0, '["Cuidados básicos", "Primeiros socorros"]'::jsonb, '#10B981', '🌱'),
    ('FORMA_N1', 'Nível 1', 'Primeiro nível de formação avançada', 2, 6, 10, '["Resgate básico", "Maneio de animais"]'::jsonb, '#3B82F6', '🛡️'),
    ('FORMA_N2', 'Nível 2', 'Segundo nível de formação avançada', 3, 12, 20, '["Resgate avançado", "Liderança"]'::jsonb, '#8B5CF6', '⚔️'),
    ('FORMA_N3', 'Nível 3', 'Nível máximo de formação', 4, 24, 50, '["Formação de formadores", "Gestão"]'::jsonb, '#F59E0B', '👑')
ON CONFLICT (codigo) DO NOTHING;

-- Comentários
COMMENT ON TABLE public.niveis_formacao IS 'Tabela de níveis de formação - RLS DESABILITADO para resolver problemas de acesso';
