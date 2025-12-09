-- Atualizar estrutura da tabela clinicas_veterinarias
ALTER TABLE public.clinicas_veterinarias 
DROP COLUMN IF EXISTS contacto_responsavel;

-- Adicionar novos campos
ALTER TABLE public.clinicas_veterinarias 
ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(8), -- ####-###
ADD COLUMN IF NOT EXISTS localidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS distrito VARCHAR(50),
ADD COLUMN IF NOT EXISTS nif VARCHAR(9); -- ######### (9 números)

-- Criar tabela de contactos das clínicas
CREATE TABLE IF NOT EXISTS public.contactos_clinicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinica_id UUID NOT NULL REFERENCES public.clinicas_veterinarias(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    vinculo VARCHAR(100) NOT NULL, -- Cargo/função: Veterinário, Recepcionista, Enfermeiro, etc.
    telemovel VARCHAR(20),
    email VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_contactos_clinicas_clinica_id ON public.contactos_clinicas(clinica_id);
CREATE INDEX IF NOT EXISTS idx_contactos_clinicas_ativo ON public.contactos_clinicas(ativo);
CREATE INDEX IF NOT EXISTS idx_contactos_clinicas_vinculo ON public.contactos_clinicas(vinculo);

-- Trigger para updated_at na tabela contactos
CREATE OR REPLACE FUNCTION update_contactos_clinicas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contactos_clinicas_updated_at 
    BEFORE UPDATE ON public.contactos_clinicas 
    FOR EACH ROW EXECUTE FUNCTION update_contactos_clinicas_updated_at();

-- Políticas RLS para contactos_clinicas
ALTER TABLE public.contactos_clinicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users on contactos_clinicas" ON public.contactos_clinicas
    FOR ALL USING (true) WITH CHECK (true);

-- Permissões
GRANT ALL ON public.contactos_clinicas TO authenticated;
GRANT ALL ON public.contactos_clinicas TO anon;