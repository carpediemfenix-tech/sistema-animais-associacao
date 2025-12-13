-- Criar movimentos financeiros para intervenções que têm custo
INSERT INTO movimentos_financeiros_2025_12_13_06_00 (
    data_movimento,
    tipo,
    escopo,
    categoria_id,
    conta_origem_id,
    animal_id,
    intervencao_id,
    valor,
    descricao,
    status,
    forma_pagamento
)
SELECT 
    i.data_intervencao,
    'despesa' as tipo,
    'animal' as escopo,
    (SELECT id FROM categorias_financeiras_2025_12_13_06_00 WHERE codigo = 'D101') as categoria_id,
    (SELECT id FROM contas_financeiras_2025_12_13_06_00 WHERE codigo = 'BCO001') as conta_origem_id,
    i.animal_id,
    i.id as intervencao_id,
    COALESCE(i.custo_final, i.custo, 0) as valor,
    CONCAT('Intervenção: ', ti.nome, ' - ', cv.nome) as descricao,
    CASE 
        WHEN i.data_intervencao <= CURRENT_DATE THEN 'pago'
        ELSE 'pendente'
    END as status,
    'multibanco' as forma_pagamento
FROM intervencoes i
LEFT JOIN tipos_intervencoes ti ON i.tipo_intervencao_id = ti.id
LEFT JOIN clinicas_veterinarias cv ON i.clinica_id = cv.id
WHERE (i.custo_final > 0 OR i.custo > 0)
AND NOT EXISTS (
    SELECT 1 FROM movimentos_financeiros_2025_12_13_06_00 mf 
    WHERE mf.intervencao_id = i.id
);

-- Verificar movimentos criados
SELECT COUNT(*) as movimentos_criados
FROM movimentos_financeiros_2025_12_13_06_00
WHERE intervencao_id IS NOT NULL;