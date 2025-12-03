-- Verificar e corrigir problemas no sistema de voluntários

-- 1. Adicionar coluna data_entrada se não existir
ALTER TABLE voluntarios 
ADD COLUMN IF NOT EXISTS data_entrada DATE DEFAULT CURRENT_DATE;

-- 2. Verificar se existem dados na tabela niveis_formacao
-- Se não existir, inserir dados básicos
INSERT INTO niveis_formacao (id, nome, codigo, descricao, cor, ordem, ativo, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'FORMA BASE', 'FORMA_BASE', 'Formação base para novos voluntários', '#22c55e', 1, true, NOW(), NOW()),
  (gen_random_uuid(), 'Nível 1', 'N1', 'Primeiro nível de formação', '#3b82f6', 2, true, NOW(), NOW()),
  (gen_random_uuid(), 'Nível 2', 'N2', 'Segundo nível de formação', '#f59e0b', 3, true, NOW(), NOW()),
  (gen_random_uuid(), 'Nível 3', 'N3', 'Terceiro nível de formação', '#ef4444', 4, true, NOW(), NOW()),
  (gen_random_uuid(), 'FORMA-VET', 'FORMA_VET', 'Formação veterinária especializada', '#8b5cf6', 5, true, NOW(), NOW()),
  (gen_random_uuid(), 'FORMA-RESCUE', 'FORMA_RESCUE', 'Formação de resgate especializada', '#06b6d4', 6, true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- 3. Corrigir estrutura da tabela voluntario_progressao se necessário
-- Verificar se as colunas existem
ALTER TABLE voluntario_progressao 
ADD COLUMN IF NOT EXISTS nivel_anterior_id UUID REFERENCES niveis_formacao(id),
ADD COLUMN IF NOT EXISTS nivel_novo_id UUID REFERENCES niveis_formacao(id);

-- 4. Atualizar voluntários existentes com data_entrada se estiver NULL
UPDATE voluntarios 
SET data_entrada = created_at::date 
WHERE data_entrada IS NULL;

-- 5. Comentários para documentação
COMMENT ON COLUMN voluntarios.data_entrada IS 'Data de entrada do voluntário na associação';
COMMENT ON COLUMN voluntario_progressao.nivel_anterior_id IS 'ID do nível anterior na progressão';
COMMENT ON COLUMN voluntario_progressao.nivel_novo_id IS 'ID do novo nível na progressão';