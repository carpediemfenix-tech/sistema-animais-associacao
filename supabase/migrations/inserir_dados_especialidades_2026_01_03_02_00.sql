-- Inserir especialidades padrão (apenas se não existirem)
INSERT INTO public.especialidades_voluntarios_2025_12_21_22_00 (codigo, nome, descricao, categoria, cor, icone, pontos_bonus, requer_certificacao) 
SELECT * FROM (VALUES
    ('resgate_emergencia', 'Resgate de Emergência', 'Especialista em resgates urgentes de animais em situação de perigo', 'resgate', 'red', 'Shield', 15, true),
    ('cuidados_veterinarios', 'Cuidados Veterinários', 'Conhecimentos em primeiros socorros e cuidados básicos veterinários', 'saude', 'green', 'Heart', 20, true),
    ('adestramento', 'Adestramento e Comportamento', 'Especialista em comportamento animal e técnicas de adestramento', 'comportamento', 'purple', 'Brain', 12, false),
    ('transporte_animais', 'Transporte de Animais', 'Experiência no transporte seguro de animais', 'logistica', 'blue', 'Truck', 8, false),
    ('eventos_adocao', 'Eventos de Adoção', 'Organização e gestão de eventos de adoção', 'eventos', 'yellow', 'Calendar', 10, false),
    ('fotografia', 'Fotografia de Animais', 'Especialista em fotografia para perfis de adoção', 'marketing', 'pink', 'Camera', 5, false),
    ('redes_sociais', 'Gestão de Redes Sociais', 'Marketing digital e gestão de redes sociais', 'marketing', 'cyan', 'Share', 8, false),
    ('administracao', 'Administração e Gestão', 'Apoio administrativo e gestão de processos', 'admin', 'gray', 'FileText', 6, false),
    ('captacao_fundos', 'Captação de Fundos', 'Organização de campanhas de angariação de fundos', 'financeiro', 'orange', 'DollarSign', 12, false),
    ('educacao_ambiental', 'Educação Ambiental', 'Ações de sensibilização e educação sobre proteção animal', 'educacao', 'green', 'BookOpen', 10, false)
) AS v(codigo, nome, descricao, categoria, cor, icone, pontos_bonus, requer_certificacao)
WHERE NOT EXISTS (
    SELECT 1 FROM public.especialidades_voluntarios_2025_12_21_22_00 WHERE codigo = v.codigo
);

-- Verificar inserção
SELECT codigo, nome, categoria, ativo 
FROM public.especialidades_voluntarios_2025_12_21_22_00 
ORDER BY categoria, nome;