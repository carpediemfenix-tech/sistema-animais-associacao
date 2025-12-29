-- =====================================================
-- ATUALIZAR ESTRUTURA DA TABELA DE PARTICIPAÇÕES
-- Data: 2025-12-29 17:00
-- Objetivo: Adicionar campos em falta na tabela
-- =====================================================

-- FASE 1: Verificar estrutura atual da tabela
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO ESTRUTURA ATUAL DA TABELA';
    RAISE NOTICE '=====================================';
    
    FOR rec IN 
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'participacoes_missoes_2025_12_29_07_00'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (nullable: %, default: %)', 
            rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
    END LOOP;
END $$;

-- FASE 2: Adicionar campos em falta
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '➕ ADICIONANDO CAMPOS EM FALTA';
    RAISE NOTICE '=============================';
    
    -- Adicionar campo horas_dedicadas se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'participacoes_missoes_2025_12_29_07_00'
        AND column_name = 'horas_dedicadas'
    ) THEN
        ALTER TABLE participacoes_missoes_2025_12_29_07_00 
        ADD COLUMN horas_dedicadas DECIMAL(5,2) DEFAULT 0;
        
        RAISE NOTICE '  ✅ Campo horas_dedicadas adicionado';
    ELSE
        RAISE NOTICE '  ⚠️ Campo horas_dedicadas já existe';
    END IF;
    
    -- Adicionar campo pontos_atribuidos se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'participacoes_missoes_2025_12_29_07_00'
        AND column_name = 'pontos_atribuidos'
    ) THEN
        ALTER TABLE participacoes_missoes_2025_12_29_07_00 
        ADD COLUMN pontos_atribuidos INTEGER DEFAULT 0;
        
        RAISE NOTICE '  ✅ Campo pontos_atribuidos adicionado';
    ELSE
        RAISE NOTICE '  ⚠️ Campo pontos_atribuidos já existe';
    END IF;
    
    -- Adicionar comentários aos novos campos
    COMMENT ON COLUMN participacoes_missoes_2025_12_29_07_00.horas_dedicadas IS 'Horas dedicadas pelo voluntário na missão';
    COMMENT ON COLUMN participacoes_missoes_2025_12_29_07_00.pontos_atribuidos IS 'Pontos atribuídos ao voluntário pela participação';
    
END $$;

-- FASE 3: Criar índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_participacoes_pontos ON participacoes_missoes_2025_12_29_07_00(pontos_atribuidos);
CREATE INDEX IF NOT EXISTS idx_participacoes_horas ON participacoes_missoes_2025_12_29_07_00(horas_dedicadas);

-- FASE 4: Verificar estrutura final
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 ESTRUTURA FINAL DA TABELA';
    RAISE NOTICE '===========================';
    
    FOR rec IN 
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'participacoes_missoes_2025_12_29_07_00'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (nullable: %, default: %)', 
            rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ESTRUTURA DA TABELA ATUALIZADA COM SUCESSO!';
END $$;

-- FASE 5: Atualizar dados existentes (se houver)
UPDATE participacoes_missoes_2025_12_29_07_00 
SET 
    horas_dedicadas = 8.0,
    pontos_atribuidos = CASE 
        WHEN funcao = 'Coordenador' THEN 25
        WHEN funcao = 'Especialista' THEN 15
        WHEN funcao = 'Participante' THEN 10
        ELSE 8
    END
WHERE horas_dedicadas IS NULL OR pontos_atribuidos IS NULL;

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ TABELA DE PARTICIPAÇÕES COMPLETAMENTE ATUALIZADA!';
    RAISE NOTICE '📋 Campos adicionados: horas_dedicadas, pontos_atribuidos';
    RAISE NOTICE '🔍 Índices criados para performance';
    RAISE NOTICE '📊 Dados existentes atualizados';
END $$;