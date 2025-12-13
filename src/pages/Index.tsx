import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Settings,
  PawPrint,
  Package,
  Eye,
  Archive,
  BarChart2,
  UserCheck,
  UserPlus,
  Stethoscope,
  ClipboardList
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

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
      descricao: 'Sistema de gamificação e missões para voluntários',
      icone: Target,
      cor: 'bg-indigo-500',
      rota: '/modulo-missoes',
      desenvolvido: true,
      stats: 'Sistema ativo'
    },
    {
      id: 'agenda',
      nome: 'Agenda',
      descricao: 'Sistema completo de calendário e agendamentos',
      icone: Calendar,
      cor: 'bg-pink-500',
      rota: '/modulo-agenda',
      desenvolvido: true,
      stats: 'Sistema ativo'
    },
    {
      id: 'equipamentos',
      nome: 'Equipamentos',
      descricao: 'Sistema de gestão de equipamentos e materiais',
      icone: Package,
      cor: 'bg-orange-500',
      rota: '/modulo-equipamentos',
      desenvolvido: true,
      stats: 'Sistema ativo'
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex-1">
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
      
      <EnhancedFooter />
    </div>
  );
};

export default Index;