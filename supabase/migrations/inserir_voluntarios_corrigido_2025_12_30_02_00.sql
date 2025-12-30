-- Adicionar coluna especialidades se não existir
ALTER TABLE public.voluntarios 
ADD COLUMN IF NOT EXISTS especialidades TEXT[];

-- Verificar dados existentes
SELECT 
    'Voluntários existentes' as status,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE ativo = true) as ativos
FROM public.voluntarios;

-- Atualizar voluntários existentes sem especialidades
UPDATE public.voluntarios 
SET especialidades = ARRAY['Voluntário Geral']
WHERE especialidades IS NULL OR array_length(especialidades, 1) IS NULL;

-- Inserir voluntários de exemplo se houver poucos
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM public.voluntarios WHERE ativo = true) < 5 THEN
        INSERT INTO public.voluntarios (nome, email, telefone, especialidades, ativo) VALUES
        ('João Silva', 'joao.silva@email.pt', '91-234-5678', ARRAY['Resgate', 'Primeiros Socorros'], true),
        ('Maria Santos', 'maria.santos@email.pt', '92-345-6789', ARRAY['Cuidados Veterinários', 'Reabilitação'], true),
        ('Pedro Costa', 'pedro.costa@email.pt', '93-456-7890', ARRAY['Transporte', 'Logística'], true),
        ('Ana Rodrigues', 'ana.rodrigues@email.pt', '94-567-8901', ARRAY['Administração', 'Coordenação'], true),
        ('Carlos Mendes', 'carlos.mendes@email.pt', '95-678-9012', ARRAY['Resgate', 'Emergências'], true),
        ('Sofia Oliveira', 'sofia.oliveira@email.pt', '96-789-0123', ARRAY['Cuidados Animais', 'Socialização'], true),
        ('Ricardo Ferreira', 'ricardo.ferreira@email.pt', '97-890-1234', ARRAY['Manutenção', 'Construção'], true),
        ('Catarina Lopes', 'catarina.lopes@email.pt', '98-901-2345', ARRAY['Educação', 'Sensibilização'], true);
    END IF;
END $$;

-- Verificar resultado final
SELECT 
    id,
    nome,
    especialidades,
    ativo
FROM public.voluntarios 
WHERE ativo = true
ORDER BY nome;