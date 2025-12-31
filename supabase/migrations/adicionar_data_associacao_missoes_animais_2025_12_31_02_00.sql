-- Verificar estrutura atual da tabela missoes_animais
SELECT 
    'Estrutura missoes_animais' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'missoes_animais_2025_12_29_07_00' 
ORDER BY ordinal_position;

-- Adicionar coluna data_associacao se não existir
ALTER TABLE public.missoes_animais_2025_12_29_07_00 
ADD COLUMN IF NOT EXISTS data_associacao DATE;

-- Verificar resultado
SELECT 
    'Estrutura atualizada' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'missoes_animais_2025_12_29_07_00' 
AND column_name = 'data_associacao';