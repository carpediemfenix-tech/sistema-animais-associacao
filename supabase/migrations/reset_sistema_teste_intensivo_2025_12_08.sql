-- RESET COMPLETO DO SISTEMA PARA TESTE INTENSIVO
-- Data: 2025-12-08 06:00 UTC
-- Objetivo: Limpar todos os dados mantendo estrutura e configurações

-- ============================================================================
-- FASE 1: BACKUP DAS CONFIGURAÇÕES IMPORTANTES
-- ============================================================================

-- Criar tabelas temporárias para backup das configurações
CREATE TEMP TABLE backup_especies AS SELECT * FROM public.especies;
CREATE TEMP TABLE backup_sexos AS SELECT * FROM public.sexos;
CREATE TEMP TABLE backup_grupos AS SELECT * FROM public.grupos;
CREATE TEMP TABLE backup_localizacoes AS SELECT * FROM public.localizacoes;
CREATE TEMP TABLE backup_categorias_financeiras AS SELECT * FROM public.categorias_financeiras;

-- ============================================================================
-- FASE 2: LIMPEZA COMPLETA DOS DADOS (ORDEM CORRETA PARA FOREIGN KEYS)
-- ============================================================================

-- Desativar verificações de foreign key temporariamente
SET session_replication_role = replica;

-- Limpar dados de formação e participações
TRUNCATE TABLE public.participacoes_formacao CASCADE;
TRUNCATE TABLE public.acoes_formacao CASCADE;
TRUNCATE TABLE public.tipos_formacao CASCADE;

-- Limpar dados de responsabilidades
TRUNCATE TABLE public.responsabilidades_voluntarios CASCADE;

-- Limpar dados financeiros
TRUNCATE TABLE public.movimentos_financeiros CASCADE;

-- Limpar dados de intervenções
TRUNCATE TABLE public.intervencoes CASCADE;

-- Limpar dados de lembretes
TRUNCATE TABLE public.lembretes CASCADE;

-- Limpar dados principais
TRUNCATE TABLE public.animais CASCADE;
TRUNCATE TABLE public.voluntarios CASCADE;

-- Reativar verificações de foreign key
SET session_replication_role = DEFAULT;

-- ============================================================================
-- FASE 3: RESET DAS SEQUENCES (NUMERAÇÃO)
-- ============================================================================

-- Reset da sequence do número de processo para começar em P25001
DROP SEQUENCE IF EXISTS public.numero_processo_seq CASCADE;
CREATE SEQUENCE public.numero_processo_seq START WITH 25001;

-- Reset de outras sequences importantes se existirem
DO $$
BEGIN
    -- Reset sequences de IDs
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'animais_id_seq') THEN
        ALTER SEQUENCE public.animais_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'voluntarios_id_seq') THEN
        ALTER SEQUENCE public.voluntarios_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'intervencoes_id_seq') THEN
        ALTER SEQUENCE public.intervencoes_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'movimentos_financeiros_id_seq') THEN
        ALTER SEQUENCE public.movimentos_financeiros_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'lembretes_id_seq') THEN
        ALTER SEQUENCE public.lembretes_id_seq RESTART WITH 1;
    END IF;
END $$;

-- ============================================================================
-- FASE 4: RESTAURAR CONFIGURAÇÕES ESSENCIAIS
-- ============================================================================

-- Restaurar espécies
INSERT INTO public.especies (nome, icone) 
SELECT nome, icone FROM backup_especies;

-- Restaurar sexos
INSERT INTO public.sexos (nome) 
SELECT nome FROM backup_sexos;

-- Restaurar grupos
INSERT INTO public.grupos (nome, tipo, descricao) 
SELECT nome, tipo, descricao FROM backup_grupos;

-- Restaurar localizações
INSERT INTO public.localizacoes (nome, tipo, capacidade, descricao) 
SELECT nome, tipo, capacidade, descricao FROM backup_localizacoes;

-- Restaurar categorias financeiras
INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor) 
SELECT nome, tipo, descricao, cor FROM backup_categorias_financeiras;

-- ============================================================================
-- FASE 5: CONFIGURAR FUNÇÃO PARA NÚMERO DE PROCESSO AUTOMÁTICO
-- ============================================================================

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
-- FASE 6: INSERIR DADOS DE TESTE MÍNIMOS
-- ============================================================================

-- Inserir tipos de formação básicos
INSERT INTO public.tipos_formacao (nome, descricao, nivel_ordem, carga_horaria_minima, competencias, pre_requisitos, cor, icone, ativo) VALUES
('FORMA BASE', 'Formação básica obrigatória para todos os voluntários', 1, 8, '["Conhecimentos básicos", "Primeiros socorros", "Manuseamento de animais"]', '[]', '#3B82F6', '📚', true),
('FORMA N1', 'Formação de nível 1 - Cuidados básicos', 2, 16, '["Cuidados veterinários básicos", "Alimentação", "Higiene"]', '["FORMA BASE"]', '#10B981', '🏥', true),
('FORMA N2', 'Formação de nível 2 - Especialização', 3, 24, '["Comportamento animal", "Treino básico", "Reabilitação"]', '["FORMA N1"]', '#F59E0B', '🎓', true);

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
-- FASE 7: VERIFICAÇÕES FINAIS E RELATÓRIO
-- ============================================================================

-- Verificar se as tabelas principais estão vazias (exceto admin)
SELECT 
    'DADOS PRINCIPAIS LIMPOS:' as categoria,
    '' as tabela,
    '' as registros
UNION ALL
SELECT 
    '',
    'animais' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.animais
UNION ALL
SELECT 
    '',
    'voluntarios' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.voluntarios
UNION ALL
SELECT 
    '',
    'intervencoes' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.intervencoes
UNION ALL
SELECT 
    '',
    'movimentos_financeiros' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.movimentos_financeiros
UNION ALL
SELECT 
    '',
    'responsabilidades_voluntarios' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.responsabilidades_voluntarios
UNION ALL
SELECT 
    'CONFIGURAÇÕES MANTIDAS:' as categoria,
    '' as tabela,
    '' as registros
UNION ALL
SELECT 
    '',
    'especies' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.especies
UNION ALL
SELECT 
    '',
    'sexos' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.sexos
UNION ALL
SELECT 
    '',
    'grupos' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.grupos
UNION ALL
SELECT 
    '',
    'localizacoes' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.localizacoes
UNION ALL
SELECT 
    '',
    'categorias_financeiras' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.categorias_financeiras
UNION ALL
SELECT 
    '',
    'tipos_formacao' as tabela, 
    COUNT(*)::TEXT as registros 
FROM public.tipos_formacao;

-- Testar geração do próximo número de processo
SELECT 'TESTE NUMERAÇÃO:' as info, 'Próximo número será: ' || public.generate_numero_processo() as resultado;

-- Resetar a sequence para o próximo uso real (P25001)
ALTER SEQUENCE public.numero_processo_seq RESTART WITH 25001;

-- Resumo final
SELECT 
    '🔄 RESET COMPLETO EXECUTADO!' as status,
    '✅ Sistema limpo e pronto para teste intensivo' as resultado,
    '📝 Primeiro animal será P25001' as numeracao;