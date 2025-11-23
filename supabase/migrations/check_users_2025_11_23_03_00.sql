-- Verificar todos os utilizadores existentes
SELECT id, username, email, nome_completo, perfil_acesso, ativo, 
       CASE WHEN password_hash IS NOT NULL THEN 'COM HASH' ELSE 'SEM HASH' END as password_status,
       created_at
FROM public.users 
ORDER BY created_at DESC;

-- Verificar se existe utilizador "Mariana"
SELECT * FROM public.users WHERE username ILIKE '%mariana%' OR nome_completo ILIKE '%mariana%';