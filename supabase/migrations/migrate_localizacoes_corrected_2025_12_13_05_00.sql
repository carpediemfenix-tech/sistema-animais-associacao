-- Adicionar coluna localizacao_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'localizacoes_animal' AND column_name = 'localizacao_id') THEN
        ALTER TABLE localizacoes_animal ADD COLUMN localizacao_id UUID REFERENCES localizacoes(id);
    END IF;
END $$;

-- Verificar se já existem localizações padrão
DO $$
BEGIN
    -- Inserir localizações padrão se não existirem
    IF NOT EXISTS (SELECT 1 FROM localizacoes WHERE nome = 'Casa de Acolhimento') THEN
        INSERT INTO localizacoes (nome, descricao, ativo) VALUES ('Casa de Acolhimento', 'Localização principal da associação', true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM localizacoes WHERE nome = 'Família de Acolhimento Temporário') THEN
        INSERT INTO localizacoes (nome, descricao, ativo) VALUES ('Família de Acolhimento Temporário', 'Animal em família temporária', true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM localizacoes WHERE nome = 'Clínica Veterinária') THEN
        INSERT INTO localizacoes (nome, descricao, ativo) VALUES ('Clínica Veterinária', 'Animal em tratamento veterinário', true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM localizacoes WHERE nome = 'Quarentena') THEN
        INSERT INTO localizacoes (nome, descricao, ativo) VALUES ('Quarentena', 'Animal em período de quarentena', true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM localizacoes WHERE nome = 'Adotado') THEN
        INSERT INTO localizacoes (nome, descricao, ativo) VALUES ('Adotado', 'Animal já adotado', true);
    END IF;
END $$;

-- Migrar dados existentes para usar localizacao_id
UPDATE localizacoes_animal 
SET localizacao_id = (SELECT id FROM localizacoes WHERE nome = 'Casa de Acolhimento' LIMIT 1)
WHERE localizacao_id IS NULL;