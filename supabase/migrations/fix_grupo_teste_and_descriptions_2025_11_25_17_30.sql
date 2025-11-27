-- Investigar e corrigir grupo Teste + atualizar descrições
-- Data: 2025-11-25 17:30 UTC
-- Objetivo: Corrigir identificação e melhorar descrições 🎯

-- 1. INVESTIGAR O GRUPO "TESTE"
SELECT 
    'GRUPO TESTE ATUAL:' as info,
    id,
    nome,
    tipo,
    localizacao,
    ativo,
    created_at
FROM public.grupos 
WHERE UPPER(nome) LIKE '%TESTE%'
ORDER BY created_at DESC;

-- 2. VERIFICAR TODOS OS GRUPOS E SEUS TIPOS
SELECT 
    'TODOS OS GRUPOS ATUAIS:' as info,
    nome,
    tipo,
    ativo
FROM public.grupos 
ORDER BY created_at DESC;

-- 3. ATUALIZAR DESCRIÇÃO DO TIPO "SÓCIOS" 
UPDATE public.tipos_grupos 
SET descricao = 'Grupo de animais em que o detentor/responsável é sócio da associação 🤝',
    updated_at = NOW()
WHERE nome = 'Sócios';

-- 4. MELHORAR DESCRIÇÕES DOS OUTROS TIPOS
UPDATE public.tipos_grupos 
SET descricao = 'Grupo de animais com necessidades especiais ou cuidados específicos 🌟',
    icone = 'Heart',
    updated_at = NOW()
WHERE nome = 'Especiais';

UPDATE public.tipos_grupos 
SET descricao = 'Grupo temporário para situações específicas ou eventos pontuais ⏰',
    icone = 'Clock',
    updated_at = NOW()
WHERE nome = 'Temporários';

-- 5. VERIFICAR TIPOS ATUALIZADOS
SELECT 
    'TIPOS ATUALIZADOS:' as info,
    nome,
    descricao,
    icone,
    ativo
FROM public.tipos_grupos 
WHERE ativo = true 
ORDER BY nome;

-- 6. VERIFICAR SE HÁ PROBLEMA DE CASE SENSITIVITY NOS GRUPOS
SELECT 
    'VERIFICAÇÃO DE COMPATIBILIDADE:' as info,
    g.nome as grupo_nome,
    g.tipo as grupo_tipo_atual,
    tg.nome as tipo_correto,
    tg.descricao,
    tg.icone,
    CASE 
        WHEN g.tipo = tg.nome THEN 'CORRETO'
        WHEN UPPER(g.tipo) = UPPER(tg.nome) THEN 'CASE PROBLEM'
        ELSE 'TIPO INCORRETO'
    END as status
FROM public.grupos g
LEFT JOIN public.tipos_grupos tg ON UPPER(g.tipo) = UPPER(tg.nome)
WHERE g.ativo = true
ORDER BY g.created_at DESC;

-- 7. CORRIGIR POSSÍVEIS PROBLEMAS DE CASE SENSITIVITY
UPDATE public.grupos 
SET tipo = 'Sócios',
    updated_at = NOW()
WHERE UPPER(tipo) = 'SÓCIOS' AND tipo != 'Sócios';

UPDATE public.grupos 
SET tipo = 'Matilha',
    updated_at = NOW()
WHERE UPPER(tipo) = 'MATILHA' AND tipo != 'Matilha';

UPDATE public.grupos 
SET tipo = 'Colónia',
    updated_at = NOW()
WHERE UPPER(tipo) = 'COLÓNIA' AND tipo != 'Colónia';

-- 8. VERIFICAÇÃO FINAL
SELECT 
    'VERIFICAÇÃO FINAL:' as info,
    g.nome as grupo_nome,
    g.tipo as grupo_tipo,
    tg.descricao as tipo_descricao,
    tg.icone as tipo_icone
FROM public.grupos g
LEFT JOIN public.tipos_grupos tg ON g.tipo = tg.nome
WHERE g.ativo = true
ORDER BY g.created_at DESC;

SELECT 'CORREÇÕES APLICADAS COM SUCESSO! ✅' as status;