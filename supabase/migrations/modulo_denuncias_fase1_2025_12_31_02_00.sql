-- ========================================
-- MÓDULO DE GESTÃO DE DENÚNCIAS - FASE 1
-- ========================================

-- 1. Adicionar campos de gestão na tabela de denúncias
ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS status_denuncia VARCHAR(50) DEFAULT 'nova',
ADD COLUMN IF NOT EXISTS prioridade VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS data_conclusao DATE,
ADD COLUMN IF NOT EXISTS observacoes_gestao TEXT,
ADD COLUMN IF NOT EXISTS responsavel_gestao_id UUID,
ADD COLUMN IF NOT EXISTS arquivada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_arquivamento TIMESTAMP,
ADD COLUMN IF NOT EXISTS arquivada_por UUID;

-- 2. Criar tabela de histórico de status
CREATE TABLE IF NOT EXISTS public.historico_denuncias_2025_12_31_02_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    denuncia_id UUID REFERENCES public.denuncias_2025_12_29_23_00(id),
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50),
    observacoes TEXT,
    alterado_por UUID,
    data_alteracao TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_denuncias_status ON public.denuncias_2025_12_29_23_00(status_denuncia);
CREATE INDEX IF NOT EXISTS idx_denuncias_data ON public.denuncias_2025_12_29_23_00(data_denuncia);
CREATE INDEX IF NOT EXISTS idx_denuncias_arquivada ON public.denuncias_2025_12_29_23_00(arquivada);
CREATE INDEX IF NOT EXISTS idx_historico_denuncia ON public.historico_denuncias_2025_12_31_02_00(denuncia_id);

-- 4. Atualizar denúncias existentes com status padrão
UPDATE public.denuncias_2025_12_29_23_00 
SET status_denuncia = 'nova' 
WHERE status_denuncia IS NULL;

-- 5. Verificar estrutura final
SELECT 
    'ESTRUTURA DENUNCIAS ATUALIZADA' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
AND column_name IN ('status_denuncia', 'prioridade', 'data_conclusao', 'observacoes_gestao', 'arquivada')
ORDER BY column_name;

-- 6. Contar denúncias por status
SELECT 
    'ESTATÍSTICAS ATUAIS' as info,
    status_denuncia,
    COUNT(*) as total
FROM public.denuncias_2025_12_29_23_00 
GROUP BY status_denuncia
ORDER BY total DESC;