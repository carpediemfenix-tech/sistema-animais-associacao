-- Verificar dados do animal Valentim Valentão
SELECT 
  id, nome, estado, adotante_nome, adotante_contacto, data_adocao
FROM animais 
WHERE id = '1685ea69-0598-4850-90c4-536c32323b35';

-- Verificar se existe campo adotante_nome na tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND column_name LIKE '%adot%';