-- =====================================================
-- INVESTIGAÇÃO E CORREÇÃO DOS DADOS DE APROVISIONAMENTO
-- =====================================================

-- 1. Verificar se as tabelas existem
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename LIKE '%aprovisionamento%' 
ORDER BY tablename;

-- 2. Verificar dados nas tabelas
SELECT 'CATEGORIAS' as tipo, COUNT(*) as total FROM public.categorias_aprovisionamento_2026_01_06;
SELECT 'TIPOS' as tipo, COUNT(*) as total FROM public.tipos_aprovisionamento_2026_01_06;

-- 3. Verificar políticas RLS
SELECT 
    schemaname,
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename LIKE '%aprovisionamento%'
ORDER BY tablename, cmd;

-- 4. Verificar dados específicos das categorias
SELECT 
    id,
    nome,
    ativo,
    created_at
FROM public.categorias_aprovisionamento_2026_01_06 
ORDER BY nome;

-- 5. Verificar dados específicos dos tipos
SELECT 
    t.id,
    t.nome as tipo_nome,
    c.nome as categoria_nome,
    t.ativo,
    t.created_at
FROM public.tipos_aprovisionamento_2026_01_06 t
LEFT JOIN public.categorias_aprovisionamento_2026_01_06 c ON t.categoria_id = c.id
ORDER BY c.nome, t.nome;

-- 6. Se não houver dados, inserir novamente
DO $$
BEGIN
    -- Verificar se há categorias
    IF (SELECT COUNT(*) FROM public.categorias_aprovisionamento_2026_01_06) = 0 THEN
        RAISE NOTICE 'Inserindo categorias padrão...';
        
        INSERT INTO public.categorias_aprovisionamento_2026_01_06 (nome, descricao, tem_numero_serie, tem_validade, permite_devolucao, permite_atribuicao_animais, requer_verificacao, cor_interface, icone) VALUES
        ('Fardamento e EPI', 'Equipamentos de proteção individual e fardamento para voluntários', true, false, true, false, true, '#10B981', 'Shield'),
        ('Consumíveis Alimentares', 'Ração, snacks e alimentação para animais', false, true, false, true, false, '#F59E0B', 'Cookie'),
        ('Medicação', 'Medicamentos e produtos veterinários', false, true, false, true, false, '#EF4444', 'Pill'),
        ('Ferramentas de Terreno', 'Equipamentos para resgates e trabalho de campo', true, false, true, false, true, '#8B5CF6', 'Wrench'),
        ('Consumíveis de Escritório', 'Material de escritório e papelaria', false, true, false, false, false, '#6B7280', 'FileText'),
        ('Consumíveis de Limpeza', 'Produtos de limpeza e higienização', false, true, false, false, false, '#06B6D4', 'Sparkles'),
        ('Equipamentos Eletrônicos', 'Câmeras, rádios, equipamentos de comunicação', true, false, true, false, true, '#3B82F6', 'Camera'),
        ('Merchandising', 'Material promocional e merchandising da associação', false, false, true, false, false, '#EC4899', 'Gift');
        
        RAISE NOTICE 'Categorias inseridas com sucesso!';
    ELSE
        RAISE NOTICE 'Categorias já existem: %', (SELECT COUNT(*) FROM public.categorias_aprovisionamento_2026_01_06);
    END IF;
    
    -- Verificar se há tipos
    IF (SELECT COUNT(*) FROM public.tipos_aprovisionamento_2026_01_06) = 0 THEN
        RAISE NOTICE 'Inserindo tipos padrão...';
        
        -- Fardamento e EPI
        INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade) VALUES
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'Colete Refletor', 'Colete de segurança com faixas refletoras', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'Luvas de Proteção', 'Luvas resistentes para manuseamento de animais', 'pares', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'Botas de Segurança', 'Calçado de proteção para trabalho de campo', 'pares', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'Capacete de Proteção', 'Capacete para atividades de risco', 'unidades', 0);

        -- Consumíveis Alimentares
        INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade) VALUES
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'Ração Cão Adulto', 'Ração seca para cães adultos', 'kg', 30),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'Ração Gato Adulto', 'Ração seca para gatos adultos', 'kg', 30),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'Ração Cachorro', 'Ração específica para cachorros', 'kg', 30),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'Snacks para Cães', 'Petiscos e recompensas', 'pacotes', 60),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'Comida Húmida Gato', 'Latas de comida húmida para gatos', 'latas', 90);

        -- Medicação
        INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade) VALUES
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'Antibiótico', 'Medicamentos antibióticos diversos', 'frascos', 30),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'Anti-inflamatório', 'Medicamentos anti-inflamatórios', 'comprimidos', 30),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'Vacina Antirrábica', 'Vacinas contra a raiva', 'doses', 15),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'Desparasitante', 'Medicamentos antiparasitários', 'comprimidos', 45),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'Analgésico', 'Medicamentos para alívio da dor', 'comprimidos', 30);

        -- Ferramentas de Terreno
        INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade) VALUES
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Transportadora Grande', 'Transportadora para animais de grande porte', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Transportadora Média', 'Transportadora para animais de médio porte', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Açaime Ajustável', 'Açaime de segurança ajustável', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Laço de Captura', 'Laço para captura segura de animais', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Rede de Captura', 'Rede para captura de animais pequenos', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Lanterna LED', 'Lanterna potente para trabalho noturno', 'unidades', 0);

        -- Equipamentos Eletrônicos
        INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade) VALUES
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Equipamentos Eletrônicos'), 'Câmera Digital', 'Câmera para documentação de resgates', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Equipamentos Eletrônicos'), 'Rádio Comunicação', 'Rádio para comunicação em campo', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Equipamentos Eletrônicos'), 'Telemóvel', 'Telemóvel para comunicações', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Equipamentos Eletrônicos'), 'Tablet', 'Tablet para registos digitais', 'unidades', 0);

        -- Consumíveis de Escritório
        INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade) VALUES
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Escritório'), 'Papel A4', 'Resmas de papel para impressão', 'resmas', 365),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Escritório'), 'Tinteiros', 'Tinteiros para impressoras', 'unidades', 730),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Escritório'), 'Canetas', 'Canetas esferográficas', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Escritório'), 'Agrafos', 'Agrafos para agrafador', 'caixas', 0);

        -- Consumíveis de Limpeza
        INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade) VALUES
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Limpeza'), 'Detergente', 'Detergente para limpeza geral', 'litros', 730),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Limpeza'), 'Desinfetante', 'Desinfetante para higienização', 'litros', 365),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Limpeza'), 'Sacos de Lixo', 'Sacos de lixo resistentes', 'rolos', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Limpeza'), 'Panos de Limpeza', 'Panos de microfibra', 'unidades', 0);

        -- Merchandising
        INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade) VALUES
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Merchandising'), 'T-shirt Associação', 'T-shirt com logótipo da associação', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Merchandising'), 'Caneca', 'Caneca promocional', 'unidades', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Merchandising'), 'Autocolantes', 'Autocolantes promocionais', 'folhas', 0),
        ((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Merchandising'), 'Porta-chaves', 'Porta-chaves da associação', 'unidades', 0);
        
        RAISE NOTICE 'Tipos inseridos com sucesso!';
    ELSE
        RAISE NOTICE 'Tipos já existem: %', (SELECT COUNT(*) FROM public.tipos_aprovisionamento_2026_01_06);
    END IF;
END $$;

-- 7. Verificar contagens finais
SELECT 'FINAL - CATEGORIAS' as tipo, COUNT(*) as total FROM public.categorias_aprovisionamento_2026_01_06;
SELECT 'FINAL - TIPOS' as tipo, COUNT(*) as total FROM public.tipos_aprovisionamento_2026_01_06;

-- 8. Verificar contagem de tipos por categoria
SELECT 
    c.nome as categoria,
    COUNT(t.id) as total_tipos
FROM public.categorias_aprovisionamento_2026_01_06 c
LEFT JOIN public.tipos_aprovisionamento_2026_01_06 t ON c.id = t.categoria_id
GROUP BY c.id, c.nome
ORDER BY c.nome;

-- 9. Testar consulta que o frontend faz
SELECT 
    c.*,
    (SELECT COUNT(*) FROM public.tipos_aprovisionamento_2026_01_06 t WHERE t.categoria_id = c.id AND t.ativo = true) as total_tipos
FROM public.categorias_aprovisionamento_2026_01_06 c
WHERE c.ativo = true
ORDER BY c.nome;