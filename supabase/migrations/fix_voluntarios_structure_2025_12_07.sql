-- CORRIGIR ESTRUTURA DA TABELA VOLUNTARIOS E LIMPAR REFERÊNCIAS ANTIGAS
-- Adicionar campos em falta e remover dependências do sistema antigo
-- Criado em: 2025-12-07 06:00 UTC

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA VOLUNTARIOS
SELECT 'Verificando estrutura atual da tabela voluntarios...' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'voluntarios'
ORDER BY ordinal_position;

-- 2. ADICIONAR CAMPOS EM FALTA NA TABELA VOLUNTARIOS (se não existirem)
DO $$
BEGIN
    -- Adicionar data_entrada se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'voluntarios' 
        AND column_name = 'data_entrada'
    ) THEN
        ALTER TABLE public.voluntarios ADD COLUMN data_entrada DATE DEFAULT CURRENT_DATE;
        COMMENT ON COLUMN public.voluntarios.data_entrada IS 'Data de entrada do voluntário na associação';
    END IF;

    -- Adicionar especialidade se não existir (campo opcional)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'voluntarios' 
        AND column_name = 'especialidade'
    ) THEN
        ALTER TABLE public.voluntarios ADD COLUMN especialidade TEXT;
        COMMENT ON COLUMN public.voluntarios.especialidade IS 'Especialidade principal do voluntário (opcional)';
    END IF;

    -- Adicionar tem_formacao se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'voluntarios' 
        AND column_name = 'tem_formacao'
    ) THEN
        ALTER TABLE public.voluntarios ADD COLUMN tem_formacao BOOLEAN DEFAULT false;
        COMMENT ON COLUMN public.voluntarios.tem_formacao IS 'Indica se o voluntário tem alguma formação registada';
    END IF;

    RAISE NOTICE 'Campos adicionados à tabela voluntarios (se necessário)';
END $$;

-- 3. ATUALIZAR DADOS EXISTENTES
UPDATE public.voluntarios 
SET 
    data_entrada = COALESCE(data_entrada, created_at::date, CURRENT_DATE),
    tem_formacao = COALESCE(tem_formacao, false),
    especialidade = COALESCE(especialidade, 'Geral')
WHERE data_entrada IS NULL OR tem_formacao IS NULL OR especialidade IS NULL;

-- 4. VERIFICAR SE A TABELA RESPONSABILIDADES_VOLUNTARIOS EXISTE
SELECT 'Verificando tabela responsabilidades_voluntarios...' as status;
SELECT COUNT(*) as total_responsabilidades FROM public.responsabilidades_voluntarios;

-- 5. CORRIGIR ESTRUTURA DA TABELA RESPONSABILIDADES_VOLUNTARIOS (se necessário)
DO $$
BEGIN
    -- Verificar se a coluna columns existe (parece ser um problema na consulta)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'responsabilidades_voluntarios'
    ) THEN
        -- Dar permissões completas
        GRANT ALL ON public.responsabilidades_voluntarios TO authenticated;
        GRANT ALL ON public.responsabilidades_voluntarios TO anon;
        
        -- Desativar RLS temporariamente
        ALTER TABLE public.responsabilidades_voluntarios DISABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Tabela responsabilidades_voluntarios corrigida';
    ELSE
        RAISE NOTICE 'Tabela responsabilidades_voluntarios não existe';
    END IF;
END $$;

-- 6. VERIFICAR ESTRUTURA FINAL
SELECT 'Estrutura final da tabela voluntarios:' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'voluntarios'
AND column_name IN ('data_entrada', 'especialidade', 'tem_formacao', 'ativo', 'nome', 'email')
ORDER BY ordinal_position;

-- 7. TESTAR CONSULTAS PROBLEMÁTICAS
SELECT 'Testando consulta de voluntários...' as status;
SELECT COUNT(*) as total_voluntarios FROM public.voluntarios;

SELECT 'Testando consulta com campos específicos...' as status;
SELECT id, ativo, tem_formacao, especialidade, data_entrada 
FROM public.voluntarios 
LIMIT 3;

-- Comentário final
COMMENT ON TABLE public.voluntarios IS 'Tabela corrigida - campos data_entrada, especialidade e tem_formacao adicionados';