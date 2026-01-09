-- SISTEMA DE PREVENÇÃO PARA TRIGGERS FUTUROS (CORRIGIDO)

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

-- 2. FUNÇÃO SEGURA PARA CRIAR EVENTOS DE AGENDA
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

-- 3. VERIFICAR INTEGRIDADE DO SISTEMA ATUAL
SELECT 
  'VERIFICAÇÃO DE INTEGRIDADE:' as info,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_agenda_evento') 
       THEN 'create_agenda_evento: SIM' ELSE 'create_agenda_evento: NÃO' END as status1,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agenda_eventos_unificada_2026_01_09_09_00') 
       THEN 'tabela_agenda: SIM' ELSE 'tabela_agenda: NÃO' END as status2;

-- 4. TESTAR VALIDAÇÃO DE CAMPOS NA TABELA INTERVENCOES
SELECT 
  'VALIDAÇÃO CAMPOS INTERVENCOES:' as info,
  column_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'intervencoes' AND column_name = t.column_name
  ) THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (
  VALUES 
    ('animal_id'),
    ('tipo_intervencao_id'),
    ('data_intervencao'),
    ('veterinario'),
    ('veterinario_responsavel_id'),
    ('clinica_id'),
    ('observacoes'),
    ('custo'),
    ('urgente'),
    ('concluida')
) AS t(column_name);

-- 5. CRIAR FUNÇÃO DE DOCUMENTAÇÃO
CREATE OR REPLACE FUNCTION get_trigger_documentation()
RETURNS TEXT AS $$
BEGIN
  RETURN 'GUIA PARA TRIGGERS SEGUROS:
1. SEMPRE usar tratamento de erros
2. NUNCA bloquear operação principal
3. Verificar se campos existem antes de usar
4. Usar safe_create_agenda_evento
5. Testar em desenvolvimento primeiro';
END;
$$ LANGUAGE plpgsql;

-- 6. VERIFICAR RESULTADO FINAL DOS TRIGGERS
SELECT 
  'TRIGGERS ATIVOS APÓS CORREÇÃO:' as info,
  c.relname as table_name,
  t.tgname as trigger_name,
  CASE WHEN t.tgenabled = 'O' THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgisinternal = false
AND c.relname IN ('intervencoes', 'animais', 'missoes_2025_12_13_09_00')
ORDER BY c.relname, t.tgname;