-- Remover políticas RLS problemáticas
DROP POLICY IF EXISTS "Allow all for authenticated users" ON localizacoes_animal;
DROP POLICY IF EXISTS "Enable read access for all users" ON localizacoes_animal;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON localizacoes_animal;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON localizacoes_animal;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON localizacoes_animal;

-- Criar política RLS permissiva
CREATE POLICY "Allow all operations for authenticated users" 
ON localizacoes_animal 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Verificar se RLS está habilitado
ALTER TABLE localizacoes_animal ENABLE ROW LEVEL SECURITY;

-- Verificar dados de exemplo
SELECT COUNT(*) as total_localizacoes FROM localizacoes_animal;
SELECT COUNT(*) as localizacoes_ativas FROM localizacoes_animal WHERE ativo = true;