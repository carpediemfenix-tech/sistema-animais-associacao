-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Permitir leitura de movimentos financeiros" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Permitir inserção de movimentos financeiros" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Permitir atualização de movimentos financeiros" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Permitir eliminação de movimentos financeiros" ON public.movimentos_financeiros;

-- Criar políticas RLS mais permissivas para usuários autenticados
-- Policy para SELECT (leitura)
CREATE POLICY "Enable read access for authenticated users" ON public.movimentos_financeiros
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy para INSERT (inserção)
CREATE POLICY "Enable insert access for authenticated users" ON public.movimentos_financeiros
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy para UPDATE (atualização)
CREATE POLICY "Enable update access for authenticated users" ON public.movimentos_financeiros
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy para DELETE (eliminação)
CREATE POLICY "Enable delete access for authenticated users" ON public.movimentos_financeiros
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Verificar se RLS está ativo
ALTER TABLE public.movimentos_financeiros ENABLE ROW LEVEL SECURITY;

-- Inserir mais alguns dados de exemplo para diferentes animais
INSERT INTO public.movimentos_financeiros (animal_id, categoria_id, tipo, descricao, valor, data_movimento, observacoes)
SELECT 
    a.id,
    cf.id,
    CASE WHEN random() > 0.5 THEN 'receita' ELSE 'despesa' END,
    CASE 
        WHEN cf.tipo = 'receita' THEN 'Doação para ' || a.nome
        ELSE 'Despesa com ' || a.nome
    END,
    ROUND((random() * 100 + 10)::numeric, 2),
    CURRENT_DATE - (random() * 30)::integer,
    'Movimento de exemplo'
FROM public.animais a
CROSS JOIN public.categorias_financeiras cf
WHERE cf.ativo = true
ORDER BY random()
LIMIT 5;

-- Verificar se as políticas foram aplicadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'movimentos_financeiros';