-- TRIGGERS DE SINCRONIZAÇÃO AUTOMÁTICA PARA AGENDA FUTURÍSTICA
-- Função trigger para entrada de animais
CREATE OR REPLACE FUNCTION trigger_animal_entrada()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar evento memorial para entrada de animal
  PERFORM create_agenda_evento(
    'Entrada: ' || NEW.nome,
    'Animal admitido na associação - Processo: ' || COALESCE(NEW.numero_processo, 'N/A'),
    'entrada_animal',
    'memorial',
    COALESCE(NEW.data_entrada, NOW()),
    NULL,
    NEW.id,
    NULL,
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função trigger para mudanças de localização
CREATE OR REPLACE FUNCTION trigger_mudanca_localizacao()
RETURNS TRIGGER AS $$
DECLARE
  animal_nome TEXT;
BEGIN
  -- Buscar nome do animal
  SELECT nome INTO animal_nome FROM animais WHERE id = NEW.animal_id;
  
  -- Criar evento memorial para mudança de localização
  PERFORM create_agenda_evento(
    'Mudança de Localização: ' || COALESCE(animal_nome, 'Animal'),
    'Animal transferido para nova localização',
    'mudanca_localizacao',
    'memorial',
    COALESCE(NEW.data_mudanca, NOW()),
    NULL,
    NEW.animal_id,
    NEW.responsavel_id,
    'concluido',
    'normal',
    NEW.nova_localizacao,
    COALESCE(NEW.observacoes, 'Mudança de localização registrada automaticamente'),
    json_build_object(
      'localizacao_anterior', NEW.localizacao_anterior,
      'nova_localizacao', NEW.nova_localizacao,
      'motivo', NEW.motivo,
      'responsavel_id', NEW.responsavel_id
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função trigger para intervenções
CREATE OR REPLACE FUNCTION trigger_intervencao_agendada()
RETURNS TRIGGER AS $$
DECLARE
  animal_nome TEXT;
  tipo_intervencao_nome TEXT;
  clinica_nome TEXT;
BEGIN
  -- Buscar dados relacionados
  SELECT a.nome INTO animal_nome FROM animais a WHERE a.id = NEW.animal_id;
  SELECT ti.nome INTO tipo_intervencao_nome FROM tipos_intervencoes ti WHERE ti.id = NEW.tipo_intervencao_id;
  SELECT cv.nome INTO clinica_nome FROM clinicas_veterinarias cv WHERE cv.id = NEW.clinica_id;
  
  -- Criar evento ativo para intervenção
  PERFORM create_agenda_evento(
    COALESCE(tipo_intervencao_nome, 'Intervenção') || ': ' || COALESCE(animal_nome, 'Animal'),
    'Intervenção médica agendada',
    'intervencao_medica',
    'ativo',
    (NEW.data_intervencao || ' ' || COALESCE(NEW.hora_intervencao, '09:00'))::timestamp,
    NULL,
    NEW.animal_id,
    NEW.veterinario_responsavel_id,
    CASE 
      WHEN NEW.data_intervencao < CURRENT_DATE THEN 'concluido'
      ELSE 'agendado'
    END,
    CASE 
      WHEN NEW.urgencia = 'alta' THEN 'urgente'
      WHEN NEW.urgencia = 'media' THEN 'alta'
      ELSE 'normal'
    END,
    COALESCE(clinica_nome, 'Clínica não especificada'),
    NEW.observacoes,
    json_build_object(
      'tipo_intervencao', tipo_intervencao_nome,
      'clinica', clinica_nome,
      'custo_estimado', NEW.custo_estimado,
      'urgencia', NEW.urgencia,
      'jejum_necessario', NEW.jejum_necessario
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função trigger para missões
CREATE OR REPLACE FUNCTION trigger_missao_criada()
RETURNS TRIGGER AS $$
DECLARE
  tipo_missao_nome TEXT;
  animal_nome TEXT;
  voluntario_nome TEXT;
BEGIN
  -- Buscar dados relacionados
  SELECT tm.nome INTO tipo_missao_nome FROM tipos_missoes_2025_12_13_09_00 tm WHERE tm.id = NEW.tipo_missao_id;
  SELECT a.nome INTO animal_nome FROM animais a WHERE a.id = NEW.animal_principal_id;
  SELECT v.nome INTO voluntario_nome FROM voluntarios v WHERE v.id = NEW.responsavel_principal_id;
  
  -- Criar evento ativo para missão
  PERFORM create_agenda_evento(
    COALESCE(tipo_missao_nome, 'Missão') || ': ' || NEW.titulo,
    NEW.descricao,
    CASE 
      WHEN tipo_missao_nome ILIKE '%resgate%' THEN 'missao_resgate'
      WHEN tipo_missao_nome ILIKE '%adoção%' OR tipo_missao_nome ILIKE '%adocao%' THEN 'missao_adocao'
      ELSE 'tarefa_voluntario'
    END,
    'ativo',
    (NEW.data_inicio || ' ' || COALESCE(NEW.hora_inicio, '09:00'))::timestamp,
    CASE 
      WHEN NEW.data_fim IS NOT NULL THEN (NEW.data_fim || ' ' || COALESCE(NEW.hora_fim, '18:00'))::timestamp
      ELSE NULL
    END,
    NEW.animal_principal_id,
    NEW.responsavel_principal_id,
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
      'animal_principal', animal_nome,
      'responsavel_principal', voluntario_nome,
      'recursos_necessarios', NEW.recursos_necessarios,
      'equipamentos_necessarios', NEW.equipamentos_necessarios
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função trigger para formações
CREATE OR REPLACE FUNCTION trigger_formacao_agendada()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar evento ativo para formação
  PERFORM create_agenda_evento(
    'Formação: ' || NEW.titulo,
    NEW.descricao,
    'formacao',
    'ativo',
    NEW.data_inicio,
    NEW.data_fim,
    NULL,
    NEW.instrutor_id,
    COALESCE(NEW.status, 'agendado'),
    'normal',
    NEW.local,
    NEW.observacoes,
    json_build_object(
      'categoria', NEW.categoria,
      'nivel', NEW.nivel,
      'vagas_disponiveis', NEW.vagas_disponiveis,
      'carga_horaria', NEW.carga_horaria,
      'certificacao', NEW.certificacao
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
-- Trigger para entrada de animais
DROP TRIGGER IF EXISTS trigger_animal_entrada ON animais;
CREATE TRIGGER trigger_animal_entrada
  AFTER INSERT ON animais
  FOR EACH ROW
  EXECUTE FUNCTION trigger_animal_entrada();

-- Trigger para mudanças de localização (assumindo que existe uma tabela)
-- DROP TRIGGER IF EXISTS trigger_mudanca_localizacao ON localizacoes_animal;
-- CREATE TRIGGER trigger_mudanca_localizacao
--   AFTER INSERT ON localizacoes_animal
--   FOR EACH ROW
--   EXECUTE FUNCTION trigger_mudanca_localizacao();

-- Trigger para intervenções
DROP TRIGGER IF EXISTS trigger_intervencao_agendada ON intervencoes;
CREATE TRIGGER trigger_intervencao_agendada
  AFTER INSERT ON intervencoes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_intervencao_agendada();

-- Trigger para missões
DROP TRIGGER IF EXISTS trigger_missao_criada ON missoes_2025_12_13_09_00;
CREATE TRIGGER trigger_missao_criada
  AFTER INSERT ON missoes_2025_12_13_09_00
  FOR EACH ROW
  EXECUTE FUNCTION trigger_missao_criada();

-- Trigger para formações (assumindo que existe uma tabela de formações)
-- DROP TRIGGER IF EXISTS trigger_formacao_agendada ON formacoes;
-- CREATE TRIGGER trigger_formacao_agendada
--   AFTER INSERT ON formacoes
--   FOR EACH ROW
--   EXECUTE FUNCTION trigger_formacao_agendada();

-- Inserir alguns eventos de exemplo para demonstração
INSERT INTO agenda_eventos_unificada_2026_01_09_09_00 (
  titulo, descricao, tipo_evento, categoria, data_evento, data_fim, status, prioridade, local, observacoes
) VALUES 
('Consulta de Rotina - Max', 'Consulta veterinária de rotina', 'consulta_veterinaria', 'ativo', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 'agendado', 'normal', 'Clínica Veterinária Central', 'Consulta de rotina agendada'),
('Formação: Primeiros Socorros', 'Workshop sobre primeiros socorros em animais', 'formacao', 'ativo', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '4 hours', 'agendado', 'alta', 'Sede da Associação', 'Formação obrigatória para novos voluntários'),
('Missão de Resgate - Urgente', 'Resgate de animal ferido reportado', 'missao_resgate', 'ativo', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '3 hours', 'confirmado', 'urgente', 'Rua das Flores, 123', 'Animal ferido necessita resgate imediato'),
('Entrada: Bella', 'Cadela encontrada na rua admitida na associação', 'entrada_animal', 'memorial', NOW() - INTERVAL '3 days', NULL, 'concluido', 'normal', 'Rua Principal', 'Animal encontrado por cidadão e trazido à associação'),
('Adoção Concluída: Rex', 'Processo de adoção finalizado com sucesso', 'adocao_concluida', 'memorial', NOW() - INTERVAL '1 day', NULL, 'concluido', 'normal', 'Casa do Adotante', 'Adoção finalizada após período de adaptação');