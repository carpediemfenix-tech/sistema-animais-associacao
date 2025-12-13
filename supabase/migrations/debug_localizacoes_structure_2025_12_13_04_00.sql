-- Debug: Verificar estrutura das tabelas de localização
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('localizacoes_animal', 'tipos_localizacoes')
ORDER BY table_name, ordinal_position;

-- Verificar dados de exemplo
SELECT * FROM localizacoes_animal WHERE animal_id = '1685ea69-0598-4850-90c4-536c32323b35' LIMIT 5;
SELECT * FROM tipos_localizacoes LIMIT 5;