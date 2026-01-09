-- CORREÇÃO DEFINITIVA DAS TABELAS FINANCEIRAS
-- Criar estrutura simples e funcional

-- 1. VERIFICAR TABELAS EXISTENTES
SELECT 
  'TABELAS EXISTENTES:' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%financeiro%' OR table_name LIKE '%movimento%' OR table_name LIKE '%categoria%')
ORDER BY table_name;

-- 2. REMOVER TABELAS PROBLEMÁTICAS SE EXISTIREM
DROP TABLE IF EXISTS movimentos_financeiros CASCADE;
DROP TABLE IF EXISTS categorias_financeiras CASCADE;

-- 3. CRIAR TABELA categorias_financeiras PRIMEIRO (sem dependências)
CREATE TABLE categorias_financeiras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  icone TEXT DEFAULT '📊',
  cor TEXT DEFAULT '#6B7280',
  escopo TEXT NOT NULL DEFAULT 'ambos' CHECK (escopo IN ('animal', 'missao', 'geral', 'ambos')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA movimentos_financeiros (com referência a categorias)
CREATE TABLE movimentos_financeiros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_movimento TEXT NOT NULL UNIQUE,
  escopo TEXT NOT NULL DEFAULT 'animal' CHECK (escopo IN ('animal', 'missao', 'geral', 'ambos')),
  categoria_id UUID REFERENCES categorias_financeiras(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_movimento DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  animal_id UUID REFERENCES animais(id),
  missao_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INSERIR CATEGORIAS BÁSICAS
INSERT INTO categorias_financeiras (nome, icone, cor, escopo) VALUES
('Alimentação', '🍖', '#4CAF50', 'animal'),
('Veterinário', '🏥', '#2196F3', 'animal'),
('Medicamentos', '💊', '#FF9800', 'animal'),
('Doação', '💝', '#E91E63', 'ambos'),
('Equipamentos', '🛠️', '#9C27B0', 'ambos'),
('Transporte', '🚗', '#795548', 'ambos'),
('Limpeza', '🧽', '#00BCD4', 'ambos'),
('Outros', '📋', '#607D8B', 'ambos');

-- 6. CRIAR ÍNDICES
CREATE INDEX idx_movimentos_financeiros_animal_id ON movimentos_financeiros(animal_id);
CREATE INDEX idx_movimentos_financeiros_data ON movimentos_financeiros(data_movimento);
CREATE INDEX idx_movimentos_financeiros_tipo ON movimentos_financeiros(tipo);
CREATE INDEX idx_categorias_financeiras_escopo ON categorias_financeiras(escopo);

-- 7. VERIFICAR CRIAÇÃO
SELECT 
  'TABELAS CRIADAS COM SUCESSO:' as info,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('movimentos_financeiros', 'categorias_financeiras')
ORDER BY table_name;

-- 8. VERIFICAR CATEGORIAS INSERIDAS
SELECT 
  'CATEGORIAS INSERIDAS:' as info,
  COUNT(*) as total,
  STRING_AGG(nome, ', ') as nomes
FROM categorias_financeiras;