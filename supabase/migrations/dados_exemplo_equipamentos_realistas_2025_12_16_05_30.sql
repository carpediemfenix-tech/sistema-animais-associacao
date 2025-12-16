-- DADOS DE EXEMPLO REALISTAS PARA MÓDULO EQUIPAMENTOS
-- Inserir categorias de equipamentos com dados realistas

-- Limpar dados existentes se houver
DELETE FROM equipamentos_2025_12_13_01_00;
DELETE FROM tipos_equipamentos_2025_12_13_01_00;
DELETE FROM categorias_equipamentos_2025_12_13_01_00;

-- Inserir categorias realistas
INSERT INTO categorias_equipamentos_2025_12_13_01_00 (
    nome, descricao, codigo, cor, icone, ordem, ativo, created_at, updated_at
) VALUES 
-- EPI - Equipamentos de Proteção Individual
('EPI', 'Equipamentos de Proteção Individual para segurança dos voluntários', 'EPI', '#DC2626', 'Shield', 1, true, NOW(), NOW()),

-- Material de Resgate
('Material de Resgate', 'Equipamentos utilizados no resgate e transporte de animais', 'RESGATE', '#EA580C', 'Truck', 2, true, NOW(), NOW()),

-- Primeiros Socorros
('Primeiros Socorros', 'Material médico e de primeiros socorros para animais', 'PRIMEIROS_SOCORROS', '#DC2626', 'Heart', 3, true, NOW(), NOW()),

-- Registo Digital
('Registo Digital', 'Equipamentos tecnológicos para registo e comunicação', 'DIGITAL', '#2563EB', 'Smartphone', 4, true, NOW(), NOW()),

-- Fardamento
('Fardamento', 'Vestuário e identificação da associação', 'FARDAMENTO', '#059669', 'Shirt', 5, true, NOW(), NOW()),

-- Ferramentas e Manutenção
('Ferramentas', 'Ferramentas para manutenção e construção de instalações', 'FERRAMENTAS', '#7C2D12', 'Wrench', 6, true, NOW(), NOW());

-- Inserir tipos de equipamentos realistas
INSERT INTO tipos_equipamentos_2025_12_13_01_00 (
    categoria_id, nome, descricao, codigo, unidade_medida, vida_util_meses, 
    requer_manutencao, intervalo_manutencao_dias, valor_unitario, fornecedor, 
    observacoes, ativo, created_at, updated_at
) VALUES 

-- EPI
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 
 'Luvas de Proteção', 'Luvas resistentes para manuseamento de animais', 'EPI_LUVAS', 'par', 6, false, 0, 5.50, 'Equipamentos Segurança Lda', 'Substituir quando danificadas', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 
 'Máscara de Proteção', 'Máscaras descartáveis para proteção respiratória', 'EPI_MASCARA', 'unidade', 1, false, 0, 0.75, 'MedSupply', 'Uso único, descartar após utilização', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 
 'Óculos de Proteção', 'Óculos de segurança para proteção ocular', 'EPI_OCULOS', 'unidade', 24, true, 90, 12.00, 'SafetyFirst', 'Limpar regularmente', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 
 'Botas de Segurança', 'Botas impermeáveis com biqueira de aço', 'EPI_BOTAS', 'par', 18, true, 180, 45.00, 'WorkSafe Portugal', 'Verificar sola regularmente', true, NOW(), NOW()),

-- Material de Resgate
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE'), 
 'Transportadora Grande', 'Transportadora para cães de grande porte', 'TRANSP_GRANDE', 'unidade', 60, true, 180, 85.00, 'PetTransport', 'Verificar fechos e estrutura', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE'), 
 'Transportadora Média', 'Transportadora para cães de médio porte', 'TRANSP_MEDIA', 'unidade', 60, true, 180, 65.00, 'PetTransport', 'Verificar fechos e estrutura', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE'), 
 'Rede de Captura', 'Rede para captura segura de animais', 'REDE_CAPTURA', 'unidade', 36, true, 90, 35.00, 'AnimalRescue Tools', 'Verificar integridade da rede', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE'), 
 'Laço de Captura', 'Laço telescópico para captura à distância', 'LACO_CAPTURA', 'unidade', 48, true, 120, 55.00, 'AnimalRescue Tools', 'Lubrificar mecanismo regularmente', true, NOW(), NOW()),

-- Primeiros Socorros
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'PRIMEIROS_SOCORROS'), 
 'Kit Primeiros Socorros', 'Kit completo de primeiros socorros veterinários', 'KIT_PS', 'unidade', 12, true, 30, 125.00, 'VetSupplies', 'Verificar validade dos medicamentos', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'PRIMEIROS_SOCORROS'), 
 'Termómetro Digital', 'Termómetro digital para animais', 'TERMOMETRO', 'unidade', 24, true, 90, 25.00, 'MedVet', 'Calibrar semestralmente', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'PRIMEIROS_SOCORROS'), 
 'Ligaduras Elásticas', 'Ligaduras para tratamento de feridas', 'LIGADURAS', 'rolo', 3, false, 0, 3.50, 'MedSupply', 'Manter em local seco', true, NOW(), NOW()),

-- Registo Digital
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'DIGITAL'), 
 'Tablet Android', 'Tablet para registo digital no terreno', 'TABLET', 'unidade', 36, true, 180, 250.00, 'TechStore', 'Atualizar software regularmente', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'DIGITAL'), 
 'Câmara Digital', 'Câmara para documentação de casos', 'CAMERA', 'unidade', 48, true, 365, 180.00, 'PhotoPro', 'Limpar lente regularmente', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'DIGITAL'), 
 'Leitor de Microchips', 'Leitor universal de microchips', 'LEITOR_CHIP', 'unidade', 60, true, 180, 95.00, 'VetTech', 'Calibrar anualmente', true, NOW(), NOW()),

-- Fardamento
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FARDAMENTO'), 
 'T-shirt Associação', 'T-shirt com logótipo da associação', 'TSHIRT', 'unidade', 12, false, 0, 15.00, 'TextilPrint', 'Lavar a 30°C', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FARDAMENTO'), 
 'Colete Refletor', 'Colete de alta visibilidade', 'COLETE', 'unidade', 24, true, 180, 25.00, 'SafetyWear', 'Verificar fitas refletoras', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FARDAMENTO'), 
 'Crachá Identificação', 'Crachá com nome e função do voluntário', 'CRACHA', 'unidade', 12, false, 0, 8.00, 'IDCards', 'Substituir se danificado', true, NOW(), NOW()),

-- Ferramentas
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FERRAMENTAS'), 
 'Berbequim Elétrico', 'Berbequim para construção e reparações', 'BERBEQUIM', 'unidade', 60, true, 180, 85.00, 'ToolMaster', 'Lubrificar e verificar brocas', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FERRAMENTAS'), 
 'Martelo', 'Martelo de carpinteiro', 'MARTELO', 'unidade', 120, false, 0, 18.00, 'ToolMaster', 'Verificar cabo regularmente', true, NOW(), NOW()),

((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'FERRAMENTAS'), 
 'Chaves de Fendas', 'Conjunto de chaves de fendas', 'CHAVES_FENDA', 'conjunto', 60, false, 0, 22.00, 'ToolMaster', 'Manter pontas afiadas', true, NOW(), NOW());

-- Inserir alguns equipamentos de exemplo
INSERT INTO equipamentos_2025_12_13_01_00 (
    tipo_equipamento_id, codigo_interno, numero_serie, data_aquisicao, 
    data_validade, estado, localizacao, condicao, valor_aquisicao, 
    garantia_ate, observacoes, ativo, created_at, updated_at
) VALUES 

-- Equipamentos EPI
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI_LUVAS'), 
 'EPI001', 'LUV2024001', '2024-01-15', '2024-07-15', 'disponivel', 'Armazém Principal', 'bom', 5.50, '2025-01-15', 'Par de luvas tamanho M', true, NOW(), NOW()),

((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI_BOTAS'), 
 'EPI002', 'BOT2024001', '2024-02-10', NULL, 'em_uso', 'Voluntário João Silva', 'bom', 45.00, '2026-02-10', 'Botas tamanho 42', true, NOW(), NOW()),

-- Equipamentos de Resgate
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRANSP_GRANDE'), 
 'RES001', 'TRP2024001', '2024-01-20', NULL, 'disponivel', 'Carrinha de Resgate', 'excelente', 85.00, '2026-01-20', 'Transportadora azul, capacidade 30kg', true, NOW(), NOW()),

((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'REDE_CAPTURA'), 
 'RES002', 'RED2024001', '2024-03-05', NULL, 'disponivel', 'Armazém Principal', 'bom', 35.00, '2025-03-05', 'Rede com cabo de 2m', true, NOW(), NOW()),

-- Equipamentos Digitais
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TABLET'), 
 'DIG001', 'TAB2024001', '2024-02-15', NULL, 'em_uso', 'Voluntária Maria Santos', 'bom', 250.00, '2026-02-15', 'Tablet Samsung Galaxy Tab A8', true, NOW(), NOW()),

((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'LEITOR_CHIP'), 
 'DIG002', 'CHIP2024001', '2024-01-10', NULL, 'disponivel', 'Clínica Móvel', 'excelente', 95.00, '2029-01-10', 'Leitor universal ISO 11784/11785', true, NOW(), NOW()),

-- Fardamento
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TSHIRT'), 
 'FAR001', 'TSH2024001', '2024-01-05', '2025-01-05', 'disponivel', 'Armazém Fardamento', 'bom', 15.00, NULL, 'T-shirt azul tamanho M', true, NOW(), NOW()),

((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'COLETE'), 
 'FAR002', 'COL2024001', '2024-01-08', NULL, 'em_uso', 'Voluntário Pedro Costa', 'bom', 25.00, '2026-01-08', 'Colete laranja tamanho L', true, NOW(), NOW()),

-- Ferramentas
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'BERBEQUIM'), 
 'FER001', 'BER2024001', '2024-02-20', NULL, 'manutencao', 'Oficina', 'regular', 85.00, '2026-02-20', 'Berbequim Bosch 18V - em manutenção preventiva', true, NOW(), NOW()),

((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'MARTELO'), 
 'FER002', 'MAR2024001', '2024-01-12', NULL, 'disponivel', 'Oficina', 'bom', 18.00, NULL, 'Martelo 500g cabo madeira', true, NOW(), NOW());

-- Verificar dados inseridos
SELECT 
    'Categorias inseridas' as tipo,
    COUNT(*) as quantidade
FROM categorias_equipamentos_2025_12_13_01_00
UNION ALL
SELECT 
    'Tipos inseridos',
    COUNT(*)
FROM tipos_equipamentos_2025_12_13_01_00
UNION ALL
SELECT 
    'Equipamentos inseridos',
    COUNT(*)
FROM equipamentos_2025_12_13_01_00;