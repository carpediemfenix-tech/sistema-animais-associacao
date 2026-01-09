-- Criar tabela de opções expandidas para ficha de admissão
-- Mantém total compatibilidade com sistema existente

-- 1. CRIAR TABELA DE OPÇÕES DE CONFIGURAÇÃO DE ADMISSÃO (se não existir)
CREATE TABLE IF NOT EXISTS intake_config_options_2026_01_09_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain TEXT NOT NULL, -- 'symptoms', 'immediate_actions', 'intake_origin', 'intake_reason', etc.
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain, code)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_intake_config_domain_2026 ON intake_config_options_2026_01_09_03_00(domain);
CREATE INDEX IF NOT EXISTS idx_intake_config_active_2026 ON intake_config_options_2026_01_09_03_00(is_active);
CREATE INDEX IF NOT EXISTS idx_intake_config_order_2026 ON intake_config_options_2026_01_09_03_00(display_order);

-- 3. INSERIR OPÇÕES EXPANDIDAS
INSERT INTO intake_config_options_2026_01_09_03_00 (domain, code, name, description, is_active, display_order) VALUES

-- ORIGENS EXPANDIDAS
('intake_origin', 'owner_surrender', 'Entrega pelo proprietário', 'Animal entregue voluntariamente pelo dono', true, 1),
('intake_origin', 'owner_surrender_financial', 'Entrega por dificuldades financeiras', 'Proprietário não consegue suportar custos', true, 2),
('intake_origin', 'owner_surrender_behavioral', 'Entrega por problemas comportamentais', 'Animal com comportamentos problemáticos', true, 3),
('intake_origin', 'owner_surrender_medical', 'Entrega por problemas médicos', 'Animal com necessidades médicas complexas', true, 4),
('intake_origin', 'owner_surrender_housing', 'Entrega por mudança habitacional', 'Novo alojamento não permite animais', true, 5),
('intake_origin', 'stray', 'Encontrado na rua', 'Animal encontrado errante', true, 10),
('intake_origin', 'stray_injured', 'Encontrado ferido na rua', 'Animal errante com lesões visíveis', true, 11),
('intake_origin', 'stray_sick', 'Encontrado doente na rua', 'Animal errante com sinais de doença', true, 12),
('intake_origin', 'stray_healthy', 'Encontrado saudável na rua', 'Animal errante sem problemas aparentes', true, 13),
('intake_origin', 'rescue', 'Resgate', 'Animal resgatado de situação de perigo', true, 20),
('intake_origin', 'rescue_accident', 'Resgate de acidente', 'Animal vítima de acidente rodoviário/outro', true, 21),
('intake_origin', 'rescue_abuse', 'Resgate de maus-tratos', 'Animal retirado de situação de abuso', true, 22),
('intake_origin', 'rescue_neglect', 'Resgate de negligência', 'Animal em situação de abandono/negligência', true, 23),
('intake_origin', 'transfer', 'Transferência', 'Transferido de outra instituição', true, 30),
('intake_origin', 'transfer_overcrowding', 'Transferência por sobrelotação', 'Vem de instituição com excesso de animais', true, 31),
('intake_origin', 'transfer_specialization', 'Transferência para especialização', 'Necessita cuidados especializados', true, 32),
('intake_origin', 'birth', 'Nascimento', 'Nasceu na instituição', true, 40),
('intake_origin', 'birth_onsite', 'Nascimento no local', 'Nasceu na instituição', true, 41),
('intake_origin', 'birth_foster', 'Nascimento em casa de acolhimento', 'Nasceu em família de acolhimento', true, 42),

-- RAZÕES EXPANDIDAS
('intake_reason', 'emergency', 'Emergência médica', 'Necessita cuidados médicos urgentes', true, 100),
('intake_reason', 'emergency_trauma_vehicle', 'Emergência - Atropelamento', 'Trauma por veículo motorizado', true, 101),
('intake_reason', 'emergency_trauma_fall', 'Emergência - Queda', 'Trauma por queda de altura', true, 102),
('intake_reason', 'emergency_trauma_attack', 'Emergência - Ataque de animal', 'Lesões por ataque de outro animal', true, 103),
('intake_reason', 'emergency_poisoning', 'Emergência - Intoxicação', 'Suspeita de envenenamento', true, 104),
('intake_reason', 'emergency_heatstroke', 'Emergência - Golpe de calor', 'Hipertermia severa', true, 105),
('intake_reason', 'medical_infectious', 'Médico - Doença infeciosa', 'Suspeita de doença contagiosa', true, 110),
('intake_reason', 'medical_chronic', 'Médico - Doença crónica', 'Condição médica de longo prazo', true, 111),
('intake_reason', 'medical_surgical', 'Médico - Necessidade cirúrgica', 'Requer intervenção cirúrgica', true, 112),
('intake_reason', 'behavioral', 'Problemas comportamentais', 'Questões de comportamento', true, 120),
('intake_reason', 'behavioral_aggression_humans', 'Comportamental - Agressão a humanos', 'Historial de ataques a pessoas', true, 121),
('intake_reason', 'behavioral_aggression_animals', 'Comportamental - Agressão a animais', 'Conflitos com outros animais', true, 122),
('intake_reason', 'behavioral_destruction', 'Comportamental - Comportamento destrutivo', 'Destrói objetos/propriedade', true, 123),
('intake_reason', 'behavioral_separation', 'Comportamental - Ansiedade de separação', 'Problemas quando fica sozinho', true, 124),
('intake_reason', 'abandonment', 'Abandono', 'Animal abandonado', true, 130),
('intake_reason', 'abandonment_tied', 'Abandono - Amarrado', 'Encontrado amarrado e abandonado', true, 131),
('intake_reason', 'abandonment_box', 'Abandono - Em caixa/saco', 'Abandonado em recipiente', true, 132),
('intake_reason', 'neglect', 'Negligência', 'Cuidados inadequados', true, 140),
('intake_reason', 'neglect_medical', 'Negligência - Médica', 'Falta de cuidados médicos necessários', true, 141),
('intake_reason', 'neglect_nutritional', 'Negligência - Nutricional', 'Desnutrição por falta de alimentação', true, 142),
('intake_reason', 'legal_seizure', 'Apreensão legal', 'Retirado por ordem judicial/autoridades', true, 150),
('intake_reason', 'owner_death', 'Morte do proprietário', 'Proprietário faleceu sem provisões', true, 151),

-- SINTOMAS EXPANDIDOS
('symptoms', 'lethargy', 'Letargia', 'Falta de energia, apatia', true, 200),
('symptoms', 'vomiting', 'Vómitos', 'Episódios de vómito', true, 201),
('symptoms', 'vomiting_blood', 'Vómito com sangue', 'Hematemese', true, 202),
('symptoms', 'diarrhea', 'Diarreia', 'Fezes líquidas ou pastosas', true, 203),
('symptoms', 'diarrhea_bloody', 'Diarreia sanguinolenta', 'Fezes com sangue', true, 204),
('symptoms', 'coughing', 'Tosse', 'Tosse persistente', true, 205),
('symptoms', 'difficulty_breathing', 'Dificuldade respiratória', 'Respiração laboriosa', true, 206),
('symptoms', 'dyspnea_severe', 'Dispneia severa', 'Dificuldade respiratória grave', true, 207),
('symptoms', 'cyanosis', 'Cianose', 'Coloração azulada das mucosas', true, 208),
('symptoms', 'limping', 'Claudicação', 'Dificuldade em caminhar', true, 209),
('symptoms', 'paralysis_partial', 'Paralisia parcial', 'Perda parcial de movimento', true, 210),
('symptoms', 'paralysis_complete', 'Paralisia completa', 'Perda total de movimento', true, 211),
('symptoms', 'wounds', 'Feridas', 'Lesões cutâneas visíveis', true, 212),
('symptoms', 'fracture_open', 'Fratura exposta', 'Osso quebrado com ferida aberta', true, 213),
('symptoms', 'fracture_closed', 'Fratura fechada', 'Osso quebrado sem ferida externa', true, 214),
('symptoms', 'hemorrhage_severe', 'Hemorragia severa', 'Sangramento abundante e ativo', true, 215),
('symptoms', 'hemorrhage_minor', 'Hemorragia ligeira', 'Sangramento controlável', true, 216),
('symptoms', 'trauma_head', 'Traumatismo craniano', 'Lesões na cabeça, possível concussão', true, 217),
('symptoms', 'trauma_spine', 'Traumatismo espinhal', 'Lesões na coluna vertebral', true, 218),
('symptoms', 'shock_hypovolemic', 'Choque hipovolémico', 'Perda significativa de sangue/fluidos', true, 219),
('symptoms', 'hypothermia', 'Hipotermia', 'Temperatura corporal baixa', true, 220),
('symptoms', 'hyperthermia', 'Hipertermia', 'Temperatura corporal elevada', true, 221),
('symptoms', 'dehydration_severe', 'Desidratação severa', 'Perda crítica de fluidos', true, 222),
('symptoms', 'dehydration_mild', 'Desidratação ligeira', 'Perda moderada de fluidos', true, 223),
('symptoms', 'malnutrition_severe', 'Desnutrição severa', 'Estado nutricional crítico', true, 224),
('symptoms', 'malnutrition_moderate', 'Desnutrição moderada', 'Estado nutricional comprometido', true, 225),
('symptoms', 'parasites_external', 'Parasitas externos', 'Pulgas, carraças, ácaros', true, 226),
('symptoms', 'parasites_internal', 'Parasitas internos', 'Vermes intestinais', true, 227),
('symptoms', 'skin_infections', 'Infeções cutâneas', 'Dermatites, feridas infetadas', true, 228),
('symptoms', 'dental_disease', 'Doença dentária', 'Problemas dentários/gengivais', true, 229),
('symptoms', 'discharge_eyes', 'Secreção ocular', 'Corrimento dos olhos', true, 230),
('symptoms', 'discharge_nose', 'Secreção nasal', 'Corrimento do nariz', true, 231),
('symptoms', 'loss_appetite', 'Perda de apetite', 'Recusa alimentar', true, 232),
('symptoms', 'seizures', 'Convulsões', 'Atividade convulsiva', true, 233),
('symptoms', 'altered_consciousness', 'Alteração da consciência', 'Letargia, estupor ou coma', true, 234),
('symptoms', 'aggression_fear', 'Agressividade por medo', 'Comportamento defensivo agressivo', true, 235),
('symptoms', 'aggression_pain', 'Agressividade por dor', 'Agressão devido a dor', true, 236),
('symptoms', 'withdrawal_extreme', 'Retraimento extremo', 'Isolamento social severo', true, 237),
('symptoms', 'panic_attacks', 'Ataques de pânico', 'Episódios de pânico intenso', true, 238),
('symptoms', 'feline_uri', 'Infeção respiratória felina', 'Sintomas de gripe felina', true, 239),
('symptoms', 'canine_parvo', 'Suspeita de parvovirose', 'Sintomas compatíveis com parvo', true, 240),

-- AÇÕES IMEDIATAS EXPANDIDAS
('immediate_actions', 'veterinary_exam', 'Exame veterinário', 'Avaliação médica completa', true, 300),
('immediate_actions', 'airway_clearance', 'Desobstrução das vias aéreas', 'Remoção de obstruções respiratórias', true, 301),
('immediate_actions', 'oxygen_therapy', 'Oxigenoterapia', 'Administração de oxigénio suplementar', true, 302),
('immediate_actions', 'iv_access', 'Acesso venoso', 'Cateterização venosa para fluidos/medicação', true, 303),
('immediate_actions', 'fluid_therapy', 'Fluidoterapia', 'Administração de fluidos intravenosos', true, 304),
('immediate_actions', 'blood_transfusion', 'Transfusão sanguínea', 'Administração de sangue ou plasma', true, 305),
('immediate_actions', 'pressure_bandage', 'Penso compressivo', 'Controlo de hemorragia por pressão', true, 306),
('immediate_actions', 'tourniquet', 'Garrote', 'Controlo de hemorragia severa em membros', true, 307),
('immediate_actions', 'spinal_immobilization', 'Imobilização espinhal', 'Estabilização da coluna vertebral', true, 308),
('immediate_actions', 'limb_splinting', 'Imobilização de membro', 'Tala ou imobilização de fratura', true, 309),
('immediate_actions', 'pain_relief', 'Alívio da dor', 'Administração de analgésicos', true, 310),
('immediate_actions', 'analgesics_mild', 'Analgésicos ligeiros', 'Medicação para dor moderada', true, 311),
('immediate_actions', 'analgesics_strong', 'Analgésicos potentes', 'Medicação para dor severa', true, 312),
('immediate_actions', 'warming_active', 'Aquecimento ativo', 'Mantas térmicas, fluidos aquecidos', true, 313),
('immediate_actions', 'cooling_active', 'Arrefecimento ativo', 'Redução da temperatura corporal', true, 314),
('immediate_actions', 'physical_restraint', 'Contenção física', 'Imobilização para segurança', true, 315),
('immediate_actions', 'chemical_restraint', 'Contenção química', 'Sedação para manuseamento', true, 316),
('immediate_actions', 'wound_care', 'Cuidados com feridas', 'Limpeza e tratamento de lesões', true, 317),
('immediate_actions', 'wound_cleaning', 'Limpeza de feridas', 'Desinfeção e limpeza de lesões', true, 318),
('immediate_actions', 'parasite_treatment', 'Tratamento de parasitas', 'Remoção/tratamento de parasitas externos', true, 319),
('immediate_actions', 'isolation', 'Isolamento', 'Separação por precaução', true, 320),
('immediate_actions', 'isolation_infectious', 'Isolamento infeciosos', 'Quarentena por suspeita de doença', true, 321),
('immediate_actions', 'isolation_behavioral', 'Isolamento comportamental', 'Separação por agressividade', true, 322),
('immediate_actions', 'feeding', 'Alimentação', 'Fornecimento de alimento adequado', true, 323),
('immediate_actions', 'feeding_assisted', 'Alimentação assistida', 'Suporte nutricional direto', true, 324),
('immediate_actions', 'tube_feeding', 'Alimentação por sonda', 'Nutrição entérica por tubo', true, 325),
('immediate_actions', 'hydration', 'Hidratação', 'Fornecimento de água/fluidos', true, 326),
('immediate_actions', 'vaccination', 'Vacinação', 'Administração de vacinas', true, 327),
('immediate_actions', 'deworming', 'Desparasitação', 'Tratamento antiparasitário', true, 328),
('immediate_actions', 'identification', 'Identificação', 'Colocação de chip/coleira', true, 329),
('immediate_actions', 'documentation', 'Documentação', 'Registo fotográfico/médico', true, 330),
('immediate_actions', 'photo_documentation', 'Documentação fotográfica', 'Registo visual das lesões', true, 331),
('immediate_actions', 'emergency_contact', 'Contacto de emergência', 'Comunicação com veterinário/especialista', true, 332),
('immediate_actions', 'police_report', 'Comunicação às autoridades', 'Registo policial se necessário', true, 333),
('immediate_actions', 'cpr', 'Reanimação cardiopulmonar', 'Manobras de ressuscitação', true, 334),
('immediate_actions', 'emergency_surgery', 'Cirurgia de emergência', 'Intervenção cirúrgica imediata', true, 335);

-- 4. CRIAR FUNÇÃO RPC PARA OBTER OPÇÕES EXPANDIDAS
CREATE OR REPLACE FUNCTION get_expanded_intake_options()
RETURNS TABLE (
    domain TEXT,
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
        ico.domain,
        ico.code,
        ico.name,
        ico.description,
        ico.display_order
    FROM intake_config_options_2026_01_09_03_00 ico
    WHERE ico.is_active = true
    ORDER BY ico.domain, ico.display_order, ico.name;
END;
$$;

-- 5. CRIAR FUNÇÃO PARA OPÇÕES CONDICIONAIS
CREATE OR REPLACE FUNCTION get_conditional_intake_options_2026(
    origin_code TEXT DEFAULT NULL,
    reason_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    domain TEXT,
    code TEXT,
    name TEXT,
    description TEXT,
    is_relevant BOOLEAN
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
            -- Sintomas relevantes para resgates de acidente
            WHEN origin_code = 'rescue_accident' AND ico.domain = 'symptoms' AND 
                 ico.code IN ('trauma_head', 'trauma_spine', 'fracture_open', 'fracture_closed', 'hemorrhage_severe', 'shock_hypovolemic') THEN true
            -- Sintomas relevantes para abandono/negligência
            WHEN origin_code IN ('rescue_neglect', 'abandonment') AND ico.domain = 'symptoms' AND 
                 ico.code IN ('malnutrition_severe', 'malnutrition_moderate', 'parasites_external', 'skin_infections', 'dehydration_mild') THEN true
            -- Ações relevantes para emergências
            WHEN reason_code LIKE 'emergency_%' AND ico.domain = 'immediate_actions' AND 
                 ico.code IN ('airway_clearance', 'oxygen_therapy', 'iv_access', 'fluid_therapy', 'pressure_bandage', 'spinal_immobilization') THEN true
            -- Ações relevantes para problemas comportamentais
            WHEN reason_code LIKE 'behavioral_%' AND ico.domain = 'immediate_actions' AND 
                 ico.code IN ('physical_restraint', 'chemical_restraint', 'isolation_behavioral') THEN true
            ELSE false
        END as is_relevant
    FROM intake_config_options_2026_01_09_03_00 ico
    WHERE ico.is_active = true
    ORDER BY ico.domain, ico.display_order, ico.name;
END;
$$;

-- 6. COMENTÁRIOS
COMMENT ON TABLE intake_config_options_2026_01_09_03_00 IS 'Opções expandidas de configuração para fichas de admissão';
COMMENT ON FUNCTION get_expanded_intake_options IS 'Retorna todas as opções expandidas para fichas de admissão';
COMMENT ON FUNCTION get_conditional_intake_options_2026 IS 'Retorna opções condicionais baseadas na origem e razão selecionadas';

-- 7. VERIFICAÇÃO FINAL
SELECT 
    domain,
    COUNT(*) as total_options
FROM intake_config_options_2026_01_09_03_00
WHERE is_active = true
GROUP BY domain
ORDER BY domain;