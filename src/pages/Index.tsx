import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PawPrint, 
  Users, 
  Activity, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Settings, 
  Bell, 
  Plus, 
  Eye, 
  DollarSign,
  Heart,
  Home,
  Stethoscope,
  MapPin,
  UserPlus,
  BarChart3,
  Sparkles,
  LogOut,
  Archive,
  Users,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats, PerfilUsuario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import AgendaDashboard from "@/components/AgendaDashboard";
import SistemaLembretes from "@/components/SistemaLembretes";

const Index = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfilUsuario] = useState<PerfilUsuario>('edicao');
  const { toast } = useToast();
  const { logout, hasPermission } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas básicas
      const { data: animais, error: animaisError } = await supabase
        .from('animais')
        .select('*')
        .eq('arquivado', false); // Excluir animais arquivados das estatísticas

      if (animaisError) throw animaisError;

      const { data: voluntarios, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('*');

      if (voluntariosError) throw voluntariosError;

      const { data: movimentos, error: movimentosError } = await supabase
        .from('movimentos_financeiros')
        .select('*');

      if (movimentosError) throw movimentosError;

      const { data: intervencoes, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select('*');

      if (intervencoesError) throw intervencoesError;

      // Calcular estatísticas
      const totalAnimais = animais?.length || 0;
      const animaisAtivos = animais?.filter(a => a.estado === 'Ativo').length || 0;
      const animaisAdotados = animais?.filter(a => a.estado === 'Adotado').length || 0;
      const totalVoluntarios = voluntarios?.filter(v => v.ativo).length || 0;
      const totalIntervencoes = intervencoes?.length || 0;

      // Calcular saldo financeiro
      const receitas = movimentos?.filter(m => m.tipo_movimento === 'Receita').reduce((sum, m) => sum + (m.valor || 0), 0) || 0;
      const despesas = movimentos?.filter(m => m.tipo_movimento === 'Despesa').reduce((sum, m) => sum + (m.valor || 0), 0) || 0;
      const saldoFinanceiro = receitas - despesas;

      setStats({
        totalAnimais,
        animaisAtivos,
        animaisAdotados,
        totalVoluntarios,
        totalIntervencoes,
        saldoFinanceiro,
        intervencoesRecentes: totalIntervencoes
      });

    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as estatísticas do dashboard",
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="h-16 w-16 animate-bounce mx-auto mb-4 text-orange-500" />
          <p className="text-lg text-gray-600">A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      {/* 🎨 Header Redesenhado */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              {/* Logotipo da Associação Valentão */}
              <div className="flex items-center space-x-3">
                <img 
                  src="./images/BackgroundEraser_20250411_205630024.png" 
                  alt="Associação Valentão" 
                  className="h-12 w-auto object-contain drop-shadow-md"
                />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                    Sistema Valentão
                  </h1>
                  <p className="text-sm text-gray-600">Gestão de Animais da Associação</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hover:bg-orange-100">
                <Bell className="h-5 w-5 text-orange-600" />
              </Button>
              <Button variant="ghost" size="sm" asChild className="hover:bg-orange-100">
                <Link to="/configuracoes">
                  <Settings className="h-5 w-5 text-orange-600" />
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="hover:bg-red-100 text-red-600 hover:text-red-700"
                title="Terminar Sessão"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 📊 Cards de Estatísticas Temáticos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Animais */}
          <Card className="animal-card hover-lift border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Animais</CardTitle>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats?.totalAnimais || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600 font-medium">{stats?.animaisAtivos || 0} ativos</span>
                {" • "}
                <span className="text-blue-600 font-medium">{stats?.animaisAdotados || 0} adotados</span>
              </p>
            </CardContent>
          </Card>

          {/* Voluntários */}
          <Card className="animal-card hover-lift border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Voluntários Ativos</CardTitle>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.totalVoluntarios || 0}</div>
              <p className="text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Equipa dedicada
              </p>
            </CardContent>
          </Card>

          {/* Intervenções */}
          <Card className="animal-card hover-lift border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Intervenções</CardTitle>
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.totalIntervencoes || 0}</div>
              <p className="text-xs text-blue-500 mt-1">
                <Activity className="h-3 w-3 inline mr-1" />
                Cuidados médicos
              </p>
            </CardContent>
          </Card>

          {/* Saldo Financeiro */}
          <Card className="animal-card hover-lift border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Financeiro</CardTitle>
              <div className={`bg-gradient-to-br p-2 rounded-lg ${
                (stats?.saldoFinanceiro || 0) >= 0 
                  ? 'from-emerald-500 to-green-500' 
                  : 'from-red-500 to-pink-500'
              }`}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${
                (stats?.saldoFinanceiro || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(stats?.saldoFinanceiro || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <Sparkles className="h-3 w-3 inline mr-1" />
                Balanço atual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 📅 Agenda e Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Agenda */}
          <div className="lg:col-span-1">
            <AgendaDashboard />
          </div>

          {/* Ações Rápidas */}
          <div className="lg:col-span-2">
            <Card className="animal-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  <span>Ações Rápidas</span>
                </CardTitle>
                <CardDescription>
                  Acesso rápido às funcionalidades principais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Novo Animal */}
                  <Button 
                    asChild 
                    className="btn-animal-primary h-20 flex-col space-y-2 hover-lift"
                  >
                    <Link to="/novo-animal">
                      <Plus className="h-6 w-6" />
                      <span className="text-sm font-medium">Novo Animal</span>
                    </Link>
                  </Button>

                  {/* Ver Animais */}
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 hover-lift border-orange-200 hover:bg-orange-50"
                  >
                    <Link to="/animais">
                      <Eye className="h-6 w-6 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">Ver Animais</span>
                    </Link>
                  </Button>

                  {/* Voluntários - Apenas Administradores */}
                  {hasPermission('admin') && (
                    <Button 
                      asChild 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 hover-lift border-green-200 hover:bg-green-50"
                    >
                      <Link to="/voluntarios">
                        <UserPlus className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Voluntários</span>
                      </Link>
                    </Button>
                  )}

                  {/* Intervenções */}
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 hover-lift border-blue-200 hover:bg-blue-50"
                  >
                    <Link to="/intervencoes">
                      <Stethoscope className="h-6 w-6 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Intervenções</span>
                    </Link>
                  </Button>

                  {/* Financeiro */}
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 hover-lift border-purple-200 hover:bg-purple-50"
                  >
                    <Link to="/financeiro">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">Financeiro</span>
                    </Link>
                  </Button>

                  {/* Relatórios */}
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 hover-lift border-indigo-200 hover:bg-indigo-50"
                  >
                    <Link to="/relatorios">
                      <BarChart3 className="h-6 w-6 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-600">Relatórios</span>
                    </Link>
                  </Button>
                  
                  {/* Gestão de Utilizadores - Apenas para Administradores */}
                  {hasPermission('admin') && (
                    <Button 
                      asChild 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 hover-lift border-emerald-200 hover:bg-emerald-50"
                    >
                      <Link to="/utilizadores">
                        <UserPlus className="h-6 w-6 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-600">Utilizadores</span>
                      </Link>
                    </Button>
                  )}

                  {/* Manual do Utilizador */}
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 hover-lift border-teal-200 hover:bg-teal-50"
                  >
                    <Link to="/manual">
                      <BookOpen className="h-6 w-6 text-teal-600" />
                      <span className="text-sm font-medium text-teal-600">Manual</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 🏠 Módulos do Sistema */}
        <Card className="animal-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Home className="h-5 w-5 text-orange-500" />
              <span>Módulos do Sistema</span>
            </CardTitle>
            <CardDescription>
              Acesso completo a todas as funcionalidades do sistema de gestão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Gestão de Animais */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-100 to-yellow-100 hover-lift">
                <div className="bg-gradient-to-br from-orange-500 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PawPrint className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Gestão de Animais</h3>
                <p className="text-sm text-gray-600 mb-4">Registo, acompanhamento e histórico completo</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full border-orange-200 hover:bg-orange-50">
                    <Link to="/animais">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Animais
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="w-full btn-animal-primary">
                    <Link to="/novo-animal">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Animal
                    </Link>
                  </Button>
                  
                  {/* Botão Animais Arquivados - Apenas Administradores */}
                  {hasPermission('admin') && (
                    <Button asChild variant="outline" size="sm" className="w-full border-gray-300 text-gray-600 hover:bg-gray-50">
                      <Link to="/animais-arquivados">
                        <Archive className="h-4 w-4 mr-2" />
                        Arquivados
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Cuidados Médicos */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 hover-lift">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Cuidados Médicos</h3>
                <p className="text-sm text-gray-600 mb-4">Intervenções, vacinas e tratamentos</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full border-blue-200 hover:bg-blue-50">
                    <Link to="/intervencoes">
                      <Activity className="h-4 w-4 mr-2" />
                      Ver Intervenções
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full border-purple-200 hover:bg-purple-50">
                    <Link to="/eventos">
                      <Calendar className="h-4 w-4 mr-2" />
                      Eventos
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Gestão de Pessoas */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 hover-lift">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Gestão de Pessoas</h3>
                <p className="text-sm text-gray-600 mb-4">Voluntários e colaboradores</p>
                <div className="space-y-2">
                  {hasPermission('admin') && (
                    <Button asChild variant="outline" size="sm" className="w-full border-green-200 hover:bg-green-50">
                      <Link to="/voluntarios">
                        <Users className="h-4 w-4 mr-2" />
                        Voluntários
                      </Link>
                    </Button>
                  )}
                  {hasPermission('admin') && (
                    <Button asChild variant="outline" size="sm" className="w-full border-emerald-200 hover:bg-emerald-50">
                      <Link to="/utilizadores">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Utilizadores
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Gestão de Grupos */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 hover-lift">
                <div className="bg-gradient-to-br from-cyan-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Matilhas e Colónias</h3>
                <p className="text-sm text-gray-600 mb-4">Grupos de cães e gatos</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full border-cyan-200 hover:bg-cyan-50">
                    <Link to="/grupos">
                      <Users className="h-4 w-4 mr-2" />
                      Ver Grupos
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Administração */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-100 to-pink-100 hover-lift">
                <div className="bg-gradient-to-br from-indigo-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Administração</h3>
                <p className="text-sm text-gray-600 mb-4">Relatórios e gestão financeira</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full border-indigo-200 hover:bg-indigo-50">
                    <Link to="/relatorios">
                      <FileText className="h-4 w-4 mr-2" />
                      Relatórios
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full border-pink-200 hover:bg-pink-50">
                    <Link to="/financeiro">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Financeiro
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🔔 Sistema de Lembretes Inteligentes */}
        <Card className="animal-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Bell className="h-5 w-5 text-orange-500 animate-pulse" />
              <span>Lembretes Inteligentes</span>
            </CardTitle>
            <CardDescription>
              Sistema automático de alertas e lembretes para cuidados com os animais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SistemaLembretes />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;