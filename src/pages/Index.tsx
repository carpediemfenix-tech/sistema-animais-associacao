import React, { useState, useEffect } from 'react';
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
  GraduationCap,
  Shield,
  Wrench,
  Building2,
  ClipboardList,
  Database,
  Archive,
  BookOpen,
  Cog,
  PieChart,
  UserCog,
  Layers,
  Zap,
  Globe,
  Monitor
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

const Index: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <EnhancedHeader />

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
            <Link to="/financeiro" className="group">
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

        {/* Módulos Avançados */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
            Módulos Avançados
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Acesso completo a todas as funcionalidades do sistema
          </p>
          
          {/* Gestão e Operações */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Gestão e Operações
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              
              <Link to="/equipamentos" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-purple-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Equipamentos</h4>
                    <p className="text-xs text-gray-600">Gestão completa</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/agenda" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-green-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Agenda</h4>
                    <p className="text-xs text-gray-600">Calendário e eventos</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/clinicas" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-blue-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Clínicas</h4>
                    <p className="text-xs text-gray-600">Gestão veterinária</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/formacao" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-orange-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Formação</h4>
                    <p className="text-xs text-gray-600">Sistema de formação</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/missoes" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-indigo-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Missões</h4>
                    <p className="text-xs text-gray-600">Gestão de missões</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/intervencoes" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-red-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Intervenções</h4>
                    <p className="text-xs text-gray-600">Registo de intervenções</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/eventos" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-teal-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Eventos</h4>
                    <p className="text-xs text-gray-600">Gestão de eventos</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/animais-arquivados" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-gray-400">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Archive className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Arquivados</h4>
                    <p className="text-xs text-gray-600">Animais arquivados</p>
                  </CardContent>
                </Card>
              </Link>

            </div>
          </div>

          {/* Relatórios e Análises */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Relatórios e Análises
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              
              <Link to="/relatorios" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-blue-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Relatórios</h4>
                    <p className="text-xs text-gray-600">Relatórios gerais</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/estatisticas-avancadas" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-purple-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <PieChart className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Estatísticas</h4>
                    <p className="text-xs text-gray-600">Análises avançadas</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dashboard-executivo" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-emerald-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Monitor className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Dashboard Executivo</h4>
                    <p className="text-xs text-gray-600">Visão executiva</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/analytics" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-cyan-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Analytics</h4>
                    <p className="text-xs text-gray-600">Análise de dados</p>
                  </CardContent>
                </Card>
              </Link>

            </div>
          </div>

          {/* Configurações e Administração */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Cog className="h-5 w-5 mr-2 text-orange-600" />
              Configurações e Administração
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              
              <Link to="/configuracoes" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-orange-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Configurações</h4>
                    <p className="text-xs text-gray-600">Configurações gerais</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/administracao" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-red-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <UserCog className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Administração</h4>
                    <p className="text-xs text-gray-600">Gestão do sistema</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/utilizadores" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-indigo-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Utilizadores</h4>
                    <p className="text-xs text-gray-600">Gestão de utilizadores</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/manual" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 group-hover:border-teal-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Manual</h4>
                    <p className="text-xs text-gray-600">Manual do utilizador</p>
                  </CardContent>
                </Card>
              </Link>

            </div>
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

export default Index;