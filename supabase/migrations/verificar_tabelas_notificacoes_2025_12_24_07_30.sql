-- Verificar se existem tabelas relacionadas a notificações
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%notif%'
ORDER BY table_name;