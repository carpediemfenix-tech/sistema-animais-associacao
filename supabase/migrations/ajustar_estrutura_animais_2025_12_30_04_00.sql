-- Verificar estrutura atual da tabela animais
SELECT 
    'Estrutura atual tabela animais' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
ORDER BY ordinal_position;

-- Adicionar colunas que podem estar faltando (se não existirem)
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS especie_id UUID;

ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);

ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS local_completo TEXT;

-- Verificar se as tabelas de participações e animais-missões existem
SELECT 
    'Tabelas de missões existentes' as info,
    table_name
FROM information_schema.tables 
WHERE table_name LIKE '%participacoes_missoes%' 
   OR table_name LIKE '%missoes_animais%'
   OR table_name LIKE '%animais_missoes%'
ORDER BY table_name;

-- Contar registros existentes na tabela animais
SELECT 
    'Total de animais no sistema' as info,
    COUNT(*) as total
FROM public.animais;