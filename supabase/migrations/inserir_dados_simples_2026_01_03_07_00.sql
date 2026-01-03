-- Verificar valores válidos para prioridade
SELECT DISTINCT prioridade FROM missoes_2025_12_18_14_15 WHERE prioridade IS NOT NULL;

-- Inserir missões com valores de prioridade válidos
INSERT INTO missoes_2025_12_18_14_15 (
  id,
  titulo,
  codigo,
  descricao,
  status,
  data_inicio,
  data_fim,
  local_principal,
  prioridade,
  orcamento_previsto,
  tipo_missao_id,
  responsavel_id,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'Campanha de Adoção - Janeiro 2026',
  'CAD-2026-001',
  'Campanha de sensibilização para adoção de animais abandonados',
  'concluida',
  '2026-01-01',
  '2026-01-15',
  'Centro Comercial Colombo',
  'normal', -- Usar valor mais comum
  500.00,
  (SELECT id FROM tipos_missoes_2025_12_18_14_15 LIMIT 1),
  'e1a980f8-09ed-434e-b838-6a86fb2d24a6',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Resgate de Emergência - Sintra',
  'RES-2026-002',
  'Resgate de animais em situação de perigo em Sintra',
  'concluida',
  '2025-12-20',
  '2025-12-21',
  'Sintra',
  'normal',
  200.00,
  (SELECT id FROM tipos_missoes_2025_12_18_14_15 LIMIT 1),
  'e1a980f8-09ed-434e-b838-6a86fb2d24a6',
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir participações
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
) VALUES 
(
  gen_random_uuid(),
  'e1a980f8-09ed-434e-b838-6a86fb2d24a6',
  (SELECT id FROM missoes_2025_12_18_14_15 WHERE codigo = 'CAD-2026-001' LIMIT 1),
  'Coordenador',
  'concluida',
  '2026-01-01',
  8.0,
  50,
  5,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'e1a980f8-09ed-434e-b838-6a86fb2d24a6',
  (SELECT id FROM missoes_2025_12_18_14_15 WHERE codigo = 'RES-2026-002' LIMIT 1),
  'Transporte',
  'concluida',
  '2025-12-20',
  4.0,
  30,
  4,
  NOW(),
  NOW()
);