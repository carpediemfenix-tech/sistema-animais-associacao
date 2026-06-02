import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import {
  Shield,
  PawPrint,
  MapPin,
  Stethoscope,
  UserCog,
  DollarSign,
  Users,
  Layers,
  Database,
  Settings,
  ChevronRight,
  Activity,
  Target,
  Zap,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  FileText,
  Briefcase,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const ModuloAdministrador = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEspecies: 0,
    totalLocalizacoes: 0,
    totalIntervencoes: 0,
    totalResponsabilidades: 0,
    totalCategorias: 0,
    totalGrupos: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas
      const [especies, localizacoes, intervencoes, responsabilidades, categorias, grupos] = await Promise.all([
        supabase.from('especies').select('id', { count: 'exact', head: true }),
        supabase.from('localizacoes').select('id', { count: 'exact', head: true }),
        supabase.from('tipos_intervencao').select('id', { count: 'exact', head: true }),
        supabase.from('tipos_responsabilidade').select('id', { count: 'exact', head: true }),
        supabase.from('categorias_financeiras').select('id', { count: 'exact', head: true }),
        supabase.from('grupos').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalEspecies: especies.count || 0,
        totalLocalizacoes: localizacoes.count || 0,
        totalIntervencoes: intervencoes.count || 0,
        totalResponsabilidades: responsabilidades.count || 0,
        totalCategorias: categorias.count || 0,
        totalGrupos: grupos.count || 0
      });
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seções do módulo Animais
  const secoesAnimais = [
    {
      titulo: "Gestão de Espécies",
      descricao: "Configurar espécies de animais",
      icone: PawPrint,
      rota: "/configuracoes/especies",
      cor: "from-orange-600 to-orange-700",
      corBorda: "border-orange-500",
      total: stats.totalEspecies,
      status: "operacional"
    },
    {
      titulo: "Tipo de Localização",
      descricao: "Gerir tipos de localização",
      icone: MapPin,
      rota: "/configuracoes/localizacoes",
      cor: "from-blue-600 to-blue-700",
      corBorda: "border-blue-500",
      total: stats.totalLocalizacoes,
      status: "operacional"
    },
    {
      titulo: "Tipo de Intervenção",
      descricao: "Configurar tipos de intervenção",
      icone: Stethoscope,
      rota: "/configuracoes/intervencoes",
      cor: "from-red-600 to-red-700",
      corBorda: "border-red-500",
      total: stats.totalIntervencoes,
      status: "operacional"
    },
    {
      titulo: "Tipo de Responsabilidade",
      descricao: "Gerir responsabilidades",
      icone: UserCog,
      rota: "/configuracoes/responsabilidades",
      cor: "from-purple-600 to-purple-700",
      corBorda: "border-purple-500",
      total: stats.totalResponsabilidades,
      status: "operacional"
    },
    {
      titulo: "Categorias Financeiras",
      descricao: "Configurar categorias financeiras",
      icone: DollarSign,
      rota: "/configuracoes/categorias",
      cor: "from-green-600 to-green-700",
      corBorda: "border-green-500",
      total: stats.totalCategorias,
      status: "operacional"
    },
    {
      titulo: "Tipo de Grupos",
      descricao: "Gerir tipos de grupos (Matilhas/Colónias)",
      icone: Home,
      rota: "/configuracoes/grupos",
      cor: "from-indigo-600 to-indigo-700",
      corBorda: "border-indigo-500",
      total: stats.totalGrupos,
      status: "operacional"
    },
    {
      titulo: "Estados dos Animais",
      descricao: "Gerir tipos de estado (Ativo/Adotado/etc.)",
      icone: Activity,
      rota: "/configuracoes/estados",
      cor: "from-teal-600 to-teal-700",
      corBorda: "border-teal-500",
      total: 7, // Estados padrão criados
      status: "operacional"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300 font-mono">CARREGANDO SISTEMA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <EnhancedHeader />

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Tático */}
          <div className="mb-8 relative">
            {/* Linha decorativa superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
            
            <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-orange-500/30 rounded-lg p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Badge Tático */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-lg shadow-lg border-2 border-orange-400">
                      <Shield className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-wider">
                        MÓDULO ADMINISTRADOR
                      </h1>
                      <Badge className="bg-orange-500 text-white font-mono text-xs px-3 py-1 animate-pulse">
                        NÍVEL 5
                      </Badge>
                    </div>
                    <p className="text-slate-300 font-mono text-sm">
                      SISTEMA DE CONFIGURAÇÃO E GESTÃO AVANÇADA
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs font-mono">SISTEMA OPERACIONAL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-400 text-xs font-mono">
                          {new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="hidden lg:flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded border border-green-500/30">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-400 text-xs font-mono">ACESSO AUTORIZADO</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded border border-blue-500/30">
                    <Lock className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-400 text-xs font-mono">SEGURANÇA ATIVA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Linha decorativa inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "ESPÉCIES", value: stats.totalEspecies, icon: PawPrint, color: "orange" },
              { label: "LOCALIZAÇÕES", value: stats.totalLocalizacoes, icon: MapPin, color: "blue" },
              { label: "INTERVENÇÕES", value: stats.totalIntervencoes, icon: Stethoscope, color: "red" },
              { label: "RESPONSAB.", value: stats.totalResponsabilidades, icon: UserCog, color: "purple" },
              { label: "CATEGORIAS", value: stats.totalCategorias, icon: DollarSign, color: "green" },
              { label: "GRUPOS", value: stats.totalGrupos, icon: Home, color: "indigo" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 hover:border-orange-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 text-${stat.color}-500 group-hover:scale-110 transition-transform`} />
                  <div className={`h-1.5 w-1.5 bg-${stat.color}-500 rounded-full animate-pulse`}></div>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-xs text-slate-400 font-mono mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Seção: MÓDULO ANIMAIS */}
          <div className="mb-8">
            {/* Header da Seção */}
            <div className="bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-l-4 border-orange-500 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
                  <PawPrint className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-mono">SEÇÃO: MÓDULO ANIMAIS</h2>
                  <p className="text-slate-300 text-sm font-mono">Configurações e gestão de dados do módulo de animais</p>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                    {secoesAnimais.length} SUBSISTEMAS
                  </Badge>
                </div>
              </div>
            </div>

            {/* Grid de Cards Táticos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {secoesAnimais.map((secao, index) => {
                const Icon = secao.icone;
                return (
                  <Link key={index} to={secao.rota}>
                    <Card className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 ${secao.corBorda} hover:border-opacity-100 border-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`bg-gradient-to-br ${secao.cor} p-3 rounded-lg shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-xs">
                              {secao.status.toUpperCase()}
                            </Badge>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white font-mono">{secao.total}</div>
                              <div className="text-xs text-slate-400 font-mono">REGISTROS</div>
                            </div>
                          </div>
                        </div>
                        <CardTitle className="text-white font-mono text-lg group-hover:text-orange-400 transition-colors">
                          {secao.titulo}
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-mono text-sm">
                          {secao.descricao}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                            <span className="text-xs text-slate-400 font-mono">ATIVO</span>
                          </div>
                          <div className="flex items-center gap-2 text-orange-400 group-hover:gap-3 transition-all">
                            <span className="text-xs font-mono font-semibold">ACESSAR</span>
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Seção: MÓDULO VOLUNTÁRIOS */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-mono">SEÇÃO: MÓDULO VOLUNTÁRIOS</h2>
                  <p className="text-slate-300 text-sm font-mono">Configurações e gestão de dados do módulo de voluntários</p>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                    2 SUBSISTEMAS
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/configuracao-especialidades">
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-blue-500 hover:border-opacity-100 border-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-xs">
                          OPERACIONAL
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-white font-mono text-lg group-hover:text-blue-400 transition-colors">
                      Especialidades
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-mono text-sm">
                      Configurar especialidades dos voluntários
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                        <span className="text-xs text-slate-400 font-mono">ATIVO</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all">
                        <span className="text-xs font-mono font-semibold">ACESSAR</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/configuracoes/responsabilidades">
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-purple-500 hover:border-opacity-100 border-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                        <UserCog className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-xs">
                          OPERACIONAL
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-white font-mono text-lg group-hover:text-purple-400 transition-colors">
                      Responsabilidades
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-mono text-sm">
                      Gerir tipos de responsabilidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                        <span className="text-xs text-slate-400 font-mono">ATIVO</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-400 group-hover:gap-3 transition-all">
                        <span className="text-xs font-mono font-semibold">ACESSAR</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Seção: MÓDULO FINANCEIRO */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-l-4 border-green-500 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-mono">SEÇÃO: MÓDULO FINANCEIRO</h2>
                  <p className="text-slate-300 text-sm font-mono">Configurações e gestão de dados financeiros</p>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-mono">
                    2 SUBSISTEMAS
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/configuracoes/categorias">
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-green-500 hover:border-opacity-100 border-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-xs">
                          OPERACIONAL
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-white font-mono text-lg group-hover:text-green-400 transition-colors">
                      Categorias Financeiras
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-mono text-sm">
                      Configurar categorias de receitas e despesas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                        <span className="text-xs text-slate-400 font-mono">ATIVO</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400 group-hover:gap-3 transition-all">
                        <span className="text-xs font-mono font-semibold">ACESSAR</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/gestao-financeira">
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-emerald-500 hover:border-opacity-100 border-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-xs">
                          OPERACIONAL
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-white font-mono text-lg group-hover:text-emerald-400 transition-colors">
                      Gestão Financeira
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-mono text-sm">
                      Gerir transações e relatórios financeiros
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                        <span className="text-xs text-slate-400 font-mono">ATIVO</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400 group-hover:gap-3 transition-all">
                        <span className="text-xs font-mono font-semibold">ACESSAR</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Seção: CONFIGURAÇÕES GERAIS */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-slate-600/20 to-slate-700/20 border-l-4 border-slate-500 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-slate-500/20 p-3 rounded-lg border border-slate-500/30">
                  <Settings className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-mono">SEÇÃO: CONFIGURAÇÕES GERAIS</h2>
                  <p className="text-slate-300 text-sm font-mono">Configurações gerais do sistema</p>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-slate-500/20 text-slate-400 border border-slate-500/30 font-mono">
                    3 SUBSISTEMAS
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/utilizadores">
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-blue-500 hover:border-opacity-100 border-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-xs">
                          OPERACIONAL
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-white font-mono text-lg group-hover:text-blue-400 transition-colors">
                      Utilizadores
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-mono text-sm">
                      Gestão de utilizadores e permissões
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                        <span className="text-xs text-slate-400 font-mono">ATIVO</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all">
                        <span className="text-xs font-mono font-semibold">ACESSAR</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/logs-acesso">
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-purple-500 hover:border-opacity-100 border-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-xs">
                          OPERACIONAL
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-white font-mono text-lg group-hover:text-purple-400 transition-colors">
                      Logs de Acesso
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-mono text-sm">
                      Auditoria e monitoramento do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                        <span className="text-xs text-slate-400 font-mono">ATIVO</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-400 group-hover:gap-3 transition-all">
                        <span className="text-xs font-mono font-semibold">ACESSAR</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/configuracoes/clinicas">
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-teal-500 hover:border-opacity-100 border-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-3 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-xs">
                          OPERACIONAL
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-white font-mono text-lg group-hover:text-teal-400 transition-colors">
                      Clínicas Veterinárias
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-mono text-sm">
                      Gerir clínicas e protocolos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                        <span className="text-xs text-slate-400 font-mono">ATIVO</span>
                      </div>
                      <div className="flex items-center gap-2 text-teal-400 group-hover:gap-3 transition-all">
                        <span className="text-xs font-mono font-semibold">ACESSAR</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button 
              asChild
              className="h-auto py-6 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border-2 border-slate-600 text-white font-mono"
            >
              <Link to="/dashboard" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-bold">DASHBOARD</div>
                    <div className="text-xs opacity-75">Voltar ao painel principal</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button 
              asChild
              className="h-auto py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-2 border-blue-500 text-white font-mono"
            >
              <Link to="/utilizadores" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-bold">UTILIZADORES</div>
                    <div className="text-xs opacity-75">Gestão de acessos</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button 
              asChild
              className="h-auto py-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-2 border-purple-500 text-white font-mono"
            >
              <Link to="/logs-acesso" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-bold">LOGS DE ACESSO</div>
                    <div className="text-xs opacity-75">Auditoria do sistema</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Alerta de Segurança */}
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-l-4 border-yellow-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-yellow-400 font-mono font-bold mb-1">AVISO DE SEGURANÇA</h3>
                <p className="text-slate-300 text-sm font-mono">
                  Este módulo contém configurações críticas do sistema. Alterações incorretas podem afetar o funcionamento de todo o sistema. 
                  Certifique-se de ter as permissões adequadas antes de realizar qualquer modificação.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default ModuloAdministrador;
