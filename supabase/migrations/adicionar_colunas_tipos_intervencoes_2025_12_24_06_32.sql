-- Adicionar colunas em falta na tabela tipos_intervencoes
ALTER TABLE tipos_intervencoes 
ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT 'consulta',
ADD COLUMN IF NOT EXISTS icone VARCHAR(10) DEFAULT '🏥',
ADD COLUMN IF NOT EXISTS cor VARCHAR(7) DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS custo_estimado DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS duracao_estimada INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS requer_anestesia BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requer_internamento BOOLEAN DEFAULT false;

-- Atualizar registros existentes com valores padrão se as colunas estavam NULL
UPDATE tipos_intervencoes 
SET 
    categoria = COALESCE(categoria, 'consulta'),
    icone = COALESCE(icone, '🏥'),
    cor = COALESCE(cor, '#3B82F6'),
    custo_estimado = COALESCE(custo_estimado, 0),
    duracao_estimada = COALESCE(duracao_estimada, 60),
    requer_anestesia = COALESCE(requer_anestesia, false),
    requer_internamento = COALESCE(requer_internamento, false)
WHERE categoria IS NULL OR icone IS NULL OR cor IS NULL;