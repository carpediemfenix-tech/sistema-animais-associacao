-- Verificar foreign keys existentes
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'participacoes_missoes_2025_12_29_07_00';

-- Remover foreign key incorreto se existir
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 
DROP CONSTRAINT IF EXISTS fk_participacoes_missao;

-- Adicionar foreign key correto
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 
ADD CONSTRAINT fk_participacoes_missao_correta 
FOREIGN KEY (missao_id) REFERENCES public.missoes_2025_12_18_14_15(id) ON DELETE CASCADE;

-- Verificar se há missões na tabela correta
SELECT COUNT(*) as total_missoes_corretas FROM public.missoes_2025_12_18_14_15;

-- Inserir participação simples
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid as voluntario_id,
    'Coordenador' as funcao,
    CURRENT_DATE as data_participacao,
    'Responsável pela coordenação geral da missão' as observacoes
FROM public.missoes_2025_12_18_14_15 m
LIMIT 1;