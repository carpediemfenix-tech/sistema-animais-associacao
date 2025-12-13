-- Tabela de Motivos de Arquivamento para Animais
-- Criado em: 2025-12-11 04:00 UTC

-- 1. Criar tabela de motivos de arquivamento
CREATE TABLE IF NOT EXISTS motivos_arquivamento_2025_12_11_04_00 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7) DEFAULT '#6B7280', -- Cor em hex para identificação visual
  icone VARCHAR(50), -- Nome do ícone Lucide
  categoria VARCHAR(50) DEFAULT 'geral', -- adocao, obito, transferencia, medico, comportamental, geral
  requer_observacoes BOOLEAN DEFAULT false, -- Se requer observações obrigatórias
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0, -- Para ordenação na interface
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir motivos de arquivamento padrão
INSERT INTO motivos_arquivamento_2025_12_11_04_00 (nome, descricao, cor, icone, categoria, requer_observacoes, ordem) VALUES
('Adoção', 'Animal foi adotado com sucesso', '#10B981', 'Heart', 'adocao', false, 1),
('Óbito Natural', 'Animal faleceu por causas naturais', '#6B7280', 'Cross', 'obito', true, 2),
('Óbito por Doença', 'Animal faleceu devido a doença', '#EF4444', 'Cross', 'obito', true, 3),
('Eutanásia', 'Eutanásia por motivos médicos', '#DC2626', 'Cross', 'medico', true, 4),
('Transferência', 'Transferido para outra associação', '#3B82F6', 'ArrowRight', 'transferencia', true, 5),
('Fuga', 'Animal fugiu das instalações', '#F59E0B', 'Zap', 'comportamental', true, 6),
('Devolução ao Dono', 'Devolvido ao dono original', '#8B5CF6', 'UserCheck', 'geral', false, 7),
('Problemas Comportamentais', 'Arquivado por problemas de comportamento', '#F97316', 'AlertTriangle', 'comportamental', true, 8),
('Problemas de Saúde Crónicos', 'Condições médicas que impedem adoção', '#EF4444', 'Activity', 'medico', true, 9),
('Outros', 'Outros motivos não especificados', '#6B7280', 'MoreHorizontal', 'geral', true, 10);

-- 3. Adicionar coluna de motivo de arquivamento na tabela animais (se não existir)
DO $$
BEGIN
    -- Verificar se a coluna motivo_arquivamento_id já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'animais' 
        AND column_name = 'motivo_arquivamento_id'
    ) THEN
        ALTER TABLE animais ADD COLUMN motivo_arquivamento_id UUID REFERENCES motivos_arquivamento_2025_12_11_04_00(id);
    END IF;
    
    -- Verificar se a coluna observacoes_arquivamento já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'animais' 
        AND column_name = 'observacoes_arquivamento'
    ) THEN
        ALTER TABLE animais ADD COLUMN observacoes_arquivamento TEXT;
    END IF;
    
    -- Verificar se a coluna data_arquivamento já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'animais' 
        AND column_name = 'data_arquivamento'
    ) THEN
        ALTER TABLE animais ADD COLUMN data_arquivamento TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 4. Configurar RLS
ALTER TABLE motivos_arquivamento_2025_12_11_04_00 ENABLE ROW LEVEL SECURITY;

-- Política permissiva para usuários autenticados
CREATE POLICY "Allow all for authenticated users" ON motivos_arquivamento_2025_12_11_04_00 FOR ALL USING (true) WITH CHECK (true);

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_motivos_arquivamento_categoria ON motivos_arquivamento_2025_12_11_04_00(categoria);
CREATE INDEX IF NOT EXISTS idx_motivos_arquivamento_ativo ON motivos_arquivamento_2025_12_11_04_00(ativo);
CREATE INDEX IF NOT EXISTS idx_animais_motivo_arquivamento ON animais(motivo_arquivamento_id);

-- 6. Trigger para atualizar timestamp
CREATE TRIGGER update_motivos_arquivamento_updated_at 
BEFORE UPDATE ON motivos_arquivamento_2025_12_11_04_00 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Migrar dados existentes (se houver animais arquivados sem motivo)
UPDATE animais 
SET motivo_arquivamento_id = (
    SELECT id FROM motivos_arquivamento_2025_12_11_04_00 
    WHERE nome = 'Outros' LIMIT 1
),
data_arquivamento = COALESCE(data_arquivamento, updated_at)
WHERE arquivado = true 
AND motivo_arquivamento_id IS NULL;