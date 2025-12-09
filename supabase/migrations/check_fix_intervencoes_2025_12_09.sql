-- Verificar se a tabela intervencoes existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'intervencoes';

-- Verificar estrutura da tabela intervencoes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'intervencoes'
ORDER BY ordinal_position;

-- Criar tabela intervencoes se não existir
CREATE TABLE IF NOT EXISTS public.intervencoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID REFERENCES public.animais(id),
    tipo_intervencao VARCHAR(255) NOT NULL,
    data_intervencao TIMESTAMP WITH TIME ZONE NOT NULL,
    veterinario VARCHAR(255),
    urgente BOOLEAN DEFAULT false,
    observacoes TEXT,
    custo DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conceder permissões
GRANT ALL PRIVILEGES ON public.intervencoes TO authenticated;
GRANT ALL PRIVILEGES ON public.intervencoes TO anon;