-- 🔧 EKO: SOLUÇÃO ALTERNATIVA PARA CATEGORIAS FINANCEIRAS
-- Data: 2025-11-28 06:15 UTC

-- 1. Remover tabela antiga se existir
DROP TABLE IF EXISTS public.categorias_financeiras CASCADE;

-- 2. Criar tabela com nome simples
CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
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

-- 3. Inserir categorias padrão
INSERT INTO public.categorias_financeiras (nome, descricao, tipo, escopo, cor, icone, codigo, ordem, ativo) VALUES
-- RECEITAS ANIMAIS
('Donativos para Animal', 'Donativos direcionados para um animal específico', 'receita', 'animal', '#10B981', 'Heart', 'DON_ANIMAL', 1, true),
('Taxa de Adoção', 'Taxa paga na adoção de um animal', 'receita', 'animal', '#059669', 'Home', 'TAXA_ADOCAO', 2, true),
('Patrocínio Animal', 'Patrocínio mensal/anual de um animal', 'receita', 'animal', '#047857', 'Star', 'PATROCINIO', 3, true),

-- DESPESAS ANIMAIS
('Veterinário', 'Consultas, cirurgias e tratamentos veterinários', 'despesa', 'animal', '#EF4444', 'Stethoscope', 'VET', 10, true),
('Medicação', 'Medicamentos, vacinas e suplementos', 'despesa', 'animal', '#DC2626', 'Pill', 'MED', 11, true),
('Alimentação Animal', 'Ração e alimentação específica do animal', 'despesa', 'animal', '#B91C1C', 'Cookie', 'ALIM_ANIMAL', 12, true),
('Transporte Animal', 'Transporte para consultas, adoções, etc.', 'despesa', 'animal', '#991B1B', 'Car', 'TRANSP_ANIMAL', 13, true),
('Higiene Animal', 'Banhos, tosquia, produtos de higiene', 'despesa', 'animal', '#7F1D1D', 'Scissors', 'HIG_ANIMAL', 14, true),
('Equipamento Animal', 'Coleiras, trelas, camas, brinquedos', 'despesa', 'animal', '#450A0A', 'Package', 'EQUIP_ANIMAL', 15, true),

-- RECEITAS ASSOCIAÇÃO
('Donativos Gerais', 'Donativos para a associação em geral', 'receita', 'associacao', '#3B82F6', 'DollarSign', 'DON_GERAL', 20, true),
('Subsídios', 'Subsídios governamentais ou de fundações', 'receita', 'associacao', '#2563EB', 'Building', 'SUBSIDIOS', 21, true),
('Eventos Fundraising', 'Receitas de eventos de angariação de fundos', 'receita', 'associacao', '#1D4ED8', 'Calendar', 'EVENTOS', 22, true),
('Vendas', 'Vendas de produtos da associação', 'receita', 'associacao', '#1E40AF', 'ShoppingBag', 'VENDAS', 23, true),
('Parcerias', 'Receitas de parcerias comerciais', 'receita', 'associacao', '#1E3A8A', 'Handshake', 'PARCERIAS', 24, true),

-- DESPESAS ASSOCIAÇÃO
('Infraestrutura', 'Renda, utilities, manutenção das instalações', 'despesa', 'associacao', '#F59E0B', 'Building2', 'INFRA', 30, true),
('Recursos Humanos', 'Salários, seguros, formação de funcionários', 'despesa', 'associacao', '#D97706', 'Users', 'RH', 31, true),
('Alimentação Geral', 'Ração e alimentação para o canil/gatil', 'despesa', 'associacao', '#B45309', 'Utensils', 'ALIM_GERAL', 32, true),
('Marketing', 'Publicidade, website, redes sociais', 'despesa', 'associacao', '#92400E', 'Megaphone', 'MARKETING', 33, true),
('Equipamento Geral', 'Equipamentos para as instalações', 'despesa', 'associacao', '#78350F', 'Wrench', 'EQUIP_GERAL', 34, true),
('Transporte Geral', 'Combustível, manutenção de viaturas', 'despesa', 'associacao', '#451A03', 'Truck', 'TRANSP_GERAL', 35, true),
('Administrativo', 'Contabilidade, seguros, licenças', 'despesa', 'associacao', '#374151', 'FileText', 'ADMIN', 36, true),
('Emergências', 'Despesas imprevistas e emergências', 'despesa', 'associacao', '#1F2937', 'AlertTriangle', 'EMERGENCIA', 37, true)
ON CONFLICT (codigo) DO NOTHING;

-- 4. Recriar tabela de movimentos para usar nome simples
DROP TABLE IF EXISTS public.movimentos_financeiros CASCADE;

CREATE TABLE public.movimentos_financeiros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_movimento VARCHAR(20) UNIQUE NOT NULL,
    tipo_movimento VARCHAR(20) NOT NULL CHECK (tipo_movimento IN ('receita', 'despesa')),
    escopo VARCHAR(20) NOT NULL CHECK (escopo IN ('animal', 'associacao')),
    categoria_id UUID REFERENCES public.categorias_financeiras(id),
    animal_id UUID REFERENCES public.animais(id) NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    data_movimento DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmado' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
    metodo_pagamento VARCHAR(50),
    observacoes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Políticas RLS simples
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_financeiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver categorias" ON public.categorias_financeiras
    FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem ver movimentos" ON public.movimentos_financeiros
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir movimentos" ON public.movimentos_financeiros
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Recriar função de numeração
CREATE OR REPLACE FUNCTION gerar_numero_movimento()
RETURNS TEXT AS $$
DECLARE
    ano TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    mes TEXT := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
    contador INTEGER;
    numero TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_movimento FROM 8) AS INTEGER)), 0) + 1
    INTO contador
    FROM public.movimentos_financeiros
    WHERE numero_movimento LIKE ano || mes || '%';
    
    numero := ano || mes || LPAD(contador::TEXT, 4, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- 7. Verificar resultado final
SELECT COUNT(*) as total_categorias FROM public.categorias_financeiras WHERE ativo = true;
SELECT id, nome, tipo, escopo FROM public.categorias_financeiras WHERE ativo = true ORDER BY ordem LIMIT 5;