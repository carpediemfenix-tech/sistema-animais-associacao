-- CORREÇÃO CRÍTICA DO TRIGGER DE INTERVENÇÕES
-- Problema: trigger_intervencao_agendada referencia campos que não existem

-- 1. REMOVER TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS trigger_intervencao_agendada ON intervencoes;

-- 2. VERIFICAR ESTRUTURA REAL DA TABELA INTERVENCOES
SELECT 
  'ESTRUTURA DA TABELA INTERVENCOES:' as info,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'intervencoes'
ORDER BY ordinal_position;

-- 3. RECRIAR FUNÇÃO TRIGGER CORRIGIDA
CREATE OR REPLACE FUNCTION trigger_intervencao_agendada()
RETURNS TRIGGER AS $$
DECLARE
  animal_nome TEXT;
  tipo_intervencao_nome TEXT;
  clinica_nome TEXT;
BEGIN
  -- Log para debug
  RAISE NOTICE 'Trigger intervenção executado para animal_id: %', NEW.animal_id;
  
  -- Buscar dados relacionados (usando apenas campos que existem)
  BEGIN
    SELECT a.nome INTO animal_nome FROM animais a WHERE a.id = NEW.animal_id;
  EXCEPTION
    WHEN OTHERS THEN
      animal_nome := 'Animal não encontrado';
  END;
  
  -- Verificar se tipo_intervencao_id existe e buscar nome
  IF NEW.tipo_intervencao_id IS NOT NULL THEN
    BEGIN
      SELECT ti.nome INTO tipo_intervencao_nome 
      FROM tipos_intervencoes ti 
      WHERE ti.id = NEW.tipo_intervencao_id;
    EXCEPTION
      WHEN OTHERS THEN
        tipo_intervencao_nome := 'Tipo não encontrado';
    END;
  END IF;
  
  -- Verificar se clinica_id existe e buscar nome
  IF NEW.clinica_id IS NOT NULL THEN
    BEGIN
      SELECT cv.nome INTO clinica_nome 
      FROM clinicas_veterinarias cv 
      WHERE cv.id = NEW.clinica_id;
    EXCEPTION
      WHEN OTHERS THEN
        clinica_nome := 'Clínica não encontrada';
    END;
  END IF;
  
  -- Verificar se a função create_agenda_evento existe antes de usar
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_agenda_evento') THEN
    -- Criar evento para agenda (usando apenas campos que existem)
    PERFORM create_agenda_evento(
      COALESCE(tipo_intervencao_nome, 'Intervenção') || ': ' || COALESCE(animal_nome, 'Animal'),
      'Intervenção médica registrada',
      'intervencao_medica',
      CASE 
        WHEN NEW.data_intervencao IS NOT NULL AND NEW.data_intervencao >= CURRENT_DATE THEN 'ativo'
        ELSE 'memorial'
      END,
      CASE 
        WHEN NEW.data_intervencao IS NOT NULL THEN 
          (NEW.data_intervencao || ' 09:00')::timestamp
        ELSE NOW()
      END,
      NULL, -- data_fim
      NEW.animal_id,
      NULL, -- veterinario_id (campo não existe, usar NULL)
      CASE 
        WHEN NEW.data_intervencao IS NOT NULL AND NEW.data_intervencao < CURRENT_DATE THEN 'concluido'
        WHEN NEW.concluida = true THEN 'concluido'
        ELSE 'agendado'
      END,
      CASE 
        WHEN NEW.urgente = true THEN 'urgente'
        ELSE 'normal'
      END,
      COALESCE(clinica_nome, 'Clínica não especificada'),
      NEW.observacoes,
      json_build_object(
        'tipo_intervencao', tipo_intervencao_nome,
        'clinica', clinica_nome,
        'veterinario', NEW.veterinario, -- Campo que existe (TEXT)
        'custo', NEW.custo,
        'desconto_protocolo', NEW.desconto_protocolo,
        'urgente', NEW.urgente,
        'concluida', NEW.concluida
      )::jsonb
    );
    
    RAISE NOTICE 'Evento de agenda criado com sucesso para intervenção';
  ELSE
    RAISE NOTICE 'Função create_agenda_evento não existe, pulando criação de evento';
  END IF;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- CRÍTICO: Se houver erro no trigger, NÃO bloquear a inserção da intervenção
    RAISE WARNING 'Erro no trigger de agenda para intervenção (ID: %), erro: % %. Intervenção será salva normalmente.', 
      NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. RECRIAR TRIGGER APENAS SE NECESSÁRIO
DO $$
BEGIN
  -- Verificar se a função create_agenda_evento existe
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_agenda_evento') THEN
    -- Recriar o trigger
    CREATE TRIGGER trigger_intervencao_agendada
      AFTER INSERT ON intervencoes
      FOR EACH ROW
      EXECUTE FUNCTION trigger_intervencao_agendada();
    
    RAISE NOTICE 'Trigger trigger_intervencao_agendada recriado com sucesso';
  ELSE
    RAISE NOTICE 'Função create_agenda_evento não existe, trigger não foi criado';
  END IF;
END $$;

-- 5. VERIFICAR SE EXISTEM OUTROS TRIGGERS PROBLEMÁTICOS
SELECT 
  'TRIGGERS ATIVOS NA TABELA INTERVENCOES:' as info,
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'intervencoes'
AND t.tgisinternal = false;