-- Verificar e corrigir estrutura da tabela users
-- Adicionar colunas que podem estar em falta
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verificar se a coluna password_hash existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' 
                   AND column_name = 'password_hash' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD COLUMN password_hash TEXT;
    END IF;
END $$;

-- Atualizar trigger para updated_at se existir
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar dados da tabela
SELECT id, username, email, nome_completo, perfil_acesso, ativo, 
       CASE WHEN password_hash IS NULL THEN 'SEM HASH' ELSE 'COM HASH' END as password_status
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;