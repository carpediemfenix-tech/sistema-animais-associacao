-- Criar tabela para histórico de localizações
CREATE TABLE public.historico_localizacoes_2025_11_16_18_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais_2025_11_13_03_23(id) ON DELETE CASCADE,
    localizacao TEXT NOT NULL CHECK (localizacao IN ('Canil', 'CRO', 'FAT', 'Rua', 'Outro')),
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_saida TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_historico_localizacoes_animal_id ON public.historico_localizacoes_2025_11_16_18_00(animal_id);
CREATE INDEX idx_historico_localizacoes_data_entrada ON public.historico_localizacoes_2025_11_16_18_00(data_entrada);

-- Habilitar RLS
ALTER TABLE public.historico_localizacoes_2025_11_16_18_00 ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para acesso público (mesmo padrão das outras tabelas)
CREATE POLICY "Permitir acesso público ao histórico de localizações" ON public.historico_localizacoes_2025_11_16_18_00
FOR ALL USING (true);