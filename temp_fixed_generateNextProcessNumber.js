  const generateNextProcessNumber = async (): Promise<string> => {
    try {
      console.log('🔢 [NOVO ANIMAL] Gerando número de processo...');
      
      // Tentar função simplificada primeiro
      let { data, error } = await supabase
        .rpc('generate_next_animal_process_number_simple');

      if (error) {
        console.warn('⚠️ [NOVO ANIMAL] Erro na função simplificada:', error);
        
        // Tentar função SQL como fallback
        const result = await supabase
          .rpc('get_next_animal_number');
          
        if (result.error) {
          console.error('❌ [NOVO ANIMAL] Erro na função SQL:', result.error);
          throw result.error;
        }
        
        data = result.data;
        console.log('✅ [NOVO ANIMAL] Usando função SQL fallback');
      }

      if (!data) {
        throw new Error('Função RPC retornou valor nulo');
      }

      console.log('✅ [NOVO ANIMAL] Número gerado:', data);
      
      // Validar formato do número gerado
      const isValidFormat = /^P\d{2}\d{3}$/.test(data);
      if (!isValidFormat) {
        console.warn('⚠️ [NOVO ANIMAL] Formato inválido:', data);
        throw new Error(`Formato de número inválido: ${data}`);
      }

      return data;

    } catch (error) {
      console.error('❌ [NOVO ANIMAL] Erro ao gerar número de processo:', error);
      
      // Fallback local baseado em consulta direta
      try {
        console.log('🔄 [NOVO ANIMAL] Tentando fallback local...');
        
        const currentYear = new Date().getFullYear();
        const yearSuffix = currentYear.toString().slice(-2);
        
        // Buscar último número do ano atual
        const { data: animais, error: queryError } = await supabase
          .from('animais')
          .select('numero_processo')
          .like('numero_processo', `P${yearSuffix}%`)
          .not('numero_processo', 'like', '%-P%')
          .order('numero_processo', { ascending: false })
          .limit(10);
          
        if (queryError) {
          console.error('❌ [NOVO ANIMAL] Erro na consulta fallback:', queryError);
          throw queryError;
        }
        
        let maxSequence = 0;
        
        if (animais && animais.length > 0) {
          // Encontrar maior sequência
          animais.forEach(animal => {
            if (animal.numero_processo) {
              const match = animal.numero_processo.match(new RegExp(`^P${yearSuffix}(\\d{3})$`));
              if (match) {
                const sequence = parseInt(match[1]);
                if (sequence > maxSequence) {
                  maxSequence = sequence;
                }
              }
            }
          });
        }
        
        const nextSequence = maxSequence + 1;
        const fallbackNumber = `P${yearSuffix}${nextSequence.toString().padStart(3, '0')}`;
        
        console.log('✅ [NOVO ANIMAL] Fallback local gerado:', fallbackNumber);
        return fallbackNumber;
        
      } catch (fallbackError) {
        console.error('❌ [NOVO ANIMAL] Erro no fallback local:', fallbackError);
        
        // Último recurso: timestamp
        const currentYear = new Date().getFullYear();
        const yearSuffix = currentYear.toString().slice(-2);
        const timestamp = Date.now().toString().slice(-6, -3);
        const emergencyNumber = `P${yearSuffix}${timestamp}`;
        
        console.log('🆘 [NOVO ANIMAL] Usando número de emergência:', emergencyNumber);
        return emergencyNumber;
      }
    }
  };