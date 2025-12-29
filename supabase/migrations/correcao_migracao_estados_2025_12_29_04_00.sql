-- Correção da migração de estados existentes
-- Data: 2025-12-29 04:00 UTC

-- Função para migrar estados existentes (corrigida)
DO $$
DECLARE
    animal_record RECORD;
    tipo_estado_id UUID;
BEGIN
    -- Para cada animal que já tem um estado definido
    FOR animal_record IN 
        SELECT id, estado, data_entrada 
        FROM public.animais 
        WHERE estado IS NOT NULL AND estado != ''
    LOOP
        -- Encontrar o tipo de estado correspondente
        SELECT id INTO tipo_estado_id 
        FROM public.tipos_estado 
        WHERE nome = animal_record.estado;
        
        -- Se encontrou o tipo de estado, criar registro histórico
        IF tipo_estado_id IS NOT NULL THEN
            INSERT INTO public.estados_animal (
                animal_id, 
                tipo_estado_id, 
                data_inicio, 
                ativo, 
                observacoes
            ) VALUES (
                animal_record.id,
                tipo_estado_id,
                COALESCE(animal_record.data_entrada, CURRENT_DATE),
                true,
                'Estado migrado automaticamente do sistema anterior'
            ) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;

SELECT 'Migração de estados corrigida com sucesso!' as status;