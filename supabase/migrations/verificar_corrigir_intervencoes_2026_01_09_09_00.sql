-- VERIFICAR E CORRIGIR TABELA DE INTERVENÇÕES
-- Verificar estrutura atual da tabela intervencoes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'intervencoes'
ORDER BY ordinal_position;

-- Verificar se as colunas necessárias existem
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'animal_id') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as animal_id_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'tipo_intervencao_id') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as tipo_intervencao_id_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'data_intervencao') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as data_intervencao_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'veterinario') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as veterinario_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'clinica_id') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as clinica_id_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'observacoes') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as observacoes_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'custo') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as custo_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'desconto_protocolo') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as desconto_protocolo_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'urgente') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as urgente_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'concluida') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as concluida_status;

-- Criar colunas que estão em falta (se necessário)
-- Verificar primeiro se a tabela existe
DO $$
BEGIN
  -- Adicionar colunas que podem estar em falta
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'veterinario') THEN
    ALTER TABLE intervencoes ADD COLUMN veterinario TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'custo') THEN
    ALTER TABLE intervencoes ADD COLUMN custo DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'desconto_protocolo') THEN
    ALTER TABLE intervencoes ADD COLUMN desconto_protocolo DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'urgente') THEN
    ALTER TABLE intervencoes ADD COLUMN urgente BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'concluida') THEN
    ALTER TABLE intervencoes ADD COLUMN concluida BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Verificar se data_intervencao existe, se não, criar
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'data_intervencao') THEN
    ALTER TABLE intervencoes ADD COLUMN data_intervencao DATE;
  END IF;
  
  -- Verificar se hora_intervencao existe para compatibilidade
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervencoes' AND column_name = 'hora_intervencao') THEN
    ALTER TABLE intervencoes ADD COLUMN hora_intervencao TIME;
  END IF;
  
END $$;

-- Verificar estrutura final
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'intervencoes'
ORDER BY ordinal_position;