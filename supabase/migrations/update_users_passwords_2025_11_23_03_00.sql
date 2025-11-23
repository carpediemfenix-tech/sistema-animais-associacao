-- Atualizar todos os utilizadores com hash de password válido
-- Hash bcrypt para "password": $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

UPDATE public.users 
SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    tentativas_login = 0,
    bloqueado_ate = NULL,
    updated_at = NOW()
WHERE password_hash IS NULL OR password_hash = '';

-- Verificar utilizadores atualizados
SELECT username, email, nome_completo, perfil_acesso, ativo,
       CASE WHEN password_hash IS NOT NULL THEN 'HASH DEFINIDO' ELSE 'SEM HASH' END as password_status,
       tentativas_login, bloqueado_ate
FROM public.users 
ORDER BY created_at DESC;