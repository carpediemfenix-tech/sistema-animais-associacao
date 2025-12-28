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
  Shield
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

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
            <Link to="/missoes" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Missões</h3>
                  <p className="text-sm text-gray-600 mb-4">Operações e resgates</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Ativas</Badge>
                    <Badge variant="outline" className="text-xs">Histórico</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Intervenções */}
            <Link to="/intervencoes" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-violet-50 group-hover:from-purple-100 group-hover:to-violet-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Intervenções</h3>
                  <p className="text-sm text-gray-600 mb-4">Cuidados médicos</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Médicas</Badge>
                    <Badge variant="outline" className="text-xs">Relatórios</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Financeiro */}
            <Link to="/dashboard-financeiro" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-orange-50 to-amber-50 group-hover:from-orange-100 group-hover:to-amber-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Financeiro</h3>
                  <p className="text-sm text-gray-600 mb-4">Gestão financeira</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Dashboard</Badge>
                    <Badge variant="outline" className="text-xs">Relatórios</Badge>
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

            {/* Formação */}
            <Link to="/formacao" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-rose-50 to-pink-50 group-hover:from-rose-100 group-hover:to-pink-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Formação</h3>
                  <p className="text-sm text-gray-600 mb-4">Cursos e certificações</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Cursos</Badge>
                    <Badge variant="outline" className="text-xs">Certificados</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Módulo Administrador */}
            <Link to="/modulo-administrador" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-slate-700 group-hover:to-slate-800">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Administrador</h3>
                  <p className="text-sm text-slate-300 mb-4">Centro de comando tático</p>
                  <div className="flex justify-center space-x-2">
                    <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs">NÍVEL 5</Badge>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">ATIVO</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Administração */}
            <Link to="/administracao" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-gray-50 to-slate-50 group-hover:from-gray-100 group-hover:to-slate-100">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-600 to-slate-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Administração</h3>
                  <p className="text-sm text-gray-600 mb-4">Configurações do sistema</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Configurar</Badge>
                    <Badge variant="outline" className="text-xs">Utilizadores</Badge>
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
              <Button className="w-full h-20 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center space-y-2">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">Novo Animal</span>
                </div>
              </Button>
            </Link>

            <Link to="/novo-voluntario">
              <Button className="w-full h-20 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center space-y-2">
                  <UserCheck className="h-6 w-6" />
                  <span className="text-sm font-medium">Novo Voluntário</span>
                </div>
              </Button>
            </Link>

            <Link to="/dashboard-pontos">
              <Button className="w-full h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm font-medium">Sistema Pontos</span>
                </div>
              </Button>
            </Link>

            <Link to="/equipamentos">
              <Button className="w-full h-20 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center space-y-2">
                  <Briefcase className="h-6 w-6" />
                  <span className="text-sm font-medium">Equipamentos</span>
                </div>
              </Button>
            </Link>

          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center py-8 border-t border-gray-200">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <img 
              src="/images/media-_3_.gif" 
              alt="Valentão ao Resgate" 
              className="h-8 w-8 object-contain"
            />
            <h3 className="text-xl font-bold text-gray-900">Associação Valentão ao Resgate</h3>
          </div>
          <p className="text-gray-600 mb-2">
            Sistema de Gestão Completo para Proteção Animal
          </p>
          <p className="text-sm text-gray-500">
            Desenvolvido com ❤️ para os nossos amigos de quatro patas
          </p>
        </div>

      </div>

      <EnhancedFooter />
    </div>
  );
};

export default Dashboard;