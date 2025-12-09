import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart,
  Users,
  GraduationCap,
  Wrench,
  Building2,
  Target,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  DollarSign,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Star,
  Award,
  Plus,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EstatisticasGlobais {
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  totalVoluntarios: number;
  voluntariosAtivos: number;
  totalFormacoes: number;
  saldoAtual: number;
  alertasCriticos: number;
}

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGlobais>({
    totalAnimais: 0,
    animaisAtivos: 0,
    animaisAdotados: 0,
    totalVoluntarios: 0,
    voluntariosAtivos: 0,
    totalFormacoes: 0,
    saldoAtual: 0,
    alertasCriticos: 0
  });

  const modulos = [
    {
      id: 'animais',
      nome: 'Animais',
      descricao: 'Gestão completa de animais, grupos e localizações',
      icone: Heart,
      cor: 'bg-red-500',
      rota: '/modulo-animais',
      desenvolvido: true,
      stats: `${estatisticas.totalAnimais} animais`
    },
    {
      id: 'voluntarios',
      nome: 'Voluntários',
      descricao: 'Sistema de gestão de voluntários e responsabilidades',
      icone: Users,
      cor: 'bg-blue-500',
      rota: '/modulo-voluntarios',
      desenvolvido: true,
      stats: `${estatisticas.totalVoluntarios} voluntários`
    },
    {
      id: 'formacao',
      nome: 'Formação',
      descricao: 'Sistema de formação e desenvolvimento de competências',
      icone: GraduationCap,
      cor: 'bg-green-500',
      rota: '/modulo-formacao',
      desenvolvido: true,
      stats: `${estatisticas.totalFormacoes} formações`
    },
    {
      id: 'equipamentos',
      nome: 'Equipamentos',
      descricao: 'Gestão de equipamentos e materiais da associação',
      icone: Wrench,
      cor: 'bg-orange-500',
      rota: '/modulo-equipamentos',
      desenvolvido: false,
      stats: 'Em desenvolvimento'
    },
    {
      id: 'clinicas',
      nome: 'Clínicas',
      descricao: 'Gestão de clínicas veterinárias e parcerias',
      icone: Building2,
      cor: 'bg-purple-500',
      rota: '/modulo-clinicas',
      desenvolvido: false,
      stats: 'Em desenvolvimento'
    },
    {
      id: 'missoes',
      nome: 'Missões',
      descricao: 'Sistema de missões e tarefas para voluntários',
      icone: Target,
      cor: 'bg-indigo-500',
      rota: '/modulo-missoes',
      desenvolvido: false,
      stats: 'Em desenvolvimento'
    },
    {
      id: 'agenda',
      nome: 'Agenda',
      descricao: 'Calendário de eventos e agendamentos',
      icone: Calendar,
      cor: 'bg-pink-500',
      rota: '/modulo-agenda',
      desenvolvido: false,
      stats: 'Em desenvolvimento'
    }
  ];

  useEffect(() => {
    loadEstatisticasGlobais();
  }, []);

  const loadEstatisticasGlobais = async () => {
    try {
      setLoading(true);

      // Carregar animais
      const { data: animais } = await supabase
        .from('animais')
        .select('estado, arquivado')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Carregar voluntários
      const { data: voluntarios } = await supabase
        .from('voluntarios')
        .select('ativo')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Carregar formações
      const { data: formacoes } = await supabase
        .from('acoes_formacao')
        .select('id')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Carregar saldo financeiro
      const { data: movimentos } = await supabase
        .from('movimentos_financeiros')
        .select('valor, tipo')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Calcular estatísticas
      const totalAnimais = animais?.length || 0;
      const animaisAtivos = animais?.filter(a => !a.arquivado && a.estado !== 'Adotado').length || 0;
      const animaisAdotados = animais?.filter(a => a.estado === 'Adotado').length || 0;
      
      const totalVoluntarios = voluntarios?.length || 0;
      const voluntariosAtivos = voluntarios?.filter(v => v.ativo).length || 0;
      
      const totalFormacoes = formacoes?.length || 0;
      
      const receitas = movimentos?.filter(m => m.tipo === 'receita').reduce((sum, m) => sum + (m.valor || 0), 0) || 0;
      const despesas = movimentos?.filter(m => m.tipo === 'despesa').reduce((sum, m) => sum + (m.valor || 0), 0) || 0;
      const saldoAtual = receitas - despesas;

      // Calcular alertas críticos
      let alertasCriticos = 0;
      if (saldoAtual < 0) alertasCriticos++;
      if (animaisAtivos > totalVoluntarios * 3) alertasCriticos++;
      if (voluntariosAtivos < totalVoluntarios * 0.7) alertasCriticos++;

      setEstatisticas({
        totalAnimais,
        animaisAtivos,
        animaisAdotados,
        totalVoluntarios,
        voluntariosAtivos,
        totalFormacoes,
        saldoAtual,
        alertasCriticos
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas globais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard Principal - Sistema Valentão
          </h1>
          <p className="text-gray-600 text-lg">
            Centro de controlo da Associação Valentão dos Animais
          </p>
        </div>

        {/* Estatísticas Globais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalAnimais}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.animaisAtivos} ativos, {estatisticas.animaisAdotados} adotados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voluntários</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalVoluntarios}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.voluntariosAtivos} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              {estatisticas.saldoAtual >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${estatisticas.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{estatisticas.saldoAtual.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Situação financeira atual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${estatisticas.alertasCriticos > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${estatisticas.alertasCriticos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {estatisticas.alertasCriticos}
              </div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.alertasCriticos === 0 ? 'Tudo em ordem' : 'Requer atenção'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Módulos do Sistema */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              Módulos do Sistema
            </CardTitle>
            <CardDescription>
              Acesso aos diferentes módulos de gestão da associação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {modulos.map((modulo) => {
                const IconeModulo = modulo.icone;
                return (
                  <Link key={modulo.id} to={modulo.rota}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg ${modulo.cor} text-white`}>
                            <IconeModulo className="h-6 w-6" />
                          </div>
                          {!modulo.desenvolvido && (
                            <Badge variant="secondary" className="text-xs">
                              Em Dev
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{modulo.nome}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">
                          {modulo.descricao}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">
                            {modulo.stats}
                          </span>
                          <Activity className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alertas Inteligentes e Atividades Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Alertas Inteligentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-orange-600" />
                Alertas Inteligentes
              </CardTitle>
              <CardDescription>
                Notificações importantes do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estatisticas.saldoAtual < 0 && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-semibold text-red-800">Saldo Negativo</p>
                      <p className="text-sm text-red-600">Situação financeira requer atenção</p>
                    </div>
                  </div>
                )}
                {estatisticas.animaisAtivos > estatisticas.voluntariosAtivos * 3 && (
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-semibold text-yellow-800">Sobrecarga de Animais</p>
                      <p className="text-sm text-yellow-600">Muitos animais por voluntário ativo</p>
                    </div>
                  </div>
                )}
                {estatisticas.voluntariosAtivos < estatisticas.totalVoluntarios * 0.7 && (
                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-semibold text-blue-800">Poucos Voluntários Ativos</p>
                      <p className="text-sm text-blue-600">Considere ativar mais voluntários</p>
                    </div>
                  </div>
                )}
                {estatisticas.alertasCriticos === 0 && (
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-semibold text-green-800">Sistema Saudável</p>
                      <p className="text-sm text-green-600">Todos os indicadores estão normais</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Atividades Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>
                Últimas ações no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <Plus className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sistema iniciado</p>
                    <p className="text-xs text-gray-500">Dashboard modular implementado</p>
                  </div>
                  <span className="text-xs text-gray-400">Agora</span>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Módulos organizados</p>
                    <p className="text-xs text-gray-500">7 módulos disponíveis</p>
                  </div>
                  <span className="text-xs text-gray-400">Hoje</span>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <div className="p-2 bg-purple-100 rounded-full mr-3">
                    <Star className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sistema otimizado</p>
                    <p className="text-xs text-gray-500">Performance melhorada</p>
                  </div>
                  <span className="text-xs text-gray-400">Hoje</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-6 w-6 mr-2 text-yellow-600" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Atalhos para as ações mais comuns do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link to="/novo-animal">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-red-50 hover:border-red-200">
                  <Plus className="h-6 w-6 text-red-600" />
                  <span className="text-xs font-medium">Novo Animal</span>
                </Button>
              </Link>
              <Link to="/voluntarios/novo">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200">
                  <Users className="h-6 w-6 text-blue-600" />
                  <span className="text-xs font-medium">Novo Voluntário</span>
                </Button>
              </Link>
              <Link to="/sistema-formacao">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-200">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                  <span className="text-xs font-medium">Formação</span>
                </Button>
              </Link>
              <Link to="/financeiro">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                  <span className="text-xs font-medium">Financeiro</span>
                </Button>
              </Link>
              <Link to="/configuracoes">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 hover:border-gray-200">
                  <Settings className="h-6 w-6 text-gray-600" />
                  <span className="text-xs font-medium">Configurações</span>
                </Button>
              </Link>
              <Link to="/relatorios">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-200">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                  <span className="text-xs font-medium">Relatórios</span>
                </Button>
              </Link>
            </div>
            <div className="mt-4 flex justify-center">
              <Link to="/estatisticas-avancadas">
                <Button variant="outline" className="px-6 py-3 hover:bg-indigo-50 hover:border-indigo-200">
                  <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                  Ver Estatísticas Avançadas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Acesso Rápido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Rápido - Animais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/animais" className="block p-2 hover:bg-gray-50 rounded">
                  → Ver todos os animais
                </Link>
                <Link to="/novo-animal" className="block p-2 hover:bg-gray-50 rounded">
                  → Cadastrar novo animal
                </Link>
                <Link to="/animais-arquivados" className="block p-2 hover:bg-gray-50 rounded">
                  → Ver animais arquivados
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acesso Rápido - Voluntários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/voluntarios" className="block p-2 hover:bg-gray-50 rounded">
                  → Dashboard de voluntários
                </Link>
                <Link to="/voluntarios/novo" className="block p-2 hover:bg-gray-50 rounded">
                  → Cadastrar novo voluntário
                </Link>
                <Link to="/sistema-formacao" className="block p-2 hover:bg-gray-50 rounded">
                  → Sistema de formação
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface DashboardStats {
  // Animais
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  animaisArquivados: number;
  totalCaes: number;
  totalGatos: number;
  
  // Voluntários
  totalVoluntarios: number;
  voluntariosAtivos: number;
  
  // Financeiro
  saldoAtual: number;
  receitasMes: number;
  despesasMes: number;
  
  // Intervenções
  intervencoesMes: number;
  intervencoesPendentes: number;
}

interface IntervencaoAgendada {
  id: string;
  animal_nome: string;
  tipo_intervencao: string;
  data_agendada: string;
  veterinario: string;
  urgente: boolean;
}

interface ModuleCard {
  title: string;
  description: string;
  icon: any;
  color: string;
  actions: {
    label: string;
    path: string;
    icon: any;
    description: string;
  }[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimais: 0,
    animaisAtivos: 0,
    animaisAdotados: 0,
    animaisArquivados: 0,
    totalCaes: 0,
    totalGatos: 0,
    totalVoluntarios: 0,
    voluntariosAtivos: 0,
    saldoAtual: 0,
    receitasMes: 0,
    despesasMes: 0,
    intervencoesMes: 0,
    intervencoesPendentes: 0
  });
  const [intervencoes, setIntervencoes] = useState<IntervencaoAgendada[]>([]);

  // Definição dos módulos do sistema
  const modules: ModuleCard[] = [
    {
      title: "Gestão de Animais",
      description: "Gestão completa dos animais da associação",
      icon: PawPrint,
      color: "bg-blue-500",
      actions: [
        { label: "Ver Todos", path: "/animais", icon: Eye, description: "Lista completa de animais" },
        { label: "Novo Animal", path: "/novo-animal", icon: Plus, description: "Registar novo animal" },
        { label: "Arquivados", path: "/animais-arquivados", icon: Archive, description: "Animais arquivados" },
        { label: "Relatórios", path: "/relatorios-animais", icon: BarChart2, description: "Relatórios e estatísticas" }
      ]
    },
    {
      title: "Voluntários",
      description: "Gestão de voluntários e formações",
      icon: Users,
      color: "bg-green-500",
      actions: [
        { label: "Dashboard", path: "/voluntarios", icon: BarChart3, description: "Painel de voluntários" },
        { label: "Gestão", path: "/voluntarios/gestao", icon: UserCheck, description: "Gerir voluntários" },
        { label: "Novo Voluntário", path: "/voluntarios/novo", icon: UserPlus, description: "Registar voluntário" },
        { label: "Formações", path: "/sistema-formacao", icon: GraduationCap, description: "Sistema de formações" }
      ]
    },
    {
      title: "Intervenções Médicas",
      description: "Gestão de cuidados veterinários",
      icon: Stethoscope,
      color: "bg-red-500",
      actions: [
        { label: "Todas", path: "/intervencoes", icon: ClipboardList, description: "Todas as intervenções" },
        { label: "Nova", path: "/nova-intervencao", icon: Plus, description: "Registar intervenção" },
        { label: "Agendadas", path: "/intervencoes-agendadas", icon: Calendar, description: "Intervenções agendadas" },
        { label: "Histórico", path: "/historico-intervencoes", icon: FileText, description: "Histórico médico" }
      ]
    },
    {
      title: "Gestão Financeira",
      description: "Controlo financeiro da associação",
      icon: DollarSign,
      color: "bg-yellow-500",
      actions: [
        { label: "Dashboard", path: "/financeiro", icon: PieChart, description: "Painel financeiro" },
        { label: "Movimentos", path: "/movimentos-financeiros", icon: CreditCard, description: "Movimentos financeiros" },
        { label: "Novo Movimento", path: "/novo-movimento", icon: Plus, description: "Registar movimento" },
        { label: "Relatórios", path: "/relatorios-financeiros", icon: BarChart2, description: "Relatórios financeiros" }
      ]
    },
    {
      title: "Configurações",
      description: "Configurações do sistema",
      icon: Settings,
      color: "bg-purple-500",
      actions: [
        { label: "Espécies", path: "/configuracoes/especies", icon: Database, description: "Gerir espécies" },
        { label: "Grupos", path: "/configuracoes/grupos", icon: Layers, description: "Gerir grupos" },
        { label: "Localizações", path: "/configuracoes/localizacoes", icon: MapPin, description: "Gerir localizações" },
        { label: "Categorias", path: "/configuracoes/categorias", icon: Grid3X3, description: "Categorias financeiras" }
      ]
    },
    {
      title: "Relatórios",
      description: "Relatórios e estatísticas",
      icon: BarChart3,
      color: "bg-indigo-500",
      actions: [
        { label: "Sistema", path: "/sistema-relatorios", icon: FileText, description: "Relatórios do sistema" },
        { label: "Animais", path: "/relatorios/animais", icon: PawPrint, description: "Relatórios de animais" },
        { label: "Voluntários", path: "/relatorios/voluntarios", icon: Users, description: "Relatórios de voluntários" },
        { label: "Financeiro", path: "/relatorios/financeiro", icon: DollarSign, description: "Relatórios financeiros" }
      ]
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas de animais
      const { data: animais } = await supabase
        .from('animais')
        .select('especie, estado, arquivado');

      // Carregar estatísticas de voluntários
      const { data: voluntarios } = await supabase
        .from('voluntarios')
        .select('ativo');

      // Carregar movimentos financeiros do mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const { data: movimentos } = await supabase
        .from('movimentos_financeiros')
        .select('valor, tipo')
        .gte('data_movimento', inicioMes.toISOString());

      // Carregar intervenções do mês (simplificado para evitar erros)
      const { data: intervencoesMes } = await supabase
        .from('intervencoes')
        .select('id')
        .gte('data_intervencao', inicioMes.toISOString())
        .then(result => result.data || [])
        .catch(() => []);

      // Carregar intervenções agendadas (simplificado)
      const { data: intervencoesAgendadas } = await supabase
        .from('intervencoes')
        .select('id, tipo_intervencao, data_intervencao, veterinario, urgente, animal_id')
        .gte('data_intervencao', new Date().toISOString())
        .order('data_intervencao', { ascending: true })
        .limit(5)
        .then(result => result.data || [])
        .catch(() => []);

      // Calcular estatísticas
      const animaisStats = {
        totalAnimais: animais?.length || 0,
        animaisAtivos: animais?.filter(a => !a.arquivado && a.estado !== 'Adotado').length || 0,
        animaisAdotados: animais?.filter(a => a.estado === 'Adotado').length || 0,
        animaisArquivados: animais?.filter(a => a.arquivado).length || 0,
        totalCaes: animais?.filter(a => a.especie === 'Cão').length || 0,
        totalGatos: animais?.filter(a => a.especie === 'Gato').length || 0
      };

      const voluntariosStats = {
        totalVoluntarios: voluntarios?.length || 0,
        voluntariosAtivos: voluntarios?.filter(v => v.ativo).length || 0
      };

      const financeiroStats = {
        receitasMes: movimentos?.filter(m => m.tipo === 'receita').reduce((sum, m) => sum + (m.valor || 0), 0) || 0,
        despesasMes: movimentos?.filter(m => m.tipo === 'despesa').reduce((sum, m) => sum + (m.valor || 0), 0) || 0
      };

      const saldoAtual = financeiroStats.receitasMes - financeiroStats.despesasMes;

      setStats({
        ...animaisStats,
        ...voluntariosStats,
        ...financeiroStats,
        saldoAtual,
        intervencoesMes: intervencoesMes?.length || 0,
        intervencoesPendentes: intervencoesAgendadas?.length || 0
      });

      // Processar intervenções agendadas (simplificado)
      const intervencoesFormatadas = intervencoesAgendadas?.map(i => ({
        id: i.id,
        animal_nome: 'Animal ID: ' + (i.animal_id || 'N/A'),
        tipo_intervencao: i.tipo_intervencao || 'Intervenção',
        data_agendada: i.data_intervencao,
        veterinario: i.veterinario || 'Não definido',
        urgente: i.urgente || false
      })) || [];

      setIntervencoes(intervencoesFormatadas);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho do Dashboard */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard Principal
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao sistema de gestão da associação. Acesso rápido a todas as funcionalidades.
          </p>
        </div>

        {/* Estatísticas Globais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Animais</CardTitle>
              <PawPrint className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalAnimais}</div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                <span>• {stats.animaisAtivos} ativos</span>
                <span>• {stats.animaisAdotados} adotados</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Voluntários</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalVoluntarios}</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.voluntariosAtivos} ativos
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                stats.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.saldoAtual.toFixed(2)}€
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.receitasMes.toFixed(2)}€ receitas | {stats.despesasMes.toFixed(2)}€ despesas
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Intervenções</CardTitle>
              <Stethoscope className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.intervencoesMes}</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.intervencoesPendentes} agendadas
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Módulos do Sistema */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Grid3X3 className="h-5 w-5 mr-2 text-blue-600" />
                  Módulos do Sistema
                </CardTitle>
                <CardDescription>
                  Acesso rápido a todas as funcionalidades do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modules.map((module, index) => {
                    const IconComponent = module.icon;
                    return (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-3">
                          <div className={`${module.color} p-2 rounded-lg mr-3`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{module.title}</h3>
                            <p className="text-sm text-gray-600">{module.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {module.actions.map((action, actionIndex) => {
                            const ActionIcon = action.icon;
                            return (
                              <Link
                                key={actionIndex}
                                to={action.path}
                                className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors group"
                              >
                                <ActionIcon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-blue-600" />
                                <span className="group-hover:text-blue-600">{action.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Intervenções Agendadas */}
          <div>
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-red-600" />
                  Intervenções Agendadas
                </CardTitle>
                <CardDescription>
                  Próximas intervenções médicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {intervencoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma intervenção agendada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {intervencoes.map((intervencao) => (
                      <div key={intervencao.id} className="border-l-4 border-red-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{intervencao.animal_nome}</h4>
                          {intervencao.urgente && (
                            <Badge variant="destructive" className="text-xs">
                              Urgente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{intervencao.tipo_intervencao}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(intervencao.data_agendada).toLocaleDateString('pt-PT')}
                        </div>
                        <p className="text-xs text-gray-500">Dr. {intervencao.veterinario}</p>
                      </div>
                    ))}
                    <Link
                      to="/intervencoes-agendadas"
                      className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-4"
                    >
                      Ver todas as intervenções →
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;