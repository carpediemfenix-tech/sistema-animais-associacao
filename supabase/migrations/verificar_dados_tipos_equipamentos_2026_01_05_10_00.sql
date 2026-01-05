-- Verificar se há tipos de equipamentos válidos
SELECT id, nome, codigo, categoria_id, ativo 
FROM tipos_equipamentos_2025_12_13_01_00 
WHERE ativo = true
ORDER BY nome
LIMIT 10;

-- Verificar se há categorias válidas
SELECT id, nome, codigo, ativo 
FROM categorias_equipamentos_2025_12_13_01_00 
WHERE ativo = true
ORDER BY nome
LIMIT 10;