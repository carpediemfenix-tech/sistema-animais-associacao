-- Adicionar TODAS as colunas que ainda faltam na tabela denuncias
ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS autoridades_contactadas BOOLEAN DEFAULT false;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS autoridade_contacto VARCHAR(100);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS numero_ocorrencia VARCHAR(50);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS observacoes_autoridades TEXT;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS intervencao_veterinaria BOOLEAN DEFAULT false;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS intervencao_veterinaria_data DATE;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS intervencao_veterinaria_hora TIME;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS clinica_id UUID;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS veterinario_nome VARCHAR(200);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS diagnostico_inicial TEXT;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS tratamentos_aplicados TEXT;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS voluntario_responsavel_id UUID;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS voluntarios_participantes TEXT[];

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS observacoes_equipe TEXT;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS quantidade_animais INTEGER DEFAULT 1;

-- Verificar estrutura COMPLETA da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
ORDER BY ordinal_position;

-- Contar total de colunas
SELECT 
    'Estrutura COMPLETA da tabela denuncias' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00';