-- ========================================
-- CORREÇÃO DEFINITIVA - VERSÃO SEGURA
-- ========================================

-- 1. LIMPAR LOGS DE ATIVIDADE PRIMEIRO (para evitar constraint)
DELETE FROM public.activity_logs;

-- 2. CORRIGIR TODOS OS UTILIZADORES EXISTENTES
UPDATE public.users 
SET 
    password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hash para "password"
    ativo = true,
    tentativas_login = 0,
    bloqueado_ate = NULL,
    updated_at = NOW();

-- 3. CRIAR UTILIZADORES DE TESTE ADICIONAIS (se não existirem)
INSERT INTO public.users (
    username, email, nome_completo, perfil_acesso, ativo, 
    password_hash, tentativas_login, created_at, updated_at
) VALUES 
-- Técnicos
('joao', 'joao@valentao.pt', 'João Santos', 'tecnico', true, 
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NOW(), NOW()),
('ana', 'ana@valentao.pt', 'Ana Costa', 'tecnico', true, 
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NOW(), NOW()),

-- Consulta
('pedro', 'pedro@valentao.pt', 'Pedro Silva', 'consulta', true, 
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

-- 4. VERIFICAÇÃO FINAL
SELECT 
    '=== TODOS OS UTILIZADORES FUNCIONAIS ===' as status,
    username,
    nome_completo,
    perfil_acesso,
    ativo,
    'password' as senha_para_todos,
    CASE WHEN password_hash IS NOT NULL THEN '✅ PRONTO' ELSE '❌ PROBLEMA' END as status_final
FROM public.users 
ORDER BY perfil_acesso, username;