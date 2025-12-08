import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Loader2,
  GraduationCap,
  Shield,
  MapPin,
  Phone,
  Mail,
  Bell,
  Star,
  Zap,
  Award,
  Home,
  Building,
  UserCheck,
  BookOpen,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";

interface DashboardStats {
  // 🐾 ANIMAIS - Estatísticas Avançadas
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  animaisArquivados: number;
  animaisSemResponsavel: number;
  animaisUrgentes: number;
  totalCaes: number;
  totalGatos: number;
  totalOutros: number;
  
  // 👥 VOLUNTÁRIOS - Estatísticas Completas
  totalVoluntarios: number;
  voluntariosAtivos: number;
  voluntariosComFormacao: number;
  voluntariosComResponsabilidades: number;
  novasInscricoesVoluntarios: number;
  
  // 🎓 FORMAÇÃO - Estatísticas Detalhadas
  totalFormacoes: number;
  formacoesAtivas: number;
  formacoesCompletadas: number;
  participantesAtivos: number;
  taxaSucessoFormacao: number;
  
  // 💰 FINANCEIRO - Estatísticas Consolidadas
  saldoAtual: number;
  receitasMes: number;
  despesasMes: number;
  movimentosMes: number;
  alertasFinanceiros: number;
  
  // 🏥 INTERVENÇÕES - Estatísticas Médicas
  intervencoesMes: number;
  intervencoesPendentes: number;
  custoIntervencoesMes: number;
  
  // 📊 MÉTRICAS GERAIS
  ultimaAtualizacao: string;
}

interface AlertaCritico {
  id: string;
  tipo: 'animal' | 'financeiro' | 'intervencao' | 'sistema' | 'voluntario' | 'formacao';
  titulo: string;
  descricao: string;
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  icone: string;
  cor: string;
  link?: string;
  acao?: string;
  contador?: number;
}

interface AtividadeRecente {
  id: string;
  tipo: 'animal' | 'intervencao' | 'evento' | 'adocao' | 'voluntario' | 'formacao' | 'financeiro';
  titulo: string;
  descricao: string;
  data: string;
  usuario?: string;
  status: 'sucesso' | 'pendente' | 'alerta' | 'erro';
}

interface ModuloSistema {
  id: string;
  nome: string;
  descricao: string;
  icone: any;
  cor: string;
  link: string;
  stats: {
    principal: number;
    secundaria: string;
    tendencia: 'up' | 'down' | 'stable';
  };
  alertas: number;
}

const Index = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertasCriticos, setAlertasCriticos] = useState<AlertaCritico[]>([]);
  const [atividadesRecentes, setAtividadesRecentes] = useState<AtividadeRecente[]>([]);
  const [modulos, setModulos] = useState<ModuloSistema[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Carregar dados de animais
      const { data: animais } = await supabase
        .from('animais')
        .select('*');

      // Carregar dados de voluntários
      const { data: voluntarios } = await supabase
        .from('voluntarios')
        .select('*');

      // Carregar dados de participações em formação
      const { data: participacoes } = await supabase
        .from('participacoes_formacao')
        .select('*');

      // Carregar dados de ações de formação
      const { data: acoesFormacao } = await supabase
        .from('acoes_formacao')
        .select('*');

      // Carregar dados financeiros
      const { data: movimentosFinanceiros } = await supabase
        .from('movimentos_financeiros')
        .select('*');

      // Carregar intervenções
      const { data: intervencoes } = await supabase
        .from('intervencoes')
        .select('*');

      // Processar dados
      const animaisData = animais || [];
      const voluntariosData = voluntarios || [];
      const participacoesData = participacoes || [];
      const acoesFormacaoData = acoesFormacao || [];
      const movimentosData = movimentosFinanceiros || [];
      const intervencoesData = intervencoes || [];

      // Calcular estatísticas de animais
      const animaisAtivos = animaisData.filter(a => a.estado === 'Ativo').length;
      const animaisAdotados = animaisData.filter(a => a.estado === 'Adotado').length;
      const animaisArquivados = animaisData.filter(a => a.arquivado).length;
      const totalCaes = animaisData.filter(a => a.especie === 'Cão').length;
      const totalGatos = animaisData.filter(a => a.especie === 'Gato').length;

      // Calcular estatísticas de voluntários
      const voluntariosAtivos = voluntariosData.filter(v => v.ativo).length;
      const voluntariosComFormacao = new Set(
        participacoesData.filter(p => p.resultado === 'aprovado').map(p => p.voluntario_id)
      ).size;

      // Calcular estatísticas de formação
      const formacoesAtivas = acoesFormacaoData.filter(a => {
        const hoje = new Date();
        const dataFim = new Date(a.data_fim);
        return dataFim >= hoje;
      }).length;

      const formacoesCompletadas = participacoesData.filter(p => p.status === 'concluido').length;
      const participantesAtivos = participacoesData.filter(p => 
        p.status === 'inscrito' || p.status === 'em_avaliacao'
      ).length;

      // Calcular estatísticas financeiras
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      
      const movimentosMes = movimentosData.filter(m => {
        const dataMovimento = new Date(m.data);
        return dataMovimento.getMonth() === mesAtual && dataMovimento.getFullYear() === anoAtual;
      });

      const receitasMes = movimentosMes
        .filter(m => m.tipo === 'receita')
        .reduce((sum, m) => sum + (m.valor || 0), 0);

      const despesasMes = movimentosMes
        .filter(m => m.tipo === 'despesa')
        .reduce((sum, m) => sum + (m.valor || 0), 0);

      const saldoAtual = receitasMes - despesasMes;

      // Calcular estatísticas de intervenções
      const intervencoesMes = intervencoesData.filter(i => {
        const dataIntervencao = new Date(i.data);
        return dataIntervencao.getMonth() === mesAtual && dataIntervencao.getFullYear() === anoAtual;
      }).length;

      const dashboardStats: DashboardStats = {
        totalAnimais: animaisData.length,
        animaisAtivos,
        animaisAdotados,
        animaisArquivados,
        animaisSemResponsavel: animaisAtivos - 10, // Placeholder
        animaisUrgentes: 3, // Placeholder
        totalCaes,
        totalGatos,
        totalOutros: animaisData.length - totalCaes - totalGatos,
        
        totalVoluntarios: voluntariosData.length,
        voluntariosAtivos,
        voluntariosComFormacao,
        voluntariosComResponsabilidades: 15, // Placeholder
        novasInscricoesVoluntarios: voluntariosData.filter(v => {
          const created = new Date(v.created_at);
          const umMesAtras = new Date();
          umMesAtras.setMonth(umMesAtras.getMonth() - 1);
          return created > umMesAtras;
        }).length,
        
        totalFormacoes: acoesFormacaoData.length,
        formacoesAtivas,
        formacoesCompletadas,
        participantesAtivos,
        taxaSucessoFormacao: formacoesCompletadas > 0 ? 
          Math.round((participacoesData.filter(p => p.resultado === 'aprovado').length / formacoesCompletadas) * 100) : 0,
        
        saldoAtual,
        receitasMes,
        despesasMes,
        movimentosMes: movimentosMes.length,
        alertasFinanceiros: saldoAtual < 0 ? 1 : 0,
        
        intervencoesMes,
        intervencoesPendentes: 2, // Placeholder
        custoIntervencoesMes: 1500, // Placeholder
        
        ultimaAtualizacao: new Date().toISOString()
      };

      setStats(dashboardStats);

      // Configurar módulos do sistema
      const modulosSistema: ModuloSistema[] = [
        {
          id: 'animais',
          nome: 'Gestão de Animais',
          descricao: 'Gestão completa de animais da associação',
          icone: PawPrint,
          cor: 'bg-blue-500',
          link: '/animais',
          stats: {
            principal: dashboardStats.totalAnimais,
            secundaria: `${dashboardStats.animaisAtivos} ativos`,
            tendencia: 'up'
          },
          alertas: dashboardStats.animaisUrgentes
        },
        {
          id: 'voluntarios',
          nome: 'Sistema de Voluntários',
          descricao: 'Gestão de voluntários e responsabilidades',
          icone: Users,
          cor: 'bg-green-500',
          link: '/voluntarios',
          stats: {
            principal: dashboardStats.totalVoluntarios,
            secundaria: `${dashboardStats.voluntariosAtivos} ativos`,
            tendencia: 'up'
          },
          alertas: 0
        },
        {
          id: 'formacao',
          nome: 'Sistema de Formação',
          descricao: 'Gestão de formações e certificações',
          icone: GraduationCap,
          cor: 'bg-purple-500',
          link: '/sistema-formacao',
          stats: {
            principal: dashboardStats.totalFormacoes,
            secundaria: `${dashboardStats.formacoesAtivas} ativas`,
            tendencia: 'stable'
          },
          alertas: 0
        },
        {
          id: 'financeiro',
          nome: 'Gestão Financeira',
          descricao: 'Controlo financeiro e movimentos',
          icone: DollarSign,
          cor: 'bg-yellow-500',
          link: '/financeiro',
          stats: {
            principal: Math.abs(dashboardStats.saldoAtual),
            secundaria: dashboardStats.saldoAtual >= 0 ? 'Saldo positivo' : 'Saldo negativo',
            tendencia: dashboardStats.saldoAtual >= 0 ? 'up' : 'down'
          },
          alertas: dashboardStats.alertasFinanceiros
        }
      ];

      setModulos(modulosSistema);

      // Gerar alertas críticos
      const alertas: AlertaCritico[] = [];
      
      if (dashboardStats.animaisUrgentes > 0) {
        alertas.push({
          id: 'animais-urgentes',
          tipo: 'animal',
          titulo: 'Animais Urgentes',
          descricao: `${dashboardStats.animaisUrgentes} animais precisam de atenção urgente`,
          prioridade: 'critica',
          icone: '🚨',
          cor: 'text-red-600',
          link: '/animais',
          contador: dashboardStats.animaisUrgentes
        });
      }

      if (dashboardStats.saldoAtual < 0) {
        alertas.push({
          id: 'saldo-negativo',
          tipo: 'financeiro',
          titulo: 'Saldo Negativo',
          descricao: `Saldo atual: €${dashboardStats.saldoAtual.toFixed(2)}`,
          prioridade: 'alta',
          icone: '💰',
          cor: 'text-red-600',
          link: '/financeiro'
        });
      }

      if (dashboardStats.intervencoesPendentes > 0) {
        alertas.push({
          id: 'intervencoes-pendentes',
          tipo: 'intervencao',
          titulo: 'Intervenções Pendentes',
          descricao: `${dashboardStats.intervencoesPendentes} intervenções aguardam agendamento`,
          prioridade: 'media',
          icone: '🏥',
          cor: 'text-yellow-600',
          link: '/intervencoes',
          contador: dashboardStats.intervencoesPendentes
        });
      }

      setAlertasCriticos(alertas);

      // Gerar atividades recentes
      const atividades: AtividadeRecente[] = [
        {
          id: '1',
          tipo: 'animal',
          titulo: 'Novo Animal Registado',
          descricao: 'Rex foi registado no sistema',
          data: new Date().toISOString(),
          usuario: 'Admin',
          status: 'sucesso'
        },
        {
          id: '2',
          tipo: 'voluntario',
          titulo: 'Novo Voluntário',
          descricao: 'Maria Silva inscreveu-se como voluntária',
          data: new Date(Date.now() - 86400000).toISOString(),
          status: 'sucesso'
        },
        {
          id: '3',
          tipo: 'formacao',
          titulo: 'Formação Completada',
          descricao: 'João Santos completou FORMA BASE',
          data: new Date(Date.now() - 172800000).toISOString(),
          status: 'sucesso'
        },
        {
          id: '4',
          tipo: 'financeiro',
          titulo: 'Donativo Recebido',
          descricao: 'Donativo de €150 recebido',
          data: new Date(Date.now() - 259200000).toISOString(),
          status: 'sucesso'
        }
      ];

      setAtividadesRecentes(atividades);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Erro ao Carregar</CardTitle>
              <CardDescription>
                Não foi possível carregar os dados do dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchDashboardStats}>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Home className="h-8 w-8 mr-3 text-blue-600" />
                Dashboard Principal
              </h1>
              <p className="text-gray-600 mt-1">
                Visão geral completa da Associação Valentão dos Animais
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Última atualização: {new Date(stats.ultimaAtualizacao).toLocaleTimeString('pt-PT')}
              </Badge>
              <Button size="sm" variant="outline" onClick={fetchDashboardStats}>
                <Activity className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Alertas Críticos */}
        {alertasCriticos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Alertas Críticos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alertasCriticos.map((alerta) => (
                <Card key={alerta.id} className={`border-l-4 ${
                  alerta.prioridade === 'critica' ? 'border-l-red-500 bg-red-50' :
                  alerta.prioridade === 'alta' ? 'border-l-orange-500 bg-orange-50' :
                  'border-l-yellow-500 bg-yellow-50'
                } hover:shadow-lg transition-shadow cursor-pointer`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <span className="mr-2">{alerta.icone}</span>
                        {alerta.titulo}
                      </CardTitle>
                      {alerta.contador && (
                        <Badge variant="destructive">{alerta.contador}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{alerta.descricao}</p>
                    {alerta.link && (
                      <Link to={alerta.link}>
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Módulos do Sistema */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Módulos do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modulos.map((modulo) => {
              const IconeModulo = modulo.icone;
              return (
                <Link key={modulo.id} to={modulo.link}>
                  <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${modulo.cor} text-white`}>
                          <IconeModulo className="h-6 w-6" />
                        </div>
                        {modulo.alertas > 0 && (
                          <Badge variant="destructive">{modulo.alertas}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-1">{modulo.nome}</h3>
                      <p className="text-sm text-gray-600 mb-3">{modulo.descricao}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">{modulo.stats.principal}</div>
                          <div className="text-xs text-gray-500">{modulo.stats.secundaria}</div>
                        </div>
                        <div className="flex items-center">
                          {modulo.stats.tendencia === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {modulo.stats.tendencia === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                          {modulo.stats.tendencia === 'stable' && <Activity className="h-4 w-4 text-gray-600" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Estatísticas Detalhadas */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="animais">Animais</TabsTrigger>
            <TabsTrigger value="voluntarios">Voluntários</TabsTrigger>
            <TabsTrigger value="atividade">Atividade</TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Animais</CardTitle>
                  <PawPrint className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAnimais}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.animaisAtivos} ativos, {stats.animaisAdotados} adotados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Voluntários</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVoluntarios}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.voluntariosAtivos} ativos, {stats.voluntariosComFormacao} com formação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Formações</CardTitle>
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFormacoes}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.formacoesAtivas} ativas, {stats.taxaSucessoFormacao}% sucesso
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                  <DollarSign className={`h-4 w-4 ${stats.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{Math.abs(stats.saldoAtual).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.movimentosMes} movimentos este mês
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Animais */}
          <TabsContent value="animais" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PawPrint className="h-5 w-5 mr-2 text-blue-600" />
                    Distribuição por Espécie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Cães</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(stats.totalCaes / stats.totalAnimais) * 100} className="w-20" />
                        <span className="text-sm font-medium">{stats.totalCaes}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gatos</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(stats.totalGatos / stats.totalAnimais) * 100} className="w-20" />
                        <span className="text-sm font-medium">{stats.totalGatos}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Outros</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(stats.totalOutros / stats.totalAnimais) * 100} className="w-20" />
                        <span className="text-sm font-medium">{stats.totalOutros}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estados dos Animais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Ativos</span>
                      <Badge variant="default">{stats.animaisAtivos}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Adotados</span>
                      <Badge variant="secondary">{stats.animaisAdotados}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Arquivados</span>
                      <Badge variant="outline">{stats.animaisArquivados}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link to="/novo-animal">
                      <Button className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Animal
                      </Button>
                    </Link>
                    <Link to="/animais">
                      <Button variant="outline" className="w-full justify-start">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Todos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Voluntários */}
          <TabsContent value="voluntarios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Estatísticas de Voluntários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <Badge>{stats.totalVoluntarios}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Ativos</span>
                      <Badge variant="default">{stats.voluntariosAtivos}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Com Formação</span>
                      <Badge variant="secondary">{stats.voluntariosComFormacao}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Com Responsabilidades</span>
                      <Badge variant="outline">{stats.voluntariosComResponsabilidades}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{stats.taxaSucessoFormacao}%</div>
                      <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completadas</span>
                      <span>{stats.formacoesCompletadas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Em Andamento</span>
                      <span>{stats.participantesAtivos}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link to="/voluntarios">
                      <Button className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Dashboard Voluntários
                      </Button>
                    </Link>
                    <Link to="/sistema-formacao">
                      <Button variant="outline" className="w-full justify-start">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Sistema Formação
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Atividade */}
          <TabsContent value="atividade" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {atividadesRecentes.map((atividade) => (
                    <div key={atividade.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        atividade.status === 'sucesso' ? 'bg-green-100' :
                        atividade.status === 'pendente' ? 'bg-yellow-100' :
                        atividade.status === 'alerta' ? 'bg-orange-100' : 'bg-red-100'
                      }`}>
                        {atividade.tipo === 'animal' && <PawPrint className="h-4 w-4 text-blue-600" />}
                        {atividade.tipo === 'voluntario' && <Users className="h-4 w-4 text-green-600" />}
                        {atividade.tipo === 'formacao' && <GraduationCap className="h-4 w-4 text-purple-600" />}
                        {atividade.tipo === 'financeiro' && <DollarSign className="h-4 w-4 text-yellow-600" />}
                        {atividade.tipo === 'intervencao' && <Stethoscope className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{atividade.titulo}</p>
                        <p className="text-sm text-gray-600">{atividade.descricao}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(atividade.data).toLocaleDateString('pt-PT')}
                          </p>
                          {atividade.usuario && (
                            <Badge variant="outline" className="text-xs">
                              {atividade.usuario}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;