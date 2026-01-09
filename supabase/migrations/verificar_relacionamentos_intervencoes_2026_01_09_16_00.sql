-- VERIFICAR RELACIONAMENTOS CORRETOS PARA INTERVENÇÕES
-- Problema: Query com relacionamentos dá 400 Bad Request

-- 1. VERIFICAR FOREIGN KEYS DA TABELA INTERVENCOES
SELECT 
  'FOREIGN KEYS INTERVENCOES:' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'intervencoes';

-- 2. VERIFICAR NOMES CORRETOS DAS TABELAS RELACIONADAS
SELECT 
  'TABELAS RELACIONADAS EXISTENTES:' as info,
  table_name
FROM information_schema.tables 
WHERE table_name IN (
  'clinicas_veterinarias', 
  'tipos_intervencoes', 
  'clinicas', 
  'tipos_intervencao',
  'voluntarios'
)
ORDER BY table_name;

-- 3. VERIFICAR ESTRUTURA DA TABELA INTERVENCOES
SELECT 
  'ESTRUTURA TABELA INTERVENCOES:' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'intervencoes'
AND column_name IN ('clinica_id', 'tipo_intervencao_id', 'voluntario_id', 'veterinario_responsavel_id')
ORDER BY column_name;

-- 4. VERIFICAR SE EXISTEM DADOS DE TESTE
SELECT 
  'DADOS DE TESTE INTERVENCOES:' as info,
  COUNT(*) as total_intervencoes,
  COUNT(DISTINCT clinica_id) as clinicas_distintas,
  COUNT(DISTINCT tipo_intervencao_id) as tipos_distintos
FROM intervencoes;

-- 5. TESTAR QUERY COM RELACIONAMENTOS CORRETOS
-- Primeiro, verificar se as FKs estão corretas
SELECT 
  'TESTE RELACIONAMENTO CLINICAS:' as info,
  i.id,
  i.clinica_id,
  cv.nome as clinica_nome
FROM intervencoes i
LEFT JOIN clinicas_veterinarias cv ON i.clinica_id = cv.id
LIMIT 3;

-- 6. TESTAR RELACIONAMENTO TIPOS_INTERVENCOES
SELECT 
  'TESTE RELACIONAMENTO TIPOS:' as info,
  i.id,
  i.tipo_intervencao_id,
  ti.nome as tipo_nome
FROM intervencoes i
LEFT JOIN tipos_intervencoes ti ON i.tipo_intervencao_id = ti.id
LIMIT 3;

-- 7. CRIAR VIEW PARA FACILITAR RELACIONAMENTOS (se necessário)
CREATE OR REPLACE VIEW intervencoes_completas AS
SELECT 
  i.*,
  cv.nome as clinica_nome,
  cv.tem_protocolo as clinica_tem_protocolo,
  ti.nome as tipo_intervencao_nome,
  v.nome as voluntario_nome
FROM intervencoes i
LEFT JOIN clinicas_veterinarias cv ON i.clinica_id = cv.id
LEFT JOIN tipos_intervencoes ti ON i.tipo_intervencao_id = ti.id
LEFT JOIN voluntarios v ON i.voluntario_id = v.id;