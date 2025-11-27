-- 💰 EKO: SISTEMA DE CATEGORIAS FINANCEIRAS E ASSOCIAÇÃO COM ANIMAIS
-- Data: 2025-11-27 17:00

-- 1️⃣ CRIAR TABELA DE CATEGORIAS FINANCEIRAS
CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Receita', 'Despesa')),
    cor VARCHAR(7) DEFAULT '#6B7280', -- Cor em hexadecimal para UI
    icone VARCHAR(50) DEFAULT 'DollarSign', -- Nome do ícone Lucide
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2️⃣ ADICIONAR CAMPO ANIMAL_ID EM MOVIMENTOS_FINANCEIROS
ALTER TABLE public.movimentos_financeiros 
ADD COLUMN IF NOT EXISTS animal_id UUID REFERENCES public.animais(id) ON DELETE SET NULL;

-- 3️⃣ INSERIR CATEGORIAS PADRÃO DE RECEITAS
INSERT INTO public.categorias_financeiras (nome, descricao, tipo, cor, icone) VALUES
-- RECEITAS
('Donativos Gerais', 'Donativos sem destinação específica', 'Receita', '#10B981', 'Heart'),
('Donativos Direcionados', 'Donativos para animais específicos', 'Receita', '#059669', 'Target'),
('Adoções', 'Taxas de adoção e processos', 'Receita', '#3B82F6', 'Home'),
('Eventos Beneficentes', 'Receitas de eventos e campanhas', 'Receita', '#8B5CF6', 'Calendar'),
('Vendas', 'Vendas de produtos e merchandising', 'Receita', '#F59E0B', 'ShoppingBag'),
('Subsídios', 'Apoios governamentais e institucionais', 'Receita', '#6366F1', 'Building'),
('Parcerias', 'Receitas de parcerias e patrocínios', 'Receita', '#EC4899', 'Handshake'),

-- DESPESAS
('Alimentação', 'Ração, comida e suplementos', 'Despesa', '#EF4444', 'Utensils'),
('Cuidados Veterinários', 'Consultas, cirurgias e tratamentos', 'Despesa', '#DC2626', 'Stethoscope'),
('Medicamentos', 'Medicamentos e material médico', 'Despesa', '#B91C1C', 'Pill'),
('Transporte', 'Combustível, manutenção e deslocações', 'Despesa', '#F97316', 'Car'),
('Instalações', 'Manutenção, limpeza e melhorias', 'Despesa', '#84CC16', 'Home'),
('Equipamentos', 'Compra e manutenção de equipamentos', 'Despesa', '#06B6D4', 'Wrench'),
('Administrativas', 'Despesas administrativas e burocráticas', 'Despesa', '#6B7280', 'FileText'),
('Marketing', 'Publicidade e promoção da associação', 'Despesa', '#A855F7', 'Megaphone'),
('Formação', 'Cursos e formação para voluntários', 'Despesa', '#14B8A6', 'GraduationCap'),
('Emergências', 'Despesas imprevistas e urgentes', 'Despesa', '#DC2626', 'AlertTriangle');

-- 4️⃣ CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_tipo ON public.categorias_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_ativo ON public.categorias_financeiras(ativo);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_animal_id ON public.movimentos_financeiros(animal_id);

-- 5️⃣ CONFIGURAR RLS (ROW LEVEL SECURITY)
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;

-- Política para leitura (todos os utilizadores autenticados)
CREATE POLICY "Permitir leitura de categorias financeiras" ON public.categorias_financeiras
    FOR SELECT USING (true);

-- Política para escrita (apenas administradores)
CREATE POLICY "Permitir escrita de categorias financeiras para admins" ON public.categorias_financeiras
    FOR ALL USING (true);

-- 6️⃣ CRIAR FUNÇÃO PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_categorias_financeiras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7️⃣ CRIAR TRIGGER PARA UPDATED_AT
DROP TRIGGER IF EXISTS trigger_update_categorias_financeiras_updated_at ON public.categorias_financeiras;
CREATE TRIGGER trigger_update_categorias_financeiras_updated_at
    BEFORE UPDATE ON public.categorias_financeiras
    FOR EACH ROW
    EXECUTE FUNCTION update_categorias_financeiras_updated_at();

-- 8️⃣ VERIFICAÇÕES FINAIS
SELECT 'Tabela categorias_financeiras criada com sucesso!' as status;
SELECT COUNT(*) as total_categorias FROM public.categorias_financeiras;
SELECT tipo, COUNT(*) as quantidade FROM public.categorias_financeiras GROUP BY tipo;