-- Verificar estrutura da tabela responsabilidades_voluntarios
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'responsabilidades_voluntarios'
ORDER BY ordinal_position;

-- Verificar dados de exemplo das responsabilidades
SELECT 
    rv.id,
    rv.voluntario_id,
    rv.animal_id,
    rv.tipo_responsabilidade,
    rv.data_inicio,
    rv.data_fim,
    rv.ativo,
    v.nome as voluntario_nome,
    a.nome as animal_nome
FROM responsabilidades_voluntarios rv
LEFT JOIN voluntarios v ON rv.voluntario_id = v.id
LEFT JOIN animais a ON rv.animal_id = a.id
ORDER BY rv.created_at DESC
LIMIT 10;

-- Criar tabela para histórico de nomes dos animais
CREATE TABLE IF NOT EXISTS public.historico_nomes_animais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE,
    ativo BOOLEAN DEFAULT false, -- Apenas um nome pode estar ativo por animal
    motivo_alteracao TEXT, -- Razão da mudança (entrada, adoção, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_nomes_animal_id ON public.historico_nomes_animais(animal_id);
CREATE INDEX IF NOT EXISTS idx_historico_nomes_ativo ON public.historico_nomes_animais(ativo);
CREATE INDEX IF NOT EXISTS idx_historico_nomes_data_inicio ON public.historico_nomes_animais(data_inicio);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_historico_nomes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_historico_nomes_updated_at 
    BEFORE UPDATE ON public.historico_nomes_animais 
    FOR EACH ROW EXECUTE FUNCTION update_historico_nomes_updated_at();

-- Políticas RLS
ALTER TABLE public.historico_nomes_animais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users on historico_nomes" ON public.historico_nomes_animais
    FOR ALL USING (true) WITH CHECK (true);

-- Permissões
GRANT ALL ON public.historico_nomes_animais TO authenticated;
GRANT ALL ON public.historico_nomes_animais TO anon;