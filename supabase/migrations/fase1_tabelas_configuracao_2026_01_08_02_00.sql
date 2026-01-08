-- ===== FASE 1: TABELAS DE CONFIGURAÇÃO PARA FICHA DE ADMISSÃO =====
-- Data: 2026-01-08 02:00 UTC
-- Descrição: Criar tabela de configuração para opções da ficha de admissão

-- Tabela principal de configuração de opções
CREATE TABLE IF NOT EXISTS public.intake_config_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(50) NOT NULL, -- Domínio da opção (intake_origin, intake_reason, etc.)
    code VARCHAR(100) NOT NULL, -- Código único da opção
    name VARCHAR(200) NOT NULL, -- Nome da opção
    description TEXT, -- Descrição opcional
    is_active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES public.intake_config_options(id), -- Para opções hierárquicas
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}', -- Metadados adicionais
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_intake_config_domain ON public.intake_config_options(domain);
CREATE INDEX IF NOT EXISTS idx_intake_config_active ON public.intake_config_options(is_active);
CREATE INDEX IF NOT EXISTS idx_intake_config_sort ON public.intake_config_options(domain, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_intake_config_domain_code ON public.intake_config_options(domain, code);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_intake_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_intake_config_updated_at ON public.intake_config_options;
CREATE TRIGGER trigger_update_intake_config_updated_at
    BEFORE UPDATE ON public.intake_config_options
    FOR EACH ROW EXECUTE FUNCTION public.update_intake_config_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.intake_config_options ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "intake_config_select_policy" ON public.intake_config_options;
CREATE POLICY "intake_config_select_policy" ON public.intake_config_options
    FOR SELECT USING (true); -- Todos podem ler

DROP POLICY IF EXISTS "intake_config_insert_policy" ON public.intake_config_options;
CREATE POLICY "intake_config_insert_policy" ON public.intake_config_options
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "intake_config_update_policy" ON public.intake_config_options;
CREATE POLICY "intake_config_update_policy" ON public.intake_config_options
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "intake_config_delete_policy" ON public.intake_config_options;
CREATE POLICY "intake_config_delete_policy" ON public.intake_config_options
    FOR DELETE USING (auth.role() = 'authenticated');

-- Inserir dados padrão
INSERT INTO public.intake_config_options (domain, code, name, description, sort_order) VALUES
-- Origem da Admissão
('intake_origin', 'found_street', 'Encontrado na Rua', 'Animal encontrado abandonado na via pública', 1),
('intake_origin', 'owner_surrender', 'Entregue pelo Dono', 'Proprietário entregou voluntariamente', 2),
('intake_origin', 'rescue_operation', 'Operação de Resgate', 'Resgatado em operação oficial', 3),
('intake_origin', 'transfer_shelter', 'Transferência de Abrigo', 'Transferido de outro abrigo ou associação', 4),
('intake_origin', 'born_shelter', 'Nascido no Abrigo', 'Animal nasceu nas instalações', 5),

-- Razão da Admissão
('intake_reason', 'abandonment', 'Abandono', 'Animal abandonado pelo proprietário', 1),
('intake_reason', 'stray', 'Vadio', 'Animal errante sem dono conhecido', 2),
('intake_reason', 'abuse_neglect', 'Maus-tratos/Negligência', 'Vítima de maus-tratos ou negligência', 3),
('intake_reason', 'medical_emergency', 'Emergência Médica', 'Necessita cuidados médicos urgentes', 4),
('intake_reason', 'behavioral_issues', 'Problemas Comportamentais', 'Problemas de comportamento', 5),
('intake_reason', 'owner_death', 'Morte do Proprietário', 'Proprietário faleceu', 6),
('intake_reason', 'financial_hardship', 'Dificuldades Financeiras', 'Proprietário sem condições financeiras', 7),

-- Estado Geral
('general_condition', 'excellent', 'Excelente', 'Animal em ótimo estado geral', 1),
('general_condition', 'good', 'Bom', 'Animal em bom estado geral', 2),
('general_condition', 'fair', 'Razoável', 'Estado geral aceitável com algumas preocupações', 3),
('general_condition', 'poor', 'Mau', 'Estado geral preocupante', 4),
('general_condition', 'critical', 'Crítico', 'Estado crítico, necessita cuidados imediatos', 5),

-- Comportamento na Entrada
('behavior_entry', 'calm_friendly', 'Calmo e Amigável', 'Comportamento dócil e sociável', 1),
('behavior_entry', 'nervous_anxious', 'Nervoso/Ansioso', 'Demonstra sinais de stress ou ansiedade', 2),
('behavior_entry', 'aggressive', 'Agressivo', 'Comportamento agressivo ou defensivo', 3),
('behavior_entry', 'fearful', 'Medroso', 'Muito assustado, evita contacto', 4),
('behavior_entry', 'lethargic', 'Letárgico', 'Pouco ativo, aparenta fraqueza', 5),
('behavior_entry', 'hyperactive', 'Hiperativo', 'Muito ativo ou agitado', 6),

-- Condição Corporal
('body_condition', 'underweight', 'Abaixo do Peso', 'Magro, costelas visíveis', 1),
('body_condition', 'ideal', 'Peso Ideal', 'Peso corporal adequado', 2),
('body_condition', 'overweight', 'Acima do Peso', 'Ligeiramente acima do peso ideal', 3),
('body_condition', 'obese', 'Obeso', 'Significativamente acima do peso', 4),
('body_condition', 'emaciated', 'Emaciado', 'Extremamente magro, desnutrido', 5),

-- Tipos de Lesão
('injury_type', 'wound_cut', 'Ferida/Corte', 'Ferida aberta ou corte', 1),
('injury_type', 'fracture', 'Fratura', 'Osso partido ou rachado', 2),
('injury_type', 'bruise', 'Contusão', 'Hematoma ou contusão', 3),
('injury_type', 'burn', 'Queimadura', 'Lesão por queimadura', 4),
('injury_type', 'bite', 'Mordida', 'Ferida causada por mordida', 5),
('injury_type', 'skin_condition', 'Problema de Pele', 'Dermatite, sarna, etc.', 6),

-- Severidade da Lesão
('injury_severity', 'minor', 'Ligeira', 'Lesão menor, não crítica', 1),
('injury_severity', 'moderate', 'Moderada', 'Lesão que requer atenção médica', 2),
('injury_severity', 'severe', 'Grave', 'Lesão séria que requer tratamento urgente', 3),
('injury_severity', 'critical', 'Crítica', 'Lesão que ameaça a vida', 4),

-- Sintomas
('symptoms', 'vomiting', 'Vómitos', 'Episódios de vómito', 1),
('symptoms', 'diarrhea', 'Diarreia', 'Fezes líquidas ou frequentes', 2),
('symptoms', 'coughing', 'Tosse', 'Tosse persistente', 3),
('symptoms', 'difficulty_breathing', 'Dificuldade Respiratória', 'Problemas para respirar', 4),
('symptoms', 'limping', 'Coxear', 'Dificuldade para caminhar', 5),
('symptoms', 'seizures', 'Convulsões', 'Episódios convulsivos', 6),
('symptoms', 'discharge_eyes', 'Secreção Ocular', 'Secreção nos olhos', 7),
('symptoms', 'discharge_nose', 'Secreção Nasal', 'Secreção no nariz', 8),

-- Ações Imediatas
('immediate_actions', 'veterinary_exam', 'Exame Veterinário', 'Exame médico veterinário completo', 1),
('immediate_actions', 'pain_medication', 'Medicação para Dor', 'Administração de analgésicos', 2),
('immediate_actions', 'wound_cleaning', 'Limpeza de Feridas', 'Limpeza e desinfeção de feridas', 3),
('immediate_actions', 'isolation', 'Isolamento', 'Colocado em isolamento preventivo', 4),
('immediate_actions', 'fluid_therapy', 'Fluidoterapia', 'Administração de fluidos intravenosos', 5),
('immediate_actions', 'vaccination', 'Vacinação', 'Administração de vacinas', 6),
('immediate_actions', 'deworming', 'Desparasitação', 'Tratamento antiparasitário', 7),
('immediate_actions', 'grooming', 'Higienização', 'Banho e limpeza geral', 8)
ON CONFLICT (domain, code) DO NOTHING;

-- Função para buscar opções de configuração
CREATE OR REPLACE FUNCTION public.get_intake_config_options(
    p_domain TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    domain VARCHAR(50),
    code VARCHAR(100),
    name VARCHAR(200),
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
    WHERE (p_domain IS NULL OR ico.domain = p_domain)
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