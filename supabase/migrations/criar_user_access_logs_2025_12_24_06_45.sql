-- Criar tabela para logs de acesso dos utilizadores
CREATE TABLE IF NOT EXISTS user_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    utilizador_nome VARCHAR(100) NOT NULL,
    utilizador_id VARCHAR(50),
    acao VARCHAR(20) NOT NULL CHECK (acao IN ('login', 'logout')),
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    sessao_id VARCHAR(100),
    duracao_sessao INTEGER, -- em minutos, apenas para logout
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_access_logs_utilizador ON user_access_logs(utilizador_nome);
CREATE INDEX IF NOT EXISTS idx_user_access_logs_acao ON user_access_logs(acao);
CREATE INDEX IF NOT EXISTS idx_user_access_logs_data ON user_access_logs(data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_user_access_logs_sessao ON user_access_logs(sessao_id);

-- Comentários para documentação
COMMENT ON TABLE user_access_logs IS 'Registo de acessos dos utilizadores (login/logout)';
COMMENT ON COLUMN user_access_logs.utilizador_nome IS 'Nome do utilizador que fez login/logout';
COMMENT ON COLUMN user_access_logs.utilizador_id IS 'ID único do utilizador';
COMMENT ON COLUMN user_access_logs.acao IS 'Tipo de ação: login ou logout';
COMMENT ON COLUMN user_access_logs.data_hora IS 'Data e hora da ação';
COMMENT ON COLUMN user_access_logs.ip_address IS 'Endereço IP do utilizador';
COMMENT ON COLUMN user_access_logs.user_agent IS 'Informações do navegador/dispositivo';
COMMENT ON COLUMN user_access_logs.sessao_id IS 'ID da sessão para correlacionar login/logout';
COMMENT ON COLUMN user_access_logs.duracao_sessao IS 'Duração da sessão em minutos (apenas logout)';

-- Inserir alguns dados de exemplo para teste
INSERT INTO user_access_logs (utilizador_nome, utilizador_id, acao, data_hora, sessao_id) VALUES
('admin', 'admin_001', 'login', NOW() - INTERVAL '2 hours', 'sess_001'),
('admin', 'admin_001', 'logout', NOW() - INTERVAL '1 hour 30 minutes', 'sess_001'),
('veterinario', 'vet_001', 'login', NOW() - INTERVAL '1 hour', 'sess_002'),
('voluntario', 'vol_001', 'login', NOW() - INTERVAL '30 minutes', 'sess_003'),
('admin', 'admin_001', 'login', NOW() - INTERVAL '15 minutes', 'sess_004');