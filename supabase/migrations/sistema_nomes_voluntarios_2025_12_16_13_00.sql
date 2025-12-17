-- ========================================
-- SISTEMA DE NOMES PARA VOLUNTÁRIOS - IMPLEMENTAÇÃO COMPLETA
-- ========================================

-- FASE 1: ADICIONAR NOVOS CAMPOS À TABELA VOLUNTARIOS
-- ========================================

-- Adicionar campos se não existirem
ALTER TABLE public.voluntarios 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS nickname VARCHAR(100),
ADD COLUMN IF NOT EXISTS short_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS display_name VARCHAR(150);

-- Migrar dados existentes do campo 'nome' para 'full_name' se necessário
UPDATE public.voluntarios 
SET full_name = nome 
WHERE full_name IS NULL AND nome IS NOT NULL;

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
    -- Recalcular short_name se full_name mudou
    IF TG_OP = 'INSERT' OR OLD.full_name IS DISTINCT FROM NEW.full_name THEN
        NEW.short_name := make_short_name(NEW.full_name);
    END IF;
    
    -- Recalcular display_name se full_name ou nickname mudaram
    IF TG_OP = 'INSERT' OR 
       OLD.full_name IS DISTINCT FROM NEW.full_name OR 
       OLD.nickname IS DISTINCT FROM NEW.nickname THEN
        NEW.display_name := make_display_name(NEW.full_name, NEW.nickname);
    END IF;
    
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

-- Atualizar todos os registros existentes para disparar o trigger
UPDATE public.voluntarios 
SET full_name = COALESCE(full_name, nome, ''),
    nickname = COALESCE(nickname, ''),
    updated_at = NOW()
WHERE full_name IS NULL OR short_name IS NULL OR display_name IS NULL;

-- FASE 6: CONSTRAINTS E VALIDAÇÕES
-- ========================================

-- full_name é obrigatório
ALTER TABLE public.voluntarios 
ALTER COLUMN full_name SET NOT NULL;

-- Adicionar constraint para garantir que full_name não seja vazio
ALTER TABLE public.voluntarios 
ADD CONSTRAINT check_full_name_not_empty 
CHECK (trim(full_name) != '');

-- FASE 7: ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índice para busca por display_name
CREATE INDEX IF NOT EXISTS idx_voluntarios_display_name 
ON public.voluntarios(display_name);

-- Índice para busca por nickname
CREATE INDEX IF NOT EXISTS idx_voluntarios_nickname 
ON public.voluntarios(nickname) 
WHERE nickname IS NOT NULL AND trim(nickname) != '';

-- Índice composto para busca
CREATE INDEX IF NOT EXISTS idx_voluntarios_search 
ON public.voluntarios(display_name, full_name, nickname);

-- FASE 8: VIEW PARA FACILITAR CONSULTAS
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
    updated_at,
    -- Campos adicionais para busca
    full_name || ' ' || COALESCE(nickname, '') || ' ' || display_name as search_text
FROM public.voluntarios
WHERE ativo = true
ORDER BY display_name;

-- FASE 9: FUNÇÃO PARA BUSCA DE VOLUNTÁRIOS
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

-- FASE 10: TESTES DE ACEITAÇÃO
-- ========================================

-- Inserir dados de teste para validar as regras
INSERT INTO public.voluntarios (full_name, nickname, email, ativo) VALUES
('João da Silva', NULL, 'joao.teste@email.com', true),
('Maria do Carmo Pereira', NULL, 'maria.teste@email.com', true),
('Ana', NULL, 'ana.teste@email.com', true),
('Pedro dos Santos', 'Rato', 'pedro.teste@email.com', true)
ON CONFLICT (email) DO NOTHING;

-- Verificar resultados dos testes
SELECT 
    full_name,
    nickname,
    short_name,
    display_name,
    'Teste: ' || 
    CASE 
        WHEN full_name = 'João da Silva' AND display_name = 'João Silva' THEN '✅ PASSOU'
        WHEN full_name = 'Maria do Carmo Pereira' AND display_name = 'Maria Pereira' THEN '✅ PASSOU'
        WHEN full_name = 'Ana' AND display_name = 'Ana' THEN '✅ PASSOU'
        WHEN full_name = 'Pedro dos Santos' AND nickname = 'Rato' AND display_name = 'Rato' THEN '✅ PASSOU'
        ELSE '❌ FALHOU'
    END as resultado_teste
FROM public.voluntarios 
WHERE email LIKE '%.teste@email.com'
ORDER BY full_name;

SELECT 'Sistema de nomes para voluntários implementado com sucesso!' as status;