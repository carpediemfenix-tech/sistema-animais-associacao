-- Verificar estrutura completa da tabela animais
SELECT 
    'Estrutura tabela animais' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
ORDER BY ordinal_position;

-- Verificar constraints que podem estar bloqueando
SELECT 
    'Constraints da tabela animais' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'animais';

-- Tentar criar um animal de teste manualmente
INSERT INTO public.animais (
    nome,
    estado,
    local_encontrado,
    data_entrada,
    ativo
) VALUES (
    'TESTE-WIZARD-ANIMAL01',
    'Em Resgate',
    'Local de Teste',
    CURRENT_DATE,
    true
) RETURNING id, nome, estado;

-- Verificar se foi criado
SELECT 
    'Animal de teste criado' as info,
    id,
    nome,
    estado,
    local_encontrado,
    data_entrada,
    created_at
FROM public.animais 
WHERE nome = 'TESTE-WIZARD-ANIMAL01';

-- Contar total de animais
SELECT 
    'Total de animais no sistema' as info,
    COUNT(*) as total
FROM public.animais;