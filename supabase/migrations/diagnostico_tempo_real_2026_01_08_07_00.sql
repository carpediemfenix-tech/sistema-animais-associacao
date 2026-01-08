-- Script de diagnóstico em tempo real
-- Execute este script ANTES e DEPOIS de fazer alterações na interface

-- 1. Dados atuais do animal
SELECT 
    'DADOS ATUAIS DO ANIMAL' as secao,
    nome,
    especie,
    estado,
    updated_at,
    created_at
FROM animais 
WHERE id = '67daf5d6-b573-4c74-81d7-a1065f8786e1';

-- 2. Ficha de admissão atual
SELECT 
    'FICHA DE ADMISSÃO ATUAL' as secao,
    intake_origin,
    general_condition,
    behavior_entry,
    symptoms,
    immediate_actions,
    updated_at,
    created_at
FROM animal_intake_assessments 
WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1';

-- 3. Timestamp atual para comparação
SELECT 
    'TIMESTAMP ATUAL' as secao,
    NOW() as timestamp_atual;

-- INSTRUÇÕES:
-- 1. Execute este script ANTES de fazer alterações
-- 2. Faça as alterações na interface
-- 3. Execute este script NOVAMENTE
-- 4. Compare os valores de updated_at para confirmar se houve alteração