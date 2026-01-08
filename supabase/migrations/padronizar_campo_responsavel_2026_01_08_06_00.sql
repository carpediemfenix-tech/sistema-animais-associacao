-- Verificar se existe coluna responsavel_id na tabela animais
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND column_name IN ('responsavel_id', 'voluntario_responsavel');

-- Verificar dados existentes para entender qual campo está sendo usado
SELECT 
    COUNT(*) as total_animais,
    COUNT(responsavel_id) as com_responsavel_id,
    COUNT(voluntario_responsavel) as com_voluntario_responsavel
FROM animais;

-- Se necessário, padronizar para voluntario_responsavel
-- (Executar apenas se responsavel_id existir e voluntario_responsavel não)
UPDATE animais 
SET voluntario_responsavel = responsavel_id 
WHERE responsavel_id IS NOT NULL 
AND voluntario_responsavel IS NULL
AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'animais' AND column_name = 'responsavel_id'
);

-- Verificar políticas RLS na tabela animais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'animais';