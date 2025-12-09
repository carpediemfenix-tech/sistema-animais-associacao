-- Verificar estrutura final da tabela localizacoes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'localizacoes'
ORDER BY ordinal_position;

-- Testar inserção direta
INSERT INTO public.localizacoes (nome, descricao, ativo) 
VALUES ('Teste SQL', 'Teste de inserção direta', true);

-- Verificar se a inserção funcionou
SELECT * FROM public.localizacoes WHERE nome = 'Teste SQL';

-- Limpar teste
DELETE FROM public.localizacoes WHERE nome = 'Teste SQL';