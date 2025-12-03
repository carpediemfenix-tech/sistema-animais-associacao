import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart3, AlertCircle, Users, UserCheck, UserX, TrendingUp, Award, Calendar, Download, PieChart, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/UserHeader";

interface EstatisticasGerais {
  totalVoluntarios: number;
  voluntariosAtivos: number;
  voluntariosInativos: number;
  novasEntradas30Dias: number;
  progressoes30Dias: number;
}

interface DistribuicaoNivel {
  nivel: {
    id: string;
    nome: string;
    codigo: string;
    cor: string;
  };
  quantidade: number;
  percentual: number;
}

interface ProgressaoRecente {
  id: string;
  voluntario_nome: string;
  nivel_anterior: string;
  nivel_atual: string;
  data_progressao: string;
  observacoes?: string;
}

const getNivelIcon = (codigo: string) => {
  switch (codigo) {
    case 'FORMA_BASE': return '🌱';
    case 'N1': return '🟢';
    case 'N2': return '🔵';
    case 'N3': return '🟡';
    case 'FORMA_VET': return '🏥';
    case 'FORMA_RESCUE': return '🚑';
    default: return '⚪';
  }
};

const getNivelColor = (codigo: string) => {
  switch (codigo) {
    case 'FORMA_BASE': return 'bg-green-100 text-green-800 border-green-200';
    case 'N1': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'N2': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'N3': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'FORMA_VET': return 'bg-red-100 text-red-800 border-red-200';
    case 'FORMA_RESCUE': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const RelatoriosVoluntarios = () => {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais | null>(null);
  const [distribuicaoNiveis, setDistribuicaoNiveis] = useState<DistribuicaoNivel[]>([]);
  const [progressoesRecentes, setProgressoesRecentes] = useState<ProgressaoRecente[]>([]);
  const [periodoFiltro, setPeriodoFiltro] = useState("30");

  useEffect(() => {
    if (hasPermission('admin')) {
      loadRelatorios();
    }
  }, [hasPermission, periodoFiltro]);

  const loadRelatorios = async () => {
    try {
      setLoading(true);

      // Calcular data de início baseada no filtro
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - parseInt(periodoFiltro));

      // Carregar estatísticas gerais
      const { data: voluntarios, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('id, ativo, data_entrada, nivel_formacao_atual');

      if (voluntariosError) throw voluntariosError;

      const totalVoluntarios = voluntarios?.length || 0;
      const voluntariosAtivos = voluntarios?.filter(v => v.ativo).length || 0;
      const voluntariosInativos = totalVoluntarios - voluntariosAtivos;
      
      const novasEntradas30Dias = voluntarios?.filter(v => 
        v.data_entrada && new Date(v.data_entrada) >= dataInicio
      ).length || 0;

      // Carregar níveis de formação
      const { data: niveis, error: niveisError } = await supabase
        .from('niveis_formacao')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (niveisError) throw niveisError;

      // Calcular distribuição por níveis
      const distribuicao: DistribuicaoNivel[] = (niveis || []).map(nivel => {
        const quantidade = voluntarios?.filter(v => 
          v.ativo && v.nivel_formacao_atual === nivel.id
        ).length || 0;
        
        return {
          nivel,
          quantidade,
          percentual: voluntariosAtivos > 0 ? Math.round((quantidade / voluntariosAtivos) * 100) : 0
        };
      });

      // Carregar progressões recentes
      const { data: progressoes, error: progressoesError } = await supabase
        .from('voluntario_progressao')
        .select(`
          id,
          data_progressao,
          observacoes,
          voluntario:voluntario_id(nome),
          nivel_anterior_info:nivel_anterior(nome, codigo),
          nivel_atual_info:nivel_atual(nome, codigo)
        `)
        .gte('data_progressao', dataInicio.toISOString())
        .order('data_progressao', { ascending: false })
        .limit(10);

      if (progressoesError) throw progressoesError;

      const progressoesFormatadas: ProgressaoRecente[] = (progressoes || []).map(p => ({
        id: p.id,
        voluntario_nome: (p as any).voluntario?.nome || 'N/A',
        nivel_anterior: (p as any).nivel_anterior_info?.nome || 'Inicial',
        nivel_atual: (p as any).nivel_atual_info?.nome || 'N/A',
        data_progressao: p.data_progressao,
        observacoes: p.observacoes
      }));

      setEstatisticas({
        totalVoluntarios,
        voluntariosAtivos,
        voluntariosInativos,
        novasEntradas30Dias,
        progressoes30Dias: progressoes?.length || 0
      });

      setDistribuicaoNiveis(distribuicao);
      setProgressoesRecentes(progressoesFormatadas);

    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = () => {
    // Implementar exportação futura
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de exportação será implementada em breve",
    });
  };

  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem ver relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/voluntarios">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
              Relatórios de Voluntários
            </h1>
            <p className="text-gray-600 mt-1">
              Análises e estatísticas do sistema de voluntários Valentão
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportarRelatorio}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Link to="/voluntarios">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Voluntários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas?.totalVoluntarios || 0}</div>
              <p className="text-xs text-muted-foreground">
                Todos os voluntários registados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estatisticas?.voluntariosAtivos || 0}</div>
              <p className="text-xs text-muted-foreground">
                Voluntários ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estatisticas?.voluntariosInativos || 0}</div>
              <p className="text-xs text-muted-foreground">
                Voluntários inativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novas Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estatisticas?.novasEntradas30Dias || 0}</div>
              <p className="text-xs text-muted-foreground">
                Últimos {periodoFiltro} dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progressões</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{estatisticas?.progressoes30Dias || 0}</div>
              <p className="text-xs text-muted-foreground">
                Últimos {periodoFiltro} dias
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="distribuicao" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="distribuicao">Distribuição por Níveis</TabsTrigger>
            <TabsTrigger value="atividade">Atividade Recente</TabsTrigger>
          </TabsList>

          {/* Tab Distribuição */}
          <TabsContent value="distribuicao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Distribuição por Níveis de Formação
                </CardTitle>
                <CardDescription>
                  Voluntários ativos distribuídos pelos níveis do sistema Valentão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {distribuicaoNiveis.map((item) => (
                    <div key={item.nivel.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getNivelColor(item.nivel.codigo)}>
                            {getNivelIcon(item.nivel.codigo)} {item.nivel.nome}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {item.quantidade} voluntários
                          </span>
                        </div>
                        <span className="text-sm font-medium">{item.percentual}%</span>
                      </div>
                      <Progress value={item.percentual} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Atividade */}
          <TabsContent value="atividade" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Progressões Recentes
                </CardTitle>
                <CardDescription>
                  Últimas progressões de formação registadas (últimos {periodoFiltro} dias)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressoesRecentes.length > 0 ? (
                    progressoesRecentes.map((progressao) => (
                      <div key={progressao.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{progressao.voluntario_nome}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{progressao.nivel_anterior}</span>
                              <span>→</span>
                              <span className="font-medium">{progressao.nivel_atual}</span>
                            </div>
                            {progressao.observacoes && (
                              <p className="text-xs text-gray-500 mt-1">{progressao.observacoes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Date(progressao.data_progressao).toLocaleDateString('pt-PT')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(progressao.data_progressao).toLocaleTimeString('pt-PT', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma progressão registada no período selecionado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RelatoriosVoluntarios;