-- ADICIONAR CAMPO CONDIÇÃO À TABELA ANIMAIS
-- Para registrar se o animal é inteiro, castrado ou esterilizado

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA ANIMAIS
SELECT 
  'ESTRUTURA ATUAL DA TABELA ANIMAIS:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'animais'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNA CONDIÇÃO SE NÃO EXISTIR
ALTER TABLE animais 
ADD COLUMN IF NOT EXISTS condicao TEXT 
CHECK (condicao IN ('Inteiro', 'Castrado', 'Esterilizado'));

-- 3. COMENTÁRIO PARA DOCUMENTAÇÃO
COMMENT ON COLUMN animais.condicao IS 'Condição reprodutiva do animal: Inteiro, Castrado ou Esterilizado';

-- 4. VERIFICAR SE A COLUNA FOI ADICIONADA
SELECT 
  'COLUNA CONDIÇÃO ADICIONADA:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'animais'
  AND column_name = 'condicao'
  AND table_schema = 'public';

-- 5. VERIFICAR CONSTRAINT CHECK
SELECT 
  'CONSTRAINT CHECK CRIADA:' as info,
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%condicao%';

-- 6. ATUALIZAR ALGUNS REGISTROS EXISTENTES PARA TESTE (OPCIONAL)
UPDATE animais 
SET condicao = 'Inteiro' 
WHERE condicao IS NULL 
  AND sexo = 'Macho'
  AND id IN (
    SELECT id FROM animais 
    WHERE condicao IS NULL 
    LIMIT 3
  );

UPDATE animais 
SET condicao = 'Esterilizado' 
WHERE condicao IS NULL 
  AND sexo = 'Fêmea'
  AND id IN (
    SELECT id FROM animais 
    WHERE condicao IS NULL 
    LIMIT 2
  );

-- 7. VERIFICAR DADOS ATUALIZADOS
SELECT 
  'DADOS DE TESTE ATUALIZADOS:' as info,
  condicao,
  COUNT(*) as quantidade
FROM animais 
WHERE condicao IS NOT NULL
GROUP BY condicao
ORDER BY condicao;