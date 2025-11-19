-- Verificar todos os utilizadores existentes
SELECT 
    id,
    username, 
    nome_completo, 
    email,
    perfil_acesso, 
    ativo,
    tentativas_login,
    bloqueado_ate,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 30) as hash_preview,
    created_at,
    updated_at
FROM public.users 
ORDER BY created_at;

-- Verificar especificamente os utilizadores de teste
SELECT 
    'UTILIZADORES DE TESTE:' as info,
    username,
    nome_completo,
    ativo,
    perfil_acesso,
    CASE 
        WHEN password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
        THEN 'PASSWORD_SIMPLES_OK' 
        ELSE 'PASSWORD_DIFERENTE' 
    END as status_password
FROM public.users 
WHERE username IN ('Sigma', 'admin', 'test')
ORDER BY username;

-- Garantir que todos têm a password correta
UPDATE public.users 
SET 
    password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    tentativas_login = 0,
    bloqueado_ate = null,
    ativo = true,
    updated_at = NOW()
WHERE username IN ('Sigma', 'admin', 'test');

-- Verificar novamente após atualização
SELECT 
    'APÓS ATUALIZAÇÃO:' as info,
    username,
    nome_completo,
    ativo,
    tentativas_login,
    bloqueado_ate,
    CASE 
        WHEN password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
        THEN 'PASSWORD_OK' 
        ELSE 'PASSWORD_ERRO' 
    END as status_password
FROM public.users 
WHERE username IN ('Sigma', 'admin', 'test')
ORDER BY username;