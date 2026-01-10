-- ATUALIZAR CAMPO CONDIÇÃO PARA INCLUIR "DESCONHECIDO" E TORNAR OBRIGATÓRIO
-- Adicionar nova opção e definir como NOT NULL

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
  'ESTRUTURA ATUAL DO CAMPO CONDIÇÃO:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'animais'
  AND column_name = 'condicao'
  AND table_schema = 'public';

-- 2. REMOVER CONSTRAINT CHECK EXISTENTE
ALTER TABLE animais 
DROP CONSTRAINT IF EXISTS animais_condicao_check;

-- 3. ADICIONAR NOVA CONSTRAINT CHECK COM "DESCONHECIDO"
ALTER TABLE animais 
ADD CONSTRAINT animais_condicao_check 
CHECK (condicao IN ('Inteiro', 'Castrado', 'Esterilizado', 'Desconhecido'));

-- 4. ATUALIZAR REGISTROS NULL PARA "DESCONHECIDO" (PREPARAÇÃO PARA NOT NULL)
UPDATE animais 
SET condicao = 'Desconhecido' 
WHERE condicao IS NULL;

-- 5. TORNAR CAMPO OBRIGATÓRIO (NOT NULL)
ALTER TABLE animais 
ALTER COLUMN condicao SET NOT NULL;

-- 6. DEFINIR VALOR PADRÃO COMO "DESCONHECIDO"
ALTER TABLE animais 
ALTER COLUMN condicao SET DEFAULT 'Desconhecido';

-- 7. ATUALIZAR COMENTÁRIO
COMMENT ON COLUMN animais.condicao IS 'Condição reprodutiva do animal: Inteiro, Castrado, Esterilizado ou Desconhecido (obrigatório)';

-- 8. VERIFICAR RESULTADO FINAL
SELECT 
  'CAMPO CONDIÇÃO ATUALIZADO:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'animais'
  AND column_name = 'condicao'
  AND table_schema = 'public';

-- 9. VERIFICAR NOVA CONSTRAINT
SELECT 
  'NOVA CONSTRAINT CHECK:' as info,
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'animais_condicao_check';

-- 10. VERIFICAR DISTRIBUIÇÃO DOS DADOS
SELECT 
  'DISTRIBUIÇÃO ATUAL:' as info,
  condicao,
  COUNT(*) as quantidade
FROM animais 
GROUP BY condicao
ORDER BY condicao;