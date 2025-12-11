import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target,
  ArrowLeft,
  Trophy,
  Star,
  Award,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Plus,
  Eye,
  Gift,
  Zap,
  Crown,
  Heart,
  GraduationCap,
  FileText,
  DollarSign,
  Megaphone,
  Flame,
  Medal,
  Shield,
  TrendingUp,
  BarChart3,
  RefreshCw,
  User,
  UserCheck,
  Sprout
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interfaces
interface TipoMissao {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  pontos_base: number;
  categoria: string;
}

interface Missao {
  id: string;
  titulo: string;
  descricao: string;
  tipo_missao_id: string;
  pontos_recompensa: number;
  dificuldade: string;
  prazo_dias: number;
  max_participantes: number;
  requisitos: string;
  instrucoes: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  tipo_missao?: TipoMissao;
  participantes_atuais?: number;
  tarefas?: Tarefa[];
}

interface Tarefa {
  id: string;
  missao_id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  pontos: number;
  obrigatoria: boolean;
  tipo_verificacao: string;
}

interface ParticipacaoMissao {
  id: string;
  missao_id: string;
  voluntario_id: string;
  status: string;
  progresso_percentual: number;
  pontos_ganhos: number;
  data_inscricao: string;
  data_conclusao: string;
  missao?: Missao;
}

interface NivelGamificacao {
  id: string;
  nome: string;
  pontos_minimos: number;
  pontos_maximos: number;
  icone: string;
  cor: string;
  beneficios: string;
  ordem: number;
}

interface PontuacaoVoluntario {
  id: string;
  voluntario_id: string;
  pontos_totais: number;
  nivel_atual_id: string;
  missoes_concluidas: number;
  streak_dias: number;
  melhor_streak: number;
  ranking_posicao: number;
  nivel_atual?: NivelGamificacao;
}

interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  criterio: string;
  pontos_bonus: number;
  raridade: string;
  categoria: string;
}

interface Recompensa {
  id: string;
  nome: string;
  descricao: string;
  tipo: string;
  custo_pontos: number;
  quantidade_disponivel: number;
  quantidade_resgatada: number;
  validade_dias: number;
  instrucoes_resgate: string;
}

interface EstatisticasMissoes {
  totalMissoes: number;
  missoesAtivas: number;
  totalParticipacoes: number;
  participacoesAtivas: number;
  totalVoluntariosAtivos: number;
  pontosTotaisDistribuidos: number;
}

const ModuloMissoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Estados de dados
  const [estatisticas, setEstatisticas] = useState<EstatisticasMissoes | null>(null);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [minhasParticipacoes, setMinhasParticipacoes] = useState<ParticipacaoMissao[]>([]);
  const [minhaPontuacao, setMinhaPontuacao] = useState<PontuacaoVoluntario | null>(null);
  const [ranking, setRanking] = useState<PontuacaoVoluntario[]>([]);
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [tiposMissoes, setTiposMissoes] = useState<TipoMissao[]>([]);
  const [niveis, setNiveis] = useState<NivelGamificacao[]>([]);

  // Estados de UI
  const [selectedMissao, setSelectedMissao] = useState<Missao | null>(null);
  const [showMissaoDialog, setShowMissaoDialog] = useState(false);
  const [showRecompensaDialog, setShowRecompensaDialog] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEstatisticas(),
        loadMissoes(),
        loadMinhasParticipacoes(),
        loadMinhaPontuacao(),
        loadRanking(),
        loadConquistas(),
        loadRecompensas(),
        loadTiposMissoes(),
        loadNiveis()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do módulo missões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      // Carregar estatísticas gerais
      const { data: missoesData } = await supabase
        .from('missoes_2025_12_11_02_00')
        .select('*');

      const { data: participacoesData } = await supabase
        .from('participacoes_missoes_2025_12_11_02_00')
        .select('*');

      const { data: pontuacaoData } = await supabase
        .from('pontuacao_voluntarios_2025_12_11_02_00')
        .select('pontos_totais');

      const totalMissoes = missoesData?.length || 0;
      const missoesAtivas = missoesData?.filter(m => m.status === 'ativa').length || 0;
      const totalParticipacoes = participacoesData?.length || 0;
      const participacoesAtivas = participacoesData?.filter(p => p.status === 'em_progresso' || p.status === 'inscrito').length || 0;
      const totalVoluntariosAtivos = new Set(participacoesData?.map(p => p.voluntario_id)).size || 0;
      const pontosTotaisDistribuidos = pontuacaoData?.reduce((sum, p) => sum + (p.pontos_totais || 0), 0) || 0;

      setEstatisticas({
        totalMissoes,
        missoesAtivas,
        totalParticipacoes,
        participacoesAtivas,
        totalVoluntariosAtivos,
        pontosTotaisDistribuidos
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadMissoes = async () => {
    try {
      const { data, error } = await supabase
        .from('missoes_2025_12_11_02_00')
        .select(`
          *,
          tipo_missao:tipos_missoes_2025_12_11_02_00(*)
        `)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Carregar número de participantes para cada missão
      const missoesComParticipantes = await Promise.all(
        (data || []).map(async (missao) => {
          const { data: participantes } = await supabase
            .from('participacoes_missoes_2025_12_11_02_00')
            .select('id')
            .eq('missao_id', missao.id)
            .in('status', ['inscrito', 'em_progresso']);

          return {
            ...missao,
            participantes_atuais: participantes?.length || 0
          };
        })
      );

      setMissoes(missoesComParticipantes);
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
    }
  };

  const loadMinhasParticipacoes = async () => {
    try {
      // Primeiro, obter o voluntário atual
      const { data: voluntarioData } = await supabase
        .from('voluntarios')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (!voluntarioData) return;

      const { data, error } = await supabase
        .from('participacoes_missoes_2025_12_11_02_00')
        .select(`
          *,
          missao:missoes_2025_12_11_02_00(
            *,
            tipo_missao:tipos_missoes_2025_12_11_02_00(*)
          )
        `)
        .eq('voluntario_id', voluntarioData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMinhasParticipacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar participações:', error);
    }
  };

  const loadMinhaPontuacao = async () => {
    try {
      // Primeiro, obter o voluntário atual
      const { data: voluntarioData } = await supabase
        .from('voluntarios')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (!voluntarioData) return;

      const { data, error } = await supabase
        .from('pontuacao_voluntarios_2025_12_11_02_00')
        .select(`
          *,
          nivel_atual:niveis_gamificacao_2025_12_11_02_00(*)
        `)
        .eq('voluntario_id', voluntarioData.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setMinhaPontuacao(data);
      } else {
        // Criar registro inicial se não existir
        const novoRegistro = {
          voluntario_id: voluntarioData.id,
          pontos_totais: 0,
          missoes_concluidas: 0,
          streak_dias: 0,
          melhor_streak: 0,
          ranking_posicao: null
        };

        const { data: novaPontuacao } = await supabase
          .from('pontuacao_voluntarios_2025_12_11_02_00')
          .insert([novoRegistro])
          .select(`
            *,
            nivel_atual:niveis_gamificacao_2025_12_11_02_00(*)
          `)
          .single();

        setMinhaPontuacao(novaPontuacao);
      }
    } catch (error) {
      console.error('Erro ao carregar pontuação:', error);
    }
  };

  const loadRanking = async () => {
    try {
      const { data, error } = await supabase
        .from('pontuacao_voluntarios_2025_12_11_02_00')
        .select(`
          *,
          voluntario:voluntarios(nome, email),
          nivel_atual:niveis_gamificacao_2025_12_11_02_00(*)
        `)
        .order('pontos_totais', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRanking(data || []);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    }
  };

  const loadConquistas = async () => {
    try {
      const { data, error } = await supabase
        .from('conquistas_2025_12_11_02_00')
        .select('*')
        .eq('ativo', true)
        .order('raridade', { ascending: false });

      if (error) throw error;
      setConquistas(data || []);
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    }
  };

  const loadRecompensas = async () => {
    try {
      const { data, error } = await supabase
        .from('recompensas_2025_12_11_02_00')
        .select('*')
        .eq('ativo', true)
        .order('custo_pontos', { ascending: true });

      if (error) throw error;
      setRecompensas(data || []);
    } catch (error) {
      console.error('Erro ao carregar recompensas:', error);
    }
  };

  const loadTiposMissoes = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_missoes_2025_12_11_02_00')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setTiposMissoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar tipos de missões:', error);
    }
  };

  const loadNiveis = async () => {
    try {
      const { data, error } = await supabase
        .from('niveis_gamificacao_2025_12_11_02_00')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      setNiveis(data || []);
    } catch (error) {
      console.error('Erro ao carregar níveis:', error);
    }
  };

  const participarMissao = async (missaoId: string) => {
    try {
      // Obter voluntário atual
      const { data: voluntarioData } = await supabase
        .from('voluntarios')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (!voluntarioData) {
        toast({
          title: "Erro",
          description: "Voluntário não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Verificar se já está participando
      const { data: participacaoExistente } = await supabase
        .from('participacoes_missoes_2025_12_11_02_00')
        .select('id')
        .eq('missao_id', missaoId)
        .eq('voluntario_id', voluntarioData.id)
        .single();

      if (participacaoExistente) {
        toast({
          title: "Aviso",
          description: "Já está inscrito nesta missão",
          variant: "destructive",
        });
        return;
      }

      // Criar participação
      const { error } = await supabase
        .from('participacoes_missoes_2025_12_11_02_00')
        .insert([{
          missao_id: missaoId,
          voluntario_id: voluntarioData.id,
          status: 'inscrito'
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Inscrito na missão com sucesso!",
      });

      // Recarregar dados
      loadMissoes();
      loadMinhasParticipacoes();
      setShowMissaoDialog(false);
    } catch (error) {
      console.error('Erro ao participar da missão:', error);
      toast({
        title: "Erro",
        description: "Erro ao inscrever-se na missão",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Heart, GraduationCap, FileText, Calendar, DollarSign, Megaphone,
      Trophy, Medal, Award, Crown, Star, Flame, Zap, Shield,
      Sprout, User, UserCheck, Target
    };
    return icons[iconName] || Target;
  };

  const getDifficultyColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'facil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityColor = (raridade: string) => {
    switch (raridade) {
      case 'comum': return 'bg-gray-100 text-gray-800';
      case 'raro': return 'bg-blue-100 text-blue-800';
      case 'epico': return 'bg-purple-100 text-purple-800';
      case 'lendario': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inscrito': return 'bg-blue-100 text-blue-800';
      case 'em_progresso': return 'bg-yellow-100 text-yellow-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'abandonada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando módulo missões...</p>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
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
                  <Target className="h-10 w-10 mr-3 text-purple-600" />
                  Módulo Missões
                </h1>
                <p className="text-gray-600 text-lg">
                  Sistema de gamificação e missões para voluntários
                </p>
              </div>
            </div>
            <Button onClick={loadAllData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missões Ativas</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.missoesAtivas || 0}</div>
                <p className="text-xs text-muted-foreground">
                  de {estatisticas?.totalMissoes || 0} missões totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meus Pontos</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{minhaPontuacao?.pontos_totais || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Nível: {minhaPontuacao?.nivel_atual?.nome || 'Novato'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missões Concluídas</CardTitle>
                <Trophy className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{minhaPontuacao?.missoes_concluidas || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Streak: {minhaPontuacao?.streak_dias || 0} dias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Principais */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="missoes">Missões</TabsTrigger>
              <TabsTrigger value="minhas">Minhas Missões</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
              <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meu Progresso */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Meu Progresso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {minhaPontuacao?.nivel_atual && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Nível Atual</span>
                          <Badge style={{ backgroundColor: minhaPontuacao.nivel_atual.cor }}>
                            {minhaPontuacao.nivel_atual.nome}
                          </Badge>
                        </div>
                        <Progress 
                          value={
                            minhaPontuacao.nivel_atual.pontos_maximos 
                              ? ((minhaPontuacao.pontos_totais - minhaPontuacao.nivel_atual.pontos_minimos) / 
                                 (minhaPontuacao.nivel_atual.pontos_maximos - minhaPontuacao.nivel_atual.pontos_minimos)) * 100
                              : 100
                          } 
                        />
                        <div className="text-xs text-muted-foreground">
                          {minhaPontuacao.pontos_totais} / {minhaPontuacao.nivel_atual.pontos_maximos || '∞'} pontos
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{minhaPontuacao?.missoes_concluidas || 0}</div>
                        <div className="text-xs text-muted-foreground">Missões</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{minhaPontuacao?.streak_dias || 0}</div>
                        <div className="text-xs text-muted-foreground">Streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Conquistas Recentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Conquistas Disponíveis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {conquistas.slice(0, 4).map((conquista) => {
                        const IconComponent = getIconComponent(conquista.icone);
                        return (
                          <div key={conquista.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                            <IconComponent 
                              className="h-6 w-6" 
                              style={{ color: conquista.cor }} 
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{conquista.nome}</div>
                              <div className="text-xs text-muted-foreground">{conquista.descricao}</div>
                            </div>
                            <Badge className={getRarityColor(conquista.raridade)}>
                              {conquista.raridade}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Missões Tab */}
            <TabsContent value="missoes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missoes.map((missao) => {
                  const IconComponent = getIconComponent(missao.tipo_missao?.icone || 'Target');
                  return (
                    <Card key={missao.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent 
                              className="h-5 w-5" 
                              style={{ color: missao.tipo_missao?.cor }} 
                            />
                            <CardTitle className="text-lg">{missao.titulo}</CardTitle>
                          </div>
                          <Badge className={getDifficultyColor(missao.dificuldade)}>
                            {missao.dificuldade}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {missao.descricao}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {missao.pontos_recompensa} pontos
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            {missao.prazo_dias} dias
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-blue-500" />
                            {missao.participantes_atuais}/{missao.max_participantes}
                          </span>
                          <Badge variant="outline">
                            {missao.tipo_missao?.nome}
                          </Badge>
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedMissao(missao);
                              setShowMissaoDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => participarMissao(missao.id)}
                            disabled={missao.participantes_atuais >= missao.max_participantes}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Participar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Minhas Missões Tab */}
            <TabsContent value="minhas" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {minhasParticipacoes.map((participacao) => {
                  const IconComponent = getIconComponent(participacao.missao?.tipo_missao?.icone || 'Target');
                  return (
                    <Card key={participacao.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent 
                              className="h-5 w-5" 
                              style={{ color: participacao.missao?.tipo_missao?.cor }} 
                            />
                            <CardTitle className="text-lg">{participacao.missao?.titulo}</CardTitle>
                          </div>
                          <Badge className={getStatusColor(participacao.status)}>
                            {participacao.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{participacao.progresso_percentual}%</span>
                          </div>
                          <Progress value={participacao.progresso_percentual} />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {participacao.pontos_ganhos} pontos ganhos
                          </span>
                          <span className="text-muted-foreground">
                            Inscrito em {new Date(participacao.data_inscricao).toLocaleDateString()}
                          </span>
                        </div>

                        {participacao.status === 'em_progresso' && (
                          <Button size="sm" className="w-full">
                            <Play className="h-4 w-4 mr-1" />
                            Continuar Missão
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Ranking Tab */}
            <TabsContent value="ranking" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Top 10 Voluntários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ranking.map((voluntario, index) => {
                      const IconComponent = getIconComponent(voluntario.nivel_atual?.icone || 'User');
                      return (
                        <div key={voluntario.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                            {index + 1}
                          </div>
                          <IconComponent 
                            className="h-6 w-6" 
                            style={{ color: voluntario.nivel_atual?.cor }} 
                          />
                          <div className="flex-1">
                            <div className="font-medium">{voluntario.voluntario?.nome || 'Voluntário'}</div>
                            <div className="text-sm text-muted-foreground">
                              {voluntario.missoes_concluidas} missões • Streak: {voluntario.streak_dias} dias
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{voluntario.pontos_totais}</div>
                            <div className="text-xs text-muted-foreground">pontos</div>
                          </div>
                          <Badge style={{ backgroundColor: voluntario.nivel_atual?.cor }}>
                            {voluntario.nivel_atual?.nome || 'Novato'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recompensas Tab */}
            <TabsContent value="recompensas" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recompensas.map((recompensa) => (
                  <Card key={recompensa.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Gift className="h-5 w-5 mr-2 text-purple-600" />
                          {recompensa.nome}
                        </span>
                        <Badge variant="outline">{recompensa.tipo}</Badge>
                      </CardTitle>
                      <CardDescription>{recompensa.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-lg font-bold">
                          <Star className="h-5 w-5 mr-1 text-yellow-500" />
                          {recompensa.custo_pontos} pontos
                        </span>
                        {recompensa.quantidade_disponivel && (
                          <span className="text-sm text-muted-foreground">
                            {recompensa.quantidade_disponivel - recompensa.quantidade_resgatada} disponíveis
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        className="w-full" 
                        disabled={
                          !minhaPontuacao || 
                          minhaPontuacao.pontos_totais < recompensa.custo_pontos ||
                          (recompensa.quantidade_disponivel && 
                           recompensa.quantidade_resgatada >= recompensa.quantidade_disponivel)
                        }
                      >
                        <Gift className="h-4 w-4 mr-1" />
                        Resgatar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog de Detalhes da Missão */}
      <Dialog open={showMissaoDialog} onOpenChange={setShowMissaoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedMissao && (
                <>
                  {React.createElement(getIconComponent(selectedMissao.tipo_missao?.icone || 'Target'), {
                    className: "h-6 w-6 mr-2",
                    style: { color: selectedMissao.tipo_missao?.cor }
                  })}
                  {selectedMissao.titulo}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedMissao?.descricao}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMissao && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pontos de Recompensa</Label>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {selectedMissao.pontos_recompensa} pontos
                  </div>
                </div>
                <div>
                  <Label>Prazo</Label>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    {selectedMissao.prazo_dias} dias
                  </div>
                </div>
                <div>
                  <Label>Dificuldade</Label>
                  <Badge className={getDifficultyColor(selectedMissao.dificuldade)}>
                    {selectedMissao.dificuldade}
                  </Badge>
                </div>
                <div>
                  <Label>Participantes</Label>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-blue-500" />
                    {selectedMissao.participantes_atuais}/{selectedMissao.max_participantes}
                  </div>
                </div>
              </div>

              {selectedMissao.requisitos && (
                <div>
                  <Label>Requisitos</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedMissao.requisitos}
                  </p>
                </div>
              )}

              {selectedMissao.instrucoes && (
                <div>
                  <Label>Instruções</Label>
                  <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                    {selectedMissao.instrucoes}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={() => participarMissao(selectedMissao.id)}
                  disabled={selectedMissao.participantes_atuais >= selectedMissao.max_participantes}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Participar da Missão
                </Button>
                <Button variant="outline" onClick={() => setShowMissaoDialog(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default ModuloMissoes;