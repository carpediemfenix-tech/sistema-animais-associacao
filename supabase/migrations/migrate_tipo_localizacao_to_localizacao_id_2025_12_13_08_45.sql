-- Verificar estrutura atual
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal'
AND column_name IN ('tipo_localizacao', 'localizacao_id');

-- Remover a constraint NOT NULL da coluna tipo_localizacao se existir
ALTER TABLE localizacoes_animal ALTER COLUMN tipo_localizacao DROP NOT NULL;

-- Ou melhor, vamos migrar os dados de tipo_localizacao para localizacao_id
-- Primeiro, verificar se há dados na coluna tipo_localizacao
SELECT DISTINCT tipo_localizacao FROM localizacoes_animal WHERE tipo_localizacao IS NOT NULL LIMIT 5;

-- Atualizar localizacao_id baseado no tipo_localizacao
UPDATE localizacoes_animal 
SET localizacao_id = (
    SELECT id FROM localizacoes 
    WHERE nome ILIKE '%' || COALESCE(tipo_localizacao, 'Casa de Acolhimento') || '%'
    LIMIT 1
)
WHERE localizacao_id IS NULL AND tipo_localizacao IS NOT NULL;

-- Para registros sem tipo_localizacao, usar uma localização padrão
UPDATE localizacoes_animal 
SET localizacao_id = (
    SELECT id FROM localizacoes 
    WHERE nome ILIKE '%Casa de Acolhimento%'
    LIMIT 1
)
WHERE localizacao_id IS NULL;

-- Agora podemos remover a coluna tipo_localizacao
ALTER TABLE localizacoes_animal DROP COLUMN IF EXISTS tipo_localizacao;