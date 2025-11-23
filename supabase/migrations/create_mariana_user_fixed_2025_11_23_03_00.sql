-- Criar utilizador Mariana para teste
INSERT INTO public.users (
  username, email, nome_completo, perfil_acesso, ativo, 
  password_hash, tentativas_login, created_at, updated_at
) VALUES (
  'Mariana', 'mariana@valentao.pt', 'Mariana Silva', 
  'tecnico', true, 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  0, NOW(), NOW()
) ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  nome_completo = EXCLUDED.nome_completo,
  perfil_acesso = EXCLUDED.perfil_acesso,
  ativo = EXCLUDED.ativo,
  password_hash = EXCLUDED.password_hash,
  tentativas_login = 0,
  updated_at = NOW();

-- Garantir que o admin está ativo
UPDATE public.users 
SET ativo = true, 
    password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    tentativas_login = 0
WHERE username = 'admin';

-- Verificar utilizadores criados
SELECT username, email, nome_completo, perfil_acesso, ativo, 
       CASE WHEN password_hash IS NOT NULL THEN 'COM HASH' ELSE 'SEM HASH' END as password_status
FROM public.users 
WHERE username IN ('admin', 'Mariana')
ORDER BY username;