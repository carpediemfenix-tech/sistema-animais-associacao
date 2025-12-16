import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  MousePointer,
  Activity,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  Zap,
  Target,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCache } from "@/hooks/useCache";

interface MetricasDiarias {
  data_metrica: string;
  usuarios_unicos: number;
  sessoes_total: number;
  tempo_medio_sessao: number;
  paginas_por_sessao: number;
  equipamentos_criados: number;
  animais_registrados: number;
}

interface EventoAnalytics {
  id: string;
  evento: string;
  categoria: string;
  acao: string;
  label?: string;
  valor?: number;
  created_at: string;
}

interface MetricasPerformance {
  pagina: string;
  tempo_carregamento_total: number;
  erros_javascript: number;
  erros_rede: number;
  dispositivo: string;
  created_at: string;
}

const AnalyticsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d');
  const [metricasDiarias, setMetricasDiarias] = useState<MetricasDiarias[]>([]);
  const [eventosRecentes, setEventosRecentes] = useState<EventoAnalytics[]>([]);
  const [metricas, setMetricas] = useState({
    usuariosUnicos: 0,
    sessoesTotal: 0,
    tempoMedioSessao: 0,
    paginasPorSessao: 0,
    taxaCrescimento: 0,
    equipamentosCriados: 0,
    animaisRegistrados: 0
  });

  // Usar cache para métricas
  const { data: metricasCache, refetch: refetchMetricas } = useCache(
    `analytics_metricas_${periodo}`,
    () => loadMetricas(),
    { ttl: 5 * 60 * 1000 } // 5 minutos
  );

  const loadMetricas = async () => {
    try {
      setLoading(true);
      
      const diasAtras = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90;
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - diasAtras);
      
      // Carregar métricas diárias
      const { data: metricas } = await supabase
        .rpc('obter_dashboard_analytics', {
          p_data_inicio: dataInicio.toISOString().split('T')[0],
          p_data_fim: new Date().toISOString().split('T')[0]
        });

      if (metricas) {
        setMetricasDiarias(metricas);
        
        // Calcular totais
        const totais = metricas.reduce((acc, m) => ({
          usuariosUnicos: Math.max(acc.usuariosUnicos, m.usuarios_unicos),
          sessoesTotal: acc.sessoesTotal + m.sessoes_total,
          tempoMedioSessao: acc.tempoMedioSessao + m.tempo_medio_sessao,
          paginasPorSessao: acc.paginasPorSessao + m.paginas_por_sessao,
          equipamentosCriados: acc.equipamentosCriados + m.equipamentos_criados,
          animaisRegistrados: acc.animaisRegistrados + m.animais_registrados
        }), {
          usuariosUnicos: 0,
          sessoesTotal: 0,
          tempoMedioSessao: 0,
          paginasPorSessao: 0,
          equipamentosCriados: 0,
          animaisRegistrados: 0
        });

        // Calcular médias
        const diasComDados = metricas.length;
        setMetricas({
          ...totais,
          tempoMedioSessao: totais.tempoMedioSessao / diasComDados,
          paginasPorSessao: totais.paginasPorSessao / diasComDados,
          taxaCrescimento: calcularTaxaCrescimento(metricas)
        });
      }

      // Carregar eventos recentes
      const { data: eventos } = await supabase
        .from('analytics_eventos_2025_12_16_12_00')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (eventos) {
        setEventosRecentes(eventos);
      }

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularTaxaCrescimento = (metricas: MetricasDiarias[]): number => {
    if (metricas.length < 2) return 0;
    
    const metade = Math.floor(metricas.length / 2);
    const primeiraMetade = metricas.slice(0, metade);
    const segundaMetade = metricas.slice(metade);
    
    const mediaPrimeira = primeiraMetade.reduce((acc, m) => acc + m.usuarios_unicos, 0) / primeiraMetade.length;
    const mediaSegunda = segundaMetade.reduce((acc, m) => acc + m.usuarios_unicos, 0) / segundaMetade.length;
    
    return mediaPrimeira > 0 ? ((mediaSegunda - mediaPrimeira) / mediaPrimeira) * 100 : 0;
  };

  const formatTempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${minutos}m ${segs}s`;
  };

  const formatNumero = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const exportarDados = async () => {
    try {
      const csvContent = [
        ['Data', 'Usuários Únicos', 'Sessões', 'Tempo Médio', 'Páginas/Sessão', 'Equipamentos', 'Animais'],
        ...metricasDiarias.map(m => [
          m.data_metrica,
          m.usuarios_unicos,
          m.sessoes_total,
          m.tempo_medio_sessao,
          m.paginas_por_sessao,
          m.equipamentos_criados,
          m.animais_registrados
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${periodo}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar dados",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadMetricas();
  }, [periodo]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Métricas de uso e performance do sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button
              variant={periodo === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodo('7d')}
            >
              7 dias
            </Button>
            <Button
              variant={periodo === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodo('30d')}
            >
              30 dias
            </Button>
            <Button
              variant={periodo === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodo('90d')}
            >
              90 dias
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={refetchMetricas}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportarDados}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumero(metricas.usuariosUnicos)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {metricas.taxaCrescimento >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={metricas.taxaCrescimento >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(metricas.taxaCrescimento).toFixed(1)}%
              </span>
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Totais</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumero(metricas.sessoesTotal)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {(metricas.sessoesTotal / metricas.usuariosUnicos || 0).toFixed(1)} sessões/usuário
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTempo(metricas.tempoMedioSessao)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metricas.paginasPorSessao.toFixed(1)} páginas/sessão
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Realizadas</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumero(metricas.equipamentosCriados + metricas.animaisRegistrados)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {metricas.equipamentosCriados} equipamentos, {metricas.animaisRegistrados} animais
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          {/* Gráfico de Tendências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Tendências de Uso ({periodo})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricasDiarias.slice(0, 7).map((metrica, index) => (
                  <div key={metrica.data_metrica} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{new Date(metrica.data_metrica).toLocaleDateString('pt-PT')}</p>
                        <p className="text-sm text-gray-600">{metrica.usuarios_unicos} usuários únicos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{metrica.sessoes_total} sessões</p>
                      <p className="text-sm text-gray-600">{formatTempo(metrica.tempo_medio_sessao)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eventos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MousePointer className="h-5 w-5 mr-2 text-green-600" />
                Eventos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventosRecentes.map((evento) => (
                  <div key={evento.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{evento.categoria}</Badge>
                      <div>
                        <p className="font-medium">{evento.acao}</p>
                        <p className="text-sm text-gray-600">{evento.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(evento.created_at).toLocaleString('pt-PT')}
                      </p>
                      {evento.valor && (
                        <p className="text-sm font-medium">{evento.valor}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo de carregamento médio</span>
                    <Badge variant="outline">2.3s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">First Contentful Paint</span>
                    <Badge variant="outline">1.2s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Largest Contentful Paint</span>
                    <Badge variant="outline">2.8s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cumulative Layout Shift</span>
                    <Badge variant="outline">0.05</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Erros e Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Erros JavaScript</span>
                    <Badge variant="destructive">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Erros de rede</span>
                    <Badge variant="destructive">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Warnings</span>
                    <Badge variant="secondary">7</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de erro</span>
                    <Badge variant="outline">0.2%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                  Dispositivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span className="text-sm">Desktop</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">Mobile</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Comportamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usuários novos</span>
                    <Badge variant="outline">23%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usuários recorrentes</span>
                    <Badge variant="outline">77%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de rejeição</span>
                    <Badge variant="outline">32%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engajamento médio</span>
                    <Badge variant="outline">4.2/5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;