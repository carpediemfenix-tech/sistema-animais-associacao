-- Corrigir política RLS e criar função de numeração que funciona com authenticated users

-- 1. CORRIGIR POLÍTICAS RLS DA TABELA DE SEQUÊNCIAS
DROP POLICY IF EXISTS "Apenas sistema pode modificar sequências de animais" ON animal_process_sequences_2026_01_09_04_00;
DROP POLICY IF EXISTS "Utilizadores autenticados podem ler sequências de animais" ON animal_process_sequences_2026_01_09_04_00;

-- Política para leitura (todos os utilizadores autenticados)
CREATE POLICY "Utilizadores autenticados podem ler sequências de animais" ON animal_process_sequences_2026_01_09_04_00
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para escrita (utilizadores autenticados podem modificar)
CREATE POLICY "Utilizadores autenticados podem modificar sequências de animais" ON animal_process_sequences_2026_01_09_04_00
    FOR ALL USING (auth.role() = 'authenticated');

-- 2. CRIAR FUNÇÃO SIMPLIFICADA QUE FUNCIONA COM AUTHENTICATED
CREATE OR REPLACE FUNCTION generate_next_animal_process_number_simple()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do criador da função
AS $$
DECLARE
    current_year INTEGER;
    year_suffix TEXT;
    max_sequence INTEGER := 0;
    new_process_number TEXT;
BEGIN
    -- Obter ano atual
    current_year := EXTRACT(YEAR FROM NOW());
    year_suffix := RIGHT(current_year::TEXT, 2);
    
    -- Encontrar o maior número sequencial do ano atual diretamente da tabela animais
    SELECT COALESCE(MAX(
        CASE 
            WHEN numero_processo ~ ('^P' || year_suffix || '[0-9]{3}$') 
            AND numero_processo NOT LIKE '%-P%'
            THEN RIGHT(numero_processo, 3)::INTEGER
            ELSE 0
        END
    ), 0) INTO max_sequence
    FROM animais
    WHERE numero_processo IS NOT NULL;
    
    -- Incrementar para próximo número
    max_sequence := max_sequence + 1;
    
    -- Gerar número de processo no formato PYYXXX
    new_process_number := 'P' || year_suffix || LPAD(max_sequence::TEXT, 3, '0');
    
    -- Verificar se já existe (dupla verificação)
    WHILE EXISTS (SELECT 1 FROM animais WHERE numero_processo = new_process_number) LOOP
        max_sequence := max_sequence + 1;
        new_process_number := 'P' || year_suffix || LPAD(max_sequence::TEXT, 3, '0');
    END LOOP;
    
    RETURN new_process_number;
END;
$$;

-- 3. CRIAR FUNÇÃO AINDA MAIS SIMPLES PARA FALLBACK
CREATE OR REPLACE FUNCTION get_next_animal_number()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 'P' || RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2) || 
           LPAD((COALESCE(MAX(
               CASE 
                   WHEN numero_processo ~ ('^P' || RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2) || '[0-9]{3}$') 
                   AND numero_processo NOT LIKE '%-P%'
                   THEN RIGHT(numero_processo, 3)::INTEGER
                   ELSE 0
               END
           ), 0) + 1)::TEXT, 3, '0')
    FROM animais
    WHERE numero_processo IS NOT NULL;
$$;

-- 4. TESTAR AS FUNÇÕES
SELECT 'Função simplificada' as teste, generate_next_animal_process_number_simple() as numero;
SELECT 'Função SQL' as teste, get_next_animal_number() as numero;

-- 5. VERIFICAR ÚLTIMO NÚMERO REAL
SELECT 
    'Último número real' as info,
    numero_processo,
    created_at
FROM animais 
WHERE numero_processo ~ '^P26[0-9]{3}$'
AND numero_processo NOT LIKE '%-P%'
ORDER BY RIGHT(numero_processo, 3)::INTEGER DESC
LIMIT 5;

-- 6. COMENTÁRIOS
COMMENT ON FUNCTION generate_next_animal_process_number_simple IS 'Função simplificada para gerar próximo número de processo (funciona com authenticated users)';
COMMENT ON FUNCTION get_next_animal_number IS 'Função SQL simples para gerar próximo número de processo';

-- 7. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION generate_next_animal_process_number_simple() TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_animal_number() TO authenticated;