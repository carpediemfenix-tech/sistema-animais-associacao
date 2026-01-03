-- Limpar dados existentes para evitar duplicados
DELETE FROM public.especialidades_voluntarios_2025_12_21_22_00;

-- Inserir especialidades padrão com estrutura correta
INSERT INTO public.especialidades_voluntarios_2025_12_21_22_00 (nome, descricao, categoria, ativo) VALUES
('Resgate de Emergência', 'Especialista em resgates urgentes de animais em situação de perigo', 'Resgate', true),
('Cuidados Veterinários', 'Conhecimentos em primeiros socorros e cuidados básicos veterinários', 'Saúde', true),
('Adestramento e Comportamento', 'Especialista em comportamento animal e técnicas de adestramento', 'Comportamento', true),
('Transporte de Animais', 'Experiência no transporte seguro de animais', 'Logística', true),
('Eventos de Adoção', 'Organização e gestão de eventos de adoção', 'Eventos', true),
('Fotografia de Animais', 'Especialista em fotografia para perfis de adoção', 'Marketing', true),
('Gestão de Redes Sociais', 'Marketing digital e gestão de redes sociais', 'Marketing', true),
('Administração e Gestão', 'Apoio administrativo e gestão de processos', 'Administração', true),
('Captação de Fundos', 'Organização de campanhas de angariação de fundos', 'Financeiro', true),
('Educação Ambiental', 'Ações de sensibilização e educação sobre proteção animal', 'Educação', true),
('Cuidados Básicos', 'Alimentação, higiene e cuidados básicos com animais', 'Cuidados Animais', true),
('Primeiros Socorros', 'Conhecimentos básicos de primeiros socorros para animais', 'Veterinária', true);

-- Verificar inserção
SELECT id, nome, categoria, ativo 
FROM public.especialidades_voluntarios_2025_12_21_22_00 
ORDER BY categoria, nome;