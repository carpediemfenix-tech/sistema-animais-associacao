-- =====================================================
-- CORREÇÃO DE FOREIGN KEYS ÓRFÃS APÓS LIMPEZA
-- Data: 2025-12-29 17:00
-- Objetivo: Corrigir tabelas com FK para tabelas removidas
-- =====================================================

-- FASE 1: VERIFICAR TABELAS RESTANTES COM TIMESTAMPS ANTIGOS
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO TABELAS RESTANTES COM TIMESTAMPS ANTIGOS';
    RAISE NOTICE '====================================================';
    
    FOR rec IN 
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho
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
        RAISE NOTICE '  ⚠️ Tabela restante: % (tamanho: %)', rec.tablename, rec.tamanho;
    END LOOP;
END $$;

-- FASE 2: VERIFICAR FOREIGN KEYS ÓRFÃS
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔗 VERIFICANDO FOREIGN KEYS ÓRFÃS';
    RAISE NOTICE '================================';
    
    FOR rec IN 
        SELECT 
            tc.table_name,
            tc.constraint_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND ccu.table_name LIKE '%2025_12_21%'
    LOOP
        RAISE NOTICE '  ❌ FK órfã: %.% -> %.%', 
            rec.table_name, rec.constraint_name, 
            rec.foreign_table_name, rec.foreign_column_name;
    END LOOP;
END $$;

-- FASE 3: REMOVER TABELAS RESTANTES COM TIMESTAMPS ANTIGOS
DO $$
DECLARE
    tabela_nome TEXT;
    tamanho_tabela TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🗑️ REMOVENDO TABELAS RESTANTES COM TIMESTAMPS ANTIGOS';
    RAISE NOTICE '===================================================';
    
    -- Buscar todas as tabelas com timestamps antigos
    FOR tabela_nome IN 
        SELECT tablename
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
        AND tablename != 'tabelas_removidas_log'
    LOOP
        -- Obter tamanho antes da remoção
        SELECT pg_size_pretty(pg_total_relation_size('public.'||tabela_nome)) INTO tamanho_tabela;
        
        -- Registrar no log
        INSERT INTO tabelas_removidas_log (nome_tabela, tamanho_antes, motivo)
        VALUES (tabela_nome, tamanho_tabela, 'Tabela com FK órfã após limpeza inicial');
        
        -- Remover a tabela com CASCADE para remover FKs
        EXECUTE 'DROP TABLE IF EXISTS public.' || tabela_nome || ' CASCADE';
        
        RAISE NOTICE '  ✅ Removida: % (tamanho: %)', tabela_nome, tamanho_tabela;
    END LOOP;
END $$;

-- FASE 4: CRIAR TABELA DE PARTICIPAÇÕES ATUALIZADA
-- Verificar se precisamos criar uma nova tabela de participações
DO $$
BEGIN
    -- Verificar se existe tabela de participações ativa
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE 'participacoes_missoes%2025_12_29%'
    ) THEN
        RAISE NOTICE '';
        RAISE NOTICE '📋 CRIANDO TABELA DE PARTICIPAÇÕES ATUALIZADA';
        RAISE NOTICE '============================================';
        
        -- Criar nova tabela de participações
        CREATE TABLE participacoes_missoes_2025_12_29_07_00 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            missao_id UUID NOT NULL,
            voluntario_id UUID NOT NULL,
            funcao VARCHAR(100) NOT NULL,
            data_participacao DATE NOT NULL DEFAULT CURRENT_DATE,
            data_fim DATE,
            status_participacao VARCHAR(50) NOT NULL DEFAULT 'ativa',
            observacoes TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            created_by VARCHAR(100) DEFAULT 'system',
            updated_by VARCHAR(100) DEFAULT 'system',
            
            -- Foreign Keys para tabelas corretas
            CONSTRAINT fk_participacoes_missao 
                FOREIGN KEY (missao_id) 
                REFERENCES missoes_2025_12_29_07_00(id) 
                ON DELETE CASCADE,
            
            CONSTRAINT fk_participacoes_voluntario 
                FOREIGN KEY (voluntario_id) 
                REFERENCES voluntarios(id) 
                ON DELETE CASCADE
        );
        
        -- Índices para performance
        CREATE INDEX idx_participacoes_missao_id ON participacoes_missoes_2025_12_29_07_00(missao_id);
        CREATE INDEX idx_participacoes_voluntario_id ON participacoes_missoes_2025_12_29_07_00(voluntario_id);
        CREATE INDEX idx_participacoes_data ON participacoes_missoes_2025_12_29_07_00(data_participacao);
        
        -- Trigger para updated_at
        CREATE OR REPLACE FUNCTION update_participacoes_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER trigger_participacoes_updated_at
            BEFORE UPDATE ON participacoes_missoes_2025_12_29_07_00
            FOR EACH ROW
            EXECUTE FUNCTION update_participacoes_updated_at();
        
        -- Comentário
        COMMENT ON TABLE participacoes_missoes_2025_12_29_07_00 IS 'Participações de voluntários em missões - versão atualizada';
        
        RAISE NOTICE '  ✅ Tabela participacoes_missoes_2025_12_29_07_00 criada com sucesso';
        
        -- Inserir dados de exemplo
        INSERT INTO participacoes_missoes_2025_12_29_07_00 
        (missao_id, voluntario_id, funcao, data_participacao, status_participacao, observacoes)
        SELECT 
            m.id,
            v.id,
            'Voluntário',
            CURRENT_DATE,
            'ativa',
            'Participação de exemplo'
        FROM missoes_2025_12_29_07_00 m
        CROSS JOIN (SELECT id FROM voluntarios LIMIT 1) v
        LIMIT 3;
        
        RAISE NOTICE '  ✅ Dados de exemplo inseridos';
    ELSE
        RAISE NOTICE '  ⚠️ Tabela de participações já existe';
    END IF;
END $$;

-- FASE 5: VERIFICAÇÃO FINAL
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 VERIFICAÇÃO FINAL PÓS-CORREÇÃO';
    RAISE NOTICE '================================';
    
    -- Listar tabelas ativas
    RAISE NOTICE '✅ TABELAS ATIVAS:';
    FOR rec IN 
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE '%missoes%'
        ORDER BY tablename
    LOOP
        RAISE NOTICE '  - %: %', rec.tablename, rec.tamanho;
    END LOOP;
    
    -- Verificar foreign keys ativas
    RAISE NOTICE '';
    RAISE NOTICE '🔗 FOREIGN KEYS ATIVAS:';
    FOR rec IN 
        SELECT 
            tc.table_name,
            tc.constraint_name,
            ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name LIKE '%participacoes%'
    LOOP
        RAISE NOTICE '  ✅ %: % -> %', rec.table_name, rec.constraint_name, rec.foreign_table_name;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORREÇÃO DE FOREIGN KEYS CONCLUÍDA!';
END $$;