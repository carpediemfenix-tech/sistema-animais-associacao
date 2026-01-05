-- Verificar foreign keys existentes na tabela de participações
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

-- Remover FK incorreto se existir
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 
DROP CONSTRAINT IF EXISTS fk_participacoes_missao;

ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 
DROP CONSTRAINT IF EXISTS fk_participacoes_missao_correta;

ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 
DROP CONSTRAINT IF EXISTS participacoes_missoes_2025_12_29_07_00_missao_id_fkey;

-- Adicionar FK correto
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 
ADD CONSTRAINT participacoes_missoes_fk_correto 
FOREIGN KEY (missao_id) REFERENCES public.missoes_2025_12_18_14_15(id) ON DELETE CASCADE;

-- Limpar dados existentes para evitar conflitos
DELETE FROM public.participacoes_missoes_2025_12_29_07_00;

-- Inserir missões de exemplo se não existirem
INSERT INTO public.missoes_2025_12_18_14_15 (
    codigo, titulo, descricao, data_inicio, status, prioridade, 
    local_principal, orcamento_previsto, responsavel_id
)
SELECT 
    'MISS-2026-001',
    'Missão de Resgate Janeiro',
    'Operação de resgate de animais abandonados',
    CURRENT_DATE - INTERVAL '10 days',
    'concluida',
    'alta',
    'Centro da Cidade',
    500.00,
    v.id
FROM public.voluntarios v
WHERE v.ativo = true
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.missoes_2025_12_18_14_15 (
    codigo, titulo, descricao, data_inicio, status, prioridade, 
    local_principal, orcamento_previsto, responsavel_id
)
SELECT 
    'MISS-2026-002',
    'Campanha de Vacinação',
    'Vacinação antirrábica comunitária',
    CURRENT_DATE - INTERVAL '5 days',
    'concluida',
    'media',
    'Parque Municipal',
    300.00,
    v.id
FROM public.voluntarios v
WHERE v.ativo = true
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;