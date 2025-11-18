import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search,
  Monitor,
  Download,
  Upload,
  Printer,
  RefreshCw,
  Maximize2,
  Grid3X3,
  List,
  Filter,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats, PerfilUsuario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const DesktopDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [perfilUsuario] = useState<PerfilUsuario>('admin');
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
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

  const handleKeyboardShortcut = (e: KeyboardEvent) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case 'n':
          e.preventDefault();
          window.location.href = '#/novo-animal';
          break;
        case 'f':
          e.preventDefault();
          document.getElementById('global-search')?.focus();
          break;
        case 'r':
          e.preventDefault();
          fetchDashboardStats();
          break;
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar sistema desktop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Desktop */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Título */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/images/BackgroundEraser_20250411_205630024.png" 
                  alt="Valentão ao Resgate" 
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 flex items-center">
                    <Monitor className="h-5 w-5 mr-2 text-blue-600" />
                    Valentão Desktop
                  </h1>
                  <p className="text-sm text-gray-500">Sistema de Gestão Profissional</p>
                </div>
              </div>
            </div>

            {/* Barra de Pesquisa Global */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="global-search"
                  placeholder="Pesquisa global... (Ctrl+F)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </div>

            {/* Ações e Utilizador */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={fetchDashboardStats} title="Atualizar (Ctrl+R)">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Notificações">
                <Bell className="h-4 w-4" />
                <Badge className="ml-1 bg-red-500 text-white text-xs">3</Badge>
              </Button>
              <Button variant="ghost" size="sm" title="Modo Tela Cheia (F11)">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {perfilUsuario === 'admin' ? 'Administrador' : 
                 perfilUsuario === 'edicao' ? 'Editor' : 'Consulta'}
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/configuracoes">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar de Ações Rápidas */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/novo-animal">
                <Plus className="h-4 w-4 mr-2" />
                Novo Animal (Ctrl+N)
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/animais">
                <PawPrint className="h-4 w-4 mr-2" />
                Gestão de Animais
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/intervencoes">
                <Activity className="h-4 w-4 mr-2" />
                Intervenções
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/relatorios">
                <FileText className="h-4 w-4 mr-2" />
                Relatórios
              </Link>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-6">
        {/* Estatísticas Principais - Layout Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Animais Ativos</p>
                  <p className="text-2xl font-bold">{stats?.animais_ativos || 0}</p>
                </div>
                <PawPrint className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Adotados</p>
                  <p className="text-2xl font-bold">{stats?.animais_adotados || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Voluntários</p>
                  <p className="text-2xl font-bold">{stats?.voluntarios_ativos || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Saldo</p>
                  <p className="text-2xl font-bold">
                    €{stats?.saldo_atual?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Intervenções</p>
                  <p className="text-2xl font-bold">{stats?.intervencoes_mes || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Adoções/Mês</p>
                  <p className="text-2xl font-bold">{stats?.adocoes_mes || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layout Principal Desktop com Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="animais" className="flex items-center space-x-2">
              <PawPrint className="h-4 w-4" />
              <span>Animais</span>
            </TabsTrigger>
            <TabsTrigger value="intervencoes" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Intervenções</span>
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Gráfico de Animais por Estado */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <span>Distribuição de Animais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Ativos</span>
                      </div>
                      <span className="font-bold text-green-600">{stats?.animais_ativos || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Adotados</span>
                      </div>
                      <span className="font-bold text-blue-600">{stats?.animais_adotados || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resumo Financeiro */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5 text-green-600" />
                    <span>Resumo Financeiro</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-800">Receitas</span>
                      <span className="font-bold text-green-600">
                        €{stats?.total_receitas?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="font-medium text-red-800">Despesas</span>
                      <span className="font-bold text-red-600">
                        €{stats?.total_despesas?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-800">Saldo</span>
                      <span className="font-bold text-blue-600">
                        €{stats?.saldo_atual?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Acesso direto às funcionalidades mais utilizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button asChild variant="outline" className="h-16 flex-col">
                      <Link to="/novo-animal">
                        <Plus className="h-6 w-6 mb-2" />
                        Novo Animal
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-16 flex-col">
                      <Link to="/animais">
                        <Eye className="h-6 w-6 mb-2" />
                        Ver Animais
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-16 flex-col">
                      <Link to="/voluntarios">
                        <Users className="h-6 w-6 mb-2" />
                        Voluntários
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-16 flex-col">
                      <Link to="/relatorios">
                        <FileText className="h-6 w-6 mb-2" />
                        Relatórios
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Outras tabs serão implementadas conforme necessário */}
          <TabsContent value="animais">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Animais</CardTitle>
                <CardDescription>
                  Interface integrada para gestão completa de animais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 mb-4">Interface de gestão de animais</p>
                  <Button asChild>
                    <Link to="/animais">Abrir Gestão de Animais</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intervencoes">
            <Card>
              <CardHeader>
                <CardTitle>Intervenções Médicas</CardTitle>
                <CardDescription>
                  Gestão completa de intervenções e procedimentos médicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 mb-4">Sistema de intervenções médicas</p>
                  <Button asChild>
                    <Link to="/intervencoes">Abrir Intervenções</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro">
            <Card>
              <CardHeader>
                <CardTitle>Gestão Financeira</CardTitle>
                <CardDescription>
                  Controlo completo de receitas, despesas e movimentos financeiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 mb-4">Sistema financeiro integrado</p>
                  <Button asChild>
                    <Link to="/financeiro">Abrir Gestão Financeira</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Análises</CardTitle>
                <CardDescription>
                  Relatórios detalhados e análises estatísticas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 mb-4">Sistema de relatórios avançados</p>
                  <Button asChild>
                    <Link to="/relatorios">Abrir Relatórios</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Status Bar Desktop */}
      <div className="bg-gray-800 text-white px-6 py-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Sistema Online</span>
            </span>
            <span>Última atualização: {new Date().toLocaleTimeString('pt-PT')}</span>
            <span>Utilizador: {perfilUsuario}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Ctrl+N: Novo Animal</span>
            <span>Ctrl+F: Pesquisar</span>
            <span>Ctrl+R: Atualizar</span>
            <span>F11: Tela Cheia</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopDashboard;