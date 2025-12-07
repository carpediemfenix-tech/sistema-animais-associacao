-- Verificar e recriar tabela niveis_formacao com políticas RLS mais permissivas
-- Criado em: 2025-12-07 03:00 UTC

-- Primeiro, desabilitar RLS temporariamente para verificar se a tabela existe
ALTER TABLE IF EXISTS public.niveis_formacao DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir inserção de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir atualização de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir exclusão de níveis de formação" ON public.niveis_formacao;

-- Verificar se a tabela existe, se não, criar
CREATE TABLE IF NOT EXISTS public.niveis_formacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL DEFAULT 0,
    tempo_minimo_meses INTEGER DEFAULT 0,
    missoes_minimas INTEGER DEFAULT 0,
    competencias TEXT[],
    cor TEXT DEFAULT '#3B82F6',
    icone TEXT DEFAULT '🎓',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_niveis_formacao_updated_at ON public.niveis_formacao;
CREATE TRIGGER update_niveis_formacao_updated_at
    BEFORE UPDATE ON public.niveis_formacao
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados padrão se não existirem
INSERT INTO public.niveis_formacao (codigo, nome, descricao, ordem, tempo_minimo_meses, missoes_minimas, competencias, cor, icone)
VALUES 
    ('FORMA_BASE', 'FORMA BASE', 'Nível inicial de formação básica', 1, 0, 0, ARRAY['Cuidados básicos', 'Primeiros socorros'], '#10B981', '🌱'),
    ('FORMA_N1', 'Nível 1', 'Primeiro nível de formação avançada', 2, 6, 10, ARRAY['Resgate básico', 'Maneio de animais'], '#3B82F6', '🛡️'),
    ('FORMA_N2', 'Nível 2', 'Segundo nível de formação avançada', 3, 12, 20, ARRAY['Resgate avançado', 'Liderança'], '#8B5CF6', '⚔️'),
    ('FORMA_N3', 'Nível 3', 'Nível máximo de formação', 4, 24, 50, ARRAY['Formação de formadores', 'Gestão'], '#F59E0B', '👑')
ON CONFLICT (codigo) DO NOTHING;

-- Criar políticas RLS MUITO PERMISSIVAS
CREATE POLICY "Allow all for authenticated users" ON public.niveis_formacao
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Habilitar RLS
ALTER TABLE public.niveis_formacao ENABLE ROW LEVEL SECURITY;

-- Garantir que a tabela é acessível
GRANT ALL ON public.niveis_formacao TO authenticated;
GRANT ALL ON public.niveis_formacao TO anon;

-- Comentários
COMMENT ON TABLE public.niveis_formacao IS 'Tabela de níveis de formação do sistema Valentão';
COMMENT ON POLICY "Allow all for authenticated users" ON public.niveis_formacao IS 'Política muito permissiva para resolver problemas de acesso';