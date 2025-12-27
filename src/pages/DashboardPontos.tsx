import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy,
  Star,
  Award,
  Crown,
  Shield,
  Heart,
  Clock,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  Medal,
  Gift,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Download,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interfaces
interface PontuacaoVoluntario {
  id: string;
  voluntario_id: string;
  pontos_totais: number;
  nivel: string;
  badges: string[];
  missoes_participadas: number;
  horas_totais: number;
  ultima_atividade: string;
  voluntario?: {
    nome: string;
    email: string;
  };
}

interface HistoricoPonto {
  id: string;
  voluntario_id: string;
  pontos_ganhos: number;
  tipo_acao: string;
  descricao: string;
  data_acao: string;
  missao?: {
    codigo: string;
    titulo: string;
  };
}

interface Badge {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  pontos_necessarios: number;
}

const DashboardPontos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados principais
  const [ranking, setRanking] = useState<PontuacaoVoluntario[]>([]);
  const [historico, setHistorico] = useState<HistoricoPonto[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para estatísticas
  const [estatisticas, setEstatisticas] = useState({
    totalVoluntarios: 0,
    pontosDistribuidos: 0,
    missoesComPontos: 0,
    mediaHorasPorVoluntario: 0
  });

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadRanking(),
        loadHistorico(),
        loadBadges(),
        loadEstatisticas()
      ]);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadRanking = async () => {
    const { data, error } = await supabase
      .from('pontuacao_voluntarios_2025_12_22_02_00')
      .select(`
        *,
        voluntario:voluntarios(nome, email)
      `)
      .order('pontos_totais', { ascending: false })
      .limit(50);

    if (error) throw error;
    setRanking(data || []);
  };

  const loadHistorico = async () => {
    const { data, error } = await supabase
      .from('historico_pontos_2025_12_22_02_00')
      .select(`
        *,
        missao:missoes_2025_12_21_19_00(codigo, titulo)
      `)
      .order('data_acao', { ascending: false })
      .limit(100);

    if (error) throw error;
    setHistorico(data || []);
  };

  const loadBadges = async () => {
    const { data, error } = await supabase
      .from('badges_sistema_2025_12_22_02_00')
      .select('*')
      .eq('ativo', true)
      .order('pontos_necessarios');

    if (error) throw error;
    setBadges(data || []);
  };

  const loadEstatisticas = async () => {
    try {
      // Total de voluntários com pontos
      const { count: totalVoluntarios } = await supabase
        .from('pontuacao_voluntarios_2025_12_22_02_00')
        .select('*', { count: 'exact', head: true });

      // Total de pontos distribuídos
      const { data: pontosData } = await supabase
        .from('historico_pontos_2025_12_22_02_00')
        .select('pontos_ganhos');

      const pontosDistribuidos = pontosData?.reduce((sum, item) => sum + item.pontos_ganhos, 0) || 0;

      // Missões com pontos
      const { data: missoesData } = await supabase
        .from('historico_pontos_2025_12_22_02_00')
        .select('missao_id')
        .not('missao_id', 'is', null);

      const missoesUnicas = new Set(missoesData?.map(item => item.missao_id)).size;

      // Média de horas
      const { data: horasData } = await supabase
        .from('pontuacao_voluntarios_2025_12_22_02_00')
        .select('total_horas');

      const totalHoras = horasData?.reduce((sum, item) => sum + (item.total_horas || 0), 0) || 0;
      const mediaHoras = totalVoluntarios ? totalHoras / totalVoluntarios : 0;

      setEstatisticas({
        totalVoluntarios: totalVoluntarios || 0,
        pontosDistribuidos,
        missoesComPontos: missoesUnicas,
        mediaHorasPorVoluntario: mediaHoras
      });
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  // Obter ícone do nível
  const getNivelIcon = (nivel: string) => {
    const nivelConfig = {
      'iniciante': { icon: Star, color: 'text-gray-500' },
      'experiente': { icon: Award, color: 'text-blue-500' },
      'veterano': { icon: Shield, color: 'text-purple-500' },
      'lenda': { icon: Crown, color: 'text-yellow-500' }
    };

    const config = nivelConfig[nivel as keyof typeof nivelConfig] || nivelConfig.iniciante;
    return config;
  };

  // Obter badge de nível
  const getNivelBadge = (nivel: string) => {
    const nivelConfig = {
      'iniciante': { color: 'bg-gray-100 text-gray-800', label: 'Iniciante' },
      'experiente': { color: 'bg-blue-100 text-blue-800', label: 'Experiente' },
      'veterano': { color: 'bg-purple-100 text-purple-800', label: 'Veterano' },
      'lenda': { color: 'bg-yellow-100 text-yellow-800', label: 'Lenda' }
    };

    const config = nivelConfig[nivel as keyof typeof nivelConfig] || nivelConfig.iniciante;
    const IconComponent = getNivelIcon(nivel).icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  // Obter ícone do badge
  const getBadgeIcon = (icone: string) => {
    const iconMap: { [key: string]: any } = {
      'Star': Star,
      'Award': Award,
      'Heart': Heart,
      'Crown': Crown,
      'Shield': Shield,
      'Clock': Clock,
      'Trophy': Trophy,
      'Medal': Medal
    };

    return iconMap[icone] || Star;
  };

  // Obter ícone da ação
  const getAcaoIcon = (tipo: string) => {
    const tipoConfig = {
      'participacao': { icon: Users, color: 'text-blue-500' },
      'coordenacao': { icon: Shield, color: 'text-purple-500' },
      'bonus': { icon: Gift, color: 'text-green-500' },
      'penalidade': { icon: Minus, color: 'text-red-500' }
    };

    return tipoConfig[tipo as keyof typeof tipoConfig] || tipoConfig.participacao;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Trophy className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando sistema de pontos...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dados</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
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
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Sistema de Pontos
            </h1>
            <p className="text-gray-600">
              Gamificação e reconhecimento de voluntários
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Ranking
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Voluntários Ativos</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas.totalVoluntarios}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pontos Distribuídos</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas.pontosDistribuidos}</p>
                </div>
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Missões com Pontos</p>
                  <p className="text-3xl font-bold text-purple-600">{estatisticas.missoesComPontos}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média de Horas</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas.mediaHorasPorVoluntario.toFixed(1)}h</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          {/* Tab Ranking */}
          <TabsContent value="ranking" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Ranking de Voluntários</span>
                </CardTitle>
                <CardDescription>
                  Top voluntários por pontuação total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ranking.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum voluntário com pontos
                    </h3>
                    <p className="text-gray-600">
                      Os pontos aparecerão aqui quando os voluntários participarem em missões.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Posição</TableHead>
                        <TableHead>Voluntário</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead>Pontos</TableHead>
                        <TableHead>Missões</TableHead>
                        <TableHead>Horas</TableHead>
                        <TableHead>Última Atividade</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ranking.map((voluntario, index) => {
                        const IconComponent = getNivelIcon(voluntario.nivel).icon;
                        const iconColor = getNivelIcon(voluntario.nivel).color;
                        
                        return (
                          <TableRow key={voluntario.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {index < 3 && (
                                  <Medal className={`h-5 w-5 ${
                                    index === 0 ? 'text-yellow-500' : 
                                    index === 1 ? 'text-gray-400' : 'text-orange-600'
                                  }`} />
                                )}
                                <span className="font-bold">#{index + 1}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{voluntario.voluntario?.nome || 'Nome não disponível'}</p>
                                <p className="text-sm text-gray-600">{voluntario.voluntario?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getNivelBadge(voluntario.nivel)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="font-bold text-lg">{voluntario.pontos_totais}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {voluntario.missoes_participadas} missões
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{voluntario.horas_totais}h</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {new Date(voluntario.ultima_atividade).toLocaleDateString('pt-PT')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                title="Ver detalhes"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Badges */}
          <TabsContent value="badges" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Sistema de Badges</span>
                </CardTitle>
                <CardDescription>
                  Conquistas e reconhecimentos disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge) => {
                    const IconComponent = getBadgeIcon(badge.icone);
                    
                    return (
                      <Card key={badge.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-full bg-${badge.cor}-100`}>
                              <IconComponent className={`h-6 w-6 text-${badge.cor}-600`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{badge.nome}</h3>
                              <p className="text-sm text-gray-600 mb-2">{badge.descricao}</p>
                              <Badge variant="outline">
                                {badge.pontos_necessarios} pontos
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Histórico */}
          <TabsContent value="historico" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Histórico de Pontos</span>
                </CardTitle>
                <CardDescription>
                  Últimas atividades de pontuação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historico.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma atividade registada
                    </h3>
                    <p className="text-gray-600">
                      O histórico de pontos aparecerá aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historico.slice(0, 20).map((item) => {
                      const acaoConfig = getAcaoIcon(item.tipo_acao);
                      const IconComponent = acaoConfig.icon;
                      
                      return (
                        <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-full bg-white`}>
                            <IconComponent className={`h-4 w-4 ${acaoConfig.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`font-bold ${
                                item.pontos_ganhos > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.pontos_ganhos > 0 ? '+' : ''}{item.pontos_ganhos} pontos
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {item.tipo_acao}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{item.descricao}</p>
                            {item.missao && (
                              <p className="text-xs text-gray-500">
                                Missão: {item.missao.codigo} - {item.missao.titulo}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(item.data_acao).toLocaleDateString('pt-PT')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.data_acao).toLocaleTimeString('pt-PT')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="configuracoes" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Configurações do Sistema</span>
                </CardTitle>
                <CardDescription>
                  Gerir pontuação e badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Pontuação por Função</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span>Coordenador</span>
                            <Badge>25 pontos</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span>Especialista</span>
                            <Badge>15 pontos</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span>Participante</span>
                            <Badge>10 pontos</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span>Apoio</span>
                            <Badge>8 pontos</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Níveis de Voluntários</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Star className="h-5 w-5 text-gray-500" />
                          <span>Iniciante</span>
                        </div>
                        <span className="text-sm text-gray-600">0 - 49 pontos</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Award className="h-5 w-5 text-blue-500" />
                          <span>Experiente</span>
                        </div>
                        <span className="text-sm text-gray-600">50 - 199 pontos</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-purple-500" />
                          <span>Veterano</span>
                        </div>
                        <span className="text-sm text-gray-600">200 - 499 pontos</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          <span>Lenda</span>
                        </div>
                        <span className="text-sm text-gray-600">500+ pontos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default DashboardPontos;