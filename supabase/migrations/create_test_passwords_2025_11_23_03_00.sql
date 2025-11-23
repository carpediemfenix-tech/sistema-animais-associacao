-- Verificar se as Edge Functions estão ativas
-- Vamos criar hashes manualmente para alguns utilizadores

-- Hash para "V@ngelis1973" (gerado externamente): $2b$10$rBV2HLmv5Fgegfudu2f0/.6IKBOaVjLQlFtjNhHnUPb5s2uDlbvBG
-- Hash para "password": $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Atualizar utilizador vitor com hash para "V@ngelis1973"
UPDATE public.users 
SET password_hash = '$2b$10$rBV2HLmv5Fgegfudu2f0/.6IKBOaVjLQlFtjNhHnUPb5s2uDlbvBG'
WHERE username = 'vitor';

-- Criar alguns utilizadores com passwords específicas
INSERT INTO public.users (
    username, email, nome_completo, perfil_acesso, ativo, 
    password_hash, tentativas_login, created_at, updated_at
) VALUES 
('teste1', 'teste1@valentao.pt', 'Teste Um', 'consulta', true, 
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NOW(), NOW()), -- password: "password"
('teste2', 'teste2@valentao.pt', 'Teste Dois', 'tecnico', true, 
 '$2b$10$rBV2HLmv5Fgegfudu2f0/.6IKBOaVjLQlFtjNhHnUPb5s2uDlbvBG', 0, NOW(), NOW()) -- password: "V@ngelis1973"

ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- Verificar utilizadores atualizados
SELECT username, nome_completo, 
       CASE 
         WHEN password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' THEN 'password: "password"'
         WHEN password_hash = '$2b$10$rBV2HLmv5Fgegfudu2f0/.6IKBOaVjLQlFtjNhHnUPb5s2uDlbvBG' THEN 'password: "V@ngelis1973"'
         ELSE 'password: outra'
       END as password_info
FROM public.users 
WHERE username IN ('vitor', 'teste1', 'teste2', 'admin')
ORDER BY username;