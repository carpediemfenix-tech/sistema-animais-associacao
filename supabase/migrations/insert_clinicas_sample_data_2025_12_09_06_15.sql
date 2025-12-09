-- Atualizar dados de exemplo das clínicas com novos campos
UPDATE public.clinicas_veterinarias 
SET 
    codigo_postal = '1000-001',
    localidade = 'Lisboa',
    distrito = 'Lisboa',
    nif = '123456789'
WHERE nome LIKE '%Central%';

UPDATE public.clinicas_veterinarias 
SET 
    codigo_postal = '4000-001',
    localidade = 'Porto',
    distrito = 'Porto',
    nif = '234567890'
WHERE nome LIKE '%Norte%';

UPDATE public.clinicas_veterinarias 
SET 
    codigo_postal = '3000-001',
    localidade = 'Coimbra',
    distrito = 'Coimbra',
    nif = '345678901'
WHERE nome LIKE '%Bichos%';

UPDATE public.clinicas_veterinarias 
SET 
    codigo_postal = '4700-001',
    localidade = 'Braga',
    distrito = 'Braga',
    nif = '456789012'
WHERE nome LIKE '%Francisco%';

UPDATE public.clinicas_veterinarias 
SET 
    codigo_postal = '8000-001',
    localidade = 'Faro',
    distrito = 'Faro',
    nif = '567890123'
WHERE nome LIKE '%Moderna%';

-- Inserir contactos de exemplo
INSERT INTO public.contactos_clinicas (clinica_id, nome, vinculo, telemovel, email) 
SELECT 
    c.id,
    'Dra. Ana Silva',
    'Veterinária Principal',
    '912345678',
    'ana.silva@clinicacentral.pt'
FROM public.clinicas_veterinarias c
WHERE c.nome LIKE '%Central%'
LIMIT 1;

INSERT INTO public.contactos_clinicas (clinica_id, nome, vinculo, telemovel, email) 
SELECT 
    c.id,
    'Marlene Santos',
    'Recepcionista',
    '913456789',
    'recepcao@clinicacentral.pt'
FROM public.clinicas_veterinarias c
WHERE c.nome LIKE '%Central%'
LIMIT 1;

INSERT INTO public.contactos_clinicas (clinica_id, nome, vinculo, telemovel, email) 
SELECT 
    c.id,
    'Carlos Ferreira',
    'Enfermeiro Veterinário',
    '914567890',
    'carlos.ferreira@hvnorte.pt'
FROM public.clinicas_veterinarias c
WHERE c.nome LIKE '%Norte%'
LIMIT 1;

INSERT INTO public.contactos_clinicas (clinica_id, nome, vinculo, telemovel, email) 
SELECT 
    c.id,
    'Dr. João Pereira',
    'Veterinário',
    '915678901',
    'joao.pereira@hvnorte.pt'
FROM public.clinicas_veterinarias c
WHERE c.nome LIKE '%Norte%'
LIMIT 1;

INSERT INTO public.contactos_clinicas (clinica_id, nome, vinculo, telemovel, email) 
SELECT 
    c.id,
    'Sofia Costa',
    'Auxiliar Veterinária',
    '916789012',
    'sofia.costa@clinicabichos.pt'
FROM public.clinicas_veterinarias c
WHERE c.nome LIKE '%Bichos%'
LIMIT 1;

-- Verificar dados inseridos
SELECT 
    c.nome as clinica,
    c.codigo_postal,
    c.localidade,
    c.distrito,
    c.nif,
    COUNT(cc.id) as total_contactos
FROM public.clinicas_veterinarias c
LEFT JOIN public.contactos_clinicas cc ON c.id = cc.clinica_id
GROUP BY c.id, c.nome, c.codigo_postal, c.localidade, c.distrito, c.nif
ORDER BY c.nome;