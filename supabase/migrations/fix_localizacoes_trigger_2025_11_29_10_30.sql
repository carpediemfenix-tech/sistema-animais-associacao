-- CORREÇÃO COMPLETA DO SISTEMA DE LOCALIZAÇÕES
-- Data: 2025-11-29 10:30

-- 1. Verificar dados atuais na tabela
SELECT 
    animal_id,
    tipo_localizacao,
    data_inicio,
    ativo,
    created_at,
    'DIAGNÓSTICO INICIAL' as status
FROM localizacoes_animal 
WHERE animal_id = '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b'
ORDER BY data_inicio DESC;

-- 2. Recriar a função do trigger (versão corrigida)
CREATE OR REPLACE FUNCTION garantir_localizacao_unica()
RETURNS TRIGGER AS $$
BEGIN
    -- Desativar todas as localizações anteriores do mesmo animal
    UPDATE localizacoes_animal 
    SET 
        ativo = false,
        data_fim = CURRENT_DATE
    WHERE 
        animal_id = NEW.animal_id 
        AND id != NEW.id 
        AND ativo = true;
    
    -- Garantir que a nova localização está ativa
    NEW.ativo = true;
    NEW.data_fim = NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recriar o trigger
DROP TRIGGER IF EXISTS trigger_localizacao_unica ON localizacoes_animal;

CREATE TRIGGER trigger_localizacao_unica
    BEFORE INSERT OR UPDATE ON localizacoes_animal
    FOR EACH ROW
    EXECUTE FUNCTION garantir_localizacao_unica();

-- 4. Corrigir dados existentes manualmente
-- Primeiro, marcar todas como inativas
UPDATE localizacoes_animal 
SET ativo = false, data_fim = CURRENT_DATE - INTERVAL '1 day'
WHERE animal_id = '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b';

-- Depois, ativar apenas a mais recente
UPDATE localizacoes_animal 
SET 
    ativo = true, 
    data_fim = NULL
WHERE id = (
    SELECT id 
    FROM localizacoes_animal 
    WHERE animal_id = '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b'
    ORDER BY data_inicio DESC, created_at DESC 
    LIMIT 1
);

-- 5. Inserir dados de teste para garantir funcionamento
INSERT INTO localizacoes_animal (
    animal_id, 
    tipo_localizacao, 
    data_inicio, 
    endereco_detalhes, 
    motivo_transferencia, 
    observacoes,
    ativo
) VALUES 
(
    '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b',
    'canil',
    '2024-01-15',
    'Canil Principal da Associação',
    'Resgate inicial',
    'Animal resgatado da rua',
    false
),
(
    '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b',
    'clinica',
    '2024-06-10',
    'Clínica Veterinária Central',
    'Tratamento médico',
    'Cirurgia de castração',
    false
);

-- 6. Verificar resultado final
SELECT 
    animal_id,
    tipo_localizacao,
    data_inicio,
    data_fim,
    ativo,
    created_at,
    CASE 
        WHEN ativo = true THEN 'ATUAL'
        ELSE 'HISTÓRICO'
    END as status
FROM localizacoes_animal 
WHERE animal_id = '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b'
ORDER BY data_inicio DESC;