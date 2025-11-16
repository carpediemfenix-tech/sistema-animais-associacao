-- RESET COMPLETO DO SISTEMA VALENTÃO AO RESGATE
-- Eliminar todas as tabelas existentes e recriar com estrutura correta

-- 1. Eliminar tabelas existentes (ordem inversa devido às dependências)
DROP TABLE IF EXISTS public.configuracoes_alertas_2025_11_16_18_00 CASCADE;
DROP TABLE IF EXISTS public.movimentos_financeiros_2025_11_16_18_00 CASCADE;
DROP TABLE IF EXISTS public.historico_localizacoes_2025_11_16_18_00 CASCADE;
DROP TABLE IF EXISTS public.eventos_2025_11_13_03_23 CASCADE;
DROP TABLE IF EXISTS public.intervencoes_2025_11_13_03_23 CASCADE;
DROP TABLE IF EXISTS public.voluntarios_2025_11_16_18_00 CASCADE;
DROP TABLE IF EXISTS public.tipos_intervencoes_2025_11_13_03_23 CASCADE;
DROP TABLE IF EXISTS public.animais_2025_11_13_03_23 CASCADE;

-- 2. Criar tabela de tipos de intervenções
CREATE TABLE public.tipos_intervencoes_2025_11_13_03_23 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de voluntários
CREATE TABLE public.voluntarios_2025_11_16_18_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE,
    telefone TEXT,
    especialidade TEXT NOT NULL CHECK (especialidade IN ('Veterinário', 'Cuidador', 'Transporte', 'Administrativo', 'Geral')),
    ativo BOOLEAN DEFAULT TRUE,
    data_inicio DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de animais (com TODAS as colunas necessárias)
CREATE TABLE public.animais_2025_11_13_03_23 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_processo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    especie TEXT NOT NULL CHECK (especie IN ('Cão', 'Gato', 'Outro')),
    raca TEXT,
    sexo TEXT NOT NULL CHECK (sexo IN ('Macho', 'Fêmea')),
    idade_estimada INTEGER,
    peso DECIMAL(5,2),
    cor TEXT,
    caracteristicas_fisicas TEXT,
    transponder TEXT,
    data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
    local_encontrado TEXT,
    estado TEXT NOT NULL DEFAULT 'Ativo' CHECK (estado IN ('Ativo', 'Adotado', 'Óbito', 'Não Adotável')),
    observacoes TEXT,
    arquivado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de intervenções
CREATE TABLE public.intervencoes_2025_11_13_03_23 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais_2025_11_13_03_23(id) ON DELETE CASCADE,
    tipo_intervencao_id UUID NOT NULL REFERENCES public.tipos_intervencoes_2025_11_13_03_23(id),
    voluntario_id UUID REFERENCES public.voluntarios_2025_11_16_18_00(id),
    data_intervencao DATE NOT NULL,
    veterinario TEXT,
    clinica TEXT,
    observacoes TEXT,
    custo DECIMAL(10,2),
    proxima_data DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela de eventos
CREATE TABLE public.eventos_2025_11_13_03_23 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais_2025_11_13_03_23(id) ON DELETE CASCADE,
    tipo_evento TEXT NOT NULL,
    data_evento DATE NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Criar tabela de histórico de localizações
CREATE TABLE public.historico_localizacoes_2025_11_16_18_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais_2025_11_13_03_23(id) ON DELETE CASCADE,
    localizacao TEXT NOT NULL CHECK (localizacao IN ('Canil', 'CRO', 'FAT', 'Rua', 'Outro')),
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_saida TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Criar tabela de movimentos financeiros
CREATE TABLE public.movimentos_financeiros_2025_11_16_18_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID REFERENCES public.animais_2025_11_13_03_23(id) ON DELETE CASCADE,
    tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('Receita', 'Despesa')),
    categoria TEXT NOT NULL CHECK (categoria IN ('Veterinário', 'Medicação', 'Alimentação', 'Transporte', 'Doação', 'Adoção', 'Outros')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_movimento DATE DEFAULT CURRENT_DATE,
    voluntario_id UUID REFERENCES public.voluntarios_2025_11_16_18_00(id),
    intervencao_id UUID REFERENCES public.intervencoes_2025_11_13_03_23(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Criar tabela de configurações de alertas
CREATE TABLE public.configuracoes_alertas_2025_11_16_18_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_alerta TEXT NOT NULL,
    dias_aviso INTEGER NOT NULL DEFAULT 30,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Inserir tipos de intervenções padrão
INSERT INTO public.tipos_intervencoes_2025_11_13_03_23 (nome, descricao) VALUES
('Vacinação', 'Administração de vacinas'),
('Desparasitação', 'Tratamento contra parasitas'),
('Consulta Veterinária', 'Consulta médica geral'),
('Cirurgia', 'Procedimento cirúrgico'),
('Esterilização', 'Cirurgia de esterilização'),
('Tratamento Médico', 'Tratamento de doenças'),
('Exame Laboratorial', 'Análises e exames'),
('Emergência', 'Atendimento de emergência'),
('Check-up', 'Exame de rotina'),
('Medicação', 'Administração de medicamentos');

-- 11. Inserir voluntários de exemplo
INSERT INTO public.voluntarios_2025_11_16_18_00 (nome, email, telefone, especialidade, observacoes) VALUES
('Dr. João Silva', 'joao.silva@email.com', '912345678', 'Veterinário', 'Veterinário principal da associação'),
('Maria Santos', 'maria.santos@email.com', '923456789', 'Cuidador', 'Especialista em cuidados diários'),
('Pedro Costa', 'pedro.costa@email.com', '934567890', 'Transporte', 'Responsável pelo transporte de animais'),
('Ana Ferreira', 'ana.ferreira@email.com', '945678901', 'Administrativo', 'Gestão administrativa'),
('Carlos Oliveira', 'carlos.oliveira@email.com', '956789012', 'Geral', 'Voluntário geral');

-- 12. Inserir configurações de alertas padrão
INSERT INTO public.configuracoes_alertas_2025_11_16_18_00 (tipo_alerta, dias_aviso) VALUES
('vacina_atraso', 30),
('consulta_pendente', 15),
('sem_adocao', 90),
('medicacao_continua', 7);

-- 13. Criar políticas RLS (Row Level Security)
ALTER TABLE public.animais_2025_11_13_03_23 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervencoes_2025_11_13_03_23 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_2025_11_13_03_23 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voluntarios_2025_11_16_18_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_financeiros_2025_11_16_18_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_localizacoes_2025_11_16_18_00 ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público (ajustar conforme necessário)
CREATE POLICY "Allow all operations" ON public.animais_2025_11_13_03_23 FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.intervencoes_2025_11_13_03_23 FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.eventos_2025_11_13_03_23 FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.voluntarios_2025_11_16_18_00 FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.movimentos_financeiros_2025_11_16_18_00 FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.historico_localizacoes_2025_11_16_18_00 FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.tipos_intervencoes_2025_11_13_03_23 FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.configuracoes_alertas_2025_11_16_18_00 FOR ALL USING (true);

-- 14. Criar índices para melhor performance
CREATE INDEX idx_animais_estado ON public.animais_2025_11_13_03_23(estado);
CREATE INDEX idx_animais_arquivado ON public.animais_2025_11_13_03_23(arquivado);
CREATE INDEX idx_animais_especie ON public.animais_2025_11_13_03_23(especie);
CREATE INDEX idx_intervencoes_animal ON public.intervencoes_2025_11_13_03_23(animal_id);
CREATE INDEX idx_intervencoes_data ON public.intervencoes_2025_11_13_03_23(data_intervencao);
CREATE INDEX idx_eventos_animal ON public.eventos_2025_11_13_03_23(animal_id);
CREATE INDEX idx_movimentos_tipo ON public.movimentos_financeiros_2025_11_16_18_00(tipo_movimento);
CREATE INDEX idx_movimentos_data ON public.movimentos_financeiros_2025_11_16_18_00(data_movimento);