-- VERIFICAR E CORRIGIR OUTRAS COLUNAS NECESSÁRIAS
-- Garantir que todas as colunas necessárias existem

-- 1. VERIFICAR COLUNAS NECESSÁRIAS PARA O FRONTEND
SELECT 
  'COLUNAS NECESSÁRIAS:' as info,
  column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
      AND column_name = t.column_name
    ) 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM (
  VALUES 
    ('numero_movimento'),
    ('escopo'),
    ('categoria_id'),
    ('tipo'),
    ('descricao'),
    ('valor'),
    ('data_movimento'),
    ('observacoes'),
    ('animal_id')
) AS t(column_name);

-- 2. ADICIONAR COLUNAS EM FALTA SE NECESSÁRIO
DO $$
BEGIN
  -- Verificar e adicionar numero_movimento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
    AND column_name = 'numero_movimento'
  ) THEN
    ALTER TABLE movimentos_financeiros_2025_12_29_07_00 
    ADD COLUMN numero_movimento TEXT;
    RAISE NOTICE 'Coluna numero_movimento adicionada';
  END IF;

  -- Verificar e adicionar escopo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
    AND column_name = 'escopo'
  ) THEN
    ALTER TABLE movimentos_financeiros_2025_12_29_07_00 
    ADD COLUMN escopo TEXT CHECK (escopo IN ('animal', 'associacao', 'ambos'));
    RAISE NOTICE 'Coluna escopo adicionada';
  END IF;

  -- Verificar e adicionar categoria_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
    AND column_name = 'categoria_id'
  ) THEN
    ALTER TABLE movimentos_financeiros_2025_12_29_07_00 
    ADD COLUMN categoria_id UUID;
    RAISE NOTICE 'Coluna categoria_id adicionada';
  END IF;

  -- Verificar e adicionar tipo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
    AND column_name = 'tipo'
  ) THEN
    ALTER TABLE movimentos_financeiros_2025_12_29_07_00 
    ADD COLUMN tipo TEXT CHECK (tipo IN ('receita', 'despesa', 'transferencia'));
    RAISE NOTICE 'Coluna tipo adicionada';
  END IF;

  -- Verificar e adicionar descricao
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
    AND column_name = 'descricao'
  ) THEN
    ALTER TABLE movimentos_financeiros_2025_12_29_07_00 
    ADD COLUMN descricao TEXT NOT NULL;
    RAISE NOTICE 'Coluna descricao adicionada';
  END IF;

  -- Verificar e adicionar valor
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
    AND column_name = 'valor'
  ) THEN
    ALTER TABLE movimentos_financeiros_2025_12_29_07_00 
    ADD COLUMN valor DECIMAL(10,2) NOT NULL;
    RAISE NOTICE 'Coluna valor adicionada';
  END IF;

  -- Verificar e adicionar data_movimento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
    AND column_name = 'data_movimento'
  ) THEN
    ALTER TABLE movimentos_financeiros_2025_12_29_07_00 
    ADD COLUMN data_movimento DATE NOT NULL;
    RAISE NOTICE 'Coluna data_movimento adicionada';
  END IF;

  -- Verificar e adicionar observacoes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
    AND column_name = 'observacoes'
  ) THEN
    ALTER TABLE movimentos_financeiros_2025_12_29_07_00 
    ADD COLUMN observacoes TEXT;
    RAISE NOTICE 'Coluna observacoes adicionada';
  END IF;

END $$;

-- 3. VERIFICAR ESTRUTURA FINAL
SELECT 
  'ESTRUTURA FINAL:' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
ORDER BY ordinal_position;