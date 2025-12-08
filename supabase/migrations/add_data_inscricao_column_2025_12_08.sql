-- Verificar e adicionar coluna data_inscricao se necessário
-- Data: 2025-12-08

-- Verificar se a coluna data_inscricao existe
DO $$ 
BEGIN
    -- Adicionar coluna data_inscricao se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participacoes_formacao' 
        AND column_name = 'data_inscricao'
    ) THEN
        ALTER TABLE participacoes_formacao 
        ADD COLUMN data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Coluna data_inscricao adicionada à tabela participacoes_formacao';
    ELSE
        RAISE NOTICE 'Coluna data_inscricao já existe na tabela participacoes_formacao';
    END IF;
END $$;

-- Atualizar registros existentes que não têm data_inscricao
UPDATE participacoes_formacao 
SET data_inscricao = created_at 
WHERE data_inscricao IS NULL AND created_at IS NOT NULL;

-- Se não há created_at, usar timestamp atual
UPDATE participacoes_formacao 
SET data_inscricao = NOW() 
WHERE data_inscricao IS NULL;

-- Verificar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participacoes_formacao' 
ORDER BY ordinal_position;

-- Verificar dados existentes
SELECT COUNT(*) as total_participacoes FROM participacoes_formacao;
SELECT status, COUNT(*) as count FROM participacoes_formacao GROUP BY status;