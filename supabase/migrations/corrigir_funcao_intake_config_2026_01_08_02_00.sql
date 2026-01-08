-- Remover função existente e recriar
DROP FUNCTION IF EXISTS public.get_intake_config_options(text);

-- Função para buscar opções de configuração
CREATE OR REPLACE FUNCTION public.get_intake_config_options(
    p_domain TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    domain VARCHAR(50),
    code VARCHAR(100),
    name VARCHAR(200),
    description TEXT,
    is_active BOOLEAN,
    parent_id UUID,
    sort_order INTEGER,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ico.id,
        ico.domain,
        ico.code,
        ico.name,
        ico.description,
        ico.is_active,
        ico.parent_id,
        ico.sort_order,
        ico.metadata
    FROM public.intake_config_options ico
    WHERE (p_domain IS NULL OR ico.domain = p_domain)
      AND ico.is_active = true
    ORDER BY ico.domain, ico.sort_order, ico.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar função
SELECT 'Função get_intake_config_options corrigida com sucesso' as status;