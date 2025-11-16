-- Adicionar campo arquivado à tabela de animais
ALTER TABLE public.animais_2025_11_13_03_23 
ADD COLUMN arquivado BOOLEAN DEFAULT FALSE;

-- Atualizar o tipo enum para incluir "Não Adotável"
ALTER TYPE situacao_animal ADD VALUE 'Não Adotável';