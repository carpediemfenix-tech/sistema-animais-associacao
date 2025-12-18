-- Investigar como a clínica é armazenada na tabela intervencoes
-- Criada em: 2025-12-18 13:15 UTC

-- 1. Verificar estrutura da tabela intervencoes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'intervencoes' 
ORDER BY ordinal_position;

-- 2. Verificar dados reais de intervenções específicas
SELECT 
    id,
    animal_id,
    veterinario,
    clinica,
    clinica_id,
    data_intervencao,
    custo_final,
    observacoes
FROM intervencoes 
WHERE animal_id = '1685ea69-0598-4850-90c4-536c32323b35'
AND custo_final IS NOT NULL
LIMIT 5;

-- 3. Testar query com relacionamento
SELECT 
    i.id,
    i.veterinario,
    i.clinica,
    i.clinica_id,
    cv.nome as clinica_nome,
    cv.tem_protocolo
FROM intervencoes i
LEFT JOIN clinicas_veterinarias cv ON i.clinica_id = cv.id
WHERE i.animal_id = '1685ea69-0598-4850-90c4-536c32323b35'
AND i.custo_final IS NOT NULL
LIMIT 5;