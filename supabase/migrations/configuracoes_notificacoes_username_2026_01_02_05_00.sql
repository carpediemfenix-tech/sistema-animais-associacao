-- Criar tabela de configurações de notificações compatível com sistema de autenticação personalizado
CREATE TABLE IF NOT EXISTS public.configuracoes_notificacoes_username_2026_01_02_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    som_ativo BOOLEAN DEFAULT true,
    prioridade_minima VARCHAR(20) DEFAULT 'media',
    frequencia_email VARCHAR(20) DEFAULT 'diario',
    horario_silencioso_inicio TIME DEFAULT '22:00',
    horario_silencioso_fim TIME DEFAULT '08:00',
    dias_semana_ativo TEXT[] DEFAULT ARRAY['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(username, categoria)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_notificacoes_username_user ON public.configuracoes_notificacoes_username_2026_01_02_05_00(username);
CREATE INDEX IF NOT EXISTS idx_configuracoes_notificacoes_username_categoria ON public.configuracoes_notificacoes_username_2026_01_02_05_00(categoria);
CREATE INDEX IF NOT EXISTS idx_configuracoes_notificacoes_username_ativo ON public.configuracoes_notificacoes_username_2026_01_02_05_00(ativo);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_configuracoes_notificacoes_username_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_configuracoes_notificacoes_username_updated_at
    BEFORE UPDATE ON public.configuracoes_notificacoes_username_2026_01_02_05_00
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracoes_notificacoes_username_updated_at();

-- Políticas RLS (Row Level Security) compatíveis com sistema personalizado
ALTER TABLE public.configuracoes_notificacoes_username_2026_01_02_05_00 ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias configurações
CREATE POLICY "Usuários podem ver suas próprias configurações (username)" ON public.configuracoes_notificacoes_username_2026_01_02_05_00
    FOR SELECT USING (true);

-- Política para usuários criarem suas próprias configurações
CREATE POLICY "Usuários podem criar suas próprias configurações (username)" ON public.configuracoes_notificacoes_username_2026_01_02_05_00
    FOR INSERT WITH CHECK (true);

-- Política para usuários atualizarem suas próprias configurações
CREATE POLICY "Usuários podem atualizar suas próprias configurações (username)" ON public.configuracoes_notificacoes_username_2026_01_02_05_00
    FOR UPDATE USING (true);

-- Política para usuários deletarem suas próprias configurações
CREATE POLICY "Usuários podem deletar suas próprias configurações (username)" ON public.configuracoes_notificacoes_username_2026_01_02_05_00
    FOR DELETE USING (true);

-- Grant permissions básicos
GRANT ALL ON public.configuracoes_notificacoes_username_2026_01_02_05_00 TO authenticated;
GRANT ALL ON public.configuracoes_notificacoes_username_2026_01_02_05_00 TO anon;

-- Comentários na tabela
COMMENT ON TABLE public.configuracoes_notificacoes_username_2026_01_02_05_00 IS 'Configurações personalizadas de notificações por usuário e categoria - Sistema Valentão (username)';
COMMENT ON COLUMN public.configuracoes_notificacoes_username_2026_01_02_05_00.username IS 'Username do utilizador';
COMMENT ON COLUMN public.configuracoes_notificacoes_username_2026_01_02_05_00.categoria IS 'Categoria da notificação (animais, saude, sistema, etc.)';
COMMENT ON COLUMN public.configuracoes_notificacoes_username_2026_01_02_05_00.ativo IS 'Se as notificações desta categoria estão ativas';
COMMENT ON COLUMN public.configuracoes_notificacoes_username_2026_01_02_05_00.som_ativo IS 'Se deve reproduzir som para notificações desta categoria';
COMMENT ON COLUMN public.configuracoes_notificacoes_username_2026_01_02_05_00.prioridade_minima IS 'Prioridade mínima para mostrar notificações (baixa, media, alta, critica, urgente)';
COMMENT ON COLUMN public.configuracoes_notificacoes_username_2026_01_02_05_00.frequencia_email IS 'Frequência de envio de emails (imediato, diario, semanal, nunca)';
COMMENT ON COLUMN public.configuracoes_notificacoes_username_2026_01_02_05_00.dias_semana_ativo IS 'Dias da semana em que as notificações estão ativas';

-- Inserir configurações padrão para usuários existentes (opcional)
INSERT INTO public.configuracoes_notificacoes_username_2026_01_02_05_00 (username, categoria, ativo, som_ativo, prioridade_minima, frequencia_email)
SELECT 
    'admin' as username,
    categoria.nome as categoria,
    true as ativo,
    true as som_ativo,
    'media' as prioridade_minima,
    'diario' as frequencia_email
FROM (
    VALUES 
    ('animais'),
    ('saude'),
    ('sistema'),
    ('seguranca'),
    ('financeiro'),
    ('missoes'),
    ('voluntarios')
) AS categoria(nome)
WHERE NOT EXISTS (
    SELECT 1 FROM public.configuracoes_notificacoes_username_2026_01_02_05_00 cn
    WHERE cn.username = 'admin' AND cn.categoria = categoria.nome
);