-- Correção das Políticas RLS para Intervenções das Autoridades
-- Criada em: 2025-12-18 04:50 UTC

-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários autenticados podem ver intervenções" ON public.intervencoes_autoridades_2025_12_18_04_50;
DROP POLICY IF EXISTS "Usuários autenticados podem criar intervenções" ON public.intervencoes_autoridades_2025_12_18_04_50;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar intervenções" ON public.intervencoes_autoridades_2025_12_18_04_50;
DROP POLICY IF EXISTS "Usuários autenticados podem excluir intervenções" ON public.intervencoes_autoridades_2025_12_18_04_50;

-- Políticas RLS simplificadas e funcionais
-- Policy para SELECT (leitura)
CREATE POLICY "Permitir leitura para usuários autenticados" ON public.intervencoes_autoridades_2025_12_18_04_50
    FOR SELECT USING (
        auth.uid() IS NOT NULL
    );

-- Policy para INSERT (criação)
CREATE POLICY "Permitir inserção para usuários autenticados" ON public.intervencoes_autoridades_2025_12_18_04_50
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Policy para UPDATE (atualização)
CREATE POLICY "Permitir atualização para usuários autenticados" ON public.intervencoes_autoridades_2025_12_18_04_50
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
    ) WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Policy para DELETE (exclusão)
CREATE POLICY "Permitir exclusão para usuários autenticados" ON public.intervencoes_autoridades_2025_12_18_04_50
    FOR DELETE USING (
        auth.uid() IS NOT NULL
    );

-- Verificar se RLS está habilitado
ALTER TABLE public.intervencoes_autoridades_2025_12_18_04_50 ENABLE ROW LEVEL SECURITY;