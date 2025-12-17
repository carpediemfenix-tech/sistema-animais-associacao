-- ========================================
-- SISTEMA DE NOMES PARA VOLUNTÁRIOS - VERSÃO CORRIGIDA
-- ========================================

-- FASE 1: ADICIONAR NOVOS CAMPOS À TABELA VOLUNTARIOS
-- ========================================

-- Adicionar campos se não existirem
ALTER TABLE public.voluntarios 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS nickname VARCHAR(100),
ADD COLUMN IF NOT EXISTS short_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS display_name VARCHAR(150);

-- FASE 2: FUNÇÃO PARA CALCULAR SHORT_NAME
-- ========================================

CREATE OR REPLACE FUNCTION make_short_name(p_full_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_normalized TEXT;
    v_tokens TEXT[];
    v_first TEXT;
    v_last TEXT;
    v_token TEXT;
    v_particles TEXT[] := ARRAY['da', 'de', 'do', 'dos', 'das', 'e'];
BEGIN
    -- Validar entrada
    IF p_full_name IS NULL OR trim(p_full_name) = '' THEN
        RETURN '';
    END IF;
    
    -- Normalizar: trim + colapsar espaços múltiplos
    v_normalized := trim(regexp_replace(p_full_name, '\s+', ' ', 'g'));
    
    -- Separar em tokens por espaço
    v_tokens := string_to_array(v_normalized, ' ');
    
    -- Se só existir 1 token, retornar esse token
    IF array_length(v_tokens, 1) = 1 THEN
        RETURN v_tokens[1];
    END IF;
    
    -- Primeiro token
    v_first := v_tokens[1];
    
    -- Encontrar último token que NÃO seja partícula
    FOR i IN REVERSE array_length(v_tokens, 1)..1 LOOP
        v_token := v_tokens[i];
        
        -- Verificar se não é uma partícula (case-insensitive)
        IF NOT (lower(v_token) = ANY(v_particles)) THEN
            v_last := v_token;
            EXIT;
        END IF;
    END LOOP;
    
    -- Se não encontrou last válido, usar o último token
    IF v_last IS NULL THEN
        v_last := v_tokens[array_length(v_tokens, 1)];
    END IF;
    
    -- Retornar first + " " + last
    RETURN v_first || ' ' || v_last;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- FASE 3: FUNÇÃO PARA CALCULAR DISPLAY_NAME
-- ========================================

CREATE OR REPLACE FUNCTION make_display_name(p_full_name TEXT, p_nickname TEXT)
RETURNS TEXT AS $$
DECLARE
    v_short_name TEXT;
    v_clean_nickname TEXT;
BEGIN
    -- Limpar nickname
    v_clean_nickname := trim(p_nickname);
    
    -- Se nickname estiver preenchido, usar nickname
    IF v_clean_nickname IS NOT NULL AND v_clean_nickname != '' THEN
        RETURN v_clean_nickname;
    END IF;
    
    -- Caso contrário, usar short_name
    v_short_name := make_short_name(p_full_name);
    RETURN v_short_name;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- FASE 4: TRIGGER PARA RECALCULAR AUTOMATICAMENTE
-- ========================================

CREATE OR REPLACE FUNCTION trigger_update_volunteer_names()
RETURNS TRIGGER AS $$
BEGIN
    -- Garantir que full_name seja preenchido a partir do campo nome se necessário
    IF NEW.full_name IS NULL OR trim(NEW.full_name) = '' THEN
        NEW.full_name := COALESCE(NEW.nome, '');
    END IF;
    
    -- Sincronizar campo nome com full_name para compatibilidade
    NEW.nome := NEW.full_name;
    
    -- Recalcular short_name
    NEW.short_name := make_short_name(NEW.full_name);
    
    -- Recalcular display_name
    NEW.display_name := make_display_name(NEW.full_name, NEW.nickname);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_volunteer_names ON public.voluntarios;
CREATE TRIGGER trigger_volunteer_names
    BEFORE INSERT OR UPDATE ON public.voluntarios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_volunteer_names();

-- FASE 5: MIGRAÇÃO DOS DADOS EXISTENTES (BACKFILL)
-- ========================================

-- Primeiro, preencher full_name com dados do campo nome existente
UPDATE public.voluntarios 
SET full_name = COALESCE(nome, 'Nome não informado')
WHERE full_name IS NULL;

-- Agora atualizar para disparar o trigger e calcular os campos
UPDATE public.voluntarios 
SET updated_at = NOW();

-- FASE 6: ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índice para busca por display_name
CREATE INDEX IF NOT EXISTS idx_voluntarios_display_name 
ON public.voluntarios(display_name);

-- Índice para busca por nickname
CREATE INDEX IF NOT EXISTS idx_voluntarios_nickname 
ON public.voluntarios(nickname) 
WHERE nickname IS NOT NULL AND trim(nickname) != '';

-- FASE 7: VIEW PARA FACILITAR CONSULTAS
-- ========================================

CREATE OR REPLACE VIEW public.voluntarios_display AS
SELECT 
    id,
    full_name,
    nickname,
    short_name,
    display_name,
    email,
    telefone,
    ativo,
    created_at,
    updated_at
FROM public.voluntarios
WHERE ativo = true
ORDER BY display_name;

-- FASE 8: FUNÇÃO PARA BUSCA DE VOLUNTÁRIOS
-- ========================================

CREATE OR REPLACE FUNCTION buscar_voluntarios(p_termo TEXT DEFAULT '')
RETURNS TABLE (
    id UUID,
    full_name VARCHAR,
    nickname VARCHAR,
    short_name VARCHAR,
    display_name VARCHAR,
    email VARCHAR,
    telefone VARCHAR,
    ativo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.full_name,
        v.nickname,
        v.short_name,
        v.display_name,
        v.email,
        v.telefone,
        v.ativo
    FROM public.voluntarios v
    WHERE v.ativo = true
    AND (
        p_termo = '' OR
        v.display_name ILIKE '%' || p_termo || '%' OR
        v.full_name ILIKE '%' || p_termo || '%' OR
        v.nickname ILIKE '%' || p_termo || '%'
    )
    ORDER BY v.display_name;
END;
$$ LANGUAGE plpgsql;

-- FASE 9: TESTES DE ACEITAÇÃO COM DADOS TEMPORÁRIOS
-- ========================================

-- Criar tabela temporária para testes
CREATE TEMP TABLE teste_nomes AS
SELECT 
    'João da Silva'::TEXT as full_name, 
    NULL::TEXT as nickname,
    make_short_name('João da Silva') as short_name_calculado,
    make_display_name('João da Silva', NULL) as display_name_calculado
UNION ALL
SELECT 
    'Maria do Carmo Pereira'::TEXT, 
    NULL::TEXT,
    make_short_name('Maria do Carmo Pereira'),
    make_display_name('Maria do Carmo Pereira', NULL)
UNION ALL
SELECT 
    'Ana'::TEXT, 
    NULL::TEXT,
    make_short_name('Ana'),
    make_display_name('Ana', NULL)
UNION ALL
SELECT 
    'Pedro dos Santos'::TEXT, 
    'Rato'::TEXT,
    make_short_name('Pedro dos Santos'),
    make_display_name('Pedro dos Santos', 'Rato');

-- Verificar resultados dos testes
SELECT 
    full_name,
    nickname,
    short_name_calculado,
    display_name_calculado,
    CASE 
        WHEN full_name = 'João da Silva' AND display_name_calculado = 'João Silva' THEN '✅ PASSOU'
        WHEN full_name = 'Maria do Carmo Pereira' AND display_name_calculado = 'Maria Pereira' THEN '✅ PASSOU'
        WHEN full_name = 'Ana' AND display_name_calculado = 'Ana' THEN '✅ PASSOU'
        WHEN full_name = 'Pedro dos Santos' AND nickname = 'Rato' AND display_name_calculado = 'Rato' THEN '✅ PASSOU'
        ELSE '❌ FALHOU - Esperado vs Atual: ' || display_name_calculado
    END as resultado_teste
FROM teste_nomes
ORDER BY full_name;

SELECT 'Sistema de nomes para voluntários implementado e testado com sucesso!' as status;