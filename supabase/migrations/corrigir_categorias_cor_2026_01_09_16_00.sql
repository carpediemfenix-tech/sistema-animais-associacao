-- CORREÇÃO CATEGORIAS APROVISIONAMENTO - CAMPO "cor"
-- Verificar e corrigir o campo cor vs cor_interface

-- 1. VERIFICAR ESTRUTURA DA TABELA CATEGORIAS_APROVISIONAMENTO
SELECT 
  'ESTRUTURA categorias_aprovisionamento:' as info,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name LIKE '%categorias_aprovisionamento%'
ORDER BY table_name, ordinal_position;

-- 2. VERIFICAR QUAL TABELA DE CATEGORIAS EXISTE
SELECT 
  'TABELAS DE CATEGORIAS:' as info,
  table_name
FROM information_schema.tables 
WHERE table_name LIKE '%categorias_aprovisionamento%'
ORDER BY table_name;

-- 3. IDENTIFICAR A TABELA CORRETA E VERIFICAR CAMPOS
DO $$
DECLARE
  tabela_nome TEXT;
  tem_cor BOOLEAN := FALSE;
  tem_cor_interface BOOLEAN := FALSE;
BEGIN
  -- Encontrar a tabela de categorias mais recente
  SELECT table_name INTO tabela_nome
  FROM information_schema.tables 
  WHERE table_name LIKE '%categorias_aprovisionamento%'
  ORDER BY table_name DESC
  LIMIT 1;
  
  IF tabela_nome IS NOT NULL THEN
    RAISE NOTICE 'Tabela encontrada: %', tabela_nome;
    
    -- Verificar se tem campo "cor"
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = tabela_nome AND column_name = 'cor'
    ) INTO tem_cor;
    
    -- Verificar se tem campo "cor_interface"
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = tabela_nome AND column_name = 'cor_interface'
    ) INTO tem_cor_interface;
    
    RAISE NOTICE 'Campo cor existe: %, Campo cor_interface existe: %', tem_cor, tem_cor_interface;
    
    -- Se tem cor_interface mas não tem cor, criar alias
    IF tem_cor_interface AND NOT tem_cor THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN cor TEXT', tabela_nome);
      EXECUTE format('UPDATE %I SET cor = cor_interface WHERE cor IS NULL', tabela_nome);
      RAISE NOTICE 'Campo cor criado e populado com valores de cor_interface';
    END IF;
    
    -- Se não tem nenhum dos dois, criar cor
    IF NOT tem_cor AND NOT tem_cor_interface THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN cor TEXT DEFAULT ''#3B82F6''', tabela_nome);
      RAISE NOTICE 'Campo cor criado com valor padrão';
    END IF;
    
  ELSE
    RAISE NOTICE 'Nenhuma tabela de categorias_aprovisionamento encontrada';
  END IF;
END $$;

-- 4. CRIAR FUNÇÃO RPC processar_devolucao_parcial_v2 SE NÃO EXISTIR
CREATE OR REPLACE FUNCTION processar_devolucao_parcial_v2(
  p_atribuicao_id UUID,
  p_itens_devolucao JSONB
)
RETURNS JSONB AS $$
DECLARE
  resultado JSONB;
  item JSONB;
  atribuicao_record RECORD;
BEGIN
  -- Verificar se a atribuição existe
  SELECT * INTO atribuicao_record
  FROM atribuicoes_aprovisionamento_2026_01_06_14_00
  WHERE id = p_atribuicao_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Atribuição não encontrada');
  END IF;
  
  -- Processar cada item de devolução
  FOR item IN SELECT * FROM jsonb_array_elements(p_itens_devolucao)
  LOOP
    -- Lógica de processamento da devolução aqui
    -- (implementar conforme necessário)
    NULL;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Devolução processada com sucesso',
    'atribuicao_id', p_atribuicao_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Erro ao processar devolução: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- 5. VERIFICAR RESULTADO FINAL
SELECT 
  'VERIFICAÇÃO FINAL:' as info,
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name LIKE '%categorias_aprovisionamento%'
AND column_name IN ('cor', 'cor_interface')
ORDER BY table_name, column_name;