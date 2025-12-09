-- Verificar se a tabela já existe e removê-la se necessário
DROP TABLE IF EXISTS public.clinicas_veterinarias CASCADE;

-- Criar tabela de clínicas veterinárias integrada com o sistema existente
CREATE TABLE public.clinicas_veterinarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    contacto_responsavel VARCHAR(255),
    especialidades TEXT[],
    tem_protocolo BOOLEAN DEFAULT false,
    desconto_protocolo DECIMAL(5,2) DEFAULT 0,
    horario_funcionamento JSONB,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_clinicas_veterinarias_nome ON public.clinicas_veterinarias(nome);
CREATE INDEX idx_clinicas_veterinarias_ativo ON public.clinicas_veterinarias(ativo);
CREATE INDEX idx_clinicas_veterinarias_protocolo ON public.clinicas_veterinarias(tem_protocolo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinicas_veterinarias_updated_at 
    BEFORE UPDATE ON public.clinicas_veterinarias 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS
ALTER TABLE public.clinicas_veterinarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados" ON public.clinicas_veterinarias
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON public.clinicas_veterinarias
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON public.clinicas_veterinarias
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON public.clinicas_veterinarias
    FOR DELETE USING (auth.role() = 'authenticated');