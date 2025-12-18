-- Tabela para Intervenções das Autoridades
-- Criada em: 2025-12-18 04:50 UTC

CREATE TABLE IF NOT EXISTS public.intervencoes_autoridades_2025_12_18_04_50 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL,
    
    -- Informações básicas da intervenção
    data_intervencao DATE NOT NULL,
    tipo_intervencao VARCHAR(50) NOT NULL, -- Denúncia, Multa, Resgate, Queixa, Apreensão, Vistoria
    autoridade VARCHAR(100) NOT NULL, -- CEPNA, GNR, ICNF, DGAV, Veterinária Municipal, PSP, Bombeiros
    auto_intervencao VARCHAR(100), -- Número/referência oficial
    
    -- Gestão e acompanhamento
    voluntario_delegado_id UUID, -- Voluntário responsável por acompanhar
    status VARCHAR(30) DEFAULT 'aberta', -- aberta, em_andamento, resolvida, arquivada
    prioridade VARCHAR(20) DEFAULT 'media', -- baixa, media, alta, urgente
    data_fim DATE, -- Quando foi resolvida
    
    -- Detalhes da intervenção
    localizacao_intervencao TEXT, -- Onde ocorreu
    resultado_intervencao TEXT, -- Multa aplicada, Animal resgatado, etc.
    valor_multa DECIMAL(10,2), -- Se aplicável
    contacto_autoridade VARCHAR(200), -- Telefone/email do responsável
    
    -- Documentação
    documentos_anexos TEXT[], -- URLs para documentos/fotos
    observacoes TEXT,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    -- Constraints
    CONSTRAINT fk_animal FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
    CONSTRAINT fk_voluntario_delegado FOREIGN KEY (voluntario_delegado_id) REFERENCES voluntarios(id) ON DELETE SET NULL,
    CONSTRAINT check_status CHECK (status IN ('aberta', 'em_andamento', 'resolvida', 'arquivada')),
    CONSTRAINT check_prioridade CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
    CONSTRAINT check_tipo_intervencao CHECK (tipo_intervencao IN ('denuncia', 'multa', 'resgate', 'queixa', 'apreensao', 'vistoria', 'inspecao', 'outro'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_intervencoes_animal_id ON public.intervencoes_autoridades_2025_12_18_04_50(animal_id);
CREATE INDEX IF NOT EXISTS idx_intervencoes_data ON public.intervencoes_autoridades_2025_12_18_04_50(data_intervencao);
CREATE INDEX IF NOT EXISTS idx_intervencoes_status ON public.intervencoes_autoridades_2025_12_18_04_50(status);
CREATE INDEX IF NOT EXISTS idx_intervencoes_voluntario ON public.intervencoes_autoridades_2025_12_18_04_50(voluntario_delegado_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_intervencoes_autoridades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_intervencoes_autoridades_updated_at
    BEFORE UPDATE ON public.intervencoes_autoridades_2025_12_18_04_50
    FOR EACH ROW
    EXECUTE FUNCTION update_intervencoes_autoridades_updated_at();

-- RLS Policies
ALTER TABLE public.intervencoes_autoridades_2025_12_18_04_50 ENABLE ROW LEVEL SECURITY;

-- Policy para leitura (usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver intervenções" ON public.intervencoes_autoridades_2025_12_18_04_50
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy para inserção (usuários autenticados)
CREATE POLICY "Usuários autenticados podem criar intervenções" ON public.intervencoes_autoridades_2025_12_18_04_50
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy para atualização (usuários autenticados)
CREATE POLICY "Usuários autenticados podem atualizar intervenções" ON public.intervencoes_autoridades_2025_12_18_04_50
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy para exclusão (usuários autenticados)
CREATE POLICY "Usuários autenticados podem excluir intervenções" ON public.intervencoes_autoridades_2025_12_18_04_50
    FOR DELETE USING (auth.role() = 'authenticated');