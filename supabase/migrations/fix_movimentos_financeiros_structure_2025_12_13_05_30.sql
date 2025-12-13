-- Verificar estrutura da tabela movimentos_financeiros_2025_12_13_03_00
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_13_03_00'
ORDER BY ordinal_position;

-- Verificar se existe coluna numero_movimento
SELECT COUNT(*) as tem_numero_movimento
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_13_03_00' 
AND column_name = 'numero_movimento';

-- Adicionar coluna numero_movimento se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimentos_financeiros_2025_12_13_03_00' AND column_name = 'numero_movimento') THEN
        ALTER TABLE movimentos_financeiros_2025_12_13_03_00 ADD COLUMN numero_movimento VARCHAR(50);
    END IF;
END $$;

-- Criar função para gerar número de movimento se não existir
CREATE OR REPLACE FUNCTION gerar_numero_movimento()
RETURNS TEXT AS $$
DECLARE
    ano TEXT;
    mes TEXT;
    contador INTEGER;
    numero_movimento TEXT;
BEGIN
    -- Obter ano e mês atual
    ano := EXTRACT(YEAR FROM NOW())::TEXT;
    mes := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
    
    -- Contar movimentos do mês atual
    SELECT COUNT(*) + 1 INTO contador
    FROM movimentos_financeiros_2025_12_13_03_00
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());
    
    -- Gerar número no formato AAAAMM-NNNN
    numero_movimento := ano || mes || '-' || LPAD(contador::TEXT, 4, '0');
    
    RETURN numero_movimento;
END;
$$ LANGUAGE plpgsql;