-- Criar tabela tipos_eventos se não existir
CREATE TABLE IF NOT EXISTS public.tipos_eventos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) DEFAULT '📅',
    cor VARCHAR(20) DEFAULT '#3B82F6',
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir tipos de eventos básicos se a tabela estiver vazia
INSERT INTO public.tipos_eventos (nome, emoji, cor, descricao) 
SELECT * FROM (VALUES
    ('Admissão', '🏥', '#10B981', 'Entrada do animal na associação'),
    ('Consulta Veterinária', '🩺', '#3B82F6', 'Consulta médica veterinária'),
    ('Vacinação', '💉', '#8B5CF6', 'Administração de vacinas'),
    ('Cirurgia', '⚕️', '#EF4444', 'Procedimento cirúrgico'),
    ('Adoção', '🏠', '#F59E0B', 'Processo de adoção'),
    ('Transferência', '🚚', '#6B7280', 'Mudança de localização'),
    ('Tratamento', '💊', '#EC4899', 'Tratamento médico'),
    ('Exame', '🔬', '#06B6D4', 'Exames laboratoriais ou diagnósticos'),
    ('Reabilitação', '🏃', '#84CC16', 'Processo de reabilitação'),
    ('Óbito', '💔', '#1F2937', 'Falecimento do animal'),
    ('Fuga/Perda', '🔍', '#DC2626', 'Animal fugiu ou se perdeu'),
    ('Encontrado', '✅', '#059669', 'Animal foi encontrado'),
    ('Castração', '✂️', '#7C3AED', 'Procedimento de castração'),
    ('Desparasitação', '🐛', '#D97706', 'Tratamento contra parasitas'),
    ('Banho e Tosa', '🛁', '#0891B2', 'Higiene e cuidados estéticos'),
    ('Evento Especial', '🎉', '#F97316', 'Eventos especiais ou comemorações')
) AS v(nome, emoji, cor, descricao)
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_eventos LIMIT 1);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_tipos_eventos_ativo ON public.tipos_eventos(ativo);

-- Mostrar os tipos de eventos criados
SELECT id, nome, emoji, cor FROM public.tipos_eventos ORDER BY nome;