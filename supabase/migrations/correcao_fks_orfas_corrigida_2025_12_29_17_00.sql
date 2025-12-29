-- =====================================================
-- CORREÇÃO DE FOREIGN KEYS ÓRFÃS - VERSÃO CORRIGIDA
-- Data: 2025-12-29 17:00
-- Objetivo: Corrigir tabelas com FK para tabelas removidas
-- =====================================================

-- FASE 1: REMOVER TABELAS RESTANTES COM TIMESTAMPS ANTIGOS
DO $$
DECLARE
    tabela_nome TEXT;
    tamanho_tabela TEXT;
BEGIN
    RAISE NOTICE '🗑️ REMOVENDO TABELAS RESTANTES COM TIMESTAMPS ANTIGOS';
    RAISE NOTICE '===================================================';
    
    -- Buscar e remover todas as tabelas com timestamps antigos
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
    
    RAISE NOTICE '🎉 REMOÇÃO DE TABELAS ÓRFÃS CONCLUÍDA!';
END $$;

-- FASE 2: CRIAR TABELA DE PARTICIPAÇÕES ATUALIZADA
CREATE TABLE IF NOT EXISTS participacoes_missoes_2025_12_29_07_00 (
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
CREATE INDEX IF NOT EXISTS idx_participacoes_missao_id ON participacoes_missoes_2025_12_29_07_00(missao_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_voluntario_id ON participacoes_missoes_2025_12_29_07_00(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_data ON participacoes_missoes_2025_12_29_07_00(data_participacao);

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

-- FASE 3: INSERIR DADOS DE EXEMPLO
DO $$
DECLARE
    missao_id UUID;
    voluntario_id UUID;
BEGIN
    RAISE NOTICE '📋 INSERINDO DADOS DE EXEMPLO';
    RAISE NOTICE '============================';
    
    -- Obter uma missão existente
    SELECT id INTO missao_id FROM missoes_2025_12_29_07_00 LIMIT 1;
    
    -- Obter um voluntário existente
    SELECT id INTO voluntario_id FROM voluntarios WHERE ativo = true LIMIT 1;
    
    IF missao_id IS NOT NULL AND voluntario_id IS NOT NULL THEN
        -- Inserir participação de exemplo
        INSERT INTO participacoes_missoes_2025_12_29_07_00 
        (missao_id, voluntario_id, funcao, data_participacao, status_participacao, observacoes)
        VALUES 
        (missao_id, voluntario_id, 'Coordenador', CURRENT_DATE, 'ativa', 'Participação de exemplo criada automaticamente');
        
        RAISE NOTICE '  ✅ Participação de exemplo criada';
    ELSE
        RAISE NOTICE '  ⚠️ Não foi possível criar participação de exemplo (sem missões ou voluntários)';
    END IF;
END $$;

-- FASE 4: VERIFICAÇÃO FINAL
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 VERIFICAÇÃO FINAL';
    RAISE NOTICE '==================';
    
    -- Listar tabelas de missões ativas
    RAISE NOTICE '✅ TABELAS DE MISSÕES ATIVAS:';
    FOR rec IN 
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND (tablename LIKE '%missoes%' OR tablename LIKE '%participacoes%')
        AND tablename NOT LIKE '%log%'
        ORDER BY tablename
    LOOP
        RAISE NOTICE '  - %: %', rec.tablename, rec.tamanho;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORREÇÃO DE FOREIGN KEYS CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '✅ Tabelas órfãs removidas';
    RAISE NOTICE '✅ Nova tabela de participações criada';
    RAISE NOTICE '✅ Foreign keys corrigidas';
END $$;