-- Adicionar coluna data_nascimento à tabela animais
ALTER TABLE animais 
ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- Verificar se a coluna foi adicionada com sucesso
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND column_name = 'data_nascimento';

-- Comentário para documentação
COMMENT ON COLUMN animais.data_nascimento IS 'Data de nascimento do animal (opcional, pode ser estimada)';