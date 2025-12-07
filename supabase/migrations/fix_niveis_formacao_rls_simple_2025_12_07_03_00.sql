-- Políticas RLS simples para tabela niveis_formacao
-- Criado em: 2025-12-07 03:00 UTC

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Permitir leitura de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir inserção de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir atualização de níveis de formação" ON public.niveis_formacao;
DROP POLICY IF EXISTS "Permitir exclusão de níveis de formação" ON public.niveis_formacao;

-- Política para SELECT (leitura) - usuários autenticados
CREATE POLICY "Permitir leitura de níveis de formação" ON public.niveis_formacao
FOR SELECT 
TO authenticated
USING (true);

-- Política para INSERT (inserção) - usuários autenticados (simplificado)
CREATE POLICY "Permitir inserção de níveis de formação" ON public.niveis_formacao
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE (atualização) - usuários autenticados (simplificado)
CREATE POLICY "Permitir atualização de níveis de formação" ON public.niveis_formacao
FOR UPDATE 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Política para DELETE (exclusão) - usuários autenticados (simplificado)
CREATE POLICY "Permitir exclusão de níveis de formação" ON public.niveis_formacao
FOR DELETE 
TO authenticated
USING (auth.role() = 'authenticated');

-- Verificar se RLS está ativado
ALTER TABLE public.niveis_formacao ENABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON POLICY "Permitir leitura de níveis de formação" ON public.niveis_formacao IS 'Permite que usuários autenticados leiam os níveis de formação';
COMMENT ON POLICY "Permitir inserção de níveis de formação" ON public.niveis_formacao IS 'Permite que usuários autenticados insiram novos níveis de formação';
COMMENT ON POLICY "Permitir atualização de níveis de formação" ON public.niveis_formacao IS 'Permite que usuários autenticados atualizem níveis de formação';
COMMENT ON POLICY "Permitir exclusão de níveis de formação" ON public.niveis_formacao IS 'Permite que usuários autenticados excluam níveis de formação';