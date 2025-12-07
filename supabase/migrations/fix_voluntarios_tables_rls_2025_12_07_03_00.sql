-- Corrigir políticas RLS para tabelas do sistema de voluntários
-- Criado em: 2025-12-07 03:00 UTC

-- Tabela especializacoes
DROP POLICY IF EXISTS "Permitir leitura de especializações" ON public.especializacoes;
DROP POLICY IF EXISTS "Permitir inserção de especializações" ON public.especializacoes;
DROP POLICY IF EXISTS "Permitir atualização de especializações" ON public.especializacoes;
DROP POLICY IF EXISTS "Permitir exclusão de especializações" ON public.especializacoes;

CREATE POLICY "Permitir leitura de especializações" ON public.especializacoes
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de especializações" ON public.especializacoes
FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de especializações" ON public.especializacoes
FOR UPDATE TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de especializações" ON public.especializacoes
FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

ALTER TABLE public.especializacoes ENABLE ROW LEVEL SECURITY;

-- Tabela voluntario_progressao
DROP POLICY IF EXISTS "Permitir leitura de progressões" ON public.voluntario_progressao;
DROP POLICY IF EXISTS "Permitir inserção de progressões" ON public.voluntario_progressao;
DROP POLICY IF EXISTS "Permitir atualização de progressões" ON public.voluntario_progressao;
DROP POLICY IF EXISTS "Permitir exclusão de progressões" ON public.voluntario_progressao;

CREATE POLICY "Permitir leitura de progressões" ON public.voluntario_progressao
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de progressões" ON public.voluntario_progressao
FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de progressões" ON public.voluntario_progressao
FOR UPDATE TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de progressões" ON public.voluntario_progressao
FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

ALTER TABLE public.voluntario_progressao ENABLE ROW LEVEL SECURITY;

-- Tabela conquistas
DROP POLICY IF EXISTS "Permitir leitura de conquistas" ON public.conquistas;
DROP POLICY IF EXISTS "Permitir inserção de conquistas" ON public.conquistas;
DROP POLICY IF EXISTS "Permitir atualização de conquistas" ON public.conquistas;
DROP POLICY IF EXISTS "Permitir exclusão de conquistas" ON public.conquistas;

CREATE POLICY "Permitir leitura de conquistas" ON public.conquistas
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de conquistas" ON public.conquistas
FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de conquistas" ON public.conquistas
FOR UPDATE TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de conquistas" ON public.conquistas
FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

ALTER TABLE public.conquistas ENABLE ROW LEVEL SECURITY;

-- Tabela voluntario_conquistas
DROP POLICY IF EXISTS "Permitir leitura de conquistas de voluntários" ON public.voluntario_conquistas;
DROP POLICY IF EXISTS "Permitir inserção de conquistas de voluntários" ON public.voluntario_conquistas;
DROP POLICY IF EXISTS "Permitir atualização de conquistas de voluntários" ON public.voluntario_conquistas;
DROP POLICY IF EXISTS "Permitir exclusão de conquistas de voluntários" ON public.voluntario_conquistas;

CREATE POLICY "Permitir leitura de conquistas de voluntários" ON public.voluntario_conquistas
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de conquistas de voluntários" ON public.voluntario_conquistas
FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de conquistas de voluntários" ON public.voluntario_conquistas
FOR UPDATE TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de conquistas de voluntários" ON public.voluntario_conquistas
FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

ALTER TABLE public.voluntario_conquistas ENABLE ROW LEVEL SECURITY;