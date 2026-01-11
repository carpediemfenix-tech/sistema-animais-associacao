-- Verificação rápida e simples
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
ORDER BY ordinal_position;

-- Verificar se existe algum registo para testar
SELECT COUNT(*) as total FROM localizacoes_animal;

-- Refresh do schema cache (força atualização)
NOTIFY pgrst, 'reload schema';