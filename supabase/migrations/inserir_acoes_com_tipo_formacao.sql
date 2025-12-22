-- Verificar se existe tabela tipos_formacao
SELECT * FROM tipos_formacao LIMIT 3;

-- Inserir dados na acoes_formacao usando o primeiro tipo disponível
DO $$
DECLARE
    v_tipo_id UUID;
BEGIN
    -- Pegar o primeiro tipo de formação
    SELECT id INTO v_tipo_id FROM tipos_formacao LIMIT 1;
    
    IF v_tipo_id IS NOT NULL THEN
        INSERT INTO acoes_formacao (codigo_acao, nome_acao, tipo_formacao_id, ativo)
        VALUES 
            ('FORM001', 'Primeiros Socorros para Animais', v_tipo_id, true),
            ('FORM002', 'Técnicas de Resgate', v_tipo_id, true),
            ('FORM003', 'Comportamento Animal', v_tipo_id, true)
        ON CONFLICT (codigo_acao) DO NOTHING;
        
        RAISE NOTICE 'Dados inseridos com tipo_formacao_id: %', v_tipo_id;
    ELSE
        RAISE NOTICE 'Nenhum tipo de formação encontrado';
    END IF;
END $$;