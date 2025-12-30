-- Verificar se a tabela clinicas_veterinarias existe
SELECT 
    'Tabela clinicas_veterinarias' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'clinicas_veterinarias';

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clinicas_veterinarias' 
ORDER BY ordinal_position;

-- Verificar clínicas existentes
SELECT 
    id,
    nome,
    endereco,
    telefone,
    especialidades,
    ativo,
    created_at
FROM public.clinicas_veterinarias 
ORDER BY nome;

-- Contar clínicas ativas vs inativas
SELECT 
    ativo,
    COUNT(*) as total
FROM public.clinicas_veterinarias 
GROUP BY ativo;

-- Se não há clínicas ativas, criar uma para o sistema
INSERT INTO public.clinicas_veterinarias (
    nome, 
    endereco, 
    telefone, 
    email, 
    especialidades, 
    tem_protocolo, 
    desconto_protocolo, 
    ativo
)
SELECT 
    'Clínica Veterinária Valentão',
    'Rua Principal, 123 - Centro',
    '+351 234 567 890',
    'clinica@valentao.pt',
    ARRAY['Medicina Geral', 'Cirurgia', 'Emergências'],
    true,
    15,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.clinicas_veterinarias WHERE ativo = true);

-- Verificar resultado final
SELECT 
    id,
    nome,
    endereco,
    telefone,
    especialidades,
    ativo
FROM public.clinicas_veterinarias 
WHERE ativo = true
ORDER BY nome;