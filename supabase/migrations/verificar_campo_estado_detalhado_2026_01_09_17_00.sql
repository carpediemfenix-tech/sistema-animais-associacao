-- VERIFICAR SE CAMPO ESTADO EXISTE E VALORES POSSÍVEIS

-- 1. VERIFICAR SE CAMPO ESTADO EXISTE
SELECT 
  'CAMPO ESTADO:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'animais'
  AND column_name = 'estado';

-- 2. SE EXISTE, VERIFICAR VALORES ÚNICOS
SELECT 
  'VALORES ESTADO:' as info,
  estado,
  COUNT(*) as quantidade
FROM animais
WHERE estado IS NOT NULL
GROUP BY estado
ORDER BY quantidade DESC;

-- 3. VERIFICAR CONSTRAINTS DO CAMPO ESTADO
SELECT 
  'CONSTRAINTS ESTADO:' as info,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'animais'
  AND tc.constraint_name LIKE '%estado%';

-- 4. VERIFICAR TABELA DE ADOTANTES
SELECT 
  'ESTRUTURA ADOTANTES:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'adotantes'
ORDER BY ordinal_position;

-- 5. VERIFICAR RELACIONAMENTO ANIMAL-ADOTANTE
SELECT 
  'RELACIONAMENTO ADOTANTE:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'animais'
  AND (column_name LIKE '%adot%' 
       OR column_name LIKE '%responsavel%'
       OR column_name LIKE '%tutor%');