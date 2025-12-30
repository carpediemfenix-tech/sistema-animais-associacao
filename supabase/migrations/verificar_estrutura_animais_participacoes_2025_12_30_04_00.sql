-- Verificar estrutura da tabela animais
SELECT 
    'Tabela animais' as tabela,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
ORDER BY ordinal_position;

-- Verificar se há constraints NOT NULL problemáticas
SELECT 
    'Constraints NOT NULL - animais' as info,
    column_name
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY column_name;

-- Verificar tabela de participações de missões
SELECT 
    'Tabela participacoes_missoes' as tabela,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name LIKE '%participacoes_missoes%' 
ORDER BY table_name, ordinal_position;

-- Verificar tabela de animais de missões
SELECT 
    'Tabela missoes_animais' as tabela,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name LIKE '%missoes_animais%' OR table_name LIKE '%animais_missoes%'
ORDER BY table_name, ordinal_position;