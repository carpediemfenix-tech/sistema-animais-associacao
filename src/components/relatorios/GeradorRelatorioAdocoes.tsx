import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  PawPrint, 
  Calendar, 
  TrendingUp, 
  Clock,
  BarChart3,
  Users,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  RelatorioAnimaisAdocoes,
  FiltrosRelatorio,
  EstatisticasRelatorio
} from "@/types/relatorios";

interface GeradorRelatorioAdocoesProps {
  filtros: FiltrosRelatorio;
  onDadosGerados: (dados: RelatorioAnimaisAdocoes, estatisticas: EstatisticasRelatorio) => void;
}

const GeradorRelatorioAdocoes: React.FC<GeradorRelatorioAdocoesProps> = ({ 
  filtros, 
  onDadosGerados 
}) => {
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    gerarRelatorio();
  }, [filtros]);

  const gerarRelatorio = async () => {
    try {
      setLoading(true);
      setProgresso(0);

      // Simular progresso
      const intervalos = [20, 40, 60, 80, 100];
      for (let i = 0; i < intervalos.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgresso(intervalos[i]);
      }

      // Carregar dados de animais adotados
      const { data: animaisAdotados, error: animaisError } = await supabase
        .from('animais')
        .select(`
          id,
          nome,
          especie,
          data_entrada,
          data_adocao,
          grupos(nome)
        `)
        .eq('estado', 'Adotado')
        .gte('data_adocao', filtros.data_inicio)
        .lte('data_adocao', filtros.data_fim)
        .order('data_adocao', { ascending: false });

      if (animaisError) throw animaisError;

      // Processar dados
      const totalAdocoes = animaisAdotados?.length || 0;
      
      // Adoções por espécie
      const adocoesPorEspecie: Record<string, number> = {};
      animaisAdotados?.forEach(animal => {
        const especie = animal.especie || 'Não especificado';
        adocoesPorEspecie[especie] = (adocoesPorEspecie[especie] || 0) + 1;
      });

      // Adoções por mês
      const adocoesPorMes: Array<{ mes: string; quantidade: number }> = [];
      const mesesMap: Record<string, number> = {};
      
      animaisAdotados?.forEach(animal => {
        if (animal.data_adocao) {
          const mes = new Date(animal.data_adocao).toLocaleDateString('pt-PT', { 
            year: 'numeric', 
            month: 'long' 
          });
          mesesMap[mes] = (mesesMap[mes] || 0) + 1;
        }
      });

      Object.entries(mesesMap).forEach(([mes, quantidade]) => {
        adocoesPorMes.push({ mes, quantidade });
      });

      // Tempo médio até adoção
      let tempoTotalDias = 0;
      let animaisComTempo = 0;

      const animaisDetalhados = animaisAdotados?.map(animal => {
        let tempoAteAdocao = 0;
        
        if (animal.data_entrada && animal.data_adocao) {
          const entrada = new Date(animal.data_entrada);
          const adocao = new Date(animal.data_adocao);
          tempoAteAdocao = Math.floor((adocao.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
          
          if (tempoAteAdocao >= 0) {
            tempoTotalDias += tempoAteAdocao;
            animaisComTempo++;
          }
        }

        return {
          id: animal.id,
          nome: animal.nome || 'Sem nome',
          especie: animal.especie || 'Não especificado',
          data_entrada: animal.data_entrada || '',
          data_adocao: animal.data_adocao || '',
          tempo_ate_adocao: tempoAteAdocao
        };
      }) || [];

      const tempoMedioAdocao = animaisComTempo > 0 ? Math.round(tempoTotalDias / animaisComTempo) : 0;

      // Montar dados do relatório
      const dadosRelatorio: RelatorioAnimaisAdocoes = {
        total_adocoes: totalAdocoes,
        adocoes_por_especie: adocoesPorEspecie,
        adocoes_por_mes: adocoesPorMes,
        tempo_medio_adocao: tempoMedioAdocao,
        animais_adotados: animaisDetalhados
      };

      // Calcular estatísticas
      const diasPeriodo = filtros.data_inicio && filtros.data_fim ? 
        Math.ceil((new Date(filtros.data_fim).getTime() - new Date(filtros.data_inicio).getTime()) / (1000 * 60 * 60 * 24)) : 0;

      const estatisticas: EstatisticasRelatorio = {
        total_registos: totalAdocoes,
        periodo_analisado: {
          inicio: filtros.data_inicio || '',
          fim: filtros.data_fim || '',
          dias: diasPeriodo
        },
        resumo_categorias: adocoesPorEspecie,
        totais_numericos: {
          'Tempo Médio (dias)': tempoMedioAdocao,
          'Adoções/Mês': totalAdocoes > 0 && diasPeriodo > 0 ? Math.round((totalAdocoes / diasPeriodo) * 30) : 0
        },
        percentuais: Object.entries(adocoesPorEspecie).reduce((acc, [especie, quantidade]) => {
          acc[especie] = totalAdocoes > 0 ? Math.round((quantidade / totalAdocoes) * 100) : 0;
          return acc;
        }, {} as Record<string, number>)
      };

      onDadosGerados(dadosRelatorio, estatisticas);

    } catch (error: any) {
      console.error('Erro ao gerar relatório de adoções:', error);
    } finally {
      setLoading(false);
      setProgresso(0);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600" />
            Gerando Relatório de Adoções
          </CardTitle>
          <CardDescription>
            Processando dados do período selecionado...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progresso} className="w-full" />
            <p className="text-sm text-gray-600 text-center">
              {progresso}% concluído
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default GeradorRelatorioAdocoes;