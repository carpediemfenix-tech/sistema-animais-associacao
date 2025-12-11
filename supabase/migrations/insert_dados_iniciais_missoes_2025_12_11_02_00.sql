-- Dados Iniciais para Sistema de Missões e Gamificação
-- Criado em: 2025-12-11 02:00 UTC

-- 1. Inserir Tipos de Missões
INSERT INTO tipos_missoes_2025_12_11_02_00 (nome, descricao, icone, cor, pontos_base, categoria) VALUES
('Cuidados Básicos', 'Missões relacionadas com cuidados básicos dos animais', 'Heart', '#EF4444', 15, 'cuidados'),
('Formação e Treino', 'Missões de desenvolvimento de competências', 'GraduationCap', '#3B82F6', 25, 'formacao'),
('Administrativo', 'Tarefas administrativas e de gestão', 'FileText', '#8B5CF6', 10, 'administrativo'),
('Eventos e Atividades', 'Organização e participação em eventos', 'Calendar', '#F59E0B', 20, 'eventos'),
('Captação de Recursos', 'Angariação de fundos e recursos', 'DollarSign', '#10B981', 30, 'recursos'),
('Comunicação', 'Atividades de comunicação e divulgação', 'Megaphone', '#EC4899', 15, 'comunicacao');

-- 2. Inserir Níveis de Gamificação
INSERT INTO niveis_gamificacao_2025_12_11_02_00 (nome, pontos_minimos, pontos_maximos, icone, cor, beneficios, ordem) VALUES
('Novato', 0, 99, 'Sprout', '#22C55E', 'Acesso básico ao sistema de missões', 1),
('Aprendiz', 100, 299, 'User', '#3B82F6', 'Acesso a missões de dificuldade média', 2),
('Voluntário', 300, 699, 'UserCheck', '#8B5CF6', 'Acesso a todas as missões + 10% bónus pontos', 3),
('Especialista', 700, 1499, 'Award', '#F59E0B', 'Pode criar missões + 15% bónus pontos', 4),
('Mentor', 1500, 2999, 'Crown', '#EF4444', 'Pode gerir equipas + 20% bónus pontos', 5),
('Lenda', 3000, NULL, 'Star', '#FFD700', 'Acesso total + 25% bónus pontos + benefícios exclusivos', 6);

-- 3. Inserir Conquistas
INSERT INTO conquistas_2025_12_11_02_00 (nome, descricao, icone, cor, criterio, pontos_bonus, raridade, categoria) VALUES
('Primeira Missão', 'Completou a sua primeira missão', 'Trophy', '#FFD700', 'Completar 1 missão', 10, 'comum', 'geral'),
('Dedicado', 'Completou 10 missões', 'Medal', '#C0C0C0', 'Completar 10 missões', 25, 'comum', 'geral'),
('Veterano', 'Completou 50 missões', 'Award', '#CD7F32', 'Completar 50 missões', 100, 'raro', 'geral'),
('Lenda Viva', 'Completou 100 missões', 'Crown', '#FFD700', 'Completar 100 missões', 250, 'lendario', 'geral'),
('Streak de Ferro', 'Ativo por 7 dias consecutivos', 'Flame', '#FF4500', 'Streak de 7 dias', 50, 'raro', 'atividade'),
('Streak de Diamante', 'Ativo por 30 dias consecutivos', 'Zap', '#00BFFF', 'Streak de 30 dias', 200, 'epico', 'atividade'),
('Cuidador Exemplar', 'Completou 20 missões de cuidados', 'Heart', '#EF4444', 'Completar 20 missões de cuidados', 75, 'raro', 'cuidados'),
('Mestre Formador', 'Completou 15 missões de formação', 'GraduationCap', '#3B82F6', 'Completar 15 missões de formação', 100, 'epico', 'formacao'),
('Organizador Nato', 'Organizou 5 eventos', 'Calendar', '#F59E0B', 'Organizar 5 eventos', 150, 'epico', 'eventos'),
('Anjo da Guarda', 'Salvou a vida de um animal', 'Shield', '#10B981', 'Participar em resgate de emergência', 500, 'lendario', 'especial');

-- 4. Inserir Recompensas
INSERT INTO recompensas_2025_12_11_02_00 (nome, descricao, tipo, custo_pontos, quantidade_disponivel, validade_dias, instrucoes_resgate) VALUES
('Badge Digital Exclusivo', 'Badge especial para o perfil', 'virtual', 50, NULL, NULL, 'Aplicado automaticamente ao perfil'),
('Certificado de Reconhecimento', 'Certificado oficial da associação', 'virtual', 100, NULL, 30, 'Enviado por email em PDF'),
('T-shirt Valentão', 'T-shirt oficial da associação', 'fisica', 200, 50, 60, 'Contactar administração para entrega'),
('Caneca Personalizada', 'Caneca com logo da associação', 'fisica', 150, 30, 45, 'Contactar administração para entrega'),
('Desconto Veterinário 10%', 'Desconto em clínicas parceiras', 'desconto', 300, 20, 90, 'Código enviado por email'),
('Visita VIP ao Canil', 'Visita especial com acesso exclusivo', 'experiencia', 250, 10, 30, 'Agendar com administração'),
('Formação Gratuita', 'Acesso a formação especializada', 'experiencia', 400, 15, 60, 'Inscrição automática na próxima formação'),
('Jantar de Reconhecimento', 'Jantar especial com a direção', 'experiencia', 500, 5, 90, 'Convite enviado por email');

-- 5. Inserir Missões de Exemplo
INSERT INTO missoes_2025_12_11_02_00 (titulo, descricao, tipo_missao_id, pontos_recompensa, dificuldade, prazo_dias, max_participantes, requisitos, instrucoes, status) VALUES
('Primeira Visita ao Canil', 
 'Faça a sua primeira visita ao canil e conheça os nossos animais', 
 (SELECT id FROM tipos_missoes_2025_12_11_02_00 WHERE nome = 'Cuidados Básicos' LIMIT 1),
 20, 'facil', 7, 1, 
 'Ser voluntário registado', 
 '1. Agende a visita com a administração\n2. Participe numa visita guiada\n3. Tire uma foto com os animais\n4. Partilhe a experiência', 
 'ativa'),

('Formação Básica de Cuidados', 
 'Complete a formação básica sobre cuidados com animais', 
 (SELECT id FROM tipos_missoes_2025_12_11_02_00 WHERE nome = 'Formação e Treino' LIMIT 1),
 50, 'medio', 14, 10, 
 'Nível Aprendiz ou superior', 
 '1. Inscreva-se na formação\n2. Participe em todas as sessões\n3. Passe no teste final\n4. Obtenha o certificado', 
 'ativa'),

('Organizar Evento de Adoção', 
 'Ajude a organizar um evento de adoção de animais', 
 (SELECT id FROM tipos_missoes_2025_12_11_02_00 WHERE nome = 'Eventos e Atividades' LIMIT 1),
 100, 'dificil', 30, 5, 
 'Nível Voluntário ou superior, experiência em eventos', 
 '1. Planeie o evento com a equipa\n2. Coordene a logística\n3. Promova o evento\n4. Execute o evento\n5. Faça relatório final', 
 'ativa'),

('Campanha de Angariação', 
 'Crie e execute uma campanha de angariação de fundos', 
 (SELECT id FROM tipos_missoes_2025_12_11_02_00 WHERE nome = 'Captação de Recursos' LIMIT 1),
 150, 'expert', 45, 3, 
 'Nível Especialista, experiência em marketing', 
 '1. Desenvolva estratégia de campanha\n2. Crie materiais promocionais\n3. Execute a campanha\n4. Monitore resultados\n5. Apresente relatório final', 
 'ativa');

-- 6. Inserir Tarefas para as Missões
INSERT INTO tarefas_missoes_2025_12_11_02_00 (missao_id, titulo, descricao, ordem, pontos, obrigatoria, tipo_verificacao) VALUES
-- Tarefas para "Primeira Visita ao Canil"
((SELECT id FROM missoes_2025_12_11_02_00 WHERE titulo = 'Primeira Visita ao Canil' LIMIT 1), 
 'Agendar Visita', 'Contacte a administração para agendar a visita', 1, 5, true, 'manual'),
((SELECT id FROM missoes_2025_12_11_02_00 WHERE titulo = 'Primeira Visita ao Canil' LIMIT 1), 
 'Participar na Visita', 'Participe na visita guiada ao canil', 2, 10, true, 'manual'),
((SELECT id FROM missoes_2025_12_11_02_00 WHERE titulo = 'Primeira Visita ao Canil' LIMIT 1), 
 'Tirar Foto', 'Tire uma foto com os animais (opcional)', 3, 3, false, 'foto'),
((SELECT id FROM missoes_2025_12_11_02_00 WHERE titulo = 'Primeira Visita ao Canil' LIMIT 1), 
 'Partilhar Experiência', 'Escreva um breve relato da experiência', 4, 2, true, 'manual'),

-- Tarefas para "Formação Básica de Cuidados"
((SELECT id FROM missoes_2025_12_11_02_00 WHERE titulo = 'Formação Básica de Cuidados' LIMIT 1), 
 'Inscrição na Formação', 'Inscreva-se na próxima sessão de formação', 1, 5, true, 'manual'),
((SELECT id FROM missoes_2025_12_11_02_00 WHERE titulo = 'Formação Básica de Cuidados' LIMIT 1), 
 'Assistir às Sessões', 'Participe em todas as sessões de formação', 2, 20, true, 'manual'),
((SELECT id FROM missoes_2025_12_11_02_00 WHERE titulo = 'Formação Básica de Cuidados' LIMIT 1), 
 'Teste Final', 'Complete o teste final com nota mínima de 70%', 3, 15, true, 'manual'),
((SELECT id FROM missoes_2025_12_11_02_00 WHERE titulo = 'Formação Básica de Cuidados' LIMIT 1), 
 'Obter Certificado', 'Receba o certificado de conclusão', 4, 10, true, 'automatica');

-- Criar políticas RLS permissivas para todas as tabelas
ALTER TABLE tipos_missoes_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas_missoes_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE participacoes_missoes_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_tarefas_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE niveis_gamificacao_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontuacao_voluntarios_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntarios_conquistas_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE recompensas_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE resgates_recompensas_2025_12_11_02_00 ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para usuários autenticados
CREATE POLICY "Allow all for authenticated users" ON tipos_missoes_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON missoes_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON tarefas_missoes_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON participacoes_missoes_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON progresso_tarefas_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON niveis_gamificacao_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON pontuacao_voluntarios_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON conquistas_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON voluntarios_conquistas_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON recompensas_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON resgates_recompensas_2025_12_11_02_00 FOR ALL USING (true) WITH CHECK (true);