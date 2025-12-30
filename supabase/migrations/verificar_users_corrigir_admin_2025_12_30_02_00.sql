-- Verificar estrutura da tabela users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verificar usuários existentes
SELECT * FROM public.users ORDER BY username;

-- Atualizar o usuário admin para ter perfil de administrador
UPDATE public.users 
SET perfil = 'administrador'
WHERE username = 'admin' OR username ILIKE '%admin%';

-- Verificar resultado
SELECT 
    username,
    perfil,
    ativo
FROM public.users;