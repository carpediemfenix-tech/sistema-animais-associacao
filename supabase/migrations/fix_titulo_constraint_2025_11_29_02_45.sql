-- ========================================
-- CORRIGIR CONSTRAINT DA COLUNA TITULO
-- ========================================

-- Verificar estrutura atual da tabela eventos_animal
SELECT 
    'Estrutura atual da tabela eventos_animal:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'eventos_animal' 
ORDER BY ordinal_position;

-- Verificar constraints NOT NULL
SELECT 
    'Constraints NOT NULL:' as info,
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'eventos_animal' 
AND is_nullable = 'NO';

-- Tornar a coluna titulo opcional (nullable) se ela existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'eventos_animal' AND column_name = 'titulo') THEN
        ALTER TABLE eventos_animal ALTER COLUMN titulo DROP NOT NULL;
        RAISE NOTICE 'Coluna titulo agora é opcional (nullable)';
    ELSE
        RAISE NOTICE 'Coluna titulo não existe na tabela';
    END IF;
END $$;

-- Verificar estrutura final
SELECT 
    'Estrutura final da tabela eventos_animal:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'eventos_animal' 
ORDER BY ordinal_position;

-- Testar inserção de um evento de exemplo
INSERT INTO eventos_animal (
    animal_id, 
    tipo_evento, 
    data_evento, 
    descricao, 
    importante
) 
SELECT 
    (SELECT id FROM animais LIMIT 1),
    '🧪 Teste Sistema',
    CURRENT_DATE,
    'Evento de teste para verificar funcionamento',
    false
WHERE EXISTS (SELECT 1 FROM animais LIMIT 1);

-- Verificar se o teste funcionou
SELECT 
    'Teste de inserção:' as info,
    COUNT(*) as eventos_teste
FROM eventos_animal 
WHERE tipo_evento = '🧪 Teste Sistema';

-- Limpar evento de teste
DELETE FROM eventos_animal WHERE tipo_evento = '🧪 Teste Sistema';