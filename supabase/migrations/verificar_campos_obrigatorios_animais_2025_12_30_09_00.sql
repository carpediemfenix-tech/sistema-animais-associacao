-- Verificar TODOS os campos obrigatórios (NOT NULL)
SELECT 
    'Campos obrigatórios (NOT NULL)' as info,
    column_name, 
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY column_name;

-- Criar animal de teste com TODOS os campos obrigatórios
INSERT INTO public.animais (
    nome,
    especie,
    sexo,
    estado,
    local_encontrado,
    data_entrada,
    ativo
) VALUES (
    'TESTE-WIZARD-ANIMAL03',
    'Cão',
    'Macho',
    'Em Resgate',
    'Local de Teste',
    CURRENT_DATE,
    true
) RETURNING id, nome, especie, sexo, estado;

-- Verificar se foi criado
SELECT 
    'Animal de teste final' as info,
    id,
    nome,
    especie,
    sexo,
    estado,
    created_at
FROM public.animais 
WHERE nome = 'TESTE-WIZARD-ANIMAL03';