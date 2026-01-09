-- Expandir opções para exame físico detalhado por sistemas e avaliação comportamental
-- Fase 3: Seções Expandidas

-- 1. ADICIONAR OPÇÕES PARA EXAME FÍSICO POR SISTEMAS
INSERT INTO intake_config_options_2026_01_09_03_00 (domain, code, name, description, is_active, display_order) VALUES

-- SISTEMA CARDIOVASCULAR
('physical_exam_cardiovascular', 'heart_rate_normal', 'Frequência cardíaca normal', 'FC dentro dos parâmetros normais', true, 500),
('physical_exam_cardiovascular', 'heart_rate_tachycardia', 'Taquicardia', 'FC acima do normal', true, 501),
('physical_exam_cardiovascular', 'heart_rate_bradycardia', 'Bradicardia', 'FC abaixo do normal', true, 502),
('physical_exam_cardiovascular', 'heart_murmur', 'Sopro cardíaco', 'Presença de sopro à auscultação', true, 503),
('physical_exam_cardiovascular', 'arrhythmia', 'Arritmia', 'Ritmo cardíaco irregular', true, 504),
('physical_exam_cardiovascular', 'pulse_weak', 'Pulso fraco', 'Pulso periférico diminuído', true, 505),
('physical_exam_cardiovascular', 'pulse_absent', 'Pulso ausente', 'Ausência de pulso periférico', true, 506),
('physical_exam_cardiovascular', 'capillary_refill_normal', 'TRC normal (<2s)', 'Tempo de repleção capilar normal', true, 507),
('physical_exam_cardiovascular', 'capillary_refill_delayed', 'TRC prolongado (>2s)', 'Tempo de repleção capilar aumentado', true, 508),

-- SISTEMA RESPIRATÓRIO
('physical_exam_respiratory', 'breathing_normal', 'Respiração normal', 'Padrão respiratório normal', true, 510),
('physical_exam_respiratory', 'dyspnea_inspiratory', 'Dispneia inspiratória', 'Dificuldade na inspiração', true, 511),
('physical_exam_respiratory', 'dyspnea_expiratory', 'Dispneia expiratória', 'Dificuldade na expiração', true, 512),
('physical_exam_respiratory', 'dyspnea_mixed', 'Dispneia mista', 'Dificuldade inspiratória e expiratória', true, 513),
('physical_exam_respiratory', 'cough_dry', 'Tosse seca', 'Tosse sem expectoração', true, 514),
('physical_exam_respiratory', 'cough_productive', 'Tosse produtiva', 'Tosse com expectoração', true, 515),
('physical_exam_respiratory', 'wheezing', 'Sibilos', 'Sons respiratórios anómalos', true, 516),
('physical_exam_respiratory', 'crackles', 'Crepitações', 'Ruídos húmidos à auscultação', true, 517),
('physical_exam_respiratory', 'stridor', 'Estridor', 'Som respiratório de obstrução alta', true, 518),

-- SISTEMA NEUROLÓGICO
('physical_exam_neurological', 'consciousness_alert', 'Alerta', 'Totalmente consciente e responsivo', true, 520),
('physical_exam_neurological', 'consciousness_lethargic', 'Letárgico', 'Diminuição da responsividade', true, 521),
('physical_exam_neurological', 'consciousness_stuporous', 'Estuporoso', 'Responsivo apenas a estímulos intensos', true, 522),
('physical_exam_neurological', 'consciousness_comatose', 'Comatoso', 'Não responsivo a estímulos', true, 523),
('physical_exam_neurological', 'pupils_normal', 'Pupilas normais', 'Tamanho e reatividade normais', true, 524),
('physical_exam_neurological', 'pupils_dilated', 'Pupilas dilatadas', 'Midríase bilateral', true, 525),
('physical_exam_neurological', 'pupils_constricted', 'Pupilas contraídas', 'Miose bilateral', true, 526),
('physical_exam_neurological', 'pupils_unequal', 'Anisocoria', 'Pupilas de tamanhos diferentes', true, 527),
('physical_exam_neurological', 'reflexes_normal', 'Reflexos normais', 'Reflexos dentro da normalidade', true, 528),
('physical_exam_neurological', 'reflexes_hyperactive', 'Reflexos hiperativos', 'Reflexos exagerados', true, 529),
('physical_exam_neurological', 'reflexes_hypoactive', 'Reflexos hipoativos', 'Reflexos diminuídos', true, 530),
('physical_exam_neurological', 'reflexes_absent', 'Reflexos ausentes', 'Ausência de reflexos', true, 531),

-- SISTEMA GASTROINTESTINAL
('physical_exam_gastrointestinal', 'abdomen_normal', 'Abdómen normal', 'Palpação e auscultação normais', true, 540),
('physical_exam_gastrointestinal', 'abdomen_distended', 'Abdómen distendido', 'Aumento do volume abdominal', true, 541),
('physical_exam_gastrointestinal', 'abdomen_painful', 'Abdómen doloroso', 'Dor à palpação abdominal', true, 542),
('physical_exam_gastrointestinal', 'bowel_sounds_normal', 'Ruídos intestinais normais', 'Peristaltismo normal', true, 543),
('physical_exam_gastrointestinal', 'bowel_sounds_increased', 'Ruídos intestinais aumentados', 'Hiperperistaltismo', true, 544),
('physical_exam_gastrointestinal', 'bowel_sounds_decreased', 'Ruídos intestinais diminuídos', 'Hipoperistaltismo', true, 545),
('physical_exam_gastrointestinal', 'bowel_sounds_absent', 'Ruídos intestinais ausentes', 'Íleo paralítico', true, 546),

-- SISTEMA MUSCULOESQUELÉTICO
('physical_exam_musculoskeletal', 'gait_normal', 'Marcha normal', 'Locomoção sem alterações', true, 550),
('physical_exam_musculoskeletal', 'lameness_grade1', 'Claudicação grau 1', 'Claudicação ligeira', true, 551),
('physical_exam_musculoskeletal', 'lameness_grade2', 'Claudicação grau 2', 'Claudicação moderada', true, 552),
('physical_exam_musculoskeletal', 'lameness_grade3', 'Claudicação grau 3', 'Claudicação severa', true, 553),
('physical_exam_musculoskeletal', 'lameness_grade4', 'Claudicação grau 4', 'Não apoia o membro', true, 554),
('physical_exam_musculoskeletal', 'muscle_atrophy', 'Atrofia muscular', 'Diminuição da massa muscular', true, 555),
('physical_exam_musculoskeletal', 'joint_swelling', 'Tumefação articular', 'Aumento de volume das articulações', true, 556),
('physical_exam_musculoskeletal', 'range_motion_limited', 'Amplitude limitada', 'Limitação dos movimentos articulares', true, 557),

-- SISTEMA TEGUMENTAR (PELE)
('physical_exam_integumentary', 'skin_normal', 'Pele normal', 'Pele saudável sem alterações', true, 560),
('physical_exam_integumentary', 'skin_dry', 'Pele seca', 'Descamação e ressecamento', true, 561),
('physical_exam_integumentary', 'skin_oily', 'Pele oleosa', 'Excesso de oleosidade', true, 562),
('physical_exam_integumentary', 'dermatitis', 'Dermatite', 'Inflamação da pele', true, 563),
('physical_exam_integumentary', 'alopecia_focal', 'Alopécia focal', 'Perda de pelo localizada', true, 564),
('physical_exam_integumentary', 'alopecia_generalized', 'Alopécia generalizada', 'Perda de pelo difusa', true, 565),
('physical_exam_integumentary', 'wounds_superficial', 'Feridas superficiais', 'Lesões cutâneas ligeiras', true, 566),
('physical_exam_integumentary', 'wounds_deep', 'Feridas profundas', 'Lesões que atravessam a pele', true, 567),
('physical_exam_integumentary', 'ectoparasites', 'Ectoparasitas', 'Pulgas, carraças, ácaros visíveis', true, 568);

-- 2. ADICIONAR OPÇÕES PARA AVALIAÇÃO COMPORTAMENTAL
INSERT INTO intake_config_options_2026_01_09_03_00 (domain, code, name, description, is_active, display_order) VALUES

-- TEMPERAMENTO GERAL
('behavioral_assessment_temperament', 'friendly_confident', 'Amigável e confiante', 'Aproxima-se facilmente, cauda abanando', true, 600),
('behavioral_assessment_temperament', 'friendly_shy', 'Amigável mas tímido', 'Amigável mas hesitante no contacto', true, 601),
('behavioral_assessment_temperament', 'neutral_calm', 'Neutro e calmo', 'Não demonstra medo nem agressividade', true, 602),
('behavioral_assessment_temperament', 'fearful_mild', 'Medroso ligeiro', 'Demonstra algum medo mas permite aproximação', true, 603),
('behavioral_assessment_temperament', 'fearful_severe', 'Medroso severo', 'Muito assustado, evita contacto', true, 604),
('behavioral_assessment_temperament', 'aggressive_defensive', 'Agressivo defensivo', 'Agressão por medo ou proteção', true, 605),
('behavioral_assessment_temperament', 'aggressive_offensive', 'Agressivo ofensivo', 'Agressão proativa', true, 606),
('behavioral_assessment_temperament', 'hyperactive', 'Hiperativo', 'Muito ativo, dificuldade em acalmar', true, 607),
('behavioral_assessment_temperament', 'lethargic_depressed', 'Letárgico/Deprimido', 'Pouco responsivo, apático', true, 608),

-- SOCIALIZAÇÃO COM HUMANOS
('behavioral_assessment_human_social', 'excellent_socialization', 'Socialização excelente', 'Muito bem socializado com pessoas', true, 610),
('behavioral_assessment_human_social', 'good_socialization', 'Socialização boa', 'Bem socializado, algumas hesitações', true, 611),
('behavioral_assessment_human_social', 'moderate_socialization', 'Socialização moderada', 'Socialização básica, precisa trabalho', true, 612),
('behavioral_assessment_human_social', 'poor_socialization', 'Socialização pobre', 'Pouco socializado, muito trabalho necessário', true, 613),
('behavioral_assessment_human_social', 'no_socialization', 'Sem socialização', 'Não socializado, requer reabilitação', true, 614),
('behavioral_assessment_human_social', 'fear_men', 'Medo de homens', 'Demonstra medo específico de homens', true, 615),
('behavioral_assessment_human_social', 'fear_women', 'Medo de mulheres', 'Demonstra medo específico de mulheres', true, 616),
('behavioral_assessment_human_social', 'fear_children', 'Medo de crianças', 'Demonstra medo específico de crianças', true, 617),
('behavioral_assessment_human_social', 'fear_uniforms', 'Medo de uniformes', 'Reação negativa a pessoas uniformizadas', true, 618),

-- SOCIALIZAÇÃO COM ANIMAIS
('behavioral_assessment_animal_social', 'excellent_with_dogs', 'Excelente com cães', 'Interage muito bem com outros cães', true, 620),
('behavioral_assessment_animal_social', 'good_with_dogs', 'Bom com cães', 'Geralmente bem com outros cães', true, 621),
('behavioral_assessment_animal_social', 'selective_with_dogs', 'Seletivo com cães', 'Bom com alguns, não com outros', true, 622),
('behavioral_assessment_animal_social', 'poor_with_dogs', 'Mau com cães', 'Dificuldades com outros cães', true, 623),
('behavioral_assessment_animal_social', 'aggressive_with_dogs', 'Agressivo com cães', 'Demonstra agressividade com cães', true, 624),
('behavioral_assessment_animal_social', 'excellent_with_cats', 'Excelente com gatos', 'Interage muito bem com gatos', true, 625),
('behavioral_assessment_animal_social', 'good_with_cats', 'Bom com gatos', 'Geralmente bem com gatos', true, 626),
('behavioral_assessment_animal_social', 'poor_with_cats', 'Mau com gatos', 'Dificuldades com gatos', true, 627),
('behavioral_assessment_animal_social', 'prey_drive_high', 'Instinto de caça elevado', 'Forte instinto de perseguição', true, 628),

-- REAÇÕES A ESTÍMULOS
('behavioral_assessment_stimuli', 'noise_tolerant', 'Tolerante a ruídos', 'Não se assusta com sons normais', true, 630),
('behavioral_assessment_stimuli', 'noise_sensitive', 'Sensível a ruídos', 'Reage negativamente a sons', true, 631),
('behavioral_assessment_stimuli', 'noise_phobic', 'Fobia a ruídos', 'Pânico extremo com ruídos', true, 632),
('behavioral_assessment_stimuli', 'touch_tolerant', 'Tolerante ao toque', 'Permite manuseamento normal', true, 633),
('behavioral_assessment_stimuli', 'touch_sensitive', 'Sensível ao toque', 'Desconfortável com manuseamento', true, 634),
('behavioral_assessment_stimuli', 'touch_defensive', 'Defensivo ao toque', 'Reage agressivamente ao toque', true, 635),
('behavioral_assessment_stimuli', 'movement_tolerant', 'Tolerante a movimentos', 'Calmo com movimentos rápidos', true, 636),
('behavioral_assessment_stimuli', 'movement_reactive', 'Reativo a movimentos', 'Assusta-se com movimentos súbitos', true, 637);

-- 3. ADICIONAR OPÇÕES PARA PLANO DE CUIDADOS
INSERT INTO intake_config_options_2026_01_09_03_00 (domain, code, name, description, is_active, display_order) VALUES

-- CUIDADOS IMEDIATOS (PRIMEIRAS 24H)
('care_plan_immediate', 'stabilization_vital', 'Estabilização vital', 'Monitorização e suporte de funções vitais', true, 700),
('care_plan_immediate', 'pain_management', 'Gestão da dor', 'Controlo da dor com analgésicos', true, 701),
('care_plan_immediate', 'wound_treatment', 'Tratamento de feridas', 'Limpeza e pensos de feridas', true, 702),
('care_plan_immediate', 'fluid_support', 'Suporte de fluidos', 'Hidratação e correção eletrolítica', true, 703),
('care_plan_immediate', 'nutritional_support', 'Suporte nutricional', 'Alimentação assistida se necessário', true, 704),
('care_plan_immediate', 'isolation_precautions', 'Precauções de isolamento', 'Isolamento por doença ou comportamento', true, 705),
('care_plan_immediate', 'diagnostic_tests', 'Exames diagnósticos', 'Análises, radiografias, ecografias', true, 706),
('care_plan_immediate', 'emergency_surgery', 'Cirurgia de emergência', 'Intervenção cirúrgica urgente', true, 707),

-- CUIDADOS A MÉDIO PRAZO (1-7 DIAS)
('care_plan_medium', 'medical_treatment', 'Tratamento médico', 'Medicação e terapias específicas', true, 710),
('care_plan_medium', 'surgical_procedures', 'Procedimentos cirúrgicos', 'Cirurgias planeadas', true, 711),
('care_plan_medium', 'rehabilitation_physical', 'Reabilitação física', 'Fisioterapia e exercícios', true, 712),
('care_plan_medium', 'behavioral_assessment', 'Avaliação comportamental', 'Testes e observação comportamental', true, 713),
('care_plan_medium', 'socialization_basic', 'Socialização básica', 'Início do trabalho de socialização', true, 714),
('care_plan_medium', 'vaccination_protocol', 'Protocolo vacinal', 'Vacinação conforme necessário', true, 715),
('care_plan_medium', 'parasite_control', 'Controlo de parasitas', 'Desparasitação interna e externa', true, 716),
('care_plan_medium', 'dental_care', 'Cuidados dentários', 'Limpeza e tratamento dentário', true, 717),

-- CUIDADOS A LONGO PRAZO (>7 DIAS)
('care_plan_long', 'chronic_management', 'Gestão de condições crónicas', 'Tratamento de doenças crónicas', true, 720),
('care_plan_long', 'behavioral_modification', 'Modificação comportamental', 'Treino e reabilitação comportamental', true, 721),
('care_plan_long', 'socialization_advanced', 'Socialização avançada', 'Trabalho intensivo de socialização', true, 722),
('care_plan_long', 'adoption_preparation', 'Preparação para adoção', 'Preparar animal para nova família', true, 723),
('care_plan_long', 'foster_placement', 'Colocação em família de acolhimento', 'Preparar para casa de acolhimento', true, 724),
('care_plan_long', 'specialized_care', 'Cuidados especializados', 'Necessidades médicas ou comportamentais especiais', true, 725),
('care_plan_long', 'palliative_care', 'Cuidados paliativos', 'Conforto para animais terminais', true, 726),
('care_plan_long', 'sanctuary_placement', 'Colocação em santuário', 'Para animais não adotáveis', true, 727);

-- 4. CRIAR FUNÇÃO PARA OBTER OPÇÕES DE EXAME FÍSICO
CREATE OR REPLACE FUNCTION get_physical_exam_options()
RETURNS TABLE (
    system_name TEXT,
    code TEXT,
    name TEXT,
    description TEXT,
    display_order INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN ico.domain = 'physical_exam_cardiovascular' THEN 'Sistema Cardiovascular'
            WHEN ico.domain = 'physical_exam_respiratory' THEN 'Sistema Respiratório'
            WHEN ico.domain = 'physical_exam_neurological' THEN 'Sistema Neurológico'
            WHEN ico.domain = 'physical_exam_gastrointestinal' THEN 'Sistema Gastrointestinal'
            WHEN ico.domain = 'physical_exam_musculoskeletal' THEN 'Sistema Musculoesquelético'
            WHEN ico.domain = 'physical_exam_integumentary' THEN 'Sistema Tegumentar'
            ELSE ico.domain
        END as system_name,
        ico.code,
        ico.name,
        ico.description,
        ico.display_order
    FROM intake_config_options_2026_01_09_03_00 ico
    WHERE ico.domain LIKE 'physical_exam_%' 
    AND ico.is_active = true
    ORDER BY ico.domain, ico.display_order, ico.name;
END;
$$;

-- 5. CRIAR FUNÇÃO PARA OBTER OPÇÕES DE AVALIAÇÃO COMPORTAMENTAL
CREATE OR REPLACE FUNCTION get_behavioral_assessment_options()
RETURNS TABLE (
    category_name TEXT,
    code TEXT,
    name TEXT,
    description TEXT,
    display_order INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN ico.domain = 'behavioral_assessment_temperament' THEN 'Temperamento Geral'
            WHEN ico.domain = 'behavioral_assessment_human_social' THEN 'Socialização com Humanos'
            WHEN ico.domain = 'behavioral_assessment_animal_social' THEN 'Socialização com Animais'
            WHEN ico.domain = 'behavioral_assessment_stimuli' THEN 'Reações a Estímulos'
            ELSE ico.domain
        END as category_name,
        ico.code,
        ico.name,
        ico.description,
        ico.display_order
    FROM intake_config_options_2026_01_09_03_00 ico
    WHERE ico.domain LIKE 'behavioral_assessment_%' 
    AND ico.is_active = true
    ORDER BY ico.domain, ico.display_order, ico.name;
END;
$$;

-- 6. CRIAR FUNÇÃO PARA OBTER OPÇÕES DE PLANO DE CUIDADOS
CREATE OR REPLACE FUNCTION get_care_plan_options()
RETURNS TABLE (
    timeframe_name TEXT,
    code TEXT,
    name TEXT,
    description TEXT,
    display_order INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN ico.domain = 'care_plan_immediate' THEN 'Cuidados Imediatos (24h)'
            WHEN ico.domain = 'care_plan_medium' THEN 'Cuidados Médio Prazo (1-7 dias)'
            WHEN ico.domain = 'care_plan_long' THEN 'Cuidados Longo Prazo (>7 dias)'
            ELSE ico.domain
        END as timeframe_name,
        ico.code,
        ico.name,
        ico.description,
        ico.display_order
    FROM intake_config_options_2026_01_09_03_00 ico
    WHERE ico.domain LIKE 'care_plan_%' 
    AND ico.is_active = true
    ORDER BY ico.domain, ico.display_order, ico.name;
END;
$$;

-- 7. COMENTÁRIOS
COMMENT ON FUNCTION get_physical_exam_options IS 'Retorna opções de exame físico organizadas por sistema';
COMMENT ON FUNCTION get_behavioral_assessment_options IS 'Retorna opções de avaliação comportamental organizadas por categoria';
COMMENT ON FUNCTION get_care_plan_options IS 'Retorna opções de plano de cuidados organizadas por prazo';

-- 8. VERIFICAÇÃO FINAL
SELECT 
    CASE 
        WHEN domain LIKE 'physical_exam_%' THEN 'Exame Físico'
        WHEN domain LIKE 'behavioral_assessment_%' THEN 'Avaliação Comportamental'
        WHEN domain LIKE 'care_plan_%' THEN 'Plano de Cuidados'
        ELSE 'Outros'
    END as categoria,
    COUNT(*) as total_options
FROM intake_config_options_2026_01_09_03_00
WHERE domain LIKE 'physical_exam_%' 
   OR domain LIKE 'behavioral_assessment_%' 
   OR domain LIKE 'care_plan_%'
GROUP BY 
    CASE 
        WHEN domain LIKE 'physical_exam_%' THEN 'Exame Físico'
        WHEN domain LIKE 'behavioral_assessment_%' THEN 'Avaliação Comportamental'
        WHEN domain LIKE 'care_plan_%' THEN 'Plano de Cuidados'
        ELSE 'Outros'
    END
ORDER BY categoria;