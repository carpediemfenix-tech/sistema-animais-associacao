// Opções expandidas completas para sintomas
const expandedSymptoms = [
  // Sintomas gerais
  { code: 'lethargy', name: 'Letargia', description: 'Animal apático ou sem energia' },
  { code: 'weakness', name: 'Fraqueza', description: 'Animal fraco ou debilitado' },
  { code: 'dehydration', name: 'Desidratação', description: 'Sinais de desidratação' },
  { code: 'fever', name: 'Febre', description: 'Temperatura corporal elevada' },
  { code: 'hypothermia', name: 'Hipotermia', description: 'Temperatura corporal baixa' },
  { code: 'pale_mucous', name: 'Mucosas pálidas', description: 'Mucosas com coloração pálida' },
  { code: 'jaundice', name: 'Icterícia', description: 'Mucosas amareladas' },
  { code: 'shock', name: 'Estado de choque', description: 'Sinais de choque circulatório' },
  
  // Sintomas respiratórios
  { code: 'coughing', name: 'Tosse', description: 'Tosse persistente ou ocasional' },
  { code: 'dyspnea', name: 'Dispneia', description: 'Dificuldade respiratória' },
  { code: 'nasal_discharge', name: 'Corrimento nasal', description: 'Secreção nasal' },
  { code: 'sneezing', name: 'Espirros', description: 'Espirros frequentes' },
  { code: 'open_mouth_breathing', name: 'Respiração ofegante', description: 'Respiração com boca aberta' },
  { code: 'wheezing', name: 'Sibilos', description: 'Ruídos respiratórios anormais' },
  { code: 'cyanosis', name: 'Cianose', description: 'Mucosas azuladas por falta de oxigénio' },
  
  // Sintomas gastrointestinais
  { code: 'vomiting', name: 'Vómito', description: 'Episódios de vómito' },
  { code: 'diarrhea', name: 'Diarreia', description: 'Fezes líquidas ou pastosas' },
  { code: 'constipation', name: 'Obstipação', description: 'Dificuldade para defecar' },
  { code: 'blood_stool', name: 'Sangue nas fezes', description: 'Presença de sangue nas fezes' },
  { code: 'blood_vomit', name: 'Vómito com sangue', description: 'Presença de sangue no vómito' },
  { code: 'loss_appetite', name: 'Perda de apetite', description: 'Recusa alimentar' },
  { code: 'excessive_salivation', name: 'Salivação excessiva', description: 'Produção excessiva de saliva' },
  { code: 'abdominal_distension', name: 'Distensão abdominal', description: 'Abdómen inchado' },
  
  // Sintomas neurológicos
  { code: 'seizures', name: 'Convulsões', description: 'Episódios convulsivos' },
  { code: 'ataxia', name: 'Ataxia', description: 'Incoordenação motora' },
  { code: 'head_tilt', name: 'Inclinação da cabeça', description: 'Cabeça inclinada para um lado' },
  { code: 'blindness', name: 'Cegueira', description: 'Perda de visão' },
  { code: 'altered_consciousness', name: 'Alteração da consciência', description: 'Nível de consciência alterado' },
  { code: 'tremors', name: 'Tremores', description: 'Tremores musculares' },
  { code: 'circling', name: 'Movimento circular', description: 'Animal anda em círculos' },
  
  // Sintomas locomotores
  { code: 'limping', name: 'Coxear', description: 'Dificuldade de locomoção' },
  { code: 'paralysis', name: 'Paralisia', description: 'Perda de movimento' },
  { code: 'joint_swelling', name: 'Inchaço articular', description: 'Articulações inchadas' },
  { code: 'muscle_atrophy', name: 'Atrofia muscular', description: 'Perda de massa muscular' },
  { code: 'fractures', name: 'Fraturas', description: 'Ossos partidos' },
  { code: 'luxations', name: 'Luxações', description: 'Articulações deslocadas' },
  
  // Sintomas cutâneos
  { code: 'wounds', name: 'Feridas', description: 'Feridas visíveis' },
  { code: 'skin_lesions', name: 'Lesões cutâneas', description: 'Lesões na pele' },
  { code: 'hair_loss', name: 'Perda de pelo', description: 'Alopecia ou perda de pelagem' },
  { code: 'itching', name: 'Prurido', description: 'Coceira intensa' },
  { code: 'skin_infections', name: 'Infecções cutâneas', description: 'Infecções na pele' },
  { code: 'burns', name: 'Queimaduras', description: 'Lesões por queimadura' },
  { code: 'abscesses', name: 'Abcessos', description: 'Acumulação de pus' },
  
  // Parasitas
  { code: 'parasites', name: 'Parasitas externos', description: 'Pulgas, carrapatos, ácaros' },
  { code: 'internal_parasites', name: 'Parasitas internos', description: 'Vermes intestinais' },
  { code: 'mange', name: 'Sarna', description: 'Infestação por ácaros' },
  
  // Sintomas comportamentais
  { code: 'aggression', name: 'Agressividade', description: 'Comportamento agressivo' },
  { code: 'excessive_fear', name: 'Medo excessivo', description: 'Medo extremo ou pânico' },
  { code: 'disorientation', name: 'Desorientação', description: 'Animal desorientado' },
  { code: 'excessive_vocalization', name: 'Vocalização excessiva', description: 'Miados, latidos ou choros excessivos' },
  { code: 'depression', name: 'Depressão', description: 'Comportamento deprimido' },
  { code: 'hyperactivity', name: 'Hiperatividade', description: 'Atividade excessiva' },
  
  // Sintomas oculares
  { code: 'eye_discharge', name: 'Corrimento ocular', description: 'Secreção nos olhos' },
  { code: 'eye_redness', name: 'Vermelhidão ocular', description: 'Olhos vermelhos' },
  { code: 'eye_swelling', name: 'Inchaço ocular', description: 'Olhos inchados' },
  { code: 'corneal_opacity', name: 'Opacidade corneal', description: 'Córnea opaca' },
  
  // Sintomas auditivos
  { code: 'ear_discharge', name: 'Corrimento auricular', description: 'Secreção nos ouvidos' },
  { code: 'ear_odor', name: 'Odor auricular', description: 'Mau cheiro nos ouvidos' },
  { code: 'head_shaking', name: 'Balançar a cabeça', description: 'Movimento repetitivo da cabeça' },
  
  // Sintomas urinários
  { code: 'urinary_retention', name: 'Retenção urinária', description: 'Dificuldade para urinar' },
  { code: 'blood_urine', name: 'Sangue na urina', description: 'Urina com sangue' },
  { code: 'frequent_urination', name: 'Micção frequente', description: 'Urinar com frequência' }
];

// Opções expandidas completas para ações imediatas
const expandedImmediateActions = [
  // Cuidados básicos
  { code: 'first_aid', name: 'Primeiros socorros', description: 'Cuidados imediatos básicos' },
  { code: 'veterinary_exam', name: 'Exame veterinário', description: 'Avaliação veterinária completa' },
  { code: 'vital_signs', name: 'Avaliação de sinais vitais', description: 'Verificação de temperatura, pulso, respiração' },
  
  // Contenção e segurança
  { code: 'physical_restraint', name: 'Contenção física', description: 'Imobilização segura do animal' },
  { code: 'sedation', name: 'Sedação', description: 'Administração de sedativos' },
  { code: 'muzzle_application', name: 'Aplicação de açaime', description: 'Colocação de açaime por segurança' },
  { code: 'isolation', name: 'Isolamento', description: 'Isolamento preventivo ou terapêutico' },
  
  // Cuidados respiratórios
  { code: 'oxygen_therapy', name: 'Oxigenoterapia', description: 'Administração de oxigénio' },
  { code: 'airway_clearance', name: 'Desobstrução das vias aéreas', description: 'Limpeza de vias respiratórias' },
  { code: 'intubation', name: 'Entubação', description: 'Colocação de tubo endotraqueal' },
  
  // Controlo de hemorragias
  { code: 'hemorrhage_control', name: 'Controlo de hemorragias', description: 'Estancamento de sangramentos' },
  { code: 'pressure_bandage', name: 'Penso compressivo', description: 'Aplicação de penso para controlar sangramento' },
  { code: 'tourniquet', name: 'Garrote', description: 'Aplicação de garrote em emergência' },
  
  // Estabilização de fraturas
  { code: 'fracture_stabilization', name: 'Estabilização de fraturas', description: 'Imobilização de ossos partidos' },
  { code: 'splinting', name: 'Aplicação de tala', description: 'Colocação de tala para imobilização' },
  { code: 'bandaging', name: 'Enfaixamento', description: 'Aplicação de ligaduras' },
  
  // Cuidados de feridas
  { code: 'wound_cleaning', name: 'Limpeza de feridas', description: 'Desinfeção e limpeza de ferimentos' },
  { code: 'wound_suturing', name: 'Sutura de feridas', description: 'Costura de ferimentos' },
  { code: 'burn_treatment', name: 'Tratamento de queimaduras', description: 'Cuidados específicos para queimaduras' },
  { code: 'antiseptic_application', name: 'Aplicação de antisséptico', description: 'Desinfeção com produtos antissépticos' },
  
  // Medicação de emergência
  { code: 'pain_relief', name: 'Alívio da dor', description: 'Administração de analgésicos' },
  { code: 'antibiotic_administration', name: 'Administração de antibióticos', description: 'Tratamento com antibióticos' },
  { code: 'anti_inflammatory', name: 'Anti-inflamatórios', description: 'Medicação anti-inflamatória' },
  { code: 'emergency_drugs', name: 'Fármacos de emergência', description: 'Medicamentos para situações críticas' },
  { code: 'fluid_therapy', name: 'Fluidoterapia', description: 'Administração de fluidos intravenosos' },
  
  // Suporte cardiovascular
  { code: 'cardiac_massage', name: 'Massagem cardíaca', description: 'Reanimação cardiopulmonar' },
  { code: 'shock_treatment', name: 'Tratamento de choque', description: 'Medidas para tratar estado de choque' },
  
  // Cuidados neurológicos
  { code: 'seizure_control', name: 'Controlo de convulsões', description: 'Medicação anticonvulsivante' },
  { code: 'head_trauma_care', name: 'Cuidados de trauma craniano', description: 'Tratamento específico para lesões na cabeça' },
  
  // Descontaminação
  { code: 'decontamination', name: 'Descontaminação', description: 'Limpeza de substâncias tóxicas' },
  { code: 'eye_irrigation', name: 'Irrigação ocular', description: 'Lavagem dos olhos' },
  { code: 'gastric_lavage', name: 'Lavagem gástrica', description: 'Limpeza do estômago' },
  
  // Controlo de parasitas
  { code: 'parasite_treatment', name: 'Tratamento de parasitas', description: 'Medicação antiparasitária' },
  { code: 'flea_treatment', name: 'Tratamento de pulgas', description: 'Eliminação de pulgas' },
  { code: 'tick_removal', name: 'Remoção de carrapatos', description: 'Retirada manual de carrapatos' },
  
  // Cuidados de suporte
  { code: 'temperature_regulation', name: 'Regulação da temperatura', description: 'Aquecimento ou arrefecimento do animal' },
  { code: 'nutritional_support', name: 'Suporte nutricional', description: 'Alimentação assistida ou suplementação' },
  { code: 'hydration', name: 'Hidratação', description: 'Fornecimento de água ou fluidos' },
  
  // Documentação e comunicação
  { code: 'photo_documentation', name: 'Documentação fotográfica', description: 'Registo fotográfico das lesões' },
  { code: 'emergency_contact', name: 'Contacto de emergência', description: 'Comunicação com veterinário de urgência' },
  { code: 'owner_notification', name: 'Notificação do proprietário', description: 'Contacto com o dono do animal' }
];

export { expandedSymptoms, expandedImmediateActions };