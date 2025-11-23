import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Target, 
  Radar, 
  Command, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Settings, 
  Bell, 
  Plus, 
  Eye, 
  DollarSign,
  Crosshair,
  Zap,
  Stethoscope,
  MapPin,
  UserPlus,
  BarChart3,
  Radio,
  Archive,
  Users,
  BookOpen,
  Gauge,
  Satellite,
  Binoculars,
  Navigation,
  Compass
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Radar className="h-16 w-16 animate-spin mx-auto mb-4 text-green-400" />
            <div className="absolute inset-0 h-16 w-16 mx-auto border-2 border-green-400/30 rounded-full animate-ping"></div>
          </div>
          <p className="text-lg text-green-100 font-mono tracking-wider">CARREGANDO CENTRO DE COMANDO...</p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-green-900/20 tactical-grid">
      {/* Header Militar */}
      <UserHeader 
        title="CENTRO DE COMANDO - VALENTÃO OPERACIONAIS" 
        description="Sistema Tático de Gestão Animal"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 🎖️ STATUS OPERACIONAL */}
        <div className="mb-6">
          <div className="command-center p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Shield className="h-8 w-8 text-green-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="military-title text-xl">STATUS OPERACIONAL</h2>
                  <p className="tactical-text">Sistema Online • Todas as unidades ativas</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="military-badge">
                  <Radio className="h-3 w-3 mr-1" />
                  ATIVO
                </div>
                <div className="military-badge bg-gradient-to-r from-orange-600 to-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {stats?.animaisUrgentes || 0} URGENTES
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 🎖️ PAINEL DE CONTROLO TÁTICO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Unidades Totais */}
          <Card className="tactical-card tactical-hover tactical-enter">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-xs font-bold text-green-300 uppercase tracking-wider">UNIDADES TOTAIS</CardTitle>
                <div className="text-2xl font-bold text-green-100 mt-1">{stats?.totalAnimais || 0}</div>
              </div>
              <div className="relative">
                <Target className="h-8 w-8 text-green-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between text-xs">
                <span className="text-green-300 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  {stats?.animaisAtivos || 0} ATIVAS
                </span>
                <span className="text-blue-300 flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                  {stats?.animaisAdotados || 0} MISSÃO CUMPRIDA
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Operadores */}
          <Card className="tactical-card tactical-hover tactical-enter">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-xs font-bold text-green-300 uppercase tracking-wider">OPERADORES</CardTitle>
                <div className="text-2xl font-bold text-green-100 mt-1">{stats?.totalVoluntarios || 0}</div>
              </div>
              <div className="relative">
                <Users className="h-8 w-8 text-green-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-xs text-green-300">
                <Zap className="h-3 w-3 mr-1" />
                <span>EQUIPA TÁTICA ATIVA</span>
              </div>
            </CardContent>
          </Card>

          {/* Missões Médicas */}
          <Card className="tactical-card tactical-hover tactical-enter">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-xs font-bold text-blue-300 uppercase tracking-wider">MISSÕES MÉDICAS</CardTitle>
                <div className="text-2xl font-bold text-blue-100 mt-1">{stats?.totalIntervencoes || 0}</div>
              </div>
              <div className="relative">
                <Stethoscope className="h-8 w-8 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-xs text-blue-300">
                <Activity className="h-3 w-3 mr-1" />
                <span>OPERAÇÕES MÉDICAS</span>
              </div>
            </CardContent>
          </Card>

          {/* Recursos Financeiros */}
          <Card className="tactical-card tactical-hover tactical-enter">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-xs font-bold text-yellow-300 uppercase tracking-wider">RECURSOS</CardTitle>
                <div className={`text-2xl font-bold mt-1 ${
                  (stats?.saldoFinanceiro || 0) >= 0 ? 'text-green-100' : 'text-red-100'
                }`}>
                  {formatCurrency(stats?.saldoFinanceiro || 0)}
                </div>
              </div>
              <div className="relative">
                <DollarSign className={`h-8 w-8 ${
                  (stats?.saldoFinanceiro || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`} />
                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse ${
                  (stats?.saldoFinanceiro || 0) >= 0 ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`flex items-center text-xs ${
                (stats?.saldoFinanceiro || 0) >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                <Gauge className="h-3 w-3 mr-1" />
                <span>{(stats?.saldoFinanceiro || 0) >= 0 ? 'ORÇAMENTO POSITIVO' : 'ATENÇÃO NECESSÁRIA'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🎖️ CENTRO DE COMANDO E OPERAÇÕES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Radar de Atividades */}
          <div className="lg:col-span-1">
            <Card className="tactical-card h-full">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Radar className="h-5 w-5 text-green-400" />
                  <CardTitle className="military-title text-sm">RADAR DE ATIVIDADES</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <AgendaDashboard />
              </CardContent>
            </Card>
          </div>

          {/* Painel de Comando */}
          <div className="lg:col-span-2">
            <Card className="tactical-card h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Command className="h-5 w-5 text-green-400" />
                    <CardTitle className="military-title text-sm">PAINEL DE COMANDO</CardTitle>
                  </div>
                  <div className="military-badge text-xs">
                    <Satellite className="h-3 w-3 mr-1" />
                    OPERACIONAL
                  </div>
                </div>
                <CardDescription className="tactical-text">
                  Acesso rápido às operações críticas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Nova Unidade */}
                  {hasPermission('create') && (
                    <Button 
                      asChild 
                      className="tactical-button h-16 flex-col space-y-1 text-xs"
                    >
                      <Link to="/novo-animal">
                        <Plus className="h-5 w-5" />
                        <span className="font-semibold">NOVA UNIDADE</span>
                      </Link>
                    </Button>
                  )}

                  {/* Reconhecimento */}
                  <Button 
                    asChild 
                    className="tactical-button h-16 flex-col space-y-1 text-xs bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
                  >
                    <Link to="/animais">
                      <Binoculars className="h-5 w-5" />
                      <span className="font-semibold">RECONHECIMENTO</span>
                    </Link>
                  </Button>

                  {/* Operadores - Apenas Administradores */}
                  {hasPermission('admin') && (
                    <Button 
                      asChild 
                      className="tactical-button h-16 flex-col space-y-1 text-xs bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700"
                    >
                      <Link to="/voluntarios">
                        <Users className="h-5 w-5" />
                        <span className="font-semibold">OPERADORES</span>
                      </Link>
                    </Button>
                  )}

                  {/* Missões Médicas */}
                  <Button 
                    asChild 
                    className="tactical-button h-16 flex-col space-y-1 text-xs bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Link to="/intervencoes">
                      <Stethoscope className="h-5 w-5" />
                      <span className="font-semibold">MISSÕES MÉDICAS</span>
                    </Link>
                  </Button>

                  {/* Recursos */}
                  <Button 
                    asChild 
                    className="tactical-button h-16 flex-col space-y-1 text-xs bg-gradient-to-r from-yellow-700 to-yellow-800 hover:from-yellow-600 hover:to-yellow-700"
                  >
                    <Link to="/financeiro">
                      <DollarSign className="h-5 w-5" />
                      <span className="font-semibold">RECURSOS</span>
                    </Link>
                  </Button>

                  {/* Inteligência */}
                  <Button 
                    asChild 
                    className="tactical-button h-16 flex-col space-y-1 text-xs bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700"
                  >
                    <Link to="/relatorios">
                      <BarChart3 className="h-5 w-5" />
                      <span className="font-semibold">INTELIGÊNCIA</span>
                    </Link>
                  </Button>
                  
                  {/* Comando - Apenas para Administradores */}
                  {hasPermission('admin') && (
                    <Button 
                      asChild 
                      className="tactical-button h-16 flex-col space-y-1 text-xs bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700"
                    >
                      <Link to="/utilizadores">
                        <Shield className="h-5 w-5" />
                        <span className="font-semibold">COMANDO</span>
                      </Link>
                    </Button>
                  )}

                  {/* Manual Tático */}
                  <Button 
                    asChild 
                    className="tactical-button h-16 flex-col space-y-1 text-xs bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700"
                  >
                    <Link to="/manual">
                      <BookOpen className="h-5 w-5" />
                      <span className="font-semibold">MANUAL TÁTICO</span>
                    </Link>
                  </Button>

                  {/* Matilhas e Colónias */}
                  <Button 
                    asChild 
                    className="tactical-button h-16 flex-col space-y-1 text-xs bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700"
                  >
                    <Link to="/grupos">
                      <Navigation className="h-5 w-5" />
                      <span className="font-semibold">GRUPOS TÁCTICOS</span>
                    </Link>
                  </Button>

                  {/* Arquivados - Apenas Administradores */}
                  {hasPermission('admin') && (
                    <Button 
                      asChild 
                      className="tactical-button h-16 flex-col space-y-1 text-xs bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                    >
                      <Link to="/animais-arquivados">
                        <Archive className="h-5 w-5" />
                        <span className="font-semibold">ARQUIVO</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 🎖️ SISTEMA DE LEMBRETES TÁCTICOS */}
        <Card className="tactical-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-yellow-400 animate-pulse" />
              <CardTitle className="military-title text-sm">ALERTAS E LEMBRETES</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <SistemaLembretes />
          </CardContent>
        </Card>

        {/* 🎖️ MÓDULOS OPERACIONAIS */}
        <Card className="tactical-card mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="h-5 w-5 text-green-400" />
                <CardTitle className="military-title text-sm">MÓDULOS OPERACIONAIS</CardTitle>
              </div>
              <div className="military-badge text-xs">
                <Crosshair className="h-3 w-3 mr-1" />
                TODOS OS SISTEMAS
              </div>
            </div>
            <CardDescription className="tactical-text">
              Acesso completo a todas as operações do centro de comando
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gestão de Unidades */}
              <div className="tactical-card p-4 text-center tactical-hover">
                <div className="bg-gradient-to-br from-green-600 to-green-700 w-12 h-12 rounded flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="military-title text-sm mb-2">GESTÃO DE UNIDADES</h3>
                <p className="tactical-text text-xs mb-3">Registo, acompanhamento e histórico tático</p>
                <div className="space-y-1">
                  <Button asChild size="sm" className="w-full tactical-button text-xs h-8">
                    <Link to="/animais">
                      <Binoculars className="h-3 w-3 mr-1" />
                      RECONHECIMENTO
                    </Link>
                  </Button>
                  {hasPermission('create') && (
                    <Button asChild size="sm" className="w-full tactical-button text-xs h-8">
                      <Link to="/novo-animal">
                        <Plus className="h-3 w-3 mr-1" />
                        NOVA UNIDADE
                      </Link>
                    </Button>
                  )}
                  
                  {/* Arquivo - Apenas Administradores */}
                  {hasPermission('admin') && (
                    <Button asChild size="sm" className="w-full tactical-button text-xs h-8 bg-gradient-to-r from-gray-700 to-gray-800">
                      <Link to="/animais-arquivados">
                        <Archive className="h-3 w-3 mr-1" />
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

      </div>
    </div>
  );
};

export default Index;