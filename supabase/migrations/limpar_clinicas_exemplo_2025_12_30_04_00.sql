-- Primeiro, vamos ver todas as clínicas existentes
SELECT 
    id,
    nome,
    endereco,
    telefone,
    email,
    responsavel_veterinario,
    ativo,
    created_at,
    CASE 
        WHEN nome IN ('Clínica Veterinária Central', 'Hospital Veterinário do Porto', 'Clínica Animal Care', 'Veterinária São Francisco', 'Clínica Veterinária Esperança') 
        THEN 'EXEMPLO'
        ELSE 'REAL'
    END as tipo
FROM public.clinicas 
ORDER BY created_at DESC;

-- Remover clínicas de exemplo se existirem
DELETE FROM public.clinicas 
WHERE nome IN (
    'Clínica Veterinária Central',
    'Hospital Veterinário do Porto', 
    'Clínica Animal Care',
    'Veterinária São Francisco',
    'Clínica Veterinária Esperança'
);

-- Verificar quantas clínicas restaram
SELECT 
    'Clínicas após limpeza' as status,
    COUNT(*) as total,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativas,
    COUNT(CASE WHEN ativo = false THEN 1 END) as inativas
FROM public.clinicas;

-- Se não há clínicas reais, vamos criar algumas clínicas realistas para o sistema
INSERT INTO public.clinicas (nome, endereco, telefone, email, responsavel_veterinario, ativo, created_by, updated_by)
SELECT 
    'Clínica Veterinária Valentão',
    'Rua Principal, 123 - Centro',
    '+351 234 567 890',
    'clinica@valentao.pt',
    'Dr. João Veterinário',
    true,
    'admin',
    'admin'
WHERE NOT EXISTS (SELECT 1 FROM public.clinicas WHERE ativo = true);

-- Verificar resultado final
SELECT 
    id,
    nome,
    endereco,
    telefone,
    responsavel_veterinario,
    ativo
FROM public.clinicas 
WHERE ativo = true
ORDER BY nome;