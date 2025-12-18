-- Investigação da tabela de intervenções
-- Criada em: 2025-12-18 09:30 UTC

-- 1. Verificar estrutura da tabela intervencoes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'intervencoes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Contar registros na tabela
SELECT COUNT(*) as total_intervencoes FROM public.intervencoes;

-- 3. Mostrar exemplo de dados reais (mascarando IDs sensíveis)
SELECT 
    LEFT(id::text, 8) || '...' as id_parcial,
    LEFT(animal_id::text, 8) || '...' as animal_id_parcial,
    data_intervencao,
    veterinario,
    custo,
    custo_final,
    urgente,
    estado,
    observacoes,
    -- Verificar se existem outros campos
    CASE WHEN column_exists('intervencoes', 'tipo') THEN 'tipo existe' ELSE 'tipo não existe' END as check_tipo,
    CASE WHEN column_exists('intervencoes', 'clinica') THEN 'clinica existe' ELSE 'clinica não existe' END as check_clinica,
    CASE WHEN column_exists('intervencoes', 'descricao') THEN 'descricao existe' ELSE 'descricao não existe' END as check_descricao
FROM public.intervencoes 
WHERE animal_id = '1685ea69-0598-4850-90c4-536c32323b35'
LIMIT 3;

-- 4. Função auxiliar para verificar se coluna existe
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS text AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = $1 
          AND column_name = $2 
          AND table_schema = 'public'
    ) THEN
        RETURN 'existe';
    ELSE
        RETURN 'não existe';
    END IF;
END;
$$ LANGUAGE plpgsql;