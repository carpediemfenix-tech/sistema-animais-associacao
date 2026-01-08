-- Teste de compatibilidade entre módulos Animais e Denúncias
-- Este script simula a criação de um animal via módulo Denúncias

-- 1. Verificar se o estado 'Em Resgate' existe
SELECT 'Estado Em Resgate:' as teste, 
       CASE WHEN EXISTS (SELECT 1 FROM tipos_estado WHERE nome = 'Em Resgate') 
            THEN '✅ EXISTE' 
            ELSE '❌ NÃO EXISTE' 
       END as resultado;

-- 2. Testar inserção de animal como faria o módulo Denúncias
INSERT INTO animais (
    nome,
    numero_processo,
    especie,
    sexo,
    estado,
    local_encontrado,
    data_entrada,
    observacoes,
    voluntario_responsavel,
    ativo,
    created_at,
    updated_at
) VALUES (
    'TESTE-DENUNCIA-ANIM01',
    'TESTE-DENUNCIA-P01',
    'Cão',
    'Macho',
    'Em Resgate',
    'Local de teste para verificação de compatibilidade',
    CURRENT_DATE,
    'Animal de teste criado para verificar compatibilidade entre módulos',
    NULL, -- Pode ser NULL
    true,
    NOW(),
    NOW()
) RETURNING id, nome, estado;

-- 3. Verificar se a inserção foi bem-sucedida
SELECT 'Teste de Inserção:' as teste,
       CASE WHEN EXISTS (SELECT 1 FROM animais WHERE nome = 'TESTE-DENUNCIA-ANIM01')
            THEN '✅ SUCESSO'
            ELSE '❌ FALHOU'
       END as resultado;

-- 4. Testar atualização (como faria o módulo EditarAnimal)
UPDATE animais 
SET observacoes = 'Animal de teste - atualizado via EditarAnimal',
    updated_at = NOW()
WHERE nome = 'TESTE-DENUNCIA-ANIM01'
RETURNING id, nome, observacoes;

-- 5. Verificar se a atualização foi bem-sucedida
SELECT 'Teste de Atualização:' as teste,
       CASE WHEN EXISTS (SELECT 1 FROM animais WHERE nome = 'TESTE-DENUNCIA-ANIM01' AND observacoes LIKE '%atualizado via EditarAnimal%')
            THEN '✅ SUCESSO'
            ELSE '❌ FALHOU'
       END as resultado;

-- 6. Limpar dados de teste
DELETE FROM animais WHERE nome = 'TESTE-DENUNCIA-ANIM01';

-- 7. Resumo final dos testes
SELECT 'RESUMO DOS TESTES DE COMPATIBILIDADE' as titulo;
SELECT 'Todos os testes devem mostrar ✅ SUCESSO' as instrucoes;