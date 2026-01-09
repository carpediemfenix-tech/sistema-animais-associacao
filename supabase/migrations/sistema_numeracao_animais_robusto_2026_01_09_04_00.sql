-- Sistema robusto de numeração de processos para novos animais
-- Formato: PYYXXX (P26001, P26002, etc.)
-- Thread-safe e sem conflito com sistema de denúncias

-- 1. CRIAR TABELA DE CONTROLO DE SEQUÊNCIAS PARA ANIMAIS
CREATE TABLE IF NOT EXISTS animal_process_sequences_2026_01_09_04_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    last_sequence INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICE
CREATE INDEX IF NOT EXISTS idx_animal_process_sequences_year ON animal_process_sequences_2026_01_09_04_00(year);

-- 3. FUNÇÃO ROBUSTA PARA GERAR PRÓXIMO NÚMERO DE PROCESSO DE ANIMAL
CREATE OR REPLACE FUNCTION generate_next_animal_process_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    current_year INTEGER;
    year_suffix TEXT;
    next_sequence INTEGER;
    new_process_number TEXT;
    max_attempts INTEGER := 10;
    attempt_count INTEGER := 0;
BEGIN
    -- Obter ano atual
    current_year := EXTRACT(YEAR FROM NOW());
    year_suffix := RIGHT(current_year::TEXT, 2);
    
    -- Loop para tentar gerar número único (proteção contra concorrência)
    WHILE attempt_count < max_attempts LOOP
        attempt_count := attempt_count + 1;
        
        -- Inserir ou atualizar sequência de forma atómica
        INSERT INTO animal_process_sequences_2026_01_09_04_00 (year, last_sequence)
        VALUES (current_year, 1)
        ON CONFLICT (year) 
        DO UPDATE SET 
            last_sequence = animal_process_sequences_2026_01_09_04_00.last_sequence + 1,
            updated_at = NOW()
        RETURNING last_sequence INTO next_sequence;
        
        -- Gerar número de processo no formato PYYXXX
        new_process_number := 'P' || year_suffix || LPAD(next_sequence::TEXT, 3, '0');
        
        -- Verificar se já existe na tabela animais (dupla verificação)
        IF NOT EXISTS (
            SELECT 1 FROM animais WHERE numero_processo = new_process_number
        ) THEN
            -- Número único encontrado
            RETURN new_process_number;
        END IF;
        
        -- Se chegou aqui, o número já existe (caso muito raro)
        -- Continuar o loop para tentar novamente
        RAISE NOTICE 'Número de processo % já existe, tentando novamente (tentativa %)', new_process_number, attempt_count;
    END LOOP;
    
    -- Se não conseguiu gerar após max_attempts, usar timestamp como fallback
    RAISE WARNING 'Não foi possível gerar número único após % tentativas, usando fallback', max_attempts;
    RETURN 'P' || year_suffix || RIGHT(EXTRACT(EPOCH FROM NOW())::TEXT, 3);
END;
$$;

-- 4. FUNÇÃO PARA VALIDAR FORMATO DE NÚMERO DE PROCESSO DE ANIMAL
CREATE OR REPLACE FUNCTION validate_animal_process_number(p_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validar formato: PYYXXX (P seguido de 2 dígitos do ano e 3 dígitos sequenciais)
    RETURN p_number ~ '^P[0-9]{2}[0-9]{3}$';
END;
$$;

-- 5. FUNÇÃO PARA OBTER ESTATÍSTICAS DE PROCESSOS DE ANIMAIS
CREATE OR REPLACE FUNCTION get_animal_process_statistics()
RETURNS TABLE (
    year INTEGER,
    total_generated INTEGER,
    last_number TEXT,
    next_number TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aps.year,
        aps.last_sequence as total_generated,
        'P' || RIGHT(aps.year::TEXT, 2) || LPAD(aps.last_sequence::TEXT, 3, '0') as last_number,
        'P' || RIGHT(aps.year::TEXT, 2) || LPAD((aps.last_sequence + 1)::TEXT, 3, '0') as next_number
    FROM animal_process_sequences_2026_01_09_04_00 aps
    ORDER BY aps.year DESC;
END;
$$;

-- 6. INICIALIZAR SEQUÊNCIA BASEADA EM DADOS EXISTENTES
DO $$
DECLARE
    current_year INTEGER;
    year_suffix TEXT;
    max_animal_seq INTEGER := 0;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW());
    year_suffix := RIGHT(current_year::TEXT, 2);
    
    -- Encontrar maior sequência de animais do ano atual (formato PYYXXX)
    SELECT COALESCE(MAX(
        CASE 
            WHEN numero_processo ~ ('^P' || year_suffix || '[0-9]{3}$') 
            THEN RIGHT(numero_processo, 3)::INTEGER
            ELSE 0
        END
    ), 0) INTO max_animal_seq
    FROM animais
    WHERE numero_processo IS NOT NULL
    AND numero_processo ~ '^P[0-9]{2}[0-9]{3}$'  -- Apenas formato PYYXXX
    AND numero_processo NOT LIKE '%-P%';          -- Excluir formato de denúncias

    -- Inserir ou atualizar sequência
    INSERT INTO animal_process_sequences_2026_01_09_04_00 (year, last_sequence)
    VALUES (current_year, max_animal_seq)
    ON CONFLICT (year) 
    DO UPDATE SET 
        last_sequence = GREATEST(animal_process_sequences_2026_01_09_04_00.last_sequence, EXCLUDED.last_sequence),
        updated_at = NOW();
        
    RAISE NOTICE 'Sequência de animais inicializada para ano % com valor %', current_year, max_animal_seq;
END;
$$;

-- 7. CRIAR POLÍTICAS RLS
ALTER TABLE animal_process_sequences_2026_01_09_04_00 ENABLE ROW LEVEL SECURITY;

-- Política para leitura (todos os utilizadores autenticados)
CREATE POLICY "Utilizadores autenticados podem ler sequências de animais" ON animal_process_sequences_2026_01_09_04_00
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para escrita (apenas sistema pode modificar)
CREATE POLICY "Apenas sistema pode modificar sequências de animais" ON animal_process_sequences_2026_01_09_04_00
    FOR ALL USING (auth.role() = 'service_role');

-- 8. COMENTÁRIOS
COMMENT ON TABLE animal_process_sequences_2026_01_09_04_00 IS 'Controlo de sequências para números de processo únicos de animais (formato PYYXXX)';
COMMENT ON FUNCTION generate_next_animal_process_number IS 'Gera próximo número de processo único para animais no formato PYYXXX';
COMMENT ON FUNCTION validate_animal_process_number IS 'Valida formato de número de processo de animal (PYYXXX)';
COMMENT ON FUNCTION get_animal_process_statistics IS 'Retorna estatísticas de processos de animais gerados';

-- 9. TESTE DA FUNÇÃO
SELECT 
    'Teste geração animal' as tipo,
    generate_next_animal_process_number() as numero_gerado
UNION ALL
SELECT 
    'Próximo número' as tipo,
    generate_next_animal_process_number() as numero_gerado
UNION ALL
SELECT 
    'Estatísticas' as tipo,
    year::TEXT || ' - Total: ' || total_generated::TEXT || ' - Último: ' || last_number || ' - Próximo: ' || next_number as numero_gerado
FROM get_animal_process_statistics();

-- 10. VERIFICAR NÚMEROS EXISTENTES PARA VALIDAÇÃO
SELECT 
    'Números existentes PYYXXX' as tipo,
    COUNT(*)::TEXT || ' encontrados' as numero_gerado
FROM animais 
WHERE numero_processo ~ '^P[0-9]{2}[0-9]{3}$'
AND numero_processo NOT LIKE '%-P%'
UNION ALL
SELECT 
    'Números de denúncias' as tipo,
    COUNT(*)::TEXT || ' encontrados (não afetados)' as numero_gerado
FROM animais 
WHERE numero_processo LIKE '%-P%';