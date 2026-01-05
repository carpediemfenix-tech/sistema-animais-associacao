-- Verificar estrutura completa da tabela de missões
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'missoes_2025_12_18_14_15'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se há dados existentes
SELECT COUNT(*) as total_missoes FROM public.missoes_2025_12_18_14_15;

-- Tentar inserir dados mais simples primeiro
INSERT INTO public.missoes_2025_12_18_14_15 (
    codigo, 
    titulo, 
    descricao, 
    data_inicio, 
    status, 
    prioridade, 
    responsavel_id
)
SELECT 
    'MISS-' || LPAD(EXTRACT(MONTH FROM CURRENT_DATE)::text, 2, '0') || '-' || EXTRACT(YEAR FROM CURRENT_DATE)::text || '-001',
    'Missão de Resgate Janeiro 2026',
    'Operação de resgate e cuidados veterinários para animais em situação de risco',
    CURRENT_DATE - INTERVAL '15 days',
    'concluida',
    'alta',
    v.id
FROM public.voluntarios v
WHERE v.ativo = true
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verificar se a inserção funcionou
SELECT id, codigo, titulo, status FROM public.missoes_2025_12_18_14_15 LIMIT 5;