-- Limpar dados existentes para recriar com estrutura completa
DELETE FROM public.especialidades_voluntarios_2025_12_21_22_00;

-- Inserir especialidades com estrutura completa (ícones, cores, etc.)
INSERT INTO public.especialidades_voluntarios_2025_12_21_22_00 (codigo, nome, descricao, categoria, cor, icone, pontos_bonus, requer_certificacao, ativo) VALUES
('resgate_emergencia', 'Resgate de Emergência', 'Especialista em resgates urgentes de animais em situação de perigo', 'Resgate', 'red', 'Shield', 15, true, true),
('cuidados_veterinarios', 'Cuidados Veterinários', 'Conhecimentos em primeiros socorros e cuidados básicos veterinários', 'Saúde', 'green', 'Heart', 20, true, true),
('adestramento', 'Adestramento e Comportamento', 'Especialista em comportamento animal e técnicas de adestramento', 'Comportamento', 'purple', 'Brain', 12, false, true),
('transporte_animais', 'Transporte de Animais', 'Experiência no transporte seguro de animais', 'Logística', 'blue', 'Truck', 8, false, true),
('eventos_adocao', 'Eventos de Adoção', 'Organização e gestão de eventos de adoção', 'Eventos', 'yellow', 'Calendar', 10, false, true),
('fotografia', 'Fotografia de Animais', 'Especialista em fotografia para perfis de adoção', 'Marketing', 'pink', 'Camera', 5, false, true),
('redes_sociais', 'Gestão de Redes Sociais', 'Marketing digital e gestão de redes sociais', 'Marketing', 'cyan', 'Share', 8, false, true),
('administracao', 'Administração e Gestão', 'Apoio administrativo e gestão de processos', 'Administração', 'gray', 'FileText', 6, false, true),
('captacao_fundos', 'Captação de Fundos', 'Organização de campanhas de angariação de fundos', 'Financeiro', 'orange', 'DollarSign', 12, false, true),
('educacao_ambiental', 'Educação Ambiental', 'Ações de sensibilização e educação sobre proteção animal', 'Educação', 'green', 'BookOpen', 10, false, true),
('cuidados_basicos', 'Cuidados Básicos', 'Alimentação, higiene e cuidados básicos com animais', 'Cuidados Animais', 'teal', 'Stethoscope', 5, false, true),
('primeiros_socorros', 'Primeiros Socorros', 'Conhecimentos básicos de primeiros socorros para animais', 'Veterinária', 'emerald', 'Plus', 8, true, true);

-- Verificar inserção com todas as informações
SELECT codigo, nome, categoria, cor, icone, pontos_bonus, requer_certificacao, ativo
FROM public.especialidades_voluntarios_2025_12_21_22_00 
ORDER BY categoria, nome;