-- Criar tabela de tipos de notificações
CREATE TABLE IF NOT EXISTS tipos_notificacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50) DEFAULT '🔔',
    cor VARCHAR(7) DEFAULT '#3B82F6',
    categoria VARCHAR(50) DEFAULT 'sistema',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela principal de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_id UUID REFERENCES tipos_notificacoes(id),
    utilizador_id VARCHAR(50),
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica', 'urgente')),
    categoria VARCHAR(50) DEFAULT 'sistema',
    entidade_tipo VARCHAR(50),
    entidade_id VARCHAR(50),
    acao_url TEXT,
    acao_texto VARCHAR(100),
    lida BOOLEAN DEFAULT false,
    arquivada BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    auto_dismiss BOOLEAN DEFAULT false,
    som_ativo BOOLEAN DEFAULT true,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de configurações de notificação por utilizador
CREATE TABLE IF NOT EXISTS configuracoes_notificacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    utilizador_id VARCHAR(50) NOT NULL,
    tipo_notificacao_id UUID REFERENCES tipos_notificacoes(id),
    ativo BOOLEAN DEFAULT true,
    email_ativo BOOLEAN DEFAULT false,
    push_ativo BOOLEAN DEFAULT true,
    som_ativo BOOLEAN DEFAULT true,
    prioridade_minima VARCHAR(20) DEFAULT 'media',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(utilizador_id, tipo_notificacao_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_utilizador ON notificacoes(utilizador_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_prioridade ON notificacoes(prioridade);
CREATE INDEX IF NOT EXISTS idx_notificacoes_categoria ON notificacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tipos_notificacoes_codigo ON tipos_notificacoes(codigo);

-- Inserir tipos básicos de notificações
INSERT INTO tipos_notificacoes (codigo, nome, descricao, icone, cor, categoria) VALUES
('animal_novo', 'Novo Animal', 'Animal adicionado ao sistema', '🐕', '#10B981', 'animais'),
('animal_adotado', 'Animal Adotado', 'Animal foi adotado', '❤️', '#EC4899', 'animais'),
('intervencao_agendada', 'Intervenção Agendada', 'Nova intervenção médica agendada', '🏥', '#3B82F6', 'saude'),
('intervencao_concluida', 'Intervenção Concluída', 'Intervenção médica concluída', '✅', '#10B981', 'saude'),
('utilizador_novo', 'Novo Utilizador', 'Novo utilizador registado', '👤', '#8B5CF6', 'sistema'),
('login_suspeito', 'Login Suspeito', 'Tentativa de login suspeita', '⚠️', '#F59E0B', 'seguranca'),
('sessao_expirada', 'Sessão Expirada', 'Sessão de utilizador expirou', '⏰', '#EF4444', 'seguranca'),
('backup_concluido', 'Backup Concluído', 'Backup do sistema concluído', '💾', '#06B6D4', 'sistema'),
('manutencao_agendada', 'Manutenção Agendada', 'Manutenção do sistema agendada', '🔧', '#F59E0B', 'sistema'),
('erro_sistema', 'Erro do Sistema', 'Erro crítico no sistema', '🚨', '#EF4444', 'sistema')
ON CONFLICT (codigo) DO NOTHING;

-- Inserir algumas notificações de exemplo
INSERT INTO notificacoes (tipo_id, utilizador_id, titulo, mensagem, prioridade, categoria, lida, som_ativo) 
SELECT 
    t.id,
    'admin',
    'Bem-vindo ao Sistema de Notificações',
    'O sistema de notificações foi configurado com sucesso. Agora receberá alertas importantes sobre o sistema.',
    'media',
    'sistema',
    false,
    true
FROM tipos_notificacoes t 
WHERE t.codigo = 'backup_concluido'
LIMIT 1;

-- Comentários para documentação
COMMENT ON TABLE tipos_notificacoes IS 'Tipos de notificações disponíveis no sistema';
COMMENT ON TABLE notificacoes IS 'Notificações enviadas aos utilizadores';
COMMENT ON TABLE configuracoes_notificacoes IS 'Configurações de notificação por utilizador e tipo';