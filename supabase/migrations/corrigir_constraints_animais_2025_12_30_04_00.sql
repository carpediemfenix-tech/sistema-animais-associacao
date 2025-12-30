-- Verificar e corrigir constraints da tabela animais
-- Remover constraints NOT NULL problemáticas se existirem
ALTER TABLE public.animais 
ALTER COLUMN local_completo DROP NOT NULL;

ALTER TABLE public.animais 
ALTER COLUMN especie_id DROP NOT NULL;

-- Adicionar colunas que podem estar faltando
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS especie_id UUID;

ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);

-- Verificar estrutura final da tabela animais
SELECT 
    'Estrutura tabela animais' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
ORDER BY ordinal_position;

-- Verificar se as tabelas de participações e animais-missões existem
SELECT 
    'Tabelas de missões' as info,
    table_name
FROM information_schema.tables 
WHERE table_name LIKE '%participacoes_missoes%' 
   OR table_name LIKE '%missoes_animais%'
   OR table_name LIKE '%animais_missoes%'
ORDER BY table_name;