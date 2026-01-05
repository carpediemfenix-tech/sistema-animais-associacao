-- Verificar estrutura da tabela de participações
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'participacoes_missoes_2025_12_29_07_00'
ORDER BY ordinal_position;

-- Verificar se existem dados de pontuação no histórico
SELECT COUNT(*) as total_historico_pontos
FROM historico_pontos_detalhado_2026_01_05_15_00;

-- Verificar participações existentes
SELECT id, missao_id, voluntario_id, funcao, data_participacao
FROM participacoes_missoes_2025_12_29_07_00
WHERE missao_id = '8c9252a3-fe8e-48a8-a8c3-6ff20b4977ed'
LIMIT 5;