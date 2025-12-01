-- Corrigir constraint de sexo para aceitar 'Indeterminado'
-- Remover constraint existente
ALTER TABLE animais DROP CONSTRAINT IF EXISTS animais_sexo_check;

-- Adicionar nova constraint que aceita 'Indeterminado'
ALTER TABLE animais ADD CONSTRAINT animais_sexo_check 
CHECK (sexo IN ('Macho', 'Fêmea', 'Indeterminado'));

-- Verificar se a constraint foi aplicada corretamente
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'animais_sexo_check';

-- Comentário para documentação
COMMENT ON CONSTRAINT animais_sexo_check ON animais IS 'Constraint que permite Macho, Fêmea ou Indeterminado para o campo sexo';