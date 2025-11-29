-- Desativar RLS temporariamente para testar
ALTER TABLE public.movimentos_financeiros DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.movimentos_financeiros;

-- Reativar RLS
ALTER TABLE public.movimentos_financeiros ENABLE ROW LEVEL SECURITY;

-- Criar políticas muito simples e permissivas
CREATE POLICY "Allow all for authenticated users" ON public.movimentos_financeiros
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar se a tabela tem dados
SELECT COUNT(*) as total_movimentos FROM public.movimentos_financeiros;

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros' 
AND table_schema = 'public'
ORDER BY ordinal_position;