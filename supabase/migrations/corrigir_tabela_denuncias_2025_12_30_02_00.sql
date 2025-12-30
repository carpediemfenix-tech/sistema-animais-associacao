-- Verificar se a tabela denuncias existe e sua estrutura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
ORDER BY ordinal_position;

-- Adicionar colunas que faltam na tabela denuncias
ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS autoridade_contacto VARCHAR(100);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS numero_ocorrencia VARCHAR(100);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS observacoes_autoridades TEXT;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS intervencao_veterinaria_data DATE;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS intervencao_veterinaria_hora TIME;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS veterinario_nome VARCHAR(100);

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS diagnostico_inicial TEXT;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS tratamentos_aplicados TEXT;

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS observacoes_equipe TEXT;

-- Verificar estrutura final
SELECT 
    'Estrutura da tabela denuncias' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00';