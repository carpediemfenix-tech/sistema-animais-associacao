-- Limpar utilizador admin existente e recriar
DELETE FROM public.users WHERE username = 'admin';

-- Criar utilizador admin com hash bcrypt correto
-- Password: admin123
-- Hash gerado com bcrypt rounds=10
INSERT INTO public.users (
    id,
    username, 
    email, 
    password_hash, 
    nome_completo, 
    perfil_acesso, 
    ativo,
    tentativas_login,
    bloqueado_ate,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@valentao.pt',
    '$2b$10$K8QJZ8QJZ8QJZ8QJZ8QJZOeJ8QJZ8QJZ8QJZ8QJZ8QJZ8QJZ8QJZ8Q', -- Placeholder, será atualizado
    'Administrador do Sistema',
    'administrador',
    true,
    0,
    null,
    NOW(),
    NOW()
);

-- Atualizar com hash mais simples para teste
UPDATE public.users 
SET password_hash = '$2b$10$rBV2HLmv5Fgegfudu2f0/.6IKBOaVjLQlFtjNhHnUPb5s2uDlbvBG'
WHERE username = 'admin';

-- Verificar se foi criado corretamente
SELECT 
    id, 
    username, 
    email, 
    nome_completo, 
    perfil_acesso, 
    ativo,
    tentativas_login,
    bloqueado_ate,
    created_at,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 10) as hash_prefix
FROM public.users 
WHERE username = 'admin';

-- Criar utilizador de teste adicional
INSERT INTO public.users (
    username, 
    email, 
    password_hash, 
    nome_completo, 
    perfil_acesso, 
    ativo,
    tentativas_login,
    created_at,
    updated_at
) VALUES (
    'teste',
    'teste@valentao.pt',
    '$2b$10$rBV2HLmv5Fgegfudu2f0/.6IKBOaVjLQlFtjNhHnUPb5s2uDlbvBG', -- admin123
    'Utilizador de Teste',
    'tecnico',
    true,
    0,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- Verificar todos os utilizadores
SELECT 
    username, 
    nome_completo, 
    perfil_acesso, 
    ativo,
    tentativas_login
FROM public.users 
ORDER BY created_at;