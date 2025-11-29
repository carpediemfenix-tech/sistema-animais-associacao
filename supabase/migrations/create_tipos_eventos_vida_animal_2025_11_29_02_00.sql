-- ========================================
-- TIPOS DE EVENTOS DA VIDA DOS ANIMAIS
-- ========================================

-- Inserir tipos de eventos predefinidos
INSERT INTO tipos_eventos (nome, descricao, ativo) 
SELECT * FROM (VALUES
    ('🐣 Nascimento', 'Data de nascimento do animal', true),
    ('🏠 Entrada na Associação', 'Chegada do animal à associação', true),
    ('🩺 Primeira Consulta', 'Primeira consulta veterinária', true),
    ('✂️ Castração', 'Procedimento de castração realizado', true),
    ('💉 Vacinação Completa', 'Esquema vacinal completo', true),
    ('❤️ Adoção', 'Animal foi adotado por uma família', true),
    ('↩️ Retorno', 'Animal retornou após adoção falhada', true),
    ('🔄 Transferência', 'Mudança de localização ou responsável', true),
    ('🌟 Recuperação', 'Fim de tratamento médico com sucesso', true),
    ('🤝 Socialização', 'Marco importante na socialização', true),
    ('🏷️ Identificação', 'Colocação de transponder/identificação', true),
    ('😢 Óbito', 'Falecimento do animal', true),
    ('🎂 Aniversário', 'Comemoração de aniversário', true),
    ('🏆 Marco Especial', 'Evento especial ou conquista', true),
    ('📋 Avaliação Comportamental', 'Avaliação de comportamento', true)
) AS v(nome, descricao, ativo)
WHERE NOT EXISTS (
    SELECT 1 FROM tipos_eventos WHERE tipos_eventos.nome = v.nome
);

-- Verificar tipos de eventos criados
SELECT 
    'Tipos de eventos criados com sucesso!' as status,
    (SELECT COUNT(*) FROM tipos_eventos WHERE ativo = true) as tipos_ativos;

-- Verificar estrutura da tabela eventos_animal
SELECT 
    'Estrutura da tabela eventos_animal:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'eventos_animal' 
ORDER BY ordinal_position;