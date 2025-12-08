-- RESET COMPLETO DO SISTEMA PARA TESTE INTENSIVO (VERSÃO CORRIGIDA)
-- Data: 2025-12-08 06:00 UTC
-- Objetivo: Limpar todos os dados mantendo estrutura e configurações

-- ============================================================================
-- FASE 1: VERIFICAR E BACKUP DAS CONFIGURAÇÕES IMPORTANTES
-- ============================================================================

-- Verificar quais tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Criar tabelas temporárias para backup das configurações (se existirem)
DO $$
BEGIN
    -- Backup espécies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'especies') THEN
        CREATE TEMP TABLE backup_especies AS SELECT * FROM public.especies;
    END IF;
    
    -- Backup sexos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sexos') THEN
        CREATE TEMP TABLE backup_sexos AS SELECT * FROM public.sexos;
    END IF;
    
    -- Backup grupos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'grupos') THEN
        CREATE TEMP TABLE backup_grupos AS SELECT * FROM public.grupos;
    END IF;
    
    -- Backup localizações
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'localizacoes') THEN
        CREATE TEMP TABLE backup_localizacoes AS SELECT * FROM public.localizacoes;
    END IF;
    
    -- Backup categorias financeiras
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categorias_financeiras') THEN
        CREATE TEMP TABLE backup_categorias_financeiras AS SELECT * FROM public.categorias_financeiras;
    END IF;
END $$;

-- ============================================================================
-- FASE 2: LIMPEZA COMPLETA DOS DADOS (APENAS TABELAS EXISTENTES)
-- ============================================================================

-- Desativar verificações de foreign key temporariamente
SET session_replication_role = replica;

-- Limpar dados de formação e participações (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'participacoes_formacao') THEN
        DELETE FROM public.participacoes_formacao;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'acoes_formacao') THEN
        DELETE FROM public.acoes_formacao;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipos_formacao') THEN
        DELETE FROM public.tipos_formacao;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voluntario_conquistas') THEN
        DELETE FROM public.voluntario_conquistas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conquistas') THEN
        DELETE FROM public.conquistas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voluntario_progressao') THEN
        DELETE FROM public.voluntario_progressao;
    END IF;
END $$;

-- Limpar dados de responsabilidades (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'responsabilidades_voluntarios') THEN
        DELETE FROM public.responsabilidades_voluntarios;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'responsabilidades') THEN
        DELETE FROM public.responsabilidades;
    END IF;
END $$;

-- Limpar dados financeiros (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movimentos_financeiros') THEN
        DELETE FROM public.movimentos_financeiros;
    END IF;
END $$;

-- Limpar dados de intervenções (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intervencoes') THEN
        DELETE FROM public.intervencoes;
    END IF;
END $$;

-- Limpar dados principais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animais') THEN
        DELETE FROM public.animais;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voluntarios') THEN
        DELETE FROM public.voluntarios;
    END IF;
END $$;

-- Reativar verificações de foreign key
SET session_replication_role = DEFAULT;

-- ============================================================================
-- FASE 3: RESET DAS SEQUENCES (NUMERAÇÃO)
-- ============================================================================

-- Reset da sequence do número de processo para começar em P25001
DROP SEQUENCE IF EXISTS public.numero_processo_seq CASCADE;
CREATE SEQUENCE public.numero_processo_seq START WITH 25001;

-- ============================================================================
-- FASE 4: RESTAURAR CONFIGURAÇÕES ESSENCIAIS
-- ============================================================================

-- Restaurar configurações (se as tabelas de backup existirem)
DO $$
BEGIN
    -- Restaurar espécies
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'backup_especies') THEN
        INSERT INTO public.especies (nome, icone) 
        SELECT nome, icone FROM backup_especies;
    END IF;
    
    -- Restaurar sexos
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'backup_sexos') THEN
        INSERT INTO public.sexos (nome) 
        SELECT nome FROM backup_sexos;
    END IF;
    
    -- Restaurar grupos
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'backup_grupos') THEN
        INSERT INTO public.grupos (nome, tipo, descricao) 
        SELECT nome, tipo, descricao FROM backup_grupos;
    END IF;
    
    -- Restaurar localizações
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'backup_localizacoes') THEN
        INSERT INTO public.localizacoes (nome, tipo, capacidade, descricao) 
        SELECT nome, tipo, capacidade, descricao FROM backup_localizacoes;
    END IF;
    
    -- Restaurar categorias financeiras
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'backup_categorias_financeiras') THEN
        INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor) 
        SELECT nome, tipo, descricao, cor FROM backup_categorias_financeiras;
    END IF;
END $$;

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

-- Criar trigger para auto-gerar número de processo (se tabela animais existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animais') THEN
        EXECUTE 'CREATE TRIGGER trigger_generate_numero_processo
            BEFORE INSERT ON public.animais
            FOR EACH ROW
            EXECUTE FUNCTION public.set_numero_processo()';
    END IF;
END $$;

-- ============================================================================
-- FASE 6: INSERIR DADOS DE TESTE MÍNIMOS
-- ============================================================================

-- Inserir tipos de formação básicos (se tabela existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipos_formacao') THEN
        INSERT INTO public.tipos_formacao (nome, descricao, nivel_ordem, carga_horaria_minima, competencias, pre_requisitos, cor, icone, ativo) VALUES
        ('FORMA BASE', 'Formação básica obrigatória para todos os voluntários', 1, 8, '["Conhecimentos básicos", "Primeiros socorros", "Manuseamento de animais"]', '[]', '#3B82F6', '📚', true),
        ('FORMA N1', 'Formação de nível 1 - Cuidados básicos', 2, 16, '["Cuidados veterinários básicos", "Alimentação", "Higiene"]', '["FORMA BASE"]', '#10B981', '🏥', true),
        ('FORMA N2', 'Formação de nível 2 - Especialização', 3, 24, '["Comportamento animal", "Treino básico", "Reabilitação"]', '["FORMA N1"]', '#F59E0B', '🎓', true);
    END IF;
END $$;

-- Inserir um voluntário administrador de teste (se tabela existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voluntarios') THEN
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
    END IF;
END $$;

-- ============================================================================
-- FASE 7: VERIFICAÇÕES FINAIS E RELATÓRIO
-- ============================================================================

-- Testar geração do próximo número de processo
SELECT 'TESTE NUMERAÇÃO:' as info, 'Próximo número será: ' || public.generate_numero_processo() as resultado;

-- Resetar a sequence para o próximo uso real (P25001)
ALTER SEQUENCE public.numero_processo_seq RESTART WITH 25001;

-- Resumo final
SELECT 
    '🔄 RESET COMPLETO EXECUTADO!' as status,
    '✅ Sistema limpo e pronto para teste intensivo' as resultado,
    '📝 Primeiro animal será P25001' as numeracao;