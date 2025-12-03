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
  Activity,
  BarChart3,
  Target,
  ArrowRight,
  Plus,
  Eye,
  Stethoscope,
  Settings,
  FileText,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";
// import SistemaLembretes from "@/components/SistemaLembretes"; // Temporariamente desativado

interface DashboardStats {
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  animaisArquivados: number;
  animaisSemResponsavel: number;
  totalCaes: number;
  totalGatos: number;
  totalOutros: number;
  adocoesAno: number;
  adocoesMes: number;
  totalVoluntarios: number;
  voluntariosAtivos: number;
  totalMovimentosFinanceiros: number;
  saldoTotal: number;
  receitasMes: number;
  despesasMes: number;
  intervencoesPendentes: number;
  intervencoesMes: number;
  gruposAtivos: number;
  responsabilidadesAtivas: number;
}

interface AlertaCritico {
  id: string;
  tipo: 'animal' | 'financeiro' | 'intervencao' | 'sistema';
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Função otimizada para buscar estatísticas com melhor tratamento de erros
  const fetchDashboardStats = async () => {
    try {
      console.log('🔄 [DASHBOARD] Iniciando carregamento de dados...');
      setLoading(true);
      setError(null);
      
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;
      const inicioMes = new Date(anoAtual, mesAtual - 1, 1).toISOString();
      const fimMes = new Date(anoAtual, mesAtual, 0).toISOString();

      // Buscar dados básicos primeiro (mais seguros)
      console.log('📊 [DASHBOARD] Carregando dados básicos...');
      
      const { data: animais, error: animaisError } = await supabase
        .from('animais')
        .select('id, estado, especie, arquivado, data_entrada, data_adocao, voluntario_responsavel_id');

      if (animaisError) {
        console.error('❌ [DASHBOARD] Erro ao carregar animais:', animaisError);
        throw new Error('Erro ao carregar dados dos animais');
      }

      const { data: voluntarios, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('id, ativo');

      if (voluntariosError) {
        console.error('❌ [DASHBOARD] Erro ao carregar voluntários:', voluntariosError);
        // Não bloquear por erro de voluntários
      }

      // Dados opcionais (não bloqueiam o dashboard se falharem)
      let movimentos: any[] = [];
      let intervencoes: any[] = [];
      let grupos: any[] = [];
      let responsabilidades: any[] = [];

      try {
        const { data: movimentosData } = await supabase
          .from('movimentos_financeiros')
          .select('id, valor, tipo, data_movimento');
        movimentos = movimentosData || [];
      } catch (e) {
        console.warn('⚠️ [DASHBOARD] Erro ao carregar movimentos financeiros:', e);
      }

      try {
        const { data: intervencoesData } = await supabase
          .from('intervencoes')
          .select('id, estado, data_intervencao');
        intervencoes = intervencoesData || [];
      } catch (e) {
        console.warn('⚠️ [DASHBOARD] Erro ao carregar intervenções:', e);
      }

      try {
        const { data: gruposData } = await supabase
          .from('grupos')
          .select('id, ativo');
        grupos = gruposData || [];
      } catch (e) {
        console.warn('⚠️ [DASHBOARD] Erro ao carregar grupos:', e);
      }

      try {
        const { data: responsabilidadesData } = await supabase
          .from('responsabilidades_voluntarios')
          .select('id, ativo');
        responsabilidades = responsabilidadesData || [];
      } catch (e) {
        console.warn('⚠️ [DASHBOARD] Erro ao carregar responsabilidades:', e);
      }

      console.log('✅ [DASHBOARD] Dados carregados com sucesso');

      // Calcular estatísticas de animais (dados essenciais)
      const animaisArray = animais || [];
      const totalAnimais = animaisArray.length;
      const animaisAtivos = animaisArray.filter(a => a.estado === 'Ativo' && !a.arquivado).length;
      const animaisAdotados = animaisArray.filter(a => a.estado === 'Adotado').length;
      const animaisArquivados = animaisArray.filter(a => a.arquivado).length;
      const animaisSemResponsavel = animaisArray.filter(a => !a.voluntario_responsavel_id && a.estado === 'Ativo' && !a.arquivado).length;
      
      const totalCaes = animaisArray.filter(a => a.especie === 'Cão' && !a.arquivado).length;
      const totalGatos = animaisArray.filter(a => a.especie === 'Gato' && !a.arquivado).length;
      const totalOutros = animaisArray.filter(a => a.especie !== 'Cão' && a.especie !== 'Gato' && !a.arquivado).length;

      // Adoções do ano e mês
      const adocoesAno = animaisArray.filter(a => {
        if (!a.data_adocao) return false;
        return new Date(a.data_adocao).getFullYear() === anoAtual;
      }).length;

      const adocoesMes = animaisArray.filter(a => {
        if (!a.data_adocao) return false;
        const dataAdocao = new Date(a.data_adocao);
        return dataAdocao >= new Date(inicioMes) && dataAdocao <= new Date(fimMes);
      }).length;

      // Estatísticas de voluntários
      const voluntariosArray = voluntarios || [];
      const totalVoluntarios = voluntariosArray.length;
      const voluntariosAtivos = voluntariosArray.filter(v => v.ativo).length;

      // Estatísticas financeiras
      const totalMovimentosFinanceiros = movimentos.length;
      const receitas = movimentos.filter(m => m.tipo === 'receita').reduce((sum, m) => sum + (m.valor || 0), 0);
      const despesas = movimentos.filter(m => m.tipo === 'despesa').reduce((sum, m) => sum + (m.valor || 0), 0);
      const saldoTotal = receitas - despesas;

      const movimentosMes = movimentos.filter(m => {
        if (!m.data_movimento) return false;
        const dataMovimento = new Date(m.data_movimento);
        return dataMovimento >= new Date(inicioMes) && dataMovimento <= new Date(fimMes);
      });

      const receitasMes = movimentosMes.filter(m => m.tipo === 'receita').reduce((sum, m) => sum + (m.valor || 0), 0);
      const despesasMes = movimentosMes.filter(m => m.tipo === 'despesa').reduce((sum, m) => sum + (m.valor || 0), 0);

      // Estatísticas de intervenções
      const intervencoesPendentes = intervencoes.filter(i => i.estado === 'Agendada' || i.estado === 'Em Curso').length;
      const intervencoesMes = intervencoes.filter(i => {
        if (!i.data_intervencao) return false;
        const dataIntervencao = new Date(i.data_intervencao);
        return dataIntervencao >= new Date(inicioMes) && dataIntervencao <= new Date(fimMes);
      }).length;

      // Outras estatísticas
      const gruposAtivos = grupos.filter(g => g.ativo).length;
      const responsabilidadesAtivas = responsabilidades.filter(r => r.ativo).length;

      const dashboardStats: DashboardStats = {
        totalAnimais,
        animaisAtivos,
        animaisAdotados,
        animaisArquivados,
        animaisSemResponsavel,
        totalCaes,
        totalGatos,
        totalOutros,
        adocoesAno,
        adocoesMes,
        totalVoluntarios,
        voluntariosAtivos,
        totalMovimentosFinanceiros,
        saldoTotal,
        receitasMes,
        despesasMes,
        intervencoesPendentes,
        intervencoesMes,
        gruposAtivos,
        responsabilidadesAtivas
      };

      setStats(dashboardStats);

      // Gerar alertas críticos baseados nos dados
      const alertas: AlertaCritico[] = [];

      if (animaisSemResponsavel > 0) {
        alertas.push({
          id: 'sem-responsavel',
          tipo: 'animal',
          titulo: 'Animais sem Responsável',
          descricao: `${animaisSemResponsavel} animais ativos sem voluntário responsável`,
          prioridade: 'alta',
          link: '/animais'
        });
      }

      if (intervencoesPendentes > 5) {
        alertas.push({
          id: 'intervencoes-pendentes',
          tipo: 'intervencao',
          titulo: 'Muitas Intervenções Pendentes',
          descricao: `${intervencoesPendentes} intervenções aguardando atendimento`,
          prioridade: 'alta'
        });
      }

      if (saldoTotal < 0) {
        alertas.push({
          id: 'saldo-negativo',
          tipo: 'financeiro',
          titulo: 'Saldo Negativo',
          descricao: `Saldo atual: €${saldoTotal.toFixed(2)}`,
          prioridade: 'alta',
          link: '/dashboard-financeiro'
        });
      }

      setAlertasCriticos(alertas);

      // Gerar atividade recente (simulada por agora)
      const atividades: AtividadeRecente[] = [
        {
          id: '1',
          tipo: 'animal',
          titulo: 'Sistema Atualizado',
          descricao: 'Dashboard carregado com sucesso',
          data: new Date().toISOString()
        }
      ];

      setAtividadeRecente(atividades);

      console.log('✅ [DASHBOARD] Dashboard carregado com sucesso');

    } catch (error: any) {
      console.error('💥 [DASHBOARD] Erro ao carregar dashboard:', error);
      setError(error.message || 'Erro ao carregar dados do dashboard');
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard. Tentando novamente...",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 [DASHBOARD] Componente montado, iniciando carregamento...');
    fetchDashboardStats();
    
    // Atualizar dados a cada 5 minutos (apenas se não houver erro)
    const interval = setInterval(() => {
      if (!error) {
        fetchDashboardStats();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      console.log('🔄 [DASHBOARD] Limpando interval...');
      clearInterval(interval);
    };
  }, []);

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <UserHeader />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <UserHeader />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardStats} variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <UserHeader />
        
        {/* Alertas Críticos */}
        {alertasCriticos.length > 0 && (
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertas Críticos
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {alertasCriticos.map((alerta) => (
                <Card key={alerta.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{alerta.titulo}</h3>
                        <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                      </div>
                      <Badge variant={alerta.prioridade === 'alta' ? 'destructive' : 'secondary'}>
                        {alerta.prioridade}
                      </Badge>
                    </div>
                    {alerta.link && (
                      <Link to={alerta.link}>
                        <Button size="sm" className="mt-3 w-full">
                          Ver Detalhes
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas Principais */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total de Animais</p>
                  <p className="text-3xl font-bold">{stats?.totalAnimais || 0}</p>
                  <p className="text-sm text-blue-100 mt-1">
                    {stats?.animaisAtivos || 0} ativos
                  </p>
                </div>
                <PawPrint className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Adoções (Ano)</p>
                  <p className="text-3xl font-bold">{stats?.adocoesAno || 0}</p>
                  <p className="text-sm text-green-100 mt-1">
                    {stats?.adocoesMes || 0} este mês
                  </p>
                </div>
                <Heart className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Voluntários</p>
                  <p className="text-3xl font-bold">{stats?.totalVoluntarios || 0}</p>
                  <p className="text-sm text-purple-100 mt-1">
                    {stats?.voluntariosAtivos || 0} ativos
                  </p>
                </div>
                <Users className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-r ${(stats?.saldoTotal || 0) >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80">Saldo Total</p>
                  <p className="text-3xl font-bold">€{(stats?.saldoTotal || 0).toFixed(2)}</p>
                  <div className="flex items-center mt-1">
                    {(stats?.receitasMes || 0) > (stats?.despesasMes || 0) ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <p className="text-sm text-white/80">
                      €{((stats?.receitasMes || 0) - (stats?.despesasMes || 0)).toFixed(2)} este mês
                    </p>
                  </div>
                </div>
                <DollarSign className="h-12 w-12 text-white/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por Espécie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Espécie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cães</span>
                <span className="text-sm text-gray-600">{stats?.totalCaes || 0}</span>
              </div>
              <Progress value={stats?.totalAnimais ? (stats.totalCaes / stats.totalAnimais) * 100 : 0} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Gatos</span>
                <span className="text-sm text-gray-600">{stats?.totalGatos || 0}</span>
              </div>
              <Progress value={stats?.totalAnimais ? (stats.totalGatos / stats.totalAnimais) * 100 : 0} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Outros</span>
                <span className="text-sm text-gray-600">{stats?.totalOutros || 0}</span>
              </div>
              <Progress value={stats?.totalAnimais ? (stats.totalOutros / stats.totalAnimais) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-blue-600" />
                Gestão de Animais
              </CardTitle>
              <CardDescription>
                Gerir animais, adoções e responsabilidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/animais">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todos os Animais
                </Button>
              </Link>
              <Link to="/novo-animal">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Registar Novo Animal
                </Button>
              </Link>
              <Link to="/animais-arquivados">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Animais Arquivados
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-green-600" />
                Cuidados Veterinários
              </CardTitle>
              <CardDescription>
                Intervenções e acompanhamento médico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/intervencoes">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Intervenções ({stats?.intervencoesPendentes || 0} pendentes)
                </Button>
              </Link>
              <Link to="/eventos">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Eventos da Vida
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Gestão Financeira
              </CardTitle>
              <CardDescription>
                Controlo financeiro e relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/dashboard-financeiro">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard Financeiro
                </Button>
              </Link>
              <Link to="/gestao-financeira">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Gestão de Movimentos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Sistema de Voluntários
              </CardTitle>
              <CardDescription>
                Gestão de voluntários e formação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/voluntarios">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Dashboard Voluntários
                </Button>
              </Link>
              <Link to="/voluntarios/gestao">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Gestão de Voluntários
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Relatórios e Análises
              </CardTitle>
              <CardDescription>
                Relatórios detalhados e estatísticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/relatorios">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios Gerais
                </Button>
              </Link>
              <Link to="/voluntarios/relatorios">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Relatórios Voluntários
                </Button>
              </Link>
            </CardContent>
          </Card>

          {hasPermission('admin') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Administração
                </CardTitle>
                <CardDescription>
                  Configurações e gestão do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/administracao">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Painel de Administração
                  </Button>
                </Link>
                <Link to="/configuracoes">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Configurações Gerais
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sistema de Lembretes - Temporariamente Desativado */}
        {/* <SistemaLembretes /> */}
      </div>
    </div>
  );
};

export default Index;