-- Remover índices existentes se existirem
DROP INDEX IF EXISTS idx_movimentos_data;
DROP INDEX IF EXISTS idx_movimentos_animal;
DROP INDEX IF EXISTS idx_movimentos_categoria;
DROP INDEX IF EXISTS idx_movimentos_status;
DROP INDEX IF EXISTS idx_parcelas_vencimento;

-- Eliminar tabelas financeiras antigas
DROP TABLE IF EXISTS movimentos_financeiros_2025_12_13_03_00 CASCADE;
DROP TABLE IF EXISTS categorias_financeiras_2025_12_13_03_00 CASCADE;

-- Eliminar funções relacionadas
DROP FUNCTION IF EXISTS gerar_numero_movimento() CASCADE;
DROP FUNCTION IF EXISTS trigger_gerar_numero_movimento() CASCADE;

-- NOVA ESTRUTURA FINANCEIRA PROFISSIONAL

-- 1. Categorias Financeiras (Receitas e Despesas)
CREATE TABLE categorias_financeiras_2025_12_13_06_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL, -- Código único (ex: R001, D001)
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    escopo VARCHAR(20) NOT NULL CHECK (escopo IN ('animal', 'associacao', 'ambos')),
    cor VARCHAR(7) DEFAULT '#6B7280', -- Cor hexadecimal
    icone VARCHAR(50) DEFAULT 'DollarSign',
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Contas Financeiras (Bancos, Caixas, etc.)
CREATE TABLE contas_financeiras_2025_12_13_06_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL, -- Código único (ex: BCO001, CX001)
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('banco', 'caixa', 'poupanca', 'investimento')),
    banco VARCHAR(100),
    numero_conta VARCHAR(50),
    saldo_inicial DECIMAL(10,2) DEFAULT 0,
    saldo_atual DECIMAL(10,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);