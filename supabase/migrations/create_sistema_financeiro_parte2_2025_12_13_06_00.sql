-- 3. Movimentos Financeiros Principais
CREATE TABLE movimentos_financeiros_2025_12_13_06_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_movimento VARCHAR(20) UNIQUE NOT NULL, -- Numeração automática
    data_movimento DATE NOT NULL,
    data_vencimento DATE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa', 'transferencia')),
    escopo VARCHAR(20) NOT NULL CHECK (escopo IN ('animal', 'associacao')),
    
    -- Relacionamentos
    categoria_id UUID REFERENCES categorias_financeiras_2025_12_13_06_00(id),
    conta_origem_id UUID REFERENCES contas_financeiras_2025_12_13_06_00(id),
    conta_destino_id UUID REFERENCES contas_financeiras_2025_12_13_06_00(id),
    animal_id UUID REFERENCES animais(id), -- Quando aplicável
    intervencao_id UUID REFERENCES intervencoes(id), -- Quando aplicável
    
    -- Valores
    valor DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    
    -- Informações
    descricao TEXT NOT NULL,
    observacoes TEXT,
    documento VARCHAR(100), -- Número de fatura, recibo, etc.
    
    -- Status e controle
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial', 'cancelado')),
    forma_pagamento VARCHAR(30) CHECK (forma_pagamento IN ('dinheiro', 'transferencia', 'multibanco', 'mbway', 'cheque', 'cartao')),
    
    -- Auditoria
    criado_por UUID REFERENCES auth.users(id),
    aprovado_por UUID REFERENCES auth.users(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Parcelas de Movimentos (para pagamentos parcelados)
CREATE TABLE parcelas_movimentos_2025_12_13_06_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    movimento_id UUID REFERENCES movimentos_financeiros_2025_12_13_06_00(id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    data_vencimento DATE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    data_pagamento DATE,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orçamentos Anuais
CREATE TABLE orcamentos_2025_12_13_06_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ano INTEGER NOT NULL,
    categoria_id UUID REFERENCES categorias_financeiras_2025_12_13_06_00(id),
    escopo VARCHAR(20) NOT NULL CHECK (escopo IN ('animal', 'associacao')),
    valor_orcado DECIMAL(10,2) NOT NULL,
    valor_realizado DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ano, categoria_id, escopo)
);