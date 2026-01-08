-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'historico_nomes_animais'
) as tabela_existe;

-- Se não existir, criar a tabela
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'historico_nomes_animais'
    ) THEN
        -- Criar tabela de histórico de nomes
        CREATE TABLE public.historico_nomes_animais (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            animal_id UUID NOT NULL,
            nome VARCHAR(200) NOT NULL,
            data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            data_fim TIMESTAMP WITH TIME ZONE,
            ativo BOOLEAN DEFAULT true,
            motivo_alteracao TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES auth.users(id)
        );
        
        -- Índices
        CREATE INDEX idx_historico_nomes_animal ON public.historico_nomes_animais(animal_id);
        CREATE INDEX idx_historico_nomes_data ON public.historico_nomes_animais(data_inicio);
        
        -- RLS
        ALTER TABLE public.historico_nomes_animais ENABLE ROW LEVEL SECURITY;
        
        -- Políticas RLS
        CREATE POLICY "historico_nomes_select_policy" ON public.historico_nomes_animais
            FOR SELECT USING (true);
            
        CREATE POLICY "historico_nomes_insert_policy" ON public.historico_nomes_animais
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            
        CREATE POLICY "historico_nomes_update_policy" ON public.historico_nomes_animais
            FOR UPDATE USING (auth.role() = 'authenticated');
            
        RAISE NOTICE 'Tabela historico_nomes_animais criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela historico_nomes_animais já existe';
    END IF;
END $$;

-- Inserir dados de teste para o animal específico
INSERT INTO public.historico_nomes_animais (
    animal_id,
    nome,
    data_inicio,
    data_fim,
    ativo,
    motivo_alteracao
) VALUES 
(
    '67daf5d6-b573-4c74-81d7-a1065f8786e1'::uuid,
    'Rex',
    '2024-01-15 10:00:00+00',
    '2024-03-20 14:30:00+00',
    false,
    'Nome inicial quando foi encontrado'
),
(
    '67daf5d6-b573-4c74-81d7-a1065f8786e1'::uuid,
    'Bobby',
    '2024-03-20 14:30:00+00',
    '2024-06-10 09:15:00+00',
    false,
    'Mudança de nome após adaptação'
),
(
    '67daf5d6-b573-4c74-81d7-a1065f8786e1'::uuid,
    'Max',
    '2024-06-10 09:15:00+00',
    null,
    true,
    'Nome definitivo escolhido pela família adotiva'
)
ON CONFLICT DO NOTHING;

-- Verificar dados inseridos
SELECT 
    'Dados de teste criados' as status,
    COUNT(*) as total_historicos
FROM public.historico_nomes_animais 
WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1'::uuid;