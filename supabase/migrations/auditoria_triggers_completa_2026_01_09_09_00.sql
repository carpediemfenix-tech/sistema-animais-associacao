-- AUDITORIA COMPLETA DE TRIGGERS PROBLEMÁTICOS
-- Verificar todos os triggers que podem ter campos inexistentes

-- 1. LISTAR TODOS OS TRIGGERS ATIVOS NO SISTEMA
SELECT 
  'TODOS OS TRIGGERS ATIVOS:' as info,
  c.relname as table_name,
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  p.proname as function_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgisinternal = false
AND c.relname IN ('intervencoes', 'animais', 'missoes_2025_12_13_09_00', 'voluntarios')
ORDER BY c.relname, t.tgname;

-- 2. VERIFICAR FUNÇÕES QUE REFERENCIAM CAMPOS PROBLEMÁTICOS
SELECT 
  'FUNÇÕES COM CAMPOS PROBLEMÁTICOS:' as info,
  p.proname as function_name,
  CASE 
    WHEN p.prosrc ILIKE '%veterinario_responsavel_id%' THEN 'veterinario_responsavel_id'
    WHEN p.prosrc ILIKE '%responsavel_principal_id%' THEN 'responsavel_principal_id'
    WHEN p.prosrc ILIKE '%instrutor_id%' THEN 'instrutor_id'
    WHEN p.prosrc ILIKE '%hora_intervencao%' THEN 'hora_intervencao'
    ELSE 'outros'
  END as campo_problematico
FROM pg_proc p
WHERE (
  p.prosrc ILIKE '%veterinario_responsavel_id%' OR
  p.prosrc ILIKE '%responsavel_principal_id%' OR
  p.prosrc ILIKE '%instrutor_id%' OR
  p.prosrc ILIKE '%hora_intervencao%'
)
AND p.proname ILIKE '%trigger%';

-- 3. CORRIGIR TRIGGER DE ANIMAIS (se existir problema)
DROP TRIGGER IF EXISTS trigger_animal_entrada ON animais;

CREATE OR REPLACE FUNCTION trigger_animal_entrada()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se a função create_agenda_evento existe
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_agenda_evento') THEN
    -- Criar evento memorial para entrada de animal
    PERFORM create_agenda_evento(
      'Entrada: ' || NEW.nome,
      'Animal admitido na associação - Processo: ' || COALESCE(NEW.numero_processo, 'N/A'),
      'entrada_animal',
      'memorial',
      COALESCE(NEW.data_entrada, NOW()),
      NULL,
      NEW.id,
      NULL, -- Não usar campos que podem não existir
      'concluido',
      'normal',
      COALESCE(NEW.local_origem, 'Não especificado'),
      'Entrada automática registrada pelo sistema',
      json_build_object(
        'numero_processo', NEW.numero_processo,
        'especie', NEW.especie,
        'raca', NEW.raca,
        'idade_estimada', NEW.idade_estimada,
        'peso', NEW.peso,
        'origem', NEW.origem
      )::jsonb
    );
  END IF;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Não bloquear inserção de animal se houver erro no trigger
    RAISE WARNING 'Erro no trigger de entrada de animal: % %', SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger de animais apenas se necessário
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_agenda_evento') THEN
    CREATE TRIGGER trigger_animal_entrada
      AFTER INSERT ON animais
      FOR EACH ROW
      EXECUTE FUNCTION trigger_animal_entrada();
    
    RAISE NOTICE 'Trigger trigger_animal_entrada recriado com sucesso';
  END IF;
END $$;

-- 4. CORRIGIR TRIGGER DE MISSÕES (se existir)
DROP TRIGGER IF EXISTS trigger_missao_criada ON missoes_2025_12_13_09_00;

CREATE OR REPLACE FUNCTION trigger_missao_criada()
RETURNS TRIGGER AS $$
DECLARE
  tipo_missao_nome TEXT;
  animal_nome TEXT;
  voluntario_nome TEXT;
BEGIN
  -- Verificar se a função create_agenda_evento existe
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_agenda_evento') THEN
    -- Buscar dados relacionados com tratamento de erros
    BEGIN
      SELECT tm.nome INTO tipo_missao_nome 
      FROM tipos_missoes_2025_12_13_09_00 tm 
      WHERE tm.id = NEW.tipo_missao_id;
    EXCEPTION
      WHEN OTHERS THEN
        tipo_missao_nome := 'Missão';
    END;
    
    -- Verificar se campos existem antes de usar
    IF NEW.animal_principal_id IS NOT NULL THEN
      BEGIN
        SELECT a.nome INTO animal_nome FROM animais a WHERE a.id = NEW.animal_principal_id;
      EXCEPTION
        WHEN OTHERS THEN
          animal_nome := 'Animal não encontrado';
      END;
    END IF;
    
    -- Usar campos que realmente existem na tabela missoes
    PERFORM create_agenda_evento(
      COALESCE(tipo_missao_nome, 'Missão') || ': ' || NEW.titulo,
      NEW.descricao,
      CASE 
        WHEN tipo_missao_nome ILIKE '%resgate%' THEN 'missao_resgate'
        WHEN tipo_missao_nome ILIKE '%adoção%' OR tipo_missao_nome ILIKE '%adocao%' THEN 'missao_adocao'
        ELSE 'tarefa_voluntario'
      END,
      'ativo',
      COALESCE(NEW.data_inicio, NOW()),
      NEW.data_fim,
      NEW.animal_principal_id,
      NULL, -- Não usar responsavel_principal_id se não existir
      COALESCE(NEW.status, 'agendado'),
      CASE 
        WHEN NEW.prioridade = 'alta' THEN 'urgente'
        WHEN NEW.prioridade = 'media' THEN 'alta'
        ELSE 'normal'
      END,
      NEW.local_principal,
      NEW.observacoes,
      json_build_object(
        'tipo_missao', tipo_missao_nome,
        'animal_principal', animal_nome
      )::jsonb
    );
  END IF;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Não bloquear inserção de missão se houver erro no trigger
    RAISE WARNING 'Erro no trigger de missão: % %', SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger de missões apenas se necessário
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_agenda_evento') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'missoes_2025_12_13_09_00') THEN
    CREATE TRIGGER trigger_missao_criada
      AFTER INSERT ON missoes_2025_12_13_09_00
      FOR EACH ROW
      EXECUTE FUNCTION trigger_missao_criada();
    
    RAISE NOTICE 'Trigger trigger_missao_criada recriado com sucesso';
  END IF;
END $$;

-- 5. VERIFICAR RESULTADO FINAL
SELECT 
  'TRIGGERS CORRIGIDOS - RESULTADO FINAL:' as info,
  c.relname as table_name,
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgisinternal = false
AND c.relname IN ('intervencoes', 'animais', 'missoes_2025_12_13_09_00')
ORDER BY c.relname, t.tgname;