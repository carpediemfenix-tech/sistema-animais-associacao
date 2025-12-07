-- Corrigir tabela niveis_formacao com tipo correto para competencias
-- Criado em: 2025-12-07 03:00 UTC

-- Desabilitar RLS temporariamente
ALTER TABLE IF EXISTS public.niveis_formacao DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir inserção de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir atualização de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir exclusão de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.niveis_formacao;

-- Verificar se a tabela existe, se não, criar com tipos corretos
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

-- Inserir dados padrão se não existirem (usando JSONB para competencias)
INSERT INTO public.niveis_formacao (codigo, nome, descricao, ordem, tempo_minimo_meses, missoes_minimas, competencias, cor, icone)
VALUES 
    ('FORMA_BASE', 'FORMA BASE', 'Nível inicial de formação básica', 1, 0, 0, '["Cuidados básicos", "Primeiros socorros"]'::jsonb, '#10B981', '🌱'),
    ('FORMA_N1', 'Nível 1', 'Primeiro nível de formação avançada', 2, 6, 10, '["Resgate básico", "Maneio de animais"]'::jsonb, '#3B82F6', '🛡️'),
    ('FORMA_N2', 'Nível 2', 'Segundo nível de formação avançada', 3, 12, 20, '["Resgate avançado", "Liderança"]'::jsonb, '#8B5CF6', '⚔️'),
    ('FORMA_N3', 'Nível 3', 'Nível máximo de formação', 4, 24, 50, '["Formação de formadores", "Gestão"]'::jsonb, '#F59E0B', '👑')
ON CONFLICT (codigo) DO NOTHING;

-- Criar política RLS MUITO PERMISSIVA
CREATE POLICY "Allow all operations for authenticated users" ON public.niveis_formacao
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Habilitar RLS
ALTER TABLE public.niveis_formacao ENABLE ROW LEVEL SECURITY;

-- Garantir permissões
GRANT ALL ON public.niveis_formacao TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Comentários
COMMENT ON TABLE public.niveis_formacao IS 'Tabela de níveis de formação do sistema Valentão com políticas permissivas';
COMMENT ON POLICY "Allow all operations for authenticated users" ON public.niveis_formacao IS 'Política permissiva para todos os usuários autenticados';