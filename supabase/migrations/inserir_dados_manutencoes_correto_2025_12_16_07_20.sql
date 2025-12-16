-- VERIFICAR ESTRUTURA EXATA E INSERIR DADOS CORRETOS

-- 1. Verificar estrutura completa da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'manutencoes_equipamentos_2025_12_13_01_00' 
ORDER BY ordinal_position;

-- 2. Limpar dados existentes
DELETE FROM manutencoes_equipamentos_2025_12_13_01_00;

-- 3. Inserir dados com todos os campos obrigatórios
INSERT INTO manutencoes_equipamentos_2025_12_13_01_00 (
    equipamento_id, tipo_manutencao, data_manutencao, data_proxima_manutencao, 
    descricao, custo, fornecedor_servico, status, observacoes
) VALUES 

-- Manutenção preventiva do berbequim (em manutenção)
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'FER001'), 
 'Preventiva', '2024-12-10', '2025-03-10', 
 'Manutenção preventiva trimestral - lubrificação e verificação de componentes', 
 25.00, 'Oficina Técnica Lda', 'em_andamento', 
 'Equipamento apresentava ruído excessivo'),

-- Manutenção corretiva das botas EPI (concluída)
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'EPI002'), 
 'Corretiva', '2024-11-20', '2025-05-20', 
 'Substituição de sola danificada', 
 15.00, 'Reparos Calçado', 'concluida', 
 'Sola estava desgastada, substituída por nova'),

-- Manutenção preventiva agendada para tablet
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG001'), 
 'Preventiva', '2024-12-20', '2025-06-20', 
 'Atualização de software e limpeza interna', 
 0.00, 'Suporte Interno', 'agendada', 
 'Manutenção preventiva semestral'),

-- Manutenção corretiva agendada para rede de captura
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'RES002'), 
 'Corretiva', '2024-12-18', '2025-03-18', 
 'Reparo de malha danificada', 
 12.00, 'Costura Especializada', 'agendada', 
 'Pequeno rasgo na rede detectado durante inspeção');

-- 4. Verificar inserção
SELECT 
    COUNT(*) as total_manutencoes,
    COUNT(CASE WHEN status = 'agendada' THEN 1 END) as agendadas,
    COUNT(CASE WHEN status = 'em_andamento' THEN 1 END) as em_andamento,
    COUNT(CASE WHEN status = 'concluida' THEN 1 END) as concluidas
FROM manutencoes_equipamentos_2025_12_13_01_00;