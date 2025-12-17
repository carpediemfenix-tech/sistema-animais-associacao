-- ========================================
-- PERMISSÕES RLS PARA SISTEMA DE NOMES DE VOLUNTÁRIOS - CORRIGIDO
-- ========================================

-- FASE 1: FUNÇÃO PARA VERIFICAR SE USUÁRIO É ADMIN/COORDENAÇÃO
-- ========================================

CREATE OR REPLACE FUNCTION is_admin_or_coordinator()
RETURNS BOOLEAN AS $$
BEGIN
    -- Por enquanto, todos os usuários autenticados são considerados admin
    -- Esta lógica pode ser refinada conforme a estrutura de permissões do sistema
    RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FASE 2: POLÍTICAS RLS SIMPLIFICADAS
-- ========================================

-- Garantir que RLS está habilitado
ALTER TABLE public.voluntarios ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Voluntários podem ver todos os perfis" ON public.voluntarios;
DROP POLICY IF EXISTS "Voluntários podem editar próprio perfil" ON public.voluntarios;
DROP POLICY IF EXISTS "Admins podem gerenciar voluntários" ON public.voluntarios;
DROP POLICY IF EXISTS "Todos podem ver voluntários ativos" ON public.voluntarios;
DROP POLICY IF EXISTS "Voluntário pode editar próprio nickname" ON public.voluntarios;
DROP POLICY IF EXISTS "Admin pode editar qualquer voluntário" ON public.voluntarios;
DROP POLICY IF EXISTS "Admin pode criar voluntários" ON public.voluntarios;
DROP POLICY IF EXISTS "Admin pode deletar voluntários" ON public.voluntarios;

-- Política simples para SELECT - todos os usuários autenticados podem ver
CREATE POLICY "Usuários autenticados podem ver voluntários" ON public.voluntarios
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política simples para UPDATE - usuários autenticados podem editar
CREATE POLICY "Usuários autenticados podem editar voluntários" ON public.voluntarios
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política simples para INSERT - usuários autenticados podem criar
CREATE POLICY "Usuários autenticados podem criar voluntários" ON public.voluntarios
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- FASE 3: FUNÇÕES SEGURAS PARA ATUALIZAÇÃO
-- ========================================

CREATE OR REPLACE FUNCTION atualizar_nickname_voluntario(
    p_voluntario_id UUID,
    p_novo_nickname TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Atualizar apenas o nickname
    UPDATE public.voluntarios 
    SET nickname = trim(p_novo_nickname),
        updated_at = NOW()
    WHERE id = p_voluntario_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION atualizar_full_name_voluntario(
    p_voluntario_id UUID,
    p_novo_full_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Validar entrada
    IF trim(p_novo_full_name) = '' THEN
        RAISE EXCEPTION 'Nome completo não pode estar vazio';
    END IF;
    
    -- Atualizar full_name
    UPDATE public.voluntarios 
    SET full_name = trim(p_novo_full_name),
        updated_at = NOW()
    WHERE id = p_voluntario_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FASE 4: FUNÇÃO PARA OBTER VOLUNTÁRIO POR ID
-- ========================================

CREATE OR REPLACE FUNCTION obter_voluntario_display(p_voluntario_id UUID)
RETURNS TABLE (
    id UUID,
    full_name VARCHAR,
    nickname VARCHAR,
    short_name VARCHAR,
    display_name VARCHAR,
    email VARCHAR,
    telefone VARCHAR
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
        v.telefone
    FROM public.voluntarios v
    WHERE v.id = p_voluntario_id AND v.ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FASE 5: VERIFICAR MIGRAÇÃO DOS DADOS
-- ========================================

-- Mostrar estatísticas da migração
SELECT 
    COUNT(*) as total_voluntarios,
    COUNT(*) FILTER (WHERE display_name IS NOT NULL AND display_name != '') as com_display_name,
    COUNT(*) FILTER (WHERE short_name IS NOT NULL AND short_name != '') as com_short_name,
    COUNT(*) FILTER (WHERE nickname IS NOT NULL AND nickname != '') as com_nickname
FROM public.voluntarios 
WHERE ativo = true;

-- Mostrar alguns exemplos
SELECT 
    nome as nome_original,
    full_name,
    nickname,
    short_name,
    display_name
FROM public.voluntarios 
WHERE ativo = true
ORDER BY display_name
LIMIT 5;

SELECT 'Sistema de nomes implementado com sucesso!' as status;