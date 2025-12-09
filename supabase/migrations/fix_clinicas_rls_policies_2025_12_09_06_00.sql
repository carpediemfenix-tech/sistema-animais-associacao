-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'clinicas_veterinarias';

-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON public.clinicas_veterinarias;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON public.clinicas_veterinarias;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON public.clinicas_veterinarias;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON public.clinicas_veterinarias;

-- Criar políticas RLS mais permissivas
CREATE POLICY "Enable read access for authenticated users" ON public.clinicas_veterinarias
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.clinicas_veterinarias
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.clinicas_veterinarias
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.clinicas_veterinarias
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'clinicas_veterinarias';

-- Garantir que a tabela tem as permissões corretas
GRANT ALL ON public.clinicas_veterinarias TO authenticated;
GRANT ALL ON public.clinicas_veterinarias TO anon;