-- Remover campo especialidade obsoleto da tabela voluntários
-- O sistema agora usa a tabela voluntario_especialidades_2025_12_21_22_00 para gerir especialidades

ALTER TABLE voluntarios 
DROP COLUMN IF EXISTS especialidade;