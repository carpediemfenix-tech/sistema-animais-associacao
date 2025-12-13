-- Adicionar campos de adotante se não existirem
DO $$ 
BEGIN
    -- Adicionar campo adotante_nome se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animais' AND column_name = 'adotante_nome') THEN
        ALTER TABLE animais ADD COLUMN adotante_nome VARCHAR(255);
    END IF;
    
    -- Adicionar campo adotante_contacto se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animais' AND column_name = 'adotante_contacto') THEN
        ALTER TABLE animais ADD COLUMN adotante_contacto VARCHAR(255);
    END IF;
    
    -- Adicionar campo data_adocao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animais' AND column_name = 'data_adocao') THEN
        ALTER TABLE animais ADD COLUMN data_adocao DATE;
    END IF;
END $$;

-- Atualizar dados do Valentim Valentão
UPDATE animais 
SET 
  estado = 'adotado',
  adotante_nome = 'Mónica Vidal',
  adotante_contacto = '912345678',
  data_adocao = '2024-11-15'
WHERE id = '1685ea69-0598-4850-90c4-536c32323b35';