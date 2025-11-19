-- =====================================================
-- SISTEMA DE CONTROLE DE ACESSOS E AUDITORIA
-- Associação Valentão - Sistema de Gestão de Animais
-- =====================================================

-- 1. TABELA DE UTILIZADORES
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    perfil_acesso VARCHAR(20) NOT NULL CHECK (perfil_acesso IN ('administrador', 'tecnico', 'consulta')),
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    tentativas_login INTEGER DEFAULT 0,
    bloqueado_ate TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id)
);

-- 2. TABELA DE LOGS DE ATIVIDADE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    acao VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    tabela VARCHAR(50), -- Nome da tabela afetada
    registro_id UUID, -- ID do registro afetado
    dados_anteriores JSONB, -- Dados antes da alteração
    dados_novos JSONB, -- Dados após a alteração
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADICIONAR CAMPOS DE AUDITORIA ÀS TABELAS EXISTENTES

-- Animais
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Intervenções
ALTER TABLE public.intervencoes 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Eventos
ALTER TABLE public.eventos 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Localizações
ALTER TABLE public.localizacoes 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Movimentos Financeiros
ALTER TABLE public.movimentos_financeiros 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Voluntários
ALTER TABLE public.voluntarios 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. TRIGGERS PARA ATUALIZAR updated_at AUTOMATICAMENTE

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_animais_updated_at ON public.animais;
CREATE TRIGGER update_animais_updated_at BEFORE UPDATE ON public.animais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_intervencoes_updated_at ON public.intervencoes;
CREATE TRIGGER update_intervencoes_updated_at BEFORE UPDATE ON public.intervencoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_eventos_updated_at ON public.eventos;
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_localizacoes_updated_at ON public.localizacoes;
CREATE TRIGGER update_localizacoes_updated_at BEFORE UPDATE ON public.localizacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_movimentos_financeiros_updated_at ON public.movimentos_financeiros;
CREATE TRIGGER update_movimentos_financeiros_updated_at BEFORE UPDATE ON public.movimentos_financeiros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_voluntarios_updated_at ON public.voluntarios;
CREATE TRIGGER update_voluntarios_updated_at BEFORE UPDATE ON public.voluntarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. POLÍTICAS DE SEGURANÇA (RLS)

-- Ativar RLS nas tabelas principais
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Política para utilizadores - apenas administradores podem ver todos
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT id::text FROM public.users 
            WHERE perfil_acesso = 'administrador' AND ativo = true
        ) OR id = auth.uid()
    );

-- Política para logs - apenas administradores podem ver
CREATE POLICY "activity_logs_select_policy" ON public.activity_logs
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT id::text FROM public.users 
            WHERE perfil_acesso = 'administrador' AND ativo = true
        )
    );

-- 6. INSERIR UTILIZADOR ADMINISTRADOR PADRÃO
-- Senha: admin123 (deve ser alterada no primeiro login)
INSERT INTO public.users (
    username, 
    email, 
    password_hash, 
    nome_completo, 
    perfil_acesso, 
    ativo
) VALUES (
    'admin',
    'admin@valentao.pt',
    '$2b$10$rBV2HLmv5Fgegfudu2f0/.6IKBOaVjLQlFtjNhHnUPb5s2uDlbvBG', -- admin123
    'Administrador do Sistema',
    'administrador',
    true
) ON CONFLICT (username) DO NOTHING;

-- 7. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_perfil_acesso ON public.users(perfil_acesso);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_tabela ON public.activity_logs(tabela);

-- 8. VIEWS PARA RELATÓRIOS DE AUDITORIA

-- View para últimas atividades
CREATE OR REPLACE VIEW public.v_recent_activities AS
SELECT 
    al.id,
    al.acao,
    al.tabela,
    al.registro_id,
    u.nome_completo as usuario_nome,
    u.username,
    al.created_at,
    al.ip_address
FROM public.activity_logs al
LEFT JOIN public.users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- View para estatísticas de utilizadores
CREATE OR REPLACE VIEW public.v_user_stats AS
SELECT 
    u.id,
    u.username,
    u.nome_completo,
    u.perfil_acesso,
    u.ativo,
    u.ultimo_login,
    COUNT(al.id) as total_atividades,
    MAX(al.created_at) as ultima_atividade
FROM public.users u
LEFT JOIN public.activity_logs al ON u.id = al.user_id
GROUP BY u.id, u.username, u.nome_completo, u.perfil_acesso, u.ativo, u.ultimo_login;

-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE public.users IS 'Tabela de utilizadores do sistema com controle de acesso';
COMMENT ON TABLE public.activity_logs IS 'Logs de atividade para auditoria do sistema';
COMMENT ON COLUMN public.users.perfil_acesso IS 'Níveis: administrador, tecnico, consulta';
COMMENT ON COLUMN public.users.tentativas_login IS 'Contador de tentativas de login falhadas';
COMMENT ON COLUMN public.users.bloqueado_ate IS 'Data até quando o utilizador está bloqueado';

-- =====================================================
-- FIM DO SCHEMA DE CONTROLE DE ACESSOS
-- =====================================================