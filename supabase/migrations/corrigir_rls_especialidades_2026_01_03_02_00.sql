-- Verificar se as tabelas existem
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%especialidades%'
ORDER BY table_name;

-- Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE '%especialidades%';

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Acesso total especialidades_voluntarios" ON public.especialidades_voluntarios_2025_12_21_22_00;
DROP POLICY IF EXISTS "Acesso total voluntario_especialidades" ON public.voluntario_especialidades_2025_12_21_22_00;
DROP POLICY IF EXISTS "Especialidades visíveis para autenticados" ON public.especialidades_voluntarios_2025_12_21_22_00;
DROP POLICY IF EXISTS "Voluntário especialidades visíveis para autenticados" ON public.voluntario_especialidades_2025_12_21_22_00;

-- Criar políticas RLS permissivas para desenvolvimento
CREATE POLICY "Acesso completo especialidades" ON public.especialidades_voluntarios_2025_12_21_22_00
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso completo voluntario especialidades" ON public.voluntario_especialidades_2025_12_21_22_00
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar se há dados nas tabelas
SELECT 'especialidades_voluntarios' as tabela, count(*) as total_registos 
FROM public.especialidades_voluntarios_2025_12_21_22_00
UNION ALL
SELECT 'voluntario_especialidades' as tabela, count(*) as total_registos 
FROM public.voluntario_especialidades_2025_12_21_22_00;