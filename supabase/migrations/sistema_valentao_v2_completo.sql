-- =====================================================
-- SISTEMA VALENTÃO AO RESGATE v2.0 - RECONSTRUÇÃO COMPLETA
-- Sistema profissional de gestão de animais
-- =====================================================

-- 1. ELIMINAR TODAS AS TABELAS EXISTENTES
DROP TABLE IF EXISTS public.configuracoes_alertas_2025_11_16_18_00 CASCADE;
DROP TABLE IF EXISTS public.movimentos_financeiros_2025_11_16_18_00 CASCADE;
DROP TABLE IF EXISTS public.historico_localizacoes_2025_11_16_18_00 CASCADE;
DROP TABLE IF EXISTS public.eventos_2025_11_13_03_23 CASCADE;
DROP TABLE IF EXISTS public.intervencoes_2025_11_13_03_23 CASCADE;
DROP TABLE IF EXISTS public.voluntarios_2025_11_16_18_00 CASCADE;
DROP TABLE IF EXISTS public.tipos_intervencoes_2025_11_13_03_23 CASCADE;
DROP TABLE IF EXISTS public.animais_2025_11_13_03_23 CASCADE;

-- 2. CRIAR TABELA DE VOLUNTÁRIOS (base para relacionamentos)
CREATE TABLE public.voluntarios (
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

-- 3. CRIAR TABELA DE TIPOS DE INTERVENÇÕES
CREATE TABLE public.tipos_intervencoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    cor TEXT DEFAULT '#3B82F6',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA DE ANIMAIS (estrutura otimizada)
CREATE TABLE public.animais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_processo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    especie TEXT NOT NULL CHECK (especie IN ('Cão', 'Gato', 'Outro')),
    raca TEXT,
    sexo TEXT NOT NULL CHECK (sexo IN ('Macho', 'Fêmea')),
    idade_estimada INTEGER, -- em meses
    peso DECIMAL(5,2),
    cor TEXT,
    caracteristicas_fisicas TEXT,
    transponder TEXT,
    data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
    local_encontrado TEXT,
    estado TEXT NOT NULL DEFAULT 'Ativo' CHECK (estado IN ('Ativo', 'Adotado', 'Óbito', 'Não Adotável')),
    data_adocao DATE,
    adotante_nome TEXT,
    adotante_contacto TEXT,
    observacoes TEXT,
    arquivado BOOLEAN DEFAULT FALSE,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR TABELA DE INTERVENÇÕES
CREATE TABLE public.intervencoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
    tipo_intervencao_id UUID NOT NULL REFERENCES public.tipos_intervencoes(id),
    voluntario_id UUID REFERENCES public.voluntarios(id),
    data_intervencao DATE NOT NULL,
    veterinario TEXT,
    clinica TEXT,
    observacoes TEXT,
    custo DECIMAL(10,2),
    proxima_data DATE,
    urgente BOOLEAN DEFAULT FALSE,
    concluida BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR TABELA DE EVENTOS
CREATE TABLE public.eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
    tipo_evento TEXT NOT NULL,
    data_evento DATE NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CRIAR TABELA DE MOVIMENTOS FINANCEIROS
CREATE TABLE public.movimentos_financeiros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID REFERENCES public.animais(id) ON DELETE CASCADE,
    intervencao_id UUID REFERENCES public.intervencoes(id) ON DELETE CASCADE,
    tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('Receita', 'Despesa')),
    categoria TEXT NOT NULL CHECK (categoria IN ('Veterinário', 'Medicação', 'Alimentação', 'Transporte', 'Doação', 'Adoção', 'Equipamento', 'Outros')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_movimento DATE DEFAULT CURRENT_DATE,
    voluntario_id UUID REFERENCES public.voluntarios(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CRIAR TABELA DE LOCALIZAÇÕES
CREATE TABLE public.localizacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
    localizacao TEXT NOT NULL CHECK (localizacao IN ('Canil', 'CRO', 'FAT', 'Rua', 'Casa Temporária', 'Outro')),
    endereco TEXT,
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_saida TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERIR DADOS DE TESTE REALISTAS
-- =====================================================

-- VOLUNTÁRIOS DE TESTE
INSERT INTO public.voluntarios (nome, email, telefone, especialidade, observacoes) VALUES
('Dr. Ana Silva', 'ana.silva@veterinaria.pt', '912345678', 'Veterinário', 'Veterinária principal, especialista em cirurgia'),
('Dr. João Santos', 'joao.santos@clinica.pt', '923456789', 'Veterinário', 'Veterinário de emergência, disponível fins de semana'),
('Maria Costa', 'maria.costa@email.pt', '934567890', 'Cuidador', 'Cuidadora experiente, especialista em gatos'),
('Pedro Oliveira', 'pedro.oliveira@email.pt', '945678901', 'Cuidador', 'Cuidador de cães de grande porte'),
('Sofia Ferreira', 'sofia.ferreira@email.pt', '956789012', 'Transporte', 'Responsável pelo transporte de animais'),
('Carlos Mendes', 'carlos.mendes@email.pt', '967890123', 'Administrativo', 'Gestão administrativa e financeira'),
('Luísa Rodrigues', 'luisa.rodrigues@email.pt', '978901234', 'Geral', 'Voluntária geral, apoio em eventos'),
('Miguel Pereira', 'miguel.pereira@email.pt', '989012345', 'Transporte', 'Transporte de emergência 24h'),
('Rita Almeida', 'rita.almeida@email.pt', '990123456', 'Cuidador', 'Especialista em animais feridos'),
('Tiago Lopes', 'tiago.lopes@email.pt', '901234567', 'Geral', 'Apoio em campanhas de adoção');

-- TIPOS DE INTERVENÇÕES
INSERT INTO public.tipos_intervencoes (nome, descricao, cor) VALUES
('Vacinação', 'Administração de vacinas obrigatórias e opcionais', '#10B981'),
('Desparasitação', 'Tratamento contra parasitas internos e externos', '#F59E0B'),
('Consulta Veterinária', 'Consulta médica geral e check-up', '#3B82F6'),
('Cirurgia', 'Procedimentos cirúrgicos diversos', '#EF4444'),
('Esterilização', 'Cirurgia de esterilização/castração', '#8B5CF6'),
('Tratamento Médico', 'Tratamento de doenças e lesões', '#F97316'),
('Exame Laboratorial', 'Análises clínicas e exames complementares', '#06B6D4'),
('Emergência', 'Atendimento de emergência médica', '#DC2626'),
('Medicação', 'Administração de medicamentos', '#84CC16'),
('Reabilitação', 'Fisioterapia e reabilitação', '#A855F7');

-- ANIMAIS DE TESTE (dados realistas)
INSERT INTO public.animais (numero_processo, nome, especie, raca, sexo, idade_estimada, peso, cor, caracteristicas_fisicas, transponder, local_encontrado, estado, observacoes) VALUES
('P25001', 'Rex', 'Cão', 'Pastor Alemão', 'Macho', 36, 28.5, 'Preto e castanho', 'Cicatriz na pata direita, muito dócil', '982000123456789', 'Rua da Liberdade, Lisboa', 'Ativo', 'Animal muito sociável, ideal para família'),
('P25002', 'Luna', 'Cão', 'Labrador', 'Fêmea', 24, 22.0, 'Dourado', 'Pelagem brilhante, olhos castanhos', '982000123456790', 'Parque da Cidade, Porto', 'Ativo', 'Muito energética, precisa de exercício diário'),
('P25003', 'Mimi', 'Gato', 'Persa', 'Fêmea', 18, 3.2, 'Branco', 'Pelo longo, olhos azuis', '982000123456791', 'Centro de Lisboa', 'Ativo', 'Gata muito calma, ideal para apartamento'),
('P25004', 'Max', 'Cão', 'Golden Retriever', 'Macho', 48, 32.0, 'Dourado claro', 'Muito amigável, adora crianças', '982000123456792', 'Praia de Carcavelos', 'Adotado', 'Adotado pela família Silva em 15/11/2025'),
('P25005', 'Bella', 'Cão', 'Border Collie', 'Fêmea', 30, 18.5, 'Preto e branco', 'Muito inteligente, obediente', '982000123456793', 'Campo de futebol, Braga', 'Ativo', 'Precisa de estimulação mental constante'),
('P25006', 'Simba', 'Gato', 'Siamês', 'Macho', 12, 2.8, 'Creme e castanho', 'Olhos azuis intensos, muito vocal', '982000123456794', 'Jardim Municipal, Coimbra', 'Ativo', 'Gato jovem, muito brincalhão'),
('P25007', 'Lola', 'Cão', 'Beagle', 'Fêmea', 60, 15.0, 'Tricolor', 'Idosa mas saudável, muito carinhosa', '982000123456795', 'Estrada Nacional, Aveiro', 'Não Adotável', 'Animal idoso, cuidados paliativos'),
('P25008', 'Thor', 'Cão', 'Rottweiler', 'Macho', 42, 45.0, 'Preto e castanho', 'Porte imponente, bem treinado', '982000123456796', 'Zona Industrial, Setúbal', 'Ativo', 'Precisa de dono experiente'),
('P25009', 'Nala', 'Gato', 'Comum Europeu', 'Fêmea', 8, 1.5, 'Malhado', 'Gatinha bebé, muito pequena', '982000123456797', 'Caixa de cartão, Faro', 'Ativo', 'Precisa de cuidados especiais, alimentação frequente'),
('P25010', 'Buddy', 'Cão', 'Vira-lata', 'Macho', 72, 20.0, 'Castanho', 'Cão idoso, muito gentil', '982000123456798', 'Lar de idosos, Viseu', 'Ativo', 'Ideal para pessoa idosa, muito calmo');

-- INTERVENÇÕES DE TESTE
INSERT INTO public.intervencoes (animal_id, tipo_intervencao_id, voluntario_id, data_intervencao, veterinario, clinica, observacoes, custo, proxima_data) 
SELECT 
    a.id,
    ti.id,
    v.id,
    CURRENT_DATE - (random() * 30)::int,
    v.nome,
    'Clínica Veterinária Central',
    'Intervenção realizada com sucesso',
    (random() * 100 + 20)::decimal(10,2),
    CASE WHEN ti.nome IN ('Vacinação', 'Desparasitação') THEN CURRENT_DATE + 365 ELSE NULL END
FROM public.animais a
CROSS JOIN public.tipos_intervencoes ti
CROSS JOIN public.voluntarios v
WHERE v.especialidade = 'Veterinário'
AND random() < 0.3 -- 30% chance de cada combinação
LIMIT 25;

-- EVENTOS DE TESTE
INSERT INTO public.eventos (animal_id, tipo_evento, data_evento, descricao, observacoes)
SELECT 
    id,
    CASE (random() * 4)::int
        WHEN 0 THEN 'Entrada'
        WHEN 1 THEN 'Adoção'
        WHEN 2 THEN 'Transferência'
        ELSE 'Visita Veterinária'
    END,
    data_entrada + (random() * 10)::int,
    'Evento registado automaticamente',
    'Observações do evento'
FROM public.animais
WHERE random() < 0.5;

-- MOVIMENTOS FINANCEIROS DE TESTE
INSERT INTO public.movimentos_financeiros (animal_id, tipo_movimento, categoria, descricao, valor, data_movimento, voluntario_id)
SELECT 
    a.id,
    CASE WHEN random() < 0.7 THEN 'Despesa' ELSE 'Receita' END,
    CASE (random() * 6)::int
        WHEN 0 THEN 'Veterinário'
        WHEN 1 THEN 'Medicação'
        WHEN 2 THEN 'Alimentação'
        WHEN 3 THEN 'Transporte'
        WHEN 4 THEN 'Doação'
        ELSE 'Outros'
    END,
    'Movimento financeiro de teste',
    (random() * 200 + 10)::decimal(10,2),
    CURRENT_DATE - (random() * 60)::int,
    v.id
FROM public.animais a
CROSS JOIN public.voluntarios v
WHERE random() < 0.2
LIMIT 30;

-- LOCALIZAÇÕES DE TESTE
INSERT INTO public.localizacoes (animal_id, localizacao, endereco, observacoes)
SELECT 
    id,
    CASE (random() * 4)::int
        WHEN 0 THEN 'Canil'
        WHEN 1 THEN 'CRO'
        WHEN 2 THEN 'Casa Temporária'
        ELSE 'FAT'
    END,
    'Morada de teste',
    'Localização atual do animal'
FROM public.animais
WHERE estado = 'Ativo';

-- =====================================================
-- CONFIGURAR POLÍTICAS RLS
-- =====================================================

-- Ativar RLS
ALTER TABLE public.animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_intervencoes ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Acesso total" ON public.animais FOR ALL USING (true);
CREATE POLICY "Acesso total" ON public.intervencoes FOR ALL USING (true);
CREATE POLICY "Acesso total" ON public.eventos FOR ALL USING (true);
CREATE POLICY "Acesso total" ON public.voluntarios FOR ALL USING (true);
CREATE POLICY "Acesso total" ON public.movimentos_financeiros FOR ALL USING (true);
CREATE POLICY "Acesso total" ON public.localizacoes FOR ALL USING (true);
CREATE POLICY "Acesso total" ON public.tipos_intervencoes FOR ALL USING (true);

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_animais_estado ON public.animais(estado);
CREATE INDEX idx_animais_arquivado ON public.animais(arquivado);
CREATE INDEX idx_animais_especie ON public.animais(especie);
CREATE INDEX idx_animais_numero_processo ON public.animais(numero_processo);
CREATE INDEX idx_intervencoes_animal ON public.intervencoes(animal_id);
CREATE INDEX idx_intervencoes_data ON public.intervencoes(data_intervencao);
CREATE INDEX idx_eventos_animal ON public.eventos(animal_id);
CREATE INDEX idx_movimentos_data ON public.movimentos_financeiros(data_movimento);
CREATE INDEX idx_movimentos_tipo ON public.movimentos_financeiros(tipo_movimento);
CREATE INDEX idx_localizacoes_animal ON public.localizacoes(animal_id);
CREATE INDEX idx_localizacoes_ativo ON public.localizacoes(ativo);

-- =====================================================
-- VIEWS PARA RELATÓRIOS
-- =====================================================

-- View para dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    COUNT(*) FILTER (WHERE NOT arquivado) as animais_ativos,
    COUNT(*) FILTER (WHERE estado = 'Adotado') as animais_adotados,
    COUNT(*) FILTER (WHERE estado = 'Ativo' AND NOT arquivado) as animais_disponiveis,
    COUNT(DISTINCT v.id) FILTER (WHERE v.ativo) as voluntarios_ativos,
    COALESCE(SUM(mf.valor) FILTER (WHERE mf.tipo_movimento = 'Receita'), 0) as total_receitas,
    COALESCE(SUM(mf.valor) FILTER (WHERE mf.tipo_movimento = 'Despesa'), 0) as total_despesas
FROM public.animais a
CROSS JOIN public.voluntarios v
LEFT JOIN public.movimentos_financeiros mf ON true;

-- =====================================================
-- SISTEMA PRONTO COM DADOS DE TESTE
-- =====================================================