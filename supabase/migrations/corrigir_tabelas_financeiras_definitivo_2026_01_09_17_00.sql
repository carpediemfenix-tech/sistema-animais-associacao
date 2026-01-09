-- INVESTIGAÇÃO COMPLETA DAS TABELAS FINANCEIRAS
-- Descobrir qual estrutura realmente existe e funciona

-- 1. VERIFICAR TODAS AS TABELAS RELACIONADAS A FINANCEIRO
SELECT 
  'TABELAS FINANCEIRAS EXISTENTES:' as info,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%financeiro%' OR table_name LIKE '%movimento%' OR table_name LIKE '%categoria%')
ORDER BY table_name;

-- 2. VERIFICAR SE EXISTE TABELA movimentos_financeiros (sem timestamp)
SELECT 
  'ESTRUTURA movimentos_financeiros (sem timestamp):' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR SE EXISTE TABELA categorias_financeiras (sem timestamp)
SELECT 
  'ESTRUTURA categorias_financeiras (sem timestamp):' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'categorias_financeiras'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. SE NÃO EXISTIR, CRIAR TABELA movimentos_financeiros COM ESTRUTURA COMPLETA
CREATE TABLE IF NOT EXISTS movimentos_financeiros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_movimento TEXT NOT NULL UNIQUE,
  escopo TEXT NOT NULL CHECK (escopo IN ('animal', 'missao', 'geral', 'ambos')),
  categoria_id UUID REFERENCES categorias_financeiras(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_movimento DATE NOT NULL,
  observacoes TEXT,
  animal_id UUID REFERENCES animais(id),
  missao_id UUID REFERENCES missoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SE NÃO EXISTIR, CRIAR TABELA categorias_financeiras COM ESTRUTURA COMPLETA
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  icone TEXT,
  cor TEXT,
  escopo TEXT NOT NULL CHECK (escopo IN ('animal', 'missao', 'geral', 'ambos')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INSERIR CATEGORIAS BÁSICAS SE A TABELA ESTIVER VAZIA
INSERT INTO categorias_financeiras (nome, icone, cor, escopo, ativo)
SELECT 'Alimentação', '🍖', '#4CAF50', 'animal', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE nome = 'Alimentação');

INSERT INTO categorias_financeiras (nome, icone, cor, escopo, ativo)
SELECT 'Veterinário', '🏥', '#2196F3', 'animal', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE nome = 'Veterinário');

INSERT INTO categorias_financeiras (nome, icone, cor, escopo, ativo)
SELECT 'Medicamentos', '💊', '#FF9800', 'animal', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE nome = 'Medicamentos');

INSERT INTO categorias_financeiras (nome, icone, cor, escopo, ativo)
SELECT 'Doação', '💝', '#E91E63', 'ambos', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE nome = 'Doação');

INSERT INTO categorias_financeiras (nome, icone, cor, escopo, ativo)
SELECT 'Equipamentos', '🛠️', '#9C27B0', 'ambos', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE nome = 'Equipamentos');

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_animal_id ON movimentos_financeiros(animal_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_data ON movimentos_financeiros(data_movimento);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_tipo ON movimentos_financeiros(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_escopo ON categorias_financeiras(escopo);

-- 8. VERIFICAR RESULTADO FINAL
SELECT 
  'VERIFICAÇÃO FINAL - TABELAS CRIADAS:' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('movimentos_financeiros', 'categorias_financeiras')
ORDER BY table_name;