-- Sistema de Gestão de Estados dos Animais - Versão Simplificada
-- Data: 2025-12-29 04:00 UTC

-- 1. Tabela para tipos de estado
CREATE TABLE IF NOT EXISTS public.tipos_estado (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#6B7280',
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela para histórico de estados
CREATE TABLE IF NOT EXISTS public.estados_animal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
    tipo_estado_id UUID NOT NULL REFERENCES public.tipos_estado(id) ON DELETE RESTRICT,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim DATE,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    usuario_id VARCHAR(255),
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

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_estados_animal_animal_id ON public.estados_animal(animal_id);
CREATE INDEX IF NOT EXISTS idx_estados_animal_ativo ON public.estados_animal(ativo) WHERE ativo = true;

-- 5. RLS
ALTER TABLE public.tipos_estado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados_animal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver tipos de estado" ON public.tipos_estado FOR SELECT USING (true);
CREATE POLICY "Autenticados podem modificar tipos de estado" ON public.tipos_estado FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Todos podem ver estados de animais" ON public.estados_animal FOR SELECT USING (true);
CREATE POLICY "Autenticados podem modificar estados de animais" ON public.estados_animal FOR ALL USING (auth.role() = 'authenticated');

SELECT 'Sistema de Estados criado com sucesso!' as status;