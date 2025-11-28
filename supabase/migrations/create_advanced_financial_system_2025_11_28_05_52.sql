-- 💰 EKO: SISTEMA FINANCEIRO ROBUSTO - CRIADO DO ZERO
-- Data: 2025-11-28 05:52 UTC

-- 🗑️ REMOVER SISTEMA ANTIGO
DROP TABLE IF EXISTS public.movimentos_financeiros CASCADE;
DROP TABLE IF EXISTS public.categorias_financeiras CASCADE;

-- 📊 1. CATEGORIAS FINANCEIRAS AVANÇADAS
CREATE TABLE public.categorias_financeiras_2025_11_28_05_52 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    escopo VARCHAR(20) NOT NULL CHECK (escopo IN ('animal', 'associacao', 'ambos')),
    cor VARCHAR(7) DEFAULT '#6B7280',
    icone VARCHAR(50) DEFAULT 'DollarSign',
    codigo VARCHAR(20) UNIQUE,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💸 2. MOVIMENTOS FINANCEIROS ROBUSTOS
CREATE TABLE public.movimentos_financeiros_2025_11_28_05_52 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_movimento VARCHAR(20) UNIQUE NOT NULL,
    tipo_movimento VARCHAR(20) NOT NULL CHECK (tipo_movimento IN ('receita', 'despesa')),
    escopo VARCHAR(20) NOT NULL CHECK (escopo IN ('animal', 'associacao')),
    categoria_id UUID REFERENCES public.categorias_financeiras_2025_11_28_05_52(id),
    animal_id UUID REFERENCES public.animais(id) NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    data_movimento DATE NOT NULL,
    data_vencimento DATE NULL,
    status VARCHAR(20) DEFAULT 'confirmado' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
    metodo_pagamento VARCHAR(50),
    referencia_externa VARCHAR(100),
    observacoes TEXT,
    tags TEXT[],
    anexos JSONB DEFAULT '[]',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🎯 3. ORÇAMENTOS E METAS
CREATE TABLE public.orcamentos_2025_11_28_05_52 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ano INTEGER NOT NULL,
    mes INTEGER CHECK (mes BETWEEN 1 AND 12),
    categoria_id UUID REFERENCES public.categorias_financeiras_2025_11_28_05_52(id),
    escopo VARCHAR(20) NOT NULL CHECK (escopo IN ('animal', 'associacao')),
    valor_orcado DECIMAL(10,2) NOT NULL,
    valor_gasto DECIMAL(10,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📈 4. RELATÓRIOS SALVOS
CREATE TABLE public.relatorios_financeiros_2025_11_28_05_52 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    parametros JSONB NOT NULL,
    agendamento VARCHAR(20) CHECK (agendamento IN ('manual', 'diario', 'semanal', 'mensal')),
    ativo BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔍 5. AUDITORIA FINANCEIRA
CREATE TABLE public.auditoria_financeira_2025_11_28_05_52 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tabela VARCHAR(50) NOT NULL,
    registro_id UUID NOT NULL,
    acao VARCHAR(20) NOT NULL CHECK (acao IN ('insert', 'update', 'delete')),
    dados_antigos JSONB,
    dados_novos JSONB,
    usuario_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_movimentos_data ON public.movimentos_financeiros_2025_11_28_05_52(data_movimento);
CREATE INDEX idx_movimentos_categoria ON public.movimentos_financeiros_2025_11_28_05_52(categoria_id);
CREATE INDEX idx_movimentos_animal ON public.movimentos_financeiros_2025_11_28_05_52(animal_id);
CREATE INDEX idx_movimentos_escopo ON public.movimentos_financeiros_2025_11_28_05_52(escopo);
CREATE INDEX idx_movimentos_status ON public.movimentos_financeiros_2025_11_28_05_52(status);
CREATE INDEX idx_categorias_escopo ON public.categorias_financeiras_2025_11_28_05_52(escopo);
CREATE INDEX idx_orcamentos_ano_mes ON public.orcamentos_2025_11_28_05_52(ano, mes);

-- 🔄 TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_financeiras_updated_at 
    BEFORE UPDATE ON public.categorias_financeiras_2025_11_28_05_52 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movimentos_financeiros_updated_at 
    BEFORE UPDATE ON public.movimentos_financeiros_2025_11_28_05_52 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orcamentos_updated_at 
    BEFORE UPDATE ON public.orcamentos_2025_11_28_05_52 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 🔢 FUNÇÃO PARA GERAR NÚMERO DE MOVIMENTO
CREATE OR REPLACE FUNCTION gerar_numero_movimento()
RETURNS TEXT AS $$
DECLARE
    ano TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    mes TEXT := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
    contador INTEGER;
    numero TEXT;
BEGIN
    -- Buscar próximo número sequencial do mês
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_movimento FROM 8) AS INTEGER)), 0) + 1
    INTO contador
    FROM public.movimentos_financeiros_2025_11_28_05_52
    WHERE numero_movimento LIKE ano || mes || '%';
    
    numero := ano || mes || LPAD(contador::TEXT, 4, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- 🎯 INSERIR CATEGORIAS PADRÃO PARA ANIMAIS
INSERT INTO public.categorias_financeiras_2025_11_28_05_52 (nome, descricao, tipo, escopo, cor, icone, codigo, ordem) VALUES
-- RECEITAS ANIMAIS
('Donativos para Animal', 'Donativos direcionados para um animal específico', 'receita', 'animal', '#10B981', 'Heart', 'DON_ANIMAL', 1),
('Taxa de Adoção', 'Taxa paga na adoção de um animal', 'receita', 'animal', '#059669', 'Home', 'TAXA_ADOCAO', 2),
('Patrocínio Animal', 'Patrocínio mensal/anual de um animal', 'receita', 'animal', '#047857', 'Star', 'PATROCINIO', 3),

-- DESPESAS ANIMAIS
('Veterinário', 'Consultas, cirurgias e tratamentos veterinários', 'despesa', 'animal', '#EF4444', 'Stethoscope', 'VET', 10),
('Medicação', 'Medicamentos, vacinas e suplementos', 'despesa', 'animal', '#DC2626', 'Pill', 'MED', 11),
('Alimentação Animal', 'Ração e alimentação específica do animal', 'despesa', 'animal', '#B91C1C', 'Cookie', 'ALIM_ANIMAL', 12),
('Transporte Animal', 'Transporte para consultas, adoções, etc.', 'despesa', 'animal', '#991B1B', 'Car', 'TRANSP_ANIMAL', 13),
('Higiene Animal', 'Banhos, tosquia, produtos de higiene', 'despesa', 'animal', '#7F1D1D', 'Scissors', 'HIG_ANIMAL', 14),
('Equipamento Animal', 'Coleiras, trelas, camas, brinquedos', 'despesa', 'animal', '#450A0A', 'Package', 'EQUIP_ANIMAL', 15);

-- 🏢 INSERIR CATEGORIAS PADRÃO PARA ASSOCIAÇÃO
INSERT INTO public.categorias_financeiras_2025_11_28_05_52 (nome, descricao, tipo, escopo, cor, icone, codigo, ordem) VALUES
-- RECEITAS ASSOCIAÇÃO
('Donativos Gerais', 'Donativos para a associação em geral', 'receita', 'associacao', '#3B82F6', 'DollarSign', 'DON_GERAL', 20),
('Subsídios', 'Subsídios governamentais ou de fundações', 'receita', 'associacao', '#2563EB', 'Building', 'SUBSIDIOS', 21),
('Eventos Fundraising', 'Receitas de eventos de angariação de fundos', 'receita', 'associacao', '#1D4ED8', 'Calendar', 'EVENTOS', 22),
('Vendas', 'Vendas de produtos da associação', 'receita', 'associacao', '#1E40AF', 'ShoppingBag', 'VENDAS', 23),
('Parcerias', 'Receitas de parcerias comerciais', 'receita', 'associacao', '#1E3A8A', 'Handshake', 'PARCERIAS', 24),

-- DESPESAS ASSOCIAÇÃO
('Infraestrutura', 'Renda, utilities, manutenção das instalações', 'despesa', 'associacao', '#F59E0B', 'Building2', 'INFRA', 30),
('Recursos Humanos', 'Salários, seguros, formação de funcionários', 'despesa', 'associacao', '#D97706', 'Users', 'RH', 31),
('Alimentação Geral', 'Ração e alimentação para o canil/gatil', 'despesa', 'associacao', '#B45309', 'Utensils', 'ALIM_GERAL', 32),
('Marketing', 'Publicidade, website, redes sociais', 'despesa', 'associacao', '#92400E', 'Megaphone', 'MARKETING', 33),
('Equipamento Geral', 'Equipamentos para as instalações', 'despesa', 'associacao', '#78350F', 'Wrench', 'EQUIP_GERAL', 34),
('Transporte Geral', 'Combustível, manutenção de viaturas', 'despesa', 'associacao', '#451A03', 'Truck', 'TRANSP_GERAL', 35),
('Administrativo', 'Contabilidade, seguros, licenças', 'despesa', 'associacao', '#374151', 'FileText', 'ADMIN', 36),
('Emergências', 'Despesas imprevistas e emergências', 'despesa', 'associacao', '#1F2937', 'AlertTriangle', 'EMERGENCIA', 37);

-- 🔐 POLÍTICAS RLS (ROW LEVEL SECURITY)
ALTER TABLE public.categorias_financeiras_2025_11_28_05_52 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_financeiros_2025_11_28_05_52 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos_2025_11_28_05_52 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios_financeiros_2025_11_28_05_52 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_financeira_2025_11_28_05_52 ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver categorias" ON public.categorias_financeiras_2025_11_28_05_52
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver movimentos" ON public.movimentos_financeiros_2025_11_28_05_52
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir movimentos" ON public.movimentos_financeiros_2025_11_28_05_52
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar movimentos" ON public.movimentos_financeiros_2025_11_28_05_52
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver orçamentos" ON public.orcamentos_2025_11_28_05_52
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver relatórios" ON public.relatorios_financeiros_2025_11_28_05_52
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver auditoria" ON public.auditoria_financeira_2025_11_28_05_52
    FOR SELECT USING (auth.role() = 'authenticated');

-- 📊 VIEWS PARA RELATÓRIOS
CREATE OR REPLACE VIEW vw_resumo_financeiro_animal AS
SELECT 
    a.id as animal_id,
    a.nome as animal_nome,
    a.especie,
    COALESCE(SUM(CASE WHEN m.tipo_movimento = 'receita' THEN m.valor ELSE 0 END), 0) as total_receitas,
    COALESCE(SUM(CASE WHEN m.tipo_movimento = 'despesa' THEN m.valor ELSE 0 END), 0) as total_despesas,
    COALESCE(SUM(CASE WHEN m.tipo_movimento = 'receita' THEN m.valor ELSE -m.valor END), 0) as saldo
FROM public.animais a
LEFT JOIN public.movimentos_financeiros_2025_11_28_05_52 m ON a.id = m.animal_id
WHERE a.arquivado = false
GROUP BY a.id, a.nome, a.especie;

CREATE OR REPLACE VIEW vw_resumo_financeiro_associacao AS
SELECT 
    COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
    COALESCE(SUM(CASE WHEN tipo_movimento = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
    COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE -valor END), 0) as saldo
FROM public.movimentos_financeiros_2025_11_28_05_52
WHERE escopo = 'associacao';

-- ✅ SISTEMA FINANCEIRO ROBUSTO CRIADO COM SUCESSO!