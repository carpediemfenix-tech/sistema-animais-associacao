-- Verificar se existem responsabilidades na tabela
SELECT COUNT(*) as total_responsabilidades FROM responsabilidades_voluntarios;

-- Verificar estrutura da tabela responsabilidades_voluntarios
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'responsabilidades_voluntarios'
ORDER BY ordinal_position;

-- Verificar dados de exemplo das responsabilidades
SELECT 
    rv.id,
    rv.voluntario_id,
    rv.animal_id,
    rv.data_inicio,
    rv.data_fim,
    rv.ativo,
    rv.tipo_responsabilidade,
    v.nome as voluntario_nome,
    a.nome as animal_nome
FROM responsabilidades_voluntarios rv
LEFT JOIN voluntarios v ON rv.voluntario_id = v.id
LEFT JOIN animais a ON rv.animal_id = a.id
ORDER BY rv.created_at DESC
LIMIT 10;

-- Verificar se há voluntários com responsabilidades ativas
SELECT 
    v.nome as voluntario,
    COUNT(rv.id) as responsabilidades_ativas
FROM voluntarios v
LEFT JOIN responsabilidades_voluntarios rv ON v.id = rv.voluntario_id AND rv.ativo = true
GROUP BY v.id, v.nome
HAVING COUNT(rv.id) > 0
ORDER BY responsabilidades_ativas DESC;