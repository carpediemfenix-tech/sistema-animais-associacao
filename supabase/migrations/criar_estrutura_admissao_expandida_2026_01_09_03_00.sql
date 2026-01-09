-- Criar estrutura completa para ficha de admissão expandida
-- Mantém total compatibilidade com sistema existente

-- 1. CRIAR TABELA DE OPÇÕES DE CONFIGURAÇÃO DE ADMISSÃO
CREATE TABLE IF NOT EXISTS intake_config_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain TEXT NOT NULL, -- 'symptoms', 'immediate_actions', 'intake_origin', 'intake_reason', etc.
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain, code)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_intake_config_domain ON intake_config_options(domain);
CREATE INDEX IF NOT EXISTS idx_intake_config_active ON intake_config_options(active);
CREATE INDEX IF NOT EXISTS idx_intake_config_order ON intake_config_options(display_order);

-- 3. INSERIR OPÇÕES BÁSICAS (compatibilidade com sistema atual)
INSERT INTO intake_config_options (domain, code, name, description, active, display_order) VALUES

-- ORIGENS BÁSICAS (manter compatibilidade)
('intake_origin', 'owner_surrender', 'Entrega pelo proprietário', 'Animal entregue voluntariamente pelo dono', true, 1),
('intake_origin', 'stray', 'Encontrado na rua', 'Animal encontrado errante', true, 2),
('intake_origin', 'rescue', 'Resgate', 'Animal resgatado de situação de perigo', true, 3),
('intake_origin', 'transfer', 'Transferência', 'Transferido de outra instituição', true, 4),
('intake_origin', 'birth', 'Nascimento', 'Nasceu na instituição ou família de acolhimento', true, 5),

-- RAZÕES BÁSICAS (manter compatibilidade)
('intake_reason', 'emergency', 'Emergência médica', 'Necessita cuidados médicos urgentes', true, 1),
('intake_reason', 'behavioral', 'Problemas comportamentais', 'Questões de comportamento', true, 2),
('intake_reason', 'abandonment', 'Abandono', 'Animal abandonado', true, 3),
('intake_reason', 'neglect', 'Negligência', 'Cuidados inadequados', true, 4),
('intake_reason', 'overpopulation', 'Sobrepopulação', 'Excesso de animais', true, 5),

-- CONDIÇÕES GERAIS BÁSICAS
('general_condition', 'excellent', 'Excelente', 'Animal em ótimo estado geral', true, 1),
('general_condition', 'good', 'Bom', 'Animal em bom estado geral', true, 2),
('general_condition', 'fair', 'Razoável', 'Animal com alguns problemas menores', true, 3),
('general_condition', 'poor', 'Mau', 'Animal em estado preocupante', true, 4),
('general_condition', 'critical', 'Crítico', 'Animal em estado crítico', true, 5),

-- COMPORTAMENTOS BÁSICOS
('behavior_entry', 'friendly', 'Amigável', 'Comportamento sociável e calmo', true, 1),
('behavior_entry', 'fearful', 'Medroso', 'Demonstra medo mas não agressividade', true, 2),
('behavior_entry', 'aggressive', 'Agressivo', 'Comportamento agressivo', true, 3),
('behavior_entry', 'withdrawn', 'Retraído', 'Evita contacto, isolado', true, 4),
('behavior_entry', 'hyperactive', 'Hiperativo', 'Muito ativo, inquieto', true, 5),

-- CONDIÇÕES CORPORAIS BÁSICAS
('body_condition', 'obese', 'Obeso', 'Excesso de peso significativo', true, 1),
('body_condition', 'overweight', 'Acima do peso', 'Ligeiramente acima do peso ideal', true, 2),
('body_condition', 'ideal', 'Ideal', 'Peso e condição corporal ideais', true, 3),
('body_condition', 'underweight', 'Abaixo do peso', 'Ligeiramente abaixo do peso ideal', true, 4),
('body_condition', 'emaciated', 'Emaciado', 'Severamente abaixo do peso', true, 5),

-- SINTOMAS BÁSICOS
('symptoms', 'lethargy', 'Letargia', 'Falta de energia, apatia', true, 1),
('symptoms', 'vomiting', 'Vómitos', 'Episódios de vómito', true, 2),
('symptoms', 'diarrhea', 'Diarreia', 'Fezes líquidas ou pastosas', true, 3),
('symptoms', 'coughing', 'Tosse', 'Tosse persistente', true, 4),
('symptoms', 'limping', 'Claudicação', 'Dificuldade em caminhar', true, 5),
('symptoms', 'wounds', 'Feridas', 'Lesões cutâneas visíveis', true, 6),
('symptoms', 'discharge_eyes', 'Secreção ocular', 'Corrimento dos olhos', true, 7),
('symptoms', 'discharge_nose', 'Secreção nasal', 'Corrimento do nariz', true, 8),
('symptoms', 'difficulty_breathing', 'Dificuldade respiratória', 'Respiração laboriosa', true, 9),
('symptoms', 'loss_appetite', 'Perda de apetite', 'Recusa alimentar', true, 10),

-- AÇÕES IMEDIATAS BÁSICAS
('immediate_actions', 'veterinary_exam', 'Exame veterinário', 'Avaliação médica completa', true, 1),
('immediate_actions', 'pain_relief', 'Alívio da dor', 'Administração de analgésicos', true, 2),
('immediate_actions', 'wound_care', 'Cuidados com feridas', 'Limpeza e tratamento de lesões', true, 3),
('immediate_actions', 'isolation', 'Isolamento', 'Separação por precaução', true, 4),
('immediate_actions', 'feeding', 'Alimentação', 'Fornecimento de alimento adequado', true, 5),
('immediate_actions', 'hydration', 'Hidratação', 'Fornecimento de água/fluidos', true, 6),
('immediate_actions', 'vaccination', 'Vacinação', 'Administração de vacinas', true, 7),
('immediate_actions', 'deworming', 'Desparasitação', 'Tratamento antiparasitário', true, 8),
('immediate_actions', 'identification', 'Identificação', 'Colocação de chip/coleira', true, 9),
('immediate_actions', 'documentation', 'Documentação', 'Registo fotográfico/médico', true, 10);

-- 4. CRIAR FUNÇÃO RPC PARA OBTER OPÇÕES (compatibilidade)
CREATE OR REPLACE FUNCTION get_intake_config_options()
RETURNS TABLE (
    domain TEXT,
    code TEXT,
    name TEXT,
    description TEXT,
    display_order INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ico.domain,
        ico.code,
        ico.name,
        ico.description,
        ico.display_order
    FROM intake_config_options ico
    WHERE ico.active = true
    ORDER BY ico.domain, ico.display_order, ico.name;
END;
$$;

-- 5. VERIFICAR SE TABELA ANIMAL_INTAKE_ASSESSMENTS EXISTE E TEM ESTRUTURA ADEQUADA
DO $$
BEGIN
    -- Verificar se a tabela existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'animal_intake_assessments') THEN
        -- Criar tabela se não existir
        CREATE TABLE animal_intake_assessments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
            assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            assessed_by UUID REFERENCES voluntarios(id),
            intake_origin TEXT,
            intake_reason TEXT,
            circumstances_details TEXT,
            general_condition TEXT,
            behavior_entry TEXT,
            body_condition TEXT,
            weight_kg DECIMAL(5,2),
            temperature_celsius DECIMAL(4,1),
            symptoms JSONB DEFAULT '[]'::jsonb,
            physical_exam_notes TEXT,
            behavioral_notes TEXT,
            immediate_actions JSONB DEFAULT '[]'::jsonb,
            immediate_actions_notes TEXT,
            prognosis TEXT,
            treatment_plan TEXT,
            special_needs TEXT,
            is_complete BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_animal_intake_animal_id ON animal_intake_assessments(animal_id);
        CREATE INDEX idx_animal_intake_date ON animal_intake_assessments(assessment_date);
        CREATE INDEX idx_animal_intake_complete ON animal_intake_assessments(is_complete);
    END IF;
END
$$;

-- 6. CRIAR POLÍTICAS RLS BÁSICAS
ALTER TABLE intake_config_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_intake_assessments ENABLE ROW LEVEL SECURITY;

-- Política para leitura das opções de configuração (todos podem ler)
CREATE POLICY "Todos podem ler opções de configuração" ON intake_config_options
    FOR SELECT USING (true);

-- Política para fichas de admissão (apenas utilizadores autenticados)
CREATE POLICY "Utilizadores autenticados podem gerir fichas" ON animal_intake_assessments
    FOR ALL USING (auth.role() = 'authenticated');

-- 7. COMENTÁRIOS
COMMENT ON TABLE intake_config_options IS 'Opções de configuração para fichas de admissão';
COMMENT ON TABLE animal_intake_assessments IS 'Fichas de admissão/avaliação inicial dos animais';
COMMENT ON FUNCTION get_intake_config_options IS 'Retorna todas as opções de configuração ativas para fichas de admissão';

-- 8. VERIFICAÇÃO FINAL
SELECT 
    'intake_config_options' as tabela,
    COUNT(*) as total_registos
FROM intake_config_options
UNION ALL
SELECT 
    'animal_intake_assessments' as tabela,
    COUNT(*) as total_registos
FROM animal_intake_assessments;