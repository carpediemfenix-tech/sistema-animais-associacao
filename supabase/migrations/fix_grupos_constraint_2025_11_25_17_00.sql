-- Investigar e corrigir constraint CHECK da coluna tipo na tabela grupos
-- Data: 2025-11-25 17:00 UTC
-- Objetivo: Permitir tipos flexíveis de grupos 🏘️

-- 1. INVESTIGAR CONSTRAINTS DA TABELA GRUPOS
SELECT 
    'CONSTRAINTS DA TABELA GRUPOS:' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.grupos'::regclass 
ORDER BY contype, conname;

-- 2. BUSCAR ESPECIFICAMENTE A CONSTRAINT PROBLEMÁTICA
SELECT 
    'CONSTRAINT PROBLEMÁTICA TIPO:' as info,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.grupos'::regclass 
    AND conname = 'grupos_tipo_check';

-- 3. REMOVER A CONSTRAINT PROBLEMÁTICA
DO $$ 
BEGIN
    -- Verificar se a constraint existe e removê-la
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.grupos'::regclass 
            AND conname = 'grupos_tipo_check'
    ) THEN
        ALTER TABLE public.grupos DROP CONSTRAINT grupos_tipo_check;
        RAISE NOTICE 'Constraint grupos_tipo_check removida com sucesso! ✅';
    ELSE
        RAISE NOTICE 'Constraint grupos_tipo_check não encontrada';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover constraint: %', SQLERRM;
END $$;

-- 4. VERIFICAR ESTRUTURA ATUAL DA COLUNA TIPO
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'grupos' 
    AND column_name = 'tipo';

-- 5. ADICIONAR NOVOS TIPOS DE GRUPOS NA TABELA TIPOS_GRUPOS
INSERT INTO public.tipos_grupos (nome, descricao, icone) VALUES
('Sócios', 'Grupo de sócios - para todos os tipos de animais 🤝', 'Users'),
('Especiais', 'Grupo de animais com necessidades especiais 🌟', 'Heart'),
('Temporários', 'Grupo temporário para situações específicas ⏰', 'Clock')
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  icone = EXCLUDED.icone,
  updated_at = NOW();

-- 6. VERIFICAR TIPOS DE GRUPOS DISPONÍVEIS
SELECT 
    'TIPOS DE GRUPOS DISPONÍVEIS:' as info,
    id,
    nome,
    descricao,
    icone,
    ativo
FROM public.tipos_grupos 
WHERE ativo = true 
ORDER BY nome;

-- 7. TESTAR CRIAÇÃO DE GRUPO COM NOVO TIPO
DO $$
DECLARE
    test_id UUID;
    monica_id UUID;
BEGIN
    -- Buscar Mónica Vidal como responsável
    SELECT id INTO monica_id FROM public.voluntarios WHERE nome = 'Mónica Vidal';
    
    IF monica_id IS NOT NULL THEN
        -- Tentar criar grupo de teste
        INSERT INTO public.grupos (
            nome,
            tipo,
            localizacao,
            responsavel_voluntario_id,
            ativo
        ) VALUES (
            'TESTE_SOCIOS_GRUPO',
            'Sócios',
            'Sede da Associação',
            monica_id,
            true
        ) RETURNING id INTO test_id;
        
        -- Remover o teste
        DELETE FROM public.grupos WHERE id = test_id;
        
        RAISE NOTICE 'TESTE DE CRIAÇÃO DE GRUPO BEM-SUCEDIDO! ✅ Constraint removida!';
    END IF;
END $$;

SELECT 'CONSTRAINT DE GRUPOS CORRIGIDA E NOVOS TIPOS ADICIONADOS! 🎉' as status;