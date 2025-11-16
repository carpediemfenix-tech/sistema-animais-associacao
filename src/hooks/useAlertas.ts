import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Intervencao } from "@/types/animal";
import { AlertaSistema } from "@/types/alertas";

export const useAlertas = () => {
  const [alertas, setAlertas] = useState<AlertaSistema[]>([]);
  const [loading, setLoading] = useState(true);

  const calcularAlertas = async () => {
    try {
      setLoading(true);
      
      // Buscar animais ativos (não arquivados)
      const { data: animais, error: animaisError } = await supabase
        .from('animais_2025_11_13_03_23')
        .select('*')
        .eq('arquivado', false);

      if (animaisError) throw animaisError;

      // Buscar intervenções
      const { data: intervencoes, error: intervencoesError } = await supabase
        .from('intervencoes_2025_11_13_03_23')
        .select(`
          *,
          tipo_intervencao:tipos_intervencoes_2025_11_13_03_23(*)
        `);

      if (intervencoesError) throw intervencoesError;

      const alertasCalculados: AlertaSistema[] = [];
      const hoje = new Date();

      // 1. Alertas de vacinas em atraso
      const vacinasAtraso = calcularVacinasAtraso(animais || [], intervencoes || [], hoje);
      alertasCalculados.push(...vacinasAtraso);

      // 2. Alertas de consultas pendentes
      const consultasPendentes = calcularConsultasPendentes(animais || [], intervencoes || [], hoje);
      alertasCalculados.push(...consultasPendentes);

      // 3. Alertas de animais sem adoção há muito tempo
      const semAdocao = calcularAnimaisSemAdocao(animais || [], hoje);
      alertasCalculados.push(...semAdocao);

      // 4. Alertas de medicação contínua
      const medicacaoContinua = calcularMedicacaoContinua(animais || [], intervencoes || [], hoje);
      alertasCalculados.push(...medicacaoContinua);

      setAlertas(alertasCalculados);
    } catch (error) {
      console.error('Erro ao calcular alertas:', error);
      setAlertas([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularVacinasAtraso = (animais: Animal[], intervencoes: Intervencao[], hoje: Date): AlertaSistema[] => {
    const alertas: AlertaSistema[] = [];
    const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());

    animais.forEach(animal => {
      if (animal.estado !== 'Ativo') return;

      const vacinasAnimal = intervencoes.filter(i => 
        i.animal_id === animal.id && 
        i.tipo_intervencao?.categoria === 'Vacinação'
      );

      if (vacinasAnimal.length === 0) {
        // Animal sem vacinas registadas
        alertas.push({
          id: `vacina_${animal.id}`,
          tipo: 'vacina_atraso',
          animal_id: animal.id,
          animal_nome: animal.nome,
          titulo: 'Sem vacinas registadas',
          descricao: `${animal.nome} não tem vacinas registadas no sistema`,
          prioridade: 'alta'
        });
      } else {
        const ultimaVacina = vacinasAnimal.sort((a, b) => 
          new Date(b.data_intervencao).getTime() - new Date(a.data_intervencao).getTime()
        )[0];

        const dataUltimaVacina = new Date(ultimaVacina.data_intervencao);
        
        if (dataUltimaVacina < umAnoAtras) {
          const diasAtraso = Math.floor((hoje.getTime() - dataUltimaVacina.getTime()) / (1000 * 60 * 60 * 24));
          
          alertas.push({
            id: `vacina_${animal.id}`,
            tipo: 'vacina_atraso',
            animal_id: animal.id,
            animal_nome: animal.nome,
            titulo: 'Vacina em atraso',
            descricao: `Última vacina há ${Math.floor(diasAtraso / 30)} meses`,
            prioridade: diasAtraso > 540 ? 'alta' : 'media', // Mais de 18 meses = alta
            dias_atraso: diasAtraso
          });
        }
      }
    });

    return alertas;
  };

  const calcularConsultasPendentes = (animais: Animal[], intervencoes: Intervencao[], hoje: Date): AlertaSistema[] => {
    const alertas: AlertaSistema[] = [];
    const seteDiasFrente = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);

    intervencoes.forEach(intervencao => {
      if (!intervencao.proxima_data) return;

      const animal = animais.find(a => a.id === intervencao.animal_id);
      if (!animal || animal.estado !== 'Ativo') return;

      const proximaData = new Date(intervencao.proxima_data);
      
      if (proximaData <= seteDiasFrente && proximaData >= hoje) {
        const diasRestantes = Math.floor((proximaData.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        alertas.push({
          id: `consulta_${intervencao.id}`,
          tipo: 'consulta_pendente',
          animal_id: animal.id,
          animal_nome: animal.nome,
          titulo: 'Consulta próxima',
          descricao: `${intervencao.tipo_intervencao?.nome} em ${diasRestantes} dias`,
          prioridade: diasRestantes <= 1 ? 'alta' : 'media',
          data_limite: intervencao.proxima_data
        });
      }
    });

    return alertas;
  };

  const calcularAnimaisSemAdocao = (animais: Animal[], hoje: Date): AlertaSistema[] => {
    const alertas: AlertaSistema[] = [];
    const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate());

    animais.forEach(animal => {
      if (animal.estado !== 'Ativo') return;

      const dataEntrada = new Date(animal.data_entrada);
      
      if (dataEntrada < seisMesesAtras) {
        const diasSemAdocao = Math.floor((hoje.getTime() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24));
        const mesesSemAdocao = Math.floor(diasSemAdocao / 30);
        
        alertas.push({
          id: `sem_adocao_${animal.id}`,
          tipo: 'sem_adocao',
          animal_id: animal.id,
          animal_nome: animal.nome,
          titulo: 'Há muito tempo sem adoção',
          descricao: `${animal.nome} está disponível há ${mesesSemAdocao} meses`,
          prioridade: mesesSemAdocao > 12 ? 'alta' : 'media',
          dias_atraso: diasSemAdocao
        });
      }
    });

    return alertas;
  };

  const calcularMedicacaoContinua = (animais: Animal[], intervencoes: Intervencao[], hoje: Date): AlertaSistema[] => {
    const alertas: AlertaSistema[] = [];
    const tresDiasFrente = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);

    intervencoes.forEach(intervencao => {
      if (!intervencao.proxima_data) return;

      const animal = animais.find(a => a.id === intervencao.animal_id);
      if (!animal || animal.estado !== 'Ativo') return;

      // Verificar se é medicação (categoria Medicação ou observações contêm palavras-chave)
      const isMedicacao = intervencao.tipo_intervencao?.categoria === 'Medicação' ||
                         intervencao.observacoes?.toLowerCase().includes('medicação') ||
                         intervencao.observacoes?.toLowerCase().includes('remédio') ||
                         intervencao.observacoes?.toLowerCase().includes('tratamento');

      if (!isMedicacao) return;

      const proximaData = new Date(intervencao.proxima_data);
      
      if (proximaData <= tresDiasFrente && proximaData >= hoje) {
        const diasRestantes = Math.floor((proximaData.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 1000));
        
        alertas.push({
          id: `medicacao_${intervencao.id}`,
          tipo: 'medicacao_continua',
          animal_id: animal.id,
          animal_nome: animal.nome,
          titulo: 'Medicação a renovar',
          descricao: `Medicação de ${animal.nome} vence em ${diasRestantes} dias`,
          prioridade: diasRestantes <= 1 ? 'alta' : 'media',
          data_limite: intervencao.proxima_data
        });
      }
    });

    return alertas;
  };

  useEffect(() => {
    calcularAlertas();
  }, []);

  return {
    alertas,
    loading,
    refetchAlertas: calcularAlertas
  };
};