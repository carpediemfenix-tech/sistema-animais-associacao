  const fetchIntakeOptions = async () => {
    console.log('🔍 [INTAKE] Carregando opções de admissão...');
    
    // Definir opções básicas como fallback local (que sempre funcionam)
    const basicOptions = {
      general_condition: [
        { code: 'excellent', name: 'Excelente', description: 'Animal em excelente estado geral' },
        { code: 'good', name: 'Bom', description: 'Animal em bom estado geral' },
        { code: 'fair', name: 'Razoável', description: 'Animal em estado razoável' },
        { code: 'poor', name: 'Mau', description: 'Animal em mau estado' },
        { code: 'critical', name: 'Crítico', description: 'Animal em estado crítico' }
      ],
      behavior: [
        { code: 'friendly', name: 'Amigável', description: 'Animal amigável e sociável' },
        { code: 'shy', name: 'Tímido', description: 'Animal tímido mas não agressivo' },
        { code: 'fearful', name: 'Medroso', description: 'Animal com medo' },
        { code: 'aggressive', name: 'Agressivo', description: 'Animal com comportamento agressivo' },
        { code: 'lethargic', name: 'Letárgico', description: 'Animal apático ou letárgico' }
      ],
      body_condition: [
        { code: 'obese', name: 'Obeso (5/5)', description: 'Condição corporal 5/5 - Obeso' },
        { code: 'overweight', name: 'Acima do peso (4/5)', description: 'Condição corporal 4/5 - Acima do peso' },
        { code: 'ideal', name: 'Ideal (3/5)', description: 'Condição corporal 3/5 - Peso ideal' },
        { code: 'underweight', name: 'Abaixo do peso (2/5)', description: 'Condição corporal 2/5 - Abaixo do peso' },
        { code: 'emaciated', name: 'Emaciado (1/5)', description: 'Condição corporal 1/5 - Emaciado' }
      ],
      intake_origin: [
        { code: 'owner_surrender', name: 'Entrega pelo proprietário', description: 'Animal entregue pelo proprietário' },
        { code: 'stray_found', name: 'Encontrado na rua', description: 'Animal encontrado abandonado' },
        { code: 'rescue_operation', name: 'Operação de resgate', description: 'Animal resgatado em operação' },
        { code: 'transfer', name: 'Transferência', description: 'Animal transferido de outra instituição' },
        { code: 'birth', name: 'Nascimento', description: 'Animal nascido na instituição' }
      ],
      intake_reason: [
        { code: 'abandonment', name: 'Abandono', description: 'Animal abandonado' },
        { code: 'owner_unable', name: 'Proprietário incapaz', description: 'Proprietário não consegue cuidar' },
        { code: 'behavioral_issues', name: 'Problemas comportamentais', description: 'Problemas de comportamento' },
        { code: 'medical_issues', name: 'Problemas médicos', description: 'Problemas de saúde' },
        { code: 'overpopulation', name: 'Sobrepopulação', description: 'Controlo de população' }
      ],
      symptoms: [
        { code: 'lethargy', name: 'Letargia', description: 'Animal apático' },
        { code: 'vomiting', name: 'Vómito', description: 'Episódios de vómito' },
        { code: 'diarrhea', name: 'Diarreia', description: 'Fezes líquidas' },
        { code: 'coughing', name: 'Tosse', description: 'Tosse persistente' },
        { code: 'limping', name: 'Coxear', description: 'Dificuldade de locomoção' },
        { code: 'wounds', name: 'Feridas', description: 'Feridas visíveis' },
        { code: 'parasites', name: 'Parasitas', description: 'Presença de parasitas' }
      ],
      immediate_actions: [
        { code: 'first_aid', name: 'Primeiros socorros', description: 'Cuidados imediatos' },
        { code: 'pain_relief', name: 'Alívio da dor', description: 'Medicação para dor' },
        { code: 'wound_cleaning', name: 'Limpeza de feridas', description: 'Tratamento de feridas' },
        { code: 'isolation', name: 'Isolamento', description: 'Isolamento preventivo' },
        { code: 'veterinary_exam', name: 'Exame veterinário', description: 'Avaliação veterinária' }
      ]
    };
    
    try {
      // Tentar carregar opções expandidas da base de dados
      const { data, error } = await supabase
        .rpc('get_expanded_intake_options');

      if (error) {
        console.warn('⚠️ [INTAKE] Erro ao carregar opções expandidas:', error);
        
        // Tentar fallback para função antiga
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .rpc('get_intake_config_options');
          
          if (!fallbackError && fallbackData) {
            console.log('✅ [INTAKE] Usando função de fallback');
            
            // Organizar por domínio
            const optionsByDomain: Record<string, any[]> = {};
            (fallbackData || []).forEach((option: any) => {
              if (!optionsByDomain[option.domain]) {
                optionsByDomain[option.domain] = [];
              }
              optionsByDomain[option.domain].push(option);
            });
            
            setIntakeOptions(optionsByDomain);
            console.log('✅ [INTAKE] Opções carregadas via fallback:', Object.keys(optionsByDomain));
            return;
          }
        } catch (fallbackError) {
          console.warn('⚠️ [INTAKE] Fallback também falhou:', fallbackError);
        }
        
        // Usar opções básicas locais
        console.log('🔄 [INTAKE] Usando opções básicas locais');
        setIntakeOptions(basicOptions);
        console.log('✅ [INTAKE] Opções básicas carregadas:', Object.keys(basicOptions));
        return;
      }
      
      // Organizar por domínio
      const optionsByDomain: Record<string, any[]> = {};
      (data || []).forEach((option: any) => {
        if (!optionsByDomain[option.domain]) {
          optionsByDomain[option.domain] = [];
        }
        optionsByDomain[option.domain].push(option);
      });
      
      setIntakeOptions(optionsByDomain);
      console.log('✅ [INTAKE] Opções expandidas carregadas:', Object.keys(optionsByDomain));
      
    } catch (error: any) {
      console.error('❌ [INTAKE] Erro geral ao carregar opções:', error);
      
      // Usar opções básicas como último recurso
      console.log('🔄 [INTAKE] Usando opções básicas como último recurso');
      setIntakeOptions(basicOptions);
      console.log('✅ [INTAKE] Opções básicas aplicadas como fallback final');
    }
  };