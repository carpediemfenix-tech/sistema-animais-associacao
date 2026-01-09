-- POPULAR DADOS DE EXEMPLO PARA AGENDA FUTURÍSTICA
-- Inserir mais eventos de exemplo para demonstração
INSERT INTO agenda_eventos_unificada_2026_01_09_09_00 (
  titulo, descricao, tipo_evento, categoria, data_evento, data_fim, status, prioridade, local, observacoes, metadados, cor_evento, icone_evento
) VALUES 
-- Eventos Ativos (Futuros)
('Cirurgia de Esterilização - Luna', 'Cirurgia de esterilização programada para cadela Luna', 'intervencao_medica', 'ativo', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 'agendado', 'alta', 'Clínica Veterinária São Francisco', 'Jejum de 12h necessário', '{"tipo_cirurgia": "esterilizacao", "anestesia": "geral", "custo_estimado": 150}', '#DC2626', 'Heart'),

('Workshop: Cuidados com Filhotes', 'Formação sobre cuidados especiais com animais jovens', 'formacao', 'ativo', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'agendado', 'normal', 'Auditório da Associação', 'Certificado de participação será emitido', '{"instrutor": "Dr. Maria Silva", "vagas": 25, "certificacao": true}', '#7C2D12', 'GraduationCap'),

('Resgate Urgente - Gato Ferido', 'Resgate de gato atropelado reportado por munícipe', 'missao_resgate', 'ativo', NOW() + INTERVAL '6 hours', NOW() + INTERVAL '6 hours' + INTERVAL '2 hours', 'confirmado', 'urgente', 'Avenida Central, próximo ao mercado', 'Equipamento de emergência necessário', '{"tipo_ferimento": "trauma", "equipamentos": ["maca", "kit_primeiros_socorros"], "voluntarios_necessarios": 2}', '#059669', 'Shield'),

('Consulta Pós-Operatória - Max', 'Consulta de acompanhamento após cirurgia', 'consulta_veterinaria', 'ativo', NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days' + INTERVAL '30 minutes', 'agendado', 'normal', 'Clínica Veterinária Central', 'Verificar cicatrização e remover pontos', '{"tipo_consulta": "pos_operatorio", "procedimento_anterior": "cirurgia_tumor"}', '#7C3AED', 'Stethoscope'),

('Evento de Adoção - Feira no Parque', 'Feira de adoção mensal no parque da cidade', 'evento_associacao', 'ativo', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '6 hours', 'agendado', 'alta', 'Parque Municipal da Cidade', 'Levar 8 animais disponíveis para adoção', '{"animais_participantes": 8, "voluntarios_necessarios": 6, "material": ["tendas", "folhetos", "fichas_adocao"]}', '#9333EA', 'Heart'),

('Manutenção - Sistema de Aquecimento', 'Manutenção preventiva do sistema de aquecimento dos canis', 'manutencao', 'ativo', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '4 hours', 'agendado', 'normal', 'Instalações da Associação - Setor A', 'Verificar todos os aquecedores antes do inverno', '{"tipo_manutencao": "preventiva", "equipamentos": ["aquecedores", "termostatos"], "tecnico": "João Santos"}', '#EA580C', 'Wrench'),

-- Eventos Memorial (Histórico)
('Entrada: Bella', 'Cadela resgatada da rua admitida na associação', 'entrada_animal', 'memorial', NOW() - INTERVAL '15 days', NULL, 'concluido', 'normal', 'Rua das Flores, encontrada por cidadão', 'Animal em bom estado geral, vacinação em dia', '{"processo": "P26001", "especie": "Canina", "raca": "SRD", "idade_estimada": "2 anos", "peso": "15kg"}', '#16A34A', 'PlusCircle'),

('Adoção Concluída: Rex', 'Cão Rex foi adotado pela família Santos', 'adocao_concluida', 'memorial', NOW() - INTERVAL '5 days', NULL, 'concluido', 'normal', 'Residência da Família Santos', 'Processo de adoção finalizado com sucesso após período de adaptação', '{"familia_adotante": "Santos", "periodo_adaptacao": "7 dias", "acompanhamento": "30 dias"}', '#059669', 'Heart'),

('Mudança: Thor para Setor B', 'Cão Thor transferido para setor de animais grandes', 'mudanca_localizacao', 'memorial', NOW() - INTERVAL '8 days', NULL, 'concluido', 'normal', 'Setor B - Canis Grandes', 'Transferência devido ao crescimento do animal', '{"localizacao_anterior": "Setor A", "motivo": "crescimento", "responsavel": "Maria Silva"}', '#0D9488', 'MapPin'),

('Marco: 100ª Adoção do Ano', 'Celebração da centésima adoção realizada este ano', 'marco_importante', 'memorial', NOW() - INTERVAL '12 days', NULL, 'concluido', 'normal', 'Sede da Associação', 'Meta anual de adoções atingida com 3 meses de antecedência', '{"numero_adocao": 100, "meta_anual": 120, "percentual_atingido": "83%"}', '#F59E0B', 'Star'),

('Óbito: Mimi (Idade Avançada)', 'Gata Mimi faleceu devido à idade avançada', 'obito', 'memorial', NOW() - INTERVAL '20 days', NULL, 'concluido', 'normal', 'Clínica Veterinária - Cuidados Paliativos', 'Animal de 18 anos, falecimento natural após cuidados paliativos', '{"idade": "18 anos", "causa": "idade_avancada", "cuidados": "paliativos", "tempo_associacao": "3 anos"}', '#374151', 'X'),

('Formação Concluída: Primeiros Socorros', 'Workshop de primeiros socorros para 15 voluntários', 'formacao', 'memorial', NOW() - INTERVAL '25 days', NULL, 'concluido', 'normal', 'Auditório da Associação', 'Todos os participantes foram certificados', '{"participantes": 15, "certificados_emitidos": 15, "instrutor": "Dr. Pedro Costa", "carga_horaria": "4h"}', '#7C2D12', 'GraduationCap'),

-- Eventos para próxima semana (para estatísticas)
('Consulta de Rotina - Múltiplos Animais', 'Dia de consultas de rotina para 6 animais', 'consulta_veterinaria', 'ativo', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '4 hours', 'agendado', 'normal', 'Clínica Veterinária Central', 'Consultas agendadas: Bella, Max, Luna, Thor, Mimi, Rex', '{"animais": 6, "tipo": "rotina", "veterinario": "Dr. Ana Costa"}', '#7C3AED', 'Stethoscope'),

('Missão: Transporte para Adoção', 'Transporte de 3 animais para suas novas famílias', 'missao_adocao', 'ativo', NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days' + INTERVAL '3 hours', 'agendado', 'alta', 'Múltiplas localizações na cidade', 'Coordenar entregas com 3 famílias diferentes', '{"animais": 3, "familias": 3, "voluntarios": 2, "veiculo": "van_associacao"}', '#0891B2', 'Heart'),

('Tarefa: Limpeza Geral das Instalações', 'Limpeza e desinfecção completa de todas as instalações', 'tarefa_voluntario', 'ativo', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '6 hours', 'agendado', 'normal', 'Todas as instalações da Associação', 'Mutirão de limpeza com todos os voluntários disponíveis', '{"voluntarios_necessarios": 8, "materiais": ["desinfetante", "equipamentos_limpeza"], "areas": ["canis", "gatis", "clinica", "escritorio"]}', '#2563EB', 'Users');

-- Atualizar estatísticas de updated_at para simular atividade recente
UPDATE agenda_eventos_unificada_2026_01_09_09_00 
SET updated_at = NOW() - (RANDOM() * INTERVAL '30 days')
WHERE categoria = 'memorial';

UPDATE agenda_eventos_unificada_2026_01_09_09_00 
SET updated_at = NOW() - (RANDOM() * INTERVAL '7 days')
WHERE categoria = 'ativo';