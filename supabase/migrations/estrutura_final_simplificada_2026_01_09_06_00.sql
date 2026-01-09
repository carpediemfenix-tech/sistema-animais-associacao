-- REMOÇÃO ESPECÍFICA E CRIAÇÃO LIMPA
-- SEGUINDO REGRAS DE OURO: MÁXIMA SIMPLIFICAÇÃO

-- 1. LISTAR E REMOVER TODAS AS VERSÕES EXISTENTES
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Remover todas as versões de get_expanded_intake_options
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc 
        WHERE proname = 'get_expanded_intake_options'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.args || ') CASCADE';
    END LOOP;
    
    -- Remover todas as versões de get_intake_config_options
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc 
        WHERE proname = 'get_intake_config_options'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.args || ') CASCADE';
    END LOOP;
END $$;

-- 2. CRIAR FUNÇÃO PRINCIPAL SIMPLIFICADA (NOVA)
CREATE FUNCTION get_intake_options_simple()
RETURNS TABLE (
    domain text,
    code text,
    name text,
    description text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    -- Opções essenciais - sempre funcionam (REGRAS DE OURO)
    SELECT * FROM (
        VALUES 
        -- Condição geral
        ('general_condition', 'excellent', 'Excelente', 'Animal em excelente estado'),
        ('general_condition', 'good', 'Bom', 'Animal em bom estado'),
        ('general_condition', 'fair', 'Razoável', 'Animal em estado razoável'),
        ('general_condition', 'poor', 'Mau', 'Animal em mau estado'),
        ('general_condition', 'critical', 'Crítico', 'Animal em estado crítico'),
        
        -- Comportamento
        ('behavior', 'friendly', 'Amigável', 'Animal amigável'),
        ('behavior', 'shy', 'Tímido', 'Animal tímido'),
        ('behavior', 'fearful', 'Medroso', 'Animal medroso'),
        ('behavior', 'aggressive', 'Agressivo', 'Animal agressivo'),
        ('behavior', 'lethargic', 'Letárgico', 'Animal letárgico'),
        
        -- Condição corporal
        ('body_condition', 'ideal', 'Ideal (3/5)', 'Peso ideal'),
        ('body_condition', 'overweight', 'Acima do peso (4/5)', 'Acima do peso'),
        ('body_condition', 'underweight', 'Abaixo do peso (2/5)', 'Abaixo do peso'),
        ('body_condition', 'obese', 'Obeso (5/5)', 'Obeso'),
        ('body_condition', 'emaciated', 'Emaciado (1/5)', 'Emaciado'),
        
        -- Origem
        ('intake_origin', 'owner_surrender', 'Entrega pelo proprietário', 'Entregue pelo dono'),
        ('intake_origin', 'stray_found', 'Encontrado na rua', 'Encontrado abandonado'),
        ('intake_origin', 'rescue_operation', 'Operação de resgate', 'Resgatado'),
        ('intake_origin', 'transfer', 'Transferência', 'Transferido'),
        ('intake_origin', 'birth', 'Nascimento', 'Nascido na instituição'),
        
        -- Sintomas essenciais
        ('symptoms', 'lethargy', 'Letargia', 'Animal apático'),
        ('symptoms', 'dehydration', 'Desidratação', 'Desidratado'),
        ('symptoms', 'vomiting', 'Vómito', 'Vómitos'),
        ('symptoms', 'diarrhea', 'Diarreia', 'Diarreia'),
        ('symptoms', 'coughing', 'Tosse', 'Tosse'),
        ('symptoms', 'limping', 'Coxear', 'Coxeia'),
        ('symptoms', 'wounds', 'Feridas', 'Feridas'),
        ('symptoms', 'parasites', 'Parasitas', 'Parasitas'),
        ('symptoms', 'ataxia', 'Ataxia', 'Incoordenação'),
        ('symptoms', 'cyanosis', 'Cianose', 'Mucosas azuis'),
        ('symptoms', 'disorientation', 'Desorientação', 'Desorientado'),
        
        -- Ações essenciais
        ('immediate_actions', 'first_aid', 'Primeiros socorros', 'Cuidados básicos'),
        ('immediate_actions', 'veterinary_exam', 'Exame veterinário', 'Exame vet'),
        ('immediate_actions', 'wound_cleaning', 'Limpeza de feridas', 'Limpar feridas'),
        ('immediate_actions', 'pain_relief', 'Alívio da dor', 'Analgésicos'),
        ('immediate_actions', 'isolation', 'Isolamento', 'Isolar'),
        ('immediate_actions', 'bandaging', 'Enfaixamento', 'Ligaduras'),
        ('immediate_actions', 'antiseptic_application', 'Aplicação de antisséptico', 'Antisséptico'),
        ('immediate_actions', 'gastric_lavage', 'Lavagem gástrica', 'Lavagem estômago'),
        ('immediate_actions', 'hydration', 'Hidratação', 'Dar água'),
        ('immediate_actions', 'photo_documentation', 'Documentação fotográfica', 'Fotografar')
    ) AS options(domain, code, name, description);
$$;

-- 3. CRIAR ALIASES PARA COMPATIBILIDADE
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
    SELECT * FROM get_intake_options_simple();
$$;

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
    SELECT * FROM get_intake_options_simple();
$$;

-- 4. PERMISSÕES
GRANT EXECUTE ON FUNCTION get_intake_options_simple() TO authenticated;
GRANT EXECUTE ON FUNCTION get_expanded_intake_options() TO authenticated;
GRANT EXECUTE ON FUNCTION get_intake_config_options() TO authenticated;

-- 5. TESTE
SELECT 'Estrutura corrigida' as status, COUNT(*) as opcoes FROM get_intake_options_simple();
SELECT domain, COUNT(*) as total FROM get_intake_options_simple() GROUP BY domain ORDER BY domain;

-- RESULTADO: Estrutura simplificada seguindo regras de ouro