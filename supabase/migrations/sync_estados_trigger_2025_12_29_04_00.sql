-- Trigger para sincronizar estado atual do animal
-- Data: 2025-12-29 04:00 UTC

-- Função para sincronizar estado atual
CREATE OR REPLACE FUNCTION sync_animal_current_state()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o novo estado está sendo marcado como ativo
    IF NEW.ativo = true THEN
        -- Desativar todos os outros estados deste animal
        UPDATE public.estados_animal 
        SET ativo = false, data_fim = NEW.data_inicio
        WHERE animal_id = NEW.animal_id 
        AND id != NEW.id 
        AND ativo = true;
        
        -- Atualizar o campo estado na tabela animais
        UPDATE public.animais 
        SET estado = (SELECT nome FROM public.tipos_estado WHERE id = NEW.tipo_estado_id)
        WHERE id = NEW.animal_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger anterior se existir
DROP TRIGGER IF EXISTS sync_animal_state_trigger ON public.estados_animal;

-- Criar novo trigger
CREATE TRIGGER sync_animal_state_trigger 
    BEFORE INSERT OR UPDATE ON public.estados_animal
    FOR EACH ROW EXECUTE FUNCTION sync_animal_current_state();

-- Função para migrar estados existentes dos animais
CREATE OR REPLACE FUNCTION migrate_existing_animal_states()
RETURNS void AS $$
DECLARE
    animal_record RECORD;
    tipo_estado_id UUID;
BEGIN
    -- Para cada animal que já tem um estado definido mas não tem histórico
    FOR animal_record IN 
        SELECT a.id, a.estado, a.data_entrada 
        FROM public.animais a
        LEFT JOIN public.estados_animal ea ON ea.animal_id = a.id AND ea.ativo = true
        WHERE a.estado IS NOT NULL 
        AND a.estado != ''
        AND ea.id IS NULL -- Não tem estado ativo no histórico
    LOOP
        -- Encontrar o tipo de estado correspondente
        SELECT id INTO tipo_estado_id 
        FROM public.tipos_estado 
        WHERE LOWER(nome) = LOWER(animal_record.estado)
        OR nome ILIKE '%' || animal_record.estado || '%';
        
        -- Se não encontrou correspondência exata, usar "Ativo" como padrão
        IF tipo_estado_id IS NULL THEN
            SELECT id INTO tipo_estado_id 
            FROM public.tipos_estado 
            WHERE nome = 'Ativo';
        END IF;
        
        -- Se encontrou o tipo de estado, criar registro histórico
        IF tipo_estado_id IS NOT NULL THEN
            INSERT INTO public.estados_animal (
                animal_id, 
                tipo_estado_id, 
                data_inicio, 
                ativo, 
                observacoes,
                usuario_id
            ) VALUES (
                animal_record.id,
                tipo_estado_id,
                COALESCE(animal_record.data_entrada, CURRENT_DATE),
                true,
                'Estado migrado automaticamente do sistema anterior',
                'sistema'
            ) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migração de estados concluída com sucesso!';
END;
$$ language 'plpgsql';

-- Executar migração
SELECT migrate_existing_animal_states();

SELECT 'Sistema de sincronização de estados configurado com sucesso!' as status;