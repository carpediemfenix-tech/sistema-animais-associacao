import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users,
  ArrowLeft,
  Settings,
  Eye,
  Plus,
  GraduationCap,
  FileText,
  BarChart3,
  UserCheck,
  Award,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EstatisticasVoluntarios {
  totalVoluntarios: number;
  voluntariosAtivos: number;
  voluntariosInativos: number;
  totalFormacoes: number;
  formacoesAtivas: number;
  participacoesTotal: number;
}

const ModuloVoluntarios = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasVoluntarios>({
    totalVoluntarios: 0,
    voluntariosAtivos: 0,
    voluntariosInativos: 0,
    totalFormacoes: 0,
    formacoesAtivas: 0,
    participacoesTotal: 0
  });

  const funcionalidades = [
    {
      titulo: "Dashboard de Voluntários",
      descricao: "Visão geral e estatísticas completas",
      icone: BarChart3,
      rota: "/voluntarios/dashboard",
      cor: "bg-blue-500",
      status: "ativo"
    },
    {
      titulo: "Gestão de Voluntários",
      descricao: "Lista, edição e gestão completa",
      icone: Users,
      rota: "/voluntarios/gestao",
      cor: "bg-green-500",
      status: "ativo"
    },
    {
      titulo: "Sistema de Formação",
      descricao: "Formações, avaliações e certificações",
      icone: GraduationCap,
      rota: "/sistema-formacao",
      cor: "bg-purple-500",
      status: "ativo"
    },
    {
      titulo: "Relatórios Avançados",
      descricao: "Análises e relatórios detalhados",
      icone: FileText,
      rota: "/voluntarios/relatorios",
      cor: "bg-orange-500",
      status: "ativo"
    }
  ];

  const configuracoes = [
    {
      titulo: "Sistema de Formação Valentão",
      descricao: "Gerir tipos de formação, ações e participantes",
      icone: GraduationCap,
      rota: "/sistema-formacao",
      status: "ativo",
      funcionalidades: ["Tipos de Formação", "Ações de Formação", "Participantes", "Avaliações"]
    },
    {
      titulo: "Especialidades dos Voluntários",
      descricao: "Configurar especialidades e competências",
      icone: Settings,
      rota: "/configuracoes/especialidades",
      status: "desenvolvimento",
      funcionalidades: ["Definir Especialidades", "Competências", "Certificações"]
    }
  ];

  useEffect(() => {
    loadEstatisticasVoluntarios();
  }, []);

  const loadEstatisticasVoluntarios = async () => {
    try {
      setLoading(true);

      // Carregar voluntários
      const { data: voluntarios } = await supabase
        .from('voluntarios')
        .select('ativo')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Carregar ações de formação
      const { data: acoes } = await supabase
        .from('acoes_formacao')
        .select('id, ativo')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Carregar participações
      const { data: participacoes } = await supabase
        .from('participacoes_formacao')
        .select('id')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Calcular estatísticas
      const totalVoluntarios = voluntarios?.length || 0;
      const voluntariosAtivos = voluntarios?.filter(v => v.ativo).length || 0;
      const voluntariosInativos = totalVoluntarios - voluntariosAtivos;
      const totalFormacoes = acoes?.length || 0;
      const formacoesAtivas = acoes?.filter(a => a.ativo !== false).length || 0;
      const participacoesTotal = participacoes?.length || 0;

      setEstatisticas({
        totalVoluntarios,
        voluntariosAtivos,
        voluntariosInativos,
        totalFormacoes,
        formacoesAtivas,
        participacoesTotal
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas de voluntários:', error);
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Principal
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <Users className="h-10 w-10 mr-3 text-blue-600" />
                Módulo Voluntários
              </h1>
              <p className="text-gray-600 text-lg">
                Sistema completo de gestão de voluntários e formação
              </p>
            </div>
          </div>
          <Link to="/voluntarios/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Voluntário
            </Button>
          </Link>
        </div>

        {/* Estatísticas do Módulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Voluntários</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalVoluntarios}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.voluntariosAtivos} ativos, {estatisticas.voluntariosInativos} inativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Formações</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalFormacoes}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.formacoesAtivas} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participações</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.participacoesTotal}</div>
              <p className="text-xs text-muted-foreground">
                Total de inscrições
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funcionalidades Principais */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-6 w-6 mr-2" />
              Funcionalidades Principais
            </CardTitle>
            <CardDescription>
              Acesso às principais funcionalidades do módulo de voluntários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {funcionalidades.map((func, index) => {
                const IconeFunc = func.icone;
                return (
                  <Link key={index} to={func.rota}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-lg ${func.cor} text-white w-fit`}>
                            <IconeFunc className="h-6 w-6" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{func.titulo}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          {func.descricao}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Configurações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Configurações do Módulo
            </CardTitle>
            <CardDescription>
              Configurações específicas do módulo de voluntários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {configuracoes.map((config, index) => {
                const IconeConfig = config.icone;
                const isAtivo = config.status === "ativo";
                
                return (
                  <div key={index}>
                    {isAtivo ? (
                      <Link to={config.rota}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <IconeConfig className="h-6 w-6 text-blue-600" />
                                <div>
                                  <h3 className="font-semibold text-lg">{config.titulo}</h3>
                                  <p className="text-sm text-gray-600">{config.descricao}</p>
                                </div>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Funcional
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">Funcionalidades disponíveis:</p>
                              <div className="flex flex-wrap gap-1">
                                {config.funcionalidades.map((func, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {func}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ) : (
                      <Card className="opacity-50 cursor-not-allowed">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <IconeConfig className="h-6 w-6 text-gray-400" />
                              <div>
                                <h3 className="font-semibold text-lg text-gray-500">{config.titulo}</h3>
                                <p className="text-sm text-gray-400">{config.descricao}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Em Desenvolvimento
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500">Funcionalidades planeadas:</p>
                            <div className="flex flex-wrap gap-1">
                              {config.funcionalidades.map((func, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs text-gray-400">
                                  {func}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModuloVoluntarios;