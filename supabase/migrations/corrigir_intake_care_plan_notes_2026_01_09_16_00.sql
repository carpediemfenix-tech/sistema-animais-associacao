-- CORREÇÃO ANIMAL INTAKE - CAMPO care_plan_notes
-- Adicionar campo que está em falta na tabela

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
SELECT 
  'ESTRUTURA ATUAL animal_intake_assessments:' as info,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE O CAMPO care_plan_notes EXISTE
SELECT 
  'CAMPO care_plan_notes:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'animal_intake_assessments' 
      AND column_name = 'care_plan_notes'
    ) 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status;

-- 3. ADICIONAR CAMPO care_plan_notes SE NÃO EXISTIR
DO $$
BEGIN
  -- Verificar se a tabela existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animal_intake_assessments') THEN
    -- Adicionar campo se não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'animal_intake_assessments' 
      AND column_name = 'care_plan_notes'
    ) THEN
      ALTER TABLE animal_intake_assessments 
      ADD COLUMN care_plan_notes TEXT;
      
      RAISE NOTICE 'Campo care_plan_notes adicionado com sucesso';
    ELSE
      RAISE NOTICE 'Campo care_plan_notes já existe';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela animal_intake_assessments não existe';
  END IF;
END $$;

-- 4. VERIFICAR OUTROS CAMPOS COMUNS QUE PODEM ESTAR EM FALTA
DO $$
BEGIN
  -- Verificar e adicionar outros campos comuns do intake
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animal_intake_assessments') THEN
    
    -- Campo behavioral_notes
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'animal_intake_assessments' 
      AND column_name = 'behavioral_notes'
    ) THEN
      ALTER TABLE animal_intake_assessments 
      ADD COLUMN behavioral_notes TEXT;
      RAISE NOTICE 'Campo behavioral_notes adicionado';
    END IF;
    
    -- Campo medical_history
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'animal_intake_assessments' 
      AND column_name = 'medical_history'
    ) THEN
      ALTER TABLE animal_intake_assessments 
      ADD COLUMN medical_history TEXT;
      RAISE NOTICE 'Campo medical_history adicionado';
    END IF;
    
    -- Campo special_needs
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'animal_intake_assessments' 
      AND column_name = 'special_needs'
    ) THEN
      ALTER TABLE animal_intake_assessments 
      ADD COLUMN special_needs TEXT;
      RAISE NOTICE 'Campo special_needs adicionado';
    END IF;
    
  END IF;
END $$;

-- 5. VERIFICAR ESTRUTURA FINAL
SELECT 
  'ESTRUTURA FINAL animal_intake_assessments:' as info,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments'
ORDER BY ordinal_position;

-- 6. VERIFICAR SE EXISTEM REGISTOS NA TABELA
SELECT 
  'REGISTOS NA TABELA:' as info,
  COUNT(*) as total_registos
FROM animal_intake_assessments;