-- Verificar dados atuais do animal específico
SELECT 
    id,
    nome,
    especie,
    raca,
    sexo,
    idade_estimada,
    data_nascimento,
    peso,
    cor,
    caracteristicas_fisicas,
    transponder,
    local_encontrado,
    estado,
    data_adocao,
    adotante_nome,
    adotante_contacto,
    observacoes,
    voluntario_responsavel,
    grupo_id,
    url_fotografia,
    updated_at,
    created_at
FROM animais 
WHERE id = '67daf5d6-b573-4c74-81d7-a1065f8786e1';

-- Verificar se existe ficha de admissão para este animal
SELECT 
    id,
    animal_id,
    intake_origin,
    intake_reason,
    circumstances_details,
    general_condition,
    behavior_entry,
    body_condition,
    symptoms,
    physical_exam_notes,
    behavioral_notes,
    immediate_actions,
    immediate_actions_notes,
    updated_at,
    created_at
FROM animal_intake_assessments 
WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1';

-- Verificar histórico de atualizações recentes
SELECT 
    nome,
    updated_at,
    created_at
FROM animais 
WHERE id = '67daf5d6-b573-4c74-81d7-a1065f8786e1'
ORDER BY updated_at DESC;