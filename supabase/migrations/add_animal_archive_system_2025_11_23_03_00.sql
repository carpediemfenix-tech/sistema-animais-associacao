-- Adicionar campo arquivado à tabela animais
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS arquivado BOOLEAN DEFAULT FALSE;

-- Adicionar campo data_arquivamento para controle
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS data_arquivamento TIMESTAMP WITH TIME ZONE;

-- Adicionar campo motivo_arquivamento
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS motivo_arquivamento TEXT;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_animais_arquivado ON public.animais(arquivado);

-- Arquivar automaticamente animais com estado "Óbito"
UPDATE public.animais 
SET arquivado = TRUE,
    data_arquivamento = NOW(),
    motivo_arquivamento = 'Óbito automático'
WHERE estado = 'Óbito' AND arquivado = FALSE;

-- Criar trigger para arquivar automaticamente quando estado = 'Óbito'
CREATE OR REPLACE FUNCTION auto_archive_deceased_animals()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o estado mudou para 'Óbito', arquivar automaticamente
    IF NEW.estado = 'Óbito' AND (OLD.estado IS NULL OR OLD.estado != 'Óbito') THEN
        NEW.arquivado = TRUE;
        NEW.data_arquivamento = NOW();
        NEW.motivo_arquivamento = 'Óbito automático';
    END IF;
    
    -- Se foi desarquivado, limpar campos de arquivamento
    IF NEW.arquivado = FALSE AND OLD.arquivado = TRUE THEN
        NEW.data_arquivamento = NULL;
        NEW.motivo_arquivamento = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_auto_archive_deceased ON public.animais;
CREATE TRIGGER trigger_auto_archive_deceased
    BEFORE UPDATE ON public.animais
    FOR EACH ROW
    EXECUTE FUNCTION auto_archive_deceased_animals();

-- Verificar animais arquivados
SELECT 
    COUNT(*) as total_animais,
    COUNT(CASE WHEN arquivado = TRUE THEN 1 END) as animais_arquivados,
    COUNT(CASE WHEN arquivado = FALSE THEN 1 END) as animais_ativos
FROM public.animais;

-- Listar animais arquivados
SELECT nome, numero_processo, estado, motivo_arquivamento, data_arquivamento
FROM public.animais 
WHERE arquivado = TRUE
ORDER BY data_arquivamento DESC;