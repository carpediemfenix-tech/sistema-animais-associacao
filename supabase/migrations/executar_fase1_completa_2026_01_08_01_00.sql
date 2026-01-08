-- EXECUTAR FASE 1: ESTRUTURA BASE COMPLETA
-- Este script combina configurações e tabelas de admissão

-- ========================================
-- PARTE 1: TABELAS DE CONFIGURAÇÃO
-- ========================================

-- 1. Tabela genérica para configurações por domínio
CREATE TABLE IF NOT EXISTS public.intake_config_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES intake_config_options(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(domain, code),
    CHECK (domain ~ '^[a-z_]+$'),
    CHECK (code ~ '^[a-z0-9_]+$')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_intake_config_domain ON intake_config_options(domain);
CREATE INDEX IF NOT EXISTS idx_intake_config_active ON intake_config_options(is_active);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_intake_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_intake_config_updated_at
    BEFORE UPDATE ON intake_config_options
    FOR EACH ROW
    EXECUTE FUNCTION update_intake_config_updated_at();

-- RLS
ALTER TABLE intake_config_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_config_read" ON intake_config_options
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "intake_config_write" ON intake_config_options
    FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- PARTE 2: DADOS PADRÃO DE CONFIGURAÇÃO
-- ========================================

INSERT INTO intake_config_options (domain, code, name, description, sort_order) VALUES
-- Origem/Encaminhamento
('intake_origin', 'particular', 'Particular', 'Entregue por particular', 1),
('intake_origin', 'municipio', 'Município', 'Encaminhado pelo município', 2),
('intake_origin', 'sepna_gnr', 'SEPNA/GNR', 'Recolhido por SEPNA ou GNR', 3),
('intake_origin', 'psp', 'PSP', 'Recolhido pela PSP', 4),
('intake_origin', 'clinica_vet', 'Clínica/Hospital Veterinário', 'Encaminhado por clínica veterinária', 5),
('intake_origin', 'outro', 'Outro', 'Outra origem não especificada', 6),

-- Motivo de Entrada
('intake_reason', 'errante', 'Errante', 'Animal encontrado errante', 1),
('intake_reason', 'abandono', 'Abandono', 'Animal abandonado', 2),
('intake_reason', 'entrega_voluntaria', 'Entrega Voluntária', 'Entregue voluntariamente pelo tutor', 3),
('intake_reason', 'atropelamento', 'Atropelamento', 'Animal atropelado', 4),
('intake_reason', 'maus_tratos', 'Maus-tratos Suspeitos', 'Suspeita de maus-tratos', 5),
('intake_reason', 'doenca_evidente', 'Doença Evidente', 'Animal com doença evidente', 6),
('intake_reason', 'outro', 'Outro', 'Outro motivo não especificado', 7),

-- Estado Geral à Entrada
('general_condition', 'bom', 'Bom', 'Estado geral bom', 1),
('general_condition', 'razoavel', 'Razoável', 'Estado geral razoável', 2),
('general_condition', 'mau', 'Mau', 'Estado geral mau', 3),
('general_condition', 'critico', 'Crítico', 'Estado crítico', 4),

-- Nível de Consciência
('consciousness_level', 'alerta', 'Alerta', 'Animal alerta e responsivo', 1),
('consciousness_level', 'apatico', 'Apático', 'Animal apático', 2),
('consciousness_level', 'prostrado', 'Prostrado', 'Animal prostrado', 3),

-- Comportamento
('behavior_flags', 'calmo', 'Calmo', 'Comportamento calmo', 1),
('behavior_flags', 'assustado', 'Assustado', 'Animal assustado', 2),
('behavior_flags', 'agressivo', 'Agressivo', 'Comportamento agressivo', 3),
('behavior_flags', 'dor_evidente', 'Dor Evidente', 'Sinais evidentes de dor', 4),

-- Condição Corporal
('body_condition', 'bcs_1', 'BCS 1 - Muito Magro', 'Condição corporal 1', 1),
('body_condition', 'bcs_2', 'BCS 2 - Magro', 'Condição corporal 2', 2),
('body_condition', 'bcs_3', 'BCS 3 - Ideal', 'Condição corporal 3', 3),
('body_condition', 'bcs_4', 'BCS 4 - Sobrepeso', 'Condição corporal 4', 4),
('body_condition', 'bcs_5', 'BCS 5 - Obeso', 'Condição corporal 5', 5),

-- Tipos de Lesão
('injury_type', 'corte', 'Corte', 'Ferimento cortante', 1),
('injury_type', 'perfuracao', 'Perfuração', 'Ferimento perfurante', 2),
('injury_type', 'laceracao', 'Laceração', 'Laceração', 3),
('injury_type', 'fratura_suspeita', 'Fratura Suspeita', 'Suspeita de fratura', 4),

-- Localização Corporal
('body_location', 'cabeca', 'Cabeça', 'Região da cabeça', 1),
('body_location', 'pescoco', 'Pescoço', 'Região do pescoço', 2),
('body_location', 'tronco', 'Tronco', 'Região do tronco', 3),
('body_location', 'membros', 'Membros', 'Membros', 4),

-- Gravidade
('injury_severity', 'leve', 'Leve', 'Lesão leve', 1),
('injury_severity', 'moderada', 'Moderada', 'Lesão moderada', 2),
('injury_severity', 'grave', 'Grave', 'Lesão grave', 3)

ON CONFLICT (domain, code) DO NOTHING;

-- ========================================
-- PARTE 3: TABELAS DE ADMISSÃO
-- ========================================

-- Tabela principal de avaliação
CREATE TABLE IF NOT EXISTS public.animal_intake_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL,
    
    -- Circunstâncias
    intake_datetime TIMESTAMP WITH TIME ZONE,
    intake_origin_id UUID REFERENCES intake_config_options(id),
    intake_reason_id UUID REFERENCES intake_config_options(id),
    occurrence_location TEXT,
    circumstances_notes TEXT,
    
    -- Triagem
    general_condition_id UUID NOT NULL REFERENCES intake_config_options(id),
    consciousness_level_id UUID REFERENCES intake_config_options(id),
    behavior_flags JSONB,
    needs_isolation BOOLEAN DEFAULT false,
    needs_urgent_vet BOOLEAN DEFAULT false,
    
    -- Avaliação física
    weight_kg DECIMAL(5,2),
    body_condition_id UUID REFERENCES intake_config_options(id),
    temperature_celsius DECIMAL(4,1),
    physical_description TEXT,
    
    -- Ações imediatas
    first_aid_provided TEXT,
    medication_administered TEXT,
    
    -- Registo
    assessed_by_volunteer_id UUID,
    assessment_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de lesões
CREATE TABLE IF NOT EXISTS public.animal_intake_injuries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intake_assessment_id UUID NOT NULL REFERENCES animal_intake_assessments(id) ON DELETE CASCADE,
    injury_type_id UUID NOT NULL REFERENCES intake_config_options(id),
    body_location_id UUID NOT NULL REFERENCES intake_config_options(id),
    severity_id UUID NOT NULL REFERENCES intake_config_options(id),
    has_bleeding BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_intake_assessments_animal ON animal_intake_assessments(animal_id);
CREATE INDEX IF NOT EXISTS idx_intake_injuries_assessment ON animal_intake_injuries(intake_assessment_id);

-- RLS
ALTER TABLE animal_intake_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_intake_injuries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_assessments_read" ON animal_intake_assessments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "intake_assessments_write" ON animal_intake_assessments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "intake_injuries_read" ON animal_intake_injuries
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "intake_injuries_write" ON animal_intake_injuries
    FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- PARTE 4: FUNÇÕES HELPER
-- ========================================

-- Função para buscar opções por domínio
CREATE OR REPLACE FUNCTION get_intake_config_options(p_domain TEXT)
RETURNS TABLE (
    id UUID,
    code VARCHAR(50),
    name VARCHAR(100),
    description TEXT,
    sort_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ico.id,
        ico.code,
        ico.name,
        ico.description,
        ico.sort_order
    FROM intake_config_options ico
    WHERE ico.domain = p_domain
    AND ico.is_active = true
    ORDER BY ico.sort_order, ico.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar avaliação de admissão
CREATE OR REPLACE FUNCTION get_animal_intake_assessment(p_animal_id UUID)
RETURNS TABLE (
    assessment_id UUID,
    intake_datetime TIMESTAMP WITH TIME ZONE,
    general_condition_name TEXT,
    total_injuries INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aia.id as assessment_id,
        aia.intake_datetime,
        gc.name as general_condition_name,
        (SELECT COUNT(*) FROM animal_intake_injuries aii WHERE aii.intake_assessment_id = aia.id)::INTEGER as total_injuries
    FROM animal_intake_assessments aia
    LEFT JOIN intake_config_options gc ON aia.general_condition_id = gc.id
    WHERE aia.animal_id = p_animal_id
    ORDER BY aia.intake_datetime DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- ========================================

DO $$
DECLARE
    config_domains INTEGER;
    config_options INTEGER;
    assessments_table BOOLEAN;
    injuries_table BOOLEAN;
BEGIN
    -- Contar configurações
    SELECT COUNT(DISTINCT domain) INTO config_domains FROM intake_config_options;
    SELECT COUNT(*) INTO config_options FROM intake_config_options;
    
    -- Verificar tabelas
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'animal_intake_assessments'
    ) INTO assessments_table;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'animal_intake_injuries'
    ) INTO injuries_table;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ FASE 1: ESTRUTURA BASE CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Domínios de configuração: %', config_domains;
    RAISE NOTICE 'Opções de configuração: %', config_options;
    RAISE NOTICE 'Tabela animal_intake_assessments: %', CASE WHEN assessments_table THEN 'CRIADA' ELSE 'ERRO' END;
    RAISE NOTICE 'Tabela animal_intake_injuries: %', CASE WHEN injuries_table THEN 'CRIADA' ELSE 'ERRO' END;
    RAISE NOTICE 'Funções helper: CRIADAS';
    RAISE NOTICE 'RLS: CONFIGURADO';
    RAISE NOTICE '========================================';
    
    IF config_domains >= 10 AND assessments_table AND injuries_table THEN
        RAISE NOTICE '🎉 FASE 1 IMPLEMENTADA COM SUCESSO!';
        RAISE NOTICE 'Pronto para FASE 2: Interface com Abas';
    ELSE
        RAISE NOTICE '⚠️ VERIFICAR PROBLEMAS NA IMPLEMENTAÇÃO';
    END IF;
END;
$$;