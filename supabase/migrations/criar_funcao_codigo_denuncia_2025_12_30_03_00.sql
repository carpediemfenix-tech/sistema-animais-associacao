-- Criar função para gerar código de denúncia
CREATE OR REPLACE FUNCTION gerar_proximo_codigo_denuncia()
RETURNS TEXT AS $$
DECLARE
    ano_atual TEXT;
    proximo_numero INTEGER;
    codigo_gerado TEXT;
BEGIN
    -- Obter ano atual (últimos 2 dígitos)
    ano_atual := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    ano_atual := RIGHT(ano_atual, 2);
    
    -- Buscar o próximo número sequencial para o ano atual
    SELECT COALESCE(MAX(
        CASE 
            WHEN codigo ~ ('^DEN' || ano_atual || '[0-9]{3}$') 
            THEN CAST(RIGHT(codigo, 3) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO proximo_numero
    FROM public.denuncias_2025_12_29_23_00
    WHERE codigo LIKE 'DEN' || ano_atual || '%';
    
    -- Gerar código no formato DENYYKKK
    codigo_gerado := 'DEN' || ano_atual || LPAD(proximo_numero::TEXT, 3, '0');
    
    RETURN codigo_gerado;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para gerar código automaticamente
CREATE OR REPLACE FUNCTION trigger_gerar_codigo_denuncia()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o código não foi fornecido, gerar automaticamente
    IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
        NEW.codigo := gerar_proximo_codigo_denuncia();
    END IF;
    
    -- Definir timestamps
    IF TG_OP = 'INSERT' THEN
        NEW.created_at := TIMEZONE('utc'::text, NOW());
        NEW.updated_at := TIMEZONE('utc'::text, NOW());
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at := TIMEZONE('utc'::text, NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela
DROP TRIGGER IF EXISTS trigger_codigo_denuncia ON public.denuncias_2025_12_29_23_00;
CREATE TRIGGER trigger_codigo_denuncia
    BEFORE INSERT OR UPDATE ON public.denuncias_2025_12_29_23_00
    FOR EACH ROW EXECUTE FUNCTION trigger_gerar_codigo_denuncia();

-- Verificar se a coluna codigo existe, se não, criar
ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS codigo VARCHAR(10) UNIQUE;

-- Criar índice no código
CREATE INDEX IF NOT EXISTS idx_denuncias_codigo ON public.denuncias_2025_12_29_23_00(codigo);

-- Testar a função
SELECT gerar_proximo_codigo_denuncia() as proximo_codigo;