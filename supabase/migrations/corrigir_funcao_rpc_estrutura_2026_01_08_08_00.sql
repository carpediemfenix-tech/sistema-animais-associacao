-- Verificar estrutura real da tabela
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Remover função existente
DROP FUNCTION IF EXISTS public.get_animal_intake_assessment(UUID);

-- Criar função simples que funciona com a estrutura real
CREATE OR REPLACE FUNCTION public.get_animal_intake_assessment(animal_uuid UUID)
RETURNS SETOF animal_intake_assessments
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM animal_intake_assessments
    WHERE animal_id = animal_uuid
    ORDER BY updated_at DESC;
END;
$$;

-- Testar a função corrigida
SELECT 'TESTE DA FUNÇÃO CORRIGIDA' as secao;
SELECT id, animal_id, intake_origin, general_condition, behavior_entry, updated_at 
FROM public.get_animal_intake_assessment('67daf5d6-b573-4c74-81d7-a1065f8786e1'::UUID);