-- FASE 1: ESTRUTURA BASE - TABELAS DE CONFIGURAÇÃO
-- Criar tabelas para todas as opções configuráveis da ficha de admissão

-- 1. Tabela genérica para configurações por domínio
CREATE TABLE IF NOT EXISTS public.intake_config_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain VARCHAR(50) NOT NULL, -- ex: 'intake_origin', 'intake_reason', etc.
    code VARCHAR(50) NOT NULL, -- código único dentro do domínio
    name VARCHAR(100) NOT NULL, -- nome para exibição
    description TEXT, -- descrição opcional
    sort_order INTEGER DEFAULT 0, -- ordem de exibição
    is_active BOOLEAN DEFAULT true, -- ativo/inativo
    parent_id UUID REFERENCES intake_config_options(id), -- para dependências
    metadata JSONB, -- dados adicionais (cores, ícones, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(domain, code),
    CHECK (domain ~ '^[a-z_]+$'), -- apenas letras minúsculas e underscore
    CHECK (code ~ '^[a-z0-9_]+$') -- apenas letras, números e underscore
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_intake_config_domain ON intake_config_options(domain);
CREATE INDEX IF NOT EXISTS idx_intake_config_active ON intake_config_options(is_active);
CREATE INDEX IF NOT EXISTS idx_intake_config_sort ON intake_config_options(domain, sort_order);
CREATE INDEX IF NOT EXISTS idx_intake_config_parent ON intake_config_options(parent_id);

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_intake_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_intake_config_updated_at
    BEFORE UPDATE ON intake_config_options
    FOR EACH ROW
    EXECUTE FUNCTION update_intake_config_updated_at();

-- 4. RLS (Row Level Security)
ALTER TABLE intake_config_options ENABLE ROW LEVEL SECURITY;

-- Política: Leitura para todos autenticados
CREATE POLICY "intake_config_read" ON intake_config_options
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política: Escrita apenas para admins
CREATE POLICY "intake_config_write" ON intake_config_options
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'perfil' = 'administrador'
        )
    );

-- 5. Inserir dados padrão para todos os domínios
INSERT INTO intake_config_options (domain, code, name, description, sort_order) VALUES
-- Origem/Encaminhamento
('intake_origin', 'particular', 'Particular', 'Entregue por particular', 1),
('intake_origin', 'municipio', 'Município', 'Encaminhado pelo município', 2),
('intake_origin', 'sepna_gnr', 'SEPNA/GNR', 'Recolhido por SEPNA ou GNR', 3),
('intake_origin', 'psp', 'PSP', 'Recolhido pela PSP', 4),
('intake_origin', 'clinica_vet', 'Clínica/Hospital Veterinário', 'Encaminhado por clínica veterinária', 5),
('intake_origin', 'outra_associacao', 'Outra Associação', 'Transferido de outra associação', 6),
('intake_origin', 'outro', 'Outro', 'Outra origem não especificada', 7),

-- Motivo de Entrada
('intake_reason', 'errante', 'Errante', 'Animal encontrado errante', 1),
('intake_reason', 'abandono', 'Abandono', 'Animal abandonado', 2),
('intake_reason', 'entrega_voluntaria', 'Entrega Voluntária', 'Entregue voluntariamente pelo tutor', 3),
('intake_reason', 'atropelamento', 'Atropelamento', 'Animal atropelado', 4),
('intake_reason', 'maus_tratos', 'Maus-tratos Suspeitos', 'Suspeita de maus-tratos', 5),
('intake_reason', 'doenca_evidente', 'Doença Evidente', 'Animal com doença evidente', 6),
('intake_reason', 'ninhada', 'Ninhada', 'Ninhada de animais', 7),
('intake_reason', 'outro', 'Outro', 'Outro motivo não especificado', 8),

-- Estado Geral à Entrada
('general_condition', 'bom', 'Bom', 'Estado geral bom', 1),
('general_condition', 'razoavel', 'Razoável', 'Estado geral razoável', 2),
('general_condition', 'mau', 'Mau', 'Estado geral mau', 3),
('general_condition', 'critico', 'Crítico', 'Estado crítico', 4),

-- Nível de Consciência
('consciousness_level', 'alerta', 'Alerta', 'Animal alerta e responsivo', 1),
('consciousness_level', 'apatico', 'Apático', 'Animal apático', 2),
('consciousness_level', 'prostrado', 'Prostrado', 'Animal prostrado', 3),
('consciousness_level', 'outro', 'Outro', 'Outro nível de consciência', 4),

-- Comportamento (multi-select)
('behavior_flags', 'calmo', 'Calmo', 'Comportamento calmo', 1),
('behavior_flags', 'assustado', 'Assustado', 'Animal assustado', 2),
('behavior_flags', 'agressivo', 'Agressivo', 'Comportamento agressivo', 3),
('behavior_flags', 'dor_evidente', 'Dor Evidente', 'Sinais evidentes de dor', 4),
('behavior_flags', 'muito_debilitado', 'Muito Debilitado', 'Animal muito debilitado', 5),
('behavior_flags', 'outro', 'Outro', 'Outro comportamento', 6),

-- Condição Corporal (BCS 1-5)
('body_condition', 'bcs_1', 'BCS 1 - Muito Magro', 'Condição corporal 1 (muito magro)', 1),
('body_condition', 'bcs_2', 'BCS 2 - Magro', 'Condição corporal 2 (magro)', 2),
('body_condition', 'bcs_3', 'BCS 3 - Ideal', 'Condição corporal 3 (ideal)', 3),
('body_condition', 'bcs_4', 'BCS 4 - Sobrepeso', 'Condição corporal 4 (sobrepeso)', 4),
('body_condition', 'bcs_5', 'BCS 5 - Obeso', 'Condição corporal 5 (obeso)', 5),

-- Mucosas
('mucosa_status', 'normais', 'Normais', 'Mucosas normais', 1),
('mucosa_status', 'palidas', 'Pálidas', 'Mucosas pálidas', 2),
('mucosa_status', 'cianoticas', 'Cianóticas', 'Mucosas cianóticas', 3),
('mucosa_status', 'outra', 'Outra', 'Outra condição das mucosas', 4),

-- Hidratação
('hydration_level', 'normal', 'Normal', 'Hidratação normal', 1),
('hydration_level', 'leve', 'Desidratação Leve', 'Desidratação leve', 2),
('hydration_level', 'moderada', 'Desidratação Moderada', 'Desidratação moderada', 3),
('hydration_level', 'grave', 'Desidratação Grave', 'Desidratação grave', 4),

-- Mobilidade
('mobility_status', 'normal', 'Normal', 'Mobilidade normal', 1),
('mobility_status', 'claudicacao', 'Claudicação', 'Animal com claudicação', 2),
('mobility_status', 'nao_apoia', 'Não Apoia', 'Não apoia membro(s)', 3),
('mobility_status', 'outra', 'Outra', 'Outra condição de mobilidade', 4);

-- 6. Continuar com mais domínios...
INSERT INTO intake_config_options (domain, code, name, description, sort_order) VALUES
-- Pele/Pelo (multi-select)
('skin_coat_flags', 'normal', 'Normal', 'Pele e pelo normais', 1),
('skin_coat_flags', 'feridas', 'Feridas', 'Presença de feridas', 2),
('skin_coat_flags', 'dermatite', 'Dermatite', 'Sinais de dermatite', 3),
('skin_coat_flags', 'sarna_suspeita', 'Sarna Suspeita', 'Suspeita de sarna', 4),
('skin_coat_flags', 'alopecia', 'Alopécia', 'Áreas de alopécia', 5),
('skin_coat_flags', 'outro', 'Outro', 'Outra condição da pele/pelo', 6),

-- Olhos (multi-select)
('eyes_flags', 'normal', 'Normal', 'Olhos normais', 1),
('eyes_flags', 'secrecao', 'Secreção', 'Presença de secreção', 2),
('eyes_flags', 'vermelhidao', 'Vermelhidão', 'Vermelhidão ocular', 3),
('eyes_flags', 'lesao', 'Lesão', 'Lesão ocular', 4),
('eyes_flags', 'outro', 'Outro', 'Outra condição ocular', 5),

-- Ouvidos (multi-select)
('ears_flags', 'normal', 'Normal', 'Ouvidos normais', 1),
('ears_flags', 'otite_suspeita', 'Otite Suspeita', 'Suspeita de otite', 2),
('ears_flags', 'parasitas', 'Parasitas', 'Presença de parasitas', 3),
('ears_flags', 'lesao', 'Lesão', 'Lesão no ouvido', 4),
('ears_flags', 'outro', 'Outro', 'Outra condição do ouvido', 5),

-- Boca/Dentes (multi-select)
('mouth_flags', 'normal', 'Normal', 'Boca e dentes normais', 1),
('mouth_flags', 'lesoes', 'Lesões', 'Lesões na boca', 2),
('mouth_flags', 'gengivite', 'Gengivite', 'Sinais de gengivite', 3),
('mouth_flags', 'mau_halito', 'Mau Hálito', 'Halitose', 4),
('mouth_flags', 'outro', 'Outro', 'Outra condição bucal', 5),

-- Abdómen
('abdomen_status', 'normal', 'Normal', 'Abdómen normal', 1),
('abdomen_status', 'dor', 'Dor', 'Sinais de dor abdominal', 2),
('abdomen_status', 'distensao', 'Distensão', 'Distensão abdominal', 3),
('abdomen_status', 'outro', 'Outro', 'Outra condição abdominal', 4),

-- Fezes/Urina (multi-select)
('excretion_flags', 'normal', 'Normal', 'Fezes e urina normais', 1),
('excretion_flags', 'diarreia', 'Diarreia', 'Presença de diarreia', 2),
('excretion_flags', 'sangue', 'Sangue', 'Presença de sangue', 3),
('excretion_flags', 'vomitos', 'Vómitos', 'Episódios de vómito', 4),
('excretion_flags', 'nao_observado', 'Não Observado', 'Não foi observado', 5),
('excretion_flags', 'outro', 'Outro', 'Outra condição', 6),

-- Tipos de Lesão
('injury_type', 'corte', 'Corte', 'Ferimento cortante', 1),
('injury_type', 'perfuracao', 'Perfuração', 'Ferimento perfurante', 2),
('injury_type', 'laceracao', 'Laceração', 'Laceração', 3),
('injury_type', 'queimadura', 'Queimadura', 'Queimadura', 4),
('injury_type', 'fratura_suspeita', 'Fratura Suspeita', 'Suspeita de fratura', 5),
('injury_type', 'mordedura', 'Mordedura', 'Mordedura', 6),
('injury_type', 'outro', 'Outro', 'Outro tipo de lesão', 7),

-- Localização Corporal
('body_location', 'cabeca', 'Cabeça', 'Região da cabeça', 1),
('body_location', 'pescoco', 'Pescoço', 'Região do pescoço', 2),
('body_location', 'tronco', 'Tronco', 'Região do tronco', 3),
('body_location', 'membros_anteriores', 'Membros Anteriores', 'Membros anteriores', 4),
('body_location', 'membros_posteriores', 'Membros Posteriores', 'Membros posteriores', 5),
('body_location', 'cauda', 'Cauda', 'Região da cauda', 6),
('body_location', 'outra', 'Outra', 'Outra localização', 7),

-- Gravidade da Lesão
('injury_severity', 'leve', 'Leve', 'Lesão leve', 1),
('injury_severity', 'moderada', 'Moderada', 'Lesão moderada', 2),
('injury_severity', 'grave', 'Grave', 'Lesão grave', 3),

-- Sinais e Sintomas (checklist)
('symptom_flags', 'tosse', 'Tosse', 'Presença de tosse', 1),
('symptom_flags', 'espirros', 'Espirros', 'Episódios de espirros', 2),
('symptom_flags', 'secrecoes', 'Secreções', 'Presença de secreções', 3),
('symptom_flags', 'vomitos', 'Vómitos', 'Episódios de vómito', 4),
('symptom_flags', 'diarreia', 'Diarreia', 'Presença de diarreia', 5),
('symptom_flags', 'claudicacao', 'Claudicação', 'Claudicação', 6),
('symptom_flags', 'prurido', 'Prurido', 'Sinais de prurido', 7),
('symptom_flags', 'convulsoes', 'Convulsões', 'Episódios convulsivos', 8),
('symptom_flags', 'febre_suspeita', 'Febre Suspeita', 'Suspeita de febre', 9),
('symptom_flags', 'dor_evidente', 'Dor Evidente', 'Sinais evidentes de dor', 10),
('symptom_flags', 'emagrecimento_extremo', 'Emagrecimento Extremo', 'Emagrecimento severo', 11),
('symptom_flags', 'nao_come', 'Não Come', 'Recusa alimentar', 12),
('symptom_flags', 'nao_bebe', 'Não Bebe', 'Recusa hídrica', 13);

-- 7. Verificar dados inseridos
SELECT 
    domain,
    COUNT(*) as total_options,
    COUNT(CASE WHEN is_active THEN 1 END) as active_options
FROM intake_config_options 
GROUP BY domain 
ORDER BY domain;

-- 8. Função para buscar opções por domínio
CREATE OR REPLACE FUNCTION get_intake_config_options(p_domain TEXT)
RETURNS TABLE (
    id UUID,
    code VARCHAR(50),
    name VARCHAR(100),
    description TEXT,
    sort_order INTEGER,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ico.id,
        ico.code,
        ico.name,
        ico.description,
        ico.sort_order,
        ico.metadata
    FROM intake_config_options ico
    WHERE ico.domain = p_domain
    AND ico.is_active = true
    ORDER BY ico.sort_order, ico.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Confirmar criação
DO $$
DECLARE
    total_domains INTEGER;
    total_options INTEGER;
BEGIN
    SELECT COUNT(DISTINCT domain) INTO total_domains FROM intake_config_options;
    SELECT COUNT(*) INTO total_options FROM intake_config_options;
    
    RAISE NOTICE '✅ TABELAS DE CONFIGURAÇÃO CRIADAS COM SUCESSO!';
    RAISE NOTICE 'Total de domínios: %', total_domains;
    RAISE NOTICE 'Total de opções: %', total_options;
    RAISE NOTICE 'Função get_intake_config_options() criada';
    RAISE NOTICE 'RLS configurado para segurança';
END;
$$;