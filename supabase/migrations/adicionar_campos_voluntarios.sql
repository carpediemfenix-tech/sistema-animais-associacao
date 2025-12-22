-- Adicionar campos de localização e data de ingresso
ALTER TABLE voluntarios 
ADD COLUMN IF NOT EXISTS localidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(20),
ADD COLUMN IF NOT EXISTS distrito VARCHAR(50),
ADD COLUMN IF NOT EXISTS data_ingresso DATE DEFAULT CURRENT_DATE;

-- Atualizar registos existentes com data de ingresso baseada na data de criação
UPDATE voluntarios 
SET data_ingresso = created_at::date 
WHERE data_ingresso IS NULL;