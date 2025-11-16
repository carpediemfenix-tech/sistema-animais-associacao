-- Criar tabela de voluntários
CREATE TABLE public.voluntarios_2025_11_16_18_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE,
    telefone TEXT,
    especialidade TEXT CHECK (especialidade IN ('Veterinário', 'Cuidador', 'Transporte', 'Administrativo', 'Geral')),
    ativo BOOLEAN DEFAULT TRUE,
    data_inicio DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_voluntarios_nome ON public.voluntarios_2025_11_16_18_00(nome);
CREATE INDEX idx_voluntarios_ativo ON public.voluntarios_2025_11_16_18_00(ativo);

-- Habilitar RLS
ALTER TABLE public.voluntarios_2025_11_16_18_00 ENABLE ROW LEVEL SECURITY;

-- Criar política RLS
CREATE POLICY "Permitir acesso público aos voluntários" ON public.voluntarios_2025_11_16_18_00
FOR ALL USING (true);

-- Inserir alguns voluntários exemplo
INSERT INTO public.voluntarios_2025_11_16_18_00 (nome, email, especialidade, observacoes) VALUES
('Dr. João Silva', 'joao.silva@email.com', 'Veterinário', 'Veterinário principal da associação'),
('Maria Santos', 'maria.santos@email.com', 'Cuidador', 'Especialista em cuidados diários'),
('Pedro Costa', 'pedro.costa@email.com', 'Transporte', 'Responsável por transportes de emergência'),
('Ana Ferreira', 'ana.ferreira@email.com', 'Administrativo', 'Gestão administrativa e documentação');