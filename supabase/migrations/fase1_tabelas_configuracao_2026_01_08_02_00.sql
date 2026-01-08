-- FASE 1: TABELAS DE CONFIGURAÇÃO PARA FICHA DE ADMISSÃO
-- Data: 2026-01-08 02:00 UTC

-- Tabela principal de configurações para opções da ficha de admissão
CREATE TABLE IF NOT EXISTS public.intake_config_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain VARCHAR(50) NOT NULL, -- Ex: 'intake_origin', 'general_condition', etc.
  code VARCHAR(50) NOT NULL,   -- Código único dentro do domínio
  name VARCHAR(100) NOT NULL,  -- Nome para exibição
  description TEXT,            -- Descrição opcional
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES public.intake_config_options(id), -- Para hierarquias
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Dados extras (cores, ícones, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_intake_config_domain ON public.intake_config_options(domain);
CREATE INDEX IF NOT EXISTS idx_intake_config_active ON public.intake_config_options(is_active);
CREATE INDEX IF NOT EXISTS idx_intake_config_parent ON public.intake_config_options(parent_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_intake_config_domain_code ON public.intake_config_options(domain, code);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_intake_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_intake_config_updated_at
  BEFORE UPDATE ON public.intake_config_options
  FOR EACH ROW EXECUTE FUNCTION update_intake_config_updated_at();

-- RLS Policies
ALTER TABLE public.intake_config_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_config_select_policy" ON public.intake_config_options
  FOR SELECT USING (true);

CREATE POLICY "intake_config_insert_policy" ON public.intake_config_options
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "intake_config_update_policy" ON public.intake_config_options
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "intake_config_delete_policy" ON public.intake_config_options
  FOR DELETE USING (auth.role() = 'authenticated');

-- Inserir dados padrão
INSERT INTO public.intake_config_options (domain, code, name, description, sort_order) VALUES
-- 1. Origem/Circunstâncias da Admissão
('intake_origin', 'found_street', 'Encontrado na rua', 'Animal encontrado abandonado na via pública', 1),
('intake_origin', 'owner_surrender', 'Entrega pelo proprietário', 'Proprietário entregou voluntariamente', 2),
('intake_origin', 'rescue_operation', 'Operação de resgate', 'Resgatado de situação de perigo/maus-tratos', 3),
('intake_origin', 'transfer_shelter', 'Transferência de outro abrigo', 'Transferido de outra instituição', 4),
('intake_origin', 'birth_facility', 'Nascimento na instituição', 'Nasceu nas instalações', 5),

-- 2. Razão da Admissão
('intake_reason', 'abandonment', 'Abandono', 'Animal abandonado pelo proprietário', 1),
('intake_reason', 'lost', 'Animal perdido', 'Animal perdido procurado pelo proprietário', 2),
('intake_reason', 'abuse_neglect', 'Maus-tratos/Negligência', 'Situação de abuso ou negligência', 3),
('intake_reason', 'medical_emergency', 'Emergência médica', 'Necessita cuidados médicos urgentes', 4),
('intake_reason', 'behavioral', 'Problemas comportamentais', 'Questões de comportamento', 5),
('intake_reason', 'overpopulation', 'Sobrepopulação', 'Excesso de animais no local de origem', 6),

-- 3. Estado Geral à Entrada
('general_condition', 'excellent', 'Excelente', 'Animal em perfeitas condições', 1),
('general_condition', 'good', 'Bom', 'Animal em boas condições gerais', 2),
('general_condition', 'fair', 'Razoável', 'Algumas questões menores', 3),
('general_condition', 'poor', 'Mau', 'Várias questões de saúde/bem-estar', 4),
('general_condition', 'critical', 'Crítico', 'Estado grave, necessita cuidados urgentes', 5),

-- 4. Comportamento à Entrada
('behavior_entry', 'calm_friendly', 'Calmo e amigável', 'Comportamento equilibrado e sociável', 1),
('behavior_entry', 'nervous_anxious', 'Nervoso/Ansioso', 'Demonstra sinais de stress', 2),
('behavior_entry', 'aggressive', 'Agressivo', 'Comportamento agressivo ou defensivo', 3),
('behavior_entry', 'fearful', 'Medroso', 'Muito assustado, evita contacto', 4),
('behavior_entry', 'lethargic', 'Letárgico', 'Pouco ativo, aparenta fraqueza', 5),
('behavior_entry', 'hyperactive', 'Hiperativo', 'Muito ativo, difícil de controlar', 6),

-- 5. Condição Corporal
('body_condition', 'emaciated', 'Emaciado', 'Extremamente magro, ossos visíveis', 1),
('body_condition', 'underweight', 'Abaixo do peso', 'Magro, costelas facilmente palpáveis', 2),
('body_condition', 'ideal', 'Peso ideal', 'Condição corporal adequada', 3),
('body_condition', 'overweight', 'Acima do peso', 'Ligeiramente gordo', 4),
('body_condition', 'obese', 'Obeso', 'Muito acima do peso ideal', 5),

-- 6. Tipo de Ferimento/Lesão
('injury_type', 'wound_cut', 'Ferida/Corte', 'Ferida aberta ou corte', 1),
('injury_type', 'fracture', 'Fratura', 'Osso partido ou rachado', 2),
('injury_type', 'burn', 'Queimadura', 'Lesão por calor ou químicos', 3),
('injury_type', 'bite', 'Mordedura', 'Ferida causada por mordedura', 4),
('injury_type', 'skin_condition', 'Problema de pele', 'Dermatite, sarna, etc.', 5),
('injury_type', 'eye_injury', 'Lesão ocular', 'Problema nos olhos', 6),
('injury_type', 'limping', 'Claudicação', 'Dificuldade para caminhar', 7),

-- 7. Gravidade da Lesão
('injury_severity', 'minor', 'Ligeira', 'Lesão menor, não urgente', 1),
('injury_severity', 'moderate', 'Moderada', 'Requer atenção médica', 2),
('injury_severity', 'severe', 'Grave', 'Lesão séria, cuidados urgentes', 3),
('injury_severity', 'critical', 'Crítica', 'Risco de vida, emergência', 4),

-- 8. Sinais/Sintomas
('symptoms', 'vomiting', 'Vómitos', 'Episódios de vómito', 1),
('symptoms', 'diarrhea', 'Diarreia', 'Fezes líquidas ou muito moles', 2),
('symptoms', 'coughing', 'Tosse', 'Tosse persistente', 3),
('symptoms', 'difficulty_breathing', 'Dificuldade respiratória', 'Problemas para respirar', 4),
('symptoms', 'seizures', 'Convulsões', 'Episódios convulsivos', 5),
('symptoms', 'discharge_eyes', 'Secreção ocular', 'Corrimento nos olhos', 6),
('symptoms', 'discharge_nose', 'Secreção nasal', 'Corrimento no nariz', 7),
('symptoms', 'limping', 'Claudicação', 'Dificuldade para andar', 8),
('symptoms', 'loss_appetite', 'Perda de apetite', 'Recusa alimentar', 9),

-- 9. Ações Imediatas
('immediate_actions', 'veterinary_exam', 'Exame veterinário', 'Avaliação médica completa', 1),
('immediate_actions', 'emergency_treatment', 'Tratamento de emergência', 'Cuidados médicos urgentes', 2),
('immediate_actions', 'isolation', 'Isolamento', 'Separação por precaução sanitária', 3),
('immediate_actions', 'vaccination', 'Vacinação', 'Administração de vacinas', 4),
('immediate_actions', 'deworming', 'Desparasitação', 'Tratamento antiparasitário', 5),
('immediate_actions', 'flea_treatment', 'Tratamento pulgas', 'Controlo de pulgas/carraças', 6),
('immediate_actions', 'bathing', 'Banho', 'Higienização do animal', 7),
('immediate_actions', 'feeding', 'Alimentação', 'Fornecimento de alimento adequado', 8),
('immediate_actions', 'microchip', 'Colocação de microchip', 'Identificação permanente', 9);

-- Função helper para buscar opções de configuração
CREATE OR REPLACE FUNCTION get_intake_config_options(domain_name TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  domain VARCHAR(50),
  code VARCHAR(50),
  name VARCHAR(100),
  description TEXT,
  is_active BOOLEAN,
  parent_id UUID,
  sort_order INTEGER,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ico.id,
    ico.domain,
    ico.code,
    ico.name,
    ico.description,
    ico.is_active,
    ico.parent_id,
    ico.sort_order,
    ico.metadata
  FROM public.intake_config_options ico
  WHERE (domain_name IS NULL OR ico.domain = domain_name)
    AND ico.is_active = true
  ORDER BY ico.domain, ico.sort_order, ico.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar criação
SELECT 'Tabela intake_config_options criada com sucesso' as status;
SELECT COUNT(*) as total_opcoes FROM public.intake_config_options;
SELECT domain, COUNT(*) as opcoes_por_dominio 
FROM public.intake_config_options 
GROUP BY domain 
ORDER BY domain;