-- VERIFICAR ESTRUTURA DAS TABELAS ANTES DO RESET
-- Data: 2025-12-08 06:00 UTC

-- Verificar estrutura da tabela voluntarios
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'voluntarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela animais
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Listar todas as tabelas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;