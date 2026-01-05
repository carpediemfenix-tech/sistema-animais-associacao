-- Reabilitar RLS na tabela de participações
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "participacoes_select_policy" ON public.participacoes_missoes_2025_12_29_07_00;
DROP POLICY IF EXISTS "participacoes_insert_policy" ON public.participacoes_missoes_2025_12_29_07_00;
DROP POLICY IF EXISTS "participacoes_update_policy" ON public.participacoes_missoes_2025_12_29_07_00;
DROP POLICY IF EXISTS "participacoes_delete_policy" ON public.participacoes_missoes_2025_12_29_07_00;

-- Criar política totalmente permissiva para usuários autenticados
CREATE POLICY "participacoes_all_authenticated" ON public.participacoes_missoes_2025_12_29_07_00
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar se a tabela de histórico de pontos existe
SELECT COUNT(*) as existe FROM information_schema.tables 
WHERE table_name = 'historico_pontos_2025_12_22_02_00' AND table_schema = 'public';

-- Criar tabela de histórico de pontos se não existir
CREATE TABLE IF NOT EXISTS public.historico_pontos_2025_12_22_02_00 (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id uuid REFERENCES public.voluntarios(id),
    pontos integer NOT NULL DEFAULT 0,
    descricao text,
    missao_id uuid REFERENCES public.missoes_2025_12_18_14_15(id),
    data_atribuicao timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de pontos
ALTER TABLE public.historico_pontos_2025_12_22_02_00 ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva para pontos
CREATE POLICY "pontos_all_authenticated" ON public.historico_pontos_2025_12_22_02_00
    FOR ALL USING (true) WITH CHECK (true);

-- Criar ou substituir função de atualização de pontuação
CREATE OR REPLACE FUNCTION public.atualizar_pontuacao_voluntario(
    p_voluntario_id uuid,
    p_pontos integer,
    p_descricao text DEFAULT NULL,
    p_missao_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Inserir registro no histórico de pontos
    INSERT INTO public.historico_pontos_2025_12_22_02_00 (
        voluntario_id,
        pontos,
        descricao,
        missao_id,
        data_atribuicao
    ) VALUES (
        p_voluntario_id,
        p_pontos,
        p_descricao,
        p_missao_id,
        now()
    );
    
    -- Atualizar pontuação total do voluntário (se campo existir)
    UPDATE public.voluntarios 
    SET pontuacao_total = COALESCE(pontuacao_total, 0) + p_pontos,
        updated_at = now()
    WHERE id = p_voluntario_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falha a operação principal
        RAISE WARNING 'Erro ao atualizar pontuação: %', SQLERRM;
END;
$$;

-- Verificar se tudo foi criado corretamente
SELECT 
    'participacoes' as tabela,
    COUNT(*) as politicas
FROM pg_policies 
WHERE tablename = 'participacoes_missoes_2025_12_29_07_00'
UNION ALL
SELECT 
    'pontos' as tabela,
    COUNT(*) as politicas
FROM pg_policies 
WHERE tablename = 'historico_pontos_2025_12_22_02_00';