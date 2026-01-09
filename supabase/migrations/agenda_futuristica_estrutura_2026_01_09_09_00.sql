-- AGENDA FUTURÍSTICA UNIFICADA - ESTRUTURA PRINCIPAL
-- Tabela principal de eventos unificados
CREATE TABLE agenda_eventos_unificada_2026_01_09_09_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN (
    'intervencao_medica', 'consulta_veterinaria', 'missao_resgate', 'missao_adocao',
    'tarefa_voluntario', 'formacao', 'evento_associacao', 'manutencao',
    'entrada_animal', 'mudanca_localizacao', 'adocao_concluida', 'obito', 'marco_importante'
  )),
  categoria TEXT NOT NULL CHECK (categoria IN ('ativo', 'memorial')),
  data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  animal_id UUID REFERENCES animais(id) ON DELETE SET NULL,
  voluntario_id UUID REFERENCES voluntarios(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN (
    'agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'adiado'
  )),
  prioridade TEXT NOT NULL DEFAULT 'normal' CHECK (prioridade IN (
    'baixa', 'normal', 'alta', 'urgente'
  )),
  local TEXT,
  observacoes TEXT,
  metadados JSONB DEFAULT '{}', -- dados específicos por tipo
  cor_evento TEXT DEFAULT '#3B82F6',
  icone_evento TEXT DEFAULT 'Calendar',
  notificacao_enviada BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_agenda_eventos_data ON agenda_eventos_unificada_2026_01_09_09_00(data_evento);
CREATE INDEX idx_agenda_eventos_categoria ON agenda_eventos_unificada_2026_01_09_09_00(categoria);
CREATE INDEX idx_agenda_eventos_tipo ON agenda_eventos_unificada_2026_01_09_09_00(tipo_evento);
CREATE INDEX idx_agenda_eventos_animal ON agenda_eventos_unificada_2026_01_09_09_00(animal_id);
CREATE INDEX idx_agenda_eventos_voluntario ON agenda_eventos_unificada_2026_01_09_09_00(voluntario_id);
CREATE INDEX idx_agenda_eventos_status ON agenda_eventos_unificada_2026_01_09_09_00(status);

-- Tabela de configurações de tipos de eventos
CREATE TABLE agenda_tipos_eventos_2026_01_09_09_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_evento TEXT UNIQUE NOT NULL,
  nome_display TEXT NOT NULL,
  descricao TEXT,
  cor_padrao TEXT DEFAULT '#3B82F6',
  icone_padrao TEXT DEFAULT 'Calendar',
  categoria_padrao TEXT DEFAULT 'ativo',
  duracao_padrao_minutos INTEGER DEFAULT 60,
  requer_aprovacao BOOLEAN DEFAULT FALSE,
  permite_conflitos BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir tipos de eventos padrão
INSERT INTO agenda_tipos_eventos_2026_01_09_09_00 (tipo_evento, nome_display, descricao, cor_padrao, icone_padrao, categoria_padrao, duracao_padrao_minutos) VALUES
-- Eventos Ativos
('intervencao_medica', 'Intervenção Médica', 'Cirurgias, tratamentos e procedimentos médicos', '#DC2626', 'Heart', 'ativo', 120),
('consulta_veterinaria', 'Consulta Veterinária', 'Consultas de rotina e emergência', '#7C3AED', 'Stethoscope', 'ativo', 60),
('missao_resgate', 'Missão de Resgate', 'Operações de resgate de animais', '#059669', 'Shield', 'ativo', 180),
('missao_adocao', 'Missão de Adoção', 'Processos e eventos de adoção', '#0891B2', 'Heart', 'ativo', 90),
('tarefa_voluntario', 'Tarefa de Voluntário', 'Atividades e responsabilidades dos voluntários', '#2563EB', 'Users', 'ativo', 120),
('formacao', 'Formação', 'Cursos, workshops e certificações', '#7C2D12', 'GraduationCap', 'ativo', 240),
('evento_associacao', 'Evento da Associação', 'Reuniões, campanhas e eventos institucionais', '#9333EA', 'Calendar', 'ativo', 120),
('manutencao', 'Manutenção', 'Manutenção de equipamentos e instalações', '#EA580C', 'Wrench', 'ativo', 90),
-- Eventos Memorial
('entrada_animal', 'Entrada de Animal', 'Registro de admissão de novos animais', '#16A34A', 'PlusCircle', 'memorial', 0),
('mudanca_localizacao', 'Mudança de Localização', 'Transferências e mudanças de local', '#0D9488', 'MapPin', 'memorial', 0),
('adocao_concluida', 'Adoção Concluída', 'Processos de adoção finalizados', '#059669', 'Heart', 'memorial', 0),
('obito', 'Óbito', 'Registro de falecimento de animais', '#374151', 'X', 'memorial', 0),
('marco_importante', 'Marco Importante', 'Eventos significativos e conquistas', '#F59E0B', 'Star', 'memorial', 0);

-- RLS
ALTER TABLE agenda_eventos_unificada_2026_01_09_09_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_tipos_eventos_2026_01_09_09_00 ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Public can view agenda events" ON agenda_eventos_unificada_2026_01_09_09_00
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage agenda events" ON agenda_eventos_unificada_2026_01_09_09_00
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view event types" ON agenda_tipos_eventos_2026_01_09_09_00
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage event types" ON agenda_tipos_eventos_2026_01_09_09_00
FOR ALL USING (auth.role() = 'authenticated');