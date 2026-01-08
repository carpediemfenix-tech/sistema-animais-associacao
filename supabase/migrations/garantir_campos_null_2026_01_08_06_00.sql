-- Verificar se os novos campos existem e se aceitam NULL
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND column_name IN ('transponder', 'grupo_id', 'data_adocao', 'adotante_nome', 'adotante_contacto')
ORDER BY column_name;

-- Garantir que transponder aceita NULL (se existir)
ALTER TABLE animais 
ALTER COLUMN transponder DROP NOT NULL;

-- Garantir que grupo_id aceita NULL (se existir)  
ALTER TABLE animais 
ALTER COLUMN grupo_id DROP NOT NULL;

-- Garantir que campos de adotante aceitem NULL (se existirem)
ALTER TABLE animais 
ALTER COLUMN data_adocao DROP NOT NULL;

ALTER TABLE animais 
ALTER COLUMN adotante_nome DROP NOT NULL;

ALTER TABLE animais 
ALTER COLUMN adotante_contacto DROP NOT NULL;

-- Verificar novamente após alterações
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND column_name IN ('transponder', 'grupo_id', 'data_adocao', 'adotante_nome', 'adotante_contacto')
ORDER BY column_name;