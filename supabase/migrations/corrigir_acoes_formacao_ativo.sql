-- Verificar estrutura atual da tabela acoes_formacao
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'acoes_formacao'
ORDER BY ordinal_position;

-- Adicionar campo ativo se não existir
ALTER TABLE acoes_formacao 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Atualizar registos existentes para ativo = true
UPDATE acoes_formacao SET ativo = true WHERE ativo IS NULL;