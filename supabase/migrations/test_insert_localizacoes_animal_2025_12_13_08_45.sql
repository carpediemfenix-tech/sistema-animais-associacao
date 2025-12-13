-- Testar inserção com dados mínimos
-- Primeiro, verificar se temos um animal e uma localização válidos
SELECT 
    (SELECT id FROM animais LIMIT 1) as animal_id,
    (SELECT id FROM localizacoes LIMIT 1) as localizacao_id;

-- Tentar inserção de teste
INSERT INTO localizacoes_animal (
    animal_id,
    localizacao_id,
    data_inicio,
    ativo
) VALUES (
    (SELECT id FROM animais LIMIT 1),
    (SELECT id FROM localizacoes LIMIT 1),
    CURRENT_DATE,
    true
);

-- Verificar se a inserção funcionou
SELECT COUNT(*) as total_localizacoes FROM localizacoes_animal;