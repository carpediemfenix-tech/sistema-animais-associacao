import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target,
  Zap,
  Activity,
  Calendar,
  Plus,
  Eye,
  Stethoscope,
  DollarSign,
  Users,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  BarChart3,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardMetrics {
  // Alertas Críticos
  animaisCriticos: number;
  intervencoesPendentes: number;
  alertasFinanceiros: number;
  lembretesDia: number;
  
  // Métricas Principais
  totalAnimais: number;
  animaisAtivos: number;
  tendenciaAnimais: number;
  totalIntervencoes: number;
  tendenciaIntervencoes: number;
  saldoFinanceiro: number;
  tendenciaFinanceira: number;
  totalVoluntarios: number;
  
  // Atividade Recente
  ultimasIntervencoes: any[];
  ultimosAnimais: any[];
  ultimosEventos: any[];
  
  // Próximos Passos
  proximasIntervencoes: any[];
  proximosEventos: any[];
  tarefasPendentes: any[];
}

const DashboardEficiente = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      
      // Buscar dados em paralelo para performance
      const [
        animaisData,
        intervencoesData,
        eventosData,
        movimentosData,
        voluntariosData
      ] = await Promise.all([
        supabase.from('animais').select('*').is('data_arquivamento', null),
        supabase.from('intervencoes').select('*, animais(nome, numero_processo)').order('data_intervencao', { ascending: false }),
        supabase.from('eventos').select('*, animais(nome, numero_processo)').order('data_evento', { ascending: false }),
        supabase.from('movimentos_financeiros').select('*').order('data_movimento', { ascending: false }),
        supabase.from('voluntarios').select('*').eq('ativo', true)
      ]);

      // Processar dados para métricas
      const animais = animaisData.data || [];
      const intervencoes = intervencoesData.data || [];
      const eventos = eventosData.data || [];
      const movimentos = movimentosData.data || [];
      const voluntarios = voluntariosData.data || [];

      // Calcular alertas críticos
      const hoje = new Date();
      const animaisCriticos = animais.filter(a => 
        a.estado === 'Crítico' || 
        (a.data_nascimento && new Date(a.data_nascimento) < new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000 * 15)) // Mais de 15 anos
      ).length;

      const intervencoesPendentes = intervencoes.filter(i => 
        i.data_intervencao && new Date(i.data_intervencao) <= hoje && !i.concluida
      ).length;

      const saldoAtual = movimentos.reduce((acc, m) => 
        acc + (m.tipo === 'receita' ? m.valor : -m.valor), 0
      );
      const alertasFinanceiros = saldoAtual < 0 ? 1 : 0;

      // Calcular tendências (comparar com mês anterior)
      const mesPassado = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      const animaisRecentes = animais.filter(a => new Date(a.data_entrada) > mesPassado).length;
      const intervencoesRecentes = intervencoes.filter(i => new Date(i.data_intervencao) > mesPassado).length;
      const movimentosRecentes = movimentos.filter(m => new Date(m.data_movimento) > mesPassado);
      const saldoRecente = movimentosRecentes.reduce((acc, m) => 
        acc + (m.tipo === 'receita' ? m.valor : -m.valor), 0
      );

      // Próximos eventos e intervenções
      const proximasIntervencoes = intervencoes
        .filter(i => new Date(i.data_intervencao) > hoje)
        .slice(0, 5);
      
      const proximosEventos = eventos
        .filter(e => new Date(e.data_evento) > hoje)
        .slice(0, 5);

      const metricsData: DashboardMetrics = {
        // Alertas Críticos
        animaisCriticos,
        intervencoesPendentes,
        alertasFinanceiros,
        lembretesDia: animaisCriticos + intervencoesPendentes + alertasFinanceiros,
        
        // Métricas Principais
        totalAnimais: animais.length,
        animaisAtivos: animais.filter(a => a.estado === 'Ativo').length,
        tendenciaAnimais: animaisRecentes,
        totalIntervencoes: intervencoes.length,
        tendenciaIntervencoes: intervencoesRecentes,
        saldoFinanceiro: saldoAtual,
        tendenciaFinanceira: saldoRecente,
        totalVoluntarios: voluntarios.length,
        
        // Atividade Recente
        ultimasIntervencoes: intervencoes.slice(0, 5),
        ultimosAnimais: animais.slice(0, 5),
        ultimosEventos: eventos.slice(0, 5),
        
        // Próximos Passos
        proximasIntervencoes,
        proximosEventos,
        tarefasPendentes: []
      };

      setMetrics(metricsData);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardMetrics();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-green-900/20 flex items-center justify-center mobile-container">
        <div className="text-center mobile-loading">
          <div className="relative mb-6">
            <Target className="h-12 w-12 md:h-16 md:w-16 animate-spin mx-auto mb-4 text-green-400" />
            <div className="absolute inset-0 h-12 w-12 md:h-16 md:w-16 mx-auto border-2 border-green-400/30 rounded-full animate-ping"></div>
          </div>
          <p className="mobile-title text-green-100 font-mono tracking-wider mb-2">CARREGANDO CENTRO DE COMANDO</p>
          <p className="mobile-text text-green-300 mb-4">Sistema Tático Operacional</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-green-900/20">
      {/* Header Mobile-Optimized */}
      <UserHeader 
        title="CENTRO DE COMANDO OPERACIONAL" 
        description="Dashboard Inteligente - Sistema Valentão"
      />

      <div className="mobile-container max-w-7xl mx-auto mobile-spacing">
        
        {/* 🚨 ZONA DE ALERTA CRÍTICO */}
        {(metrics?.animaisCriticos || 0) > 0 || (metrics?.intervencoesPendentes || 0) > 0 || (metrics?.alertasFinanceiros || 0) > 0 ? (
          <Card className="border-red-500/50 bg-gradient-to-r from-red-900/20 to-orange-900/20 shadow-lg mobile-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-400 animate-pulse" />
                  <CardTitle className="text-red-100 font-bold tracking-wider mobile-title">ALERTAS CRÍTICOS</CardTitle>
                </div>
                <Badge variant="destructive" className="animate-pulse self-start sm:self-center">
                  {metrics?.lembretesDia || 0} URGENTES
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mobile-grid gap-3">
                {(metrics?.animaisCriticos || 0) > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-800/30 rounded-lg border border-red-600/30 touch-feedback">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span className="text-red-100 font-medium mobile-text">Animais Críticos</span>
                    </div>
                    <Badge variant="destructive">{metrics.animaisCriticos}</Badge>
                  </div>
                )}
                
                {(metrics?.intervencoesPendentes || 0) > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-800/30 rounded-lg border border-orange-600/30 touch-feedback">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-orange-400" />
                      <span className="text-orange-100 font-medium mobile-text">Intervenções Pendentes</span>
                    </div>
                    <Badge className="bg-orange-600">{metrics.intervencoesPendentes}</Badge>
                  </div>
                )}
                
                {(metrics?.alertasFinanceiros || 0) > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-800/30 rounded-lg border border-yellow-600/30 touch-feedback">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-100 font-medium mobile-text">Alerta Financeiro</span>
                    </div>
                    <Badge className="bg-yellow-600">ATENÇÃO</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-500/50 bg-gradient-to-r from-green-900/20 to-blue-900/20 shadow-lg mobile-card">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-3 space-y-2 sm:space-y-0">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
                <span className="text-green-100 font-bold tracking-wider mobile-text text-center">TODOS OS SISTEMAS OPERACIONAIS</span>
                <Badge className="bg-green-600">STATUS OK</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 📊 MÉTRICAS PRINCIPAIS E AÇÕES RÁPIDAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* 📈 MÉTRICAS CONTEXTUAIS */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="tactical-card mobile-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                  <CardTitle className="military-title mobile-text">MÉTRICAS OPERACIONAIS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mobile-grid gap-3 md:gap-4">
                  
                  {/* Total de Animais */}
                  <div className="text-center p-3 md:p-4 bg-gradient-to-br from-green-800/30 to-green-900/30 rounded-lg border border-green-600/30 touch-feedback">
                    <div className="text-xl md:text-2xl font-bold text-green-100">{metrics?.totalAnimais || 0}</div>
                    <div className="text-xs mobile-text text-green-300 uppercase tracking-wider">Unidades Totais</div>
                    <div className="flex items-center justify-center mt-1 space-x-1">
                      {(metrics?.tendenciaAnimais || 0) > 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-green-400">+{metrics?.tendenciaAnimais}</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Estável</span>
                      )}
                    </div>
                  </div>

                  {/* Animais Ativos */}
                  <div className="text-center p-3 md:p-4 bg-gradient-to-br from-blue-800/30 to-blue-900/30 rounded-lg border border-blue-600/30 touch-feedback">
                    <div className="text-xl md:text-2xl font-bold text-blue-100">{metrics?.animaisAtivos || 0}</div>
                    <div className="text-xs mobile-text text-blue-300 uppercase tracking-wider">Ativos</div>
                    <div className="mt-1">
                      <Progress 
                        value={((metrics?.animaisAtivos || 0) / (metrics?.totalAnimais || 1)) * 100} 
                        className="h-1"
                      />
                    </div>
                  </div>

                  {/* Intervenções */}
                  <div className="text-center p-3 md:p-4 bg-gradient-to-br from-purple-800/30 to-purple-900/30 rounded-lg border border-purple-600/30 touch-feedback">
                    <div className="text-xl md:text-2xl font-bold text-purple-100">{metrics?.totalIntervencoes || 0}</div>
                    <div className="text-xs mobile-text text-purple-300 uppercase tracking-wider">Intervenções</div>
                    <div className="flex items-center justify-center mt-1 space-x-1">
                      {(metrics?.tendenciaIntervencoes || 0) > 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-purple-400" />
                          <span className="text-xs text-purple-400">+{metrics?.tendenciaIntervencoes}</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Estável</span>
                      )}
                    </div>
                  </div>

                  {/* Saldo Financeiro */}
                  <div className={`text-center p-3 md:p-4 rounded-lg border ${
                    (metrics?.saldoFinanceiro || 0) >= 0 
                      ? 'bg-gradient-to-br from-emerald-800/30 to-emerald-900/30 border-emerald-600/30'
                      : 'bg-gradient-to-br from-red-800/30 to-red-900/30 border-red-600/30'
                  } touch-feedback`}>
                    <div className={`text-lg md:text-xl font-bold ${
                      (metrics?.saldoFinanceiro || 0) >= 0 ? 'text-emerald-100' : 'text-red-100'
                    }`}>
                      {formatCurrency(metrics?.saldoFinanceiro || 0)}
                    </div>
                    <div className={`text-xs mobile-text uppercase tracking-wider ${
                      (metrics?.saldoFinanceiro || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'
                    }`}>
                      Recursos
                    </div>
                    <div className="flex items-center justify-center mt-1 space-x-1">
                      {(metrics?.tendenciaFinanceira || 0) > 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-emerald-400" />
                          <span className="text-xs text-emerald-400">Positiva</span>
                        </>
                      ) : (metrics?.tendenciaFinanceira || 0) < 0 ? (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-400" />
                          <span className="text-xs text-red-400">Negativa</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Estável</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ⚡ AÇÕES INTELIGENTES */}
          <div className="space-y-4">
            <Card className="tactical-card mobile-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                  <CardTitle className="military-title mobile-text">AÇÕES RÁPIDAS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  
                  {/* Ação baseada no perfil */}
                  {hasPermission('create') && (
                    <Button asChild className="w-full tactical-button touch-target mobile-text">
                      <Link to="/novo-animal">
                        <Plus className="h-4 w-4 mr-2" />
                        NOVA UNIDADE
                      </Link>
                    </Button>
                  )}

                  <Button asChild className="w-full tactical-button touch-target mobile-text bg-gradient-to-r from-blue-700 to-blue-800">
                    <Link to="/animais">
                      <Eye className="h-4 w-4 mr-2" />
                      RECONHECIMENTO
                    </Link>
                  </Button>

                  <Button asChild className="w-full tactical-button touch-target mobile-text bg-gradient-to-r from-purple-700 to-purple-800">
                    <Link to="/intervencoes">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      MISSÕES MÉDICAS
                    </Link>
                  </Button>

                  <Button asChild className="w-full tactical-button touch-target mobile-text bg-gradient-to-r from-yellow-700 to-yellow-800">
                    <Link to="/financeiro">
                      <DollarSign className="h-4 w-4 mr-2" />
                      RECURSOS
                    </Link>
                  </Button>

                  {hasPermission('admin') && (
                    <Button asChild className="w-full tactical-button touch-target mobile-text bg-gradient-to-r from-red-700 to-red-800">
                      <Link to="/utilizadores">
                        <Shield className="h-4 w-4 mr-2" />
                        COMANDO
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 📋 ATIVIDADE RECENTE E PRÓXIMOS PASSOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          
          {/* 📋 ATIVIDADE RECENTE */}
          <Card className="tactical-card mobile-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                <CardTitle className="military-title mobile-text">ATIVIDADE RECENTE</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.ultimasIntervencoes?.slice(0, 3).map((intervencao, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-600/30 touch-feedback">
                    <div className="flex items-center space-x-3">
                      <Stethoscope className="h-4 w-4 text-blue-400" />
                      <div>
                        <div className="mobile-text font-medium text-slate-100">
                          {intervencao.animais?.nome || 'Animal'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {intervencao.tipo_intervencao} • {formatDate(intervencao.data_intervencao)}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
                
                {(!metrics?.ultimasIntervencoes || metrics.ultimasIntervencoes.length === 0) && (
                  <div className="text-center py-6 text-slate-400">
                    <Activity className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
                    <p className="mobile-text">Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 🎯 PRÓXIMOS PASSOS */}
          <Card className="tactical-card mobile-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                <CardTitle className="military-title mobile-text">PRÓXIMOS PASSOS</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.proximasIntervencoes?.slice(0, 3).map((intervencao, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-800/20 rounded-lg border border-green-600/30 touch-feedback">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-green-400" />
                      <div>
                        <div className="mobile-text font-medium text-green-100">
                          {intervencao.animais?.nome || 'Animal'}
                        </div>
                        <div className="text-xs text-green-300">
                          {intervencao.tipo_intervencao} • {formatDate(intervencao.data_intervencao)}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-xs">AGENDADO</Badge>
                  </div>
                ))}
                
                {(!metrics?.proximasIntervencoes || metrics.proximasIntervencoes.length === 0) && (
                  <div className="text-center py-6 text-slate-400">
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
                    <p className="mobile-text">Nenhuma atividade agendada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🎖️ RESUMO OPERACIONAL */}
        <Card className="tactical-card mobile-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                <CardTitle className="military-title mobile-text">RESUMO OPERACIONAL</CardTitle>
              </div>
              <Badge className="bg-green-600 self-start sm:self-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                SISTEMA ATIVO
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="touch-feedback p-2 rounded">
                <div className="text-lg font-bold text-green-100">{metrics?.totalAnimais || 0}</div>
                <div className="text-xs text-green-300 uppercase tracking-wider">Unidades</div>
              </div>
              <div className="touch-feedback p-2 rounded">
                <div className="text-lg font-bold text-blue-100">{metrics?.totalIntervencoes || 0}</div>
                <div className="text-xs text-blue-300 uppercase tracking-wider">Missões</div>
              </div>
              <div className="touch-feedback p-2 rounded">
                <div className="text-lg font-bold text-purple-100">{metrics?.totalVoluntarios || 0}</div>
                <div className="text-xs text-purple-300 uppercase tracking-wider">Operadores</div>
              </div>
              <div className="touch-feedback p-2 rounded">
                <div className={`text-lg font-bold ${
                  (metrics?.saldoFinanceiro || 0) >= 0 ? 'text-emerald-100' : 'text-red-100'
                }`}>
                  {formatCurrency(metrics?.saldoFinanceiro || 0)}
                </div>
                <div className={`text-xs uppercase tracking-wider ${
                  (metrics?.saldoFinanceiro || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'
                }`}>
                  Recursos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 📱 BOTÃO DE ATUALIZAÇÃO MOBILE */}
        {refreshing && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
              <Target className="h-4 w-4 animate-spin" />
              <span className="text-sm">Atualizando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardEficiente;