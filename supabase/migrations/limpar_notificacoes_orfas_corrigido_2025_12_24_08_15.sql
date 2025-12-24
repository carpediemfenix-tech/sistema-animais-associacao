-- Verificar e limpar notificações inconsistentes

-- 1. Verificar notificações duplicadas
SELECT 
    utilizador_id,
    titulo,
    mensagem,
    COUNT(*) as duplicatas
FROM notificacoes 
GROUP BY utilizador_id, titulo, mensagem
HAVING COUNT(*) > 1
ORDER BY duplicatas DESC;

-- 2. Eliminar notificações muito antigas (mais de 30 dias)
DELETE FROM notificacoes 
WHERE created_at < NOW() - INTERVAL '30 days'
AND lida = true;

-- 3. Marcar como lidas notificações muito antigas não lidas (mais de 7 dias)
UPDATE notificacoes 
SET lida = true, 
    data_leitura = NOW(),
    updated_at = NOW()
WHERE created_at < NOW() - INTERVAL '7 days'
AND lida = false;

-- 4. Verificar estado final
SELECT 
    utilizador_id,
    lida,
    arquivada,
    COUNT(*) as total,
    MIN(created_at) as mais_antiga,
    MAX(created_at) as mais_recente
FROM notificacoes 
GROUP BY utilizador_id, lida, arquivada
ORDER BY utilizador_id, lida, arquivada;