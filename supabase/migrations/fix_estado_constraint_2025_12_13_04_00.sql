-- Verificar constraint do campo estado
SELECT 
  conname,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'animais'::regclass 
AND conname LIKE '%estado%';

-- Verificar valores únicos de estado na tabela
SELECT DISTINCT estado FROM animais;

-- Tentar atualizar com valores corretos
UPDATE animais 
SET 
  adotante_nome = 'Mónica Vidal',
  adotante_contacto = '912345678',
  data_adocao = '2024-11-15'
WHERE id = '1685ea69-0598-4850-90c4-536c32323b35';