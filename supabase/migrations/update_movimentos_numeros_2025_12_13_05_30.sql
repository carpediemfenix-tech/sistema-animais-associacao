-- Atualizar movimentos existentes sem número de movimento
UPDATE movimentos_financeiros_2025_12_13_03_00 
SET numero_movimento = gerar_numero_movimento()
WHERE numero_movimento IS NULL OR numero_movimento = '';

-- Criar trigger para gerar número automaticamente em novos movimentos
CREATE OR REPLACE FUNCTION trigger_gerar_numero_movimento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_movimento IS NULL OR NEW.numero_movimento = '' THEN
        NEW.numero_movimento := gerar_numero_movimento();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_numero_movimento ON movimentos_financeiros_2025_12_13_03_00;
CREATE TRIGGER trigger_numero_movimento
    BEFORE INSERT ON movimentos_financeiros_2025_12_13_03_00
    FOR EACH ROW
    EXECUTE FUNCTION trigger_gerar_numero_movimento();