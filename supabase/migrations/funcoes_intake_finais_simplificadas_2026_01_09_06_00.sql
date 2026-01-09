-- LIMPEZA COMPLETA E CRIAÇÃO DE FUNÇÕES SIMPLIFICADAS
-- SEGUINDO REGRAS DE OURO: MÁXIMA SIMPLIFICAÇÃO

-- 1. REMOVER TODAS AS VERSÕES EXISTENTES DAS FUNÇÕES
DROP FUNCTION IF EXISTS get_expanded_intake_options() CASCADE;
DROP FUNCTION IF EXISTS get_intake_config_options() CASCADE;
DROP FUNCTION IF EXISTS get_conditional_intake_options_2026(text, text) CASCADE;
DROP FUNCTION IF EXISTS get_physical_exam_options() CASCADE;
DROP FUNCTION IF EXISTS get_behavioral_assessment_options() CASCADE;
DROP FUNCTION IF EXISTS get_care_plan_options() CASCADE;

-- 2. CRIAR FUNÇÃO PRINCIPAL SIMPLIFICADA
CREATE FUNCTION get_expanded_intake_options()
RETURNS TABLE (
    domain text,
    code text,
    name text,
    description text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    -- Opções essenciais hardcoded - sempre funcionam
    SELECT * FROM (
        VALUES 
        -- Condição geral (5 opções essenciais)
        ('general_condition', 'excellent', 'Excelente', 'Animal em excelente estado geral'),
        ('general_condition', 'good', 'Bom', 'Animal em bom estado geral'),
        ('general_condition', 'fair', 'Razoável', 'Animal em estado razoável'),
        ('general_condition', 'poor', 'Mau', 'Animal em mau estado'),
        ('general_condition', 'critical', 'Crítico', 'Animal em estado crítico'),
        
        -- Comportamento (5 opções essenciais)
        ('behavior', 'friendly', 'Amigável', 'Animal amigável e sociável'),
        ('behavior', 'shy', 'Tímido', 'Animal tímido mas não agressivo'),
        ('behavior', 'fearful', 'Medroso', 'Animal com medo'),
        ('behavior', 'aggressive', 'Agressivo', 'Animal com comportamento agressivo'),
        ('behavior', 'lethargic', 'Letárgico', 'Animal apático ou letárgico'),
        
        -- Condição corporal (5 opções essenciais)
        ('body_condition', 'obese', 'Obeso (5/5)', 'Condição corporal 5/5'),
        ('body_condition', 'overweight', 'Acima do peso (4/5)', 'Condição corporal 4/5'),
        ('body_condition', 'ideal', 'Ideal (3/5)', 'Condição corporal 3/5'),
        ('body_condition', 'underweight', 'Abaixo do peso (2/5)', 'Condição corporal 2/5'),
        ('body_condition', 'emaciated', 'Emaciado (1/5)', 'Condição corporal 1/5'),
        
        -- Origem (5 opções essenciais)
        ('intake_origin', 'owner_surrender', 'Entrega pelo proprietário', 'Animal entregue pelo proprietário'),
        ('intake_origin', 'stray_found', 'Encontrado na rua', 'Animal encontrado abandonado'),
        ('intake_origin', 'rescue_operation', 'Operação de resgate', 'Animal resgatado em operação'),
        ('intake_origin', 'transfer', 'Transferência', 'Animal transferido de outra instituição'),
        ('intake_origin', 'birth', 'Nascimento', 'Animal nascido na instituição'),
        
        -- Razão (5 opções essenciais)
        ('intake_reason', 'abandonment', 'Abandono', 'Animal abandonado'),
        ('intake_reason', 'owner_unable', 'Proprietário incapaz', 'Proprietário não consegue cuidar'),
        ('intake_reason', 'behavioral_issues', 'Problemas comportamentais', 'Problemas de comportamento'),
        ('intake_reason', 'medical_issues', 'Problemas médicos', 'Problemas de saúde'),
        ('intake_reason', 'overpopulation', 'Sobrepopulação', 'Controlo de população'),
        
        -- Sintomas (10 mais importantes apenas)
        ('symptoms', 'lethargy', 'Letargia', 'Animal apático'),
        ('symptoms', 'dehydration', 'Desidratação', 'Sinais de desidratação'),
        ('symptoms', 'vomiting', 'Vómito', 'Episódios de vómito'),
        ('symptoms', 'diarrhea', 'Diarreia', 'Fezes líquidas'),
        ('symptoms', 'coughing', 'Tosse', 'Tosse persistente'),
        ('symptoms', 'limping', 'Coxear', 'Dificuldade de locomoção'),
        ('symptoms', 'wounds', 'Feridas', 'Feridas visíveis'),
        ('symptoms', 'parasites', 'Parasitas', 'Presença de parasitas'),
        ('symptoms', 'ataxia', 'Ataxia', 'Incoordenação motora'),
        ('symptoms', 'cyanosis', 'Cianose', 'Mucosas azuladas'),
        ('symptoms', 'disorientation', 'Desorientação', 'Animal desorientado'),
        
        -- Ações imediatas (10 mais importantes apenas)
        ('immediate_actions', 'first_aid', 'Primeiros socorros', 'Cuidados imediatos'),
        ('immediate_actions', 'veterinary_exam', 'Exame veterinário', 'Avaliação veterinária'),
        ('immediate_actions', 'wound_cleaning', 'Limpeza de feridas', 'Tratamento de feridas'),
        ('immediate_actions', 'pain_relief', 'Alívio da dor', 'Medicação para dor'),
        ('immediate_actions', 'isolation', 'Isolamento', 'Isolamento preventivo'),
        ('immediate_actions', 'bandaging', 'Enfaixamento', 'Aplicação de ligaduras'),
        ('immediate_actions', 'antiseptic_application', 'Aplicação de antisséptico', 'Desinfeção'),
        ('immediate_actions', 'gastric_lavage', 'Lavagem gástrica', 'Limpeza do estômago'),
        ('immediate_actions', 'hydration', 'Hidratação', 'Fornecimento de fluidos'),
        ('immediate_actions', 'photo_documentation', 'Documentação fotográfica', 'Registo fotográfico')
    ) AS options(domain, code, name, description);
$$;

-- 3. CRIAR FUNÇÃO DE COMPATIBILIDADE
CREATE FUNCTION get_intake_config_options()
RETURNS TABLE (
    domain text,
    code text,
    name text,
    description text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM get_expanded_intake_options();
$$;

-- 4. GARANTIR PERMISSÕES
GRANT EXECUTE ON FUNCTION get_expanded_intake_options() TO authenticated;
GRANT EXECUTE ON FUNCTION get_intake_config_options() TO authenticated;

-- 5. TESTAR
SELECT 'Funções criadas' as status, COUNT(*) as total FROM get_expanded_intake_options();

-- 6. COMENTÁRIOS
COMMENT ON FUNCTION get_expanded_intake_options IS 'Função simplificada - opções essenciais hardcoded (regras de ouro)';
COMMENT ON FUNCTION get_intake_config_options IS 'Função de compatibilidade';

-- RESULTADO: Estrutura mínima, sempre funciona, zero dependências