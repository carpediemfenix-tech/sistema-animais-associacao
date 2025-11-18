import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, PawPrint, Activity, TrendingUp, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RelatorioStats {
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  animaisObito: number;
  animaisNaoAdotaveis: number;
  totalIntervencoes: number;
  custoTotalIntervencoes: number;
  animaisPorEspecie: { especie: string; count: number }[];
  adocoesPorMes: { mes: string; count: number }[];
  intervencoesPorTipo: { nome: string; count: number }[];
}

const Relatorios = () => {
  const [stats, setStats] = useState<RelatorioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const fetchRelatorios = async () => {
    try {
      setLoading(true);
      console.log('Carregando relatórios...');

      // Buscar dados dos animais (sem JOIN para evitar erros)
      const { data: animaisData, error: animaisError } = await supabase
        .from('animais')
        .select('*');
      
      if (animaisError) {
        console.error('Erro ao buscar animais:', animaisError);
        throw animaisError;
      }
      
      // Filtrar animais não arquivados
      const animais = animaisData?.filter(animal => !animal.arquivado) || [];
      console.log('Animais carregados:', animais.length);

      // Buscar intervenções (sem JOIN para evitar erros)
      const { data: intervencoes, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select('*');

      if (intervencoesError) {
        console.error('Erro ao buscar intervenções:', intervencoesError);
        // Não falhar se não conseguir carregar intervenções
      }

      // Buscar tipos de intervenções separadamente
      const { data: tiposIntervencoes, error: tiposError } = await supabase
        .from('tipos_intervencoes')
        .select('*');

      if (tiposError) {
        console.error('Erro ao buscar tipos de intervenções:', tiposError);
      }

      console.log('Intervenções carregadas:', intervencoes?.length || 0);
      console.log('Tipos carregados:', tiposIntervencoes?.length || 0);

      // Processar estatísticas - CORRIGIDO: Usar apenas estados válidos
      const totalAnimais = animais.length;
      const animaisAtivos = animais.filter(a => a.estado === 'Ativo').length;
      const animaisAdotados = animais.filter(a => a.estado === 'Adotado').length;
      const animaisObito = animais.filter(a => a.estado === 'Óbito').length;
      const animaisNaoAdotaveis = animais.filter(a => a.estado === 'Não Adotável').length;

      const totalIntervencoes = intervencoes?.length || 0;
      const custoTotalIntervencoes = intervencoes?.reduce((sum, i) => sum + (i.custo || 0), 0) || 0;

      // Intervenções por tipo (usando lookup manual)
      const intervencoesPorTipo = intervencoes?.reduce((acc: any[], curr) => {
        const tipo = tiposIntervencoes?.find(t => t.id === curr.tipo_intervencao_id);
        const nomeType = tipo?.nome || 'Tipo não especificado';
        
        const existing = acc.find(item => item.nome === nomeType);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ nome: nomeType, count: 1 });
        }
        return acc;
      }, []) || [];

      // Animais por espécie
      const animaisPorEspecie = animais.reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.especie === curr.especie);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ especie: curr.especie, count: 1 });
        }
        return acc;
      }, []);

      // Adoções por mês (últimos 6 meses)
      const seisMesesAtras = new Date();
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
      
      const adocoesPorMes = [];
      for (let i = 5; i >= 0; i--) {
        const mes = new Date();
        mes.setMonth(mes.getMonth() - i);
        const mesString = mes.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
        
        const adocoesDoMes = animais.filter(a => {
          if (!a.data_adocao) return false;
          const dataAdocao = new Date(a.data_adocao);
          return dataAdocao.getMonth() === mes.getMonth() && 
                 dataAdocao.getFullYear() === mes.getFullYear();
        }).length;
        
        adocoesPorMes.push({ mes: mesString, count: adocoesDoMes });
      }

      const relatorioStats: RelatorioStats = {
        totalAnimais,
        animaisAtivos,
        animaisAdotados,
        animaisObito,
        animaisNaoAdotaveis,
        totalIntervencoes,
        custoTotalIntervencoes,
        animaisPorEspecie,
        adocoesPorMes,
        intervencoesPorTipo
      };

      console.log('Estatísticas processadas:', relatorioStats);
      setStats(relatorioStats);

    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: "Erro ao carregar relatórios",
        description: error.message || "Não foi possível carregar os dados dos relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar relatórios...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar relatórios</h2>
          <p className="text-gray-600 mb-4">Não foi possível carregar os dados dos relatórios.</p>
          <div className="space-x-4">
            <Button asChild>
              <Link to="/">Voltar ao Dashboard</Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Relatórios</h1>
                  <p className="text-sm text-gray-500">Estatísticas e análises do sistema</p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={fetchRelatorios}>
              Atualizar Dados
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Animais</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalAnimais}</p>
                </div>
                <PawPrint className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Animais Ativos</p>
                  <p className="text-3xl font-bold text-green-600">{stats.animaisAtivos}</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Animais Adotados</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.animaisAdotados}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Custo Total</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatCurrency(stats.custoTotalIntervencoes)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por Estado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Estado</CardTitle>
              <CardDescription>
                Estado atual dos animais no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Ativos</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600">{stats.animaisAtivos}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({getPercentage(stats.animaisAtivos, stats.totalAnimais)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Adotados</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600">{stats.animaisAdotados}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({getPercentage(stats.animaisAdotados, stats.totalAnimais)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="font-medium">Óbito</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-600">{stats.animaisObito}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({getPercentage(stats.animaisObito, stats.totalAnimais)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Não Adotáveis</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-yellow-600">{stats.animaisNaoAdotaveis}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({getPercentage(stats.animaisNaoAdotaveis, stats.totalAnimais)}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Animais por Espécie</CardTitle>
              <CardDescription>
                Distribuição dos animais por espécie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.animaisPorEspecie.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <PawPrint className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">{item.especie}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{item.count}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({getPercentage(item.count, stats.totalAnimais)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intervenções e Adoções */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Intervenções por Tipo</CardTitle>
              <CardDescription>
                Tipos de intervenções mais realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.intervencoesPorTipo.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma intervenção registada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.intervencoesPorTipo.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{item.nome}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adoções por Mês</CardTitle>
              <CardDescription>
                Histórico de adoções nos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.adocoesPorMes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="font-medium">{item.mes}</span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>
              Custos totais com intervenções médicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-600 mb-2">Total de Intervenções</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalIntervencoes}</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-600 mb-2">Custo Total</p>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency(stats.custoTotalIntervencoes)}
                </p>
              </div>
              
              <div className="text-center p-6 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-600 mb-2">Custo Médio</p>
                <p className="text-3xl font-bold text-orange-900">
                  {stats.totalIntervencoes > 0 
                    ? formatCurrency(stats.custoTotalIntervencoes / stats.totalIntervencoes)
                    : formatCurrency(0)
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;