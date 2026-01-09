-- Desabilitar temporariamente RLS para debug
ALTER TABLE animal_attachments_2026_01_09_09_00 DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas do storage
DROP POLICY IF EXISTS "Allow all operations on animal-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload to animal-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from animal-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update animal-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete animal-files" ON storage.objects;

-- Criar uma política super permissiva para teste
CREATE POLICY "Allow everything on animal-files" ON storage.objects
FOR ALL USING (bucket_id = 'animal-files')
WITH CHECK (bucket_id = 'animal-files');

-- Garantir que o bucket seja público
UPDATE storage.buckets 
SET public = true
WHERE id = 'animal-files';

-- Verificar se existe algum problema com a autenticação
-- Criar uma função para debug
CREATE OR REPLACE FUNCTION debug_auth_info()
RETURNS TABLE (
  current_user_id UUID,
  current_role TEXT,
  is_authenticated BOOLEAN
) AS $$
BEGIN
  RETURN QUERY SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    (auth.role() = 'authenticated') as is_authenticated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Testar inserção direta na tabela
INSERT INTO animal_attachments_2026_01_09_09_00 (
  animal_id, 
  file_name, 
  file_size, 
  file_type, 
  file_category, 
  storage_path, 
  public_url
) VALUES (
  '96a3f154-d4cf-4aa1-b329-5398b948fe11'::uuid,
  'test_file.txt',
  1024,
  'text/plain',
  'document',
  'test/path',
  'https://test.url'
) ON CONFLICT DO NOTHING;