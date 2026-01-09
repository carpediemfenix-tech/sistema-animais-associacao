-- Criar bucket para arquivos de animais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'animal-files',
  'animal-files',
  true,
  52428800, -- 50MB em bytes
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de arquivos autenticados
CREATE POLICY "Authenticated users can upload animal files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'animal-files' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir visualização pública dos arquivos
CREATE POLICY "Public can view animal files" ON storage.objects
FOR SELECT USING (bucket_id = 'animal-files');

-- Política para permitir atualização pelos proprietários
CREATE POLICY "Users can update their animal files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'animal-files' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir exclusão pelos proprietários
CREATE POLICY "Users can delete their animal files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'animal-files' AND 
  auth.role() = 'authenticated'
);

-- Tabela para metadados dos anexos
CREATE TABLE IF NOT EXISTS animal_attachments_2026_01_09_09_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_category TEXT NOT NULL CHECK (file_category IN ('photo', 'video', 'document')),
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_animal_attachments_animal_id ON animal_attachments_2026_01_09_09_00(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_attachments_category ON animal_attachments_2026_01_09_09_00(file_category);
CREATE INDEX IF NOT EXISTS idx_animal_attachments_uploaded_by ON animal_attachments_2026_01_09_09_00(uploaded_by);

-- RLS para a tabela de anexos
ALTER TABLE animal_attachments_2026_01_09_09_00 ENABLE ROW LEVEL SECURITY;

-- Política para visualização pública dos metadados
CREATE POLICY "Public can view animal attachment metadata" ON animal_attachments_2026_01_09_09_00
FOR SELECT USING (true);

-- Política para inserção por usuários autenticados
CREATE POLICY "Authenticated users can insert animal attachments" ON animal_attachments_2026_01_09_09_00
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização por usuários autenticados
CREATE POLICY "Authenticated users can update animal attachments" ON animal_attachments_2026_01_09_09_00
FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão por usuários autenticados
CREATE POLICY "Authenticated users can delete animal attachments" ON animal_attachments_2026_01_09_09_00
FOR DELETE USING (auth.role() = 'authenticated');

-- Função para obter anexos de um animal
CREATE OR REPLACE FUNCTION get_animal_attachments(animal_uuid UUID)
RETURNS TABLE (
  id UUID,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  file_category TEXT,
  public_url TEXT,
  description TEXT,
  is_primary BOOLEAN,
  uploaded_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.file_name,
    a.file_size,
    a.file_type,
    a.file_category,
    a.public_url,
    a.description,
    a.is_primary,
    a.uploaded_at
  FROM animal_attachments_2026_01_09_09_00 a
  WHERE a.animal_id = animal_uuid
  ORDER BY a.is_primary DESC, a.uploaded_at DESC;
END;
$$;