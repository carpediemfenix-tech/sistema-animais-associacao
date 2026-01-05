-- Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'equipamentos_2025_12_13_01_00'
ORDER BY ordinal_position;

-- Adicionar colunas que estão faltando na tabela
ALTER TABLE equipamentos_2025_12_13_01_00 
ADD COLUMN IF NOT EXISTS codigo_interno VARCHAR(50),
ADD COLUMN IF NOT EXISTS data_validade DATE,
ADD COLUMN IF NOT EXISTS condicao VARCHAR(20) DEFAULT 'bom',
ADD COLUMN IF NOT EXISTS garantia_ate DATE,
ADD COLUMN IF NOT EXISTS fornecedor VARCHAR(100),
ADD COLUMN IF NOT EXISTS modelo VARCHAR(100),
ADD COLUMN IF NOT EXISTS marca VARCHAR(100),
ADD COLUMN IF NOT EXISTS cor VARCHAR(50),
ADD COLUMN IF NOT EXISTS peso DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS dimensoes VARCHAR(100),
ADD COLUMN IF NOT EXISTS manual_url TEXT,
ADD COLUMN IF NOT EXISTS foto_url TEXT,
ADD COLUMN IF NOT EXISTS qr_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES voluntarios(id),
ADD COLUMN IF NOT EXISTS centro_custo VARCHAR(100),
ADD COLUMN IF NOT EXISTS categoria_fiscal VARCHAR(50),
ADD COLUMN IF NOT EXISTS depreciacao_anual DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS vida_util_anos INTEGER;

-- Atualizar equipamentos existentes com codigo_interno baseado no codigo
UPDATE equipamentos_2025_12_13_01_00 
SET codigo_interno = codigo 
WHERE codigo_interno IS NULL AND codigo IS NOT NULL;

-- Verificar se a atualização funcionou
SELECT codigo, codigo_interno, estado, localizacao 
FROM equipamentos_2025_12_13_01_00 
LIMIT 5;