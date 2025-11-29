-- CORREÇÃO EMERGENCIAL - REMOVER TRIGGER PROBLEMÁTICO
-- Data: 2025-11-29 10:35

-- 1. Remover o trigger problemático que causa recursão infinita
DROP TRIGGER IF EXISTS trigger_localizacao_unica ON localizacoes_animal;
DROP FUNCTION IF EXISTS garantir_localizacao_unica();

-- 2. Limpar dados corrompidos e reorganizar
-- Primeiro, verificar dados atuais
SELECT 
    id,
    animal_id,
    tipo_localizacao,
    data_inicio,
    ativo,
    created_at
FROM localizacoes_animal 
WHERE animal_id = '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b'
ORDER BY created_at DESC;

-- 3. Corrigir dados manualmente - marcar todas como inativas primeiro
UPDATE localizacoes_animal 
SET 
    ativo = false,
    data_fim = CURRENT_DATE - INTERVAL '1 day'
WHERE animal_id = '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b';

-- 4. Ativar apenas a mais recente (por data de criação)
UPDATE localizacoes_animal 
SET 
    ativo = true,
    data_fim = NULL
WHERE id = (
    SELECT id 
    FROM localizacoes_animal 
    WHERE animal_id = '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b'
    ORDER BY created_at DESC 
    LIMIT 1
);

-- 5. Inserir dados de teste para histórico
INSERT INTO localizacoes_animal (
    animal_id, 
    tipo_localizacao, 
    data_inicio, 
    data_fim,
    endereco_detalhes, 
    motivo_transferencia, 
    observacoes,
    ativo
) VALUES 
(
    '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b',
    'canil',
    '2024-01-15',
    '2024-06-09',
    'Canil Principal da Associação',
    'Resgate inicial',
    'Animal resgatado da rua',
    false
),
(
    '7e6f88cd-f90d-4096-bb9f-0a6c94b1365b',
    'clinica',
    '2024-06-10',
    '2024-11-20',
    'Clínica Veterinária Central',
    'Tratamento médico',
    'Cirurgia de castração',
    false
);

-- 6. Verificar resultado final
SELECT 
    id,
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