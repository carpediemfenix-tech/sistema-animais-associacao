import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  PlusCircle, 
  Users, 
  Euro, 
  BarChart3, 
  Settings,
  Search,
  Bell,
  Calendar,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfilUsuario] = useState<'consulta' | 'edicao' | 'admin'>('edicao'); // Por agora, perfil de edição
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas básicas
      const { data: animais, error: animaisError } = await supabase
        .from('animais')
        .select('*');

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
        .select('*')
        .gte('data_intervencao', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

      if (intervencoesError) throw intervencoesError;

      // Calcular estatísticas
      const animaisAtivos = animais?.filter(a => !a.arquivado && a.estado === 'Ativo').length || 0;
      const animaisAdotados = animais?.filter(a => a.estado === 'Adotado').length || 0;
      const voluntariosAtivos = voluntarios?.filter(v => v.ativo).length || 0;
      
      const totalReceitas = movimentos?.filter(m => m.tipo_movimento === 'Receita').reduce((sum, m) => sum + m.valor, 0) || 0;
      const totalDespesas = movimentos?.filter(m => m.tipo_movimento === 'Despesa').reduce((sum, m) => sum + m.valor, 0) || 0;
      
      const adocoesMes = animais?.filter(a => {
        if (!a.data_adocao) return false;
        const dataAdocao = new Date(a.data_adocao);
        const agora = new Date();
        return dataAdocao.getMonth() === agora.getMonth() && dataAdocao.getFullYear() === agora.getFullYear();
      }).length || 0;

      setStats({
        animais_ativos: animaisAtivos,
        animais_adotados: animaisAdotados,
        animais_disponiveis: animaisAtivos,
        voluntarios_ativos: voluntariosAtivos,
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        saldo_atual: totalReceitas - totalDespesas,
        intervencoes_mes: intervencoes?.length || 0,
        adocoes_mes: adocoesMes
      });

    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/images/BackgroundEraser_20250411_205630024.png" 
                alt="Valentão ao Resgate" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Valentão ao Resgate</h1>
                <p className="text-sm text-gray-500">Sistema de Gestão v2.0</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {perfilUsuario === 'admin' ? 'Administrador' : 
                 perfilUsuario === 'edicao' ? 'Editor' : 'Consulta'}
              </Badge>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Animais Ativos</p>
                  <p className="text-3xl font-bold">{stats?.animais_ativos || 0}</p>
                  <p className="text-blue-100 text-xs">Disponíveis para adoção</p>
                </div>
                <Heart className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Adoções</p>
                  <p className="text-3xl font-bold">{stats?.animais_adotados || 0}</p>
                  <p className="text-green-100 text-xs">Total de sucessos</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Voluntários</p>
                  <p className="text-3xl font-bold">{stats?.voluntarios_ativos || 0}</p>
                  <p className="text-purple-100 text-xs">Ativos no sistema</p>
                </div>
                <Users className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Saldo</p>
                  <p className="text-3xl font-bold">€{stats?.saldo_atual?.toFixed(2) || '0.00'}</p>
                  <p className="text-orange-100 text-xs">Situação financeira</p>
                </div>
                <Euro className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas do Mês */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Intervenções (Mês)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.intervencoes_mes || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Adoções (Mês)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.adocoes_mes || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Alertas</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {perfilUsuario !== 'consulta' && (
              <Button asChild className="h-20 bg-blue-600 hover:bg-blue-700">
                <Link to="/novo-animal" className="flex flex-col items-center space-y-2">
                  <PlusCircle className="h-6 w-6" />
                  <span>Novo Animal</span>
                </Link>
              </Button>
            )}
            
            <Button asChild variant="outline" className="h-20">
              <Link to="/animais" className="flex flex-col items-center space-y-2">
                <Search className="h-6 w-6" />
                <span>Ver Animais</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20">
              <Link to="/dashboard" className="flex flex-col items-center space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>Dashboard</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20">
              <Link to="/voluntarios" className="flex flex-col items-center space-y-2">
                <Users className="h-6 w-6" />
                <span>Voluntários</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Módulos do Sistema */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <span>Gestão de Animais</span>
                </CardTitle>
                <CardDescription>
                  Cadastro, acompanhamento e gestão completa dos animais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button asChild size="sm">
                    <Link to="/animais">Ver Lista</Link>
                  </Button>
                  {perfilUsuario !== 'consulta' && (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/novo-animal">Cadastrar</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Intervenções Médicas</span>
                </CardTitle>
                <CardDescription>
                  Histórico médico, tratamentos e acompanhamento veterinário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button asChild size="sm">
                    <Link to="/intervencoes">Ver Histórico</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Voluntários</span>
                </CardTitle>
                <CardDescription>
                  Gestão da equipa de voluntários e especialidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button asChild size="sm">
                    <Link to="/voluntarios">Ver Equipa</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Euro className="h-5 w-5 text-orange-600" />
                  <span>Gestão Financeira</span>
                </CardTitle>
                <CardDescription>
                  Controlo de receitas, despesas e movimentos financeiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button asChild size="sm">
                    <Link to="/financeiro">Ver Finanças</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <span>Relatórios</span>
                </CardTitle>
                <CardDescription>
                  Análises, estatísticas e relatórios detalhados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button asChild size="sm">
                    <Link to="/relatorios">Ver Relatórios</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <span>Eventos & Alertas</span>
                </CardTitle>
                <CardDescription>
                  Gestão de eventos, lembretes e notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button asChild size="sm">
                    <Link to="/eventos">Ver Eventos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;