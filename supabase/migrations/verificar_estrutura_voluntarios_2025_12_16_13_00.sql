-- ========================================
-- SISTEMA DE NOMES PARA VOLUNTÁRIOS
-- ========================================

-- Primeiro, vamos verificar a estrutura atual da tabela voluntarios
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'voluntarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;