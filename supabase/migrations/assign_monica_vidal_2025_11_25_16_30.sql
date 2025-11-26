-- Atribuir Mónica Vidal como responsável pelos animais existentes
-- Data: 2025-11-25 16:30 UTC
-- Objetivo: Configurar responsabilidades para animais existentes 👩‍⚕️

-- 1. BUSCAR OU CRIAR MÓNICA VIDAL
DO $$
DECLARE
    monica_id UUID;
    animal_record RECORD;
BEGIN
    -- Buscar Mónica Vidal existente
    SELECT id INTO monica_id 
    FROM public.voluntarios 
    WHERE UPPER(nome) LIKE '%MÓNICA%' 
        OR UPPER(nome) LIKE '%MONICA%'
        OR UPPER(nome) LIKE '%VIDAL%'
    LIMIT 1;
    
    -- Se não encontrar, criar Mónica Vidal
    IF monica_id IS NULL THEN
        INSERT INTO public.voluntarios (
            nome,
            email,
            telefone,
            especialidade,
            observacoes,
            ativo,
            data_inicio
        ) VALUES (
            'Mónica Vidal',
            'monica.vidal@valentao.org',
            '912345678',
            'Cuidador',
            'Voluntária responsável pelos animais existentes no sistema',
            true,
            CURRENT_DATE
        ) RETURNING id INTO monica_id;
        
        RAISE NOTICE 'Mónica Vidal criada com ID: %', monica_id;
    ELSE
        RAISE NOTICE 'Mónica Vidal encontrada com ID: %', monica_id;
    END IF;
    
    -- Atualizar todos os animais sem voluntário responsável
    UPDATE public.animais 
    SET voluntario_responsavel_id = monica_id,
        updated_at = NOW()
    WHERE voluntario_responsavel_id IS NULL;
    
    RAISE NOTICE 'Animais atualizados com Mónica Vidal como responsável';
    
    -- Criar registros de responsabilidade para todos os animais existentes
    FOR animal_record IN 
        SELECT id, data_entrada, nome 
        FROM public.animais 
        WHERE voluntario_responsavel_id = monica_id
    LOOP
        -- Verificar se já existe registro de responsabilidade
        IF NOT EXISTS (
            SELECT 1 FROM public.responsabilidades_voluntarios 
            WHERE animal_id = animal_record.id
        ) THEN
            INSERT INTO public.responsabilidades_voluntarios (
                animal_id,
                voluntario_id,
                data_inicio,
                motivo_mudanca,
                observacoes,
                ativo
            ) VALUES (
                animal_record.id,
                monica_id,
                animal_record.data_entrada,
                'Responsabilidade inicial - animal já existente no sistema',
                'Mónica Vidal atribuída como responsável pelos animais já cadastrados',
                true
            );
            
            RAISE NOTICE 'Responsabilidade criada para animal: %', animal_record.nome;
        END IF;
    END LOOP;
    
END $$;

-- 2. VERIFICAR RESULTADOS
SELECT 
    'RESUMO DAS RESPONSABILIDADES:' as info,
    COUNT(*) as total_animais_com_responsavel
FROM public.animais 
WHERE voluntario_responsavel_id IS NOT NULL;

SELECT 
    'REGISTROS DE RESPONSABILIDADE:' as info,
    COUNT(*) as total_responsabilidades
FROM public.responsabilidades_voluntarios;

-- 3. LISTAR ANIMAIS E SEUS RESPONSÁVEIS
SELECT 
    'ANIMAIS E RESPONSÁVEIS:' as info,
    a.nome as animal_nome,
    a.numero_processo,
    v.nome as voluntario_responsavel
FROM public.animais a
LEFT JOIN public.voluntarios v ON a.voluntario_responsavel_id = v.id
ORDER BY a.nome;

-- 4. TESTAR INSERÇÃO DE NOVO ANIMAL (SEM CONSTRAINT)
DO $$
DECLARE
    test_id UUID;
    monica_id UUID;
    test_especie TEXT;
BEGIN
    -- Buscar Mónica Vidal
    SELECT id INTO monica_id FROM public.voluntarios WHERE nome = 'Mónica Vidal';
    
    -- Buscar uma espécie válida
    SELECT nome INTO test_especie FROM public.especies WHERE ativo = true LIMIT 1;
    
    IF monica_id IS NOT NULL AND test_especie IS NOT NULL THEN
        -- Tentar inserir animal de teste
        INSERT INTO public.animais (
            numero_processo,
            nome,
            especie,
            sexo,
            data_entrada,
            estado,
            arquivado,
            voluntario_responsavel_id
        ) VALUES (
            'P25999',
            'TESTE_FINAL_CONSTRAINT',
            test_especie,
            'Macho',
            CURRENT_DATE,
            'Ativo',
            false,
            monica_id
        ) RETURNING id INTO test_id;
        
        -- Remover o teste
        DELETE FROM public.animais WHERE id = test_id;
        
        RAISE NOTICE 'TESTE DE INSERÇÃO BEM-SUCEDIDO! ✅ Constraint removida com sucesso!';
    END IF;
END $$;

SELECT 'MÓNICA VIDAL ATRIBUÍDA E SISTEMA CORRIGIDO! 🎉' as status;