-- ========================================
-- SISTEMA DE CACHE E OTIMIZAÇÃO DE PERFORMANCE
-- ========================================

-- Tabela para cache de consultas frequentes
CREATE TABLE IF NOT EXISTS public.cache_sistema_2025_12_16_12_30 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave VARCHAR(200) UNIQUE NOT NULL,
    dados JSONB NOT NULL,
    ttl_segundos INTEGER DEFAULT 300, -- 5 minutos padrão
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + INTERVAL '5 minutes') NOT NULL
);

-- Índices para performance do cache
CREATE INDEX IF NOT EXISTS idx_cache_sistema_chave ON public.cache_sistema_2025_12_16_12_30(chave);
CREATE INDEX IF NOT EXISTS idx_cache_sistema_expires ON public.cache_sistema_2025_12_16_12_30(expires_at);

-- Função para obter dados do cache
CREATE OR REPLACE FUNCTION obter_cache(p_chave VARCHAR)
RETURNS JSONB AS $$
DECLARE
    v_dados JSONB;
BEGIN
    SELECT dados INTO v_dados
    FROM public.cache_sistema_2025_12_16_12_30
    WHERE chave = p_chave 
    AND expires_at > NOW();
    
    RETURN v_dados;
END;
$$ LANGUAGE plpgsql;

-- Função para definir cache
CREATE OR REPLACE FUNCTION definir_cache(
    p_chave VARCHAR,
    p_dados JSONB,
    p_ttl_segundos INTEGER DEFAULT 300
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.cache_sistema_2025_12_16_12_30 (chave, dados, ttl_segundos, expires_at)
    VALUES (
        p_chave, 
        p_dados, 
        p_ttl_segundos,
        NOW() + (p_ttl_segundos || ' seconds')::INTERVAL
    )
    ON CONFLICT (chave) DO UPDATE SET
        dados = EXCLUDED.dados,
        ttl_segundos = EXCLUDED.ttl_segundos,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION limpar_cache_expirado()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM public.cache_sistema_2025_12_16_12_30 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- View otimizada para estatísticas de animais (com cache)
CREATE OR REPLACE VIEW public.estatisticas_animais_otimizada AS
SELECT 
    COUNT(*) as total_animais,
    COUNT(*) FILTER (WHERE estado = 'Disponível para Adoção') as disponiveis_adocao,
    COUNT(*) FILTER (WHERE estado = 'Adotado') as adotados,
    COUNT(*) FILTER (WHERE estado = 'Em Tratamento') as em_tratamento,
    COUNT(*) FILTER (WHERE arquivado = false) as ativos,
    COUNT(*) FILTER (WHERE especie = 'Cão') as caes,
    COUNT(*) FILTER (WHERE especie = 'Gato') as gatos,
    AVG(CASE WHEN idade_estimada ~ '^[0-9]+$' THEN idade_estimada::INTEGER ELSE NULL END) as idade_media
FROM public.animais;

-- View otimizada para estatísticas de equipamentos
CREATE OR REPLACE VIEW public.estatisticas_equipamentos_otimizada AS
SELECT 
    COUNT(*) as total_equipamentos,
    COUNT(*) FILTER (WHERE ativo = true) as ativos,
    COUNT(*) FILTER (WHERE ativo = false) as inativos,
    SUM(CASE WHEN valor_aquisicao ~ '^[0-9]+\.?[0-9]*$' THEN valor_aquisicao::NUMERIC ELSE 0 END) as valor_total_inventario,
    COUNT(DISTINCT categoria) as categorias_diferentes,
    COUNT(*) FILTER (WHERE data_validade IS NOT NULL AND data_validade < CURRENT_DATE) as garantias_vencidas
FROM public.equipamentos_2025_12_13_01_00;

-- Função para obter estatísticas gerais (com cache automático)
CREATE OR REPLACE FUNCTION obter_estatisticas_gerais()
RETURNS JSONB AS $$
DECLARE
    v_cache JSONB;
    v_stats JSONB;
BEGIN
    -- Tentar obter do cache primeiro
    v_cache := obter_cache('estatisticas_gerais');
    
    IF v_cache IS NOT NULL THEN
        RETURN v_cache;
    END IF;
    
    -- Se não estiver em cache, calcular
    SELECT jsonb_build_object(
        'animais', (SELECT row_to_json(e) FROM public.estatisticas_animais_otimizada e),
        'equipamentos', (SELECT row_to_json(e) FROM public.estatisticas_equipamentos_otimizada e),
        'voluntarios', (
            SELECT jsonb_build_object(
                'total', COUNT(*),
                'ativos', COUNT(*) FILTER (WHERE ativo = true)
            ) FROM public.voluntarios
        ),
        'ultima_atualizacao', NOW()
    ) INTO v_stats;
    
    -- Armazenar no cache por 5 minutos
    PERFORM definir_cache('estatisticas_gerais', v_stats, 300);
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- RLS para cache (apenas usuários autenticados)
ALTER TABLE public.cache_sistema_2025_12_16_12_30 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cache acessível por usuários autenticados" ON public.cache_sistema_2025_12_16_12_30
    FOR ALL USING (auth.role() = 'authenticated');

SELECT 'Sistema de cache e otimização implementado com sucesso!' as status;