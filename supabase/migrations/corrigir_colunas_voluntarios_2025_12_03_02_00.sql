-- Corrigir colunas em falta nas tabelas de voluntários
-- Data: 2025-12-03 02:00 UTC

-- 1. Adicionar coluna 'morada' à tabela voluntarios se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'morada') THEN
        ALTER TABLE public.voluntarios ADD COLUMN morada TEXT;
        COMMENT ON COLUMN public.voluntarios.morada IS 'Morada/endereço do voluntário';
    END IF;
END $$;

-- 2. Adicionar coluna 'data_progressao' à tabela voluntario_progressao se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntario_progressao' AND column_name = 'data_progressao') THEN
        ALTER TABLE public.voluntario_progressao ADD COLUMN data_progressao DATE DEFAULT CURRENT_DATE;
        COMMENT ON COLUMN public.voluntario_progressao.data_progressao IS 'Data da progressão de nível';
    END IF;
END $$;

-- 3. Verificar e adicionar outras colunas essenciais se não existirem

-- Coluna 'telefone' na tabela voluntarios
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'telefone') THEN
        ALTER TABLE public.voluntarios ADD COLUMN telefone VARCHAR(20);
        COMMENT ON COLUMN public.voluntarios.telefone IS 'Número de telefone do voluntário';
    END IF;
END $$;

-- Coluna 'data_nascimento' na tabela voluntarios
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'data_nascimento') THEN
        ALTER TABLE public.voluntarios ADD COLUMN data_nascimento DATE;
        COMMENT ON COLUMN public.voluntarios.data_nascimento IS 'Data de nascimento do voluntário';
    END IF;
END $$;

-- Coluna 'observacoes' na tabela voluntario_progressao
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntario_progressao' AND column_name = 'observacoes') THEN
        ALTER TABLE public.voluntario_progressao ADD COLUMN observacoes TEXT;
        COMMENT ON COLUMN public.voluntario_progressao.observacoes IS 'Observações sobre a progressão';
    END IF;
END $$;

-- 4. Atualizar dados existentes se necessário
UPDATE public.voluntario_progressao 
SET data_progressao = CURRENT_DATE 
WHERE data_progressao IS NULL;

-- 5. Verificar estrutura das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('voluntarios', 'voluntario_progressao', 'niveis_formacao')
ORDER BY table_name, ordinal_position;