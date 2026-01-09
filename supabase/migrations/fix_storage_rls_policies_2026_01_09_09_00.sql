-- Remover todas as políticas existentes do bucket animal-files
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public can view animal files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload animal files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update animal files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete animal files" ON storage.objects;

-- Criar políticas mais permissivas para o bucket animal-files
CREATE POLICY "Allow all operations on animal-files" ON storage.objects
FOR ALL USING (bucket_id = 'animal-files');

-- Política alternativa mais específica se a primeira não funcionar
CREATE POLICY "Allow authenticated upload to animal-files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'animal-files' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read from animal-files" ON storage.objects
FOR SELECT USING (bucket_id = 'animal-files');

CREATE POLICY "Allow authenticated update animal-files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'animal-files' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated delete animal-files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'animal-files' AND 
  auth.role() = 'authenticated'
);

-- Verificar se o bucket existe e tem as configurações corretas
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 104857600, -- 100MB
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
WHERE id = 'animal-files';

-- Se o bucket não existir, criar
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'animal-files',
  'animal-files',
  true,
  104857600,
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Corrigir também as políticas da tabela animal_attachments
DROP POLICY IF EXISTS "Users can view animal attachments" ON animal_attachments_2026_01_09_09_00;
DROP POLICY IF EXISTS "Users can insert animal attachments" ON animal_attachments_2026_01_09_09_00;
DROP POLICY IF EXISTS "Users can update animal attachments" ON animal_attachments_2026_01_09_09_00;
DROP POLICY IF EXISTS "Users can delete animal attachments" ON animal_attachments_2026_01_09_09_00;

-- Políticas mais permissivas para a tabela de metadados
CREATE POLICY "Allow all operations on animal attachments" ON animal_attachments_2026_01_09_09_00
FOR ALL USING (true);

-- Verificar se a tabela existe
CREATE TABLE IF NOT EXISTS animal_attachments_2026_01_09_09_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  file_category TEXT,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  is_primary BOOLEAN DEFAULT FALSE
);

-- Habilitar RLS
ALTER TABLE animal_attachments_2026_01_09_09_00 ENABLE ROW LEVEL SECURITY;