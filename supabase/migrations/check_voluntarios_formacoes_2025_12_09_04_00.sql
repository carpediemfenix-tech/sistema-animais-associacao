-- Verificar voluntários e suas participações em formações
SELECT 
    v.nome as voluntario_nome,
    v.ativo,
    pf.resultado,
    pf.status,
    af.codigo_acao,
    af.nome_acao,
    tf.nome as tipo_formacao,
    tf.codigo as tipo_codigo,
    tf.nivel_ordem
FROM voluntarios v
LEFT JOIN participacoes_formacao pf ON v.id = pf.voluntario_id
LEFT JOIN acoes_formacao af ON pf.acao_formacao_id = af.id
LEFT JOIN tipos_formacao tf ON af.tipo_formacao_id = tf.id
WHERE v.ativo = true
ORDER BY v.nome, tf.nivel_ordem;

-- Verificar tipos de formação disponíveis
SELECT 
    id,
    nome,
    codigo,
    nivel_ordem,
    ativo
FROM tipos_formacao
ORDER BY nivel_ordem;