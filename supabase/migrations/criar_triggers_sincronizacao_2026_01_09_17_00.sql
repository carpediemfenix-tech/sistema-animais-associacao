-- CRIAR TRIGGERS CORRETOS PARA SINCRONIZAR DADOS REAIS FUTUROS
-- Garantir que novos dados reais apareçam automaticamente na agenda

-- 1. FUNÇÃO PARA CRIAR EVENTO DE ENTRADA DE ANIMAL
CREATE OR REPLACE FUNCTION criar_evento_entrada_animal()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se já existe evento para este animal
  IF NOT EXISTS (
    SELECT 1 FROM agenda_eventos_unificada_2026_01_09_09_00 
    WHERE animal_id = NEW.id AND titulo LIKE 'Entrada: ' || NEW.nome
  ) THEN
    -- Criar evento de entrada
    INSERT INTO agenda_eventos_unificada_2026_01_09_09_00 (
      titulo,
      descricao,
      tipo_evento,
      categoria,
      data_evento,
      prioridade,
      status,
      animal_id,
      observacoes,
      metadados
    ) VALUES (
      'Entrada: ' || NEW.nome,
      'Animal admitido na associação - ' || NEW.especie || 
      CASE WHEN NEW.sexo IS NOT NULL THEN ', ' || NEW.sexo ELSE '' END,
      'geral',  -- Usar tipo que funciona
      'memorial',
      NEW.data_entrada,
      'baixa',
      'concluido',
      NEW.id,
      '🔄 DADOS REAIS - Evento criado automaticamente pelo sistema',
      jsonb_build_object(
        'origem', 'trigger_animal',
        'tipo_dados', 'real',
        'animal_especie', NEW.especie,
        'animal_sexo', NEW.sexo,
        'criado_em', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloquear a operação
    RAISE WARNING 'Erro ao criar evento de entrada para animal %: % %', NEW.nome, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. FUNÇÃO PARA CRIAR EVENTO DE INTERVENÇÃO
CREATE OR REPLACE FUNCTION criar_evento_intervencao()
RETURNS TRIGGER AS $$
DECLARE
  animal_nome TEXT;
BEGIN
  -- Buscar nome do animal
  SELECT nome INTO animal_nome FROM animais WHERE id = NEW.animal_id;
  
  -- Verificar se já existe evento para esta intervenção
  IF NOT EXISTS (
    SELECT 1 FROM agenda_eventos_unificada_2026_01_09_09_00 
    WHERE metadados->>'intervencao_id' = NEW.id::text
  ) THEN
    -- Criar evento de intervenção
    INSERT INTO agenda_eventos_unificada_2026_01_09_09_00 (
      titulo,
      descricao,
      tipo_evento,
      categoria,
      data_evento,
      prioridade,
      status,
      animal_id,
      observacoes,
      metadados
    ) VALUES (
      'Intervenção: ' || COALESCE(animal_nome, 'Animal'),
      'Intervenção médica' || 
      CASE WHEN NEW.veterinario IS NOT NULL THEN ' - Dr. ' || NEW.veterinario ELSE '' END,
      'geral',
      CASE 
        WHEN NEW.data_intervencao > CURRENT_DATE THEN 'ativo'
        ELSE 'memorial'
      END,
      NEW.data_intervencao,
      CASE 
        WHEN NEW.urgente = true THEN 'alta'
        ELSE 'baixa'
      END,
      CASE 
        WHEN NEW.concluida = true THEN 'concluido'
        WHEN NEW.data_intervencao > CURRENT_DATE THEN 'agendado'
        ELSE 'em_andamento'
      END,
      NEW.animal_id,
      '🔄 DADOS REAIS - Evento criado automaticamente pelo sistema',
      jsonb_build_object(
        'origem', 'trigger_intervencao',
        'tipo_dados', 'real',
        'intervencao_id', NEW.id,
        'veterinario', NEW.veterinario,
        'urgente', NEW.urgente,
        'criado_em', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloquear a operação
    RAISE WARNING 'Erro ao criar evento de intervenção %: % %', NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. REMOVER TRIGGERS ANTIGOS SE EXISTIREM
DROP TRIGGER IF EXISTS trigger_animal_entrada ON animais;
DROP TRIGGER IF EXISTS trigger_intervencao_agendada ON intervencoes;

-- 4. CRIAR NOVOS TRIGGERS
CREATE TRIGGER trigger_animal_entrada_agenda
  AFTER INSERT ON animais
  FOR EACH ROW
  EXECUTE FUNCTION criar_evento_entrada_animal();

CREATE TRIGGER trigger_intervencao_agenda
  AFTER INSERT OR UPDATE ON intervencoes
  FOR EACH ROW
  EXECUTE FUNCTION criar_evento_intervencao();

-- 5. VERIFICAR SE OS TRIGGERS FORAM CRIADOS
SELECT 
  'TRIGGERS CRIADOS:' as info,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_animal_entrada_agenda', 'trigger_intervencao_agenda')
ORDER BY trigger_name;