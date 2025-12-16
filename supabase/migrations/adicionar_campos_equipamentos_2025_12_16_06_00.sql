-- Verificar estrutura da tabela equipamentos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'equipamentos_2025_12_13_01_00' 
ORDER BY ordinal_position;

-- Adicionar campos em falta se não existirem
ALTER TABLE public.equipamentos_2025_12_13_01_00 
ADD COLUMN IF NOT EXISTS data_validade DATE,
ADD COLUMN IF NOT EXISTS garantia_ate DATE,
ADD COLUMN IF NOT EXISTS fornecedor VARCHAR(200),
ADD COLUMN IF NOT EXISTS modelo VARCHAR(200),
ADD COLUMN IF NOT EXISTS marca VARCHAR(200),
ADD COLUMN IF NOT EXISTS cor VARCHAR(50),
ADD COLUMN IF NOT EXISTS peso DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS dimensoes VARCHAR(100),
ADD COLUMN IF NOT EXISTS manual_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS qr_code VARCHAR(200),
ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS centro_custo VARCHAR(100),
ADD COLUMN IF NOT EXISTS categoria_fiscal VARCHAR(100),
ADD COLUMN IF NOT EXISTS depreciacao_anual DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vida_util_anos INTEGER DEFAULT 5;