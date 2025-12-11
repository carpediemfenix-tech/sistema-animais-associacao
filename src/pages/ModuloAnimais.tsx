import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart,
  ArrowLeft,
  Eye,
  Archive,
  MapPin,
  Users,
  Settings,
  BarChart3,
  Plus,
  Grid3X3,
  Stethoscope,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface EstatisticasAnimais {
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  animaisArquivados: number;
  totalCaes: number;
  totalGatos: number;
  totalGrupos: number;
  totalLocalizacoes: number;
}

const ModuloAnimais = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasAnimais>({
    totalAnimais: 0,
    animaisAtivos: 0,
    animaisAdotados: 0,
    animaisArquivados: 0,
    totalCaes: 0,
    totalGatos: 0,
    totalGrupos: 0,
    totalLocalizacoes: 0
  });

  const funcionalidades = [
    {
      titulo: "Ver Animais",
      descricao: "Lista completa de todos os animais",
      icone: Eye,
      rota: "/animais",
      cor: "bg-blue-500"
    },
    {
      titulo: "Ver Grupos",
      descricao: "Gestão de matilhas e colónias",
      icone: Users,
      rota: "/grupos",
      cor: "bg-green-500"
    },
    {
      titulo: "Ver Arquivados",
      descricao: "Animais arquivados do sistema",
      icone: Archive,
      rota: "/animais-arquivados",
      cor: "bg-gray-500"
    },
    {
      titulo: "Localizações",
      descricao: "Gestão de localizações e espaços",
      icone: MapPin,
      rota: "/configuracoes/localizacoes",
      cor: "bg-purple-500"
    },
    {
      titulo: "Histórico de Nomes",
      descricao: "Histórico de alterações de nomes",
      icone: Settings,
      rota: "/historico-nomes",
      cor: "bg-indigo-500"
    }
  ];

  const configuracoes = [
    {
      titulo: "Gestão de Espécies",
      descricao: "Configurar espécies de animais",
      icone: Heart,
      rota: "/configuracoes/especies"
    },
    {
      titulo: "Tipo de Localização",
      descricao: "Configurar tipos de localização",
      icone: MapPin,
      rota: "/configuracoes/localizacoes"
    },
    {
      titulo: "Tipo de Intervenção",
      descricao: "Configurar tipos de intervenção médica",
      icone: Stethoscope,
      rota: "/configuracoes/intervencoes"
    },
    {
      titulo: "Tipo de Responsabilidade",
      descricao: "Configurar tipos de responsabilidade",
      icone: Target,
      rota: "/configuracoes/responsabilidades"
    },
    {
      titulo: "Categorias Financeiras",
      descricao: "Gestão de categorias financeiras",
      icone: Grid3X3,
      rota: "/configuracoes/categorias"
    }
  ];

  useEffect(() => {
    loadEstatisticasAnimais();
  }, []);

  const loadEstatisticasAnimais = async () => {
    try {
      setLoading(true);

      // Carregar animais
      const { data: animais } = await supabase
        .from('animais')
        .select('estado, arquivado, especie')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Carregar grupos
      const { data: grupos } = await supabase
        .from('grupos')
        .select('id')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Carregar localizações
      const { data: localizacoes } = await supabase
        .from('localizacoes')
        .select('id')
        .then(result => ({ data: result.data || [] }))
        .catch(() => ({ data: [] }));

      // Calcular estatísticas
      const totalAnimais = animais?.length || 0;
      const animaisAtivos = animais?.filter(a => !a.arquivado && a.estado !== 'Adotado').length || 0;
      const animaisAdotados = animais?.filter(a => a.estado === 'Adotado').length || 0;
      const animaisArquivados = animais?.filter(a => a.arquivado).length || 0;
      const totalCaes = animais?.filter(a => a.especie === 'Cão').length || 0;
      const totalGatos = animais?.filter(a => a.especie === 'Gato').length || 0;
      const totalGrupos = grupos?.length || 0;
      const totalLocalizacoes = localizacoes?.length || 0;

      setEstatisticas({
        totalAnimais,
        animaisAtivos,
        animaisAdotados,
        animaisArquivados,
        totalCaes,
        totalGatos,
        totalGrupos,
        totalLocalizacoes
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas de animais:', error);
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
      <div className="bg-gradient-to-br from-red-50 to-pink-100 p-6 flex-1">
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
                <Heart className="h-10 w-10 mr-3 text-red-600" />
                Módulo Animais
              </h1>
              <p className="text-gray-600 text-lg">
                Gestão completa de animais, grupos e localizações
              </p>
            </div>
          </div>
          <Link to="/novo-animal">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Animal
            </Button>
          </Link>
        </div>

        {/* Estatísticas do Módulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalAnimais}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.animaisAtivos} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Espécie</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalCaes + estatisticas.totalGatos}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.totalCaes} cães, {estatisticas.totalGatos} gatos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grupos</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalGrupos}</div>
              <p className="text-xs text-muted-foreground">
                Matilhas e colónias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Localizações</CardTitle>
              <MapPin className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalLocalizacoes}</div>
              <p className="text-xs text-muted-foreground">
                Espaços disponíveis
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
              Acesso às principais funcionalidades do módulo de animais
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
                        <div className={`p-3 rounded-lg ${func.cor} text-white w-fit`}>
                          <IconeFunc className="h-6 w-6" />
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

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Configurações do Módulo
            </CardTitle>
            <CardDescription>
              Configurações específicas do módulo de animais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {configuracoes.map((config, index) => {
                const IconeConfig = config.icone;
                return (
                  <Link key={index} to={config.rota}>
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <IconeConfig className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="font-semibold text-sm">{config.titulo}</h3>
                          <p className="text-xs text-gray-500">{config.descricao}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default ModuloAnimais;