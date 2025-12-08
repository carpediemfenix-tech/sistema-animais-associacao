-- Adicionar coluna voluntario_responsavel à tabela animais
-- Data: 2025-12-08 05:00 UTC

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    -- Adicionar coluna voluntario_responsavel se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'animais' 
        AND column_name = 'voluntario_responsavel'
    ) THEN
        ALTER TABLE public.animais 
        ADD COLUMN voluntario_responsavel UUID REFERENCES public.voluntarios(id);
        
        RAISE NOTICE 'Coluna voluntario_responsavel adicionada à tabela animais';
    ELSE
        RAISE NOTICE 'Coluna voluntario_responsavel já existe na tabela animais';
    END IF;
END $$;

-- Verificar a estrutura da tabela após a alteração
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND column_name = 'voluntario_responsavel';

-- Comentário na coluna para documentação
COMMENT ON COLUMN public.animais.voluntario_responsavel IS 'ID do voluntário responsável pelo animal (referência à tabela voluntarios)';

-- Verificar se existem voluntários para teste
SELECT id, nome, ativo FROM public.voluntarios WHERE ativo = true LIMIT 5;