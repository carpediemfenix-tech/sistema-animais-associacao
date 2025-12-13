-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal'
ORDER BY ordinal_position;

-- Testar inserção novamente
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

-- Verificar se funcionou
SELECT COUNT(*) as total_after_test FROM localizacoes_animal;