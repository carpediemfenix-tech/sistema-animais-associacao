-- Sistema de Avaliação e Histórico de Formações
-- Data: 2025-12-08
-- Adicionar campos de avaliação à tabela participacoes_formacao

-- Adicionar campos de avaliação
DO $$ 
BEGIN
    -- Nota final (0-20 ou 0-100, dependendo do sistema)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participacoes_formacao' 
        AND column_name = 'nota_final'
    ) THEN
        ALTER TABLE participacoes_formacao 
        ADD COLUMN nota_final DECIMAL(5,2);
        RAISE NOTICE 'Coluna nota_final adicionada';
    END IF;

    -- Resultado da avaliação
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participacoes_formacao' 
        AND column_name = 'resultado'
    ) THEN
        ALTER TABLE participacoes_formacao 
        ADD COLUMN resultado VARCHAR(20);
        RAISE NOTICE 'Coluna resultado adicionada';
    END IF;

    -- Relatório de desempenho
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participacoes_formacao' 
        AND column_name = 'relatorio_desempenho'
    ) THEN
        ALTER TABLE participacoes_formacao 
        ADD COLUMN relatorio_desempenho TEXT;
        RAISE NOTICE 'Coluna relatorio_desempenho adicionada';
    END IF;

    -- Data da avaliação
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participacoes_formacao' 
        AND column_name = 'data_avaliacao'
    ) THEN
        ALTER TABLE participacoes_formacao 
        ADD COLUMN data_avaliacao TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna data_avaliacao adicionada';
    END IF;

    -- Quem fez a avaliação
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participacoes_formacao' 
        AND column_name = 'avaliado_por'
    ) THEN
        ALTER TABLE participacoes_formacao 
        ADD COLUMN avaliado_por UUID;
        RAISE NOTICE 'Coluna avaliado_por adicionada';
    END IF;
END $$;

-- Atualizar constraint de status para incluir novos valores
DO $$
BEGIN
    -- Remover constraint antiga se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'participacoes_formacao_status_check'
    ) THEN
        ALTER TABLE participacoes_formacao 
        DROP CONSTRAINT participacoes_formacao_status_check;
        RAISE NOTICE 'Constraint antiga de status removida';
    END IF;

    -- Adicionar nova constraint com valores expandidos
    ALTER TABLE participacoes_formacao 
    ADD CONSTRAINT participacoes_formacao_status_check 
    CHECK (status IN ('inscrito', 'cancelado', 'concluido', 'faltou', 'em_avaliacao'));
    RAISE NOTICE 'Nova constraint de status adicionada';
END $$;

-- Adicionar constraint para resultado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'participacoes_formacao_resultado_check'
    ) THEN
        ALTER TABLE participacoes_formacao 
        ADD CONSTRAINT participacoes_formacao_resultado_check 
        CHECK (resultado IN ('aprovado', 'reprovado', 'em_avaliacao') OR resultado IS NULL);
        RAISE NOTICE 'Constraint de resultado adicionada';
    END IF;
END $$;

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participacoes_formacao' 
ORDER BY ordinal_position;