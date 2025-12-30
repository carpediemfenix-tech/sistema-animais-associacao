-- Verificar estrutura atual da tabela users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verificar usuários existentes (sem a coluna perfil)
SELECT * FROM public.users ORDER BY username;

-- Adicionar coluna perfil se não existir
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS perfil VARCHAR(50) DEFAULT 'usuario';

-- Atualizar o usuário admin para ter perfil de administrador
UPDATE public.users 
SET perfil = 'administrador' 
WHERE username = 'admin';

-- Verificar resultado
SELECT 
    username,
    perfil,
    ativo,
    created_at
FROM public.users 
ORDER BY username;