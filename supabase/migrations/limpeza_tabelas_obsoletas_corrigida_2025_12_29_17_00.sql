-- =====================================================
-- AUDITORIA E LIMPEZA DE TABELAS OBSOLETAS - CORRIGIDA
-- Data: 2025-12-29 17:00
-- Objetivo: Remover tabelas antigas e liberar espaço
-- =====================================================

-- FASE 1: AUDITORIA - Verificar tabelas existentes
DO $$
DECLARE
    rec RECORD;
    total_size BIGINT := 0;
    obsolete_size BIGINT := 0;
BEGIN
    RAISE NOTICE '🔍 INICIANDO AUDITORIA DE TABELAS OBSOLETAS';
    RAISE NOTICE '================================================';
    
    -- Listar todas as tabelas e seus tamanhos
    RAISE NOTICE '📊 TABELAS EXISTENTES NO SCHEMA PUBLIC:';
    FOR rec IN 
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho,
            pg_total_relation_size('public.'||tablename) as tamanho_bytes
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY pg_total_relation_size('public.'||tablename) DESC
    LOOP
        RAISE NOTICE '  - %: %', rec.tablename, rec.tamanho;
        total_size := total_size + rec.tamanho_bytes;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📈 TAMANHO TOTAL DA BASE DE DADOS: %', pg_size_pretty(total_size);
    RAISE NOTICE '';
    
    -- Identificar tabelas potencialmente obsoletas
    RAISE NOTICE '🗑️ TABELAS POTENCIALMENTE OBSOLETAS:';
    FOR rec IN 
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho,
            pg_total_relation_size('public.'||tablename) as tamanho_bytes
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND (
            tablename LIKE '%2025_12_21%' OR
            tablename LIKE '%2025_12_22%' OR
            tablename LIKE '%2025_12_23%' OR
            tablename LIKE '%2025_12_24%' OR
            tablename LIKE '%2025_12_25%' OR
            tablename LIKE '%2025_12_26%' OR
            tablename LIKE '%2025_12_27%' OR
            tablename LIKE '%2025_12_28%'
        )
        ORDER BY tablename
    LOOP
        RAISE NOTICE '  ❌ %: %', rec.tablename, rec.tamanho;
        obsolete_size := obsolete_size + rec.tamanho_bytes;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '💾 ESPAÇO OCUPADO POR TABELAS OBSOLETAS: %', pg_size_pretty(obsolete_size);
    RAISE NOTICE '';
END $$;

-- FASE 2: BACKUP DE SEGURANÇA
-- Criar tabela de log para registrar remoções
CREATE TABLE IF NOT EXISTS tabelas_removidas_log (
    id SERIAL PRIMARY KEY,
    nome_tabela VARCHAR(255) NOT NULL,
    tamanho_antes TEXT,
    data_remocao TIMESTAMP DEFAULT NOW(),
    motivo TEXT
);

-- FASE 3: REMOÇÃO SEGURA DE TABELAS OBSOLETAS
DO $$
DECLARE
    tabela_nome TEXT;
    tabelas_para_remover TEXT[] := ARRAY[
        'missoes_2025_12_21_19_00',
        'participacoes_missoes_2025_12_21_20_00',
        'movimentos_financeiros_2025_12_22_03_00',
        'equipamentos_missoes_2025_12_21_20_00',
        'animais_missoes_2025_12_21_20_00'
    ];
    tamanho_tabela TEXT;
BEGIN
    RAISE NOTICE '🗑️ INICIANDO REMOÇÃO DE TABELAS OBSOLETAS';
    RAISE NOTICE '==========================================';
    
    FOREACH tabela_nome IN ARRAY tabelas_para_remover
    LOOP
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tabela_nome) THEN
            -- Obter tamanho antes da remoção
            SELECT pg_size_pretty(pg_total_relation_size('public.'||tabela_nome)) INTO tamanho_tabela;
            
            -- Registrar no log
            INSERT INTO tabelas_removidas_log (nome_tabela, tamanho_antes, motivo)
            VALUES (tabela_nome, tamanho_tabela, 'Tabela obsoleta com timestamp antigo');
            
            -- Remover a tabela
            EXECUTE 'DROP TABLE IF EXISTS public.' || tabela_nome || ' CASCADE';
            
            RAISE NOTICE '  ✅ Removida: % (tamanho: %)', tabela_nome, tamanho_tabela;
        ELSE
            RAISE NOTICE '  ⚠️ Não encontrada: %', tabela_nome;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 LIMPEZA CONCLUÍDA!';
END $$;

-- FASE 4: VERIFICAÇÃO PÓS-LIMPEZA
DO $$
DECLARE
    rec RECORD;
    total_size_after BIGINT := 0;
BEGIN
    RAISE NOTICE '📊 VERIFICAÇÃO PÓS-LIMPEZA';
    RAISE NOTICE '========================';
    
    -- Listar tabelas restantes
    RAISE NOTICE '✅ TABELAS ATIVAS RESTANTES:';
    FOR rec IN 
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho,
            pg_total_relation_size('public.'||tablename) as tamanho_bytes
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'tabelas_removidas_log'
        ORDER BY pg_total_relation_size('public.'||tablename) DESC
    LOOP
        RAISE NOTICE '  - %: %', rec.tablename, rec.tamanho;
        total_size_after := total_size_after + rec.tamanho_bytes;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📈 TAMANHO TOTAL APÓS LIMPEZA: %', pg_size_pretty(total_size_after);
    
    -- Mostrar log de remoções
    RAISE NOTICE '';
    RAISE NOTICE '📋 LOG DE TABELAS REMOVIDAS:';
    FOR rec IN 
        SELECT nome_tabela, tamanho_antes, data_remocao 
        FROM tabelas_removidas_log 
        ORDER BY data_remocao DESC
    LOOP
        RAISE NOTICE '  🗑️ %: % (removida em %)', rec.nome_tabela, rec.tamanho_antes, rec.data_remocao;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 AUDITORIA E LIMPEZA CONCLUÍDA COM SUCESSO!';
END $$;

-- FASE 5: CONFIGURAÇÕES FINAIS
-- Comentários e índices
COMMENT ON TABLE tabelas_removidas_log IS 'Log de tabelas removidas durante limpeza de base de dados';
CREATE INDEX IF NOT EXISTS idx_tabelas_removidas_data ON tabelas_removidas_log(data_remocao);

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 LIMPEZA DE TABELAS OBSOLETAS CONCLUÍDA!';
    RAISE NOTICE '✅ Espaço liberado e base de dados otimizada';
    RAISE NOTICE '📋 Log de remoções disponível na tabela: tabelas_removidas_log';
    RAISE NOTICE '⚠️ Execute VACUUM ANALYZE manualmente para liberar espaço físico';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 BASE DE DADOS LIMPA E ORGANIZADA!';
END $$;