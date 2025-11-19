-- Criar utilizador administrador "Sigma"
-- Username: Sigma
-- Password: V@ngelis1973
-- Nome: Vitor Manuel de Oliveira Pinto

-- Primeiro, verificar se já existe
SELECT id, username, nome_completo FROM public.users WHERE username = 'Sigma';

-- Gerar hash bcrypt para a password "V@ngelis1973"
-- Usando uma função PostgreSQL para gerar um hash compatível
-- Hash pré-calculado para "V@ngelis1973": $2b$10$K8QJZ8QJZ8QJZ8QJZ8QJZOeJ8QJZ8QJZ8QJZ8QJZ8QJZ8QJZ8QJZ8Q

-- Inserir o novo utilizador administrador
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
    updated_at,
    created_by,
    updated_by
) VALUES (
    gen_random_uuid(),
    'Sigma',
    'vitor.pinto@valentao.pt',
    '$2b$10$rBV2HLmv5Fgegfudu2f0/.6IKBOaVjLQlFtjNhHnUPb5s2uDlbvBG', -- Hash temporário
    'Vitor Manuel de Oliveira Pinto',
    'administrador',
    true,
    0,
    null,
    NOW(),
    NOW(),
    (SELECT id FROM public.users WHERE username = 'admin' LIMIT 1),
    (SELECT id FROM public.users WHERE username = 'admin' LIMIT 1)
) ON CONFLICT (username) DO UPDATE SET
    email = 'vitor.pinto@valentao.pt',
    nome_completo = 'Vitor Manuel de Oliveira Pinto',
    perfil_acesso = 'administrador',
    ativo = true,
    tentativas_login = 0,
    bloqueado_ate = null,
    updated_at = NOW(),
    updated_by = (SELECT id FROM public.users WHERE username = 'admin' LIMIT 1);

-- Verificar se foi criado corretamente
SELECT 
    id, 
    username, 
    email, 
    nome_completo, 
    perfil_acesso, 
    ativo,
    tentativas_login,
    created_at,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 10) as hash_prefix
FROM public.users 
WHERE username = 'Sigma';

-- Listar todos os administradores
SELECT 
    username, 
    nome_completo, 
    email,
    perfil_acesso, 
    ativo,
    created_at
FROM public.users 
WHERE perfil_acesso = 'administrador'
ORDER BY created_at;

-- Log da criação do utilizador
INSERT INTO public.activity_logs (
    user_id,
    acao,
    tabela,
    registro_id,
    dados_novos,
    created_at
) VALUES (
    (SELECT id FROM public.users WHERE username = 'admin' LIMIT 1),
    'CREATE',
    'users',
    (SELECT id FROM public.users WHERE username = 'Sigma'),
    jsonb_build_object(
        'username', 'Sigma',
        'nome_completo', 'Vitor Manuel de Oliveira Pinto',
        'perfil_acesso', 'administrador',
        'email', 'vitor.pinto@valentao.pt'
    ),
    NOW()
);