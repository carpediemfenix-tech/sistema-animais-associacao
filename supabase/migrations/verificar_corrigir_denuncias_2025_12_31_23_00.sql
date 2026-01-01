-- =====================================================
-- VERIFICAR E CORRIGIR ESTRUTURA DA TABELA DENUNCIAS
-- =====================================================

-- 1. Verificar estrutura atual da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'denuncias_2025_12_29_23_00'
AND tc.table_schema = 'public';

-- 3. Adicionar campos que podem estar faltando
ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS local_completo TEXT,
ADD COLUMN IF NOT EXISTS observacoes_gestao TEXT,
ADD COLUMN IF NOT EXISTS responsavel_gestao_id UUID,
ADD COLUMN IF NOT EXISTS updated_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Remover constraints problemáticas se existirem
DO $$
BEGIN
    -- Tentar remover constraint de check se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'denuncias_2025_12_29_23_00_status_denuncia_check' 
        AND table_name = 'denuncias_2025_12_29_23_00'
    ) THEN
        ALTER TABLE public.denuncias_2025_12_29_23_00 
        DROP CONSTRAINT denuncias_2025_12_29_23_00_status_denuncia_check;
    END IF;
    
    -- Tentar remover constraint de prioridade se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'denuncias_2025_12_29_23_00_prioridade_check' 
        AND table_name = 'denuncias_2025_12_29_23_00'
    ) THEN
        ALTER TABLE public.denuncias_2025_12_29_23_00 
        DROP CONSTRAINT denuncias_2025_12_29_23_00_prioridade_check;
    END IF;
END $$;

-- 5. Adicionar constraints corretas
ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD CONSTRAINT status_denuncia_check 
CHECK (status_denuncia IN ('nova', 'em_andamento', 'concluida'));

ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD CONSTRAINT prioridade_check 
CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente'));

-- 6. Atualizar trigger de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_denuncias_updated_at ON public.denuncias_2025_12_29_23_00;
CREATE TRIGGER update_denuncias_updated_at
    BEFORE UPDATE ON public.denuncias_2025_12_29_23_00
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Verificar dados de exemplo
SELECT 
    codigo,
    status_denuncia,
    prioridade,
    local_encontrado,
    local_completo,
    observacoes_gestao,
    updated_by,
    updated_at
FROM public.denuncias_2025_12_29_23_00 
LIMIT 3;

-- 8. Comentários
COMMENT ON COLUMN public.denuncias_2025_12_29_23_00.local_completo IS 'Endereço completo do local da denúncia';
COMMENT ON COLUMN public.denuncias_2025_12_29_23_00.observacoes_gestao IS 'Observações administrativas sobre a denúncia';
COMMENT ON COLUMN public.denuncias_2025_12_29_23_00.responsavel_gestao_id IS 'ID do usuário responsável pela gestão da denúncia';
COMMENT ON COLUMN public.denuncias_2025_12_29_23_00.updated_by IS 'ID do usuário que fez a última atualização';
COMMENT ON COLUMN public.denuncias_2025_12_29_23_00.updated_at IS 'Timestamp da última atualização';

-- =====================================================
-- FIM DA VERIFICAÇÃO E CORREÇÃO
-- =====================================================