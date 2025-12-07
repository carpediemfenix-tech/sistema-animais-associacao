-- REMOÇÃO COMPLETA DO SISTEMA ANTIGO DE FORMAÇÃO
-- Criado em: 2025-12-07 04:00 UTC

-- Remover tabelas antigas do sistema de formação
DROP TABLE IF EXISTS public.voluntario_conquistas CASCADE;
DROP TABLE IF EXISTS public.conquistas CASCADE;
DROP TABLE IF EXISTS public.voluntario_especializacoes CASCADE;
DROP TABLE IF EXISTS public.especializacoes CASCADE;
DROP TABLE IF EXISTS public.voluntario_progressao CASCADE;
DROP TABLE IF EXISTS public.niveis_formacao CASCADE;

-- Remover funções antigas
DROP FUNCTION IF EXISTS public.get_niveis_formacao_all();
DROP FUNCTION IF EXISTS public.insert_nivel_formacao(TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.update_nivel_formacao(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT);

-- Remover colunas relacionadas com o sistema antigo da tabela voluntarios
ALTER TABLE public.voluntarios DROP COLUMN IF EXISTS nivel_formacao_atual;
ALTER TABLE public.voluntarios DROP COLUMN IF EXISTS tem_formacao;

-- Comentário
COMMENT ON SCHEMA public IS 'Sistema antigo de formação removido - preparando para nova arquitetura';
-- NOVO SISTEMA DE FORMAÇÃO PROFISSIONAL
-- Arquitetura: Tipos → Ações → Participações
-- Criado em: 2025-12-07 04:00 UTC

-- 1. TIPOS DE FORMAÇÃO (Templates/Modelos)
CREATE TABLE public.tipos_formacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE, -- FORMA_BASE, FORMA_N1, etc.
    nome TEXT NOT NULL,
    descricao TEXT,
    nivel_ordem INTEGER NOT NULL DEFAULT 0,
    carga_horaria_minima INTEGER DEFAULT 0, -- em horas
    competencias JSONB DEFAULT '[]'::jsonb,
    pre_requisitos JSONB DEFAULT '[]'::jsonb, -- IDs de tipos pré-requisito
    cor TEXT DEFAULT '#3B82F6',
    icone TEXT DEFAULT '🎓',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AÇÕES DE FORMAÇÃO (Instâncias específicas)
CREATE TABLE public.acoes_formacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_acao TEXT NOT NULL UNIQUE, -- ACC2502, ACC2506, etc.
    tipo_formacao_id UUID NOT NULL REFERENCES public.tipos_formacao(id) ON DELETE CASCADE,
    nome_acao TEXT NOT NULL,
    descricao TEXT,
    formador TEXT,
    local_formacao TEXT,
    data_inicio DATE,
    data_fim DATE,
    carga_horaria_real INTEGER DEFAULT 0,
    vagas_maximas INTEGER DEFAULT 20,
    vagas_ocupadas INTEGER DEFAULT 0,
    preco DECIMAL(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'planeada' CHECK (status IN ('planeada', 'inscricoes_abertas', 'em_curso', 'concluida', 'cancelada')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PARTICIPAÇÕES EM FORMAÇÃO (Registos de voluntários)
CREATE TABLE public.participacoes_formacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voluntario_id UUID NOT NULL REFERENCES public.voluntarios(id) ON DELETE CASCADE,
    acao_formacao_id UUID NOT NULL REFERENCES public.acoes_formacao(id) ON DELETE CASCADE,
    data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status_participacao TEXT DEFAULT 'inscrito' CHECK (status_participacao IN ('inscrito', 'confirmado', 'presente', 'ausente', 'aprovado', 'reprovado', 'desistiu')),
    nota_final DECIMAL(4,2), -- 0.00 a 20.00
    percentagem_presenca DECIMAL(5,2) DEFAULT 0.00, -- 0.00 a 100.00
    certificado_emitido BOOLEAN DEFAULT false,
    data_certificado DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(voluntario_id, acao_formacao_id)
);

-- Índices para performance
CREATE INDEX idx_tipos_formacao_codigo ON public.tipos_formacao(codigo);
CREATE INDEX idx_tipos_formacao_nivel_ordem ON public.tipos_formacao(nivel_ordem);
CREATE INDEX idx_acoes_formacao_codigo ON public.acoes_formacao(codigo_acao);
CREATE INDEX idx_acoes_formacao_tipo ON public.acoes_formacao(tipo_formacao_id);
CREATE INDEX idx_acoes_formacao_datas ON public.acoes_formacao(data_inicio, data_fim);
CREATE INDEX idx_participacoes_voluntario ON public.participacoes_formacao(voluntario_id);
CREATE INDEX idx_participacoes_acao ON public.participacoes_formacao(acao_formacao_id);
CREATE INDEX idx_participacoes_status ON public.participacoes_formacao(status_participacao);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tipos_formacao_updated_at BEFORE UPDATE ON public.tipos_formacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_acoes_formacao_updated_at BEFORE UPDATE ON public.acoes_formacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participacoes_formacao_updated_at BEFORE UPDATE ON public.participacoes_formacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar vagas ocupadas
CREATE OR REPLACE FUNCTION update_vagas_ocupadas()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.acoes_formacao 
        SET vagas_ocupadas = (
            SELECT COUNT(*) 
            FROM public.participacoes_formacao 
            WHERE acao_formacao_id = NEW.acao_formacao_id 
            AND status_participacao IN ('inscrito', 'confirmado', 'presente', 'aprovado')
        )
        WHERE id = NEW.acao_formacao_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.acoes_formacao 
        SET vagas_ocupadas = (
            SELECT COUNT(*) 
            FROM public.participacoes_formacao 
            WHERE acao_formacao_id = NEW.acao_formacao_id 
            AND status_participacao IN ('inscrito', 'confirmado', 'presente', 'aprovado')
        )
        WHERE id = NEW.acao_formacao_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.acoes_formacao 
        SET vagas_ocupadas = (
            SELECT COUNT(*) 
            FROM public.participacoes_formacao 
            WHERE acao_formacao_id = OLD.acao_formacao_id 
            AND status_participacao IN ('inscrito', 'confirmado', 'presente', 'aprovado')
        )
        WHERE id = OLD.acao_formacao_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_vagas_ocupadas
    AFTER INSERT OR UPDATE OR DELETE ON public.participacoes_formacao
    FOR EACH ROW EXECUTE FUNCTION update_vagas_ocupadas();

-- RLS Policies (permissivas para evitar problemas)
ALTER TABLE public.tipos_formacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_formacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participacoes_formacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON public.tipos_formacao FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.acoes_formacao FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.participacoes_formacao FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Permissões
GRANT ALL ON public.tipos_formacao TO authenticated;
GRANT ALL ON public.acoes_formacao TO authenticated;
GRANT ALL ON public.participacoes_formacao TO authenticated;

-- Comentários
COMMENT ON TABLE public.tipos_formacao IS 'Tipos/Templates de formação (FORMA BASE, N1, N2, N3, etc.)';
COMMENT ON TABLE public.acoes_formacao IS 'Ações específicas de formação (ACC2502, ACC2506, etc.)';
COMMENT ON TABLE public.participacoes_formacao IS 'Participações de voluntários em ações de formação';
-- CORREÇÃO: INSERIR AÇÕES DE FORMAÇÃO CORRETAMENTE
-- Criado em: 2025-12-07 04:00 UTC

-- Inserir ações de formação com sintaxe correta
INSERT INTO public.acoes_formacao (codigo_acao, tipo_formacao_id, nome_acao, descricao, formador, local_formacao, data_inicio, data_fim, carga_horaria_real, vagas_maximas, preco, status) VALUES

-- FORMA BASE - 2025
('ACC2501', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_BASE'), 'FORMA BASE - Janeiro 2025', 'Primeira ação de formação básica do ano 2025', 'Dr. João Silva', 'Centro de Formação VR - Lisboa', '2025-01-15', '2025-01-19', 40, 25, 0.00, 'concluida'),
('ACC2502', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_BASE'), 'FORMA BASE - Março 2025', 'Segunda ação de formação básica do ano 2025', 'Dra. Maria Santos', 'Centro de Formação VR - Porto', '2025-03-10', '2025-03-14', 40, 20, 0.00, 'concluida'),
('ACC2503', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_BASE'), 'FORMA BASE - Maio 2025', 'Terceira ação de formação básica do ano 2025', 'Dr. Pedro Costa', 'Centro de Formação VR - Coimbra', '2025-05-12', '2025-05-16', 40, 30, 0.00, 'concluida'),

-- FORMA N1 - 2025
('ACC2504', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_N1'), 'FORMA N1 - Fevereiro 2025', 'Primeira ação de Nível 1 do ano 2025', 'Eng. Ana Rodrigues', 'Centro de Formação VR - Lisboa', '2025-02-03', '2025-02-07', 60, 15, 50.00, 'concluida'),
('ACC2505', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_N1'), 'FORMA N1 - Junho 2025', 'Segunda ação de Nível 1 do ano 2025', 'Dr. Carlos Mendes', 'Centro de Formação VR - Porto', '2025-06-02', '2025-06-06', 60, 18, 50.00, 'concluida'),

-- FORMA N2 - 2025
('ACC2506', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_N2'), 'FORMA N2 - Abril 2025', 'Primeira ação de Nível 2 do ano 2025', 'Prof. Sofia Almeida', 'Centro de Formação VR - Lisboa', '2025-04-07', '2025-04-11', 80, 12, 75.00, 'concluida'),

-- FORMA N3 - 2025
('ACC2507', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_N3'), 'FORMA N3 - Setembro 2025', 'Primeira ação de Nível 3 do ano 2025', 'Dr. Miguel Ferreira', 'Centro de Formação VR - Lisboa', '2025-09-15', '2025-09-19', 100, 8, 100.00, 'concluida'),

-- ESPECIALIZAÇÕES - 2025
('ACC2508', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_VET'), 'Especialização Veterinária - Outubro 2025', 'Primeira especialização veterinária do ano', 'Dra. Veterinária Isabel Nunes', 'Hospital Veterinário VR', '2025-10-20', '2025-10-24', 120, 10, 150.00, 'concluida'),
('ACC2509', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_RESCUE'), 'Especialização Resgate - Novembro 2025', 'Primeira especialização em resgate do ano', 'Comandante Rui Oliveira', 'Centro de Treino Tático', '2025-11-18', '2025-11-22', 100, 12, 125.00, 'concluida'),

-- AÇÕES PLANEADAS PARA 2026
('ACC2601', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_BASE'), 'FORMA BASE - Janeiro 2026', 'Primeira ação de formação básica de 2026', 'Dr. João Silva', 'Centro de Formação VR - Lisboa', '2026-01-20', '2026-01-24', 40, 25, 0.00, 'planeada'),
('ACC2602', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_BASE'), 'FORMA BASE - Março 2026', 'Segunda ação de formação básica de 2026', 'Dra. Maria Santos', 'Centro de Formação VR - Porto', '2026-03-16', '2026-03-20', 40, 20, 0.00, 'inscricoes_abertas'),
('ACC2603', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_N1'), 'FORMA N1 - Fevereiro 2026', 'Primeira ação de Nível 1 de 2026', 'Eng. Ana Rodrigues', 'Centro de Formação VR - Lisboa', '2026-02-09', '2026-02-13', 60, 15, 50.00, 'inscricoes_abertas');
