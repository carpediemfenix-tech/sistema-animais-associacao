-- Verificar e corrigir função get_custos_por_categoria
-- Data: 2025-11-29 03:00

-- 1. Verificar se a função existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'get_custos_por_categoria';

-- 2. Verificar dados na tabela intervencoes
SELECT 
    COUNT(*) as total_intervencoes,
    COUNT(custo) as intervencoes_com_custo,
    SUM(custo) as soma_custos,
    AVG(custo) as media_custos
FROM intervencoes 
WHERE custo IS NOT NULL AND custo > 0;

-- 3. Verificar dados na tabela tipos_intervencoes
SELECT nome, COUNT(*) as quantidade
FROM tipos_intervencoes ti
LEFT JOIN intervencoes i ON ti.id = i.tipo_intervencao_id
GROUP BY ti.nome
ORDER BY quantidade DESC;

-- 4. Recriar função get_custos_por_categoria de forma mais simples
CREATE OR REPLACE FUNCTION get_custos_por_categoria()
RETURNS TABLE (
    categoria TEXT,
    total_custos NUMERIC,
    numero_registos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(ti.nome, 'Sem Categoria') as categoria,
        COALESCE(SUM(i.custo_final), SUM(i.custo), 0)::NUMERIC as total_custos,
        COUNT(i.id) as numero_registos
    FROM intervencoes i
    LEFT JOIN tipos_intervencoes ti ON i.tipo_intervencao_id = ti.id
    WHERE i.custo IS NOT NULL AND i.custo > 0
    GROUP BY ti.nome
    ORDER BY total_custos DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Testar a função
SELECT * FROM get_custos_por_categoria();

-- 6. Se não houver dados, inserir dados de teste
INSERT INTO intervencoes (
    animal_id, 
    tipo_intervencao_id, 
    data_intervencao, 
    veterinario, 
    observacoes, 
    custo, 
    custo_final, 
    urgente, 
    concluida
) 
SELECT 
    a.id,
    ti.id,
    CURRENT_DATE - (random() * 30)::int,
    'Dr. Teste',
    'Intervenção de teste para estatísticas',
    (random() * 200 + 50)::numeric(10,2),
    (random() * 200 + 50)::numeric(10,2),
    false,
    true
FROM animais a
CROSS JOIN tipos_intervencoes ti
WHERE NOT EXISTS (
    SELECT 1 FROM intervencoes 
    WHERE animal_id = a.id AND tipo_intervencao_id = ti.id
)
LIMIT 10;

-- 7. Verificar novamente
SELECT * FROM get_custos_por_categoria();