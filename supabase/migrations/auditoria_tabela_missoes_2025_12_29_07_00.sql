-- Auditoria da tabela de missões
-- Data: 2025-12-29 07:00 UTC

-- 1. Verificar se a tabela existe
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%missoes%'
ORDER BY table_name;

-- 2. Se a tabela missoes_2025_12_21_19_00 existir, mostrar estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'missoes_2025_12_21_19_00'
ORDER BY ordinal_position;

-- 3. Verificar dados existentes (se tabela existir)
SELECT 
    COUNT(*) as total_missoes,
    COUNT(CASE WHEN status = 'ativa' THEN 1 END) as ativas,
    COUNT(CASE WHEN status = 'concluida' THEN 1 END) as concluidas,
    COUNT(CASE WHEN status = 'rascunho' THEN 1 END) as rascunhos
FROM missoes_2025_12_21_19_00;

-- 4. Se não existir, criar tabela básica
CREATE TABLE IF NOT EXISTS public.missoes_2025_12_29_07_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    local_principal VARCHAR(200),
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'planejada', 'ativa', 'pausada', 'concluida', 'cancelada')),
    orcamento_previsto DECIMAL(10,2) DEFAULT 0.00,
    orcamento_gasto DECIMAL(10,2) DEFAULT 0.00,
    responsavel_id VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_missoes_status ON public.missoes_2025_12_29_07_00(status);
CREATE INDEX IF NOT EXISTS idx_missoes_data_inicio ON public.missoes_2025_12_29_07_00(data_inicio);
CREATE INDEX IF NOT EXISTS idx_missoes_prioridade ON public.missoes_2025_12_29_07_00(prioridade);

-- 6. Inserir dados de exemplo se tabela estiver vazia
INSERT INTO public.missoes_2025_12_29_07_00 (
    codigo, titulo, descricao, data_inicio, data_fim, local_principal, 
    prioridade, status, orcamento_previsto, responsavel_id, observacoes
) VALUES 
(
    'MISS-001',
    'Resgate de Animais Abandonados',
    'Missão de resgate e recolha de animais abandonados na zona urbana da cidade.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'Centro da Cidade',
    'alta',
    'ativa',
    500.00,
    'admin',
    'Missão prioritária para o inverno'
),
(
    'MISS-002',
    'Campanha de Esterilização',
    'Campanha de esterilização gratuita para animais de famílias carenciadas.',
    CURRENT_DATE + INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '14 days',
    'Clínica Veterinária Central',
    'media',
    'planejada',
    1200.00,
    'admin',
    'Parceria com clínicas locais'
),
(
    'MISS-003',
    'Feira de Adoção',
    'Evento de adoção responsável com animais disponíveis da associação.',
    CURRENT_DATE + INTERVAL '21 days',
    CURRENT_DATE + INTERVAL '21 days',
    'Parque Municipal',
    'media',
    'rascunho',
    300.00,
    'admin',
    'Evento mensal de adoção'
)
ON CONFLICT (codigo) DO NOTHING;

-- 7. Verificar resultado final
SELECT 
    'Tabela criada e dados inseridos com sucesso!' as status,
    COUNT(*) as total_missoes
FROM public.missoes_2025_12_29_07_00;