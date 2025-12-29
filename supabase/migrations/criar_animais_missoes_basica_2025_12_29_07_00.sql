-- =====================================================
-- CRIAR TABELA DE ANIMAIS DE MISSÕES - VERSÃO BÁSICA
-- Data: 2025-12-29 17:00
-- Objetivo: Criar tabela funcional para animais de missões
-- =====================================================

-- Criar nova tabela de animais de missões
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
        ON DELETE CASCADE
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

-- Inserir dados de exemplo básicos
DO $$
DECLARE
    missao_id UUID;
    animal_id UUID;
BEGIN
    -- Obter uma missão existente
    SELECT id INTO missao_id FROM missoes_2025_12_29_07_00 LIMIT 1;
    
    -- Obter um animal existente
    SELECT id INTO animal_id FROM animais LIMIT 1;
    
    IF missao_id IS NOT NULL AND animal_id IS NOT NULL THEN
        -- Inserir vinculação de exemplo
        INSERT INTO missoes_animais_2025_12_29_07_00 
        (missao_id, animal_id, funcao_animal, data_vinculacao, status_participacao, observacoes)
        VALUES 
        (missao_id, animal_id, 'participante', CURRENT_DATE, 'ativa', 'Vinculação de exemplo criada automaticamente')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Remover tabelas antigas
DO $$
DECLARE
    tabela_nome TEXT;
    tamanho_tabela TEXT;
BEGIN
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
    END LOOP;
END $$;