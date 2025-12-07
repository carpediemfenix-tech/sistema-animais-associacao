-- Função para inserir níveis de formação bypassando RLS
CREATE OR REPLACE FUNCTION public.insert_nivel_formacao(
  p_codigo TEXT,
  p_nome TEXT,
  p_descricao TEXT DEFAULT NULL,
  p_ordem INTEGER DEFAULT 0,
  p_tempo_minimo_meses INTEGER DEFAULT 0,
  p_missoes_minimas INTEGER DEFAULT 0,
  p_competencias JSONB DEFAULT '[]'::jsonb,
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
  -- Inserir o novo nível de formação
  INSERT INTO public.niveis_formacao (
    codigo, nome, descricao, ordem, tempo_minimo_meses, 
    missoes_minimas, competencias, cor, icone, ativo
  )
  VALUES (
    UPPER(TRIM(p_codigo)), TRIM(p_nome), TRIM(p_descricao), 
    p_ordem, p_tempo_minimo_meses, p_missoes_minimas, 
    p_competencias, p_cor, p_icone, true
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
  p_competencias JSONB DEFAULT '[]'::jsonb,
  p_cor TEXT DEFAULT '#3B82F6',
  p_icone TEXT DEFAULT '🎓'
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar o nível de formação
  UPDATE public.niveis_formacao 
  SET 
    codigo = UPPER(TRIM(p_codigo)),
    nome = TRIM(p_nome),
    descricao = TRIM(p_descricao),
    ordem = p_ordem,
    tempo_minimo_meses = p_tempo_minimo_meses,
    missoes_minimas = p_missoes_minimas,
    competencias = p_competencias,
    cor = p_cor,
    icone = p_icone,
    updated_at = NOW()
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$;

-- Garantir permissões para as funções
GRANT EXECUTE ON FUNCTION public.insert_nivel_formacao TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_nivel_formacao TO authenticated;
