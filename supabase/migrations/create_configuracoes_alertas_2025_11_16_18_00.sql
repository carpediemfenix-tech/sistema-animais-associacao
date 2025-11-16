-- Criar tabela para configurações de alertas
CREATE TABLE public.configuracoes_alertas_2025_11_16_18_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_alerta TEXT NOT NULL CHECK (tipo_alerta IN ('vacina_atraso', 'consulta_pendente', 'sem_adocao', 'medicacao_continua')),
    dias_limite INTEGER NOT NULL DEFAULT 30,
    ativo BOOLEAN DEFAULT TRUE,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO public.configuracoes_alertas_2025_11_16_18_00 (tipo_alerta, dias_limite, descricao) VALUES
('vacina_atraso', 365, 'Alertar quando vacinas estão em atraso há mais de 1 ano'),
('consulta_pendente', 7, 'Alertar consultas veterinárias pendentes nos próximos 7 dias'),
('sem_adocao', 180, 'Alertar animais disponíveis há mais de 6 meses sem adoção'),
('medicacao_continua', 3, 'Alertar medicação contínua que vence nos próximos 3 dias');

-- Habilitar RLS
ALTER TABLE public.configuracoes_alertas_2025_11_16_18_00 ENABLE ROW LEVEL SECURITY;

-- Criar política RLS
CREATE POLICY "Permitir acesso público às configurações de alertas" ON public.configuracoes_alertas_2025_11_16_18_00
FOR ALL USING (true);