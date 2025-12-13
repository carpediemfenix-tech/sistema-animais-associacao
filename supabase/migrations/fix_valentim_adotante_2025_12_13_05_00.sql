-- Verificar dados completos do animal Valentim Valentão
SELECT 
  id, nome, estado, adotante_nome, adotante_contacto, data_adocao
FROM animais 
WHERE id = '1685ea69-0598-4850-90c4-536c32323b35';

-- Verificar valores únicos de estado na tabela
SELECT DISTINCT estado FROM animais;

-- Atualizar o estado para 'Adotado' (com A maiúsculo)
UPDATE animais 
SET estado = 'Adotado'
WHERE id = '1685ea69-0598-4850-90c4-536c32323b35' 
AND estado != 'Adotado';