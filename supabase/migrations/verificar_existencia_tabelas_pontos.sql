-- Verificar se as tabelas de pontuação existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pontuacao_voluntarios_2025_12_21_21_15', 'historico_pontos_2025_12_21_21_15', 'badges_sistema_2025_12_21_21_15');