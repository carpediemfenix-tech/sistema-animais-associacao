-- Verificar se precisa criar ou alterar a tabela localizacoes_animal
-- Primeiro, vamos ver se a tabela existe e qual a sua estrutura atual

DO $$
BEGIN
    -- Se a tabela não existir, criar com estrutura completa
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'localizacoes_animal') THEN
        CREATE TABLE localizacoes_animal (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
            localizacao_id UUID NOT NULL REFERENCES localizacoes(id),
            data_inicio DATE NOT NULL,
            data_fim DATE,
            endereco_detalhes TEXT, -- Campo que estava no código original
            responsavel_id UUID REFERENCES voluntarios(id),
            motivo_transferencia TEXT,
            observacoes TEXT,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela localizacoes_animal criada com estrutura completa';
    ELSE
        -- Se a tabela existir, verificar e adicionar colunas em falta
        
        -- Adicionar localizacao_id se não existir
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'localizacoes_animal' AND column_name = 'localizacao_id') THEN
            ALTER TABLE localizacoes_animal ADD COLUMN localizacao_id UUID REFERENCES localizacoes(id);
            RAISE NOTICE 'Coluna localizacao_id adicionada';
        END IF;
        
        -- Adicionar endereco_detalhes se não existir
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'localizacoes_animal' AND column_name = 'endereco_detalhes') THEN
            ALTER TABLE localizacoes_animal ADD COLUMN endereco_detalhes TEXT;
            RAISE NOTICE 'Coluna endereco_detalhes adicionada';
        END IF;
        
        -- Adicionar outras colunas necessárias se não existirem
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'localizacoes_animal' AND column_name = 'data_inicio') THEN
            ALTER TABLE localizacoes_animal ADD COLUMN data_inicio DATE NOT NULL DEFAULT CURRENT_DATE;
            RAISE NOTICE 'Coluna data_inicio adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'localizacoes_animal' AND column_name = 'responsavel_id') THEN
            ALTER TABLE localizacoes_animal ADD COLUMN responsavel_id UUID REFERENCES voluntarios(id);
            RAISE NOTICE 'Coluna responsavel_id adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'localizacoes_animal' AND column_name = 'motivo_transferencia') THEN
            ALTER TABLE localizacoes_animal ADD COLUMN motivo_transferencia TEXT;
            RAISE NOTICE 'Coluna motivo_transferencia adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'localizacoes_animal' AND column_name = 'observacoes') THEN
            ALTER TABLE localizacoes_animal ADD COLUMN observacoes TEXT;
            RAISE NOTICE 'Coluna observacoes adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'localizacoes_animal' AND column_name = 'ativo') THEN
            ALTER TABLE localizacoes_animal ADD COLUMN ativo BOOLEAN DEFAULT true;
            RAISE NOTICE 'Coluna ativo adicionada';
        END IF;
        
        RAISE NOTICE 'Verificação e correção da estrutura concluída';
    END IF;
END $$;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
ORDER BY ordinal_position;