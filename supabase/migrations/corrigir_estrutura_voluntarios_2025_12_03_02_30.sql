-- Corrigir estrutura da tabela voluntario_progressao
-- Primeiro, vamos verificar e corrigir as foreign keys

-- Remover colunas problemáticas se existirem
ALTER TABLE voluntario_progressao 
DROP COLUMN IF EXISTS nivel_anterior,
DROP COLUMN IF EXISTS nivel_atual;

-- Garantir que as colunas corretas existem
ALTER TABLE voluntario_progressao 
ADD COLUMN IF NOT EXISTS nivel_anterior_id UUID REFERENCES niveis_formacao(id),
ADD COLUMN IF NOT EXISTS nivel_atual_id UUID REFERENCES niveis_formacao(id);

-- Remover campo nivel_formacao_atual da tabela voluntarios (será gerido pela progressão)
ALTER TABLE voluntarios 
DROP COLUMN IF EXISTS nivel_formacao_atual;

-- Adicionar campo para indicar se o voluntário tem formação
ALTER TABLE voluntarios 
ADD COLUMN IF NOT EXISTS tem_formacao BOOLEAN DEFAULT FALSE;

-- Limpar dados de progressão existentes que possam estar inconsistentes
DELETE FROM voluntario_progressao;

-- Comentários para documentação
COMMENT ON COLUMN voluntarios.tem_formacao IS 'Indica se o voluntário possui algum nível de formação';
COMMENT ON TABLE voluntario_progressao IS 'Histórico de progressão de formação dos voluntários';

-- Verificar se as políticas RLS estão corretas
DROP POLICY IF EXISTS "Permitir acesso a progressões para usuários autenticados" ON voluntario_progressao;
CREATE POLICY "Permitir acesso a progressões para usuários autenticados" 
ON voluntario_progressao FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);