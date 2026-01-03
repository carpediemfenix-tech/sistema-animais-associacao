-- Verificar se existem participações para o voluntário específico
SELECT 
  pm.*,
  m.titulo as missao_titulo,
  m.codigo as missao_codigo,
  m.status as missao_status
FROM participacoes_missoes_2025_12_29_07_00 pm
LEFT JOIN missoes_2025_12_18_14_15 m ON pm.missao_id = m.id
WHERE pm.voluntario_id = 'e1a980f8-09ed-434e-b838-6a86fb2d24a6'
ORDER BY pm.data_participacao DESC;

-- Verificar se a tabela tem dados em geral
SELECT COUNT(*) as total_participacoes FROM participacoes_missoes_2025_12_29_07_00;

-- Verificar se existem missões
SELECT COUNT(*) as total_missoes FROM missoes_2025_12_18_14_15;

-- Verificar se o voluntário existe
SELECT id, nome FROM voluntarios WHERE id = 'e1a980f8-09ed-434e-b838-6a86fb2d24a6';