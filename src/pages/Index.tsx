import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PawPrint, 
  Users, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Award,
  Zap,
  Star,
  ArrowRight,
  Plus,
  Eye,
  Edit,
  Archive,
  UserCheck,
  Stethoscope,
  Home,
  Dog,
  Cat
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";
import SistemaLembretes from "@/components/SistemaLembretes";

interface DashboardStats {
  // Estatísticas de Animais
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  animaisObitosAno: number;
  animaisArquivados: number;
  
  // Estatísticas por Espécie
  totalCaes: number;
  totalGatos: number;
  totalOutros: number;
  
  // Estatísticas de Voluntários
  totalVoluntarios: number;
  voluntariosAtivos: number;
  
  // Estatísticas Financeiras
  saldoTotal: number;
  receitasAno: number;
  despesasAno: number;
  custosIntervencoesAno: number;
  
  // Estatísticas de Atividade
  intervencoesAno: number;
  eventosAno: number;
  adocoesAno: number;
  
  // Estatísticas de Grupos
  totalGrupos: number;
  totalMatilhas: number;
  totalColonias: number;
  totalSocios: number;
  
  // Alertas e Lembretes
  animaisSemResponsavel: number;
  intervencoesVencidas: number;
  eventosProximos: number;
  
  // Tendências (comparação com mês anterior)
  tendenciaAnimais: number;
  tendenciaAdocoes: number;
  tendenciaVoluntarios: number;
  tendenciaFinanceiro: number;
}

interface AlertaCritico {
  id: string;
  tipo: 'animal' | 'financeiro' | 'voluntario' | 'intervencao';
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  link?: string;
}

interface AtividadeRecente {
  id: string;
  tipo: 'animal' | 'intervencao' | 'evento' | 'adocao' | 'voluntario';
  titulo: string;
  descricao: string;
  data: string;
  usuario?: string;
}

const Index = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertasCriticos, setAlertasCriticos] = useState<AlertaCritico[]>([]);
  const [atividadeRecente, setAtividadeRecente] = useState<AtividadeRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Função para buscar estatísticas completas
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const anoAtual = new Date().getFullYear();
      const mesAtual = new Date().getMonth() + 1;
      const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
      const anoMesAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;

      // Buscar estatísticas de animais
      const { data: animais } = await supabase
        .from('animais')
        .select('id, estado, especie, arquivado, data_entrada, data_adocao, voluntario_responsavel_id');

      const totalAnimais = animais?.length || 0;
      const animaisAtivos = animais?.filter(a => a.estado === 'Ativo' && !a.arquivado).length || 0;
      const animaisAdotados = animais?.filter(a => a.estado === 'Adotado').length || 0;
      const animaisArquivados = animais?.filter(a => a.arquivado).length || 0;
      const animaisSemResponsavel = animais?.filter(a => !a.voluntario_responsavel_id && a.estado === 'Ativo' && !a.arquivado).length || 0;
      
      // Por espécie
      const totalCaes = animais?.filter(a => a.especie === 'Cão' && !a.arquivado).length || 0;
      const totalGatos = animais?.filter(a => a.especie === 'Gato' && !a.arquivado).length || 0;
      const totalOutros = animais?.filter(a => a.especie !== 'Cão' && a.especie !== 'Gato' && !a.arquivado).length || 0;

      // Adoções do ano
      const adocoesAno = animais?.filter(a => {
        if (!a.data_adocao) return false;
        const anoAdocao = new Date(a.data_adocao).getFullYear();
        return anoAdocao === anoAtual;
      }).length || 0;

      // Buscar voluntários
      const { data: voluntarios } = await supabase
        .from('voluntarios')
        .select('id, ativo');

      const totalVoluntarios = voluntarios?.length || 0;
      const voluntariosAtivos = voluntarios?.filter(v => v.ativo).length || 0;

      // Buscar movimentos financeiros do ano
      const { data: movimentos } = await supabase
        .from('movimentos_financeiros')
        .select('tipo, valor, data_movimento')
        .gte('data_movimento', `${anoAtual}-01-01`)
        .lte('data_movimento', `${anoAtual}-12-31`);

      const receitasAno = movimentos?.filter(m => m.tipo === 'Receita').reduce((sum, m) => sum + m.valor, 0) || 0;
      const despesasAno = movimentos?.filter(m => m.tipo === 'Despesa').reduce((sum, m) => sum + m.valor, 0) || 0;

      // Buscar custos de intervenções do ano
      const { data: intervencoes } = await supabase
        .from('intervencoes')
        .select('custo, data_intervencao')
        .gte('data_intervencao', `${anoAtual}-01-01`)
        .lte('data_intervencao', `${anoAtual}-12-31`)
        .not('custo', 'is', null);

      const custosIntervencoesAno = intervencoes?.reduce((sum, i) => sum + (i.custo || 0), 0) || 0;
      const intervencoesAno = intervencoes?.length || 0;

      const saldoTotal = receitasAno - despesasAno - custosIntervencoesAno;

      // Buscar eventos do ano
      const { data: eventos } = await supabase
        .from('eventos')
        .select('id, data_evento')
        .gte('data_evento', `${anoAtual}-01-01`)
        .lte('data_evento', `${anoAtual}-12-31`);

      const eventosAno = eventos?.length || 0;

      // Buscar grupos
      const { data: grupos } = await supabase
        .from('grupos')
        .select('tipo, ativo')
        .eq('ativo', true);

      const totalGrupos = grupos?.length || 0;
      const totalMatilhas = grupos?.filter(g => g.tipo === 'Matilha').length || 0;
      const totalColonias = grupos?.filter(g => g.tipo === 'Colónia').length || 0;
      const totalSocios = grupos?.filter(g => g.tipo === 'Sócios').length || 0;

      // Calcular tendências (comparação com mês anterior)
      const animaisMesAtual = animais?.filter(a => {
        const dataEntrada = new Date(a.data_entrada);
        return dataEntrada.getFullYear() === anoAtual && dataEntrada.getMonth() + 1 === mesAtual;
      }).length || 0;

      const animaisMesAnterior = animais?.filter(a => {
        const dataEntrada = new Date(a.data_entrada);
        return dataEntrada.getFullYear() === anoMesAnterior && dataEntrada.getMonth() + 1 === mesAnterior;
      }).length || 0;

      const tendenciaAnimais = animaisMesAnterior > 0 ? ((animaisMesAtual - animaisMesAnterior) / animaisMesAnterior) * 100 : 0;

      const adocoesMesAtual = animais?.filter(a => {
        if (!a.data_adocao) return false;
        const dataAdocao = new Date(a.data_adocao);
        return dataAdocao.getFullYear() === anoAtual && dataAdocao.getMonth() + 1 === mesAtual;
      }).length || 0;

      const adocoesMesAnterior = animais?.filter(a => {
        if (!a.data_adocao) return false;
        const dataAdocao = new Date(a.data_adocao);
        return dataAdocao.getFullYear() === anoMesAnterior && dataAdocao.getMonth() + 1 === mesAnterior;
      }).length || 0;

      const tendenciaAdocoes = adocoesMesAnterior > 0 ? ((adocoesMesAtual - adocoesMesAnterior) / adocoesMesAnterior) * 100 : 0;

      // Montar objeto de estatísticas
      const dashboardStats: DashboardStats = {
        totalAnimais,
        animaisAtivos,
        animaisAdotados,
        animaisObitosAno: animais?.filter(a => a.estado === 'Óbito').length || 0,
        animaisArquivados,
        totalCaes,
        totalGatos,
        totalOutros,
        totalVoluntarios,
        voluntariosAtivos,
        saldoTotal,
        receitasAno,
        despesasAno,
        custosIntervencoesAno,
        intervencoesAno,
        eventosAno,
        adocoesAno,
        totalGrupos,
        totalMatilhas,
        totalColonias,
        totalSocios,
        animaisSemResponsavel,
        intervencoesVencidas: 0, // Implementar lógica se necessário
        eventosProximos: 0, // Implementar lógica se necessário
        tendenciaAnimais,
        tendenciaAdocoes,
        tendenciaVoluntarios: 0,
        tendenciaFinanceiro: saldoTotal > 0 ? 10 : -5 // Exemplo
      };

      setStats(dashboardStats);

      // Gerar alertas críticos baseados nas estatísticas
      const alertas: AlertaCritico[] = [];

      if (animaisSemResponsavel > 0) {
        alertas.push({
          id: 'sem-responsavel',
          tipo: 'animal',
          titulo: 'Animais sem Responsável',
          descricao: `${animaisSemResponsavel} animais ativos não têm voluntário responsável atribuído`,
          prioridade: 'alta',
          link: '/animais'
        });
      }

      if (saldoTotal < 0) {
        alertas.push({
          id: 'saldo-negativo',
          tipo: 'financeiro',
          titulo: 'Saldo Negativo',
          descricao: `Saldo atual: ${saldoTotal.toFixed(2)}€. Atenção às finanças da associação`,
          prioridade: 'alta',
          link: '/gestao-financeira'
        });
      }

      if (voluntariosAtivos < 5) {
        alertas.push({
          id: 'poucos-voluntarios',
          tipo: 'voluntario',
          titulo: 'Poucos Voluntários Ativos',
          descricao: `Apenas ${voluntariosAtivos} voluntários ativos. Considere recrutar mais ajuda`,
          prioridade: 'media',
          link: '/voluntarios'
        });
      }

      setAlertasCriticos(alertas);

      // Gerar atividade recente (exemplo)
      const atividades: AtividadeRecente[] = [
        {
          id: '1',
          tipo: 'animal',
          titulo: 'Novo animal registado',
          descricao: 'Rex foi adicionado ao sistema',
          data: new Date().toISOString(),
          usuario: 'Sistema'
        },
        {
          id: '2',
          tipo: 'adocao',
          titulo: 'Animal adotado',
          descricao: 'Mimi foi adotada com sucesso',
          data: new Date(Date.now() - 86400000).toISOString(),
          usuario: 'Maria Silva'
        }
      ];

      setAtividadeRecente(atividades);

    } catch (error: any) {
      console.error('💥 [DASHBOARD] Erro ao carregar estatísticas:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar as estatísticas do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getTendenciaIcon = (tendencia: number) => {
    if (tendencia > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (tendencia < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTendenciaColor = (tendencia: number) => {
    if (tendencia > 0) return "text-green-600";
    if (tendencia < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <UserHeader 
        title="Dashboard - Sistema Valentão"
        description="Centro de Controlo - Valentão Operacionais"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Alertas Críticos */}
        {alertasCriticos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              Alertas Críticos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alertasCriticos.map((alerta) => (
                <Card key={alerta.id} className={`border-l-4 ${
                  alerta.prioridade === 'alta' ? 'border-l-red-500 bg-red-50' :
                  alerta.prioridade === 'media' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className={`h-5 w-5 mr-2 ${
                        alerta.prioridade === 'alta' ? 'text-red-600' :
                        alerta.prioridade === 'media' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      {alerta.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-3">{alerta.descricao}</p>
                    {alerta.link && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={alerta.link}>
                          Ver Detalhes
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Animais */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
              <PawPrint className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAnimais || 0}</div>
              <div className="flex items-center text-xs opacity-90">
                {getTendenciaIcon(stats?.tendenciaAnimais || 0)}
                <span className="ml-1">
                  {stats?.tendenciaAnimais ? `${stats.tendenciaAnimais.toFixed(1)}%` : '0%'} vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Animais Ativos */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Animais Ativos</CardTitle>
              <Heart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.animaisAtivos || 0}</div>
              <div className="text-xs opacity-90">
                {stats?.animaisSemResponsavel || 0} sem responsável
              </div>
            </CardContent>
          </Card>

          {/* Adoções do Ano */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adoções {new Date().getFullYear()}</CardTitle>
              <CheckCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.adocoesAno || 0}</div>
              <div className="flex items-center text-xs opacity-90">
                {getTendenciaIcon(stats?.tendenciaAdocoes || 0)}
                <span className="ml-1">
                  {stats?.tendenciaAdocoes ? `${stats.tendenciaAdocoes.toFixed(1)}%` : '0%'} vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Saldo Financeiro */}
          <Card className={`bg-gradient-to-br ${
            (stats?.saldoTotal || 0) >= 0 
              ? 'from-emerald-500 to-emerald-600' 
              : 'from-red-500 to-red-600'
          } text-white`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.saldoTotal || 0)}</div>
              <div className="flex items-center text-xs opacity-90">
                {getTendenciaIcon(stats?.tendenciaFinanceiro || 0)}
                <span className="ml-1">
                  {stats?.tendenciaFinanceiro ? `${stats.tendenciaFinanceiro.toFixed(1)}%` : '0%'} vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Distribuição por Espécie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                Distribuição por Espécie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Dog className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Cães</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={stats?.totalAnimais ? (stats.totalCaes / stats.totalAnimais) * 100 : 0} 
                    className="w-20" 
                  />
                  <span className="text-sm font-medium">{stats?.totalCaes || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Cat className="h-4 w-4 mr-2 text-purple-600" />
                  <span>Gatos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={stats?.totalAnimais ? (stats.totalGatos / stats.totalAnimais) * 100 : 0} 
                    className="w-20" 
                  />
                  <span className="text-sm font-medium">{stats?.totalGatos || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PawPrint className="h-4 w-4 mr-2 text-green-600" />
                  <span>Outros</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={stats?.totalAnimais ? (stats.totalOutros / stats.totalAnimais) * 100 : 0} 
                    className="w-20" 
                  />
                  <span className="text-sm font-medium">{stats?.totalOutros || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Resumo Financeiro {new Date().getFullYear()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receitas</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats?.receitasAno || 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Despesas</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(stats?.despesasAno || 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Custos Médicos</span>
                <span className="font-medium text-orange-600">
                  -{formatCurrency(stats?.custosIntervencoesAno || 0)}
                </span>
              </div>
              
              <hr />
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Saldo Total</span>
                <span className={`font-bold ${
                  (stats?.saldoTotal || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(stats?.saldoTotal || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Atividade do Ano */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-orange-600" />
                Atividade {new Date().getFullYear()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">Intervenções</span>
                </div>
                <span className="font-medium">{stats?.intervencoesAno || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-sm">Eventos</span>
                </div>
                <span className="font-medium">{stats?.eventosAno || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm">Adoções</span>
                </div>
                <span className="font-medium">{stats?.adocoesAno || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="text-sm">Voluntários Ativos</span>
                </div>
                <span className="font-medium">{stats?.voluntariosAtivos || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Ações Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild className="h-20 flex-col">
                  <Link to="/novo-animal">
                    <Plus className="h-6 w-6 mb-2" />
                    Novo Animal
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link to="/animais">
                    <Eye className="h-6 w-6 mb-2" />
                    Ver Animais
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link to="/gestao-financeira">
                    <DollarSign className="h-6 w-6 mb-2" />
                    Finanças
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link to="/relatorios">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Relatórios
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atividadeRecente.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma atividade recente</p>
                ) : (
                  atividadeRecente.map((atividade) => (
                    <div key={atividade.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        atividade.tipo === 'animal' ? 'bg-blue-100' :
                        atividade.tipo === 'adocao' ? 'bg-green-100' :
                        atividade.tipo === 'intervencao' ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        {atividade.tipo === 'animal' && <PawPrint className="h-4 w-4 text-blue-600" />}
                        {atividade.tipo === 'adocao' && <Heart className="h-4 w-4 text-green-600" />}
                        {atividade.tipo === 'intervencao' && <Stethoscope className="h-4 w-4 text-orange-600" />}
                        {atividade.tipo === 'evento' && <Calendar className="h-4 w-4 text-purple-600" />}
                        {atividade.tipo === 'voluntario' && <Users className="h-4 w-4 text-indigo-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{atividade.titulo}</p>
                        <p className="text-sm text-gray-500">{atividade.descricao}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(atividade.data).toLocaleDateString('pt-PT')} • {atividade.usuario}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sistema de Lembretes */}
        <SistemaLembretes />
      </div>
    </div>
  );
};

export default Index;