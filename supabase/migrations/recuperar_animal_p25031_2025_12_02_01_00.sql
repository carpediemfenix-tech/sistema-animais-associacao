-- Recuperar animal desaparecido P25031
-- Executado em: 2025-12-02 01:00 UTC

-- 1. Recuperar animal P25031 especificamente
UPDATE animais 
SET arquivado = false, 
    data_arquivamento = null,
    motivo_arquivamento = null,
    updated_at = now()
WHERE numero_processo = 'P25031';

-- 2. Corrigir todos os animais com campo arquivado NULL
UPDATE animais 
SET arquivado = false
WHERE arquivado IS NULL;

-- 3. Corrigir animais que podem ter ficado inconsistentes
-- (arquivado = true mas sem data_arquivamento)
UPDATE animais 
SET data_arquivamento = created_at
WHERE arquivado = true AND data_arquivamento IS NULL;

-- 4. Verificar se P25031 foi encontrado e corrigido
SELECT 
    id, 
    nome, 
    numero_processo, 
    estado, 
    arquivado,
    data_arquivamento,
    motivo_arquivamento
FROM animais 
WHERE numero_processo = 'P25031';

-- 5. Verificar estatísticas após correção
SELECT 
    'Total animais' as categoria,
    COUNT(*) as quantidade
FROM animais
UNION ALL
SELECT 
    'Animais ativos (não arquivados)' as categoria,
    COUNT(*) as quantidade
FROM animais 
WHERE arquivado = false
UNION ALL
SELECT 
    'Animais arquivados' as categoria,
    COUNT(*) as quantidade
FROM animais 
WHERE arquivado = true;