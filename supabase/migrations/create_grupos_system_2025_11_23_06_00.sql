-- ========================================
-- SISTEMA DE MATILHAS E COLÓNIAS
-- ========================================

-- 1. Criar tabela de grupos (matilhas e colónias)
CREATE TABLE IF NOT EXISTS public.grupos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('matilha', 'colonia')),
    localizacao TEXT,
    endereco TEXT,
    responsavel_voluntario_id UUID REFERENCES public.voluntarios(id),
    cuidador_informal VARCHAR(255), -- Para cuidadores que não são voluntários registados
    contacto_cuidador VARCHAR(255),
    data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 2. Adicionar campo grupo_id à tabela animais
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS grupo_id UUID REFERENCES public.grupos(id);

-- 3. Criar tabela de despesas por grupo
CREATE TABLE IF NOT EXISTS public.despesas_grupos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
    data_despesa DATE NOT NULL,
    categoria VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 4. Criar tabela de eventos por grupo
CREATE TABLE IF NOT EXISTS public.eventos_grupos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_evento DATE NOT NULL,
    tipo_evento VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_grupos_tipo ON public.grupos(tipo);
CREATE INDEX IF NOT EXISTS idx_grupos_ativo ON public.grupos(ativo);
CREATE INDEX IF NOT EXISTS idx_animais_grupo_id ON public.animais(grupo_id);
CREATE INDEX IF NOT EXISTS idx_despesas_grupos_grupo_id ON public.despesas_grupos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_eventos_grupos_grupo_id ON public.eventos_grupos(grupo_id);

-- 6. Criar função para validar associação animal-grupo
CREATE OR REPLACE FUNCTION validate_animal_grupo_association()
RETURNS TRIGGER AS $$
BEGIN
    -- Se não há grupo associado, permitir
    IF NEW.grupo_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Verificar se o grupo existe e obter o tipo
    DECLARE
        grupo_tipo VARCHAR(20);
    BEGIN
        SELECT tipo INTO grupo_tipo 
        FROM public.grupos 
        WHERE id = NEW.grupo_id AND ativo = TRUE;
        
        -- Se grupo não encontrado, rejeitar
        IF grupo_tipo IS NULL THEN
            RAISE EXCEPTION 'Grupo não encontrado ou inativo';
        END IF;
        
        -- Validar regras de associação
        IF grupo_tipo = 'matilha' AND NEW.especie != 'Cão' THEN
            RAISE EXCEPTION 'Apenas cães podem pertencer a matilhas';
        END IF;
        
        IF grupo_tipo = 'colonia' AND NEW.especie != 'Gato' THEN
            RAISE EXCEPTION 'Apenas gatos podem pertencer a colónias';
        END IF;
        
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- 7. Aplicar trigger de validação
DROP TRIGGER IF EXISTS validate_animal_grupo ON public.animais;
CREATE TRIGGER validate_animal_grupo
    BEFORE INSERT OR UPDATE ON public.animais
    FOR EACH ROW
    EXECUTE FUNCTION validate_animal_grupo_association();

-- 8. Inserir dados de exemplo
INSERT INTO public.grupos (nome, tipo, localizacao, cuidador_informal, contacto_cuidador, observacoes) VALUES
('Matilha do Parque Central', 'matilha', 'Parque Central da Cidade', 'Maria Silva', '912345678', 'Grupo de cães que vivem no parque central'),
('Colónia da Rua das Flores', 'colonia', 'Rua das Flores, nº 123', 'João Santos', '923456789', 'Colónia de gatos alimentada diariamente'),
('Matilha da Praia', 'matilha', 'Praia de Matosinhos', 'Ana Costa', '934567890', 'Cães que vivem na zona da praia'),
('Colónia do Mercado', 'colonia', 'Mercado Municipal', 'Pedro Oliveira', '945678901', 'Gatos que vivem na zona do mercado')
ON CONFLICT DO NOTHING;

-- 9. Inserir algumas despesas de exemplo
INSERT INTO public.despesas_grupos (grupo_id, descricao, valor, data_despesa, categoria) 
SELECT 
    g.id,
    'Ração para o grupo',
    25.50,
    CURRENT_DATE - INTERVAL '5 days',
    'Alimentação'
FROM public.grupos g 
WHERE g.nome = 'Matilha do Parque Central'
ON CONFLICT DO NOTHING;

-- 10. Verificar dados criados
SELECT 'GRUPOS CRIADOS:' as info;
SELECT id, nome, tipo, localizacao, cuidador_informal, data_criacao, ativo
FROM public.grupos 
ORDER BY tipo, nome;

SELECT 'ANIMAIS COM GRUPOS:' as info;
SELECT COUNT(*) as total_animais,
       COUNT(CASE WHEN grupo_id IS NOT NULL THEN 1 END) as com_grupo,
       COUNT(CASE WHEN grupo_id IS NULL THEN 1 END) as sem_grupo
FROM public.animais;