import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Printer, 
  Calendar as CalendarIcon,
  ArrowLeft,
  RefreshCw,
  FileText,
  DollarSign,
  PawPrint,
  Users,
  Activity,
  Target,
  Filter,
  Eye,
  Settings,
  Share2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface RelatorioAvancado {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  estatisticas: {
    animais: {
      total: number;
      ativos: number;
      adotados: number;
      obitos: number;
      naoAdotaveis: number;
      novosIngressos: number;
      adocoesPeriodo: number;
    };
    financeiro: {
      totalReceitas: number;
      totalDespesas: number;
      saldoPeriodo: number;
      custoMedioIntervencao: number;
      receitaMediaMensal: number;
    };
    intervencoes: {
      total: number;
      custoTotal: number;
      porTipo: { tipo: string; quantidade: number; custo: number }[];
      porMes: { mes: string; quantidade: number; custo: number }[];
    };
    voluntarios: {
      total: number;
      ativos: number;
      intervencoesPorVoluntario: { nome: string; quantidade: number }[];
    };
  };
  graficos: {
    animaisPorEspecie: { especie: string; quantidade: number }[];
    adocoesPorMes: { mes: string; quantidade: number }[];
    custosCategoria: { categoria: string; valor: number }[];
    tendenciaAdocoes: { mes: string; adocoes: number; ingressos: number }[];
  };
}

const RelatoriosDesktop = () => {
  const [relatorio, setRelatorio] = useState<RelatorioAvancado | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1), // Início do ano
    to: new Date()
  });
  const [tipoRelatorio, setTipoRelatorio] = useState('completo');
  const [filtros, setFiltros] = useState({
    especie: '',
    estado: '',
    voluntario: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    generateRelatorio();
  }, [dateRange, tipoRelatorio, filtros]);

  const generateRelatorio = async () => {
    try {
      setLoading(true);

      // Buscar dados base
      const { data: animais, error: animaisError } = await supabase
        .from('animais')
        .select('*');

      const { data: intervencoes, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select(`
          *,
          tipos_intervencoes(nome),
          voluntarios(nome)
        `);

      const { data: movimentos, error: movimentosError } = await supabase
        .from('movimentos_financeiros')
        .select('*');

      const { data: voluntarios, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('*');

      if (animaisError || intervencoesError || movimentosError || voluntariosError) {
        throw new Error('Erro ao carregar dados para relatório');
      }

      // Filtrar dados por período
      const animaisFiltrados = animais?.filter(a => {
        const dataEntrada = new Date(a.data_entrada);
        return dataEntrada >= dateRange.from && dataEntrada <= dateRange.to;
      }) || [];

      const intervencoesFiltradas = intervencoes?.filter(i => {
        const dataIntervencao = new Date(i.data_intervencao);
        return dataIntervencao >= dateRange.from && dataIntervencao <= dateRange.to;
      }) || [];

      const movimentosFiltrados = movimentos?.filter(m => {
        const dataMovimento = new Date(m.data_movimento);
        return dataMovimento >= dateRange.from && dataMovimento <= dateRange.to;
      }) || [];

      // Calcular estatísticas
      const estatisticas = {
        animais: {
          total: animais?.length || 0,
          ativos: animais?.filter(a => a.estado === 'Ativo' && !a.arquivado).length || 0,
          adotados: animais?.filter(a => a.estado === 'Adotado').length || 0,
          obitos: animais?.filter(a => a.estado === 'Óbito').length || 0,
          naoAdotaveis: animais?.filter(a => a.estado === 'Não Adotável').length || 0,
          novosIngressos: animaisFiltrados.length,
          adocoesPeriodo: animais?.filter(a => {
            if (!a.data_adocao) return false;
            const dataAdocao = new Date(a.data_adocao);
            return dataAdocao >= dateRange.from && dataAdocao <= dateRange.to;
          }).length || 0
        },
        financeiro: {
          totalReceitas: movimentosFiltrados.filter(m => m.tipo_movimento === 'Receita')
            .reduce((sum, m) => sum + (m.valor || 0), 0),
          totalDespesas: movimentosFiltrados.filter(m => m.tipo_movimento === 'Despesa')
            .reduce((sum, m) => sum + (m.valor || 0), 0),
          saldoPeriodo: 0,
          custoMedioIntervencao: 0,
          receitaMediaMensal: 0
        },
        intervencoes: {
          total: intervencoesFiltradas.length,
          custoTotal: intervencoesFiltradas.reduce((sum, i) => sum + (i.custo || 0), 0),
          porTipo: [],
          porMes: []
        },
        voluntarios: {
          total: voluntarios?.length || 0,
          ativos: voluntarios?.filter(v => v.ativo).length || 0,
          intervencoesPorVoluntario: []
        }
      };

      // Calcular valores derivados
      estatisticas.financeiro.saldoPeriodo = 
        estatisticas.financeiro.totalReceitas - estatisticas.financeiro.totalDespesas;
      
      estatisticas.financeiro.custoMedioIntervencao = 
        estatisticas.intervencoes.total > 0 
          ? estatisticas.intervencoes.custoTotal / estatisticas.intervencoes.total 
          : 0;

      // Gerar dados para gráficos
      const graficos = {
        animaisPorEspecie: animais?.reduce((acc: any[], curr) => {
          const existing = acc.find(item => item.especie === curr.especie);
          if (existing) {
            existing.quantidade++;
          } else {
            acc.push({ especie: curr.especie, quantidade: 1 });
          }
          return acc;
        }, []) || [],

        adocoesPorMes: generateMonthlyData(animais?.filter(a => a.data_adocao) || [], 'data_adocao'),
        
        custosCategoria: movimentosFiltrados
          .filter(m => m.tipo_movimento === 'Despesa')
          .reduce((acc: any[], curr) => {
            const existing = acc.find(item => item.categoria === curr.categoria);
            if (existing) {
              existing.valor += curr.valor || 0;
            } else {
              acc.push({ categoria: curr.categoria, valor: curr.valor || 0 });
            }
            return acc;
          }, []),

        tendenciaAdocoes: generateTrendData(animais || [])
      };

      setRelatorio({
        periodo: {
          inicio: dateRange.from,
          fim: dateRange.to
        },
        estatisticas,
        graficos
      });

    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (data: any[], dateField: string) => {
    const monthlyData: { [key: string]: number } = {};
    
    data.forEach(item => {
      if (item[dateField]) {
        const date = new Date(item[dateField]);
        const monthKey = format(date, 'MMM yyyy', { locale: pt });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    return Object.entries(monthlyData).map(([mes, quantidade]) => ({
      mes,
      quantidade
    }));
  };

  const generateTrendData = (animais: any[]) => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = format(date, 'MMM yyyy', { locale: pt });
      
      const adocoes = animais.filter(a => {
        if (!a.data_adocao) return false;
        const adocaoDate = new Date(a.data_adocao);
        return adocaoDate.getMonth() === date.getMonth() && 
               adocaoDate.getFullYear() === date.getFullYear();
      }).length;

      const ingressos = animais.filter(a => {
        const entradaDate = new Date(a.data_entrada);
        return entradaDate.getMonth() === date.getMonth() && 
               entradaDate.getFullYear() === date.getFullYear();
      }).length;

      last6Months.push({ mes: monthKey, adocoes, ingressos });
    }
    return last6Months;
  };

  const exportRelatorio = (formato: 'pdf' | 'excel' | 'csv') => {
    toast({
      title: "Exportação iniciada",
      description: `Relatório será exportado em formato ${formato.toUpperCase()}`,
    });
    // Implementar exportação real aqui
  };

  const printRelatorio = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A gerar relatório avançado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Relatórios Avançados</h1>
                  <p className="text-sm text-gray-500">
                    Análises detalhadas e estatísticas do sistema
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={generateRelatorio} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={printRelatorio} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Select value="pdf" onValueChange={(value) => exportRelatorio(value as any)}>
                <SelectTrigger className="w-32">
                  <Download className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Exportar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Filtro */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Seletor de Período */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Período:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Tipo de Relatório */}
            <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo de Relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completo">Completo</SelectItem>
                <SelectItem value="animais">Apenas Animais</SelectItem>
                <SelectItem value="financeiro">Apenas Financeiro</SelectItem>
                <SelectItem value="intervencoes">Apenas Intervenções</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {relatorio && format(relatorio.periodo.inicio, 'dd/MM/yyyy')} - {relatorio && format(relatorio.periodo.fim, 'dd/MM/yyyy')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-6">
        {relatorio && (
          <Tabs defaultValue="resumo" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="resumo">Resumo Executivo</TabsTrigger>
              <TabsTrigger value="animais">Animais</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="intervencoes">Intervenções</TabsTrigger>
              <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            </TabsList>

            {/* Tab Resumo Executivo */}
            <TabsContent value="resumo">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                {/* KPIs Principais */}
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total de Animais</p>
                        <p className="text-3xl font-bold">{relatorio.estatisticas.animais.total}</p>
                        <p className="text-blue-200 text-xs">
                          {relatorio.estatisticas.animais.novosIngressos} novos no período
                        </p>
                      </div>
                      <PawPrint className="h-12 w-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Adoções</p>
                        <p className="text-3xl font-bold">{relatorio.estatisticas.animais.adocoesPeriodo}</p>
                        <p className="text-green-200 text-xs">
                          {relatorio.estatisticas.animais.adotados} total adotados
                        </p>
                      </div>
                      <Target className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Saldo Período</p>
                        <p className="text-3xl font-bold">
                          €{relatorio.estatisticas.financeiro.saldoPeriodo.toFixed(2)}
                        </p>
                        <p className="text-purple-200 text-xs">
                          {relatorio.estatisticas.financeiro.saldoPeriodo >= 0 ? 'Positivo' : 'Negativo'}
                        </p>
                      </div>
                      {relatorio.estatisticas.financeiro.saldoPeriodo >= 0 ? (
                        <TrendingUp className="h-12 w-12 text-purple-200" />
                      ) : (
                        <TrendingDown className="h-12 w-12 text-purple-200" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Intervenções</p>
                        <p className="text-3xl font-bold">{relatorio.estatisticas.intervencoes.total}</p>
                        <p className="text-orange-200 text-xs">
                          €{relatorio.estatisticas.financeiro.custoMedioIntervencao.toFixed(2)} custo médio
                        </p>
                      </div>
                      <Activity className="h-12 w-12 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo por Categorias */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Animais por Estado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Ativos</span>
                        <div className="text-right">
                          <span className="font-bold text-green-600">{relatorio.estatisticas.animais.ativos}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({((relatorio.estatisticas.animais.ativos / relatorio.estatisticas.animais.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">Adotados</span>
                        <div className="text-right">
                          <span className="font-bold text-blue-600">{relatorio.estatisticas.animais.adotados}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({((relatorio.estatisticas.animais.adotados / relatorio.estatisticas.animais.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Óbito</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-600">{relatorio.estatisticas.animais.obitos}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({((relatorio.estatisticas.animais.obitos / relatorio.estatisticas.animais.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium text-green-800">Total Receitas</span>
                        <span className="font-bold text-green-600">
                          €{relatorio.estatisticas.financeiro.totalReceitas.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="font-medium text-red-800">Total Despesas</span>
                        <span className="font-bold text-red-600">
                          €{relatorio.estatisticas.financeiro.totalDespesas.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-800">Saldo Líquido</span>
                        <span className={`font-bold ${relatorio.estatisticas.financeiro.saldoPeriodo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          €{relatorio.estatisticas.financeiro.saldoPeriodo.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="font-medium text-purple-800">Custo Total Intervenções</span>
                        <span className="font-bold text-purple-600">
                          €{relatorio.estatisticas.intervencoes.custoTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Outras tabs podem ser implementadas conforme necessário */}
            <TabsContent value="animais">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório Detalhado de Animais</CardTitle>
                  <CardDescription>
                    Análise completa dos animais no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg text-gray-600">Relatório detalhado de animais em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financeiro">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório Financeiro Detalhado</CardTitle>
                  <CardDescription>
                    Análise completa das finanças no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg text-gray-600">Relatório financeiro detalhado em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="intervencoes">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Intervenções</CardTitle>
                  <CardDescription>
                    Análise completa das intervenções médicas no período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg text-gray-600">Relatório de intervenções em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="graficos">
              <Card>
                <CardHeader>
                  <CardTitle>Gráficos e Visualizações</CardTitle>
                  <CardDescription>
                    Representações visuais dos dados do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg text-gray-600">Gráficos interativos em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default RelatoriosDesktop;