-- Verificar se o estado 'Em Resgate' existe na tabela tipos_estado
SELECT id, nome, cor, ativo 
FROM tipos_estado 
WHERE nome = 'Em Resgate';

-- Se não existir, criar o estado 'Em Resgate' necessário para o módulo Denúncias
INSERT INTO tipos_estado (nome, cor, ativo, ordem, created_at, updated_at)
SELECT 'Em Resgate', '#FFA500', true, 99, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tipos_estado WHERE nome = 'Em Resgate'
);

-- Verificar todos os estados disponíveis para confirmação
SELECT id, nome, cor, ativo, ordem 
FROM tipos_estado 
ORDER BY ordem;

-- Verificar estrutura da tabela animais para confirmar campos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND table_schema = 'public'
ORDER BY ordinal_position;