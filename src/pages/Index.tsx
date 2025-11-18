import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint, Users, Activity, TrendingUp, Calendar, FileText, Settings, Bell, Plus, Eye, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats, PerfilUsuario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import AgendaDashboard from "@/components/AgendaDashboard";

const Index = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfilUsuario] = useState<PerfilUsuario>('edicao'); // Pode ser carregado do localStorage
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
        .select('*');

      if (intervencoesError) throw intervencoesError;

      // Calcular estatísticas
      const animaisAtivos = animais?.filter(a => a.estado === 'Ativo' && !a.arquivado).length || 0;
      const animaisAdotados = animais?.filter(a => a.estado === 'Adotado').length || 0;
      const voluntariosAtivos = voluntarios?.filter(v => v.ativo).length || 0;

      const totalReceitas = movimentos?.filter(m => m.tipo_movimento === 'Receita')
        .reduce((sum, m) => sum + (m.valor || 0), 0) || 0;
      const totalDespesas = movimentos?.filter(m => m.tipo_movimento === 'Despesa')
        .reduce((sum, m) => sum + (m.valor || 0), 0) || 0;

      // Intervenções do mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const intervencoesMes = intervencoes?.filter(i => 
        new Date(i.data_intervencao) >= inicioMes
      ).length || 0;

      // Adoções do mês atual
      const adocoesMes = animais?.filter(a => 
        a.data_adocao && new Date(a.data_adocao) >= inicioMes
      ).length || 0;

      setStats({
        animais_ativos: animaisAtivos,
        animais_adotados: animaisAdotados,
        animais_disponiveis: animaisAtivos,
        voluntarios_ativos: voluntariosAtivos,
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        saldo_atual: totalReceitas - totalDespesas,
        intervencoes_mes: intervencoesMes,
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
          <p className="text-lg text-gray-600">A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/images/BackgroundEraser_20250411_205630024.png" 
                alt="Valentão ao Resgate" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Valentão ao Resgate</h1>
                <p className="text-sm text-gray-500">Sistema de Gestão de Animais</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {perfilUsuario === 'admin' ? 'Administrador' : 
                 perfilUsuario === 'edicao' ? 'Editor' : 'Consulta'}
              </Badge>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/configuracoes">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Animais Ativos</p>
                  <p className="text-3xl font-bold">{stats?.animais_ativos || 0}</p>
                </div>
                <PawPrint className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Animais Adotados</p>
                  <p className="text-3xl font-bold">{stats?.animais_adotados || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Voluntários Ativos</p>
                  <p className="text-3xl font-bold">{stats?.voluntarios_ativos || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Saldo Atual</p>
                  <p className="text-3xl font-bold">
                    €{stats?.saldo_atual?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Mensais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Intervenções este Mês</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.intervencoes_mes || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Adoções este Mês</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.adocoes_mes || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NOVA SEÇÃO: Agenda e Módulos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Agenda - Ocupa 1 coluna */}
          <div className="lg:col-span-1">
            <AgendaDashboard />
          </div>

          {/* Ações Rápidas - Ocupa 2 colunas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <span>Ações Rápidas</span>
                </CardTitle>
                <CardDescription>
                  Acesso direto às funcionalidades mais utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button asChild className="h-20 flex-col space-y-2">
                    <Link to="/novo-animal">
                      <Plus className="h-6 w-6" />
                      <span className="text-sm">Novo Animal</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                    <Link to="/animais">
                      <PawPrint className="h-6 w-6" />
                      <span className="text-sm">Ver Animais</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                    <Link to="/intervencoes">
                      <Activity className="h-6 w-6" />
                      <span className="text-sm">Intervenções</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                    <Link to="/voluntarios">
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Voluntários</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                    <Link to="/financeiro">
                      <DollarSign className="h-6 w-6" />
                      <span className="text-sm">Financeiro</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                    <Link to="/relatorios">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Relatórios</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Módulos do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PawPrint className="h-6 w-6 text-blue-600" />
                <span>Gestão de Animais</span>
              </CardTitle>
              <CardDescription>
                Cadastro, edição e acompanhamento de animais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button asChild size="sm" className="flex-1">
                  <Link to="/animais">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Animais
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to="/novo-animal">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Animal
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-green-600" />
                <span>Intervenções Médicas</span>
              </CardTitle>
              <CardDescription>
                Histórico médico e procedimentos veterinários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button asChild size="sm" className="flex-1">
                  <Link to="/intervencoes">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Intervenções
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-600" />
                <span>Gestão de Voluntários</span>
              </CardTitle>
              <CardDescription>
                Cadastro e gestão da equipa de voluntários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button asChild size="sm" className="flex-1">
                  <Link to="/voluntarios">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Voluntários
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <span>Gestão Financeira</span>
              </CardTitle>
              <CardDescription>
                Controlo de receitas, despesas e movimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button asChild size="sm" className="flex-1">
                  <Link to="/financeiro">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Financeiro
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-indigo-600" />
                <span>Relatórios</span>
              </CardTitle>
              <CardDescription>
                Estatísticas e relatórios detalhados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button asChild size="sm" className="flex-1">
                  <Link to="/relatorios">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Relatórios
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-gray-600" />
                <span>Configurações</span>
              </CardTitle>
              <CardDescription>
                Configurações do sistema e perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button asChild size="sm" className="flex-1">
                  <Link to="/configuracoes">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;