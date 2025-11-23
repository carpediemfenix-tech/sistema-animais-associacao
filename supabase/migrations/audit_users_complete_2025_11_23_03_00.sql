-- AUDITORIA COMPLETA DA TABELA USERS
-- 1. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Contar total de utilizadores
SELECT COUNT(*) as total_users FROM public.users;

-- 3. Listar TODOS os utilizadores com detalhes completos
SELECT 
    id,
    username,
    email,
    nome_completo,
    perfil_acesso,
    ativo,
    CASE 
        WHEN password_hash IS NULL THEN 'SEM HASH'
        WHEN password_hash = '' THEN 'HASH VAZIO'
        WHEN LENGTH(password_hash) < 10 THEN 'HASH INVÁLIDO'
        ELSE 'HASH OK'
    END as password_status,
    tentativas_login,
    bloqueado_ate,
    created_at,
    updated_at
FROM public.users 
ORDER BY created_at DESC;

-- 4. Verificar utilizadores com problemas
SELECT 'PROBLEMAS IDENTIFICADOS:' as diagnostico;

SELECT 'Utilizadores sem hash de password:' as problema, COUNT(*) as quantidade
FROM public.users 
WHERE password_hash IS NULL OR password_hash = '';

SELECT 'Utilizadores inativos:' as problema, COUNT(*) as quantidade
FROM public.users 
WHERE ativo = false;

SELECT 'Utilizadores bloqueados:' as problema, COUNT(*) as quantidade
FROM public.users 
WHERE bloqueado_ate IS NOT NULL AND bloqueado_ate > NOW();