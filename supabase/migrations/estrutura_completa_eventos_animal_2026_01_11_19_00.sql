-- Criar tabela eventos_animal com estrutura completa
CREATE TABLE IF NOT EXISTS public.eventos_animal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL,
    tipo_evento_id TEXT NOT NULL, -- Usando TEXT para ser mais flexível
    data_evento DATE NOT NULL,
    descricao TEXT,
    observacoes TEXT,
    responsavel_id UUID,
    documento_referencia TEXT,
    importante BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campos que podem estar em falta (se a tabela já existir)
DO $$
BEGIN
    -- Adicionar responsavel_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos_animal' AND column_name = 'responsavel_id'
    ) THEN
        ALTER TABLE public.eventos_animal ADD COLUMN responsavel_id UUID;
        RAISE NOTICE 'Campo responsavel_id adicionado';
    END IF;
    
    -- Adicionar documento_referencia se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos_animal' AND column_name = 'documento_referencia'
    ) THEN
        ALTER TABLE public.eventos_animal ADD COLUMN documento_referencia TEXT;
        RAISE NOTICE 'Campo documento_referencia adicionado';
    END IF;
    
    -- Adicionar importante se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos_animal' AND column_name = 'importante'
    ) THEN
        ALTER TABLE public.eventos_animal ADD COLUMN importante BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Campo importante adicionado';
    END IF;
    
    -- Adicionar updated_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos_animal' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.eventos_animal ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Campo updated_at adicionado';
    END IF;
    
    -- Verificar se tipo_evento_id existe, se não, adicionar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos_animal' AND column_name = 'tipo_evento_id'
    ) THEN
        ALTER TABLE public.eventos_animal ADD COLUMN tipo_evento_id TEXT NOT NULL DEFAULT 'evento_geral';
        RAISE NOTICE 'Campo tipo_evento_id adicionado';
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_eventos_animal_animal_id ON public.eventos_animal(animal_id);
CREATE INDEX IF NOT EXISTS idx_eventos_animal_data_evento ON public.eventos_animal(data_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_animal_tipo_evento_id ON public.eventos_animal(tipo_evento_id);
CREATE INDEX IF NOT EXISTS idx_eventos_animal_responsavel_id ON public.eventos_animal(responsavel_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_eventos_animal_updated_at ON public.eventos_animal;
CREATE TRIGGER update_eventos_animal_updated_at
    BEFORE UPDATE ON public.eventos_animal
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Mostrar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'eventos_animal' 
AND table_schema = 'public'
ORDER BY ordinal_position;