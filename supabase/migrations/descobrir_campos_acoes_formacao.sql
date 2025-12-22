-- Descobrir campos exatos da tabela acoes_formacao
\d acoes_formacao;

-- Alternativa: listar colunas
SELECT column_name FROM information_schema.columns WHERE table_name = 'acoes_formacao' ORDER BY ordinal_position;