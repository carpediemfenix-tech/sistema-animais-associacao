-- =====================================================
-- CRIAR TABELAS BÁSICAS DO SISTEMA DE STOCK
-- =====================================================

-- 1. VERIFICAR TABELAS EXISTENTES
SELECT 'VERIFICANDO TABELAS EXISTENTES' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%aprovisionamento%'
ORDER BY table_name;

-- 2. CRIAR TABELA DE ITENS ESPECÍFICOS (Produtos com stock)
CREATE TABLE IF NOT EXISTS public.itens_aprovisionamento_2026_01_06 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamento com tipo (Fase 1)
    tipo_id UUID NOT NULL REFERENCES public.tipos_aprovisionamento_2026_01_06(id) ON DELETE CASCADE,
    
    -- Identificação do item
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    codigo_interno VARCHAR(100),
    codigo_barras VARCHAR(100),
    referencia_fornecedor VARCHAR(100),
    
    -- Variações específicas
    tamanho VARCHAR(50),
    cor VARCHAR(50),
    especificacao TEXT,
    
    -- Gestão de Stock
    quantidade_atual INTEGER DEFAULT 0 NOT NULL,
    stock_minimo INTEGER DEFAULT 0 NOT NULL,
    stock_maximo INTEGER,
    
    -- Informações financeiras
    preco_unitario DECIMAL(10,2),
    valor_total_stock DECIMAL(10,2) GENERATED ALWAYS AS (quantidade_atual * COALESCE(preco_unitario, 0)) STORED,
    
    -- Informações de validade
    data_validade DATE,
    lote VARCHAR(100),
    
    -- Localização física
    localizacao_fisica VARCHAR(255),
    
    -- Estados e controle
    ativo BOOLEAN DEFAULT true,
    alerta_stock_baixo BOOLEAN GENERATED ALWAYS AS (quantidade_atual <= stock_minimo) STORED,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 3. CRIAR TABELA DE MOVIMENTOS DE STOCK
CREATE TABLE IF NOT EXISTS public.movimentos_stock_2026_01_06 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamento com item
    item_id UUID NOT NULL REFERENCES public.itens_aprovisionamento_2026_01_06(id) ON DELETE CASCADE,
    
    -- Tipo de movimento
    tipo_movimento VARCHAR(50) NOT NULL CHECK (tipo_movimento IN (
        'ENTRADA_COMPRA', 'ENTRADA_DOACAO', 'ENTRADA_DEVOLUCAO', 'ENTRADA_AJUSTE',
        'SAIDA_CONSUMO', 'SAIDA_ATRIBUICAO', 'SAIDA_PERDA', 'SAIDA_AJUSTE'
    )),
    
    -- Quantidades
    quantidade INTEGER NOT NULL,
    quantidade_anterior INTEGER NOT NULL,
    quantidade_nova INTEGER NOT NULL,
    
    -- Informações do movimento
    motivo TEXT,
    documento_referencia VARCHAR(100),
    
    -- Relacionamentos opcionais
    voluntario_id VARCHAR(100),
    animal_id VARCHAR(100),
    missao_id VARCHAR(100),
    
    -- Informações financeiras
    preco_unitario DECIMAL(10,2),
    valor_total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * COALESCE(preco_unitario, 0)) STORED,
    
    -- Auditoria
    data_movimento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    observacoes TEXT
);

-- 4. CRIAR TABELA DE VARIAÇÕES
CREATE TABLE IF NOT EXISTS public.variacoes_aprovisionamento_2026_01_06 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    categoria_id UUID NOT NULL REFERENCES public.categorias_aprovisionamento_2026_01_06(id) ON DELETE CASCADE,
    
    tipo_variacao VARCHAR(50) NOT NULL CHECK (tipo_variacao IN (
        'TAMANHO', 'COR', 'ESPECIFICACAO', 'MODELO', 'MARCA'
    )),
    
    valor VARCHAR(100) NOT NULL,
    descricao TEXT,
    ordem_exibicao INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(categoria_id, tipo_variacao, valor)
);

-- 5. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_itens_tipo_id ON public.itens_aprovisionamento_2026_01_06(tipo_id);
CREATE INDEX IF NOT EXISTS idx_itens_ativo ON public.itens_aprovisionamento_2026_01_06(ativo);
CREATE INDEX IF NOT EXISTS idx_itens_alerta_stock ON public.itens_aprovisionamento_2026_01_06(alerta_stock_baixo) WHERE alerta_stock_baixo = true;

CREATE INDEX IF NOT EXISTS idx_movimentos_item_id ON public.movimentos_stock_2026_01_06(item_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_tipo ON public.movimentos_stock_2026_01_06(tipo_movimento);
CREATE INDEX IF NOT EXISTS idx_movimentos_data ON public.movimentos_stock_2026_01_06(data_movimento);

-- 6. HABILITAR RLS
ALTER TABLE public.itens_aprovisionamento_2026_01_06 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_stock_2026_01_06 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variacoes_aprovisionamento_2026_01_06 ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS RLS PERMISSIVAS
CREATE POLICY "itens_all_operations" ON public.itens_aprovisionamento_2026_01_06
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "movimentos_all_operations" ON public.movimentos_stock_2026_01_06
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "variacoes_all_operations" ON public.variacoes_aprovisionamento_2026_01_06
    FOR ALL USING (true) WITH CHECK (true);

-- 8. VERIFICAR CRIAÇÃO DAS TABELAS
SELECT 'TABELAS CRIADAS COM SUCESSO' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%aprovisionamento_2026_01_06%'
ORDER BY table_name;