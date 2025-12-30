import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Users, 
  Stethoscope,
  DollarSign,
  Plus,
  Eye,
  BarChart3,
  Settings,
  Calendar,
  MapPin,
  UserCheck,
  Target,
  Activity,
  TrendingUp,
  Award,
  Home,
  FileText,
  Briefcase,
  Shield,
  AlertTriangle,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalAnimais: number;
  totalIntervencoes: number;
  totalEventos: number;
  totalLocalizacoes: number;
  totalResponsabilidades: number;
  totalVoluntarios: number;
}

const Dashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // 🚨 DEBUG: Log para verificar permissões
    console.log('🔍 [DASHBOARD] User:', user);
    console.log('🔍 [DASHBOARD] hasPermission(admin):', hasPermission('admin'));
  }, [user, hasPermission]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas gerais
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_estatisticas_gerais');

      if (!statsError && statsData && statsData.length > 0) {
        const stat = statsData[0];
        setStats({
          totalAnimais: stat.total_animais,
          totalIntervencoes: stat.total_intervencoes,
          totalEventos: stat.total_eventos,
          totalLocalizacoes: stat.total_localizacoes,
          totalResponsabilidades: stat.total_responsabilidades,
          totalVoluntarios: stat.total_voluntarios
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Activity className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
            <div className="absolute inset-0 h-16 w-16 animate-ping mx-auto rounded-full bg-blue-400 opacity-20"></div>
          </div>
          <p className="text-lg text-gray-700 font-medium">Carregando Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Preparando a melhor experiência para si</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <PageActionBar
        breadcrumbs={[
          { label: 'Dashboard Principal', icon: <Home className="h-4 w-4" /> }
        ]}
        primaryActions={
          <Badge className="bg-green-600 text-white px-3 py-1">
            <Activity className="h-3 w-3 mr-1 inline" />
            Sistema Ativo
          </Badge>
        }
      />

      {/* 🚨 BOTÃO DE DENÚNCIA MEGA DESTACADO - SEMPRE VISÍVEL */}
      <div className="bg-red-600 py-8 border-t-4 border-red-800 border-b-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-white mb-2">
              🚨 SISTEMA DE EMERGÊNCIA ANIMAL 🚨
            </h2>
            <p className="text-red-100 text-lg">
              Operação Resgate - Somos a voz dos que não podem falar
            </p>
          </div>
          
          {/* Debug Info Destacado */}
          <div className="mb-6 p-4 bg-black bg-opacity-30 rounded-lg text-white">
            <p className="text-lg">🔍 DEBUG: User: {user?.username || 'NENHUM USUÁRIO LOGADO'}</p>
            <p className="text-lg">🔍 DEBUG: Perfil: {user?.perfil || 'SEM PERFIL'}</p>
            <p className="text-lg">🔍 DEBUG: hasPermission('admin'): {hasPermission('admin').toString()}</p>
            <p className="text-lg">🔍 DEBUG: User Ativo: {user?.ativo?.toString() || 'false'}</p>
          </div>
          
          {/* BOTÃO MEGA DESTACADO */}
          <Link to="/wizard-denuncia">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-12 py-6 text-2xl shadow-2xl border-4 border-yellow-300 hover:border-yellow-200 transition-all duration-300 hover:scale-110 animate-bounce"
            >
              <AlertTriangle className="h-8 w-8 mr-4 animate-pulse" />
              🚨 NOVA DENÚNCIA - TESTE 🚨
              <Zap className="h-8 w-8 ml-4 animate-pulse" />
            </Button>
          </Link>
          
          <p className="text-white text-xl mt-4 font-bold animate-pulse">
            ⬆️ CLIQUE AQUI PARA TESTAR O WIZARD ⬆️
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src="/images/media-_3_.gif" 
                  alt="Valentão ao Resgate" 
                  className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                />
                <div className="absolute -inset-2 bg-white rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Sistema Valentão
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Gestão completa e profissional para proteção animal
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stats?.totalAnimais || 0}</div>
                <div className="text-sm text-blue-100">Animais</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stats?.totalVoluntarios || 0}</div>
                <div className="text-sm text-blue-100">Voluntários</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stats?.totalIntervencoes || 0}</div>
                <div className="text-sm text-blue-100">Intervenções</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stats?.totalEventos || 0}</div>
                <div className="text-sm text-blue-100">Eventos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Navigation Cards */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
            Acesso Rápido
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Navegue pelas principais funcionalidades do sistema
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Animais */}
            <Link to="/animais" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-red-50 to-pink-50 group-hover:from-red-100 group-hover:to-pink-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Animais</h3>
                  <p className="text-sm text-gray-600 mb-4">Gestão completa dos animais</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Ver Lista</Badge>
                    <Badge variant="outline" className="text-xs">Adicionar</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Voluntários */}
            <Link to="/voluntarios" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Voluntários</h3>
                  <p className="text-sm text-gray-600 mb-4">Gestão da equipa</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Ver Lista</Badge>
                    <Badge variant="outline" className="text-xs">Perfis</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Missões */}
            <Link to="/modulo-missoes" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Missões</h3>
                  <p className="text-sm text-gray-600 mb-4">Operações e projetos</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Ativas</Badge>
                    <Badge variant="outline" className="text-xs">Planejar</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Clínicas */}
            <Link to="/modulo-clinicas" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-violet-50 group-hover:from-purple-100 group-hover:to-violet-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Clínicas</h3>
                  <p className="text-sm text-gray-600 mb-4">Parceiros veterinários</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Parceiros</Badge>
                    <Badge variant="outline" className="text-xs">Contactos</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Financeiro */}
            <Link to="/dashboard-financeiro" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-yellow-50 to-orange-50 group-hover:from-yellow-100 group-hover:to-orange-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Financeiro</h3>
                  <p className="text-sm text-gray-600 mb-4">Gestão de recursos</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Receitas</Badge>
                    <Badge variant="outline" className="text-xs">Despesas</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Equipamentos */}
            <Link to="/modulo-equipamentos" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-gray-50 to-slate-50 group-hover:from-gray-100 group-hover:to-slate-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipamentos</h3>
                  <p className="text-sm text-gray-600 mb-4">Inventário e manutenção</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Inventário</Badge>
                    <Badge variant="outline" className="text-xs">Manutenção</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Relatórios */}
            <Link to="/relatorios" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-teal-50 to-cyan-50 group-hover:from-teal-100 group-hover:to-cyan-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios</h3>
                  <p className="text-sm text-gray-600 mb-4">Análises e estatísticas</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Gráficos</Badge>
                    <Badge variant="outline" className="text-xs">Exportar</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Administração */}
            <Link to="/modulo-administrador" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-rose-50 to-pink-50 group-hover:from-rose-100 group-hover:to-pink-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Administração</h3>
                  <p className="text-sm text-gray-600 mb-4">Configurações do sistema</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Configurar</Badge>
                    <Badge variant="outline" className="text-xs">Gerir</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
            Ações Rápidas
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Acesso direto às funcionalidades mais utilizadas
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link to="/novo-animal">
              <Button className="w-full h-16 text-lg bg-red-600 hover:bg-red-700 text-white">
                <Plus className="h-6 w-6 mr-2" />
                Novo Animal
              </Button>
            </Link>
            
            <Link to="/voluntarios/novo">
              <Button className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 text-white">
                <UserCheck className="h-6 w-6 mr-2" />
                Novo Voluntário
              </Button>
            </Link>
            
            <Link to="/animais-adotados">
              <Button className="w-full h-16 text-lg bg-green-600 hover:bg-green-700 text-white">
                <Heart className="h-6 w-6 mr-2" />
                Adoções
              </Button>
            </Link>
            
            <Link to="/estatisticas-avancadas">
              <Button className="w-full h-16 text-lg bg-purple-600 hover:bg-purple-700 text-white">
                <TrendingUp className="h-6 w-6 mr-2" />
                Estatísticas
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Atividade Recente
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Últimas Intervenções
                </CardTitle>
                <CardDescription>
                  Intervenções médicas recentes nos animais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Consulta de rotina</p>
                      <p className="text-sm text-gray-600">Animal: MAX-001</p>
                    </div>
                    <Badge variant="outline">Hoje</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Vacinação</p>
                      <p className="text-sm text-gray-600">Animal: LUNA-002</p>
                    </div>
                    <Badge variant="outline">Ontem</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/intervencoes">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Próximos Eventos
                </CardTitle>
                <CardDescription>
                  Eventos e atividades programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Feira de Adoção</p>
                      <p className="text-sm text-gray-600">Parque da Cidade</p>
                    </div>
                    <Badge className="bg-green-600">Sábado</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Formação Voluntários</p>
                      <p className="text-sm text-gray-600">Sede da Associação</p>
                    </div>
                    <Badge className="bg-blue-600">Domingo</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/eventos">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <div className="text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Sistema Operacional</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Valentão ao Resgate</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default Dashboard;