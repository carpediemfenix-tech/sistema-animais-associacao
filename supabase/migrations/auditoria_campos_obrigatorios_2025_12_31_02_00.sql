-- ========================================
-- CAMPOS OBRIGATÓRIOS (NOT NULL) POR TABELA
-- ========================================

-- DENUNCIAS - Campos obrigatórios
SELECT 
    'DENUNCIAS - OBRIGATÓRIOS' as tabela,
    column_name,
    data_type,
    'OBRIGATÓRIO' as status
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY column_name;

-- ANIMAIS - Campos obrigatórios
SELECT 
    'ANIMAIS - OBRIGATÓRIOS' as tabela,
    column_name,
    data_type,
    'OBRIGATÓRIO' as status
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY column_name;

-- MISSOES - Campos obrigatórios
SELECT 
    'MISSOES - OBRIGATÓRIOS' as tabela,
    column_name,
    data_type,
    'OBRIGATÓRIO' as status
FROM information_schema.columns 
WHERE table_name = 'missoes_2025_12_29_07_00' 
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY column_name;

-- PARTICIPACOES - Campos obrigatórios
SELECT 
    'PARTICIPACOES - OBRIGATÓRIOS' as tabela,
    column_name,
    data_type,
    'OBRIGATÓRIO' as status
FROM information_schema.columns 
WHERE table_name = 'participacoes_missoes_2025_12_29_07_00' 
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY column_name;

-- MISSOES_ANIMAIS - Campos obrigatórios
SELECT 
    'MISSOES_ANIMAIS - OBRIGATÓRIOS' as tabela,
    column_name,
    data_type,
    'OBRIGATÓRIO' as status
FROM information_schema.columns 
WHERE table_name = 'missoes_animais_2025_12_29_07_00' 
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY column_name;