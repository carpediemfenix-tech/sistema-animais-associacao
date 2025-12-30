-- Verificar estrutura atual da tabela animais
SELECT 
    'Colunas da tabela animais' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'animais' 
ORDER BY ordinal_position;

-- Adicionar coluna responsavel_id se não existir
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS responsavel_id UUID;

-- Adicionar foreign key para voluntarios se a tabela existir
-- ALTER TABLE public.animais 
-- ADD CONSTRAINT fk_animais_responsavel 
-- FOREIGN KEY (responsavel_id) REFERENCES public.voluntarios(id);

-- Verificar resultado
SELECT 
    'Estrutura atualizada' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND column_name LIKE '%responsavel%'
ORDER BY ordinal_position;