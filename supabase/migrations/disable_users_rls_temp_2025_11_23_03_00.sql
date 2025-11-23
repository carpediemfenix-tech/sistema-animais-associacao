-- Corrigir políticas RLS da tabela users
-- Remover políticas existentes que causam recursão
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_simple" ON public.users;
DROP POLICY IF EXISTS "users_insert_simple" ON public.users;
DROP POLICY IF EXISTS "users_update_simple" ON public.users;
DROP POLICY IF EXISTS "users_delete_simple" ON public.users;

-- Desativar RLS temporariamente para permitir operações
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Comentário: RLS desativado temporariamente para resolver problema de recursão
-- As operações de utilizadores serão controladas pela aplicação