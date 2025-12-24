-- Verificar todas as notificações existentes
SELECT 
    id,
    utilizador_id,
    titulo,
    mensagem,
    lida,
    arquivada,
    prioridade,
    categoria,
    created_at
FROM notificacoes 
ORDER BY created_at DESC
LIMIT 20;

-- Contar notificações por status
SELECT 
    utilizador_id,
    lida,
    arquivada,
    COUNT(*) as total
FROM notificacoes 
GROUP BY utilizador_id, lida, arquivada
ORDER BY utilizador_id, lida, arquivada;

-- Verificar notificações não lidas por utilizador
SELECT 
    utilizador_id,
    COUNT(*) as nao_lidas
FROM notificacoes 
WHERE lida = false AND arquivada = false
GROUP BY utilizador_id;