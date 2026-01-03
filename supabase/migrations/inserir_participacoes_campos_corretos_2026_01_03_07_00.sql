-- Verificar estrutura da tabela de participações
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'participacoes_missoes_2025_12_29_07_00'
ORDER BY ordinal_position;

-- Inserir participações com campos corretos
INSERT INTO participacoes_missoes_2025_12_29_07_00 (
  id,
  voluntario_id,
  missao_id,
  funcao,
  status_participacao,
  data_participacao,
  horas_dedicadas,
  pontos_atribuidos,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'e1a980f8-09ed-434e-b838-6a86fb2d24a6',
  m.id,
  'Voluntário',
  'concluida',
  CURRENT_DATE - INTERVAL '30 days',
  6.0,
  25,
  NOW(),
  NOW()
FROM missoes_2025_12_18_14_15 m
LIMIT 3
ON CONFLICT DO NOTHING;