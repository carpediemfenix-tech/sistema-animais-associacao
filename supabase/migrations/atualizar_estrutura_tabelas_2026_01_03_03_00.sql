-- 1. Adicionar colunas em falta na tabela especialidades_voluntarios_2025_12_21_22_00
ALTER TABLE public.especialidades_voluntarios_2025_12_21_22_00 
ADD COLUMN IF NOT EXISTS codigo VARCHAR(50),
ADD COLUMN IF NOT EXISTS cor VARCHAR(20) DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS icone VARCHAR(50) DEFAULT 'User',
ADD COLUMN IF NOT EXISTS pontos_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS requer_certificacao BOOLEAN DEFAULT false;

-- 2. Adicionar colunas em falta na tabela voluntario_especialidades_2025_12_21_22_00
ALTER TABLE public.voluntario_especialidades_2025_12_21_22_00 
ADD COLUMN IF NOT EXISTS nivel_experiencia VARCHAR(20) DEFAULT 'iniciante',
ADD COLUMN IF NOT EXISTS data_certificacao DATE,
ADD COLUMN IF NOT EXISTS certificado_valido_ate DATE,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 3. Adicionar constraint para nivel_experiencia se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'voluntario_especialidades_2025_12_21_22_00_nivel_experiencia_check'
    ) THEN
        ALTER TABLE public.voluntario_especialidades_2025_12_21_22_00 
        ADD CONSTRAINT voluntario_especialidades_2025_12_21_22_00_nivel_experiencia_check 
        CHECK (nivel_experiencia IN ('iniciante', 'intermediario', 'avancado', 'expert'));
    END IF;
END $$;

-- Verificar estrutura atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'especialidades_voluntarios_2025_12_21_22_00'
ORDER BY ordinal_position;