-- Criar sistema financeiro básico
-- Criado em: 2025-12-13 03:00 UTC

-- 1. Criar tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS categorias_financeiras_2025_12_13_03_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7) DEFAULT '#6B7280',
  icone VARCHAR(50) DEFAULT 'DollarSign',
  tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa', 'ambos')) DEFAULT 'ambos',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de movimentos financeiros
CREATE TABLE IF NOT EXISTS movimentos_financeiros_2025_12_13_03_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_movimento VARCHAR(20) UNIQUE NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  escopo VARCHAR(20) CHECK (escopo IN ('animal', 'associacao')) NOT NULL,
  categoria_id UUID REFERENCES categorias_financeiras_2025_12_13_03_00(id),
  animal_id UUID REFERENCES animais(id),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  data_movimento DATE NOT NULL,
  metodo_pagamento VARCHAR(50),
  referencia_externa VARCHAR(100),
  observacoes TEXT,
  status VARCHAR(20) CHECK (status IN ('pendente', 'confirmado', 'cancelado')) DEFAULT 'confirmado',
  responsavel_id UUID REFERENCES voluntarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inserir categorias padrão
INSERT INTO categorias_financeiras_2025_12_13_03_00 (nome, descricao, cor, icone, tipo) VALUES
('Doações', 'Doações recebidas de particulares e empresas', '#10B981', 'Heart', 'receita'),
('Adoções', 'Taxas de adoção de animais', '#3B82F6', 'PawPrint', 'receita'),
('Eventos', 'Receitas de eventos e campanhas', '#8B5CF6', 'Calendar', 'receita'),
('Subsídios', 'Apoios governamentais e subsídios', '#F59E0B', 'Building', 'receita'),
('Veterinário', 'Despesas veterinárias e tratamentos', '#EF4444', 'Stethoscope', 'despesa'),
('Alimentação', 'Ração e alimentação dos animais', '#F97316', 'Apple', 'despesa'),
('Medicamentos', 'Medicamentos e suplementos', '#EC4899', 'Pill', 'despesa'),
('Instalações', 'Manutenção e melhorias das instalações', '#6B7280', 'Home', 'despesa'),
('Transporte', 'Combustível e manutenção de viaturas', '#14B8A6', 'Car', 'despesa'),
('Administrativo', 'Despesas administrativas e burocráticas', '#A855F7', 'FileText', 'despesa');

-- 4. Inserir alguns movimentos de exemplo
DO $$
DECLARE
    animal_id_1 UUID;
    animal_id_2 UUID;
    voluntario_id UUID;
    cat_doacoes UUID;
    cat_veterinario UUID;
    cat_alimentacao UUID;
    cat_adocoes UUID;
BEGIN
    -- Buscar IDs de animais e voluntários
    SELECT id INTO animal_id_1 FROM animais WHERE arquivado = false LIMIT 1;
    SELECT id INTO animal_id_2 FROM animais WHERE arquivado = false OFFSET 1 LIMIT 1;
    SELECT id INTO voluntario_id FROM voluntarios WHERE ativo = true LIMIT 1;
    
    -- Buscar IDs de categorias
    SELECT id INTO cat_doacoes FROM categorias_financeiras_2025_12_13_03_00 WHERE nome = 'Doações';
    SELECT id INTO cat_veterinario FROM categorias_financeiras_2025_12_13_03_00 WHERE nome = 'Veterinário';
    SELECT id INTO cat_alimentacao FROM categorias_financeiras_2025_12_13_03_00 WHERE nome = 'Alimentação';
    SELECT id INTO cat_adocoes FROM categorias_financeiras_2025_12_13_03_00 WHERE nome = 'Adoções';
    
    -- Inserir movimentos se os dados existirem
    IF animal_id_1 IS NOT NULL AND voluntario_id IS NOT NULL THEN
        INSERT INTO movimentos_financeiros_2025_12_13_03_00 
        (numero_movimento, tipo, escopo, categoria_id, animal_id, descricao, valor, data_movimento, metodo_pagamento, responsavel_id) VALUES
        ('REC001', 'receita', 'associacao', cat_doacoes, NULL, 'Doação mensal de empresa parceira', 500.00, CURRENT_DATE - INTERVAL '5 days', 'Transferência', voluntario_id),
        ('REC002', 'receita', 'animal', cat_adocoes, animal_id_1, 'Taxa de adoção', 50.00, CURRENT_DATE - INTERVAL '3 days', 'Dinheiro', voluntario_id),
        ('DES001', 'despesa', 'animal', cat_veterinario, animal_id_1, 'Consulta veterinária e vacinas', 85.00, CURRENT_DATE - INTERVAL '2 days', 'Cartão', voluntario_id),
        ('DES002', 'despesa', 'associacao', cat_alimentacao, NULL, 'Compra de ração para canil', 150.00, CURRENT_DATE - INTERVAL '1 day', 'Transferência', voluntario_id),
        ('REC003', 'receita', 'associacao', cat_doacoes, NULL, 'Doação particular', 25.00, CURRENT_DATE, 'MB Way', voluntario_id);
    END IF;
END $$;

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_movimentos_data ON movimentos_financeiros_2025_12_13_03_00(data_movimento);
CREATE INDEX IF NOT EXISTS idx_movimentos_tipo ON movimentos_financeiros_2025_12_13_03_00(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentos_escopo ON movimentos_financeiros_2025_12_13_03_00(escopo);
CREATE INDEX IF NOT EXISTS idx_movimentos_animal ON movimentos_financeiros_2025_12_13_03_00(animal_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_categoria ON movimentos_financeiros_2025_12_13_03_00(categoria_id);

-- 6. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_financeiras_updated_at 
    BEFORE UPDATE ON categorias_financeiras_2025_12_13_03_00 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movimentos_financeiros_updated_at 
    BEFORE UPDATE ON movimentos_financeiros_2025_12_13_03_00 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Configurar RLS (Row Level Security)
ALTER TABLE categorias_financeiras_2025_12_13_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentos_financeiros_2025_12_13_03_00 ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Allow all for authenticated users" ON categorias_financeiras_2025_12_13_03_00
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON movimentos_financeiros_2025_12_13_03_00
    FOR ALL USING (true) WITH CHECK (true);