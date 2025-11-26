-- Sistema de Responsabilidade de Voluntários - Estrutura Completa
-- Data: 2025-11-25 15:00 UTC
-- Objetivo: Profissionalizar o controle de responsabilidades 🐾

-- 1. ADICIONAR CAMPO DE VOLUNTÁRIO RESPONSÁVEL NA TABELA ANIMAIS
ALTER TABLE public.animais 
ADD COLUMN IF NOT EXISTS voluntario_responsavel_id UUID REFERENCES public.voluntarios(id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_animais_voluntario_responsavel 
ON public.animais(voluntario_responsavel_id);

-- 2. CRIAR TABELA DE HISTÓRICO DE RESPONSABILIDADES
CREATE TABLE IF NOT EXISTS public.responsabilidades_voluntarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
  voluntario_id UUID NOT NULL REFERENCES public.voluntarios(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NULL, -- NULL = responsabilidade ativa
  motivo_mudanca TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_responsabilidades_animal ON public.responsabilidades_voluntarios(animal_id);
CREATE INDEX IF NOT EXISTS idx_responsabilidades_voluntario ON public.responsabilidades_voluntarios(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_responsabilidades_ativo ON public.responsabilidades_voluntarios(ativo);
CREATE INDEX IF NOT EXISTS idx_responsabilidades_data_fim ON public.responsabilidades_voluntarios(data_fim);

-- 3. ADICIONAR NOVO TIPO DE EVENTO PARA MUDANÇAS DE RESPONSABILIDADE
INSERT INTO public.tipos_eventos (nome, descricao, cor) VALUES
('Mudança de Responsabilidade', 'Transferência de responsabilidade entre voluntários 👥', '#9333EA')
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  cor = EXCLUDED.cor,
  updated_at = NOW();

-- 4. FUNÇÃO PARA ATUALIZAR VOLUNTÁRIO RESPONSÁVEL AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_voluntario_responsavel()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma nova responsabilidade é criada (data_fim = NULL)
  IF NEW.data_fim IS NULL THEN
    -- Atualizar o campo voluntario_responsavel_id na tabela animais
    UPDATE public.animais 
    SET voluntario_responsavel_id = NEW.voluntario_id,
        updated_at = NOW()
    WHERE id = NEW.animal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGER PARA EXECUTAR A FUNÇÃO AUTOMATICAMENTE
DROP TRIGGER IF EXISTS trigger_update_voluntario_responsavel ON public.responsabilidades_voluntarios;
CREATE TRIGGER trigger_update_voluntario_responsavel
  AFTER INSERT OR UPDATE ON public.responsabilidades_voluntarios
  FOR EACH ROW
  EXECUTE FUNCTION update_voluntario_responsavel();

-- 6. FUNÇÃO PARA FINALIZAR RESPONSABILIDADE ANTERIOR
CREATE OR REPLACE FUNCTION finalizar_responsabilidade_anterior()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma nova responsabilidade é criada, finalizar a anterior
  IF NEW.data_fim IS NULL THEN
    UPDATE public.responsabilidades_voluntarios 
    SET data_fim = NEW.data_inicio,
        updated_at = NOW()
    WHERE animal_id = NEW.animal_id 
      AND data_fim IS NULL 
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER PARA FINALIZAR RESPONSABILIDADE ANTERIOR
DROP TRIGGER IF EXISTS trigger_finalizar_responsabilidade_anterior ON public.responsabilidades_voluntarios;
CREATE TRIGGER trigger_finalizar_responsabilidade_anterior
  BEFORE INSERT ON public.responsabilidades_voluntarios
  FOR EACH ROW
  EXECUTE FUNCTION finalizar_responsabilidade_anterior();

-- 8. VIEW PARA RESPONSABILIDADES ATIVAS (facilitar consultas)
CREATE OR REPLACE VIEW responsabilidades_ativas AS
SELECT 
  r.*,
  a.nome as animal_nome,
  a.numero_processo,
  a.especie,
  v.nome as voluntario_nome,
  v.email as voluntario_email,
  v.telefone as voluntario_telefone
FROM public.responsabilidades_voluntarios r
JOIN public.animais a ON r.animal_id = a.id
JOIN public.voluntarios v ON r.voluntario_id = v.id
WHERE r.data_fim IS NULL AND r.ativo = true;

-- 9. VERIFICAR ESTRUTURA CRIADA
SELECT 'SISTEMA DE RESPONSABILIDADES CRIADO COM SUCESSO! 🎉' as status;