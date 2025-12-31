-- ========================================
-- CORREÇÃO COMPLETA DO WIZARD DE DENÚNCIAS
-- ========================================

-- 1. CORRIGIR TABELA ANIMAIS - Adicionar campos faltantes
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS local_completo TEXT;

ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Remover constraints NOT NULL problemáticas se existirem
ALTER TABLE public.animais 
ALTER COLUMN especie_id DROP NOT NULL;

ALTER TABLE public.animais 
ALTER COLUMN idade_estimada DROP NOT NULL;

-- 2. CORRIGIR TABELA MISSOES - Verificar campos obrigatórios
ALTER TABLE public.missoes_2025_12_29_07_00 
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 3. CORRIGIR TABELA PARTICIPACOES - Verificar campos obrigatórios
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 4. CORRIGIR TABELA MISSOES_ANIMAIS - Verificar campos obrigatórios
ALTER TABLE public.missoes_animais_2025_12_29_07_00 
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 5. VERIFICAR RESULTADO FINAL - ANIMAIS
SELECT 
    'ANIMAIS - ESTRUTURA FINAL' as tabela,
    column_name, 
    data_type, 
    is_nullable,
    CASE 
        WHEN is_nullable = 'NO' AND column_default IS NULL THEN 'OBRIGATÓRIO'
        ELSE 'OPCIONAL'
    END as status
FROM information_schema.columns 
WHERE table_name = 'animais' 
ORDER BY ordinal_position;

-- 6. VERIFICAR CAMPOS OBRIGATÓRIOS FINAIS
SELECT 
    'CAMPOS OBRIGATÓRIOS RESTANTES' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN (
    'denuncias_2025_12_29_23_00',
    'animais',
    'missoes_2025_12_29_07_00',
    'participacoes_missoes_2025_12_29_07_00',
    'missoes_animais_2025_12_29_07_00'
)
AND is_nullable = 'NO'
AND column_default IS NULL
AND column_name NOT IN ('id', 'created_at', 'updated_at')
ORDER BY table_name, column_name;