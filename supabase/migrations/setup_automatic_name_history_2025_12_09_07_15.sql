-- Migrar nomes atuais dos animais para o histórico
INSERT INTO public.historico_nomes_animais (animal_id, nome, data_inicio, ativo, motivo_alteracao)
SELECT 
    id,
    nome,
    created_at,
    true, -- Nome atual ativo
    'Nome inicial'
FROM public.animais
WHERE nome IS NOT NULL AND nome != ''
ON CONFLICT DO NOTHING;

-- Criar função para gerenciar histórico de nomes automaticamente
CREATE OR REPLACE FUNCTION manage_animal_name_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o nome foi alterado
    IF OLD.nome IS DISTINCT FROM NEW.nome THEN
        -- Desativar o nome anterior
        UPDATE public.historico_nomes_animais 
        SET 
            ativo = false,
            data_fim = NOW(),
            updated_at = NOW()
        WHERE animal_id = NEW.id AND ativo = true;
        
        -- Inserir o novo nome
        INSERT INTO public.historico_nomes_animais (
            animal_id, 
            nome, 
            data_inicio, 
            ativo, 
            motivo_alteracao
        ) VALUES (
            NEW.id,
            NEW.nome,
            NOW(),
            true,
            CASE 
                WHEN NEW.estado = 'Adotado' THEN 'Alteração por adoção'
                ELSE 'Alteração administrativa'
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar histórico automaticamente
DROP TRIGGER IF EXISTS animal_name_history_trigger ON public.animais;
CREATE TRIGGER animal_name_history_trigger
    AFTER UPDATE ON public.animais
    FOR EACH ROW
    WHEN (OLD.nome IS DISTINCT FROM NEW.nome)
    EXECUTE FUNCTION manage_animal_name_history();

-- Função para obter nome atual do animal
CREATE OR REPLACE FUNCTION get_current_animal_name(animal_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    current_name TEXT;
BEGIN
    SELECT nome INTO current_name
    FROM public.historico_nomes_animais
    WHERE animal_id = animal_uuid AND ativo = true
    ORDER BY data_inicio DESC
    LIMIT 1;
    
    -- Fallback para o nome na tabela animais se não encontrar no histórico
    IF current_name IS NULL THEN
        SELECT nome INTO current_name
        FROM public.animais
        WHERE id = animal_uuid;
    END IF;
    
    RETURN COALESCE(current_name, 'Sem nome');
END;
$$ language 'plpgsql';

-- Verificar se a migração funcionou
SELECT 
    a.nome as nome_tabela_animais,
    h.nome as nome_historico,
    h.ativo,
    h.data_inicio,
    h.motivo_alteracao
FROM public.animais a
LEFT JOIN public.historico_nomes_animais h ON a.id = h.animal_id
WHERE h.ativo = true
ORDER BY a.nome
LIMIT 10;