-- =====================================================
-- MÓDULO CLÍNICAS - ESTRUTURA COMPLETA DA BASE DE DADOS
-- Data: 2025-12-09 04:30 UTC
-- =====================================================

-- 1. TABELA: clinicas_parceiras
-- Cadastro das clínicas veterinárias parceiras
CREATE TABLE IF NOT EXISTS public.clinicas_parceiras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL, -- Código interno da clínica
    morada TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    horario_funcionamento JSONB, -- {"seg_sex": "09:00-18:00", "sab": "09:00-13:00", "dom": "fechado"}
    especialidades TEXT[], -- Array de especialidades
    tipo_parceria VARCHAR(50) DEFAULT 'convenio', -- convenio, desconto, emergencia
    desconto_percentual DECIMAL(5,2) DEFAULT 0, -- Percentual de desconto
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    data_inicio_parceria DATE,
    data_fim_parceria DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA: veterinarios_contactos
-- Contactos dos veterinários das clínicas
CREATE TABLE IF NOT EXISTS public.veterinarios_contactos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinica_id UUID REFERENCES public.clinicas_parceiras(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    especialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    cedula_profissional VARCHAR(50), -- Número da cédula profissional
    horario_atendimento JSONB,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA: consultas_agendamentos
-- Agendamento de consultas nas clínicas
CREATE TABLE IF NOT EXISTS public.consultas_agendamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID REFERENCES public.animais(id) ON DELETE CASCADE,
    clinica_id UUID REFERENCES public.clinicas_parceiras(id) ON DELETE CASCADE,
    veterinario_id UUID REFERENCES public.veterinarios_contactos(id) ON DELETE SET NULL,
    tipo_consulta VARCHAR(100) NOT NULL, -- consulta_rotina, emergencia, cirurgia, exame
    data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
    data_confirmacao TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'agendado', -- agendado, confirmado, realizado, cancelado, faltou
    motivo TEXT,
    observacoes_agendamento TEXT,
    custo_estimado DECIMAL(10,2),
    custo_real DECIMAL(10,2),
    desconto_aplicado DECIMAL(5,2) DEFAULT 0,
    forma_pagamento VARCHAR(50), -- dinheiro, cartao, transferencia, convenio
    numero_fatura VARCHAR(100),
    created_by UUID, -- Quem agendou
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA: tratamentos_historico
-- Histórico detalhado de tratamentos realizados
CREATE TABLE IF NOT EXISTS public.tratamentos_historico (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consulta_id UUID REFERENCES public.consultas_agendamentos(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES public.animais(id) ON DELETE CASCADE,
    clinica_id UUID REFERENCES public.clinicas_parceiras(id) ON DELETE CASCADE,
    veterinario_id UUID REFERENCES public.veterinarios_contactos(id) ON DELETE SET NULL,
    data_tratamento TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_tratamento VARCHAR(100) NOT NULL,
    diagnostico TEXT,
    tratamento_realizado TEXT NOT NULL,
    medicamentos_prescritos JSONB, -- [{"nome": "Med1", "dosagem": "1x/dia", "duracao": "7 dias"}]
    exames_realizados JSONB, -- [{"tipo": "Raio-X", "resultado": "Normal"}]
    proxima_consulta DATE,
    observacoes_veterinario TEXT,
    estado_animal VARCHAR(50) DEFAULT 'estavel', -- critico, instavel, estavel, recuperado
    custo_total DECIMAL(10,2),
    anexos JSONB, -- URLs de documentos, exames, fotos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA: custos_clinicas
-- Controlo detalhado de custos por clínica
CREATE TABLE IF NOT EXISTS public.custos_clinicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinica_id UUID REFERENCES public.clinicas_parceiras(id) ON DELETE CASCADE,
    consulta_id UUID REFERENCES public.consultas_agendamentos(id) ON DELETE SET NULL,
    tratamento_id UUID REFERENCES public.tratamentos_historico(id) ON DELETE SET NULL,
    tipo_custo VARCHAR(100) NOT NULL, -- consulta, exame, medicamento, cirurgia, internamento
    descricao TEXT NOT NULL,
    valor_original DECIMAL(10,2) NOT NULL,
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    valor_final DECIMAL(10,2) NOT NULL,
    data_custo DATE NOT NULL,
    forma_pagamento VARCHAR(50),
    numero_fatura VARCHAR(100),
    status_pagamento VARCHAR(50) DEFAULT 'pendente', -- pendente, pago, em_atraso, cancelado
    data_pagamento DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA: avaliacoes_parcerias
-- Avaliação da qualidade das parcerias com clínicas
CREATE TABLE IF NOT EXISTS public.avaliacoes_parcerias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinica_id UUID REFERENCES public.clinicas_parceiras(id) ON DELETE CASCADE,
    consulta_id UUID REFERENCES public.consultas_agendamentos(id) ON DELETE SET NULL,
    avaliador VARCHAR(255), -- Nome de quem fez a avaliação
    data_avaliacao DATE NOT NULL,
    nota_atendimento INTEGER CHECK (nota_atendimento >= 1 AND nota_atendimento <= 5),
    nota_qualidade INTEGER CHECK (nota_qualidade >= 1 AND nota_qualidade <= 5),
    nota_preco INTEGER CHECK (nota_preco >= 1 AND nota_preco <= 5),
    nota_pontualidade INTEGER CHECK (nota_pontualidade >= 1 AND nota_pontualidade <= 5),
    nota_geral DECIMAL(3,2), -- Média calculada automaticamente
    comentarios TEXT,
    recomendaria BOOLEAN,
    pontos_positivos TEXT,
    pontos_negativos TEXT,
    sugestoes_melhoria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_clinicas_ativo ON public.clinicas_parceiras(ativo);
CREATE INDEX IF NOT EXISTS idx_clinicas_tipo_parceria ON public.clinicas_parceiras(tipo_parceria);
CREATE INDEX IF NOT EXISTS idx_veterinarios_clinica ON public.veterinarios_contactos(clinica_id);
CREATE INDEX IF NOT EXISTS idx_consultas_animal ON public.consultas_agendamentos(animal_id);
CREATE INDEX IF NOT EXISTS idx_consultas_clinica ON public.consultas_agendamentos(clinica_id);
CREATE INDEX IF NOT EXISTS idx_consultas_data ON public.consultas_agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_consultas_status ON public.consultas_agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_tratamentos_animal ON public.tratamentos_historico(animal_id);
CREATE INDEX IF NOT EXISTS idx_tratamentos_clinica ON public.tratamentos_historico(clinica_id);
CREATE INDEX IF NOT EXISTS idx_custos_clinica ON public.custos_clinicas(clinica_id);
CREATE INDEX IF NOT EXISTS idx_custos_data ON public.custos_clinicas(data_custo);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_clinica ON public.avaliacoes_parcerias(clinica_id);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
CREATE TRIGGER update_clinicas_parceiras_updated_at BEFORE UPDATE ON public.clinicas_parceiras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_veterinarios_contactos_updated_at BEFORE UPDATE ON public.veterinarios_contactos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultas_agendamentos_updated_at BEFORE UPDATE ON public.consultas_agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tratamentos_historico_updated_at BEFORE UPDATE ON public.tratamentos_historico FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custos_clinicas_updated_at BEFORE UPDATE ON public.custos_clinicas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_avaliacoes_parcerias_updated_at BEFORE UPDATE ON public.avaliacoes_parcerias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Ativar RLS nas tabelas
ALTER TABLE public.clinicas_parceiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinarios_contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas_agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tratamentos_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custos_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_parcerias ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários autenticados
CREATE POLICY "Authenticated users can view clinicas" ON public.clinicas_parceiras FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage clinicas" ON public.clinicas_parceiras FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view veterinarios" ON public.veterinarios_contactos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage veterinarios" ON public.veterinarios_contactos FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view consultas" ON public.consultas_agendamentos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage consultas" ON public.consultas_agendamentos FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view tratamentos" ON public.tratamentos_historico FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage tratamentos" ON public.tratamentos_historico FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view custos" ON public.custos_clinicas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage custos" ON public.custos_clinicas FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view avaliacoes" ON public.avaliacoes_parcerias FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage avaliacoes" ON public.avaliacoes_parcerias FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- DADOS DE EXEMPLO PARA TESTE
-- =====================================================

-- Inserir algumas clínicas de exemplo
INSERT INTO public.clinicas_parceiras (nome, codigo, morada, telefone, email, especialidades, tipo_parceria, desconto_percentual, data_inicio_parceria) VALUES
('Clínica Veterinária Central', 'CVC001', 'Rua Principal, 123, Lisboa', '213456789', 'geral@clinicacentral.pt', ARRAY['Clínica Geral', 'Cirurgia', 'Dermatologia'], 'convenio', 15.00, '2024-01-01'),
('Hospital Veterinário do Norte', 'HVN002', 'Avenida da República, 456, Porto', '223456789', 'contacto@hvnorte.pt', ARRAY['Emergências', 'Cardiologia', 'Oncologia'], 'desconto', 20.00, '2024-02-15'),
('Clínica dos Bichos', 'CDB003', 'Rua dos Animais, 789, Coimbra', '239456789', 'info@clinicabichos.pt', ARRAY['Clínica Geral', 'Vacinação'], 'convenio', 10.00, '2024-03-01')
ON CONFLICT (codigo) DO NOTHING;

-- Inserir veterinários de exemplo
INSERT INTO public.veterinarios_contactos (clinica_id, nome, especialidade, telefone, email, cedula_profissional) 
SELECT 
    cp.id,
    'Dr. João Silva',
    'Clínica Geral',
    '913456789',
    'joao.silva@clinicacentral.pt',
    'OMV12345'
FROM public.clinicas_parceiras cp WHERE cp.codigo = 'CVC001'
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.clinicas_parceiras IS 'Cadastro das clínicas veterinárias parceiras';
COMMENT ON TABLE public.veterinarios_contactos IS 'Contactos dos veterinários das clínicas';
COMMENT ON TABLE public.consultas_agendamentos IS 'Agendamento de consultas nas clínicas';
COMMENT ON TABLE public.tratamentos_historico IS 'Histórico detalhado de tratamentos realizados';
COMMENT ON TABLE public.custos_clinicas IS 'Controlo detalhado de custos por clínica';
COMMENT ON TABLE public.avaliacoes_parcerias IS 'Avaliação da qualidade das parcerias com clínicas';