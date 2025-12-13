-- Atualizar intervenções que têm clinica mas não têm clinica_id
UPDATE intervencoes 
SET clinica_id = (
    SELECT id 
    FROM clinicas_veterinarias 
    WHERE nome = intervencoes.clinica 
    LIMIT 1
)
WHERE clinica IS NOT NULL 
AND clinica != '' 
AND clinica_id IS NULL;

-- Verificar resultado
SELECT 
    i.id,
    i.clinica as clinica_texto,
    i.clinica_id,
    cv.nome as clinica_nome
FROM intervencoes i
LEFT JOIN clinicas_veterinarias cv ON i.clinica_id = cv.id
WHERE i.clinica IS NOT NULL
LIMIT 10;