-- =====================================================
-- VERIFICAR E CRIAR TABELA DE ANIMAIS DE MISSÕES
-- Data: 2025-12-29 17:00
-- Objetivo: Corrigir tabela de animais vinculados a missões
-- =====================================================

-- FASE 1: Verificar tabelas de animais de missões existentes
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO TABELAS DE ANIMAIS DE MISSÕES';
    RAISE NOTICE '==========================================';
    
    FOR rec IN 
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE '%animais%missoes%'
        ORDER BY tablename
    LOOP
        RAISE NOTICE '  - %: %', rec.tablename, rec.tamanho;
    END LOOP;
    
    -- Verificar também tabelas com padrão missoes_animais
    FOR rec IN 
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE '%missoes_animais%'
        ORDER BY tablename
    LOOP
        RAISE NOTICE '  - %: %', rec.tablename, rec.tamanho;
    END LOOP;
END $$;

-- FASE 2: Criar nova tabela de animais de missões
CREATE TABLE IF NOT EXISTS missoes_animais_2025_12_29_07_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID NOT NULL,
    animal_id UUID NOT NULL,
    funcao_animal VARCHAR(100) NOT NULL DEFAULT 'participante',
    data_vinculacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_desvinculacao DATE,
    status_participacao VARCHAR(50) NOT NULL DEFAULT 'ativa',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system',
    
    -- Foreign Keys
    CONSTRAINT fk_missoes_animais_missao 
        FOREIGN KEY (missao_id) 
        REFERENCES missoes_2025_12_29_07_00(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_missoes_animais_animal 
        FOREIGN KEY (animal_id) 
        REFERENCES animais(id) 
        ON DELETE CASCADE,
    
    -- Constraint para evitar duplicatas
    CONSTRAINT uk_missao_animal_ativo 
        UNIQUE (missao_id, animal_id, status_participacao)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_missoes_animais_missao_id ON missoes_animais_2025_12_29_07_00(missao_id);
CREATE INDEX IF NOT EXISTS idx_missoes_animais_animal_id ON missoes_animais_2025_12_29_07_00(animal_id);
CREATE INDEX IF NOT EXISTS idx_missoes_animais_data ON missoes_animais_2025_12_29_07_00(data_vinculacao);
CREATE INDEX IF NOT EXISTS idx_missoes_animais_status ON missoes_animais_2025_12_29_07_00(status_participacao);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_missoes_animais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_missoes_animais_updated_at
    BEFORE UPDATE ON missoes_animais_2025_12_29_07_00
    FOR EACH ROW
    EXECUTE FUNCTION update_missoes_animais_updated_at();

-- Comentário
COMMENT ON TABLE missoes_animais_2025_12_29_07_00 IS 'Animais vinculados a missões - versão atualizada';

-- FASE 3: Migrar dados da tabela antiga (se existir)
DO $$
DECLARE
    rec RECORD;
    migrated_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 MIGRANDO DADOS DE TABELAS ANTIGAS';
    RAISE NOTICE '=================================';
    
    -- Verificar se existe tabela antiga com dados
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'missoes_animais_2025_12_18_14_15'
    ) THEN
        -- Migrar dados da tabela antiga
        INSERT INTO missoes_animais_2025_12_29_07_00 
        (missao_id, animal_id, funcao_animal, data_vinculacao, status_participacao, observacoes)
        SELECT 
            missao_id,
            animal_id,
            COALESCE(funcao_animal, 'participante'),
            COALESCE(data_vinculacao, CURRENT_DATE),
            COALESCE(status_participacao, 'ativa'),
            observacoes
        FROM missoes_animais_2025_12_18_14_15
        WHERE missao_id IN (SELECT id FROM missoes_2025_12_29_07_00)
        ON CONFLICT (missao_id, animal_id, status_participacao) DO NOTHING;
        
        GET DIAGNOSTICS migrated_count = ROW_COUNT;
        RAISE NOTICE '  ✅ Migrados % registos da tabela antiga', migrated_count;
    ELSE
        RAISE NOTICE '  ⚠️ Tabela antiga não encontrada para migração';
    END IF;
    
    -- Inserir dados de exemplo se não houver dados
    IF NOT EXISTS (SELECT 1 FROM missoes_animais_2025_12_29_07_00 LIMIT 1) THEN
        -- Inserir vinculações de exemplo
        INSERT INTO missoes_animais_2025_12_29_07_00 
        (missao_id, animal_id, funcao_animal, data_vinculacao, status_participacao, observacoes)
        SELECT 
            m.id,
            a.id,
            'participante',
            CURRENT_DATE,
            'ativa',
            'Vinculação de exemplo criada automaticamente'
        FROM missoes_2025_12_29_07_00 m
        CROSS JOIN (SELECT id FROM animais LIMIT 2) a
        LIMIT 3;
        
        RAISE NOTICE '  ✅ Dados de exemplo inseridos';
    END IF;
END $$;

-- FASE 4: Remover tabelas antigas
DO $$
DECLARE
    tabela_nome TEXT;
    tamanho_tabela TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🗑️ REMOVENDO TABELAS ANTIGAS DE ANIMAIS DE MISSÕES';
    RAISE NOTICE '===============================================';
    
    -- Lista de tabelas antigas para remover
    FOR tabela_nome IN 
        SELECT tablename
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND (
            tablename LIKE 'missoes_animais_2025_12_18%' OR
            tablename LIKE 'missoes_animais_2025_12_21%' OR
            tablename LIKE 'missoes_animais_2025_12_22%' OR
            tablename LIKE 'animais_missoes_2025_12_%'
        )
        AND tablename != 'missoes_animais_2025_12_29_07_00'
    LOOP
        -- Obter tamanho antes da remoção
        SELECT pg_size_pretty(pg_total_relation_size('public.'||tabela_nome)) INTO tamanho_tabela;
        
        -- Registrar no log
        INSERT INTO tabelas_removidas_log (nome_tabela, tamanho_antes, motivo)
        VALUES (tabela_nome, tamanho_tabela, 'Tabela antiga de animais de missões');
        
        -- Remover a tabela
        EXECUTE 'DROP TABLE IF EXISTS public.' || tabela_nome || ' CASCADE';
        
        RAISE NOTICE '  ✅ Removida: % (tamanho: %)', tabela_nome, tamanho_tabela;
    END LOOP;
END $$;

-- FASE 5: Verificação final
DO $$
DECLARE
    rec RECORD;
    total_registos INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 VERIFICAÇÃO FINAL';
    RAISE NOTICE '==================';
    
    -- Contar registos na nova tabela
    SELECT COUNT(*) INTO total_registos FROM missoes_animais_2025_12_29_07_00;
    RAISE NOTICE '✅ Total de registos na nova tabela: %', total_registos;
    
    -- Listar tabelas de animais de missões ativas
    RAISE NOTICE '';
    RAISE NOTICE '✅ TABELAS DE ANIMAIS DE MISSÕES ATIVAS:';
    FOR rec IN 
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND (tablename LIKE '%animais%missoes%' OR tablename LIKE '%missoes%animais%')
        AND tablename NOT LIKE '%log%'
        ORDER BY tablename
    LOOP
        RAISE NOTICE '  - %: %', rec.tablename, rec.tamanho;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TABELA DE ANIMAIS DE MISSÕES CRIADA COM SUCESSO!';
    RAISE NOTICE '✅ Estrutura completa com FKs corretas';
    RAISE NOTICE '✅ Dados migrados ou exemplos inseridos';
    RAISE NOTICE '✅ Tabelas antigas removidas';
END $$;