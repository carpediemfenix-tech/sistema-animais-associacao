-- RESET SIMPLES DO SISTEMA PARA TESTE INTENSIVO
-- Data: 2025-12-08 06:00 UTC
-- Objetivo: Limpar apenas dados de animais e voluntários, manter configurações

-- ============================================================================
-- FASE 1: LIMPEZA DOS DADOS PRINCIPAIS
-- ============================================================================

-- Desativar verificações de foreign key temporariamente
SET session_replication_role = replica;

-- Limpar dados de formação e participações (se existirem)
DELETE FROM public.participacoes_formacao WHERE 1=1;
DELETE FROM public.acoes_formacao WHERE 1=1;

-- Limpar dados de responsabilidades
DELETE FROM public.responsabilidades_voluntarios WHERE 1=1;

-- Limpar dados financeiros
DELETE FROM public.movimentos_financeiros WHERE 1=1;

-- Limpar dados de intervenções
DELETE FROM public.intervencoes WHERE 1=1;

-- Limpar dados principais
DELETE FROM public.animais WHERE 1=1;
DELETE FROM public.voluntarios WHERE 1=1;

-- Reativar verificações de foreign key
SET session_replication_role = DEFAULT;

-- ============================================================================
-- FASE 2: CONFIGURAR NUMERAÇÃO P25001
-- ============================================================================

-- Reset da sequence do número de processo para começar em P25001
DROP SEQUENCE IF EXISTS public.numero_processo_seq CASCADE;
CREATE SEQUENCE public.numero_processo_seq START WITH 25001;

-- Criar função para gerar número de processo
CREATE OR REPLACE FUNCTION public.generate_numero_processo()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
BEGIN
    -- Obter próximo número da sequence
    SELECT nextval('public.numero_processo_seq') INTO next_num;
    
    -- Retornar no formato P25001, P25002, etc.
    RETURN 'P' || next_num::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_generate_numero_processo ON public.animais;

-- Criar função do trigger
CREATE OR REPLACE FUNCTION public.set_numero_processo()
RETURNS TRIGGER AS $$
BEGIN
    -- Se número de processo não foi fornecido, gerar automaticamente
    IF NEW.numero_processo IS NULL OR NEW.numero_processo = '' THEN
        NEW.numero_processo := public.generate_numero_processo();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para auto-gerar número de processo
CREATE TRIGGER trigger_generate_numero_processo
    BEFORE INSERT ON public.animais
    FOR EACH ROW
    EXECUTE FUNCTION public.set_numero_processo();

-- ============================================================================
-- FASE 3: INSERIR ADMINISTRADOR DE TESTE
-- ============================================================================

-- Inserir um voluntário administrador de teste
INSERT INTO public.voluntarios (
    nome,
    email,
    telefone,
    morada,
    data_nascimento,
    data_entrada,
    ativo,
    perfil,
    observacoes
) VALUES (
    'Administrador Sistema',
    'admin@sistema.com',
    '912345678',
    'Sede da Associação',
    '1985-01-01',
    CURRENT_DATE,
    true,
    'administrador',
    'Conta de administrador para gestão do sistema'
);

-- ============================================================================
-- FASE 4: VERIFICAÇÕES FINAIS
-- ============================================================================

-- Verificar contagem de registros
SELECT 
    'animais' as tabela, 
    COUNT(*) as registros 
FROM public.animais
UNION ALL
SELECT 
    'voluntarios' as tabela, 
    COUNT(*) as registros 
FROM public.voluntarios
UNION ALL
SELECT 
    'intervencoes' as tabela, 
    COUNT(*) as registros 
FROM public.intervencoes
UNION ALL
SELECT 
    'movimentos_financeiros' as tabela, 
    COUNT(*) as registros 
FROM public.movimentos_financeiros
UNION ALL
SELECT 
    'responsabilidades_voluntarios' as tabela, 
    COUNT(*) as registros 
FROM public.responsabilidades_voluntarios;

-- Testar geração do próximo número de processo
SELECT 'Próximo número de processo será: ' || public.generate_numero_processo() as teste_numeracao;

-- Resetar a sequence para o próximo uso real (P25001)
ALTER SEQUENCE public.numero_processo_seq RESTART WITH 25001;

-- Resumo final
SELECT 
    '🔄 RESET EXECUTADO COM SUCESSO!' as status,
    '✅ Dados limpos, primeiro animal será P25001' as resultado;