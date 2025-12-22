-- Inserir dados básicos na tabela acoes_formacao usando apenas campos existentes
INSERT INTO acoes_formacao (id, ativo, created_at, updated_at)
VALUES 
    (gen_random_uuid(), true, NOW(), NOW()),
    (gen_random_uuid(), true, NOW(), NOW()),
    (gen_random_uuid(), true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verificar quantos registos existem
SELECT COUNT(*) as total_acoes FROM acoes_formacao;