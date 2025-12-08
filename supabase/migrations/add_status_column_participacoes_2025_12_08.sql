-- Adicionar coluna status à tabela participacoes_formacao
-- Data: 2025-12-08

-- Verificar se a coluna já existe
DO $$ 
BEGIN
    -- Adicionar coluna status se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participacoes_formacao' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE participacoes_formacao 
        ADD COLUMN status VARCHAR(20) DEFAULT 'inscrito';
        
        RAISE NOTICE 'Coluna status adicionada à tabela participacoes_formacao';
    ELSE
        RAISE NOTICE 'Coluna status já existe na tabela participacoes_formacao';
    END IF;
END $$;

-- Atualizar registros existentes para ter status 'inscrito'
UPDATE participacoes_formacao 
SET status = 'inscrito' 
WHERE status IS NULL;

-- Adicionar constraint para valores válidos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'participacoes_formacao_status_check'
    ) THEN
        ALTER TABLE participacoes_formacao 
        ADD CONSTRAINT participacoes_formacao_status_check 
        CHECK (status IN ('inscrito', 'cancelado', 'concluido', 'faltou'));
        
        RAISE NOTICE 'Constraint de status adicionada';
    ELSE
        RAISE NOTICE 'Constraint de status já existe';
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