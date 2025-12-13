-- Índices para performance
CREATE INDEX idx_movimentos_fin_data ON movimentos_financeiros_2025_12_13_06_00(data_movimento);
CREATE INDEX idx_movimentos_fin_animal ON movimentos_financeiros_2025_12_13_06_00(animal_id);
CREATE INDEX idx_movimentos_fin_categoria ON movimentos_financeiros_2025_12_13_06_00(categoria_id);
CREATE INDEX idx_movimentos_fin_status ON movimentos_financeiros_2025_12_13_06_00(status);
CREATE INDEX idx_parcelas_fin_vencimento ON parcelas_movimentos_2025_12_13_06_00(data_vencimento);

-- Função para gerar número de movimento
CREATE OR REPLACE FUNCTION gerar_numero_movimento_financeiro()
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
    FROM movimentos_financeiros_2025_12_13_06_00
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());
    
    -- Gerar número no formato FIN-AAAAMM-NNNN
    numero_movimento := 'FIN-' || ano || mes || '-' || LPAD(contador::TEXT, 4, '0');
    
    RETURN numero_movimento;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número automaticamente
CREATE OR REPLACE FUNCTION trigger_gerar_numero_movimento_financeiro()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_movimento IS NULL OR NEW.numero_movimento = '' THEN
        NEW.numero_movimento := gerar_numero_movimento_financeiro();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_numero_movimento_financeiro
    BEFORE INSERT ON movimentos_financeiros_2025_12_13_06_00
    FOR EACH ROW
    EXECUTE FUNCTION trigger_gerar_numero_movimento_financeiro();

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_financeiras_updated_at BEFORE UPDATE ON categorias_financeiras_2025_12_13_06_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contas_financeiras_updated_at BEFORE UPDATE ON contas_financeiras_2025_12_13_06_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movimentos_financeiros_updated_at BEFORE UPDATE ON movimentos_financeiros_2025_12_13_06_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parcelas_movimentos_updated_at BEFORE UPDATE ON parcelas_movimentos_2025_12_13_06_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos_2025_12_13_06_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE categorias_financeiras_2025_12_13_06_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_financeiras_2025_12_13_06_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentos_financeiros_2025_12_13_06_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas_movimentos_2025_12_13_06_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos_2025_12_13_06_00 ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para usuários autenticados
CREATE POLICY "Allow all for authenticated users" ON categorias_financeiras_2025_12_13_06_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON contas_financeiras_2025_12_13_06_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON movimentos_financeiros_2025_12_13_06_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON parcelas_movimentos_2025_12_13_06_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON orcamentos_2025_12_13_06_00 FOR ALL USING (true) WITH CHECK (true);