-- Verificar tabelas específicas de equipamentos mencionadas no código
SELECT 
  'equipamentos_2025_12_13_01_00' as tabela,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'equipamentos_2025_12_13_01_00'
  ) THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status
UNION ALL
SELECT 
  'atribuicoes_equipamentos_2025_12_13_01_00' as tabela,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'atribuicoes_equipamentos_2025_12_13_01_00'
  ) THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status
UNION ALL
SELECT 
  'alertas_equipamentos_2025_12_16_07_00' as tabela,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'alertas_equipamentos_2025_12_16_07_00'
  ) THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status
UNION ALL
SELECT 
  'manutencoes_equipamentos_2025_12_13_01_00' as tabela,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00'
  ) THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status
UNION ALL
SELECT 
  'categorias_equipamentos_2025_12_13_01_00' as tabela,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'categorias_equipamentos_2025_12_13_01_00'
  ) THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status
UNION ALL
SELECT 
  'tipos_equipamentos_2025_12_13_01_00' as tabela,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'tipos_equipamentos_2025_12_13_01_00'
  ) THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status;