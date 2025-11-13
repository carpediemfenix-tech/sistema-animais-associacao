-- Tabela principal de animais
CREATE TABLE public.animais_2025_11_13_03_23 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(100),
    sexo VARCHAR(10) CHECK (sexo IN ('Macho', 'Fêmea')),
    data_nascimento DATE,
    idade_estimada VARCHAR(20),
    peso DECIMAL(5,2),
    cor VARCHAR(100),
    caracteristicas_fisicas TEXT,
    transponder VARCHAR(50) UNIQUE,
    numero_registo VARCHAR(50) UNIQUE,
    estado VARCHAR(20) DEFAULT 'Ativo' CHECK (estado IN ('Ativo', 'Adotado', 'Óbito', 'Transferido')),
    data_entrada DATE DEFAULT CURRENT_DATE,
    origem VARCHAR(200),
    observacoes TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tipos de intervenções
CREATE TABLE public.tipos_intervencoes_2025_11_13_03_23 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir tipos de intervenções comuns
INSERT INTO public.tipos_intervencoes_2025_11_13_03_23 (nome, categoria, descricao) VALUES
('Castração', 'Cirúrgica', 'Esterilização do animal'),
('Desparasitação Interna', 'Médica', 'Tratamento contra parasitas internos'),
('Desparasitação Externa', 'Médica', 'Tratamento contra pulgas, carraças, etc.'),
('Vacinação Antirrábica', 'Vacina', 'Vacina contra a raiva'),
('Vacinação Polivalente', 'Vacina', 'Vacina múltipla'),
('Consulta Veterinária', 'Consulta', 'Consulta médica geral'),
('Tratamento Feridas', 'Médica', 'Tratamento de ferimentos'),
('Exames Laboratoriais', 'Diagnóstico', 'Análises clínicas'),
('Cirurgia Geral', 'Cirúrgica', 'Procedimentos cirúrgicos diversos'),
('Identificação Eletrónica', 'Identificação', 'Colocação de microchip');

-- Tabela de histórico de intervenções
CREATE TABLE public.intervencoes_2025_11_13_03_23 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais_2025_11_13_03_23(id) ON DELETE CASCADE,
    tipo_intervencao_id UUID NOT NULL REFERENCES public.tipos_intervencoes_2025_11_13_03_23(id),
    data_intervencao DATE NOT NULL,
    veterinario VARCHAR(100),
    clinica VARCHAR(200),
    observacoes TEXT,
    custo DECIMAL(8,2),
    proxima_data DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos da vida do animal
CREATE TABLE public.eventos_2025_11_13_03_23 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais_2025_11_13_03_23(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(50) NOT NULL,
    data_evento DATE NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_animais_nome ON public.animais_2025_11_13_03_23(nome);
CREATE INDEX idx_animais_transponder ON public.animais_2025_11_13_03_23(transponder);
CREATE INDEX idx_animais_estado ON public.animais_2025_11_13_03_23(estado);
CREATE INDEX idx_intervencoes_animal ON public.intervencoes_2025_11_13_03_23(animal_id);
CREATE INDEX idx_intervencoes_data ON public.intervencoes_2025_11_13_03_23(data_intervencao);
CREATE INDEX idx_eventos_animal ON public.eventos_2025_11_13_03_23(animal_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_animais_updated_at BEFORE UPDATE ON public.animais_2025_11_13_03_23 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE public.animais_2025_11_13_03_23 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_intervencoes_2025_11_13_03_23 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervencoes_2025_11_13_03_23 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_2025_11_13_03_23 ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público (ajustar conforme necessário)
CREATE POLICY "Permitir acesso a animais" ON public.animais_2025_11_13_03_23 FOR ALL USING (true);
CREATE POLICY "Permitir acesso a tipos de intervenções" ON public.tipos_intervencoes_2025_11_13_03_23 FOR ALL USING (true);
CREATE POLICY "Permitir acesso a intervenções" ON public.intervencoes_2025_11_13_03_23 FOR ALL USING (true);
CREATE POLICY "Permitir acesso a eventos" ON public.eventos_2025_11_13_03_23 FOR ALL USING (true);