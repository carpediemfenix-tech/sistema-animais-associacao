-- Listar colunas da tabela acoes_formacao
SELECT column_name FROM information_schema.columns WHERE table_name = 'acoes_formacao' ORDER BY ordinal_position;