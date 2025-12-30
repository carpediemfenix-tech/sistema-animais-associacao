-- Adicionar todas as colunas que faltam na tabela denuncias
ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS autoridade_nome VARCHAR(200);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS autoridade_tipo VARCHAR(100);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS denunciante_nome VARCHAR(200);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS denunciante_contato VARCHAR(100);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS denunciante_observacoes TEXT;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS canal_denuncia VARCHAR(50);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS denunciante_anonimo BOOLEAN DEFAULT false;

-- Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
ORDER BY ordinal_position;

-- Contar colunas
SELECT 
    'Estrutura da tabela denuncias' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00';