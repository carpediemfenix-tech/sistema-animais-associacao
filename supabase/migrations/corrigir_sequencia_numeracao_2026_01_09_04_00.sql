-- Corrigir inicialização da sequência de números de processo para ser verdadeiramente sequencial
-- Garantir que próximo número seja sequencial baseado no último número real

-- 1. VERIFICAR NÚMEROS EXISTENTES
SELECT 
    'Números PYYXXX existentes' as tipo,
    numero_processo,
    created_at
FROM animais 
WHERE numero_processo ~ '^P[0-9]{2}[0-9]{3}$'
AND numero_processo NOT LIKE '%-P%'
ORDER BY numero_processo DESC
LIMIT 10;

-- 2. ENCONTRAR ÚLTIMO NÚMERO SEQUENCIAL REAL DO ANO ATUAL
DO $$
DECLARE
    current_year INTEGER;
    year_suffix TEXT;
    max_real_sequence INTEGER := 0;
    last_number TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW());
    year_suffix := RIGHT(current_year::TEXT, 2);
    
    -- Encontrar o maior número sequencial REAL do ano atual
    SELECT 
        numero_processo,
        RIGHT(numero_processo, 3)::INTEGER
    INTO 
        last_number,
        max_real_sequence
    FROM animais
    WHERE numero_processo ~ ('^P' || year_suffix || '[0-9]{3}$')
    AND numero_processo NOT LIKE '%-P%'
    ORDER BY RIGHT(numero_processo, 3)::INTEGER DESC
    LIMIT 1;
    
    -- Se não encontrou nenhum, começar do 0
    IF max_real_sequence IS NULL THEN
        max_real_sequence := 0;
        last_number := 'Nenhum encontrado';
    END IF;
    
    RAISE NOTICE 'Último número real encontrado: % (sequência: %)', last_number, max_real_sequence;
    
    -- Atualizar a sequência para o valor correto
    INSERT INTO animal_process_sequences_2026_01_09_04_00 (year, last_sequence)
    VALUES (current_year, max_real_sequence)
    ON CONFLICT (year) 
    DO UPDATE SET 
        last_sequence = max_real_sequence,
        updated_at = NOW();
        
    RAISE NOTICE 'Sequência corrigida para ano % com valor %', current_year, max_real_sequence;
    RAISE NOTICE 'Próximo número será: P%', year_suffix || LPAD((max_real_sequence + 1)::TEXT, 3, '0');
END;
$$;

-- 3. TESTAR GERAÇÃO DO PRÓXIMO NÚMERO
SELECT 
    'Próximo número a ser gerado' as teste,
    generate_next_animal_process_number() as numero;

-- 4. VERIFICAR ESTADO ATUAL DA SEQUÊNCIA
SELECT 
    'Estado atual da sequência' as info,
    year,
    last_sequence,
    'P' || RIGHT(year::TEXT, 2) || LPAD((last_sequence + 1)::TEXT, 3, '0') as proximo_numero
FROM animal_process_sequences_2026_01_09_04_00
WHERE year = EXTRACT(YEAR FROM NOW());

-- 5. FUNÇÃO PARA VERIFICAR SE UM NÚMERO JÁ EXISTE
CREATE OR REPLACE FUNCTION check_process_number_exists(p_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM animais WHERE numero_processo = p_number
    );
END;
$$;

-- 6. TESTAR SE O PRÓXIMO NÚMERO JÁ EXISTE
DO $$
DECLARE
    next_number TEXT;
    exists_check BOOLEAN;
BEGIN
    next_number := generate_next_animal_process_number();
    exists_check := check_process_number_exists(next_number);
    
    IF exists_check THEN
        RAISE WARNING 'ATENÇÃO: O número % já existe na base de dados!', next_number;
    ELSE
        RAISE NOTICE 'OK: O número % está disponível para uso', next_number;
    END IF;
END;
$$;