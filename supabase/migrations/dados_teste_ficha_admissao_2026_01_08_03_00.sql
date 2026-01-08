-- ===== DADOS DE TESTE PARA FICHA DE ADMISSÃO =====
-- Data: 2026-01-08 03:00 UTC
-- Descrição: Criar dados de exemplo para testar a ficha de admissão

-- Inserir uma avaliação de admissão de exemplo para o animal ID: 1685ea69-0598-4850-90c4-536c32323b35
INSERT INTO public.animal_intake_assessments (
    id,
    animal_id,
    assessment_date,
    assessed_by,
    assessor_name,
    intake_origin,
    intake_reason,
    circumstances_details,
    general_condition,
    behavior_entry,
    body_condition,
    weight_kg,
    temperature_celsius,
    symptoms,
    physical_exam_notes,
    behavioral_notes,
    immediate_actions,
    immediate_actions_notes,
    prognosis,
    treatment_plan,
    special_needs,
    is_complete,
    injury_count
) VALUES (
    gen_random_uuid(),
    '1685ea69-0598-4850-90c4-536c32323b35'::uuid,
    '2024-12-15 10:30:00+00',
    null, -- Sem referência específica ao voluntário
    'Dr. Maria Santos',
    'found_street', -- Encontrado na rua
    'abandonment', -- Abandono
    'Animal encontrado numa caixa de cartão junto ao contentor do lixo na Rua das Flores. Aparentava estar há várias horas no local, com sinais de desidratação.',
    'poor', -- Estado geral mau
    'fearful', -- Medroso
    'underweight', -- Abaixo do peso
    8.5, -- 8.5 kg
    37.2, -- 37.2°C (ligeiramente baixa)
    '["vomiting", "diarrhea", "discharge_eyes"]'::jsonb, -- Vómitos, diarreia, secreção ocular
    'Animal apresenta sinais de desnutrição severa. Costelas visíveis, pelagem baça e sem brilho. Presença de parasitas externos (pulgas). Mucosas pálidas indicando possível anemia. Ferida superficial na pata traseira direita, aparentemente causada por arame farpado.',
    'Muito assustado, evita contacto visual. Tremores constantes, possivelmente devido ao stress e frio. Não demonstra agressividade, mas recua quando se aproxima. Responde positivamente a voz calma e movimentos lentos.',
    '["veterinary_exam", "wound_cleaning", "fluid_therapy", "deworming", "isolation"]'::jsonb, -- Exame veterinário, limpeza de feridas, fluidoterapia, desparasitação, isolamento
    'Administrada fluidoterapia subcutânea (200ml). Limpeza e desinfeção da ferida na pata. Aplicado antiparasitário tópico. Colocado em isolamento preventivo para observação e recuperação. Oferecida alimentação húmida de fácil digestão.',
    'fair', -- Prognóstico razoável
    'Tratamento de suporte com fluidoterapia diária durante 3 dias. Dieta de recuperação com alimentação frequente (4x/dia). Antibiótico para prevenir infeção secundária. Reavaliação em 48h para monitorizar progresso.',
    'Necessita de ambiente calmo e silencioso para reduzir stress. Socialização gradual com humanos. Monitorização constante dos sinais vitais nas primeiras 72h.',
    true, -- Avaliação completa
    1 -- 1 lesão registada
) ON CONFLICT (animal_id) DO UPDATE SET
    assessment_date = EXCLUDED.assessment_date,
    assessor_name = EXCLUDED.assessor_name,
    intake_origin = EXCLUDED.intake_origin,
    intake_reason = EXCLUDED.intake_reason,
    circumstances_details = EXCLUDED.circumstances_details,
    general_condition = EXCLUDED.general_condition,
    behavior_entry = EXCLUDED.behavior_entry,
    body_condition = EXCLUDED.body_condition,
    weight_kg = EXCLUDED.weight_kg,
    temperature_celsius = EXCLUDED.temperature_celsius,
    symptoms = EXCLUDED.symptoms,
    physical_exam_notes = EXCLUDED.physical_exam_notes,
    behavioral_notes = EXCLUDED.behavioral_notes,
    immediate_actions = EXCLUDED.immediate_actions,
    immediate_actions_notes = EXCLUDED.immediate_actions_notes,
    prognosis = EXCLUDED.prognosis,
    treatment_plan = EXCLUDED.treatment_plan,
    special_needs = EXCLUDED.special_needs,
    is_complete = EXCLUDED.is_complete,
    injury_count = EXCLUDED.injury_count,
    updated_at = NOW();

-- Inserir lesão associada à avaliação
INSERT INTO public.animal_intake_injuries (
    assessment_id,
    injury_type,
    injury_severity,
    body_location,
    description,
    treatment_given,
    requires_followup,
    followup_date
) 
SELECT 
    aia.id,
    'wound_cut', -- Ferida/Corte
    'minor', -- Ligeira
    'Pata traseira direita',
    'Ferida superficial de aproximadamente 3cm causada por arame farpado. Sem sinais de infeção ativa.',
    'Limpeza com soro fisiológico, aplicação de betadine e penso protetor. Antibiótico tópico aplicado.',
    true, -- Requer acompanhamento
    '2024-12-17'::date -- Acompanhamento em 2 dias
FROM public.animal_intake_assessments aia
WHERE aia.animal_id = '1685ea69-0598-4850-90c4-536c32323b35'::uuid
ON CONFLICT DO NOTHING;

-- Inserir mais uma avaliação para outro animal (se existir)
INSERT INTO public.animal_intake_assessments (
    id,
    animal_id,
    assessment_date,
    assessed_by,
    assessor_name,
    intake_origin,
    intake_reason,
    circumstances_details,
    general_condition,
    behavior_entry,
    body_condition,
    weight_kg,
    temperature_celsius,
    symptoms,
    physical_exam_notes,
    behavioral_notes,
    immediate_actions,
    immediate_actions_notes,
    prognosis,
    treatment_plan,
    special_needs,
    is_complete,
    injury_count
) VALUES (
    gen_random_uuid(),
    '12345678-1234-5678-9012-123456789012'::uuid, -- ID fictício para teste
    '2024-12-10 14:15:00+00',
    null,
    'Dr. João Silva',
    'owner_surrender', -- Entregue pelo dono
    'financial_hardship', -- Dificuldades financeiras
    'Proprietário idoso sem condições financeiras para manter o animal após reforma. Animal bem cuidado e socializado.',
    'good', -- Estado geral bom
    'calm_friendly', -- Calmo e amigável
    'ideal', -- Peso ideal
    15.2, -- 15.2 kg
    38.5, -- 38.5°C (normal)
    '[]'::jsonb, -- Sem sintomas
    'Animal em bom estado geral. Pelagem saudável e brilhante. Sem sinais de parasitas. Dentes em bom estado. Sem lesões visíveis.',
    'Muito sociável e dócil. Responde bem a comandos básicos. Demonstra carinho e procura atenção humana. Bem adaptado ao contacto com pessoas.',
    '["veterinary_exam", "vaccination"]'::jsonb, -- Exame veterinário, vacinação
    'Exame clínico completo realizado. Vacinação atualizada conforme protocolo. Animal em excelente estado de saúde.',
    'excellent', -- Prognóstico excelente
    'Manutenção da rotina de cuidados. Exercício regular e dieta equilibrada. Pronto para adoção.',
    'Nenhuma necessidade especial identificada. Animal ideal para família.',
    true, -- Avaliação completa
    0 -- Sem lesões
) ON CONFLICT DO NOTHING;

-- Verificar dados inseridos
SELECT 
    'Dados de teste criados com sucesso' as status,
    COUNT(*) as total_avaliacoes
FROM public.animal_intake_assessments;

-- Mostrar avaliação do animal específico
SELECT 
    animal_id,
    assessor_name,
    intake_origin,
    intake_reason,
    general_condition,
    prognosis,
    is_complete
FROM public.animal_intake_assessments 
WHERE animal_id = '1685ea69-0598-4850-90c4-536c32323b35'::uuid;