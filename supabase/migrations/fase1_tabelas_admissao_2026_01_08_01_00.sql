-- FASE 1: ESTRUTURA BASE - TABELAS DE ADMISSÃO
-- Criar tabelas principais para ficha de admissão

-- 1. Tabela principal de avaliação de admissão
CREATE TABLE IF NOT EXISTS public.animal_intake_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    
    -- Circunstâncias da ocorrência/admissão
    intake_datetime TIMESTAMP WITH TIME ZONE, -- data e hora de recolha
    intake_origin_id UUID REFERENCES intake_config_options(id), -- origem/encaminhamento
    intake_reason_id UUID REFERENCES intake_config_options(id), -- motivo de entrada
    occurrence_location TEXT, -- local da ocorrência (narrativo)
    gps_coordinates TEXT, -- coordenadas GPS
    known_owner BOOLEAN, -- tutor conhecido?
    owner_contact TEXT, -- contacto do tutor
    case_number TEXT, -- nº ocorrência/auto/processo
    transport_conditions TEXT, -- condições de transporte/chegada
    circumstances_notes TEXT, -- observações das circunstâncias
    
    -- Triagem imediata
    general_condition_id UUID NOT NULL REFERENCES intake_config_options(id), -- estado geral (obrigatório)
    consciousness_level_id UUID REFERENCES intake_config_options(id), -- nível de consciência
    behavior_flags JSONB, -- comportamento (multi-select)
    needs_isolation BOOLEAN DEFAULT false, -- precisa isolamento/quarentena?
    isolation_reason TEXT, -- motivo do isolamento
    needs_urgent_vet BOOLEAN DEFAULT false, -- encaminhamento urgente veterinário?
    urgent_vet_reason TEXT, -- motivo do encaminhamento urgente
    risk_to_humans BOOLEAN DEFAULT false, -- risco para humanos/outros animais?
    risk_notes TEXT, -- nota sobre riscos
    
    -- Avaliação física detalhada
    weight_kg DECIMAL(5,2), -- peso (sincronizado com tabela animais)
    height_cm INTEGER, -- altura à cernelha
    body_condition_id UUID REFERENCES intake_config_options(id), -- condição corporal (BCS)
    temperature_celsius DECIMAL(4,1), -- temperatura
    heart_rate_bpm INTEGER, -- frequência cardíaca
    respiratory_rate_rpm INTEGER, -- frequência respiratória
    mucosa_status_id UUID REFERENCES intake_config_options(id), -- mucosas
    hydration_level_id UUID REFERENCES intake_config_options(id), -- hidratação
    mobility_status_id UUID REFERENCES intake_config_options(id), -- mobilidade
    skin_coat_flags JSONB, -- pele/pelo (multi-select)
    external_parasites BOOLEAN DEFAULT false, -- parasitas externos visíveis
    external_parasites_details TEXT, -- quais parasitas
    eyes_flags JSONB, -- olhos (multi-select)
    ears_flags JSONB, -- ouvidos (multi-select)
    mouth_flags JSONB, -- boca/dentes (multi-select)
    abdomen_status_id UUID REFERENCES intake_config_options(id), -- abdómen
    excretion_flags JSONB, -- fezes/urina observadas (multi-select)
    physical_description TEXT, -- descrição física detalhada
    
    -- Sinais e sintomas
    symptom_flags JSONB, -- checklist de sinais/sintomas
    other_symptoms TEXT, -- outros sinais/sintomas
    
    -- Ações imediatas realizadas
    first_aid_provided TEXT, -- primeiros socorros prestados
    medication_administered TEXT, -- medicação administrada
    medication_dose_time TEXT, -- dose/horário
    water_food_offered BOOLEAN DEFAULT false, -- água/comida oferecida
    water_food_notes TEXT, -- observações sobre água/comida
    deworming_on_entry BOOLEAN DEFAULT false, -- desparasitação na entrada
    deworming_product TEXT, -- produto usado
    bathing_hygiene BOOLEAN DEFAULT false, -- banho/higienização
    bathing_notes TEXT, -- observações do banho
    
    -- Registo da avaliação
    assessed_by_volunteer_id UUID NOT NULL REFERENCES voluntarios(id), -- avaliador (obrigatório)
    assessment_confirmed BOOLEAN DEFAULT false, -- confirma que avaliação foi feita no ato
    assessment_notes TEXT, -- notas gerais da avaliação
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Tabela para lesões/ferimentos (lista repetível)
CREATE TABLE IF NOT EXISTS public.animal_intake_injuries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intake_assessment_id UUID NOT NULL REFERENCES animal_intake_assessments(id) ON DELETE CASCADE,
    
    -- Detalhes da lesão
    injury_type_id UUID NOT NULL REFERENCES intake_config_options(id), -- tipo de lesão
    body_location_id UUID NOT NULL REFERENCES intake_config_options(id), -- localização
    body_location_details TEXT, -- detalhes da localização
    severity_id UUID NOT NULL REFERENCES intake_config_options(id), -- gravidade
    has_bleeding BOOLEAN DEFAULT false, -- hemorragia
    description TEXT, -- descrição da lesão
    photo_url TEXT, -- foto/URL da lesão
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_intake_assessments_animal ON animal_intake_assessments(animal_id);
CREATE INDEX IF NOT EXISTS idx_intake_assessments_condition ON animal_intake_assessments(general_condition_id);
CREATE INDEX IF NOT EXISTS idx_intake_assessments_assessor ON animal_intake_assessments(assessed_by_volunteer_id);
CREATE INDEX IF NOT EXISTS idx_intake_assessments_datetime ON animal_intake_assessments(intake_datetime);
CREATE INDEX IF NOT EXISTS idx_intake_injuries_assessment ON animal_intake_injuries(intake_assessment_id);

-- 4. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_intake_assessment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_intake_assessment_updated_at
    BEFORE UPDATE ON animal_intake_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_intake_assessment_updated_at();

CREATE TRIGGER trigger_intake_injury_updated_at
    BEFORE UPDATE ON animal_intake_injuries
    FOR EACH ROW
    EXECUTE FUNCTION update_intake_assessment_updated_at();

-- 5. Trigger para sincronizar peso com tabela animais
CREATE OR REPLACE FUNCTION sync_animal_weight()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar peso na tabela animais se foi fornecido
    IF NEW.weight_kg IS NOT NULL THEN
        UPDATE animais 
        SET peso = NEW.weight_kg,
            updated_at = NOW()
        WHERE id = NEW.animal_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_animal_weight
    AFTER INSERT OR UPDATE ON animal_intake_assessments
    FOR EACH ROW
    EXECUTE FUNCTION sync_animal_weight();

-- 6. RLS (Row Level Security)
ALTER TABLE animal_intake_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_intake_injuries ENABLE ROW LEVEL SECURITY;

-- Políticas para animal_intake_assessments
CREATE POLICY "intake_assessments_read" ON animal_intake_assessments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "intake_assessments_write" ON animal_intake_assessments
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        (
            -- Administradores podem tudo
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.raw_user_meta_data->>'perfil' = 'administrador'
            )
            OR
            -- Voluntários podem criar/editar suas próprias avaliações
            assessed_by_volunteer_id IN (
                SELECT id FROM voluntarios 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Políticas para animal_intake_injuries
CREATE POLICY "intake_injuries_read" ON animal_intake_injuries
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "intake_injuries_write" ON animal_intake_injuries
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM animal_intake_assessments aia
            WHERE aia.id = intake_assessment_id
            AND (
                -- Administradores podem tudo
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'perfil' = 'administrador'
                )
                OR
                -- Voluntários podem editar lesões de suas avaliações
                aia.assessed_by_volunteer_id IN (
                    SELECT id FROM voluntarios 
                    WHERE user_id = auth.uid()
                )
            )
        )
    );

-- 7. Função para buscar avaliação de admissão completa
CREATE OR REPLACE FUNCTION get_animal_intake_assessment(p_animal_id UUID)
RETURNS TABLE (
    assessment_id UUID,
    animal_id UUID,
    intake_datetime TIMESTAMP WITH TIME ZONE,
    general_condition_name TEXT,
    assessor_name TEXT,
    total_injuries INTEGER,
    assessment_summary TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aia.id as assessment_id,
        aia.animal_id,
        aia.intake_datetime,
        gc.name as general_condition_name,
        v.nome as assessor_name,
        (SELECT COUNT(*) FROM animal_intake_injuries aii WHERE aii.intake_assessment_id = aia.id)::INTEGER as total_injuries,
        COALESCE(aia.assessment_notes, 'Sem observações') as assessment_summary
    FROM animal_intake_assessments aia
    LEFT JOIN intake_config_options gc ON aia.general_condition_id = gc.id
    LEFT JOIN voluntarios v ON aia.assessed_by_volunteer_id = v.id
    WHERE aia.animal_id = p_animal_id
    ORDER BY aia.intake_datetime DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para estatísticas de admissão
CREATE OR REPLACE FUNCTION get_intake_statistics()
RETURNS TABLE (
    total_assessments INTEGER,
    critical_condition INTEGER,
    needs_urgent_vet INTEGER,
    needs_isolation INTEGER,
    total_injuries INTEGER,
    last_30_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_assessments,
        COUNT(CASE WHEN gc.code = 'critico' THEN 1 END)::INTEGER as critical_condition,
        COUNT(CASE WHEN aia.needs_urgent_vet = true THEN 1 END)::INTEGER as needs_urgent_vet,
        COUNT(CASE WHEN aia.needs_isolation = true THEN 1 END)::INTEGER as needs_isolation,
        (SELECT COUNT(*) FROM animal_intake_injuries)::INTEGER as total_injuries,
        COUNT(CASE WHEN aia.created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::INTEGER as last_30_days
    FROM animal_intake_assessments aia
    LEFT JOIN intake_config_options gc ON aia.general_condition_id = gc.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Verificar estrutura criada
DO $$
DECLARE
    assessments_count INTEGER;
    injuries_count INTEGER;
    config_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO assessments_count FROM animal_intake_assessments;
    SELECT COUNT(*) INTO injuries_count FROM animal_intake_injuries;
    SELECT COUNT(*) INTO config_count FROM intake_config_options;
    
    RAISE NOTICE '✅ TABELAS DE ADMISSÃO CRIADAS COM SUCESSO!';
    RAISE NOTICE 'Tabela animal_intake_assessments: % registos', assessments_count;
    RAISE NOTICE 'Tabela animal_intake_injuries: % registos', injuries_count;
    RAISE NOTICE 'Opções de configuração disponíveis: %', config_count;
    RAISE NOTICE 'Funções helper criadas: get_animal_intake_assessment(), get_intake_statistics()';
    RAISE NOTICE 'RLS configurado para segurança';
    RAISE NOTICE 'Triggers de sincronização ativos';
END;
$$;