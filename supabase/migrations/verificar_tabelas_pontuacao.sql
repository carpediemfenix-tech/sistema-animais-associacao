-- Verificar se as tabelas existem e sua estrutura
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('pontuacao_voluntarios_2025_12_21_21_15', 'historico_pontos_2025_12_21_21_15', 'acoes_formacao')
ORDER BY table_name, ordinal_position;