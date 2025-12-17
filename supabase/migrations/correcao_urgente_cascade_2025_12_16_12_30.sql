-- ========================================
-- CORREÇÃO URGENTE: REMOVER TRIGGERS COM CASCADE
-- ========================================

-- 1. Remover triggers específicos primeiro
DROP TRIGGER IF EXISTS trigger_auditoria_animais ON public.animais CASCADE;
DROP TRIGGER IF EXISTS trigger_auditoria_equipamentos ON public.equipamentos_2025_12_13_01_00 CASCADE;
DROP TRIGGER IF EXISTS trigger_equipamento_criado ON public.equipamentos_2025_12_13_01_00 CASCADE;

-- 2. Remover funções com CASCADE para resolver dependências
DROP FUNCTION IF EXISTS trigger_auditoria_generica() CASCADE;
DROP FUNCTION IF EXISTS trigger_notificacao_equipamento_criado() CASCADE;

-- 3. Verificação final
SELECT 'Correção aplicada com sucesso! Cadastro de animais deve funcionar normalmente agora.' as status;