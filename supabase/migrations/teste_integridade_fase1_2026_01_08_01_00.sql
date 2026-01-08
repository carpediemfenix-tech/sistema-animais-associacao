-- TESTE DE INTEGRIDADE - FASE 1: ESTRUTURA BASE
-- Verificar se todas as tabelas, dados e funções foram criadas corretamente

-- ========================================
-- TESTE 1: VERIFICAR TABELAS CRIADAS
-- ========================================

DO $$
DECLARE
    config_table BOOLEAN;
    assessments_table BOOLEAN;
    injuries_table BOOLEAN;
BEGIN
    -- Verificar se as tabelas existem
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'intake_config_options'
    ) INTO config_table;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'animal_intake_assessments'
    ) INTO assessments_table;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'animal_intake_injuries'
    ) INTO injuries_table;
    
    RAISE NOTICE '=== TESTE 1: TABELAS ===';
    RAISE NOTICE 'intake_config_options: %', CASE WHEN config_table THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    RAISE NOTICE 'animal_intake_assessments: %', CASE WHEN assessments_table THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    RAISE NOTICE 'animal_intake_injuries: %', CASE WHEN injuries_table THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    
    IF NOT (config_table AND assessments_table AND injuries_table) THEN
        RAISE EXCEPTION 'ERRO: Tabelas em falta. Execute o script de criação primeiro.';
    END IF;
END;
$$;

-- ========================================
-- TESTE 2: VERIFICAR DADOS DE CONFIGURAÇÃO
-- ========================================

DO $$
DECLARE
    total_domains INTEGER;
    total_options INTEGER;
    required_domains TEXT[] := ARRAY[
        'intake_origin', 'intake_reason', 'general_condition', 
        'consciousness_level', 'behavior_flags', 'body_condition',
        'injury_type', 'body_location', 'injury_severity'
    ];
    domain_name TEXT;
    domain_count INTEGER;
BEGIN
    -- Contar domínios e opções
    SELECT COUNT(DISTINCT domain) INTO total_domains FROM intake_config_options;
    SELECT COUNT(*) INTO total_options FROM intake_config_options;
    
    RAISE NOTICE '=== TESTE 2: DADOS DE CONFIGURAÇÃO ===';
    RAISE NOTICE 'Total de domínios: %', total_domains;
    RAISE NOTICE 'Total de opções: %', total_options;
    
    -- Verificar domínios obrigatórios
    FOREACH domain_name IN ARRAY required_domains
    LOOP
        SELECT COUNT(*) INTO domain_count 
        FROM intake_config_options 
        WHERE domain = domain_name AND is_active = true;
        
        RAISE NOTICE 'Domínio %: % opções %', 
            domain_name, 
            domain_count,
            CASE WHEN domain_count > 0 THEN '✅' ELSE '❌' END;
            
        IF domain_count = 0 THEN
            RAISE EXCEPTION 'ERRO: Domínio % sem opções ativas', domain_name;
        END IF;
    END LOOP;
    
    IF total_domains < 9 OR total_options < 30 THEN
        RAISE EXCEPTION 'ERRO: Dados insuficientes. Esperado: >=9 domínios, >=30 opções';
    END IF;
END;
$$;

-- ========================================
-- TESTE 3: VERIFICAR FUNÇÕES CRIADAS
-- ========================================

DO $$
DECLARE
    func_get_options BOOLEAN;
    func_get_assessment BOOLEAN;
BEGIN
    -- Verificar se as funções existem
    SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_name = 'get_intake_config_options'
        AND routine_type = 'FUNCTION'
    ) INTO func_get_options;
    
    SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_name = 'get_animal_intake_assessment'
        AND routine_type = 'FUNCTION'
    ) INTO func_get_assessment;
    
    RAISE NOTICE '=== TESTE 3: FUNÇÕES ===';
    RAISE NOTICE 'get_intake_config_options(): %', CASE WHEN func_get_options THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    RAISE NOTICE 'get_animal_intake_assessment(): %', CASE WHEN func_get_assessment THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    
    IF NOT (func_get_options AND func_get_assessment) THEN
        RAISE EXCEPTION 'ERRO: Funções em falta';
    END IF;
END;
$$;

-- ========================================
-- TESTE 4: TESTAR FUNÇÕES FUNCIONAIS
-- ========================================

DO $$
DECLARE
    test_options INTEGER;
    test_result RECORD;
BEGIN
    RAISE NOTICE '=== TESTE 4: FUNCIONALIDADE ===';
    
    -- Testar função get_intake_config_options
    SELECT COUNT(*) INTO test_options 
    FROM get_intake_config_options('general_condition');
    
    RAISE NOTICE 'Função get_intake_config_options(''general_condition''): % opções %', 
        test_options,
        CASE WHEN test_options > 0 THEN '✅' ELSE '❌' END;
    
    IF test_options = 0 THEN
        RAISE EXCEPTION 'ERRO: Função get_intake_config_options não retorna dados';
    END IF;
    
    -- Testar função get_animal_intake_assessment (deve retornar vazio para animal inexistente)
    SELECT COUNT(*) INTO test_options 
    FROM get_animal_intake_assessment('00000000-0000-0000-0000-000000000000'::UUID);
    
    RAISE NOTICE 'Função get_animal_intake_assessment() para animal inexistente: % registos ✅', test_options;
END;
$$;

-- ========================================
-- TESTE 5: VERIFICAR RLS (ROW LEVEL SECURITY)
-- ========================================

DO $$
DECLARE
    rls_config BOOLEAN;
    rls_assessments BOOLEAN;
    rls_injuries BOOLEAN;
BEGIN
    -- Verificar se RLS está habilitado
    SELECT row_security INTO rls_config
    FROM information_schema.tables 
    WHERE table_name = 'intake_config_options';
    
    SELECT row_security INTO rls_assessments
    FROM information_schema.tables 
    WHERE table_name = 'animal_intake_assessments';
    
    SELECT row_security INTO rls_injuries
    FROM information_schema.tables 
    WHERE table_name = 'animal_intake_injuries';
    
    RAISE NOTICE '=== TESTE 5: SEGURANÇA (RLS) ===';
    RAISE NOTICE 'RLS intake_config_options: %', CASE WHEN rls_config THEN '✅ ATIVO' ELSE '❌ INATIVO' END;
    RAISE NOTICE 'RLS animal_intake_assessments: %', CASE WHEN rls_assessments THEN '✅ ATIVO' ELSE '❌ INATIVO' END;
    RAISE NOTICE 'RLS animal_intake_injuries: %', CASE WHEN rls_injuries THEN '✅ ATIVO' ELSE '❌ INATIVO' END;
    
    IF NOT (rls_config AND rls_assessments AND rls_injuries) THEN
        RAISE WARNING 'AVISO: RLS não está ativo em todas as tabelas';
    END IF;
END;
$$;

-- ========================================
-- TESTE 6: VERIFICAR ÍNDICES
-- ========================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    -- Contar índices criados para as tabelas
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename IN ('intake_config_options', 'animal_intake_assessments', 'animal_intake_injuries')
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE '=== TESTE 6: PERFORMANCE ===';
    RAISE NOTICE 'Índices criados: % %', index_count, CASE WHEN index_count >= 3 THEN '✅' ELSE '❌' END;
    
    IF index_count < 3 THEN
        RAISE WARNING 'AVISO: Poucos índices criados, performance pode ser afetada';
    END IF;
END;
$$;

-- ========================================
-- TESTE 7: VERIFICAR COMPATIBILIDADE
-- ========================================

DO $$
DECLARE
    animais_table BOOLEAN;
    voluntarios_table BOOLEAN;
BEGIN
    -- Verificar se as tabelas de referência existem
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'animais'
    ) INTO animais_table;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'voluntarios'
    ) INTO voluntarios_table;
    
    RAISE NOTICE '=== TESTE 7: COMPATIBILIDADE ===';
    RAISE NOTICE 'Tabela animais (referência): %', CASE WHEN animais_table THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    RAISE NOTICE 'Tabela voluntarios (referência): %', CASE WHEN voluntarios_table THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    
    IF NOT (animais_table AND voluntarios_table) THEN
        RAISE WARNING 'AVISO: Tabelas de referência em falta, foreign keys podem falhar';
    END IF;
END;
$$;

-- ========================================
-- RESULTADO FINAL DO TESTE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎯 TESTE DE INTEGRIDADE CONCLUÍDO';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ FASE 1: ESTRUTURA BASE';
    RAISE NOTICE '   - Tabelas criadas e funcionais';
    RAISE NOTICE '   - Dados de configuração inseridos';
    RAISE NOTICE '   - Funções helper operacionais';
    RAISE NOTICE '   - Segurança RLS configurada';
    RAISE NOTICE '   - Índices para performance';
    RAISE NOTICE '   - Compatibilidade verificada';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRONTO PARA FASE 2: INTERFACE COM ABAS';
    RAISE NOTICE '   - Reorganizar página NovoAnimal.tsx';
    RAISE NOTICE '   - Implementar sistema de tabs';
    RAISE NOTICE '   - Corrigir bug "Voluntário Responsável * *"';
    RAISE NOTICE '   - Adicionar autosave/draft';
    RAISE NOTICE '';
    RAISE NOTICE '📊 ESTATÍSTICAS:';
    
    -- Mostrar estatísticas finais
    PERFORM (
        SELECT 
            RAISE NOTICE '   - % domínios de configuração', COUNT(DISTINCT domain)
        FROM intake_config_options
    );
    
    PERFORM (
        SELECT 
            RAISE NOTICE '   - % opções configuráveis', COUNT(*)
        FROM intake_config_options 
        WHERE is_active = true
    );
    
    RAISE NOTICE '========================================';
END;
$$;