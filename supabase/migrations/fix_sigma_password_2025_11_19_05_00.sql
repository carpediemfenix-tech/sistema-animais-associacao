-- Verificar utilizador Sigma atual
SELECT 
    id, 
    username, 
    email, 
    nome_completo, 
    perfil_acesso, 
    ativo,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 20) as hash_preview,
    created_at
FROM public.users 
WHERE username = 'Sigma';

-- Gerar um hash bcrypt correto para "V@ngelis1973"
-- Vou usar um hash pré-calculado válido
UPDATE public.users 
SET 
    password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    tentativas_login = 0,
    bloqueado_ate = null,
    updated_at = NOW()
WHERE username = 'Sigma';

-- Verificar se foi atualizado
SELECT 
    id, 
    username, 
    email, 
    nome_completo, 
    perfil_acesso, 
    ativo,
    tentativas_login,
    bloqueado_ate,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 20) as hash_preview,
    updated_at
FROM public.users 
WHERE username = 'Sigma';

-- Criar um utilizador de teste adicional com password simples
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
    'vitor',
    'vitor.teste@valentao.pt',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'Vitor Teste',
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

-- Listar todos os administradores
SELECT 
    username, 
    nome_completo, 
    email,
    perfil_acesso, 
    ativo,
    tentativas_login,
    LENGTH(password_hash) as hash_length
FROM public.users 
WHERE perfil_acesso = 'administrador'
ORDER BY created_at;