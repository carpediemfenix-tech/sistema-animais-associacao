-- Criar tabela de intervenções se não existir
CREATE TABLE IF NOT EXISTS public.intervencoes_animais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID REFERENCES public.animais(id),
    voluntario_responsavel_id UUID REFERENCES public.voluntarios(id),
    tipo_intervencao TEXT NOT NULL,
    data_intervencao DATE NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS para intervenções
ALTER TABLE public.intervencoes_animais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de intervenções para usuários autenticados" ON public.intervencoes_animais
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção de intervenções para usuários autenticados" ON public.intervencoes_animais
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de intervenções para usuários autenticados" ON public.intervencoes_animais
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Inserir alguns dados de exemplo para intervenções
INSERT INTO public.intervencoes_animais (animal_id, voluntario_responsavel_id, tipo_intervencao, data_intervencao, descricao)
SELECT 
    a.id as animal_id,
    v.id as voluntario_responsavel_id,
    'Consulta Veterinária' as tipo_intervencao,
    CURRENT_DATE - INTERVAL '30 days' as data_intervencao,
    'Consulta de rotina e vacinação' as descricao
FROM public.animais a
CROSS JOIN public.voluntarios v
WHERE a.arquivado = false 
AND v.ativo = true
LIMIT 5
ON CONFLICT DO NOTHING;

-- Verificar se existe relacionamento entre participações e missões
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'participacoes_missoes_2025_12_29_07_00';