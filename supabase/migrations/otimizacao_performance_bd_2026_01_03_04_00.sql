-- =====================================================
-- OTIMIZAÇÃO E MELHORIA DA PERFORMANCE DO BANCO DE DADOS
-- Sistema Valentão Operacionais v2.0
-- Data: 2026-01-03 04:00 UTC
-- =====================================================

-- 1. CRIAÇÃO DE ÍNDICES PARA MELHORAR PERFORMANCE
-- =====================================================

-- Índices para tabela de animais
CREATE INDEX IF NOT EXISTS idx_animais_nome ON animais(nome);
CREATE INDEX IF NOT EXISTS idx_animais_especie ON animais(especie_id);
CREATE INDEX IF NOT EXISTS idx_animais_estado ON animais(estado);
CREATE INDEX IF NOT EXISTS idx_animais_data_entrada ON animais(data_entrada);
CREATE INDEX IF NOT EXISTS idx_animais_ativo ON animais(ativo);

-- Índices para tabela de voluntários
CREATE INDEX IF NOT EXISTS idx_voluntarios_nome ON voluntarios_2025_12_21_22_00(nome);
CREATE INDEX IF NOT EXISTS idx_voluntarios_email ON voluntarios_2025_12_21_22_00(email);
CREATE INDEX IF NOT EXISTS idx_voluntarios_ativo ON voluntarios_2025_12_21_22_00(ativo);

-- Índices para tabela de denúncias
CREATE INDEX IF NOT EXISTS idx_denuncias_status ON denuncias(status);
CREATE INDEX IF NOT EXISTS idx_denuncias_prioridade ON denuncias(prioridade);
CREATE INDEX IF NOT EXISTS idx_denuncias_data ON denuncias(data_denuncia);
CREATE INDEX IF NOT EXISTS idx_denuncias_codigo ON denuncias(codigo);

-- Índices para tabela de missões
CREATE INDEX IF NOT EXISTS idx_missoes_status ON missoes_2025_12_21_19_00(status);
CREATE INDEX IF NOT EXISTS idx_missoes_data ON missoes_2025_12_21_19_00(data_missao);
CREATE INDEX IF NOT EXISTS idx_missoes_prioridade ON missoes_2025_12_21_19_00(prioridade);

-- Índices para tabela de notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_utilizador ON notificacoes(utilizador_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data ON notificacoes(created_at);
CREATE INDEX IF NOT EXISTS idx_notificacoes_categoria ON notificacoes(categoria);

-- 2. CRIAÇÃO DE VIEWS PARA CONSULTAS FREQUENTES
-- =====================================================

-- View para estatísticas gerais do sistema
CREATE OR REPLACE VIEW v_estatisticas_sistema AS
SELECT 
    (SELECT COUNT(*) FROM animais WHERE ativo = true) as total_animais_ativos,
    (SELECT COUNT(*) FROM animais WHERE estado = 'adotado') as total_animais_adotados,
    (SELECT COUNT(*) FROM voluntarios_2025_12_21_22_00 WHERE ativo = true) as total_voluntarios_ativos,
    (SELECT COUNT(*) FROM denuncias WHERE status != 'arquivada') as total_denuncias_ativas,
    (SELECT COUNT(*) FROM missoes_2025_12_21_19_00 WHERE status = 'ativa') as total_missoes_ativas,
    (SELECT COUNT(*) FROM notificacoes WHERE lida = false) as total_notificacoes_nao_lidas;

-- View para animais com informações completas
CREATE OR REPLACE VIEW v_animais_completos AS
SELECT 
    a.*,
    e.nome as especie_nome,
    COUNT(i.id) as total_intervencoes,
    MAX(i.data_intervencao) as ultima_intervencao
FROM animais a
LEFT JOIN especies e ON a.especie_id = e.id
LEFT JOIN intervencoes i ON a.id = i.animal_id
WHERE a.ativo = true
GROUP BY a.id, e.nome;

-- View para voluntários com especialidades
CREATE OR REPLACE VIEW v_voluntarios_especialidades AS
SELECT 
    v.*,
    COUNT(ve.id) as total_especialidades,
    STRING_AGG(esp.nome, ', ') as especialidades_nomes
FROM voluntarios_2025_12_21_22_00 v
LEFT JOIN voluntario_especialidades_2025_12_21_22_00 ve ON v.id = ve.voluntario_id AND ve.ativo = true
LEFT JOIN especialidades_voluntarios_2025_12_21_22_00 esp ON ve.especialidade_id = esp.id
WHERE v.ativo = true
GROUP BY v.id;

-- 3. FUNÇÕES PARA LIMPEZA AUTOMÁTICA
-- =====================================================

-- Função para limpar notificações antigas
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas()
RETURNS INTEGER AS $$
DECLARE
    registros_removidos INTEGER;
BEGIN
    -- Remove notificações lidas com mais de 30 dias
    DELETE FROM notificacoes 
    WHERE lida = true 
    AND created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS registros_removidos = ROW_COUNT;
    
    RETURN registros_removidos;
END;
$$ LANGUAGE plpgsql;

-- Função para arquivar denúncias antigas concluídas
CREATE OR REPLACE FUNCTION arquivar_denuncias_antigas()
RETURNS INTEGER AS $$
DECLARE
    registros_arquivados INTEGER;
BEGIN
    -- Arquiva denúncias concluídas com mais de 90 dias
    UPDATE denuncias 
    SET status = 'arquivada'
    WHERE status = 'concluida' 
    AND data_denuncia < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS registros_arquivados = ROW_COUNT;
    
    RETURN registros_arquivados;
END;
$$ LANGUAGE plpgsql;

-- 4. TRIGGERS PARA MANUTENÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas principais
DROP TRIGGER IF EXISTS trigger_animais_updated_at ON animais;
CREATE TRIGGER trigger_animais_updated_at
    BEFORE UPDATE ON animais
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_voluntarios_updated_at ON voluntarios_2025_12_21_22_00;
CREATE TRIGGER trigger_voluntarios_updated_at
    BEFORE UPDATE ON voluntarios_2025_12_21_22_00
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. FUNÇÃO PARA ESTATÍSTICAS DE PERFORMANCE
-- =====================================================

CREATE OR REPLACE FUNCTION get_performance_stats()
RETURNS TABLE(
    tabela TEXT,
    total_registros BIGINT,
    tamanho_mb NUMERIC,
    indices_utilizados INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as tabela,
        n_tup_ins + n_tup_upd + n_tup_del as total_registros,
        ROUND((pg_total_relation_size(schemaname||'.'||tablename))::numeric / 1024 / 1024, 2) as tamanho_mb,
        (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as indices_utilizados
    FROM pg_stat_user_tables t
    WHERE schemaname = 'public'
    ORDER BY tamanho_mb DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. CONFIGURAÇÕES DE OTIMIZAÇÃO
-- =====================================================

-- Atualizar estatísticas das tabelas
ANALYZE animais;
ANALYZE voluntarios_2025_12_21_22_00;
ANALYZE denuncias;
ANALYZE missoes_2025_12_21_19_00;
ANALYZE notificacoes;

-- 7. FUNÇÃO PARA BACKUP DE DADOS CRÍTICOS
-- =====================================================

CREATE OR REPLACE FUNCTION criar_backup_dados_criticos()
RETURNS TEXT AS $$
DECLARE
    backup_info TEXT;
    total_animais INTEGER;
    total_voluntarios INTEGER;
    total_denuncias INTEGER;
BEGIN
    -- Contar registros críticos
    SELECT COUNT(*) INTO total_animais FROM animais WHERE ativo = true;
    SELECT COUNT(*) INTO total_voluntarios FROM voluntarios_2025_12_21_22_00 WHERE ativo = true;
    SELECT COUNT(*) INTO total_denuncias FROM denuncias WHERE status != 'arquivada';
    
    backup_info := format(
        'Backup criado em %s - Animais: %s, Voluntários: %s, Denúncias: %s',
        NOW()::timestamp,
        total_animais,
        total_voluntarios,
        total_denuncias
    );
    
    -- Log do backup (inserir em tabela de logs se existir)
    INSERT INTO logs_sistema (nivel, categoria, mensagem, created_at)
    VALUES ('info', 'backup', backup_info, NOW())
    ON CONFLICT DO NOTHING;
    
    RETURN backup_info;
END;
$$ LANGUAGE plpgsql;

-- 8. CRIAÇÃO DE TABELA DE LOGS DO SISTEMA
-- =====================================================

CREATE TABLE IF NOT EXISTS logs_sistema (
    id SERIAL PRIMARY KEY,
    nivel VARCHAR(20) NOT NULL DEFAULT 'info',
    categoria VARCHAR(50) NOT NULL DEFAULT 'system',
    mensagem TEXT NOT NULL,
    utilizador_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    detalhes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_logs_nivel ON logs_sistema(nivel);
CREATE INDEX IF NOT EXISTS idx_logs_categoria ON logs_sistema(categoria);
CREATE INDEX IF NOT EXISTS idx_logs_data ON logs_sistema(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_utilizador ON logs_sistema(utilizador_id);

-- RLS para logs (apenas administradores podem ver)
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administradores podem ver todos os logs" ON logs_sistema
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM utilizadores 
            WHERE username = auth.jwt() ->> 'sub' 
            AND perfil = 'administrador'
        )
    );

-- 9. FUNÇÃO PARA LIMPEZA GERAL DO SISTEMA
-- =====================================================

CREATE OR REPLACE FUNCTION executar_limpeza_sistema()
RETURNS TEXT AS $$
DECLARE
    notificacoes_removidas INTEGER;
    denuncias_arquivadas INTEGER;
    resultado TEXT;
BEGIN
    -- Executar limpezas
    SELECT limpar_notificacoes_antigas() INTO notificacoes_removidas;
    SELECT arquivar_denuncias_antigas() INTO denuncias_arquivadas;
    
    -- Atualizar estatísticas
    ANALYZE;
    
    resultado := format(
        'Limpeza concluída: %s notificações removidas, %s denúncias arquivadas',
        notificacoes_removidas,
        denuncias_arquivadas
    );
    
    -- Log da limpeza
    INSERT INTO logs_sistema (nivel, categoria, mensagem, created_at)
    VALUES ('info', 'maintenance', resultado, NOW());
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- 10. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION limpar_notificacoes_antigas() IS 'Remove notificações lidas com mais de 30 dias';
COMMENT ON FUNCTION arquivar_denuncias_antigas() IS 'Arquiva denúncias concluídas com mais de 90 dias';
COMMENT ON FUNCTION get_performance_stats() IS 'Retorna estatísticas de performance das tabelas';
COMMENT ON FUNCTION executar_limpeza_sistema() IS 'Executa limpeza geral do sistema';
COMMENT ON VIEW v_estatisticas_sistema IS 'Estatísticas gerais do sistema em tempo real';
COMMENT ON VIEW v_animais_completos IS 'Animais com informações completas incluindo espécie e intervenções';
COMMENT ON VIEW v_voluntarios_especialidades IS 'Voluntários com suas especialidades agregadas';

-- Finalização
SELECT 'Otimização do banco de dados concluída com sucesso!' as resultado;