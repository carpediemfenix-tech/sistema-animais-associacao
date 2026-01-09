-- SISTEMA DE PREVENÇÃO PARA TRIGGERS FUTUROS
-- Criar funções utilitárias para validar campos antes de criar triggers

-- 1. FUNÇÃO PARA VERIFICAR SE COLUNA EXISTE
CREATE OR REPLACE FUNCTION column_exists(table_name_param TEXT, column_name_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = table_name_param 
    AND column_name = column_name_param
  );
END;
$$ LANGUAGE plpgsql;

-- 2. FUNÇÃO PARA VALIDAR ESTRUTURA DE TABELA ANTES DE CRIAR TRIGGER
CREATE OR REPLACE FUNCTION validate_table_structure(
  table_name_param TEXT,
  required_columns TEXT[]
)
RETURNS TABLE (
  column_name TEXT,
  exists_in_table BOOLEAN,
  data_type TEXT
) AS $$
DECLARE
  col TEXT;
BEGIN
  FOREACH col IN ARRAY required_columns
  LOOP
    RETURN QUERY
    SELECT 
      col as column_name,
      column_exists(table_name_param, col) as exists_in_table,
      COALESCE(
        (SELECT c.data_type 
         FROM information_schema.columns c 
         WHERE c.table_name = table_name_param 
         AND c.column_name = col), 
        'NOT_FOUND'
      ) as data_type;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. FUNÇÃO SEGURA PARA CRIAR EVENTOS DE AGENDA
CREATE OR REPLACE FUNCTION safe_create_agenda_evento(
  titulo_param TEXT,
  descricao_param TEXT,
  tipo_evento_param TEXT,
  categoria_param TEXT,
  data_evento_param TIMESTAMP,
  data_fim_param TIMESTAMP DEFAULT NULL,
  animal_id_param UUID DEFAULT NULL,
  voluntario_id_param UUID DEFAULT NULL,
  status_param TEXT DEFAULT 'agendado',
  prioridade_param TEXT DEFAULT 'normal',
  local_param TEXT DEFAULT NULL,
  observacoes_param TEXT DEFAULT NULL,
  metadados_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se a função create_agenda_evento existe
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_agenda_evento') THEN
    RAISE WARNING 'Função create_agenda_evento não existe, evento não será criado';
    RETURN FALSE;
  END IF;
  
  -- Verificar se a tabela de agenda existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agenda_eventos_unificada_2026_01_09_09_00') THEN
    RAISE WARNING 'Tabela de agenda não existe, evento não será criado';
    RETURN FALSE;
  END IF;
  
  -- Tentar criar o evento
  BEGIN
    PERFORM create_agenda_evento(
      titulo_param,
      descricao_param,
      tipo_evento_param,
      categoria_param,
      data_evento_param,
      data_fim_param,
      animal_id_param,
      voluntario_id_param,
      status_param,
      prioridade_param,
      local_param,
      observacoes_param,
      metadados_param
    );
    
    RETURN TRUE;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Erro ao criar evento de agenda: % %', SQLSTATE, SQLERRM;
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql;

-- 4. TEMPLATE SEGURO PARA TRIGGERS FUTUROS
CREATE OR REPLACE FUNCTION template_trigger_seguro()
RETURNS TRIGGER AS $$
DECLARE
  -- Declarar variáveis necessárias
  exemplo_nome TEXT;
BEGIN
  -- SEMPRE usar tratamento de erros
  BEGIN
    -- Lógica do trigger aqui
    -- Exemplo: SELECT nome INTO exemplo_nome FROM tabela WHERE id = NEW.campo_id;
    
    -- Usar safe_create_agenda_evento em vez de create_agenda_evento diretamente
    PERFORM safe_create_agenda_evento(
      'Título do Evento',
      'Descrição do evento',
      'tipo_evento',
      'ativo', -- ou 'memorial'
      NOW(),
      NULL, -- data_fim
      NEW.animal_id, -- se existir
      NULL, -- voluntario_id apenas se existir
      'agendado',
      'normal',
      'Local',
      'Observações',
      '{}'::jsonb
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      -- CRÍTICO: Nunca bloquear a operação principal por causa do trigger
      RAISE WARNING 'Erro no trigger (tabela: %, operação: %): % %', 
        TG_TABLE_NAME, TG_OP, SQLSTATE, SQLERRM;
  END;
  
  -- SEMPRE retornar NEW para não bloquear a operação
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. VERIFICAR INTEGRIDADE DO SISTEMA ATUAL
SELECT 
  'VERIFICAÇÃO DE INTEGRIDADE DO SISTEMA:' as info,
  'Função create_agenda_evento existe: ' || 
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_agenda_evento') 
       THEN 'SIM' ELSE 'NÃO' END as create_agenda_evento_status,
  'Tabela agenda existe: ' || 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agenda_eventos_unificada_2026_01_09_09_00') 
       THEN 'SIM' ELSE 'NÃO' END as tabela_agenda_status,
  'Função safe_create_agenda_evento criada: SIM' as safe_function_status;

-- 6. TESTAR VALIDAÇÃO DE ESTRUTURA DE TABELA
SELECT 
  'TESTE DE VALIDAÇÃO - TABELA INTERVENCOES:' as info,
  column_name,
  exists_in_table,
  data_type
FROM validate_table_structure(
  'intervencoes', 
  ARRAY['animal_id', 'tipo_intervencao_id', 'data_intervencao', 'veterinario', 'veterinario_responsavel_id', 'clinica_id', 'observacoes', 'custo', 'urgente', 'concluida']
);

-- 7. CRIAR DOCUMENTAÇÃO PARA DESENVOLVEDORES FUTUROS
CREATE OR REPLACE FUNCTION documentacao_triggers()
RETURNS TEXT AS $$
BEGIN
  RETURN '
=== GUIA PARA CRIAÇÃO DE TRIGGERS SEGUROS ===

1. SEMPRE usar tratamento de erros (BEGIN...EXCEPTION...END)
2. NUNCA bloquear a operação principal se o trigger falhar
3. Verificar se campos existem antes de usar (column_exists)
4. Usar safe_create_agenda_evento em vez de create_agenda_evento
5. Validar estrutura da tabela com validate_table_structure
6. Usar template_trigger_seguro como base
7. Testar triggers em ambiente de desenvolvimento primeiro

EXEMPLO DE TRIGGER SEGURO:
CREATE OR REPLACE FUNCTION meu_trigger()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    -- Verificar se campo existe
    IF column_exists(TG_TABLE_NAME, ''campo_necessario'') THEN
      -- Lógica do trigger
      PERFORM safe_create_agenda_evento(...);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING ''Erro no trigger: % %'', SQLSTATE, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
';
END;
$$ LANGUAGE plpgsql;

-- Exibir documentação
SELECT documentacao_triggers() as documentacao;