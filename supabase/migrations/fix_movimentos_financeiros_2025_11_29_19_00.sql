-- Verificar se a tabela existe e criar/corrigir a estrutura
-- Primeiro, vamos dropar a tabela se existir para recriar com estrutura correta
DROP TABLE IF EXISTS public.movimentos_financeiros CASCADE;

-- Criar tabela movimentos_financeiros com estrutura correta
CREATE TABLE public.movimentos_financeiros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID REFERENCES public.animais(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES public.categorias_financeiras(id) ON DELETE RESTRICT,
    tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    data_movimento DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_movimentos_financeiros_animal_id ON public.movimentos_financeiros(animal_id);
CREATE INDEX idx_movimentos_financeiros_categoria_id ON public.movimentos_financeiros(categoria_id);
CREATE INDEX idx_movimentos_financeiros_data ON public.movimentos_financeiros(data_movimento);
CREATE INDEX idx_movimentos_financeiros_tipo ON public.movimentos_financeiros(tipo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_movimentos_financeiros_updated_at 
    BEFORE UPDATE ON public.movimentos_financeiros 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.movimentos_financeiros ENABLE ROW LEVEL SECURITY;

-- Policy para leitura (todos os usuários autenticados podem ver)
CREATE POLICY "Permitir leitura de movimentos financeiros" ON public.movimentos_financeiros
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy para inserção (todos os usuários autenticados podem inserir)
CREATE POLICY "Permitir inserção de movimentos financeiros" ON public.movimentos_financeiros
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy para atualização (todos os usuários autenticados podem atualizar)
CREATE POLICY "Permitir atualização de movimentos financeiros" ON public.movimentos_financeiros
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy para eliminação (todos os usuários autenticados podem eliminar)
CREATE POLICY "Permitir eliminação de movimentos financeiros" ON public.movimentos_financeiros
    FOR DELETE USING (auth.role() = 'authenticated');

-- Inserir alguns dados de exemplo para teste
INSERT INTO public.movimentos_financeiros (animal_id, categoria_id, tipo, descricao, valor, data_movimento, observacoes)
SELECT 
    a.id,
    cf.id,
    'despesa',
    'Consulta veterinária de rotina',
    45.00,
    CURRENT_DATE - INTERVAL '7 days',
    'Consulta de rotina e vacinação'
FROM public.animais a
CROSS JOIN public.categorias_financeiras cf
WHERE cf.nome ILIKE '%veterinari%' AND cf.tipo = 'despesa'
LIMIT 1;

-- Comentário sobre a tabela
COMMENT ON TABLE public.movimentos_financeiros IS 'Tabela para registrar movimentos financeiros (receitas e despesas) associados aos animais da associação';