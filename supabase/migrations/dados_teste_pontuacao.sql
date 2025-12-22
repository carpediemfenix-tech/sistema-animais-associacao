-- Adicionar dados de teste ao sistema de pontuação
-- Verificar se existem voluntários
DO $$
DECLARE
    v_voluntario_id UUID;
    v_missao_id UUID;
BEGIN
    -- Pegar o primeiro voluntário disponível
    SELECT id INTO v_voluntario_id FROM voluntarios LIMIT 1;
    
    -- Pegar a primeira missão disponível
    SELECT id INTO v_missao_id FROM missoes_2025_12_21_19_00 LIMIT 1;
    
    -- Se existir voluntário, criar dados de teste
    IF v_voluntario_id IS NOT NULL THEN
        -- Inserir pontuação inicial
        INSERT INTO pontuacao_voluntarios_2025_12_22_02_00 (voluntario_id, pontos_totais, nivel, total_missoes, total_horas)
        VALUES (v_voluntario_id, 150, 2, 3, 12.5)
        ON CONFLICT (voluntario_id) DO UPDATE SET
            pontos_totais = EXCLUDED.pontos_totais,
            nivel = EXCLUDED.nivel,
            total_missoes = EXCLUDED.total_missoes,
            total_horas = EXCLUDED.total_horas;
        
        -- Inserir histórico de pontos
        INSERT INTO historico_pontos_2025_12_22_02_00 (voluntario_id, missao_id, pontos_ganhos, descricao, tipo_acao)
        VALUES 
            (v_voluntario_id, v_missao_id, 50, 'Participação como coordenador na missão de resgate', 'coordenacao'),
            (v_voluntario_id, v_missao_id, 30, 'Participação como voluntário na missão', 'participacao'),
            (v_voluntario_id, NULL, 20, 'Participação em formação de primeiros socorros', 'formacao'),
            (v_voluntario_id, NULL, 25, 'Participação em workshop de comportamento animal', 'formacao'),
            (v_voluntario_id, v_missao_id, 25, 'Participação como veterinário na missão', 'participacao')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Dados de teste criados para voluntário: %', v_voluntario_id;
    ELSE
        RAISE NOTICE 'Nenhum voluntário encontrado para criar dados de teste';
    END IF;
END $$;