import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart, 
  DollarSign, 
  Calendar,
  MapPin,
  Stethoscope,
  PieChart,
  Activity,
  Target,
  Award,
  UserCheck,
  Home,
  RefreshCw,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalAnimais: number;
  totalIntervencoes: number;
  totalEventos: number;
  totalLocalizacoes: number;
  totalResponsabilidades: number;
  totalVoluntarios: number;
}

interface CustosPorCategoria {
  categoria: string;
  total_custos: number;
  numero_registos: number;
}

interface TopAnimaisCustos {
  animal_id: string;
  nome: string;
  especie: string;
  total_intervencoes: number;
  custo_total: number;
}

const Dashboard: React.FC = () => {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [custosPorCategoria, setCustosPorCategoria] = useState<CustosPorCategoria[]>([]);
  const [topAnimaisCustos, setTopAnimaisCustos] = useState<TopAnimaisCustos[]>([]);
  const [custoTotalAssociacao, setCustoTotalAssociacao] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas gerais
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_estatisticas_gerais');

      if (!statsError && statsData && statsData.length > 0) {
        const stat = statsData[0];
        setStats({
          totalAnimais: stat.total_animais,
          totalIntervencoes: stat.total_intervencoes,
          totalEventos: stat.total_eventos,
          totalLocalizacoes: stat.total_localizacoes,
          totalResponsabilidades: stat.total_responsabilidades,
          totalVoluntarios: stat.total_voluntarios
        });
        console.log('✅ [DASHBOARD] Estatísticas carregadas:', stat);
      } else {
        console.log('ℹ️ [DASHBOARD] Erro ao carregar estatísticas:', statsError?.message);
      }

      // Carregar custos por categoria
      const { data: custosData, error: custosError } = await supabase
        .rpc('get_custos_por_categoria');

      if (!custosError && custosData) {
        setCustosPorCategoria(custosData);
        const total = custosData.reduce((sum: number, item: any) => sum + parseFloat(item.total_custos || 0), 0);
        setCustoTotalAssociacao(total);
        console.log('✅ [DASHBOARD] Custos por categoria carregados:', custosData.length);
      } else {
        console.log('ℹ️ [DASHBOARD] Erro ao carregar custos:', custosError?.message);
      }

      // Carregar top animais com maiores custos
      const { data: topAnimaisData, error: topAnimaisError } = await supabase
        .rpc('get_custos_intervencoes_por_animal');

      if (!topAnimaisError && topAnimaisData) {
        const topAnimais = topAnimaisData
          .filter((animal: any) => animal.custo_total > 0)
          .slice(0, 5);
        setTopAnimaisCustos(topAnimais);
        console.log('✅ [DASHBOARD] Top animais carregados:', topAnimais.length);
      } else {
        console.log('ℹ️ [DASHBOARD] Erro ao carregar top animais:', topAnimaisError?.message);
      }

    } catch (error) {
      console.error('💥 [DASHBOARD] Erro ao carregar dados:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os dados do dashboard",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title="📊 Dashboard de Estatísticas" 
        subtitle="Visão geral completa da Associação Valentão ao Resgate"
        backTo="/"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Botão de Atualizar */}
        <div className="flex justify-end">
          <Button 
            onClick={loadDashboardData}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar Dados</span>
          </Button>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
              <Heart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAnimais || 0}</div>
              <p className="text-xs text-blue-100">
                Animais registrados na associação
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intervenções Médicas</CardTitle>
              <Stethoscope className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalIntervencoes || 0}</div>
              <p className="text-xs text-green-100">
                Intervenções realizadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voluntários</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVoluntarios || 0}</div>
              <p className="text-xs text-purple-100">
                Voluntários registrados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(custoTotalAssociacao)}</div>
              <p className="text-xs text-orange-100">
                Custos acumulados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividades por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Atividades por Categoria</span>
              </CardTitle>
              <CardDescription>
                Distribuição das atividades da associação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Eventos da Vida</span>
                  </div>
                  <Badge className="bg-green-600">{stats?.totalEventos || 0}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Localizações</span>
                  </div>
                  <Badge className="bg-purple-600">{stats?.totalLocalizacoes || 0}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Responsabilidades</span>
                  </div>
                  <Badge className="bg-blue-600">{stats?.totalResponsabilidades || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custos por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-green-600" />
                <span>Custos por Categoria</span>
              </CardTitle>
              <CardDescription>
                Distribuição dos custos da associação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {custosPorCategoria.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum custo registrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {custosPorCategoria.map((categoria, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{categoria.categoria}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(categoria.total_custos)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {categoria.numero_registos} registos
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Animais com Maiores Custos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-orange-600" />
              <span>Top 5 - Animais com Maiores Custos Médicos</span>
            </CardTitle>
            <CardDescription>
              Animais que requerem mais investimento em cuidados médicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topAnimaisCustos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum animal com custos médicos</p>
                <p className="text-sm">Custos de intervenções aparecerão aqui quando registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topAnimaisCustos.map((animal, index) => (
                  <div key={animal.animal_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-orange-900">{animal.nome}</div>
                        <div className="text-sm text-orange-700">{animal.especie}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-orange-600">
                        {formatCurrency(animal.custo_total)}
                      </div>
                      <div className="text-sm text-orange-700">
                        {animal.total_intervencoes} intervenções
                      </div>
                      <Link to={`/animal/${animal.animal_id}`}>
                        <Button variant="ghost" size="sm" className="mt-1 text-orange-600 hover:text-orange-800">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo de Sistemas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Stethoscope className="h-5 w-5" />
                <span>Sistema Médico</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Intervenções Totais</span>
                  <Badge variant="outline">{stats?.totalIntervencoes || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Custo Médico Total</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(custosPorCategoria.find(c => c.categoria === 'Intervenções Médicas')?.total_custos || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Home className="h-5 w-5" />
                <span>Sistema de Localizações</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Localizações Totais</span>
                  <Badge variant="outline">{stats?.totalLocalizacoes || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tipos Disponíveis</span>
                  <Badge className="bg-purple-600">10</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <UserCheck className="h-5 w-5" />
                <span>Sistema de Responsabilidades</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Responsabilidades Ativas</span>
                  <Badge variant="outline">{stats?.totalResponsabilidades || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tipos Disponíveis</span>
                  <Badge className="bg-blue-600">10</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-gray-700" />
              <span>Acesso Rápido</span>
            </CardTitle>
            <CardDescription>
              Links diretos para as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/animais">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Ver Animais</span>
                </Button>
              </Link>
              
              <Link to="/dashboard-financeiro">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Dashboard Financeiro</span>
                </Button>
              </Link>
              
              <Link to="/voluntarios">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">Voluntários</span>
                </Button>
              </Link>
              
              <Link to="/administracao">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span className="text-sm">Administração</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          <p>📊 Dashboard atualizado em tempo real • 🐾 Associação Valentão ao Resgate</p>
          <p className="text-xs mt-1">Sistema de Gestão Completo - Desenvolvido com ❤️ para os animais</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;