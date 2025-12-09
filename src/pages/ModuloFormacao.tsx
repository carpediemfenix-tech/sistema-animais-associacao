import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap,
  ArrowLeft,
  Settings,
  Eye,
  Plus,
  BarChart3,
  Users,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  BookOpen,
  Target,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface EstatisticasFormacao {
  totalTipos: number;
  tiposAtivos: number;
  totalAcoes: number;
  acoesAtivas: number;
  totalParticipacoes: number;
  participacoesAprovadas: number;
  taxaAprovacao: number;
}

const ModuloFormacao = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasFormacao>({
    totalTipos: 0,
    tiposAtivos: 0,
    totalAcoes: 0,
    acoesAtivas: 0,
    totalParticipacoes: 0,
    participacoesAprovadas: 0,
    taxaAprovacao: 0
  });

  const funcionalidades = [
    {
      titulo: "Sistema de Formação Valentão",
      descricao: "Acesso completo ao sistema de formação",
      icone: GraduationCap,
      rota: "/sistema-formacao",
      cor: "bg-green-500",
      destaque: true
    },
    {
      titulo: "Dashboard de Voluntários",
      descricao: "Ver voluntários e suas formações",
      icone: Users,
      rota: "/voluntarios",
      cor: "bg-blue-500",
      destaque: false
    },
    {
      titulo: "Relatórios de Formação",
      descricao: "Análises e estatísticas detalhadas",
      icone: BarChart3,
      rota: "/voluntarios/relatorios",
      cor: "bg-purple-500",
      destaque: false
    }
  ];

  const recursos = [
    {
      titulo: "Tipos de Formação",
      descricao: "Gerir e configurar tipos de formação",
      icone: BookOpen,
      quantidade: estatisticas.totalTipos,
      status: "ativo"
    },
    {
      titulo: "Ações de Formação",
      descricao: "Criar e gerir ações específicas",
      icone: Target,
      quantidade: estatisticas.totalAcoes,
      status: "ativo"
    },
    {
      titulo: "Participações",
      descricao: "Gerir inscrições e avaliações",
      icone: Users,
      quantidade: estatisticas.totalParticipacoes,
      status: "ativo"
    },
    {
      titulo: "Certificações",
      descricao: "Sistema de certificados e diplomas",
      icone: Award,
      quantidade: estatisticas.participacoesAprovadas,
      status: "ativo"
    }
  ];

  useEffect(() => {
    loadEstatisticasFormacao();
  }, []);

  const loadEstatisticasFormacao = async () => {
    try {
      setLoading(true);

      // Carregar tipos de formação
      const { data: tipos } = await supabase
        .from('tipos_formacao')
        .select('id, ativo')
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
        .select('id, resultado')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Calcular estatísticas
      const totalTipos = tipos?.length || 0;
      const tiposAtivos = tipos?.filter(t => t.ativo !== false).length || 0;
      const totalAcoes = acoes?.length || 0;
      const acoesAtivas = acoes?.filter(a => a.ativo !== false).length || 0;
      const totalParticipacoes = participacoes?.length || 0;
      const participacoesAprovadas = participacoes?.filter(p => p.resultado === 'aprovado').length || 0;
      const taxaAprovacao = totalParticipacoes > 0 ? Math.round((participacoesAprovadas / totalParticipacoes) * 100) : 0;

      setEstatisticas({
        totalTipos,
        tiposAtivos,
        totalAcoes,
        acoesAtivas,
        totalParticipacoes,
        participacoesAprovadas,
        taxaAprovacao
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas de formação:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
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
                <GraduationCap className="h-10 w-10 mr-3 text-green-600" />
                Módulo Formação
              </h1>
              <p className="text-gray-600 text-lg">
                Sistema completo de formação e desenvolvimento de competências
              </p>
            </div>
          </div>
          <Link to="/sistema-formacao">
            <Button>
              <GraduationCap className="h-4 w-4 mr-2" />
              Aceder ao Sistema
            </Button>
          </Link>
        </div>

        {/* Estatísticas do Módulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipos de Formação</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalTipos}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.tiposAtivos} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações de Formação</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalAcoes}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.acoesAtivas} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participações</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalParticipacoes}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.participacoesAprovadas} aprovadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <Award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.taxaAprovacao}%</div>
              <p className="text-xs text-muted-foreground">
                Sucesso nas formações
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
              Acesso às principais funcionalidades do módulo de formação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {funcionalidades.map((func, index) => {
                const IconeFunc = func.icone;
                return (
                  <Link key={index} to={func.rota}>
                    <Card className={`hover:shadow-lg transition-shadow cursor-pointer h-full ${func.destaque ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-lg ${func.cor} text-white w-fit`}>
                            <IconeFunc className="h-6 w-6" />
                          </div>
                          {func.destaque && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <Star className="h-3 w-3 mr-1" />
                              Principal
                            </Badge>
                          )}
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

        {/* Recursos Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Recursos do Sistema
            </CardTitle>
            <CardDescription>
              Recursos e funcionalidades disponíveis no sistema de formação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recursos.map((recurso, index) => {
                const IconeRecurso = recurso.icone;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <IconeRecurso className="h-6 w-6 text-green-600" />
                        <Badge variant="outline" className="text-xs">
                          {recurso.quantidade}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{recurso.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {recurso.descricao}
                      </p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Funcional
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModuloFormacao;