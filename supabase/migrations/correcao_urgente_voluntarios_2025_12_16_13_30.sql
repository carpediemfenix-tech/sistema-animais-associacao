-- ========================================
-- CORREÇÃO URGENTE - FUNÇÃO BUSCAR_VOLUNTARIOS
-- ========================================

-- Corrigir função buscar_voluntarios com tipos TEXT
CREATE OR REPLACE FUNCTION buscar_voluntarios(p_termo TEXT DEFAULT '')
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    nickname TEXT,
    short_name TEXT,
    display_name TEXT,
    email TEXT,
    telefone TEXT,
    ativo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        COALESCE(v.full_name, '')::TEXT,
        COALESCE(v.nickname, '')::TEXT,
        COALESCE(v.short_name, '')::TEXT,
        COALESCE(v.display_name, '')::TEXT,
        COALESCE(v.email, '')::TEXT,
        COALESCE(v.telefone, '')::TEXT,
        v.ativo
    FROM public.voluntarios v
    WHERE v.ativo = true
    AND (
        p_termo = '' OR
        COALESCE(v.display_name, '') ILIKE '%' || p_termo || '%' OR
        COALESCE(v.full_name, '') ILIKE '%' || p_termo || '%' OR
        COALESCE(v.nickname, '') ILIKE '%' || p_termo || '%'
    )
    ORDER BY COALESCE(v.display_name, v.nome, '');
END;
$$ LANGUAGE plpgsql;

-- Corrigir função obter_voluntario_display
CREATE OR REPLACE FUNCTION obter_voluntario_display(p_voluntario_id UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    nickname TEXT,
    short_name TEXT,
    display_name TEXT,
    email TEXT,
    telefone TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        COALESCE(v.full_name, '')::TEXT,
        COALESCE(v.nickname, '')::TEXT,
        COALESCE(v.short_name, '')::TEXT,
        COALESCE(v.display_name, '')::TEXT,
        COALESCE(v.email, '')::TEXT,
        COALESCE(v.telefone, '')::TEXT
    FROM public.voluntarios v
    WHERE v.id = p_voluntario_id AND v.ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Testar as funções
SELECT COUNT(*) as total_voluntarios FROM buscar_voluntarios('');

SELECT 'Funções de voluntários corrigidas com sucesso!' as status;