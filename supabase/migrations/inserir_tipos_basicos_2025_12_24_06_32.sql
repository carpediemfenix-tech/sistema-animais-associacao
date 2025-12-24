-- Inserir tipos básicos se a tabela estiver vazia
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tipos_intervencoes LIMIT 1) THEN
        INSERT INTO tipos_intervencoes (nome, descricao, categoria, icone, cor, custo_estimado, duracao_estimada, requer_anestesia, requer_internamento, ativo)
        VALUES 
            ('Consulta Geral', 'Consulta veterinária de rotina', 'consulta', '🩺', '#3B82F6', 25.00, 30, false, false, true),
            ('Vacinação', 'Administração de vacinas', 'vacinacao', '💉', '#10B981', 15.00, 15, false, false, true),
            ('Esterilização', 'Cirurgia de esterilização', 'cirurgia', '✂️', '#EF4444', 80.00, 120, true, true, true),
            ('Consulta de Emergência', 'Atendimento de urgência', 'emergencia', '⚡', '#F59E0B', 50.00, 45, false, false, true),
            ('Exame de Sangue', 'Análises laboratoriais', 'diagnostico', '🔬', '#8B5CF6', 30.00, 20, false, false, true),
            ('Desparasitação', 'Tratamento contra parasitas', 'tratamento', '💊', '#EC4899', 20.00, 20, false, false, true),
            ('Consulta Preventiva', 'Check-up preventivo', 'preventivo', '🛡️', '#06B6D4', 30.00, 40, false, false, true);
    END IF;
END $$;

-- Criar índices para performance se não existirem
CREATE INDEX IF NOT EXISTS idx_tipos_intervencoes_categoria ON tipos_intervencoes(categoria);
CREATE INDEX IF NOT EXISTS idx_tipos_intervencoes_ativo ON tipos_intervencoes(ativo);