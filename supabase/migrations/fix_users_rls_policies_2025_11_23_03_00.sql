-- Corrigir políticas RLS da tabela users
-- Remover políticas existentes que causam recursão
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- Criar políticas simples sem recursão
-- Política para SELECT: apenas administradores podem ver utilizadores
CREATE POLICY "users_select_simple" ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid()::text 
    AND u.perfil_acesso = 'administrador'
    AND u.ativo = true
  )
);

-- Política para INSERT: apenas administradores podem criar utilizadores
CREATE POLICY "users_insert_simple" ON public.users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid()::text 
    AND u.perfil_acesso = 'administrador'
    AND u.ativo = true
  )
);

-- Política para UPDATE: apenas administradores podem atualizar utilizadores
CREATE POLICY "users_update_simple" ON public.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid()::text 
    AND u.perfil_acesso = 'administrador'
    AND u.ativo = true
  )
);

-- Política para DELETE: apenas administradores podem eliminar utilizadores
CREATE POLICY "users_delete_simple" ON public.users
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid()::text 
    AND u.perfil_acesso = 'administrador'
    AND u.ativo = true
  )
);

-- Garantir que RLS está ativo
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;