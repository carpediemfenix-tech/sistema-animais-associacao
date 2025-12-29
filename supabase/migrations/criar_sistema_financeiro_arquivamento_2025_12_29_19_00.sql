-- =====================================================
-- CRIAR TABELA DE MOVIMENTOS FINANCEIROS E SISTEMA DE ARQUIVAMENTO
-- Data: 2025-12-29 19:00
-- Objetivo: Corrigir erro da tabela financeira e implementar arquivamento
-- =====================================================

-- FASE 1: Criar tabela de movimentos financeiros
CREATE TABLE IF NOT EXISTS movimentos_financeiros_2025_12_29_07_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    data_movimento DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo_pagamento VARCHAR(50),
    referencia VARCHAR(100),
    observacoes TEXT,
    comprovativo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system',
    
    -- Foreign Key
    CONSTRAINT fk_movimentos_financeiros_missao 
        FOREIGN KEY (missao_id) 
        REFERENCES missoes_2025_12_29_07_00(id) 
        ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_missao_id ON movimentos_financeiros_2025_12_29_07_00(missao_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_tipo ON movimentos_financeiros_2025_12_29_07_00(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_data ON movimentos_financeiros_2025_12_29_07_00(data_movimento);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_categoria ON movimentos_financeiros_2025_12_29_07_00(categoria);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_movimentos_financeiros_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_movimentos_financeiros_updated_at
    BEFORE UPDATE ON movimentos_financeiros_2025_12_29_07_00
    FOR EACH ROW
    EXECUTE FUNCTION update_movimentos_financeiros_updated_at();

-- Comentário
COMMENT ON TABLE movimentos_financeiros_2025_12_29_07_00 IS 'Movimentos financeiros das missões - receitas e despesas';

-- FASE 2: Adicionar campo arquivada à tabela de missões
DO $$
BEGIN
    -- Verificar se a coluna arquivada já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'missoes_2025_12_29_07_00'
        AND column_name = 'arquivada'
    ) THEN
        -- Adicionar coluna arquivada
        ALTER TABLE missoes_2025_12_29_07_00 
        ADD COLUMN arquivada BOOLEAN DEFAULT FALSE;
        
        -- Adicionar coluna data_arquivamento
        ALTER TABLE missoes_2025_12_29_07_00 
        ADD COLUMN data_arquivamento TIMESTAMP NULL;
        
        -- Adicionar coluna arquivada_por
        ALTER TABLE missoes_2025_12_29_07_00 
        ADD COLUMN arquivada_por VARCHAR(100) NULL;
        
        RAISE NOTICE '✅ Colunas de arquivamento adicionadas à tabela de missões';
    ELSE
        RAISE NOTICE '⚠️ Colunas de arquivamento já existem';
    END IF;
END $$;

-- Criar índice para missões arquivadas
CREATE INDEX IF NOT EXISTS idx_missoes_arquivada ON missoes_2025_12_29_07_00(arquivada);
CREATE INDEX IF NOT EXISTS idx_missoes_data_arquivamento ON missoes_2025_12_29_07_00(data_arquivamento);

-- Comentários nas novas colunas
COMMENT ON COLUMN missoes_2025_12_29_07_00.arquivada IS 'Indica se a missão foi arquivada (não aparece na listagem principal)';
COMMENT ON COLUMN missoes_2025_12_29_07_00.data_arquivamento IS 'Data e hora em que a missão foi arquivada';
COMMENT ON COLUMN missoes_2025_12_29_07_00.arquivada_por IS 'Usuário que arquivou a missão';

-- FASE 3: Inserir dados de exemplo para movimentos financeiros
DO $$
DECLARE
    missao_id UUID;
    inserted_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 INSERINDO DADOS DE EXEMPLO - MOVIMENTOS FINANCEIROS';
    RAISE NOTICE '=====================================================';
    
    -- Inserir movimentos de exemplo para cada missão
    FOR missao_id IN 
        SELECT id FROM missoes_2025_12_29_07_00 LIMIT 3
    LOOP
        -- Inserir algumas receitas
        INSERT INTO movimentos_financeiros_2025_12_29_07_00 
        (missao_id, tipo, categoria, descricao, valor, data_movimento, metodo_pagamento, observacoes)
        VALUES 
        (missao_id, 'receita', 'Doação', 'Doação de apoiador', 500.00, CURRENT_DATE - INTERVAL '5 days', 'Transferência', 'Doação para apoio à missão'),
        (missao_id, 'receita', 'Subsídio', 'Subsídio municipal', 1000.00, CURRENT_DATE - INTERVAL '3 days', 'Transferência', 'Apoio da câmara municipal'),
        (missao_id, 'despesa', 'Alimentação', 'Ração para animais', 150.00, CURRENT_DATE - INTERVAL '2 days', 'Cartão', 'Compra de ração premium'),
        (missao_id, 'despesa', 'Veterinário', 'Consulta veterinária', 80.00, CURRENT_DATE - INTERVAL '1 day', 'Dinheiro', 'Check-up dos animais'),
        (missao_id, 'despesa', 'Transporte', 'Combustível para transporte', 45.00, CURRENT_DATE, 'Cartão', 'Deslocações da equipa')
        ON CONFLICT DO NOTHING;
        
        inserted_count := inserted_count + 5;
    END LOOP;
    
    RAISE NOTICE '  ✅ % movimentos financeiros de exemplo criados', inserted_count;
END $$;

-- FASE 4: Remover tabelas antigas de movimentos financeiros
DO $$
DECLARE
    tabela_nome TEXT;
    tamanho_tabela TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🗑️ REMOVENDO TABELAS ANTIGAS DE MOVIMENTOS FINANCEIROS';
    RAISE NOTICE '==================================================';
    
    -- Lista de tabelas antigas para remover
    FOR tabela_nome IN 
        SELECT tablename
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE 'movimentos_financeiros_2025_12_%'
        AND tablename != 'movimentos_financeiros_2025_12_29_07_00'
    LOOP
        -- Obter tamanho antes da remoção
        SELECT pg_size_pretty(pg_total_relation_size('public.'||tabela_nome)) INTO tamanho_tabela;
        
        -- Registrar no log
        INSERT INTO tabelas_removidas_log (nome_tabela, tamanho_antes, motivo)
        VALUES (tabela_nome, tamanho_tabela, 'Tabela antiga de movimentos financeiros');
        
        -- Remover a tabela
        EXECUTE 'DROP TABLE IF EXISTS public.' || tabela_nome || ' CASCADE';
        
        RAISE NOTICE '  ✅ Removida: % (tamanho: %)', tabela_nome, tamanho_tabela;
    END LOOP;
END $$;

-- FASE 5: Verificação final
DO $$
DECLARE
    rec RECORD;
    total_movimentos INTEGER;
    total_missoes INTEGER;
    missoes_arquivadas INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 VERIFICAÇÃO FINAL';
    RAISE NOTICE '==================';
    
    -- Contar movimentos financeiros
    SELECT COUNT(*) INTO total_movimentos FROM movimentos_financeiros_2025_12_29_07_00;
    RAISE NOTICE '✅ Total de movimentos financeiros: %', total_movimentos;
    
    -- Contar missões
    SELECT COUNT(*) INTO total_missoes FROM missoes_2025_12_29_07_00;
    RAISE NOTICE '✅ Total de missões: %', total_missoes;
    
    -- Contar missões arquivadas
    SELECT COUNT(*) INTO missoes_arquivadas FROM missoes_2025_12_29_07_00 WHERE arquivada = TRUE;
    RAISE NOTICE '✅ Missões arquivadas: %', missoes_arquivadas;
    
    -- Mostrar estrutura da tabela de movimentos
    RAISE NOTICE '';
    RAISE NOTICE '📋 ESTRUTURA DA TABELA DE MOVIMENTOS FINANCEIROS:';
    FOR rec IN 
        SELECT 
            column_name,
            data_type,
            is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'movimentos_financeiros_2025_12_29_07_00'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (nullable: %)', rec.column_name, rec.data_type, rec.is_nullable;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SISTEMA FINANCEIRO E DE ARQUIVAMENTO IMPLEMENTADO!';
    RAISE NOTICE '✅ Tabela de movimentos financeiros criada';
    RAISE NOTICE '✅ Sistema de arquivamento adicionado às missões';
    RAISE NOTICE '✅ Dados de exemplo inseridos';
    RAISE NOTICE '✅ Tabelas antigas removidas';
END $$;