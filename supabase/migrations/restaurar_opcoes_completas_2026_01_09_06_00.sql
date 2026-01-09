-- EXPANDIR FUNÇÃO COM TODAS AS OPÇÕES SOLICITADAS
-- Mantendo estrutura simples da BD mas com todas as opções pedidas

-- Substituir função com todas as opções expandidas
CREATE OR REPLACE FUNCTION get_intake_options_simple()
RETURNS TABLE (
    domain text,
    code text,
    name text,
    description text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    -- TODAS AS OPÇÕES SOLICITADAS PELO USUÁRIO
    SELECT * FROM (
        VALUES 
        -- Condição geral (5 opções)
        ('general_condition', 'excellent', 'Excelente', 'Animal em excelente estado geral'),
        ('general_condition', 'good', 'Bom', 'Animal em bom estado geral'),
        ('general_condition', 'fair', 'Razoável', 'Animal em estado razoável'),
        ('general_condition', 'poor', 'Mau', 'Animal em mau estado'),
        ('general_condition', 'critical', 'Crítico', 'Animal em estado crítico'),
        
        -- Comportamento (5 opções)
        ('behavior', 'friendly', 'Amigável', 'Animal amigável e sociável'),
        ('behavior', 'shy', 'Tímido', 'Animal tímido mas não agressivo'),
        ('behavior', 'fearful', 'Medroso', 'Animal com medo'),
        ('behavior', 'aggressive', 'Agressivo', 'Animal com comportamento agressivo'),
        ('behavior', 'lethargic', 'Letárgico', 'Animal apático ou letárgico'),
        
        -- Condição corporal (5 opções)
        ('body_condition', 'obese', 'Obeso (5/5)', 'Condição corporal 5/5 - Obeso'),
        ('body_condition', 'overweight', 'Acima do peso (4/5)', 'Condição corporal 4/5 - Acima do peso'),
        ('body_condition', 'ideal', 'Ideal (3/5)', 'Condição corporal 3/5 - Peso ideal'),
        ('body_condition', 'underweight', 'Abaixo do peso (2/5)', 'Condição corporal 2/5 - Abaixo do peso'),
        ('body_condition', 'emaciated', 'Emaciado (1/5)', 'Condição corporal 1/5 - Emaciado'),
        
        -- Origem (5 opções)
        ('intake_origin', 'owner_surrender', 'Entrega pelo proprietário', 'Animal entregue pelo proprietário'),
        ('intake_origin', 'stray_found', 'Encontrado na rua', 'Animal encontrado abandonado'),
        ('intake_origin', 'rescue_operation', 'Operação de resgate', 'Animal resgatado em operação'),
        ('intake_origin', 'transfer', 'Transferência', 'Animal transferido de outra instituição'),
        ('intake_origin', 'birth', 'Nascimento', 'Animal nascido na instituição'),
        
        -- Razão (5 opções)
        ('intake_reason', 'abandonment', 'Abandono', 'Animal abandonado'),
        ('intake_reason', 'owner_unable', 'Proprietário incapaz', 'Proprietário não consegue cuidar'),
        ('intake_reason', 'behavioral_issues', 'Problemas comportamentais', 'Problemas de comportamento'),
        ('intake_reason', 'medical_issues', 'Problemas médicos', 'Problemas de saúde'),
        ('intake_reason', 'overpopulation', 'Sobrepopulação', 'Controlo de população'),
        
        -- SINTOMAS COMPLETOS (60+ opções como solicitado)
        -- Sintomas gerais
        ('symptoms', 'lethargy', 'Letargia', 'Animal apático ou sem energia'),
        ('symptoms', 'weakness', 'Fraqueza', 'Animal fraco ou debilitado'),
        ('symptoms', 'dehydration', 'Desidratação', 'Sinais de desidratação'),
        ('symptoms', 'fever', 'Febre', 'Temperatura corporal elevada'),
        ('symptoms', 'hypothermia', 'Hipotermia', 'Temperatura corporal baixa'),
        ('symptoms', 'pale_mucous', 'Mucosas pálidas', 'Mucosas com coloração pálida'),
        ('symptoms', 'jaundice', 'Icterícia', 'Mucosas amareladas'),
        ('symptoms', 'shock', 'Estado de choque', 'Sinais de choque circulatório'),
        
        -- Sintomas respiratórios
        ('symptoms', 'coughing', 'Tosse', 'Tosse persistente ou ocasional'),
        ('symptoms', 'dyspnea', 'Dispneia', 'Dificuldade respiratória'),
        ('symptoms', 'nasal_discharge', 'Corrimento nasal', 'Secreção nasal'),
        ('symptoms', 'sneezing', 'Espirros', 'Espirros frequentes'),
        ('symptoms', 'open_mouth_breathing', 'Respiração ofegante', 'Respiração com boca aberta'),
        ('symptoms', 'wheezing', 'Sibilos', 'Ruídos respiratórios anormais'),
        ('symptoms', 'cyanosis', 'Cianose', 'Mucosas azuladas por falta de oxigénio'),
        
        -- Sintomas gastrointestinais
        ('symptoms', 'vomiting', 'Vómito', 'Episódios de vómito'),
        ('symptoms', 'diarrhea', 'Diarreia', 'Fezes líquidas ou pastosas'),
        ('symptoms', 'constipation', 'Obstipação', 'Dificuldade para defecar'),
        ('symptoms', 'blood_stool', 'Sangue nas fezes', 'Presença de sangue nas fezes'),
        ('symptoms', 'blood_vomit', 'Vómito com sangue', 'Vómito com presença de sangue'),
        ('symptoms', 'loss_appetite', 'Perda de apetite', 'Recusa alimentar'),
        ('symptoms', 'excessive_salivation', 'Salivação excessiva', 'Produção excessiva de saliva'),
        ('symptoms', 'abdominal_distension', 'Distensão abdominal', 'Abdómen inchado'),
        
        -- Sintomas neurológicos
        ('symptoms', 'seizures', 'Convulsões', 'Episódios convulsivos'),
        ('symptoms', 'ataxia', 'Ataxia', 'Incoordenação motora'),
        ('symptoms', 'head_tilt', 'Inclinação da cabeça', 'Cabeça inclinada para um lado'),
        ('symptoms', 'blindness', 'Cegueira', 'Perda de visão'),
        ('symptoms', 'altered_consciousness', 'Alteração da consciência', 'Estado mental alterado'),
        ('symptoms', 'tremors', 'Tremores', 'Tremores musculares'),
        ('symptoms', 'circling', 'Movimento circular', 'Animal anda em círculos'),
        
        -- Sintomas locomotores
        ('symptoms', 'limping', 'Coxear', 'Dificuldade de locomoção'),
        ('symptoms', 'paralysis', 'Paralisia', 'Perda de movimento'),
        ('symptoms', 'joint_swelling', 'Inchaço articular', 'Articulações inchadas'),
        ('symptoms', 'muscle_atrophy', 'Atrofia muscular', 'Perda de massa muscular'),
        ('symptoms', 'fractures', 'Fraturas', 'Ossos partidos'),
        ('symptoms', 'luxations', 'Luxações', 'Articulações deslocadas'),
        
        -- Sintomas cutâneos
        ('symptoms', 'wounds', 'Feridas', 'Feridas visíveis'),
        ('symptoms', 'skin_lesions', 'Lesões cutâneas', 'Alterações na pele'),
        ('symptoms', 'hair_loss', 'Perda de pelo', 'Alopecia'),
        ('symptoms', 'itching', 'Prurido', 'Coceira intensa'),
        ('symptoms', 'skin_infections', 'Infecções cutâneas', 'Infecções da pele'),
        ('symptoms', 'burns', 'Queimaduras', 'Lesões por queimadura'),
        ('symptoms', 'abscesses', 'Abcessos', 'Acumulação de pus'),
        
        -- Parasitas
        ('symptoms', 'parasites', 'Parasitas externos', 'Pulgas, carrapatos, ácaros'),
        ('symptoms', 'internal_parasites', 'Parasitas internos', 'Vermes intestinais'),
        ('symptoms', 'mange', 'Sarna', 'Infestação por ácaros'),
        
        -- Sintomas comportamentais
        ('symptoms', 'aggression', 'Agressividade', 'Comportamento agressivo'),
        ('symptoms', 'excessive_fear', 'Medo excessivo', 'Medo extremo'),
        ('symptoms', 'disorientation', 'Desorientação', 'Animal desorientado'),
        ('symptoms', 'excessive_vocalization', 'Vocalização excessiva', 'Latidos/miados excessivos'),
        ('symptoms', 'depression', 'Depressão', 'Comportamento depressivo'),
        ('symptoms', 'hyperactivity', 'Hiperatividade', 'Atividade excessiva'),
        
        -- Sintomas oculares
        ('symptoms', 'eye_discharge', 'Corrimento ocular', 'Secreção nos olhos'),
        ('symptoms', 'eye_redness', 'Vermelhidão ocular', 'Olhos vermelhos'),
        ('symptoms', 'eye_swelling', 'Inchaço ocular', 'Olhos inchados'),
        ('symptoms', 'corneal_opacity', 'Opacidade corneal', 'Córnea opaca'),
        
        -- Sintomas auditivos
        ('symptoms', 'ear_discharge', 'Corrimento auricular', 'Secreção no ouvido'),
        ('symptoms', 'ear_odor', 'Odor auricular', 'Mau cheiro no ouvido'),
        ('symptoms', 'head_shaking', 'Balançar a cabeça', 'Movimento repetitivo da cabeça'),
        
        -- Sintomas urinários
        ('symptoms', 'urinary_retention', 'Retenção urinária', 'Dificuldade para urinar'),
        ('symptoms', 'blood_urine', 'Sangue na urina', 'Urina com sangue'),
        ('symptoms', 'frequent_urination', 'Micção frequente', 'Urinar com frequência'),
        
        -- AÇÕES IMEDIATAS COMPLETAS (40+ opções como solicitado)
        -- Cuidados básicos
        ('immediate_actions', 'first_aid', 'Primeiros socorros', 'Cuidados imediatos básicos'),
        ('immediate_actions', 'veterinary_exam', 'Exame veterinário', 'Avaliação veterinária completa'),
        ('immediate_actions', 'vital_signs', 'Avaliação de sinais vitais', 'Verificação de temperatura, pulso, respiração'),
        
        -- Contenção e segurança
        ('immediate_actions', 'physical_restraint', 'Contenção física', 'Imobilização segura do animal'),
        ('immediate_actions', 'sedation', 'Sedação', 'Administração de sedativos'),
        ('immediate_actions', 'muzzle_application', 'Aplicação de açaime', 'Colocação de açaime por segurança'),
        ('immediate_actions', 'isolation', 'Isolamento', 'Isolamento preventivo ou terapêutico'),
        
        -- Cuidados respiratórios
        ('immediate_actions', 'oxygen_therapy', 'Oxigenoterapia', 'Administração de oxigénio'),
        ('immediate_actions', 'airway_clearance', 'Desobstrução das vias aéreas', 'Limpeza de vias respiratórias'),
        ('immediate_actions', 'intubation', 'Entubação', 'Colocação de tubo endotraqueal'),
        
        -- Controlo de hemorragias
        ('immediate_actions', 'hemorrhage_control', 'Controlo de hemorragias', 'Estancamento de sangramentos'),
        ('immediate_actions', 'pressure_bandage', 'Penso compressivo', 'Aplicação de penso para controlar sangramento'),
        ('immediate_actions', 'tourniquet', 'Garrote', 'Aplicação de garrote em emergência'),
        
        -- Estabilização de fraturas
        ('immediate_actions', 'fracture_stabilization', 'Estabilização de fraturas', 'Imobilização de ossos partidos'),
        ('immediate_actions', 'splinting', 'Aplicação de tala', 'Colocação de tala para imobilização'),
        ('immediate_actions', 'bandaging', 'Enfaixamento', 'Aplicação de ligaduras'),
        
        -- Cuidados de feridas
        ('immediate_actions', 'wound_cleaning', 'Limpeza de feridas', 'Desinfeção e limpeza de ferimentos'),
        ('immediate_actions', 'wound_suturing', 'Sutura de feridas', 'Costura de ferimentos'),
        ('immediate_actions', 'burn_treatment', 'Tratamento de queimaduras', 'Cuidados específicos para queimaduras'),
        ('immediate_actions', 'antiseptic_application', 'Aplicação de antisséptico', 'Desinfeção com produtos antissépticos'),
        
        -- Medicação de emergência
        ('immediate_actions', 'pain_relief', 'Alívio da dor', 'Administração de analgésicos'),
        ('immediate_actions', 'antibiotic_administration', 'Administração de antibióticos', 'Tratamento com antibióticos'),
        ('immediate_actions', 'anti_inflammatory', 'Anti-inflamatórios', 'Medicação anti-inflamatória'),
        ('immediate_actions', 'emergency_drugs', 'Fármacos de emergência', 'Medicamentos para situações críticas'),
        ('immediate_actions', 'fluid_therapy', 'Fluidoterapia', 'Administração de fluidos intravenosos'),
        
        -- Suporte cardiovascular
        ('immediate_actions', 'cardiac_massage', 'Massagem cardíaca', 'Reanimação cardiopulmonar'),
        ('immediate_actions', 'shock_treatment', 'Tratamento de choque', 'Medidas para tratar estado de choque'),
        
        -- Cuidados neurológicos
        ('immediate_actions', 'seizure_control', 'Controlo de convulsões', 'Medicação anticonvulsivante'),
        ('immediate_actions', 'head_trauma_care', 'Cuidados de trauma craniano', 'Tratamento específico para lesões na cabeça'),
        
        -- Descontaminação
        ('immediate_actions', 'decontamination', 'Descontaminação', 'Limpeza de substâncias tóxicas'),
        ('immediate_actions', 'eye_irrigation', 'Irrigação ocular', 'Lavagem dos olhos'),
        ('immediate_actions', 'gastric_lavage', 'Lavagem gástrica', 'Limpeza do estômago'),
        
        -- Controlo de parasitas
        ('immediate_actions', 'parasite_treatment', 'Tratamento de parasitas', 'Medicação antiparasitária'),
        ('immediate_actions', 'flea_treatment', 'Tratamento de pulgas', 'Eliminação de pulgas'),
        ('immediate_actions', 'tick_removal', 'Remoção de carrapatos', 'Retirada manual de carrapatos'),
        
        -- Cuidados de suporte
        ('immediate_actions', 'temperature_regulation', 'Regulação da temperatura', 'Aquecimento ou arrefecimento do animal'),
        ('immediate_actions', 'nutritional_support', 'Suporte nutricional', 'Alimentação assistida ou suplementação'),
        ('immediate_actions', 'hydration', 'Hidratação', 'Fornecimento de água ou fluidos'),
        
        -- Documentação e comunicação
        ('immediate_actions', 'photo_documentation', 'Documentação fotográfica', 'Registo fotográfico das lesões'),
        ('immediate_actions', 'emergency_contact', 'Contacto de emergência', 'Comunicação com veterinário de urgência'),
        ('immediate_actions', 'owner_notification', 'Notificação do proprietário', 'Contacto com o dono do animal')
    ) AS options(domain, code, name, description);
$$;

-- Testar
SELECT 'Opções expandidas restauradas' as status, COUNT(*) as total FROM get_intake_options_simple();
SELECT domain, COUNT(*) as opcoes FROM get_intake_options_simple() GROUP BY domain ORDER BY domain;

-- Comentário
COMMENT ON FUNCTION get_intake_options_simple IS 'Função com TODAS as opções solicitadas pelo usuário - 60+ sintomas e 40+ ações imediatas';