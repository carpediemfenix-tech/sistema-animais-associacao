-- Adicionar campo voluntário_id à tabela de intervenções
ALTER TABLE public.intervencoes_2025_11_13_03_23 
ADD COLUMN voluntario_id UUID REFERENCES public.voluntarios_2025_11_16_18_00(id);

-- Criar índice para melhor performance
CREATE INDEX idx_intervencoes_voluntario_id ON public.intervencoes_2025_11_13_03_23(voluntario_id);