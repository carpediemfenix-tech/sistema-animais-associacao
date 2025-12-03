import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Award, 
  TrendingUp, 
  Calendar,
  Sprout,
  Shield,
  Sword,
  Crown,
  Heart,
  Zap,
  ArrowLeft,
  Plus,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { MetricasVoluntarios, VoluntarioConquista, NivelFormacao } from "@/types/voluntarios";

const VoluntariosDashboard = () => {
  const [metricas, setMetricas] = useState<MetricasVoluntarios | null>(null);
  const [loading, setLoading] = useState(true);
  const [conquistasRecentes, setConquistasRecentes] = useState<VoluntarioConquista[]>([]);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem aceder ao módulo de voluntários
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/">
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar métricas básicas
      const { data: voluntarios, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('*');

      if (voluntariosError) throw voluntariosError;

      // Carregar níveis de formação
      const { data: niveis, error: niveisError } = await supabase
        .from('niveis_formacao')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (niveisError) throw niveisError;

      // Carregar especializações
      const { data: especializacoes, error: especializacoesError } = await supabase
        .from('especializacoes')
        .select('*')
        .eq('ativo', true);

      if (especializacoesError) throw especializacoesError;

      // Carregar conquistas recentes (últimas 10)
      const { data: conquistasRecentesData, error: conquistasError } = await supabase
        .from('voluntario_conquistas')
        .select(`
          *,
          conquista:conquista_id(*),
          voluntario:voluntario_id(nome)
        `)
        .order('data_obtencao', { ascending: false })
        .limit(10);

      if (conquistasError) throw conquistasError;

      // Processar métricas
      const totalVoluntarios = voluntarios?.length || 0;
      const voluntariosAtivos = voluntarios?.filter(v => v.ativo).length || 0;
      const voluntariosInativos = totalVoluntarios - voluntariosAtivos;

      // Distribuição por nível (simplificada - sem nível atual)
      const distribuicaoPorNivel = niveis?.map(nivel => {
        const quantidade = 0; // Temporário - será implementado com progressão
        return {
          nivel,
          quantidade,
          percentual: totalVoluntarios > 0 ? (quantidade / totalVoluntarios) * 100 : 0
        };
      }) || [];

      // Especializações ativas (simulado por agora)
      const especializacoesAtivas = especializacoes?.map(esp => ({
        especializacao: esp,
        quantidade: Math.floor(Math.random() * 10) // Temporário
      })) || [];

      const metricasCalculadas: MetricasVoluntarios = {
        total_voluntarios: totalVoluntarios,
        voluntarios_ativos: voluntariosAtivos,
        voluntarios_inativos: voluntariosInativos,
        distribuicao_por_nivel: distribuicaoPorNivel,
        especializacoes_ativas: especializacoesAtivas,
        conquistas_recentes: conquistasRecentesData || [],
        progressao_mensal: [] // Implementar depois
      };

      setMetricas(metricasCalculadas);
      setConquistasRecentes(conquistasRecentesData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNivelIcon = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_BASE': return <Sprout className="h-5 w-5" />;
      case 'FORMA_N1': return <Shield className="h-5 w-5" />;
      case 'FORMA_N2': return <Sword className="h-5 w-5" />;
      case 'FORMA_N3': return <Crown className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const getEspecializacaoIcon = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_VET': return <Heart className="h-5 w-5" />;
      case 'FORMA_RESCUE': return <Zap className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard de voluntários...</p>
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
              <Users className="h-8 w-8 mr-3 text-blue-600" />
              Sistema de Voluntários Valentão
            </h1>
            <p className="text-gray-600 mt-1">
              Gestão completa de voluntários com formação integrada
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Principal
              </Button>
            </Link>
            <Link to="/voluntarios/gestao">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Gerir Voluntários
              </Button>
            </Link>
            <Link to="/voluntarios/configuracoes">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total de Voluntários */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Voluntários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas?.total_voluntarios || 0}</div>
              <p className="text-xs text-muted-foreground">
                Sistema Valentão completo
              </p>
            </CardContent>
          </Card>

          {/* Voluntários Ativos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voluntários Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metricas?.voluntarios_ativos || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metricas?.total_voluntarios ? 
                  `${Math.round((metricas.voluntarios_ativos / metricas.total_voluntarios) * 100)}% do total` 
                  : '0% do total'}
              </p>
            </CardContent>
          </Card>

          {/* Voluntários Inativos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voluntários Inativos</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metricas?.voluntarios_inativos || 0}</div>
              <p className="text-xs text-muted-foreground">
                Temporariamente inativos
              </p>
            </CardContent>
          </Card>

          {/* Conquistas Este Mês */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conquistas Recentes</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{conquistasRecentes.length}</div>
              <p className="text-xs text-muted-foreground">
                Últimas conquistas obtidas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Distribuição por Nível de Formação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Distribuição por Nível de Formação
              </CardTitle>
              <CardDescription>
                Voluntários distribuídos pelos níveis do sistema Valentão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metricas?.distribuicao_por_nivel.map((item) => (
                <div key={item.nivel.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div style={{ color: item.nivel.cor }}>
                        {getNivelIcon(item.nivel.codigo)}
                      </div>
                      <span className="font-medium">{item.nivel.nome}</span>
                      <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: `${item.nivel.cor}20`, color: item.nivel.cor }}
                      >
                        {item.quantidade}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {item.percentual.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={item.percentual} 
                    className="h-2"
                    style={{ 
                      backgroundColor: `${item.nivel.cor}20`,
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Conquistas Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Conquistas Recentes
              </CardTitle>
              <CardDescription>
                Últimas medalhas e conquistas obtidas pelos voluntários
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conquistasRecentes.length > 0 ? (
                <div className="space-y-3">
                  {conquistasRecentes.slice(0, 8).map((conquista) => (
                    <div key={conquista.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                      <div 
                        className="p-2 rounded-full"
                        style={{ backgroundColor: `${conquista.conquista?.cor}20` }}
                      >
                        <Award 
                          className="h-4 w-4" 
                          style={{ color: conquista.conquista?.cor }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conquista.conquista?.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conquista.voluntario?.nome} • {new Date(conquista.data_obtencao).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma conquista recente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades principais do módulo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <Link to="/voluntarios/gestao">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Users className="h-6 w-6" />
                  <span>Gerir Voluntários</span>
                </Button>
              </Link>

              <Link to="/voluntarios/novo">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Plus className="h-6 w-6" />
                  <span>Novo Voluntário</span>
                </Button>
              </Link>

              <Link to="/voluntarios/formacao">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Award className="h-6 w-6" />
                  <span>Gestão Formação</span>
                </Button>
              </Link>

              <Link to="/voluntarios/relatorios">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Relatórios</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoluntariosDashboard;