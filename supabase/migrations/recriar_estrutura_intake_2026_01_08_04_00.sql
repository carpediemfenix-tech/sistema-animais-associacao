-- Remover função existente
DROP FUNCTION IF EXISTS public.get_intake_config_options(text);

-- Criar tabela de configurações da ficha de admissão
CREATE TABLE IF NOT EXISTS public.intake_config_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES public.intake_config_options(id),
    metadata JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain, code)
);

-- Criar função para buscar opções
CREATE OR REPLACE FUNCTION public.get_intake_config_options(domain_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    domain VARCHAR(100),
    code VARCHAR(100),
    name VARCHAR(200),
    is_active BOOLEAN,
    parent_id UUID,
    metadata JSONB,
    sort_order INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF domain_filter IS NULL THEN
        RETURN QUERY
        SELECT ico.id, ico.domain, ico.code, ico.name, ico.is_active, 
               ico.parent_id, ico.metadata, ico.sort_order
        FROM public.intake_config_options ico
        WHERE ico.is_active = true
        ORDER BY ico.domain, ico.sort_order, ico.name;
    ELSE
        RETURN QUERY
        SELECT ico.id, ico.domain, ico.code, ico.name, ico.is_active, 
               ico.parent_id, ico.metadata, ico.sort_order
        FROM public.intake_config_options ico
        WHERE ico.domain = domain_filter AND ico.is_active = true
        ORDER BY ico.sort_order, ico.name;
    END IF;
END;
$$;

-- Verificar se a tabela foi criada
SELECT 'Estrutura criada com sucesso' as status;