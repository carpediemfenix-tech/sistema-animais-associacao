-- ========================================
-- CORREÇÃO DEFINITIVA DO SISTEMA DE UTILIZADORES
-- ========================================

-- 1. LIMPAR UTILIZADORES PROBLEMÁTICOS (manter apenas admin e Mariana que funcionam)
DELETE FROM public.users 
WHERE username NOT IN ('admin', 'Mariana');

-- 2. CORRIGIR UTILIZADORES EXISTENTES
UPDATE public.users 
SET 
    password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hash para "password"
    ativo = true,
    tentativas_login = 0,
    bloqueado_ate = NULL,
    updated_at = NOW()
WHERE username IN ('admin', 'Mariana');

-- 3. CRIAR UTILIZADORES DE TESTE FUNCIONAIS
INSERT INTO public.users (
    username, email, nome_completo, perfil_acesso, ativo, 
    password_hash, tentativas_login, created_at, updated_at
) VALUES 
-- Administradores
('admin2', 'admin2@valentao.pt', 'Administrador 2', 'administrador', true, 
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NOW(), NOW()),

-- Técnicos
('joao', 'joao@valentao.pt', 'João Santos', 'tecnico', true, 
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NOW(), NOW()),
('ana', 'ana@valentao.pt', 'Ana Costa', 'tecnico', true, 
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NOW(), NOW()),

-- Consulta
('pedro', 'pedro@valentao.pt', 'Pedro Silva', 'consulta', true, 
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NOW(), NOW()),
('maria', 'maria@valentao.pt', 'Maria Oliveira', 'consulta', true, 
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NOW(), NOW())

ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    nome_completo = EXCLUDED.nome_completo,
    perfil_acesso = EXCLUDED.perfil_acesso,
    ativo = EXCLUDED.ativo,
    password_hash = EXCLUDED.password_hash,
    tentativas_login = 0,
    bloqueado_ate = NULL,
    updated_at = NOW();

-- 4. VERIFICAÇÃO FINAL - LISTAR TODOS OS UTILIZADORES FUNCIONAIS
SELECT 
    '=== UTILIZADORES CRIADOS ===' as status,
    username,
    nome_completo,
    perfil_acesso,
    ativo,
    'password' as senha_teste,
    CASE WHEN password_hash IS NOT NULL THEN '✅ HASH OK' ELSE '❌ SEM HASH' END as password_status
FROM public.users 
ORDER BY perfil_acesso, username;

-- 5. ESTATÍSTICAS FINAIS
SELECT 
    perfil_acesso,
    COUNT(*) as quantidade,
    COUNT(CASE WHEN ativo THEN 1 END) as ativos
FROM public.users 
GROUP BY perfil_acesso
ORDER BY perfil_acesso;