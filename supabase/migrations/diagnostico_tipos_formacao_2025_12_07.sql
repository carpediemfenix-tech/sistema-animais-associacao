-- DIAGNÓSTICO COMPLETO DA TABELA TIPOS_FORMACAO
-- Verificar existência, dados e permissões
-- Criado em: 2025-12-07 05:30 UTC

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 'Verificando existência da tabela...' as status;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'tipos_formacao';

-- 2. VERIFICAR ESTRUTURA DA TABELA
SELECT 'Verificando estrutura da tabela...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tipos_formacao'
ORDER BY ordinal_position;

-- 3. CONTAR REGISTOS
SELECT 'Contando registos...' as status;
SELECT COUNT(*) as total_registos FROM public.tipos_formacao;

-- 4. MOSTRAR TODOS OS DADOS
SELECT 'Mostrando todos os dados...' as status;
SELECT * FROM public.tipos_formacao ORDER BY nivel_ordem;

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 'Verificando políticas RLS...' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'tipos_formacao';

-- 6. VERIFICAR SE RLS ESTÁ ATIVO
SELECT 'Verificando se RLS está ativo...' as status;
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tipos_formacao';

-- 7. TESTAR CONSULTA COMO USUÁRIO AUTENTICADO
SELECT 'Testando consulta como usuário autenticado...' as status;
SET ROLE authenticated;
SELECT id, codigo, nome, ativo FROM public.tipos_formacao WHERE ativo = true ORDER BY nivel_ordem;
RESET ROLE;

-- 8. SE NÃO HOUVER DADOS, INSERIR NOVAMENTE
DO $$
BEGIN
    -- Verificar se há dados
    IF (SELECT COUNT(*) FROM public.tipos_formacao) = 0 THEN
        -- Inserir dados básicos
        INSERT INTO public.tipos_formacao (codigo, nome, descricao, nivel_ordem, carga_horaria_minima, competencias, pre_requisitos, cor, icone, ativo) VALUES
        ('FORMA_BASE', 'FORMA BASE', 'Formação básica obrigatória', 1, 40, '[]'::jsonb, '[]'::jsonb, '#10B981', '🌱', true),
        ('FORMA_N1', 'Formação Nível 1', 'Primeiro nível de especialização', 2, 60, '[]'::jsonb, '[]'::jsonb, '#3B82F6', '🛡️', true),
        ('FORMA_N2', 'Formação Nível 2', 'Nível intermédio', 3, 80, '[]'::jsonb, '[]'::jsonb, '#8B5CF6', '⚔️', true);
        
        RAISE NOTICE 'Dados inseridos com sucesso!';
    ELSE
        RAISE NOTICE 'Dados já existem na tabela.';
    END IF;
END $$;

-- 9. VERIFICAÇÃO FINAL
SELECT 'Verificação final...' as status;
SELECT COUNT(*) as total_final FROM public.tipos_formacao;
SELECT codigo, nome, ativo FROM public.tipos_formacao ORDER BY nivel_ordem;