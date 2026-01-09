-- INVESTIGAÇÃO DA ESTRUTURA ATUAL DA BASE DE DADOS
-- Seguindo regras de ouro: máxima simplificação

-- 1. VERIFICAR TABELAS EXISTENTES RELACIONADAS COM INTAKE
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%intake%'
ORDER BY table_name;

-- 2. VERIFICAR FUNÇÕES RPC EXISTENTES
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%intake%'
ORDER BY routine_name;

-- 3. VERIFICAR ESTRUTURA DA TABELA DE OPÇÕES (SE EXISTIR)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE '%intake_config%'
ORDER BY ordinal_position;

-- 4. VERIFICAR DADOS EXISTENTES (AMOSTRA)
SELECT 
    'intake_config_options_2026_01_09_03_00' as tabela,
    COUNT(*) as total_registos,
    COUNT(DISTINCT domain) as dominios_unicos
FROM intake_config_options_2026_01_09_03_00
WHERE is_active = true;

-- 5. VERIFICAR DOMÍNIOS E CONTAGENS
SELECT 
    domain,
    COUNT(*) as total_opcoes,
    COUNT(CASE WHEN is_active THEN 1 END) as opcoes_ativas
FROM intake_config_options_2026_01_09_03_00
GROUP BY domain
ORDER BY domain;

-- 6. VERIFICAR ESTRUTURA DA TABELA DE AVALIAÇÕES
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'animal_intake_assessments'
ORDER BY ordinal_position;

-- 7. TESTAR FUNÇÃO PROBLEMÁTICA
SELECT 'Teste função expandida' as teste;
-- SELECT * FROM get_expanded_intake_options() LIMIT 5;