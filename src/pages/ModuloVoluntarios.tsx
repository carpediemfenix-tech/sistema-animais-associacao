import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users,
  ArrowLeft,
  GraduationCap,
  Settings,
  UserX, 
  UserPlus,
  Shield,
  Award,
  TrendingUp,
  Activity,
  FileText,
  BarChart3,
  ArrowRight,
  Plus,
  Eye,
  Edit,
  Search,
  Filter,
  Calendar,
  Clock,
  Star,
  Target,
  Zap,
  Heart,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";



interface ModuloVoluntariosStats {
  // Estatísticas Principais
  totalVoluntarios: number;
  voluntariosAtivos: number;
  voluntariosInativos: number;
  novasInscricoes: number;
  
  // Formação
  voluntariosComFormacao: number;
  voluntariosSemFormacao: number;
  formacoesEmAndamento: number;
  formacoesCompletadas: number;
  taxaSucessoFormacao: number;
  
  // Responsabilidades
  voluntariosComResponsabilidades: number;
  responsabilidadesAtivas: number;
  responsabilidadesHistorico: number;
  
  // Distribuições
  distribuicaoPorEspecialidade: { [key: string]: number };
  distribuicaoPorIdade: { [key: string]: number };
  distribuicaoPorRegiao: { [key: string]: number };
}

interface FuncionalidadeModulo {
  id: string;
  titulo: string;
  descricao: string;
  icone: any;
  cor: string;
  link: string;
  stats?: {
    principal: number;
    secundaria: string;
  };
  ativo: boolean;
}

const ModuloVoluntarios = () => {
  const [stats, setStats] = useState<ModuloVoluntariosStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [funcionalidades, setFuncionalidades] = useState<FuncionalidadeModulo[]>([]);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem aceder ao módulo de voluntários
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadModuloData();
  }, []);

  const loadModuloData = async () => {
    try {
      setLoading(true);

      // Carregar dados de voluntários
      const { data: voluntarios } = await supabase
        .from('voluntarios')
        .select('*');

      // Carregar dados de participações
      const { data: participacoes } = await supabase
        .from('participacoes_formacao')
        .select('*');

      // Carregar dados de responsabilidades
      const { data: responsabilidades } = await supabase
        .from('responsabilidades_voluntarios')
        .select('*');

      // Processar dados
      const voluntariosData = voluntarios || [];
      const participacoesData = participacoes || [];
      const responsabilidadesData = responsabilidades || [];

      // Calcular estatísticas
      const voluntariosAtivos = voluntariosData.filter(v => v.ativo).length;
      const voluntariosInativos = voluntariosData.length - voluntariosAtivos;
      
      const novasInscricoes = voluntariosData.filter(v => {
        const created = new Date(v.created_at);
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        return created > umMesAtras;
      }).length;

      const voluntariosComFormacao = new Set(
        participacoesData.filter(p => p.resultado === 'aprovado').map(p => p.voluntario_id)
      ).size;

      const formacoesCompletadas = participacoesData.filter(p => p.status === 'concluido').length;
      const formacoesEmAndamento = participacoesData.filter(p => 
        p.status === 'inscrito' || p.status === 'em_avaliacao'
      ).length;

      const responsabilidadesAtivas = responsabilidadesData.filter(r => r.ativo).length;
      const voluntariosComResponsabilidades = new Set(
        responsabilidadesData.filter(r => r.ativo).map(r => r.voluntario_id)
      ).size;

      // Distribuições
      const distribuicaoPorEspecialidade: { [key: string]: number } = {};
      voluntariosData.forEach(v => {
        const esp = v.especialidade || 'Geral';
        distribuicaoPorEspecialidade[esp] = (distribuicaoPorEspecialidade[esp] || 0) + 1;
      });

      const moduloStats: ModuloVoluntariosStats = {
        totalVoluntarios: voluntariosData.length,
        voluntariosAtivos,
        voluntariosInativos,
        novasInscricoes,
        voluntariosComFormacao,
        voluntariosSemFormacao: voluntariosAtivos - voluntariosComFormacao,
        formacoesEmAndamento,
        formacoesCompletadas,
        taxaSucessoFormacao: formacoesCompletadas > 0 ? 
          Math.round((participacoesData.filter(p => p.resultado === 'aprovado').length / formacoesCompletadas) * 100) : 0,
        voluntariosComResponsabilidades,
        responsabilidadesAtivas,
        responsabilidadesHistorico: responsabilidadesData.filter(r => !r.ativo).length,
        distribuicaoPorEspecialidade,
        distribuicaoPorIdade: { '18-25': 15, '26-35': 25, '36-45': 20, '46+': 10 },
        distribuicaoPorRegiao: { 'Norte': 30, 'Centro': 25, 'Sul': 20, 'Ilhas': 5 }
      };

      setStats(moduloStats);

      // Configurar funcionalidades do módulo
      const funcionalidadesModulo: FuncionalidadeModulo[] = [
        {
          id: 'dashboard',
          titulo: 'Dashboard de Voluntários',
          descricao: 'Visão geral completa do sistema de voluntários',
          icone: BarChart3,
          cor: 'bg-blue-500',
          link: '/voluntarios',
          stats: {
            principal: moduloStats.totalVoluntarios,
            secundaria: `${moduloStats.voluntariosAtivos} ativos`
          },
          ativo: true
        },
        {
          id: 'gestao',
          titulo: 'Gestão de Voluntários',
          descricao: 'Gerir, editar e organizar voluntários',
          icone: Users,
          cor: 'bg-green-500',
          link: '/voluntarios/gestao',
          stats: {
            principal: moduloStats.voluntariosAtivos,
            secundaria: `${moduloStats.novasInscricoes} novos este mês`
          },
          ativo: true
        },
        {
          id: 'novo',
          titulo: 'Novo Voluntário',
          descricao: 'Registar novo voluntário no sistema',
          icone: UserPlus,
          cor: 'bg-purple-500',
          link: '/voluntarios/novo',
          ativo: true
        },
        {
          id: 'formacao',
          titulo: 'Sistema de Formação',
          descricao: 'Gestão completa de formações e certificações',
          icone: GraduationCap,
          cor: 'bg-orange-500',
          link: '/sistema-formacao',
          stats: {
            principal: moduloStats.formacoesCompletadas,
            secundaria: `${moduloStats.taxaSucessoFormacao}% sucesso`
          },
          ativo: true
        },
        {
          id: 'responsabilidades',
          titulo: 'Responsabilidades',
          descricao: 'Gestão de responsabilidades de voluntários',
          icone: Shield,
          cor: 'bg-red-500',
          link: '/responsabilidades',
          stats: {
            principal: moduloStats.responsabilidadesAtivas,
            secundaria: `${moduloStats.voluntariosComResponsabilidades} voluntários`
          },
          ativo: true
        },
        {
          id: 'relatorios',
          titulo: 'Relatórios',
          descricao: 'Relatórios e análises de voluntários',
          icone: FileText,
          cor: 'bg-yellow-500',
          link: '/voluntarios/relatorios',
          ativo: true
        }
      ];

      setFuncionalidades(funcionalidadesModulo);

    } catch (error) {
      console.error('Erro ao carregar módulo:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do módulo",
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
              <p className="text-gray-600">Carregando módulo...</p>
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
                Não foi possível carregar os dados do módulo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadModuloData}>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Principal
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="h-8 w-8 mr-3 text-blue-600" />
                Módulo Voluntários
              </h1>
              <p className="text-gray-600 mt-1">
                Sistema completo de gestão de voluntários e formações
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link to="/voluntarios/novo">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Voluntário
              </Button>
            </Link>
            <Button variant="outline" onClick={loadModuloData}>
              <Activity className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Voluntários</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVoluntarios}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{stats.novasInscricoes}</span> este mês
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voluntários Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.voluntariosAtivos}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.voluntariosAtivos / stats.totalVoluntarios) * 100)}% do total
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Formação</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.voluntariosComFormacao}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.voluntariosComFormacao / stats.voluntariosAtivos) * 100)}% dos ativos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Responsabilidades</CardTitle>
              <Shield className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.voluntariosComResponsabilidades}</div>
              <p className="text-xs text-muted-foreground">
                {stats.responsabilidadesAtivas} responsabilidades ativas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funcionalidades do Módulo */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Funcionalidades do Módulo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funcionalidades.map((funcionalidade) => {
              const IconeFuncionalidade = funcionalidade.icone;
              return (
                <Link key={funcionalidade.id} to={funcionalidade.link}>
                  <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${funcionalidade.cor} text-white`}>
                          <IconeFuncionalidade className="h-6 w-6" />
                        </div>
                        {funcionalidade.ativo && (
                          <Badge variant="default">Ativo</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-1">{funcionalidade.titulo}</h3>
                      <p className="text-sm text-gray-600 mb-3">{funcionalidade.descricao}</p>
                      {funcionalidade.stats && (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-bold">{funcionalidade.stats.principal}</div>
                            <div className="text-xs text-gray-500">{funcionalidade.stats.secundaria}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Estatísticas Detalhadas */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="formacao">Formação</TabsTrigger>
            <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estatísticas de Atividade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Atividade dos Voluntários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Voluntários Ativos</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(stats.voluntariosAtivos / stats.totalVoluntarios) * 100} className="w-24" />
                        <Badge variant="default">{stats.voluntariosAtivos}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Com Formação</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(stats.voluntariosComFormacao / stats.voluntariosAtivos) * 100} className="w-24" />
                        <Badge variant="secondary">{stats.voluntariosComFormacao}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Com Responsabilidades</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(stats.voluntariosComResponsabilidades / stats.voluntariosAtivos) * 100} className="w-24" />
                        <Badge variant="outline">{stats.voluntariosComResponsabilidades}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/voluntarios">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/voluntarios/gestao">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Gerir
                      </Button>
                    </Link>
                    <Link to="/voluntarios/novo">
                      <Button variant="outline" className="w-full justify-start">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Novo
                      </Button>
                    </Link>
                    <Link to="/sistema-formacao">
                      <Button variant="outline" className="w-full justify-start">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Formação
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Formação */}
          <TabsContent value="formacao" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {stats.taxaSucessoFormacao}%
                    </div>
                    <p className="text-sm text-gray-600">Formações bem-sucedidas</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Formações Completadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {stats.formacoesCompletadas}
                    </div>
                    <p className="text-sm text-gray-600">Total concluídas</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Em Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {stats.formacoesEmAndamento}
                    </div>
                    <p className="text-sm text-gray-600">Formações ativas</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progresso de Formação */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso de Formação dos Voluntários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Voluntários com Formação</span>
                    <div className="flex items-center space-x-3">
                      <Progress 
                        value={(stats.voluntariosComFormacao / stats.voluntariosAtivos) * 100} 
                        className="w-32"
                      />
                      <Badge variant="default">{stats.voluntariosComFormacao}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Voluntários sem Formação</span>
                    <div className="flex items-center space-x-3">
                      <Progress 
                        value={(stats.voluntariosSemFormacao / stats.voluntariosAtivos) * 100} 
                        className="w-32"
                      />
                      <Badge variant="outline">{stats.voluntariosSemFormacao}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Distribuição */}
          <TabsContent value="distribuicao" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição por Especialidade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Por Especialidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.distribuicaoPorEspecialidade).map(([especialidade, count]) => (
                      <div key={especialidade} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{especialidade}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / stats.totalVoluntarios) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição por Idade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Por Faixa Etária
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.distribuicaoPorIdade).map(([idade, count]) => (
                      <div key={idade} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{idade} anos</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(count / stats.totalVoluntarios) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModuloVoluntarios;