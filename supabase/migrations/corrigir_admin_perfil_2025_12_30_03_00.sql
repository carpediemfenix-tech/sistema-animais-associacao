-- Verificar estrutura da tabela users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verificar todos os usuários
SELECT * FROM public.users ORDER BY username;

-- Verificar especificamente o usuário admin
SELECT 
    username,
    COALESCE(perfil, 'SEM PERFIL') as perfil_atual,
    ativo,
    created_at
FROM public.users 
WHERE username = 'admin';

-- Atualizar o perfil do usuário admin (ajustar conforme a estrutura real)
-- Primeiro vamos ver se a coluna perfil existe
DO $$
BEGIN
    -- Verificar se a coluna perfil existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'perfil') THEN
        -- Se existe, atualizar
        UPDATE public.users SET perfil = 'administrador' WHERE username = 'admin';
        RAISE NOTICE 'Perfil do admin atualizado para administrador';
    ELSE
        -- Se não existe, criar a coluna primeiro
        ALTER TABLE public.users ADD COLUMN perfil VARCHAR(50) DEFAULT 'usuario';
        UPDATE public.users SET perfil = 'administrador' WHERE username = 'admin';
        RAISE NOTICE 'Coluna perfil criada e admin atualizado';
    END IF;
END $$;

-- Verificar resultado final
SELECT 
    username,
    COALESCE(perfil, 'SEM PERFIL') as perfil_final,
    ativo
FROM public.users 
WHERE username = 'admin';