import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart,
  PawPrint,
  Users,
  Stethoscope,
  DollarSign,
  Plus,
  Eye,
  FileText,
  Settings,
  Archive,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
  UserPlus,
  BarChart3,
  BookOpen,
  Navigation
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  animaisCriticos: number;
  totalVoluntarios: number;
  totalIntervencoes: number;
  saldoFinanceiro: number;
  tendenciaAnimais: number;
  tendenciaFinanceira: number;
  ultimasIntervencoes: any[];
  proximosEventos: any[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Buscar dados em paralelo
      const [
        animaisData,
        intervencoesData,
        eventosData,
        movimentosData,
        voluntariosData
      ] = await Promise.all([
        supabase.from('animais').select('*').is('data_arquivamento', null),
        supabase.from('intervencoes').select('*, animais(nome)').order('data_intervencao', { ascending: false }).limit(5),
        supabase.from('eventos').select('*, animais(nome)').order('data_evento', { ascending: false }).limit(5),
        supabase.from('movimentos_financeiros').select('*'),
        supabase.from('voluntarios').select('*').eq('ativo', true)
      ]);

      const animais = animaisData.data || [];
      const intervencoes = intervencoesData.data || [];
      const eventos = eventosData.data || [];
      const movimentos = movimentosData.data || [];
      const voluntarios = voluntariosData.data || [];

      // Calcular estatísticas
      const hoje = new Date();
      const mesPassado = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const animaisRecentes = animais.filter(a => new Date(a.data_entrada) > mesPassado).length;
      const saldoAtual = movimentos.reduce((acc, m) => 
        acc + (m.tipo === 'receita' ? m.valor : -m.valor), 0
      );
      
      const movimentosRecentes = movimentos.filter(m => new Date(m.data_movimento) > mesPassado);
      const saldoRecente = movimentosRecentes.reduce((acc, m) => 
        acc + (m.tipo === 'receita' ? m.valor : -m.valor), 0
      );

      const statsData: DashboardStats = {
        totalAnimais: animais.length,
        animaisAtivos: animais.filter(a => a.estado === 'Ativo').length,
        animaisAdotados: animais.filter(a => a.estado === 'Adotado').length,
        animaisCriticos: animais.filter(a => a.estado === 'Crítico').length,
        totalVoluntarios: voluntarios.length,
        totalIntervencoes: intervencoes.length,
        saldoFinanceiro: saldoAtual,
        tendenciaAnimais: animaisRecentes,
        tendenciaFinanceira: saldoRecente,
        ultimasIntervencoes: intervencoes,
        proximosEventos: eventos.filter(e => new Date(e.data_evento) > hoje).slice(0, 3)
      };

      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
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
          <div className="relative mb-6">
            <Heart className="h-16 w-16 animate-pulse mx-auto mb-4 text-orange-500" />
            <div className="absolute inset-0 h-16 w-16 mx-auto border-2 border-orange-300 rounded-full animate-ping"></div>
          </div>
          <p className="text-xl font-bold text-orange-800 mb-2">Carregando Sistema</p>
          <p className="text-orange-600">Valentão Operacionais</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      <UserHeader 
        title="Dashboard Principal" 
        description="Centro de Controlo - Valentão Operacionais"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 🚨 ALERTAS CRÍTICOS */}
        {(stats?.animaisCriticos || 0) > 0 && (
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                  <CardTitle className="text-red-800 font-bold">Atenção Necessária</CardTitle>
                </div>
                <Badge variant="destructive" className="animate-pulse">
                  {stats.animaisCriticos} Críticos
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                Existem {stats.animaisCriticos} animais em estado crítico que necessitam de atenção imediata.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 📊 ESTATÍSTICAS PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total de Animais */}
          <Card className="animal-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">
                Total de Animais
              </CardTitle>
              <PawPrint className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats?.totalAnimais || 0}</div>
              <div className="flex items-center text-xs text-orange-600 mt-1">
                {(stats?.tendenciaAnimais || 0) > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{stats?.tendenciaAnimais} este mês
                  </>
                ) : (
                  <span>Sem alterações</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Animais Ativos */}
          <Card className="animal-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Animais Ativos
              </CardTitle>
              <Heart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats?.animaisAtivos || 0}</div>
              <Progress 
                value={((stats?.animaisAtivos || 0) / (stats?.totalAnimais || 1)) * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          {/* Voluntários */}
          <Card className="animal-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Voluntários Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats?.totalVoluntarios || 0}</div>
              <p className="text-xs text-blue-600 mt-1">Equipa dedicada</p>
            </CardContent>
          </Card>

          {/* Recursos Financeiros */}
          <Card className="animal-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Recursos Disponíveis
              </CardTitle>
              <DollarSign className={`h-4 w-4 ${
                (stats?.saldoFinanceiro || 0) >= 0 ? 'text-green-500' : 'text-red-500'
              }`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (stats?.saldoFinanceiro || 0) >= 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                {formatCurrency(stats?.saldoFinanceiro || 0)}
              </div>
              <div className="flex items-center text-xs mt-1">
                {(stats?.tendenciaFinanceira || 0) > 0 ? (
                  <span className="text-green-600">Tendência positiva</span>
                ) : (stats?.tendenciaFinanceira || 0) < 0 ? (
                  <span className="text-red-600">Requer atenção</span>
                ) : (
                  <span className="text-gray-600">Estável</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🎯 AÇÕES RÁPIDAS E ATIVIDADE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Ações Rápidas */}
          <div className="lg:col-span-1">
            <Card className="animal-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <Heart className="h-5 w-5 text-orange-500" />
                  <span>Ações Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                {hasPermission('create') && (
                  <Button asChild className="w-full animal-button">
                    <Link to="/novo-animal">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Animal
                    </Link>
                  </Button>
                )}

                <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white">
                  <Link to="/animais">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Animais
                  </Link>
                </Button>

                <Button asChild className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white">
                  <Link to="/intervencoes">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Intervenções
                  </Link>
                </Button>

                <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white">
                  <Link to="/financeiro">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Financeiro
                  </Link>
                </Button>

                {hasPermission('admin') && (
                  <Button asChild className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white">
                    <Link to="/administracao">
                      <Shield className="h-4 w-4 mr-2" />
                      Administração
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Atividade Recente */}
          <div className="lg:col-span-2">
            <Card className="animal-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <Activity className="h-5 w-5 text-orange-500" />
                  <span>Atividade Recente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.ultimasIntervencoes?.slice(0, 4).map((intervencao, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="font-medium text-orange-900">
                            {intervencao.animais?.nome || 'Animal'}
                          </div>
                          <div className="text-sm text-orange-600">
                            {intervencao.tipo_intervencao}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-orange-500">
                        {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                  ))}
                  
                  {(!stats?.ultimasIntervencoes || stats.ultimasIntervencoes.length === 0) && (
                    <div className="text-center py-6 text-orange-400">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma atividade recente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 🏠 MÓDULOS DO SISTEMA */}
        <Card className="animal-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <Navigation className="h-5 w-5 text-orange-500" />
              <span>Módulos do Sistema</span>
            </CardTitle>
            <CardDescription className="text-orange-600">
              Acesso completo a todas as funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Gestão de Animais */}
              <div className="text-center p-6 rounded-xl warm-card hover:shadow-md transition-all duration-200">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PawPrint className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-orange-800 mb-2">Gestão de Animais</h3>
                <p className="text-sm text-orange-600 mb-4">Registo e acompanhamento</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full border-orange-200 hover:bg-orange-50">
                    <Link to="/animais">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Animais
                    </Link>
                  </Button>
                  {hasPermission('create') && (
                    <Button asChild variant="outline" size="sm" className="w-full border-orange-200 hover:bg-orange-50">
                      <Link to="/novo-animal">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Animal
                      </Link>
                    </Button>
                  )}
                  {hasPermission('admin') && (
                    <Button asChild variant="outline" size="sm" className="w-full border-gray-200 hover:bg-gray-50">
                      <Link to="/animais-arquivados">
                        <Archive className="h-4 w-4 mr-2" />
                        Arquivados
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm" className="w-full border-orange-200 hover:bg-orange-50">
                    <Link to="/grupos">
                      <Users className="h-4 w-4 mr-2" />
                      Matilhas e Colónias
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Cuidados Médicos */}
              <div className="text-center p-6 rounded-xl nature-card hover:shadow-md transition-all duration-200">
                <div className="bg-gradient-to-br from-green-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-green-800 mb-2">Cuidados Médicos</h3>
                <p className="text-sm text-green-600 mb-4">Intervenções e tratamentos</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full border-green-200 hover:bg-green-50">
                    <Link to="/intervencoes">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Intervenções
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full border-blue-200 hover:bg-blue-50">
                    <Link to="/eventos">
                      <Calendar className="h-4 w-4 mr-2" />
                      Eventos
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Gestão de Pessoas */}
              <div className="text-center p-6 rounded-xl warm-card hover:shadow-md transition-all duration-200">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-blue-800 mb-2">Gestão de Pessoas</h3>
                <p className="text-sm text-blue-600 mb-4">Voluntários e utilizadores</p>
                <div className="space-y-2">
                  {hasPermission('admin') && (
                    <>
                      <Button asChild variant="outline" size="sm" className="w-full border-blue-200 hover:bg-blue-50">
                        <Link to="/voluntarios">
                          <Users className="h-4 w-4 mr-2" />
                          Voluntários
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full border-purple-200 hover:bg-purple-50">
                        <Link to="/utilizadores">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Utilizadores
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Administração */}
              <div className="text-center p-6 rounded-xl nature-card hover:shadow-md transition-all duration-200">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-purple-800 mb-2">Administração</h3>
                <p className="text-sm text-purple-600 mb-4">Relatórios e configurações</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full border-emerald-200 hover:bg-emerald-50">
                    <Link to="/dashboard-rico">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard Rico
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full border-purple-200 hover:bg-purple-50">
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
                  {hasPermission('admin') && (
                    <Button asChild variant="outline" size="sm" className="w-full border-red-200 hover:bg-red-50">
                      <Link to="/administracao">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm" className="w-full border-teal-200 hover:bg-teal-50">
                    <Link to="/manual">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manual
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 📈 RESUMO OPERACIONAL */}
        <Card className="animal-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-orange-800">Sistema Operacional</CardTitle>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Todos os sistemas ativos
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="text-2xl font-bold text-orange-800">{stats?.totalAnimais || 0}</div>
                <div className="text-sm text-orange-600">Animais</div>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="text-2xl font-bold text-green-800">{stats?.totalIntervencoes || 0}</div>
                <div className="text-sm text-green-600">Intervenções</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-2xl font-bold text-blue-800">{stats?.totalVoluntarios || 0}</div>
                <div className="text-sm text-blue-600">Voluntários</div>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className={`text-2xl font-bold ${
                  (stats?.saldoFinanceiro || 0) >= 0 ? 'text-green-800' : 'text-red-800'
                }`}>
                  {formatCurrency(stats?.saldoFinanceiro || 0)}
                </div>
                <div className="text-sm text-purple-600">Recursos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;