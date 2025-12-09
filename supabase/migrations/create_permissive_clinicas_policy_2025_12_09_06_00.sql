-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.clinicas_veterinarias;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.clinicas_veterinarias;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.clinicas_veterinarias;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.clinicas_veterinarias;

-- Criar uma política única e muito permissiva para todos os usuários autenticados
CREATE POLICY "Allow all for authenticated users" ON public.clinicas_veterinarias
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'clinicas_veterinarias';

-- Testar acesso direto
SELECT COUNT(*) as total_clinicas FROM public.clinicas_veterinarias;