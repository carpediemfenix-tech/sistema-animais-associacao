-- =====================================================
-- FASE 2: SISTEMA DE STOCK INTELIGENTE - APROVISIONAMENTO (CORRIGIDO)
-- =====================================================

-- 1. TABELA DE ITENS ESPECÍFICOS (Produtos com stock)
CREATE TABLE IF NOT EXISTS public.itens_aprovisionamento_2026_01_06 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamento com tipo (Fase 1)
    tipo_id UUID NOT NULL REFERENCES public.tipos_aprovisionamento_2026_01_06(id) ON DELETE CASCADE,
    
    -- Identificação do item
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    codigo_interno VARCHAR(100), -- Código interno da associação
    codigo_barras VARCHAR(100), -- Código de barras se existir
    referencia_fornecedor VARCHAR(100), -- Referência do fornecedor
    
    -- Variações específicas
    tamanho VARCHAR(50), -- XS, S, M, L, XL, XXL, etc.
    cor VARCHAR(50), -- Azul, Vermelho, etc.
    especificacao TEXT, -- Especificações adicionais (20kg, 500ml, etc.)
    
    -- Gestão de Stock
    quantidade_atual INTEGER DEFAULT 0 NOT NULL,
    stock_minimo INTEGER DEFAULT 0 NOT NULL,
    stock_maximo INTEGER, -- Opcional: stock máximo desejado
    
    -- Informações financeiras
    preco_unitario DECIMAL(10,2), -- Preço por unidade
    valor_total_stock DECIMAL(10,2) GENERATED ALWAYS AS (quantidade_atual * COALESCE(preco_unitario, 0)) STORED,
    
    -- Informações de validade (se aplicável)
    data_validade DATE, -- Para itens com validade
    lote VARCHAR(100), -- Número do lote
    
    -- Localização física
    localizacao_fisica VARCHAR(255), -- Onde está armazenado
    
    -- Estados e controle
    ativo BOOLEAN DEFAULT true,
    alerta_stock_baixo BOOLEAN GENERATED ALWAYS AS (quantidade_atual <= stock_minimo) STORED,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. TABELA DE MOVIMENTOS DE STOCK (Histórico completo)
CREATE TABLE IF NOT EXISTS public.movimentos_stock_2026_01_06 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamento com item
    item_id UUID NOT NULL REFERENCES public.itens_aprovisionamento_2026_01_06(id) ON DELETE CASCADE,
    
    -- Tipo de movimento
    tipo_movimento VARCHAR(50) NOT NULL CHECK (tipo_movimento IN (
        'ENTRADA_COMPRA',      -- Compra de novos itens
        'ENTRADA_DOACAO',      -- Doação recebida
        'ENTRADA_DEVOLUCAO',   -- Devolução de item atribuído
        'ENTRADA_AJUSTE',      -- Ajuste de inventário (positivo)
        'SAIDA_CONSUMO',       -- Consumo normal
        'SAIDA_ATRIBUICAO',    -- Atribuição a voluntário/animal/missão
        'SAIDA_PERDA',         -- Perda/dano/vencimento
        'SAIDA_AJUSTE'         -- Ajuste de inventário (negativo)
    )),
    
    -- Quantidades
    quantidade INTEGER NOT NULL, -- Sempre positivo, o tipo define se é entrada/saída
    quantidade_anterior INTEGER NOT NULL, -- Stock antes do movimento
    quantidade_nova INTEGER NOT NULL, -- Stock após o movimento
    
    -- Informações do movimento
    motivo TEXT, -- Descrição detalhada do motivo
    documento_referencia VARCHAR(100), -- Fatura, recibo, etc.
    
    -- Relacionamentos opcionais (usando VARCHAR para flexibilidade)
    voluntario_id VARCHAR(100), -- ID do voluntário (se atribuído)
    animal_id VARCHAR(100), -- ID do animal (se atribuído)
    missao_id VARCHAR(100), -- ID da missão (se atribuído)
    
    -- Informações financeiras
    preco_unitario DECIMAL(10,2), -- Preço na data do movimento
    valor_total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * COALESCE(preco_unitario, 0)) STORED,
    
    -- Auditoria
    data_movimento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    observacoes TEXT
);

-- 3. TABELA DE VARIAÇÕES DISPONÍVEIS (Para configuração)
CREATE TABLE IF NOT EXISTS public.variacoes_aprovisionamento_2026_01_06 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamento com categoria (para definir quais variações são aplicáveis)
    categoria_id UUID NOT NULL REFERENCES public.categorias_aprovisionamento_2026_01_06(id) ON DELETE CASCADE,
    
    -- Tipo de variação
    tipo_variacao VARCHAR(50) NOT NULL CHECK (tipo_variacao IN (
        'TAMANHO',
        'COR', 
        'ESPECIFICACAO',
        'MODELO',
        'MARCA'
    )),
    
    -- Valores possíveis
    valor VARCHAR(100) NOT NULL,
    descricao TEXT,
    ordem_exibicao INTEGER DEFAULT 0,
    
    -- Estado
    ativo BOOLEAN DEFAULT true,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar duplicatas
    UNIQUE(categoria_id, tipo_variacao, valor)
);

-- 4. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_itens_tipo_id ON public.itens_aprovisionamento_2026_01_06(tipo_id);
CREATE INDEX IF NOT EXISTS idx_itens_ativo ON public.itens_aprovisionamento_2026_01_06(ativo);
CREATE INDEX IF NOT EXISTS idx_itens_alerta_stock ON public.itens_aprovisionamento_2026_01_06(alerta_stock_baixo) WHERE alerta_stock_baixo = true;
CREATE INDEX IF NOT EXISTS idx_itens_codigo_interno ON public.itens_aprovisionamento_2026_01_06(codigo_interno);

CREATE INDEX IF NOT EXISTS idx_movimentos_item_id ON public.movimentos_stock_2026_01_06(item_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_tipo ON public.movimentos_stock_2026_01_06(tipo_movimento);
CREATE INDEX IF NOT EXISTS idx_movimentos_data ON public.movimentos_stock_2026_01_06(data_movimento);

CREATE INDEX IF NOT EXISTS idx_variacoes_categoria ON public.variacoes_aprovisionamento_2026_01_06(categoria_id);
CREATE INDEX IF NOT EXISTS idx_variacoes_tipo ON public.variacoes_aprovisionamento_2026_01_06(tipo_variacao);

-- 5. TRIGGERS PARA AUDITORIA
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_itens_updated_at 
    BEFORE UPDATE ON public.itens_aprovisionamento_2026_01_06 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. FUNÇÃO PARA ATUALIZAR STOCK (com validações)
CREATE OR REPLACE FUNCTION public.atualizar_stock_item(
    p_item_id UUID,
    p_tipo_movimento VARCHAR(50),
    p_quantidade INTEGER,
    p_motivo TEXT DEFAULT NULL,
    p_documento_referencia VARCHAR(100) DEFAULT NULL,
    p_preco_unitario DECIMAL(10,2) DEFAULT NULL,
    p_voluntario_id VARCHAR(100) DEFAULT NULL,
    p_animal_id VARCHAR(100) DEFAULT NULL,
    p_missao_id VARCHAR(100) DEFAULT NULL,
    p_observacoes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_item RECORD;
    v_quantidade_anterior INTEGER;
    v_quantidade_nova INTEGER;
    v_movimento_id UUID;
BEGIN
    -- Buscar item atual
    SELECT * INTO v_item 
    FROM public.itens_aprovisionamento_2026_01_06 
    WHERE id = p_item_id AND ativo = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Item não encontrado ou inativo');
    END IF;
    
    v_quantidade_anterior := v_item.quantidade_atual;
    
    -- Calcular nova quantidade baseada no tipo de movimento
    IF p_tipo_movimento IN ('ENTRADA_COMPRA', 'ENTRADA_DOACAO', 'ENTRADA_DEVOLUCAO', 'ENTRADA_AJUSTE') THEN
        v_quantidade_nova := v_quantidade_anterior + p_quantidade;
    ELSIF p_tipo_movimento IN ('SAIDA_CONSUMO', 'SAIDA_ATRIBUICAO', 'SAIDA_PERDA', 'SAIDA_AJUSTE') THEN
        v_quantidade_nova := v_quantidade_anterior - p_quantidade;
        
        -- Validar se há stock suficiente
        IF v_quantidade_nova < 0 THEN
            RETURN json_build_object('success', false, 'error', 'Stock insuficiente. Disponível: ' || v_quantidade_anterior);
        END IF;
    ELSE
        RETURN json_build_object('success', false, 'error', 'Tipo de movimento inválido');
    END IF;
    
    -- Atualizar quantidade do item
    UPDATE public.itens_aprovisionamento_2026_01_06 
    SET quantidade_atual = v_quantidade_nova,
        updated_by = auth.uid()
    WHERE id = p_item_id;
    
    -- Registrar movimento
    INSERT INTO public.movimentos_stock_2026_01_06 (
        item_id, tipo_movimento, quantidade, quantidade_anterior, quantidade_nova,
        motivo, documento_referencia, preco_unitario,
        voluntario_id, animal_id, missao_id, observacoes, created_by
    ) VALUES (
        p_item_id, p_tipo_movimento, p_quantidade, v_quantidade_anterior, v_quantidade_nova,
        p_motivo, p_documento_referencia, p_preco_unitario,
        p_voluntario_id, p_animal_id, p_missao_id, p_observacoes, auth.uid()
    ) RETURNING id INTO v_movimento_id;
    
    RETURN json_build_object(
        'success', true, 
        'movimento_id', v_movimento_id,
        'quantidade_anterior', v_quantidade_anterior,
        'quantidade_nova', v_quantidade_nova,
        'alerta_stock_baixo', v_quantidade_nova <= v_item.stock_minimo
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. POLÍTICAS RLS (Permissivas para teste)
ALTER TABLE public.itens_aprovisionamento_2026_01_06 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_stock_2026_01_06 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variacoes_aprovisionamento_2026_01_06 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "itens_all_operations" ON public.itens_aprovisionamento_2026_01_06
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "movimentos_all_operations" ON public.movimentos_stock_2026_01_06
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "variacoes_all_operations" ON public.variacoes_aprovisionamento_2026_01_06
    FOR ALL USING (true) WITH CHECK (true);

-- 8. INSERIR VARIAÇÕES PADRÃO
INSERT INTO public.variacoes_aprovisionamento_2026_01_06 (categoria_id, tipo_variacao, valor, descricao, ordem_exibicao) VALUES
-- Tamanhos para Fardamento e EPI
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'XS', 'Extra Pequeno', 1),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'S', 'Pequeno', 2),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'M', 'Médio', 3),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'L', 'Grande', 4),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'XL', 'Extra Grande', 5),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'XXL', 'Extra Extra Grande', 6),

-- Especificações para Consumíveis Alimentares
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'ESPECIFICACAO', '1kg', 'Saco de 1 quilograma', 1),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'ESPECIFICACAO', '5kg', 'Saco de 5 quilogramas', 2),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'ESPECIFICACAO', '10kg', 'Saco de 10 quilogramas', 3),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'ESPECIFICACAO', '20kg', 'Saco de 20 quilogramas', 4),

-- Especificações para Medicação
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'ESPECIFICACAO', '100ml', 'Frasco de 100ml', 1),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'ESPECIFICACAO', '250ml', 'Frasco de 250ml', 2),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'ESPECIFICACAO', '500ml', 'Frasco de 500ml', 3),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'ESPECIFICACAO', '10 comp', 'Caixa com 10 comprimidos', 4),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'ESPECIFICACAO', '30 comp', 'Caixa com 30 comprimidos', 5);

-- 9. INSERIR ITENS DE EXEMPLO (baseados nos seus exemplos)
INSERT INTO public.itens_aprovisionamento_2026_01_06 (
    tipo_id, nome, descricao, especificacao, quantidade_atual, stock_minimo, 
    preco_unitario, localizacao_fisica, created_by
) VALUES
-- Ração seca (exemplo do usuário)
((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Ração Cão Adulto'), 
 'Ração Seca Cão Adulto 20kg', 'Ração seca premium para cães adultos', '20kg', 
 50, 5, 35.00, 'Armazém A - Prateleira 1', auth.uid()),

-- Blusões XXL (exemplo do usuário) - usando tipo Colete Refletor como base
((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Colete Refletor'), 
 'Blusão Valentão ao Resgate XXL', 'Blusão oficial da associação tamanho XXL', 'XXL', 
 8, 2, 25.00, 'Armazém B - Armário Fardamento', auth.uid()),

-- Outros exemplos
((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Antibiótico'), 
 'Amoxicilina 250ml', 'Antibiótico veterinário de largo espectro', '250ml', 
 12, 3, 15.50, 'Farmácia Veterinária - Frigorífico', auth.uid()),

((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Transportadora Grande'), 
 'Transportadora Plástico Grande', 'Transportadora resistente para cães grandes', 'Grande', 
 6, 2, 45.00, 'Armazém C - Zona Equipamentos', auth.uid());

-- 10. VERIFICAR DADOS INSERIDOS
SELECT 'ITENS CRIADOS' as status, COUNT(*) as total FROM public.itens_aprovisionamento_2026_01_06;
SELECT 'VARIAÇÕES CRIADAS' as status, COUNT(*) as total FROM public.variacoes_aprovisionamento_2026_01_06;

-- 11. TESTAR FUNÇÃO DE MOVIMENTO DE STOCK
SELECT public.atualizar_stock_item(
    (SELECT id FROM public.itens_aprovisionamento_2026_01_06 WHERE nome = 'Ração Seca Cão Adulto 20kg'),
    'ENTRADA_COMPRA',
    10,
    'Compra de stock adicional',
    'FAT-2026-001',
    35.00
) as teste_entrada;

-- 12. VERIFICAR RESULTADO FINAL
SELECT 
    i.nome,
    i.quantidade_atual,
    i.stock_minimo,
    i.alerta_stock_baixo,
    i.valor_total_stock,
    t.nome as tipo,
    c.nome as categoria
FROM public.itens_aprovisionamento_2026_01_06 i
JOIN public.tipos_aprovisionamento_2026_01_06 t ON i.tipo_id = t.id
JOIN public.categorias_aprovisionamento_2026_01_06 c ON t.categoria_id = c.id
ORDER BY c.nome, t.nome, i.nome;