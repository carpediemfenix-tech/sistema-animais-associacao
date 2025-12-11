-- Sistema de Agenda e Calendário para Associação
-- Criado em: 2025-12-11 03:00 UTC

-- 1. Tabela de Tipos de Eventos
CREATE TABLE IF NOT EXISTS tipos_eventos_2025_12_11_03_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7) DEFAULT '#3B82F6', -- Cor em hex para o calendário
  icone VARCHAR(50), -- Nome do ícone Lucide
  categoria VARCHAR(50) DEFAULT 'geral', -- geral, consulta, turno, evento, formacao
  duracao_padrao INTEGER DEFAULT 60, -- Duração padrão em minutos
  requer_aprovacao BOOLEAN DEFAULT false,
  permite_conflito BOOLEAN DEFAULT false, -- Permite sobreposição de horários
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela Principal de Eventos/Agendamentos
CREATE TABLE IF NOT EXISTS eventos_agenda_2025_12_11_03_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  tipo_evento_id UUID REFERENCES tipos_eventos_2025_12_11_03_00(id),
  
  -- Datas e horários
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  dia_completo BOOLEAN DEFAULT false,
  recorrente BOOLEAN DEFAULT false,
  padrao_recorrencia VARCHAR(20), -- diario, semanal, mensal, anual
  fim_recorrencia DATE,
  
  -- Localização
  local VARCHAR(200),
  endereco TEXT,
  sala_clinica VARCHAR(100),
  
  -- Participantes e responsáveis
  organizador_id UUID REFERENCES auth.users(id),
  voluntario_responsavel_id UUID REFERENCES voluntarios(id),
  animal_id UUID REFERENCES animais(id), -- Para consultas veterinárias
  clinica_id UUID REFERENCES clinicas_veterinarias(id), -- Para consultas externas
  
  -- Status e controle
  status VARCHAR(20) DEFAULT 'agendado', -- agendado, confirmado, em_andamento, concluido, cancelado, adiado
  prioridade VARCHAR(20) DEFAULT 'normal', -- baixa, normal, alta, urgente
  
  -- Notificações e lembretes
  lembrete_ativo BOOLEAN DEFAULT true,
  lembrete_antecedencia INTEGER DEFAULT 60, -- Minutos antes do evento
  notificacao_enviada BOOLEAN DEFAULT false,
  
  -- Observações e notas
  observacoes TEXT,
  notas_internas TEXT,
  resultado TEXT, -- Para consultas: resultado/diagnóstico
  
  -- Controle de presença
  confirmado_por UUID REFERENCES auth.users(id),
  data_confirmacao TIMESTAMP WITH TIME ZONE,
  presente BOOLEAN,
  
  -- Integração externa
  google_calendar_id VARCHAR(255),
  outlook_calendar_id VARCHAR(255),
  ical_uid VARCHAR(255),
  
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Participantes dos Eventos
CREATE TABLE IF NOT EXISTS participantes_eventos_2025_12_11_03_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID REFERENCES eventos_agenda_2025_12_11_03_00(id) ON DELETE CASCADE,
  voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE,
  tipo_participacao VARCHAR(20) DEFAULT 'participante', -- organizador, responsavel, participante, convidado
  status_resposta VARCHAR(20) DEFAULT 'pendente', -- pendente, aceito, recusado, talvez
  data_resposta TIMESTAMP WITH TIME ZONE,
  presente BOOLEAN,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evento_id, voluntario_id)
);

-- 4. Tabela de Turnos de Voluntários
CREATE TABLE IF NOT EXISTS turnos_voluntarios_2025_12_11_03_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID REFERENCES eventos_agenda_2025_12_11_03_00(id) ON DELETE CASCADE,
  voluntario_id UUID REFERENCES voluntarios(id) ON DELETE CASCADE,
  
  -- Detalhes do turno
  funcao VARCHAR(100), -- cuidador, limpeza, alimentacao, passeio, administrativo
  local_turno VARCHAR(100), -- canil, escritorio, evento_externo
  
  -- Horários específicos do turno
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  duracao_minutos INTEGER,
  
  -- Status do turno
  status VARCHAR(20) DEFAULT 'agendado', -- agendado, confirmado, em_andamento, concluido, faltou
  substituicao_de UUID REFERENCES turnos_voluntarios_2025_12_11_03_00(id), -- Se é substituição
  
  -- Controle de presença
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  horas_trabalhadas DECIMAL(4,2),
  
  -- Avaliação e feedback
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  feedback TEXT,
  observacoes_coordenador TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evento_id, voluntario_id)
);

-- 5. Tabela de Consultas Veterinárias
CREATE TABLE IF NOT EXISTS consultas_veterinarias_2025_12_11_03_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID REFERENCES eventos_agenda_2025_12_11_03_00(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES animais(id) NOT NULL,
  clinica_id UUID REFERENCES clinicas_veterinarias(id),
  
  -- Detalhes da consulta
  tipo_consulta VARCHAR(50) DEFAULT 'rotina', -- rotina, urgencia, cirurgia, vacinacao, castracao
  motivo TEXT NOT NULL,
  sintomas TEXT,
  
  -- Veterinário
  veterinario_nome VARCHAR(100),
  veterinario_contacto VARCHAR(50),
  
  -- Resultados
  diagnostico TEXT,
  tratamento_prescrito TEXT,
  medicamentos TEXT,
  proxima_consulta DATE,
  
  -- Custos
  custo_estimado DECIMAL(10,2),
  custo_real DECIMAL(10,2),
  pago BOOLEAN DEFAULT false,
  
  -- Documentos
  receita_url TEXT,
  exames_url TEXT,
  fotos_url TEXT,
  
  -- Status específico
  preparacao_necessaria TEXT, -- jejum, medicação prévia, etc.
  transporte_organizado BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Lembretes e Notificações
CREATE TABLE IF NOT EXISTS lembretes_agenda_2025_12_11_03_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID REFERENCES eventos_agenda_2025_12_11_03_00(id) ON DELETE CASCADE,
  
  -- Configuração do lembrete
  tipo_lembrete VARCHAR(20) DEFAULT 'email', -- email, sms, push, whatsapp
  destinatario_id UUID REFERENCES auth.users(id),
  destinatario_email VARCHAR(255),
  destinatario_telefone VARCHAR(20),
  
  -- Timing
  minutos_antecedencia INTEGER NOT NULL,
  data_envio_programada TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Conteúdo
  assunto VARCHAR(200),
  mensagem TEXT,
  template_usado VARCHAR(50),
  
  -- Status de envio
  enviado BOOLEAN DEFAULT false,
  data_envio TIMESTAMP WITH TIME ZONE,
  tentativas_envio INTEGER DEFAULT 0,
  erro_envio TEXT,
  
  -- Resposta do destinatário
  visualizado BOOLEAN DEFAULT false,
  data_visualizacao TIMESTAMP WITH TIME ZONE,
  respondido BOOLEAN DEFAULT false,
  resposta TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Configurações de Calendário
CREATE TABLE IF NOT EXISTS configuracoes_calendario_2025_12_11_03_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) UNIQUE,
  
  -- Preferências de visualização
  vista_padrao VARCHAR(20) DEFAULT 'semana', -- dia, semana, mes, agenda
  hora_inicio_dia TIME DEFAULT '08:00',
  hora_fim_dia TIME DEFAULT '18:00',
  primeiro_dia_semana INTEGER DEFAULT 1, -- 0=domingo, 1=segunda
  
  -- Notificações
  notificacoes_email BOOLEAN DEFAULT true,
  notificacoes_push BOOLEAN DEFAULT true,
  antecedencia_padrao INTEGER DEFAULT 60, -- minutos
  
  -- Integração externa
  google_calendar_token TEXT,
  google_calendar_refresh_token TEXT,
  outlook_calendar_token TEXT,
  sincronizacao_ativa BOOLEAN DEFAULT false,
  ultima_sincronizacao TIMESTAMP WITH TIME ZONE,
  
  -- Configurações de acesso
  calendario_publico BOOLEAN DEFAULT false,
  permite_agendamento_externo BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Relatórios de Atividades
CREATE TABLE IF NOT EXISTS relatorios_atividades_2025_12_11_03_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Período do relatório
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  tipo_relatorio VARCHAR(50) DEFAULT 'mensal', -- diario, semanal, mensal, anual, personalizado
  
  -- Dados agregados
  total_eventos INTEGER DEFAULT 0,
  eventos_concluidos INTEGER DEFAULT 0,
  eventos_cancelados INTEGER DEFAULT 0,
  total_consultas INTEGER DEFAULT 0,
  total_turnos INTEGER DEFAULT 0,
  horas_voluntariado DECIMAL(8,2) DEFAULT 0,
  
  -- Participação
  voluntarios_ativos INTEGER DEFAULT 0,
  taxa_presenca DECIMAL(5,2) DEFAULT 0,
  
  -- Custos
  custo_total_consultas DECIMAL(10,2) DEFAULT 0,
  
  -- Metadados
  gerado_por UUID REFERENCES auth.users(id),
  gerado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  formato VARCHAR(20) DEFAULT 'json', -- json, pdf, excel
  dados_detalhados JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos_agenda_2025_12_11_03_00(data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_data_fim ON eventos_agenda_2025_12_11_03_00(data_fim);
CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos_agenda_2025_12_11_03_00(status);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos_agenda_2025_12_11_03_00(tipo_evento_id);
CREATE INDEX IF NOT EXISTS idx_eventos_organizador ON eventos_agenda_2025_12_11_03_00(organizador_id);
CREATE INDEX IF NOT EXISTS idx_eventos_voluntario ON eventos_agenda_2025_12_11_03_00(voluntario_responsavel_id);
CREATE INDEX IF NOT EXISTS idx_eventos_animal ON eventos_agenda_2025_12_11_03_00(animal_id);
CREATE INDEX IF NOT EXISTS idx_participantes_evento ON participantes_eventos_2025_12_11_03_00(evento_id);
CREATE INDEX IF NOT EXISTS idx_participantes_voluntario ON participantes_eventos_2025_12_11_03_00(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_turnos_voluntario ON turnos_voluntarios_2025_12_11_03_00(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_consultas_animal ON consultas_veterinarias_2025_12_11_03_00(animal_id);
CREATE INDEX IF NOT EXISTS idx_lembretes_evento ON lembretes_agenda_2025_12_11_03_00(evento_id);
CREATE INDEX IF NOT EXISTS idx_lembretes_envio ON lembretes_agenda_2025_12_11_03_00(data_envio_programada);

-- Triggers para atualizar timestamps
CREATE TRIGGER update_tipos_eventos_updated_at BEFORE UPDATE ON tipos_eventos_2025_12_11_03_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos_agenda_2025_12_11_03_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participantes_updated_at BEFORE UPDATE ON participantes_eventos_2025_12_11_03_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_turnos_updated_at BEFORE UPDATE ON turnos_voluntarios_2025_12_11_03_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultas_updated_at BEFORE UPDATE ON consultas_veterinarias_2025_12_11_03_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lembretes_updated_at BEFORE UPDATE ON lembretes_agenda_2025_12_11_03_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes_calendario_2025_12_11_03_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();