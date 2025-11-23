-- Primeiro, vamos ver se o utilizador vitor existe
SELECT username, nome_completo, password_hash 
FROM public.users 
WHERE username = 'vitor';

-- Vamos usar uma Edge Function para gerar o hash correto
-- Por enquanto, vamos definir um hash temporário que será atualizado
UPDATE public.users 
SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' -- hash temporário
WHERE username = 'vitor';

-- Verificar todos os utilizadores
SELECT username, nome_completo, perfil_acesso, ativo,
       CASE WHEN password_hash IS NOT NULL THEN 'COM HASH' ELSE 'SEM HASH' END as status
FROM public.users 
ORDER BY username;