-- Sistema de Gestão de Estados dos Animais
-- Data: 2025-12-29 04:00 UTC

-- 1. Tabela para tipos de estado (configurável pelo administrador)
CREATE TABLE IF NOT EXISTS public.tipos_estado (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#6B7280', -- Cor hexadecimal para UI
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0, -- Para ordenação na UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela para histórico de estados dos animais
CREATE TABLE IF NOT EXISTS public.estados_animal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
    tipo_estado_id UUID NOT NULL REFERENCES public.tipos_estado(id) ON DELETE RESTRICT,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim DATE,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true, -- Estado atual ativo
    usuario_id VARCHAR(255), -- Quem registrou a mudança
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Inserir estados padrão
INSERT INTO public.tipos_estado (nome, descricao, cor, ordem) VALUES
('Ativo', 'Animal ativo na associação', '#10B981', 1),
('Adotado', 'Animal foi adotado', '#3B82F6', 2),
('Em Tratamento', 'Animal em tratamento médico', '#F59E0B', 3),
('Quarentena', 'Animal em quarentena', '#EF4444', 4),
('Óbito', 'Animal faleceu', '#6B7280', 5),
('Transferido', 'Animal transferido para outra instituição', '#8B5CF6', 6),
('Fugiu', 'Animal fugiu/desapareceu', '#F97316', 7)
ON CONFLICT (nome) DO NOTHING;

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_estados_animal_animal_id ON public.estados_animal(animal_id);
CREATE INDEX IF NOT EXISTS idx_estados_animal_ativo ON public.estados_animal(ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_estados_animal_data_inicio ON public.estados_animal(data_inicio);
CREATE INDEX IF NOT EXISTS idx_tipos_estado_ativo ON public.tipos_estado(ativo) WHERE ativo = true;

-- 5. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tipos_estado_updated_at BEFORE UPDATE ON public.tipos_estado
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estados_animal_updated_at BEFORE UPDATE ON public.estados_animal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Função para garantir apenas um estado ativo por animal
CREATE OR REPLACE FUNCTION ensure_single_active_state()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o novo estado está sendo marcado como ativo
    IF NEW.ativo = true THEN
        -- Desativar todos os outros estados deste animal
        UPDATE public.estados_animal 
        SET ativo = false, data_fim = NEW.data_inicio
        WHERE animal_id = NEW.animal_id 
        AND id != NEW.id 
        AND ativo = true;
        
        -- Atualizar o campo estado na tabela animais
        UPDATE public.animais 
        SET estado = (SELECT nome FROM public.tipos_estado WHERE id = NEW.tipo_estado_id)
        WHERE id = NEW.animal_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_active_state_trigger 
    BEFORE INSERT OR UPDATE ON public.estados_animal
    FOR EACH ROW EXECUTE FUNCTION ensure_single_active_state();

-- 7. Função para migrar estados existentes
DO $$
DECLARE
    animal_record RECORD;
    tipo_estado_id UUID;
BEGIN
    -- Para cada animal que já tem um estado definido
    FOR animal_record IN 
        SELECT id, estado, data_registo 
        FROM public.animais 
        WHERE estado IS NOT NULL AND estado != ''
    LOOP
        -- Encontrar o tipo de estado correspondente
        SELECT id INTO tipo_estado_id 
        FROM public.tipos_estado 
        WHERE nome = animal_record.estado;
        
        -- Se encontrou o tipo de estado, criar registro histórico
        IF tipo_estado_id IS NOT NULL THEN
            INSERT INTO public.estados_animal (
                animal_id, 
                tipo_estado_id, 
                data_inicio, 
                ativo, 
                observacoes
            ) VALUES (
                animal_record.id,
                tipo_estado_id,
                COALESCE(animal_record.data_registo, CURRENT_DATE),
                true,
                'Estado migrado automaticamente do sistema anterior'
            ) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- 8. RLS (Row Level Security)
ALTER TABLE public.tipos_estado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados_animal ENABLE ROW LEVEL SECURITY;

-- Políticas para tipos_estado (todos podem ver, apenas autenticados podem modificar)
CREATE POLICY "Todos podem ver tipos de estado" ON public.tipos_estado
    FOR SELECT USING (true);

CREATE POLICY "Apenas autenticados podem modificar tipos de estado" ON public.tipos_estado
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para estados_animal (todos podem ver, apenas autenticados podem modificar)
CREATE POLICY "Todos podem ver estados de animais" ON public.estados_animal
    FOR SELECT USING (true);

CREATE POLICY "Apenas autenticados podem modificar estados de animais" ON public.estados_animal
    FOR ALL USING (auth.role() = 'authenticated');

-- 9. Comentários para documentação
COMMENT ON TABLE public.tipos_estado IS 'Tipos de estado configuráveis para os animais';
COMMENT ON TABLE public.estados_animal IS 'Histórico de estados dos animais com auditoria completa';
COMMENT ON COLUMN public.tipos_estado.cor IS 'Cor hexadecimal para exibição na interface (#RRGGBB)';
COMMENT ON COLUMN public.estados_animal.ativo IS 'Indica se este é o estado atual do animal (apenas um por animal)';

-- Verificação final
SELECT 'Sistema de Estados criado com sucesso!' as status;