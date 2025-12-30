-- Verificar usuários existentes
SELECT 
    id,
    username,
    nome,
    perfil,
    ativo,
    created_at
FROM public.users 
ORDER BY username;

-- Atualizar o usuário admin para ter perfil de administrador
UPDATE public.users 
SET perfil = 'administrador'
WHERE username = 'admin' OR username ILIKE '%admin%';

-- Verificar resultado
SELECT 
    'Usuários após atualização' as status,
    username,
    perfil,
    ativo
FROM public.users 
WHERE username = 'admin' OR perfil = 'administrador';