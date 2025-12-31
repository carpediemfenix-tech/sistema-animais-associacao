-- ========================================
-- AUDITORIA COMPLETA DAS TABELAS DO WIZARD
-- ========================================

-- 1. TABELA DENUNCIAS
SELECT 
    '1. TABELA DENUNCIAS' as auditoria,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
ORDER BY ordinal_position;

-- 2. TABELA ANIMAIS
SELECT 
    '2. TABELA ANIMAIS' as auditoria,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
ORDER BY ordinal_position;

-- 3. TABELA MISSOES
SELECT 
    '3. TABELA MISSOES' as auditoria,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'missoes_2025_12_29_07_00' 
ORDER BY ordinal_position;

-- 4. TABELA PARTICIPACOES_MISSOES
SELECT 
    '4. TABELA PARTICIPACOES_MISSOES' as auditoria,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participacoes_missoes_2025_12_29_07_00' 
ORDER BY ordinal_position;

-- 5. TABELA MISSOES_ANIMAIS
SELECT 
    '5. TABELA MISSOES_ANIMAIS' as auditoria,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'missoes_animais_2025_12_29_07_00' 
ORDER BY ordinal_position;