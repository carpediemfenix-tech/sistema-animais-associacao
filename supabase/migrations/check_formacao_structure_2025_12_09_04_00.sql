-- Verificar estrutura das tabelas relacionadas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('voluntarios', 'participacoes_formacao', 'acoes_formacao', 'tipos_formacao')
ORDER BY table_name, ordinal_position;

-- Verificar dados de exemplo para entender as relações
SELECT 'voluntarios' as tabela, count(*) as total FROM voluntarios
UNION ALL
SELECT 'participacoes_formacao' as tabela, count(*) as total FROM participacoes_formacao
UNION ALL
SELECT 'acoes_formacao' as tabela, count(*) as total FROM acoes_formacao
UNION ALL
SELECT 'tipos_formacao' as tabela, count(*) as total FROM tipos_formacao;