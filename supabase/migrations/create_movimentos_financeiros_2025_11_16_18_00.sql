-- Criar tabela de movimentos financeiros
CREATE TABLE public.movimentos_financeiros_2025_11_16_18_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID REFERENCES public.animais_2025_11_13_03_23(id) ON DELETE CASCADE,
    tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('Receita', 'Despesa')),
    categoria TEXT NOT NULL CHECK (categoria IN ('Veterinário', 'Medicação', 'Alimentação', 'Transporte', 'Doação', 'Adoção', 'Outros')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_movimento DATE DEFAULT CURRENT_DATE,
    voluntario_id UUID REFERENCES public.voluntarios_2025_11_16_18_00(id),
    intervencao_id UUID REFERENCES public.intervencoes_2025_11_13_03_23(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_movimentos_animal_id ON public.movimentos_financeiros_2025_11_16_18_00(animal_id);
CREATE INDEX idx_movimentos_tipo ON public.movimentos_financeiros_2025_11_16_18_00(tipo_movimento);
CREATE INDEX idx_movimentos_categoria ON public.movimentos_financeiros_2025_11_16_18_00(categoria);
CREATE INDEX idx_movimentos_data ON public.movimentos_financeiros_2025_11_16_18_00(data_movimento);

-- Habilitar RLS
ALTER TABLE public.movimentos_financeiros_2025_11_16_18_00 ENABLE ROW LEVEL SECURITY;

-- Criar política RLS
CREATE POLICY "Permitir acesso público aos movimentos financeiros" ON public.movimentos_financeiros_2025_11_16_18_00
FOR ALL USING (true);