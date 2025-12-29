-- =====================================================
-- OPERAÇÃO RESGATE - WIZARD DE DENÚNCIAS
-- Data: 2025-12-29 23:00 UTC
-- Missão: Criar sistema completo de denúncias
-- Objetivo: Dar voz aos animais que não podem falar
-- =====================================================

-- FASE 1: Criar tabela de denúncias
CREATE TABLE IF NOT EXISTS public.denuncias_2025_12_29_23_00 (
    -- Identificação Tática
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) UNIQUE NOT NULL, -- DENYYKKK
    
    -- Data e Canal de Operação
    data_denuncia TIMESTAMP NOT NULL,
    canal_denuncia VARCHAR(50) NOT NULL CHECK (canal_denuncia IN (
        'telefone', 'site', 'pessoalmente', 'autoridades', 
        'email', 'redes_sociais', 'outro'
    )),
    canal_denuncia_outro VARCHAR(100), -- Se canal = 'outro'
    
    -- Localização da Operação
    local_completo TEXT NOT NULL,
    descricao_situacao TEXT NOT NULL,
    
    -- Intel do Denunciante
    denunciante_anonimo BOOLEAN DEFAULT FALSE,
    denunciante_nome VARCHAR(200),
    denunciante_contato VARCHAR(200),
    denunciante_observacoes TEXT,
    
    -- Alvos da Operação (Animais)
    quantidade_animais INTEGER NOT NULL CHECK (quantidade_animais > 0),
    
    -- Intervenções Externas
    intervencao_policial BOOLEAN DEFAULT FALSE,
    dados_intervencao_policial JSONB,
    intervencao_veterinaria BOOLEAN DEFAULT FALSE,
    dados_intervencao_veterinaria JSONB,
    
    -- Equipe Tática
    voluntario_responsavel_id UUID,
    voluntarios_participantes UUID[], -- array de IDs
    
    -- Relacionamentos Operacionais
    missao_id UUID,
    
    -- Status da Operação
    status VARCHAR(20) DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_andamento', 'concluida')),
    
    -- Auditoria Militar
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign Keys
    CONSTRAINT fk_denuncias_voluntario_responsavel 
        FOREIGN KEY (voluntario_responsavel_id) 
        REFERENCES voluntarios(id),
    CONSTRAINT fk_denuncias_missao 
        FOREIGN KEY (missao_id) 
        REFERENCES missoes_2025_12_29_07_00(id)
);

-- Índices Táticos para Performance
CREATE INDEX IF NOT EXISTS idx_denuncias_codigo ON public.denuncias_2025_12_29_23_00(codigo);
CREATE INDEX IF NOT EXISTS idx_denuncias_data ON public.denuncias_2025_12_29_23_00(data_denuncia);
CREATE INDEX IF NOT EXISTS idx_denuncias_canal ON public.denuncias_2025_12_29_23_00(canal_denuncia);
CREATE INDEX IF NOT EXISTS idx_denuncias_status ON public.denuncias_2025_12_29_23_00(status);
CREATE INDEX IF NOT EXISTS idx_denuncias_responsavel ON public.denuncias_2025_12_29_23_00(voluntario_responsavel_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_denuncias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_denuncias_updated_at
    BEFORE UPDATE ON denuncias_2025_12_29_23_00
    FOR EACH ROW
    EXECUTE FUNCTION update_denuncias_updated_at();

-- FASE 2: Função para gerar próximo código de denúncia
CREATE OR REPLACE FUNCTION gerar_proximo_codigo_denuncia()
RETURNS VARCHAR(10) AS $$
DECLARE
    ano_atual VARCHAR(2);
    proximo_numero INTEGER;
    codigo_gerado VARCHAR(10);
BEGIN
    -- Obter os dois últimos dígitos do ano atual
    ano_atual := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Encontrar o próximo número sequencial para este ano
    SELECT COALESCE(MAX(
        CASE 
            WHEN codigo LIKE 'DEN' || ano_atual || '%' 
            THEN CAST(RIGHT(codigo, 3) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO proximo_numero
    FROM denuncias_2025_12_29_23_00;
    
    -- Gerar código no formato DENYYKKK
    codigo_gerado := 'DEN' || ano_atual || LPAD(proximo_numero::TEXT, 3, '0');
    
    RETURN codigo_gerado;
END;
$$ LANGUAGE plpgsql;

-- FASE 3: Tabela para sequência de animais por denúncia
CREATE TABLE IF NOT EXISTS public.denuncias_animais_sequencia (
    denuncia_codigo VARCHAR(10) NOT NULL,
    animal_id UUID NOT NULL,
    sequencia INTEGER NOT NULL,
    nome_gerado VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (denuncia_codigo, animal_id),
    CONSTRAINT fk_denuncias_animais_denuncia 
        FOREIGN KEY (denuncia_codigo) 
        REFERENCES denuncias_2025_12_29_23_00(codigo),
    CONSTRAINT fk_denuncias_animais_animal 
        FOREIGN KEY (animal_id) 
        REFERENCES animais(id)
);

-- FASE 4: Comentários Táticos
COMMENT ON TABLE denuncias_2025_12_29_23_00 IS 'Sistema de denúncias - Operação Resgate Animal';
COMMENT ON COLUMN denuncias_2025_12_29_23_00.codigo IS 'Código tático formato DENYYKKK';
COMMENT ON COLUMN denuncias_2025_12_29_23_00.canal_denuncia IS 'Canal de origem da intel';
COMMENT ON COLUMN denuncias_2025_12_29_23_00.denunciante_anonimo IS 'Proteção de identidade do informante';
COMMENT ON COLUMN denuncias_2025_12_29_23_00.quantidade_animais IS 'Número de alvos da operação';
COMMENT ON COLUMN denuncias_2025_12_29_23_00.voluntarios_participantes IS 'Equipe tática designada';

-- FASE 5: Inserir dados de teste para validação
DO $$
DECLARE
    codigo_teste VARCHAR(10);
BEGIN
    -- Gerar código de teste
    SELECT gerar_proximo_codigo_denuncia() INTO codigo_teste;
    
    -- Inserir denúncia de teste
    INSERT INTO denuncias_2025_12_29_23_00 (
        codigo, data_denuncia, canal_denuncia, local_completo, 
        descricao_situacao, denunciante_anonimo, quantidade_animais,
        intervencao_policial, intervencao_veterinaria, status, created_by
    ) VALUES (
        codigo_teste,
        NOW(),
        'site',
        'Rua de Teste, 123 - Centro da Cidade',
        'Teste do sistema de denúncias - Operação Resgate',
        FALSE,
        2,
        FALSE,
        FALSE,
        'aberta',
        'system_test'
    );
    
    RAISE NOTICE '🎯 OPERAÇÃO INICIADA - Código de teste gerado: %', codigo_teste;
END $$;

-- FASE 6: Verificação Final
DO $$
DECLARE
    total_denuncias INTEGER;
    ultimo_codigo VARCHAR(10);
BEGIN
    SELECT COUNT(*), MAX(codigo) 
    INTO total_denuncias, ultimo_codigo
    FROM denuncias_2025_12_29_23_00;
    
    RAISE NOTICE '';
    RAISE NOTICE '🚨 RELATÓRIO DE OPERAÇÃO';
    RAISE NOTICE '========================';
    RAISE NOTICE '✅ Tabela de denúncias criada';
    RAISE NOTICE '✅ Função de geração de códigos ativa';
    RAISE NOTICE '✅ Índices táticos implementados';
    RAISE NOTICE '✅ Total de denúncias: %', total_denuncias;
    RAISE NOTICE '✅ Último código gerado: %', ultimo_codigo;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 SISTEMA PRONTO PARA OPERAÇÃO!';
    RAISE NOTICE '🐾 Pelos animais que não podem falar por si!';
END $$;