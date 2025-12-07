-- Desabilitar RLS para tabela niveis_formacao
ALTER TABLE IF EXISTS public.niveis_formacao DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir leitura de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir inserção de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir atualização de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir exclusão de níveis de formação" ON public.niveis_formacao;

-- Garantir que a tabela existe
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

-- Função para obter todos os níveis de formação
CREATE OR REPLACE FUNCTION public.get_niveis_formacao_all()
RETURNS TABLE (
  id UUID,
  codigo TEXT,
  nome TEXT,
  descricao TEXT,
  ordem INTEGER,
  tempo_minimo_meses INTEGER,
  missoes_minimas INTEGER,
  competencias JSONB,
  cor TEXT,
  icone TEXT,
  ativo BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nf.id, nf.codigo, nf.nome, nf.descricao, nf.ordem,
    nf.tempo_minimo_meses, nf.missoes_minimas, nf.competencias,
    nf.cor, nf.icone, nf.ativo, nf.created_at, nf.updated_at
  FROM public.niveis_formacao nf
  ORDER BY nf.ordem;
END;
$$;

-- Função para inserir níveis de formação
CREATE OR REPLACE FUNCTION public.insert_nivel_formacao(
  p_codigo TEXT,
  p_nome TEXT,
  p_descricao TEXT DEFAULT NULL,
  p_ordem INTEGER DEFAULT 0,
  p_tempo_minimo_meses INTEGER DEFAULT 0,
  p_missoes_minimas INTEGER DEFAULT 0,
  p_competencias TEXT DEFAULT '[]',
  p_cor TEXT DEFAULT '#3B82F6',
  p_icone TEXT DEFAULT '🎓'
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.niveis_formacao (
    codigo, nome, descricao, ordem, tempo_minimo_meses, 
    missoes_minimas, competencias, cor, icone, ativo
  )
  VALUES (
    UPPER(TRIM(p_codigo)), TRIM(p_nome), TRIM(p_descricao), 
    p_ordem, p_tempo_minimo_meses, p_missoes_minimas, 
    p_competencias::jsonb, p_cor, p_icone, true
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Função para atualizar níveis de formação
CREATE OR REPLACE FUNCTION public.update_nivel_formacao(
  p_id UUID,
  p_codigo TEXT,
  p_nome TEXT,
  p_descricao TEXT DEFAULT NULL,
  p_ordem INTEGER DEFAULT 0,
  p_tempo_minimo_meses INTEGER DEFAULT 0,
  p_missoes_minimas INTEGER DEFAULT 0,
  p_competencias TEXT DEFAULT '[]',
  p_cor TEXT DEFAULT '#3B82F6',
  p_icone TEXT DEFAULT '🎓'
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.niveis_formacao 
  SET 
    codigo = UPPER(TRIM(p_codigo)),
    nome = TRIM(p_nome),
    descricao = TRIM(p_descricao),
    ordem = p_ordem,
    tempo_minimo_meses = p_tempo_minimo_meses,
    missoes_minimas = p_missoes_minimas,
    competencias = p_competencias::jsonb,
    cor = p_cor,
    icone = p_icone,
    updated_at = NOW()
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$;

-- Inserir dados padrão se não existirem
INSERT INTO public.niveis_formacao (codigo, nome, descricao, ordem, tempo_minimo_meses, missoes_minimas, competencias, cor, icone)
VALUES 
    ('FORMA_BASE', 'FORMA BASE', 'Nível inicial de formação básica', 1, 0, 0, '["Cuidados básicos", "Primeiros socorros"]'::jsonb, '#10B981', '🌱'),
    ('FORMA_N1', 'Nível 1', 'Primeiro nível de formação avançada', 2, 6, 10, '["Resgate básico", "Maneio de animais"]'::jsonb, '#3B82F6', '🛡️'),
    ('FORMA_N2', 'Nível 2', 'Segundo nível de formação avançada', 3, 12, 20, '["Resgate avançado", "Liderança"]'::jsonb, '#8B5CF6', '⚔️'),
    ('FORMA_N3', 'Nível 3', 'Nível máximo de formação', 4, 24, 50, '["Formação de formadores", "Gestão"]'::jsonb, '#F59E0B', '👑')
ON CONFLICT (codigo) DO NOTHING;

-- Garantir permissões para as funções
GRANT EXECUTE ON FUNCTION public.get_niveis_formacao_all TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_nivel_formacao TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_nivel_formacao TO authenticated;

-- Garantir permissões na tabela
GRANT ALL ON public.niveis_formacao TO authenticated;
GRANT ALL ON public.niveis_formacao TO anon;

-- Comentários
COMMENT ON FUNCTION public.get_niveis_formacao_all IS 'Função para obter todos os níveis de formação sem RLS';
COMMENT ON FUNCTION public.insert_nivel_formacao IS 'Função para inserir níveis de formação bypassando RLS';
COMMENT ON FUNCTION public.update_nivel_formacao IS 'Função para atualizar níveis de formação bypassando RLS';
