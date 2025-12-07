-- Corrigir políticas RLS para tabela niveis_formacao
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

-- Política para INSERT (inserção) - apenas administradores
CREATE POLICY "Permitir inserção de níveis de formação" ON public.niveis_formacao
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.utilizadores 
    WHERE utilizadores.id = auth.uid() 
    AND utilizadores.role = 'admin'
  )
);

-- Política para UPDATE (atualização) - apenas administradores
CREATE POLICY "Permitir atualização de níveis de formação" ON public.niveis_formacao
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.utilizadores 
    WHERE utilizadores.id = auth.uid() 
    AND utilizadores.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.utilizadores 
    WHERE utilizadores.id = auth.uid() 
    AND utilizadores.role = 'admin'
  )
);

-- Política para DELETE (exclusão) - apenas administradores
CREATE POLICY "Permitir exclusão de níveis de formação" ON public.niveis_formacao
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.utilizadores 
    WHERE utilizadores.id = auth.uid() 
    AND utilizadores.role = 'admin'
  )
);

-- Verificar se RLS está ativado
ALTER TABLE public.niveis_formacao ENABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON POLICY "Permitir leitura de níveis de formação" ON public.niveis_formacao IS 'Permite que usuários autenticados leiam os níveis de formação';
COMMENT ON POLICY "Permitir inserção de níveis de formação" ON public.niveis_formacao IS 'Permite que apenas administradores insiram novos níveis de formação';
COMMENT ON POLICY "Permitir atualização de níveis de formação" ON public.niveis_formacao IS 'Permite que apenas administradores atualizem níveis de formação';
COMMENT ON POLICY "Permitir exclusão de níveis de formação" ON public.niveis_formacao IS 'Permite que apenas administradores excluam níveis de formação';