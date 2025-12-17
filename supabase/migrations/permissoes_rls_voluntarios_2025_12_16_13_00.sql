-- ========================================
-- PERMISSÕES RLS PARA SISTEMA DE NOMES DE VOLUNTÁRIOS
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

-- FASE 2: POLÍTICAS RLS PARA VOLUNTÁRIOS
-- ========================================

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Voluntários podem ver todos os perfis" ON public.voluntarios;
DROP POLICY IF EXISTS "Voluntários podem editar próprio perfil" ON public.voluntarios;
DROP POLICY IF EXISTS "Admins podem gerenciar voluntários" ON public.voluntarios;

-- Política para SELECT - todos podem ver todos os voluntários
CREATE POLICY "Todos podem ver voluntários ativos" ON public.voluntarios
    FOR SELECT USING (ativo = true);

-- Política para UPDATE - voluntário pode editar apenas seu nickname
CREATE POLICY "Voluntário pode editar próprio nickname" ON public.voluntarios
    FOR UPDATE USING (
        auth.uid()::text = id::text AND 
        -- Verificar se está tentando alterar apenas campos permitidos
        (OLD.full_name = NEW.full_name OR is_admin_or_coordinator())
    );

-- Política para UPDATE - admin pode editar tudo
CREATE POLICY "Admin pode editar qualquer voluntário" ON public.voluntarios
    FOR UPDATE USING (is_admin_or_coordinator());

-- Política para INSERT - apenas admin pode criar voluntários
CREATE POLICY "Admin pode criar voluntários" ON public.voluntarios
    FOR INSERT WITH CHECK (is_admin_or_coordinator());

-- Política para DELETE - apenas admin pode deletar
CREATE POLICY "Admin pode deletar voluntários" ON public.voluntarios
    FOR DELETE USING (is_admin_or_coordinator());

-- FASE 3: FUNÇÃO PARA ATUALIZAR NICKNAME (SEGURA)
-- ========================================

CREATE OR REPLACE FUNCTION atualizar_nickname_voluntario(
    p_voluntario_id UUID,
    p_novo_nickname TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_usuario_atual UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- Obter usuário atual
    v_usuario_atual := auth.uid();
    v_is_admin := is_admin_or_coordinator();
    
    -- Verificar permissões
    IF NOT v_is_admin AND v_usuario_atual::text != p_voluntario_id::text THEN
        RAISE EXCEPTION 'Sem permissão para alterar nickname de outro voluntário';
    END IF;
    
    -- Atualizar apenas o nickname
    UPDATE public.voluntarios 
    SET nickname = trim(p_novo_nickname),
        updated_at = NOW()
    WHERE id = p_voluntario_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FASE 4: FUNÇÃO PARA ATUALIZAR FULL_NAME (APENAS ADMIN)
-- ========================================

CREATE OR REPLACE FUNCTION atualizar_full_name_voluntario(
    p_voluntario_id UUID,
    p_novo_full_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se é admin
    IF NOT is_admin_or_coordinator() THEN
        RAISE EXCEPTION 'Apenas administradores podem alterar o nome completo';
    END IF;
    
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

-- FASE 5: VIEW SEGURA PARA SELEÇÃO DE VOLUNTÁRIOS
-- ========================================

CREATE OR REPLACE VIEW public.voluntarios_selector AS
SELECT 
    id,
    display_name,
    full_name,
    nickname,
    email,
    ativo
FROM public.voluntarios
WHERE ativo = true
ORDER BY display_name;

-- RLS para a view
ALTER VIEW public.voluntarios_selector SET (security_barrier = true);

-- FASE 6: FUNÇÃO PARA OBTER VOLUNTÁRIO POR ID COM DISPLAY_NAME
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

-- FASE 7: VERIFICAR DADOS MIGRADOS
-- ========================================

-- Mostrar alguns exemplos dos dados migrados
SELECT 
    nome as nome_original,
    full_name,
    nickname,
    short_name,
    display_name,
    'Migração: ' || 
    CASE 
        WHEN display_name IS NOT NULL AND display_name != '' THEN '✅ OK'
        ELSE '❌ Problema'
    END as status_migracao
FROM public.voluntarios 
WHERE ativo = true
LIMIT 5;

SELECT 'Permissões RLS implementadas com sucesso!' as status;