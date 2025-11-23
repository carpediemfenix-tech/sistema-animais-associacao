-- ========================================
-- DEBUG E CORREÇÃO DE PROBLEMAS COM ANIMAIS EM GRUPOS
-- ========================================

-- 1. Verificar estado atual de todos os cães
SELECT 
    'ESTADO ATUAL DOS CÃES:' as info;

SELECT 
    nome,
    especie,
    estado,
    arquivado,
    CASE 
        WHEN grupo_id IS NOT NULL THEN 'TEM GRUPO'
        ELSE 'SEM GRUPO'
    END as status_grupo,
    grupo_id,
    numero_processo,
    created_at::date as data_criacao
FROM public.animais 
WHERE especie = 'Cão'
ORDER BY nome;

-- 2. Verificar grupos existentes e seus animais
SELECT 
    'GRUPOS E SEUS ANIMAIS:' as info;

SELECT 
    g.nome as grupo_nome,
    g.tipo,
    g.ativo as grupo_ativo,
    COUNT(a.id) as total_animais,
    STRING_AGG(a.nome, ', ') as nomes_animais
FROM public.grupos g
LEFT JOIN public.animais a ON g.id = a.grupo_id AND a.arquivado = false
GROUP BY g.id, g.nome, g.tipo, g.ativo
ORDER BY g.tipo, g.nome;

-- 3. Verificar animais disponíveis para matilhas
SELECT 
    'CÃES DISPONÍVEIS PARA MATILHAS:' as info;

SELECT 
    nome,
    estado,
    arquivado,
    grupo_id,
    numero_processo,
    CASE 
        WHEN grupo_id IS NULL AND estado = 'Ativo' AND arquivado = false THEN 'DISPONÍVEL'
        WHEN grupo_id IS NOT NULL THEN 'JÁ EM GRUPO'
        WHEN estado != 'Ativo' THEN 'NÃO ATIVO (' || estado || ')'
        WHEN arquivado = true THEN 'ARQUIVADO'
        ELSE 'OUTRO MOTIVO'
    END as status_disponibilidade
FROM public.animais 
WHERE especie = 'Cão'
ORDER BY status_disponibilidade, nome;

-- 4. Estatísticas resumidas
SELECT 
    'ESTATÍSTICAS RESUMIDAS:' as info;

SELECT 
    COUNT(*) as total_caes,
    COUNT(CASE WHEN grupo_id IS NULL AND estado = 'Ativo' AND arquivado = false THEN 1 END) as disponiveis_para_grupo,
    COUNT(CASE WHEN grupo_id IS NOT NULL THEN 1 END) as ja_em_grupos,
    COUNT(CASE WHEN estado != 'Ativo' THEN 1 END) as nao_ativos,
    COUNT(CASE WHEN arquivado = true THEN 1 END) as arquivados
FROM public.animais 
WHERE especie = 'Cão';

-- 5. Verificar possíveis problemas de dados
SELECT 
    'POSSÍVEIS PROBLEMAS:' as info;

-- Animais com grupo_id que não existe
SELECT 
    'Animais com grupo_id inválido:' as problema,
    a.nome,
    a.grupo_id
FROM public.animais a
LEFT JOIN public.grupos g ON a.grupo_id = g.id
WHERE a.grupo_id IS NOT NULL AND g.id IS NULL;

-- Animais em grupos inativos
SELECT 
    'Animais em grupos inativos:' as problema,
    a.nome,
    g.nome as grupo_nome,
    g.ativo as grupo_ativo
FROM public.animais a
JOIN public.grupos g ON a.grupo_id = g.id
WHERE g.ativo = false;

-- 6. Corrigir problemas encontrados (se houver)
-- Remover associações com grupos inexistentes
UPDATE public.animais 
SET grupo_id = NULL 
WHERE grupo_id IS NOT NULL 
AND grupo_id NOT IN (SELECT id FROM public.grupos);

-- Remover associações com grupos inativos
UPDATE public.animais 
SET grupo_id = NULL 
WHERE grupo_id IN (SELECT id FROM public.grupos WHERE ativo = false);

SELECT 'CORREÇÕES APLICADAS' as info;