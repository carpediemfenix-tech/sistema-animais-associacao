-- Expandir opções de admissão com campos detalhados e condicionais
-- Mantém total compatibilidade com sistema existente

-- 1. EXPANDIR SINTOMAS PARA COBRIR TODOS OS CENÁRIOS DE ADMISSÃO
INSERT INTO intake_config_options (domain, code, name, description, active, display_order) VALUES

-- SINTOMAS ESPECÍFICOS DE RESGATE/EMERGÊNCIA
('symptoms', 'trauma_head', 'Traumatismo craniano', 'Lesões na cabeça, possível concussão', true, 100),
('symptoms', 'trauma_spine', 'Traumatismo espinhal', 'Lesões na coluna vertebral', true, 101),
('symptoms', 'fracture_open', 'Fratura exposta', 'Osso quebrado com ferida aberta', true, 102),
('symptoms', 'fracture_closed', 'Fratura fechada', 'Osso quebrado sem ferida externa', true, 103),
('symptoms', 'hemorrhage_severe', 'Hemorragia severa', 'Sangramento abundante e ativo', true, 104),
('symptoms', 'hemorrhage_minor', 'Hemorragia ligeira', 'Sangramento controlável', true, 105),
('symptoms', 'shock_hypovolemic', 'Choque hipovolémico', 'Perda significativa de sangue/fluidos', true, 106),
('symptoms', 'hypothermia', 'Hipotermia', 'Temperatura corporal baixa', true, 107),
('symptoms', 'hyperthermia', 'Hipertermia', 'Temperatura corporal elevada', true, 108),
('symptoms', 'dehydration_severe', 'Desidratação severa', 'Perda crítica de fluidos', true, 109),
('symptoms', 'dehydration_mild', 'Desidratação ligeira', 'Perda moderada de fluidos', true, 110),

-- SINTOMAS RESPIRATÓRIOS ESPECÍFICOS
('symptoms', 'dyspnea_severe', 'Dispneia severa', 'Dificuldade respiratória grave', true, 120),
('symptoms', 'dyspnea_mild', 'Dispneia ligeira', 'Dificuldade respiratória moderada', true, 121),
('symptoms', 'cyanosis', 'Cianose', 'Coloração azulada das mucosas', true, 122),
('symptoms', 'pneumothorax', 'Pneumotórax', 'Ar na cavidade pleural', true, 123),
('symptoms', 'hemothorax', 'Hemotórax', 'Sangue na cavidade pleural', true, 124),

-- SINTOMAS NEUROLÓGICOS
('symptoms', 'seizures', 'Convulsões', 'Atividade convulsiva', true, 130),
('symptoms', 'altered_consciousness', 'Alteração da consciência', 'Letargia, estupor ou coma', true, 131),
('symptoms', 'paralysis_partial', 'Paralisia parcial', 'Perda parcial de movimento', true, 132),
('symptoms', 'paralysis_complete', 'Paralisia completa', 'Perda total de movimento', true, 133),
('symptoms', 'ataxia', 'Ataxia', 'Incoordenação motora', true, 134),

-- SINTOMAS GASTROINTESTINAIS
('symptoms', 'vomiting_blood', 'Vómito com sangue', 'Hematemese', true, 140),
('symptoms', 'diarrhea_bloody', 'Diarreia sanguinolenta', 'Fezes com sangue', true, 141),
('symptoms', 'abdominal_distension', 'Distensão abdominal', 'Abdómen aumentado de volume', true, 142),
('symptoms', 'intestinal_obstruction', 'Obstrução intestinal', 'Bloqueio do trânsito intestinal', true, 143),

-- SINTOMAS COMPORTAMENTAIS ESPECÍFICOS
('symptoms', 'aggression_fear', 'Agressividade por medo', 'Comportamento defensivo agressivo', true, 150),
('symptoms', 'aggression_pain', 'Agressividade por dor', 'Agressão devido a dor', true, 151),
('symptoms', 'withdrawal_extreme', 'Retraimento extremo', 'Isolamento social severo', true, 152),
('symptoms', 'panic_attacks', 'Ataques de pânico', 'Episódios de pânico intenso', true, 153),
('symptoms', 'stereotypies', 'Estereotipias', 'Comportamentos repetitivos', true, 154),

-- SINTOMAS DE ABANDONO/NEGLIGÊNCIA
('symptoms', 'malnutrition_severe', 'Desnutrição severa', 'Estado nutricional crítico', true, 160),
('symptoms', 'malnutrition_moderate', 'Desnutrição moderada', 'Estado nutricional comprometido', true, 161),
('symptoms', 'parasites_external', 'Parasitas externos', 'Pulgas, carraças, ácaros', true, 162),
('symptoms', 'parasites_internal', 'Parasitas internos', 'Vermes intestinais', true, 163),
('symptoms', 'skin_infections', 'Infeções cutâneas', 'Dermatites, feridas infetadas', true, 164),
('symptoms', 'dental_disease', 'Doença dentária', 'Problemas dentários/gengivais', true, 165),

-- SINTOMAS ESPECÍFICOS POR ESPÉCIE
('symptoms', 'feline_uri', 'Infeção respiratória felina', 'Sintomas de gripe felina', true, 170),
('symptoms', 'canine_parvo', 'Suspeita de parvovirose', 'Sintomas compatíveis com parvo', true, 171),
('symptoms', 'canine_distemper', 'Suspeita de esgana', 'Sintomas compatíveis com esgana', true, 172);

-- 2. EXPANDIR AÇÕES IMEDIATAS PARA COBRIR EMERGÊNCIAS E RESGATES
INSERT INTO intake_config_options (domain, code, name, description, active, display_order) VALUES

-- AÇÕES DE ESTABILIZAÇÃO VITAL
('immediate_actions', 'airway_clearance', 'Desobstrução das vias aéreas', 'Remoção de obstruções respiratórias', true, 200),
('immediate_actions', 'oxygen_therapy', 'Oxigenoterapia', 'Administração de oxigénio suplementar', true, 201),
('immediate_actions', 'iv_access', 'Acesso venoso', 'Cateterização venosa para fluidos/medicação', true, 202),
('immediate_actions', 'fluid_therapy', 'Fluidoterapia', 'Administração de fluidos intravenosos', true, 203),
('immediate_actions', 'blood_transfusion', 'Transfusão sanguínea', 'Administração de sangue ou plasma', true, 204),

-- AÇÕES DE CONTROLO DE HEMORRAGIA
('immediate_actions', 'pressure_bandage', 'Penso compressivo', 'Controlo de hemorragia por pressão', true, 210),
('immediate_actions', 'tourniquet', 'Garrote', 'Controlo de hemorragia severa em membros', true, 211),
('immediate_actions', 'hemostatic_agents', 'Agentes hemostáticos', 'Aplicação de produtos para coagulação', true, 212),

-- AÇÕES DE IMOBILIZAÇÃO
('immediate_actions', 'spinal_immobilization', 'Imobilização espinhal', 'Estabilização da coluna vertebral', true, 220),
('immediate_actions', 'limb_splinting', 'Imobilização de membro', 'Tala ou imobilização de fratura', true, 221),
('immediate_actions', 'cervical_collar', 'Colar cervical', 'Imobilização do pescoço', true, 222),

-- AÇÕES DE CONTROLO DE DOR
('immediate_actions', 'analgesics_mild', 'Analgésicos ligeiros', 'Medicação para dor moderada', true, 230),
('immediate_actions', 'analgesics_strong', 'Analgésicos potentes', 'Medicação para dor severa', true, 231),
('immediate_actions', 'local_anesthesia', 'Anestesia local', 'Bloqueio da dor localizada', true, 232),

-- AÇÕES DE CONTROLO DE TEMPERATURA
('immediate_actions', 'warming_active', 'Aquecimento ativo', 'Mantas térmicas, fluidos aquecidos', true, 240),
('immediate_actions', 'cooling_active', 'Arrefecimento ativo', 'Redução da temperatura corporal', true, 241),
('immediate_actions', 'temperature_monitoring', 'Monitorização térmica', 'Controlo contínuo da temperatura', true, 242),

-- AÇÕES DE CONTENÇÃO E SEGURANÇA
('immediate_actions', 'physical_restraint', 'Contenção física', 'Imobilização para segurança', true, 250),
('immediate_actions', 'chemical_restraint', 'Contenção química', 'Sedação para manuseamento', true, 251),
('immediate_actions', 'muzzle_application', 'Aplicação de açaime', 'Proteção contra mordeduras', true, 252),
('immediate_actions', 'isolation_infectious', 'Isolamento infeciosos', 'Quarentena por suspeita de doença', true, 253),
('immediate_actions', 'isolation_behavioral', 'Isolamento comportamental', 'Separação por agressividade', true, 254),

-- AÇÕES DE LIMPEZA E DESINFEÇÃO
('immediate_actions', 'wound_cleaning', 'Limpeza de feridas', 'Desinfeção e limpeza de lesões', true, 260),
('immediate_actions', 'parasite_treatment', 'Tratamento de parasitas', 'Remoção/tratamento de parasitas externos', true, 261),
('immediate_actions', 'bath_therapeutic', 'Banho terapêutico', 'Limpeza com produtos medicinais', true, 262),

-- AÇÕES DE SUPORTE NUTRICIONAL
('immediate_actions', 'feeding_assisted', 'Alimentação assistida', 'Suporte nutricional direto', true, 270),
('immediate_actions', 'tube_feeding', 'Alimentação por sonda', 'Nutrição entérica por tubo', true, 271),
('immediate_actions', 'electrolyte_correction', 'Correção eletrolítica', 'Reposição de eletrólitos', true, 272),

-- AÇÕES DE EMERGÊNCIA ESPECÍFICAS
('immediate_actions', 'cpr', 'Reanimação cardiopulmonar', 'Manobras de ressuscitação', true, 280),
('immediate_actions', 'defibrillation', 'Desfibrilhação', 'Choque elétrico para arritmias', true, 281),
('immediate_actions', 'emergency_surgery', 'Cirurgia de emergência', 'Intervenção cirúrgica imediata', true, 282),
('immediate_actions', 'chest_tube', 'Drenagem torácica', 'Tubo de tórax para pneumo/hemotórax', true, 283),

-- AÇÕES DE DOCUMENTAÇÃO E COMUNICAÇÃO
('immediate_actions', 'photo_documentation', 'Documentação fotográfica', 'Registo visual das lesões', true, 290),
('immediate_actions', 'video_documentation', 'Documentação em vídeo', 'Registo de comportamento/sintomas', true, 291),
('immediate_actions', 'emergency_contact', 'Contacto de emergência', 'Comunicação com veterinário/especialista', true, 292),
('immediate_actions', 'police_report', 'Comunicação às autoridades', 'Registo policial se necessário', true, 293);

-- 3. EXPANDIR ORIGENS DE ADMISSÃO COM MAIS DETALHES
INSERT INTO intake_config_options (domain, code, name, description, active, display_order) VALUES
('intake_origin', 'owner_surrender_financial', 'Entrega por dificuldades financeiras', 'Proprietário não consegue suportar custos', true, 300),
('intake_origin', 'owner_surrender_behavioral', 'Entrega por problemas comportamentais', 'Animal com comportamentos problemáticos', true, 301),
('intake_origin', 'owner_surrender_medical', 'Entrega por problemas médicos', 'Animal com necessidades médicas complexas', true, 302),
('intake_origin', 'owner_surrender_housing', 'Entrega por mudança habitacional', 'Novo alojamento não permite animais', true, 303),
('intake_origin', 'owner_surrender_allergies', 'Entrega por alergias', 'Desenvolvimento de alergias na família', true, 304),
('intake_origin', 'stray_injured', 'Encontrado ferido na rua', 'Animal errante com lesões visíveis', true, 310),
('intake_origin', 'stray_sick', 'Encontrado doente na rua', 'Animal errante com sinais de doença', true, 311),
('intake_origin', 'stray_healthy', 'Encontrado saudável na rua', 'Animal errante sem problemas aparentes', true, 312),
('intake_origin', 'rescue_accident', 'Resgate de acidente', 'Animal vítima de acidente rodoviário/outro', true, 320),
('intake_origin', 'rescue_abuse', 'Resgate de maus-tratos', 'Animal retirado de situação de abuso', true, 321),
('intake_origin', 'rescue_neglect', 'Resgate de negligência', 'Animal em situação de abandono/negligência', true, 322),
('intake_origin', 'rescue_hoarding', 'Resgate de acumulação', 'Animal de casa com acumulação compulsiva', true, 323),
('intake_origin', 'transfer_overcrowding', 'Transferência por sobrelotação', 'Vem de instituição com excesso de animais', true, 330),
('intake_origin', 'transfer_specialization', 'Transferência para especialização', 'Necessita cuidados especializados', true, 331),
('intake_origin', 'transfer_behavioral', 'Transferência comportamental', 'Necessita treino/reabilitação específica', true, 332),
('intake_origin', 'birth_onsite', 'Nascimento no local', 'Nasceu na instituição', true, 340),
('intake_origin', 'birth_foster', 'Nascimento em casa de acolhimento', 'Nasceu em família de acolhimento', true, 341);

-- 4. EXPANDIR RAZÕES DE ADMISSÃO COM MAIS ESPECIFICIDADE
INSERT INTO intake_config_options (domain, code, name, description, active, display_order) VALUES
('intake_reason', 'emergency_trauma_vehicle', 'Emergência - Atropelamento', 'Trauma por veículo motorizado', true, 400),
('intake_reason', 'emergency_trauma_fall', 'Emergência - Queda', 'Trauma por queda de altura', true, 401),
('intake_reason', 'emergency_trauma_attack', 'Emergência - Ataque de animal', 'Lesões por ataque de outro animal', true, 402),
('intake_reason', 'emergency_poisoning', 'Emergência - Intoxicação', 'Suspeita de envenenamento', true, 403),
('intake_reason', 'emergency_heatstroke', 'Emergência - Golpe de calor', 'Hipertermia severa', true, 404),
('intake_reason', 'emergency_drowning', 'Emergência - Quase afogamento', 'Asfixia por submersão', true, 405),
('intake_reason', 'medical_infectious', 'Médico - Doença infeciosa', 'Suspeita de doença contagiosa', true, 410),
('intake_reason', 'medical_chronic', 'Médico - Doença crónica', 'Condição médica de longo prazo', true, 411),
('intake_reason', 'medical_surgical', 'Médico - Necessidade cirúrgica', 'Requer intervenção cirúrgica', true, 412),
('intake_reason', 'behavioral_aggression_humans', 'Comportamental - Agressão a humanos', 'Historial de ataques a pessoas', true, 420),
('intake_reason', 'behavioral_aggression_animals', 'Comportamental - Agressão a animais', 'Conflitos com outros animais', true, 421),
('intake_reason', 'behavioral_destruction', 'Comportamental - Comportamento destrutivo', 'Destrói objetos/propriedade', true, 422),
('intake_reason', 'behavioral_separation', 'Comportamental - Ansiedade de separação', 'Problemas quando fica sozinho', true, 423),
('intake_reason', 'behavioral_phobias', 'Comportamental - Fobias severas', 'Medos extremos e incapacitantes', true, 424),
('intake_reason', 'abandonment_tied', 'Abandono - Amarrado', 'Encontrado amarrado e abandonado', true, 430),
('intake_reason', 'abandonment_box', 'Abandono - Em caixa/saco', 'Abandonado em recipiente', true, 431),
('intake_reason', 'abandonment_property', 'Abandono - Em propriedade', 'Deixado em casa/terreno abandonado', true, 432),
('intake_reason', 'neglect_medical', 'Negligência - Médica', 'Falta de cuidados médicos necessários', true, 440),
('intake_reason', 'neglect_nutritional', 'Negligência - Nutricional', 'Desnutrição por falta de alimentação', true, 441),
('intake_reason', 'neglect_shelter', 'Negligência - Abrigo inadequado', 'Condições de alojamento impróprias', true, 442),
('intake_reason', 'legal_seizure', 'Apreensão legal', 'Retirado por ordem judicial/autoridades', true, 450),
('intake_reason', 'owner_death', 'Morte do proprietário', 'Proprietário faleceu sem provisões', true, 451),
('intake_reason', 'owner_hospitalization', 'Hospitalização do proprietário', 'Proprietário internado sem suporte', true, 452);

-- 5. CRIAR FUNÇÃO PARA OBTER OPÇÕES CONDICIONAIS
CREATE OR REPLACE FUNCTION get_conditional_intake_options(
    origin_code TEXT DEFAULT NULL,
    reason_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    domain TEXT,
    code TEXT,
    name TEXT,
    description TEXT,
    is_conditional BOOLEAN,
    applies_to TEXT[]
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ico.domain,
        ico.code,
        ico.name,
        ico.description,
        CASE 
            WHEN ico.code LIKE '%trauma%' OR ico.code LIKE '%hemorrhage%' OR ico.code LIKE '%fracture%' THEN true
            WHEN ico.code LIKE '%rescue%' OR ico.code LIKE '%emergency%' THEN true
            ELSE false
        END as is_conditional,
        CASE 
            WHEN ico.code LIKE '%trauma%' OR ico.code LIKE '%hemorrhage%' THEN ARRAY['rescue_accident', 'emergency_trauma_vehicle', 'emergency_trauma_fall', 'emergency_trauma_attack']
            WHEN ico.code LIKE '%behavioral%' THEN ARRAY['behavioral_aggression_humans', 'behavioral_aggression_animals', 'behavioral_destruction']
            WHEN ico.code LIKE '%neglect%' OR ico.code LIKE '%malnutrition%' THEN ARRAY['neglect_medical', 'neglect_nutritional', 'abandonment_tied']
            ELSE ARRAY[]::TEXT[]
        END as applies_to
    FROM intake_config_options ico
    WHERE ico.active = true
    AND (origin_code IS NULL OR ico.code = ANY(
        CASE origin_code
            WHEN 'rescue_accident' THEN ARRAY['trauma_head', 'trauma_spine', 'fracture_open', 'fracture_closed', 'hemorrhage_severe', 'shock_hypovolemic']
            WHEN 'rescue_abuse' THEN ARRAY['malnutrition_severe', 'withdrawal_extreme', 'aggression_fear']
            WHEN 'stray_injured' THEN ARRAY['parasites_external', 'malnutrition_moderate', 'skin_infections', 'dehydration_mild']
            ELSE ARRAY[]::TEXT[]
        END
    ))
    ORDER BY ico.display_order, ico.name;
END;
$$;

-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
COMMENT ON FUNCTION get_conditional_intake_options IS 'Retorna opções de admissão condicionais baseadas na origem e razão selecionadas';

-- Verificar se as inserções foram bem-sucedidas
SELECT 
    domain,
    COUNT(*) as total_options,
    COUNT(CASE WHEN active THEN 1 END) as active_options
FROM intake_config_options 
WHERE domain IN ('symptoms', 'immediate_actions', 'intake_origin', 'intake_reason')
GROUP BY domain
ORDER BY domain;