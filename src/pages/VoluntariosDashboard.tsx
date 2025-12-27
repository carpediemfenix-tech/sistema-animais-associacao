import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Award, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  GraduationCap,
  Target,
  Activity,
  Star,
  UserPlus,
  FileText,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Plus,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Zap,
  Heart,
  Shield,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpRight,
  Calendar as CalendarIcon,
  Trophy,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface DashboardStats {
  totalVoluntarios: number;
  voluntariosAtivos: number;
  voluntariosInativos: number;
  novasInscricoes: number;
  totalEspecialidades: number;
  voluntariosComEspecialidades: number;
  mediaIdade: number;
  totalPontos: number;
}

interface VoluntarioRecente {
  id: string;
  nome: string;
  email: string;
  data_ingresso: string;
  especialidades_count: number;
  pontos_total: number;
  ativo: boolean;
}

interface EstatisticaEspecialidade {
  nome: string;
  total_voluntarios: number;
  cor: string;
  icone: string;
}

const VoluntariosDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [voluntariosRecentes, setVoluntariosRecentes] = useState<VoluntarioRecente[]>([]);
  const [especialidadesStats, setEspecialidadesStats] = useState<EstatisticaEspecialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas gerais
      const { data: voluntarios, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('*');

      if (voluntariosError) throw voluntariosError;

      // Carregar especialidades
      const { data: especialidades, error: especialidadesError } = await supabase
        .from('especialidades_voluntarios_2025_12_21_22_00')
        .select('*')
        .eq('ativo', true);

      if (especialidadesError) throw especialidadesError;

      // Carregar voluntários com especialidades
      const { data: voluntarioEspecialidades, error: veError } = await supabase
        .from('voluntario_especialidades_2025_12_21_22_00')
        .select(`
          voluntario_id,
          especialidade:especialidades_voluntarios_2025_12_21_22_00(nome, cor, icone)
        `)
        .eq('ativo', true);

      if (veError) throw veError;

      // Calcular estatísticas
      const voluntariosAtivos = voluntarios?.filter(v => v.ativo).length || 0;
      const voluntariosInativos = voluntarios?.filter(v => !v.ativo).length || 0;
      
      // Voluntários dos últimos 30 dias
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);
      const novasInscricoes = voluntarios?.filter(v => 
        new Date(v.created_at) >= dataLimite
      ).length || 0;

      // Voluntários com especialidades
      const voluntariosComEspecialidades = new Set(
        voluntarioEspecialidades?.map(ve => ve.voluntario_id) || []
      ).size;

      // Calcular média de idade (aproximada)
      const idades = voluntarios?.filter(v => v.data_nascimento).map(v => {
        const nascimento = new Date(v.data_nascimento);
        const hoje = new Date();
        return hoje.getFullYear() - nascimento.getFullYear();
      }) || [];
      const mediaIdade = idades.length > 0 ? Math.round(idades.reduce((a, b) => a + b, 0) / idades.length) : 0;

      setStats({
        totalVoluntarios: voluntarios?.length || 0,
        voluntariosAtivos,
        voluntariosInativos,
        novasInscricoes,
        totalEspecialidades: especialidades?.length || 0,
        voluntariosComEspecialidades,
        mediaIdade,
        totalPontos: 0 // Será calculado quando integrarmos com o sistema de pontos
      });

      // Voluntários recentes (últimos 10)
      const recentes = voluntarios
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(v => ({
          id: v.id,
          nome: v.nome,
          email: v.email,
          data_ingresso: v.data_ingresso || v.created_at,
          especialidades_count: voluntarioEspecialidades?.filter(ve => ve.voluntario_id === v.id).length || 0,
          pontos_total: 0, // Será integrado com sistema de pontos
          ativo: v.ativo
        })) || [];

      setVoluntariosRecentes(recentes);

      // Estatísticas de especialidades
      const especialidadesComContagem = especialidades?.map(esp => ({
        nome: esp.nome,
        total_voluntarios: voluntarioEspecialidades?.filter(ve => 
          ve.especialidade?.nome === esp.nome
        ).length || 0,
        cor: esp.cor,
        icone: esp.icone
      })).sort((a, b) => b.total_voluntarios - a.total_voluntarios) || [];

      setEspecialidadesStats(especialidadesComContagem);

    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Shield, Heart, Users, Star, Award, Calendar, Trophy
    };
    const IconComponent = iconMap[iconName] || Star;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCorClasses = (cor: string) => {
    const corMap: Record<string, string> = {
      red: 'bg-red-100 text-red-800 border-red-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return corMap[cor] || corMap.gray;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho Moderno */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Users className="h-10 w-10 mr-3 text-blue-600" />
                Dashboard de Voluntários
              </h1>
              <p className="text-gray-600 text-lg">
                Gestão completa e inteligente dos voluntários da associação
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => navigate('/dashboard-pontos')}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Sistema de Pontos
              </Button>
              <Button 
                onClick={() => navigate('/voluntarios/novo')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Voluntário
              </Button>
            </div>
          </div>

          {/* Navegação Rápida */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/voluntarios/gestao')}
              className="h-16 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 flex-col"
            >
              <Users className="h-6 w-6 mb-1 text-blue-600" />
              <span className="text-sm">Gestão</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/modulo-voluntarios')}
              className="h-16 bg-white/80 backdrop-blur-sm border-green-200 hover:bg-green-50 flex-col"
            >
              <Settings className="h-6 w-6 mb-1 text-green-600" />
              <span className="text-sm">Módulo</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/voluntarios/relatorios')}
              className="h-16 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50 flex-col"
            >
              <BarChart3 className="h-6 w-6 mb-1 text-purple-600" />
              <span className="text-sm">Relatórios</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/configuracoes/especialidades')}
              className="h-16 bg-white/80 backdrop-blur-sm border-orange-200 hover:bg-orange-50 flex-col"
            >
              <Award className="h-6 w-6 mb-1 text-orange-600" />
              <span className="text-sm">Especialidades</span>
            </Button>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Voluntários</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.totalVoluntarios || 0}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">+{stats?.novasInscricoes || 0} este mês</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Voluntários Ativos</CardTitle>
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.voluntariosAtivos || 0}</div>
              <div className="flex items-center text-sm">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats?.totalVoluntarios ? (stats.voluntariosAtivos / stats.totalVoluntarios) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="ml-2 text-gray-600">
                  {stats?.totalVoluntarios ? Math.round((stats.voluntariosAtivos / stats.totalVoluntarios) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Com Especialidades</CardTitle>
                <Award className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.voluntariosComEspecialidades || 0}</div>
              <div className="flex items-center text-sm">
                <Sparkles className="h-4 w-4 text-purple-600 mr-1" />
                <span className="text-purple-600">{stats?.totalEspecialidades || 0} especialidades</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Média de Idade</CardTitle>
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.mediaIdade || 0} anos</div>
              <div className="flex items-center text-sm">
                <Activity className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-orange-600">Experiência diversa</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voluntários Recentes */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                    Voluntários Recentes
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/voluntarios/gestao')}
                  >
                    Ver Todos
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {voluntariosRecentes.map((voluntario) => (
                    <div key={voluntario.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {voluntario.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{voluntario.nome}</p>
                          <p className="text-sm text-gray-600">{voluntario.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={voluntario.ativo ? "default" : "secondary"}>
                          {voluntario.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge variant="outline">
                          {voluntario.especialidades_count} esp.
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate(`/voluntarios/editar/${voluntario.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Especialidades Populares */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-purple-600" />
                  Especialidades Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {especialidadesStats.slice(0, 8).map((esp, index) => (
                    <div key={esp.nome} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getCorClasses(esp.cor)} border`}>
                          {getIconComponent(esp.icone)}
                          <span className="ml-1 text-xs">{esp.nome}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{esp.total_voluntarios}</span>
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${stats?.voluntariosComEspecialidades ? (esp.total_voluntarios / stats.voluntariosComEspecialidades) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/configuracoes/especialidades')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Gerir Especialidades
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/voluntarios/novo')}
                  className="h-20 flex-col bg-blue-50 border-blue-200 hover:bg-blue-100"
                >
                  <UserPlus className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm">Novo Voluntário</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/voluntarios/relatorios')}
                  className="h-20 flex-col bg-green-50 border-green-200 hover:bg-green-100"
                >
                  <FileText className="h-6 w-6 mb-2 text-green-600" />
                  <span className="text-sm">Relatórios</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/sistema-formacao')}
                  className="h-20 flex-col bg-purple-50 border-purple-200 hover:bg-purple-100"
                >
                  <GraduationCap className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="text-sm">Formações</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard-pontos')}
                  className="h-20 flex-col bg-orange-50 border-orange-200 hover:bg-orange-100"
                >
                  <Trophy className="h-6 w-6 mb-2 text-orange-600" />
                  <span className="text-sm">Pontuações</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default VoluntariosDashboard;