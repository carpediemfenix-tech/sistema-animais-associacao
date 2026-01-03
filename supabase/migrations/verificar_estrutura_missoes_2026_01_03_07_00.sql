-- Verificar constraints da tabela
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'missoes_2025_12_18_14_15'::regclass;

-- Verificar se já existem missões
SELECT COUNT(*) as total_missoes FROM missoes_2025_12_18_14_15;

-- Se existem missões, vamos usar uma existente para criar participações
INSERT INTO participacoes_missoes_2025_12_29_07_00 (
  id,
  voluntario_id,
  missao_id,
  funcao,
  status_participacao,
  data_participacao,
  horas_dedicadas,
  pontos_atribuidos,
  avaliacao,
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
  4,
  NOW(),
  NOW()
FROM missoes_2025_12_18_14_15 m
LIMIT 1
ON CONFLICT DO NOTHING;