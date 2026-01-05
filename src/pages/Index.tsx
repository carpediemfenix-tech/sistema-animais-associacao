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
  Target,
  Calendar,
  Briefcase,
  BarChart3,
  UserCheck,
  Settings,
  Plus,
  DollarSign,
  TrendingUp,
  Activity,
  Stethoscope,
  Shield,
  AlertTriangle,
  Zap,
  Calculator
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
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // 🚨 DEBUG: Log para verificar permissões
    console.log('🔍 [INDEX] User:', user);
    console.log('🔍 [INDEX] hasPermission(admin):', hasPermission('admin'));
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



      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src="/images/BackgroundEraser_20250411_205630024.png" 
                  alt="Valentão Operacionais" 
                  className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 object-contain"
                />
                <div className="absolute -inset-2 bg-white rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Valentão Operacionais v2.0
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
        
        {/* Módulos Principais */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
            Módulos do Sistema
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Acesso direto aos módulos principais do Sistema Valentão
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Animais */}
            <Link to="/modulo-animais" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-red-50 to-pink-50 group-hover:from-red-100 group-hover:to-pink-100">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Animais</h3>
                  <p className="text-sm text-gray-600 mb-4">Gestão completa dos animais resgatados</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">Gestão</Badge>
                    <Badge variant="outline" className="text-xs">Resgate</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 2. Denúncias */}
            <Link to="/modulo-denuncias" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-red-50 to-orange-50 group-hover:from-red-100 group-hover:to-orange-100">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <AlertTriangle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Denúncias</h3>
                  <p className="text-sm text-gray-600 mb-4">Sistema de denúncias e emergência animal</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">Emergência</Badge>
                    <Badge variant="outline" className="text-xs">Resgate</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 3. Voluntários */}
            <Link to="/voluntarios" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Voluntários</h3>
                  <p className="text-sm text-gray-600 mb-4">Gestão da equipa de voluntários</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Equipa</Badge>
                    <Badge variant="outline" className="text-xs">Formação</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 4. Missões */}
            <Link to="/modulo-missoes" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-violet-50 group-hover:from-purple-100 group-hover:to-violet-100">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Missões</h3>
                  <p className="text-sm text-gray-600 mb-4">Coordenação de missões de resgate</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">Operações</Badge>
                    <Badge variant="outline" className="text-xs">Resgate</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 5. Agenda */}
            <Link to="/modulo-agenda" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Agenda</h3>
                  <p className="text-sm text-gray-600 mb-4">Calendário e agendamento de eventos</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Eventos</Badge>
                    <Badge variant="outline" className="text-xs">Calendário</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 6. Equipamentos */}
            <Link to="/equipamentos" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-orange-50 to-amber-50 group-hover:from-orange-100 group-hover:to-amber-100">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Briefcase className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Equipamentos</h3>
                  <p className="text-sm text-gray-600 mb-4">Gestão de equipamentos e materiais</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Inventário</Badge>
                    <Badge variant="outline" className="text-xs">Manutenção</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 7. Estatísticas */}
            <Link to="/estatisticas-avancadas" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-teal-50 to-cyan-50 group-hover:from-teal-100 group-hover:to-cyan-100">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Estatísticas</h3>
                  <p className="text-sm text-gray-600 mb-4">Análises e relatórios detalhados</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700">Análises</Badge>
                    <Badge variant="outline" className="text-xs">Relatórios</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 7. Utilizadores */}
            <Link to="/utilizadores" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Utilizadores</h3>
                  <p className="text-sm text-gray-600 mb-4">Gestão de utilizadores e acessos</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">Utilizadores</Badge>
                    <Badge variant="outline" className="text-xs">Auditoria</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 8. Configurações */}
            <Link to="/configuracoes" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-gray-50 to-slate-50 group-hover:from-gray-100 group-hover:to-slate-100">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Settings className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Configurações</h3>
                  <p className="text-sm text-gray-600 mb-4">Configurações do sistema</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Sistema</Badge>
                    <Badge variant="outline" className="text-xs">Admin</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 9. Clínicas */}
            <Link to="/configuracoes/clinicas" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-cyan-50 to-sky-50 group-hover:from-cyan-100 group-hover:to-sky-100">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Stethoscope className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Clínicas</h3>
                  <p className="text-sm text-gray-600 mb-4">Gestão de clínicas veterinárias</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-cyan-100 text-cyan-700">Veterinária</Badge>
                    <Badge variant="outline" className="text-xs">Protocolos</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 10. Administrador */}
            <Link to="/modulo-administrador" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-slate-700 group-hover:to-slate-800">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-orange-400">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Administrador</h3>
                  <p className="text-sm text-slate-300 mb-4">Configurações avançadas do sistema</p>
                  <div className="flex justify-center space-x-2">
                    <Badge className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">NÍVEL 5</Badge>
                    <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">Admin</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 11. Gestão de Pontuação */}
            {hasPermission('admin') && (
              <Link to="/gestao-pontuacao" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-yellow-50 to-orange-50 group-hover:from-yellow-100 group-hover:to-orange-100">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Gestão de Pontuação</h3>
                    <p className="text-sm text-gray-600 mb-4">Configure regras de pontuação para voluntários</p>
                    <div className="flex justify-center space-x-2">
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">Configuração</Badge>
                      <Badge variant="outline" className="text-xs">Pontos</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* 12. Administração Avançada */}
            <Link to="/administracao-avancada" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-800 to-indigo-900 group-hover:from-purple-700 group-hover:to-indigo-800">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-purple-400">
                    <Activity className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Admin Avançada</h3>
                  <p className="text-sm text-purple-200 mb-4">Diagnósticos, performance e backup</p>
                  <div className="flex justify-center space-x-2">
                    <Badge className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">EXPERT</Badge>
                    <Badge variant="outline" className="text-xs text-purple-200 border-purple-600">Pro</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Ações Rápidas
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Link to="/novo-animal">
              <Button className="w-full h-16 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Novo Animal</span>
                </div>
              </Button>
            </Link>

            <Link to="/voluntarios/novo">
              <Button className="w-full h-16 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-5 w-5" />
                  <span className="font-medium">Novo Voluntário</span>
                </div>
              </Button>
            </Link>

            <Link to="/dashboard-pontos">
              <Button className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Sistema Pontos</span>
                </div>
              </Button>
            </Link>

            <Link to="/financeiro">
              <Button className="w-full h-16 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-medium">Financeiro</span>
                </div>
              </Button>
            </Link>

          </div>
        </div>

        {/* Administração Avançada - Apenas para Administradores */}
        {hasPermission('admin') && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🔧 Administração Avançada
              </h2>
              <p className="text-gray-600">
                Ferramentas avançadas para administradores do sistema
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Link to="/administracao-avancada">
                <Button className="w-full h-20 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-red-500">
                  <div className="flex items-center space-x-4">
                    <Shield className="h-8 w-8" />
                    <div className="text-left">
                      <div className="font-bold text-lg">Administração Avançada</div>
                      <div className="text-red-100 text-sm">Diagnósticos, Performance e Backup</div>
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center py-8 border-t border-gray-200">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <img 
              src="/images/BackgroundEraser_20250411_205630024.png" 
              alt="Valentão Operacionais" 
              className="h-8 w-8 object-contain"
            />
            <h3 className="text-lg font-semibold text-gray-800">Valentão Operacionais v2.0</h3>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Sistema completo de gestão para associações de proteção animal. 
            Desenvolvido com foco na eficiência e facilidade de uso.
          </p>
        </div>

      </div>

      <EnhancedFooter />
    </div>
  );
};

export default Index;