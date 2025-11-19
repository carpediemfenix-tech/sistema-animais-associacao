-- Verificar se o utilizador admin existe
SELECT id, username, email, nome_completo, perfil_acesso, ativo 
FROM public.users 
WHERE username = 'admin';

-- Se não existir, criar o utilizador admin
-- Password: admin123 (hash bcrypt)
INSERT INTO public.users (
    username, 
    email, 
    password_hash, 
    nome_completo, 
    perfil_acesso, 
    ativo,
    created_at,
    updated_at
) VALUES (
    'admin',
    'admin@valentao.pt',
    '$2b$10$rBV2HLmv5Fgegfudu2f0/.6IKBOaVjLQlFtjNhHnUPb5s2uDlbvBG', -- admin123
    'Administrador do Sistema',
    'administrador',
    true,
    NOW(),
    NOW()
) ON CONFLICT (username) DO UPDATE SET
    password_hash = '$2b$10$rBV2HLmv5Fgegfudu2f0/.6IKBOaVjLQlFtjNhHnUPb5s2uDlbvBG',
    ativo = true,
    updated_at = NOW();

-- Verificar novamente
SELECT id, username, email, nome_completo, perfil_acesso, ativo, created_at
FROM public.users 
WHERE username = 'admin';