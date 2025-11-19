-- Criar utilizadores de teste com passwords simples
-- Password para todos: "password"
-- Hash: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Atualizar Sigma com password simples temporária
UPDATE public.users 
SET 
    password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    tentativas_login = 0,
    bloqueado_ate = null,
    updated_at = NOW()
WHERE username = 'Sigma';

-- Atualizar admin com password simples
UPDATE public.users 
SET 
    password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    tentativas_login = 0,
    bloqueado_ate = null,
    updated_at = NOW()
WHERE username = 'admin';

-- Criar utilizador de teste simples
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
    'test',
    'test@valentao.pt',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'Utilizador de Teste',
    'administrador',
    true,
    0,
    NOW(),
    NOW()
) ON CONFLICT (username) DO UPDATE SET
    password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    ativo = true,
    tentativas_login = 0,
    updated_at = NOW();

-- Verificar todos os utilizadores
SELECT 
    username, 
    nome_completo, 
    email,
    perfil_acesso, 
    ativo,
    tentativas_login,
    LENGTH(password_hash) as hash_length,
    CASE 
        WHEN password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
        THEN 'password_simples' 
        ELSE 'password_complexa' 
    END as tipo_password
FROM public.users 
WHERE perfil_acesso = 'administrador'
ORDER BY created_at;

-- Informações de login
SELECT 
    'CREDENCIAIS DE TESTE:' as info,
    '' as separador,
    'Username: Sigma, Password: password' as sigma,
    'Username: admin, Password: password' as admin_user,
    'Username: test, Password: password' as test_user;