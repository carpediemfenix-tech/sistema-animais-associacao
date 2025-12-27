import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  PawPrint,
  Stethoscope,
  Activity,
  Heart,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Target,
  Star,
  Award,
  Shield,
  Megaphone,
  Clipboard,
  PlayCircle,
  XCircle
} from "lucide-react";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import { useAuth } from "@/contexts/AuthContext";

interface Voluntario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  morada?: string;
  especialidade?: string;
  ativo: boolean;
  created_at: string;
}

interface ResponsabilidadeAtiva {
  id: string;
  animal_id: string;
  data_inicio: string;
  animal_nome: string;
  animal_numero_processo: string;
  animal_especie: string;
  animal_estado: string;
}

interface IntervencaoHistorico {
  id: string;
  animal_id: string;
  data_intervencao: string;
  tipo_intervencao: string;
  veterinario?: string;
  clinica?: string;
  custo?: number;
  animal_nome: string;
  animal_numero_processo: string;
}

interface ResponsabilidadeHistorico {
  id: string;
  animal_id: string;
  data_inicio: string;
  data_fim?: string;
  motivo_mudanca?: string;
  animal_nome: string;
  animal_numero_processo: string;
  animal_especie: string;
}

interface ParticipacaoMissao {
  id: string;
  missao_id: string;
  funcao: string;
  status_participacao: string;
  data_participacao: string;
  horas_dedicadas: number;
  pontos_atribuidos: number;
  avaliacao?: number;
  missoes_2025_12_18_14_15?: {
    titulo: string;
    codigo: string;
    status: string;
    data_inicio: string;
    data_fim?: string;
    tipos_missoes_2025_12_18_14_15?: {
      nome: string;
      categoria: string;
      cor: string;
    };
  };
}

const VoluntarioDetail = () => {
  const { id } = useParams();
  const [voluntario, setVoluntario] = useState<Voluntario | null>(null);
  const [responsabilidadesAtivas, setResponsabilidadesAtivas] = useState<ResponsabilidadeAtiva[]>([]);
  const [intervencoes, setIntervencoes] = useState<IntervencaoHistorico[]>([]);
  const [responsabilidadesHistorico, setResponsabilidadesHistorico] = useState<ResponsabilidadeHistorico[]>([]);
  const [participacoesMissoes, setParticipacoesMissoes] = useState<ParticipacaoMissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (id) {
      fetchVoluntarioData();
    }
  }, [id]);

  const fetchVoluntarioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados do voluntário
      const { data: voluntarioData, error: voluntarioError } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('id', id)
        .single();

      if (voluntarioError) {
        console.error('Erro ao buscar voluntário:', voluntarioError);
        throw voluntarioError;
      }

      setVoluntario(voluntarioData);

      // Buscar responsabilidades ativas
      const { data: responsabilidadesAtivasData, error: responsabilidadesError } = await supabase
        .from('responsabilidades_voluntarios')
        .select(`
          *,
          animais!inner(
            id,
            nome,
            numero_processo,
            especie,
            estado,
            arquivado
          )
        `)
        .eq('voluntario_id', id)
        .is('data_fim', null)
        .eq('ativo', true)
        .eq('animais.arquivado', false);

      if (responsabilidadesError) {
        console.error('Erro ao buscar responsabilidades ativas:', responsabilidadesError);
      } else {
        const responsabilidadesFormatadas = (responsabilidadesAtivasData || []).map(resp => ({
          id: resp.id,
          animal_id: resp.animal_id,
          data_inicio: resp.data_inicio,
          animal_nome: resp.animais.nome,
          animal_numero_processo: resp.animais.numero_processo,
          animal_especie: resp.animais.especie,
          animal_estado: resp.animais.estado
        }));
        setResponsabilidadesAtivas(responsabilidadesFormatadas);
      }

      // Buscar histórico de intervenções
      const { data: intervencoesData, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select(`
          *,
          animais!inner(
            nome,
            numero_processo
          ),
          tipos_intervencoes(nome)
        `)
        .eq('voluntario_id', id)
        .order('data_intervencao', { ascending: false })
        .limit(20);

      if (intervencoesError) {
        console.error('Erro ao buscar intervenções:', intervencoesError);
      } else {
        const intervencoesFormatadas = (intervencoesData || []).map(int => ({
          id: int.id,
          animal_id: int.animal_id,
          data_intervencao: int.data_intervencao,
          tipo_intervencao: int.tipos_intervencoes?.nome || int.tipo_intervencao_id,
          veterinario: int.veterinario,
          clinica: int.clinica,
          custo: int.custo,
          animal_nome: int.animais.nome,
          animal_numero_processo: int.animais.numero_processo
        }));
        setIntervencoes(intervencoesFormatadas);
      }

      // Buscar histórico completo de responsabilidades
      const { data: historicoData, error: historicoError } = await supabase
        .from('responsabilidades_voluntarios')
        .select(`
          *,
          animais!inner(
            nome,
            numero_processo,
            especie
          )
        `)
        .eq('voluntario_id', id)
        .order('data_inicio', { ascending: false });

      if (historicoError) {
        console.error('Erro ao buscar histórico de responsabilidades:', historicoError);
      } else {
        const historicoFormatado = (historicoData || []).map(resp => ({
          id: resp.id,
          animal_id: resp.animal_id,
          data_inicio: resp.data_inicio,
          data_fim: resp.data_fim,
          motivo_mudanca: resp.motivo_mudanca,
          animal_nome: resp.animais.nome,
          animal_numero_processo: resp.animais.numero_processo,
          animal_especie: resp.animais.especie
        }));
        setResponsabilidadesHistorico(historicoFormatado);
      }

      // Buscar participações em missões
      const { data: participacoesData, error: participacoesError } = await supabase
        .from('participacoes_missoes_2025_12_18_14_15')
        .select(`
          *,
          missoes_2025_12_18_14_15(
            titulo,
            codigo,
            status,
            data_inicio,
            data_fim,
            tipos_missoes_2025_12_18_14_15(
              nome,
              categoria,
              cor
            )
          )
        `)
        .eq('voluntario_id', id)
        .order('created_at', { ascending: false });

      if (participacoesError) {
        console.error('Erro ao buscar participações em missões:', participacoesError);
      } else {
        setParticipacoesMissoes(participacoesData || []);
      }

    } catch (error: any) {
      console.error('Erro ao carregar dados do voluntário:', error);
      setError(error.message || 'Erro ao carregar dados do voluntário');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do voluntário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar dados do voluntário...</p>
        </div>
      </div>
    );
  }

  if (error || !voluntario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error || 'Voluntário não encontrado'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Botão Voltar */}
        <Button asChild variant="outline" className="mb-4">
          <Link to="/voluntarios">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Voluntários
          </Link>
        </Button>

        {/* Informações do Voluntário */}
        <Card className="animal-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-orange-800">{voluntario.nome}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <Badge variant={voluntario.ativo ? "default" : "secondary"}>
                      {voluntario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <span className="text-orange-600">{voluntario.especialidade}</span>
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {voluntario.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{voluntario.email}</span>
                </div>
              )}
              {voluntario.telefone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{voluntario.telefone}</span>
                </div>
              )}
              {voluntario.morada && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{voluntario.morada}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span className="text-sm">
                  Desde {new Date(voluntario.created_at).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="animal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">
                Animais Sob Responsabilidade
              </CardTitle>
              <PawPrint className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{responsabilidadesAtivas.length}</div>
              <p className="text-xs text-orange-600">Atualmente ativos</p>
            </CardContent>
          </Card>

          <Card className="animal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Intervenções Realizadas
              </CardTitle>
              <Stethoscope className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{intervencoes.length}</div>
              <p className="text-xs text-green-600">Total registado</p>
            </CardContent>
          </Card>

          <Card className="animal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Histórico de Responsabilidades
              </CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{responsabilidadesHistorico.length}</div>
              <p className="text-xs text-purple-600">Animais já cuidados</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Animais Sob Responsabilidade Atual */}
          <Card className="animal-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Animais Sob Responsabilidade</span>
              </CardTitle>
              <CardDescription>
                Animais atualmente sob os cuidados deste voluntário
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responsabilidadesAtivas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum animal sob responsabilidade atual</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {responsabilidadesAtivas.map((resp) => (
                    <div key={resp.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-3">
                        <PawPrint className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="font-medium text-orange-900">
                            {resp.animal_nome}
                          </div>
                          <div className="text-sm text-orange-600">
                            {resp.animal_numero_processo} • {resp.animal_especie}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={resp.animal_estado === 'Ativo' ? 'default' : 'secondary'}>
                          {resp.animal_estado}
                        </Badge>
                        <div className="text-xs text-orange-500 mt-1">
                          Desde {new Date(resp.data_inicio).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Intervenções Recentes */}
          <Card className="animal-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Stethoscope className="h-5 w-5 text-green-500" />
                <span>Intervenções Recentes</span>
              </CardTitle>
              <CardDescription>
                Últimas intervenções médicas realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {intervencoes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma intervenção registada</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {intervencoes.slice(0, 10).map((int) => (
                    <div key={int.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">
                            {int.animal_nome}
                          </div>
                          <div className="text-sm text-green-600">
                            {int.tipo_intervencao}
                          </div>
                          {int.veterinario && (
                            <div className="text-xs text-green-500">
                              Dr. {int.veterinario}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {int.custo && (
                          <div className="text-sm font-medium text-green-700">
                            €{int.custo.toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-green-500">
                          {new Date(int.data_intervencao).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Histórico Completo de Responsabilidades */}
        <Card className="animal-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Activity className="h-5 w-5 text-purple-500" />
              <span>Histórico Completo de Responsabilidades</span>
            </CardTitle>
            <CardDescription>
              Todos os animais que estiveram sob os cuidados deste voluntário
            </CardDescription>
          </CardHeader>
          <CardContent>
            {responsabilidadesHistorico.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum histórico de responsabilidades</p>
              </div>
            ) : (
              <div className="space-y-3">
                {responsabilidadesHistorico.map((resp) => (
                  <div key={resp.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${resp.data_fim ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                      <div>
                        <div className="font-medium text-purple-900">
                          {resp.animal_nome}
                        </div>
                        <div className="text-sm text-purple-600">
                          {resp.animal_numero_processo} • {resp.animal_especie}
                        </div>
                        {resp.motivo_mudanca && (
                          <div className="text-xs text-purple-500 mt-1">
                            {resp.motivo_mudanca}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {resp.data_fim ? (
                          <CheckCircle className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-green-500" />
                        )}
                        <Badge variant={resp.data_fim ? "secondary" : "default"}>
                          {resp.data_fim ? "Finalizada" : "Ativa"}
                        </Badge>
                      </div>
                      <div className="text-xs text-purple-500 mt-1">
                        {new Date(resp.data_inicio).toLocaleDateString('pt-PT')}
                        {resp.data_fim && (
                          <> - {new Date(resp.data_fim).toLocaleDateString('pt-PT')}</>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção de Missões */}
        <Card className="mission-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-indigo-800">
              <Target className="h-5 w-5 text-indigo-500" />
              <span>Participações em Missões</span>
            </CardTitle>
            <CardDescription>
              Histórico de participações em missões e eventos da associação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {participacoesMissoes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma participação em missões registada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Estatísticas das Missões */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Target className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-indigo-700">Total de Missões</p>
                        <p className="text-2xl font-bold text-indigo-900">{participacoesMissoes.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-yellow-700">Pontos Acumulados</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {participacoesMissoes.reduce((sum, p) => sum + (p.pontos_atribuidos || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">Horas Dedicadas</p>
                        <p className="text-2xl font-bold text-green-900">
                          {participacoesMissoes.reduce((sum, p) => sum + (p.horas_dedicadas || 0), 0).toFixed(1)}h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Participações */}
                <div className="space-y-3">
                  {participacoesMissoes.map((participacao) => {
                    const getStatusBadge = (status: string) => {
                      const statusConfig = {
                        'pendente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
                        'em_curso': { color: 'bg-blue-100 text-blue-800', icon: PlayCircle, label: 'Em Curso' },
                        'concluida': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Concluída' },
                        'cancelada': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelada' }
                      };
                      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
                      const Icon = config.icon;
                      return (
                        <Badge className={`${config.color} flex items-center space-x-1`}>
                          <Icon className="h-3 w-3" />
                          <span>{config.label}</span>
                        </Badge>
                      );
                    };

                    const getIconeCategoria = (categoria: string) => {
                      const iconesConfig = {
                        'evento': Heart,
                        'resgate': Shield,
                        'campanha': Megaphone,
                        'representacao': Users,
                        'tarefa': Clipboard
                      };
                      return iconesConfig[categoria as keyof typeof iconesConfig] || Target;
                    };

                    const IconeCategoria = getIconeCategoria(participacao.missoes_2025_12_18_14_15?.tipos_missoes_2025_12_18_14_15?.categoria || 'evento');

                    return (
                      <div key={participacao.id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <IconeCategoria className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium text-indigo-900">
                              {participacao.missoes_2025_12_18_14_15?.titulo || 'Missão N/A'}
                            </div>
                            <div className="text-sm text-indigo-600">
                              {participacao.missoes_2025_12_18_14_15?.codigo} • {participacao.funcao}
                            </div>
                            <div className="text-xs text-indigo-500 mt-1">
                              {new Date(participacao.data_participacao).toLocaleDateString('pt-PT')}
                              {participacao.missoes_2025_12_18_14_15?.tipos_missoes_2025_12_18_14_15?.nome && (
                                <> • {participacao.missoes_2025_12_18_14_15.tipos_missoes_2025_12_18_14_15.nome}</>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          {participacao.missoes_2025_12_18_14_15?.status && 
                            getStatusBadge(participacao.missoes_2025_12_18_14_15.status)
                          }
                          <div className="flex items-center space-x-4 text-sm">
                            {participacao.horas_dedicadas > 0 && (
                              <div className="flex items-center space-x-1 text-green-600">
                                <Clock className="h-3 w-3" />
                                <span>{participacao.horas_dedicadas}h</span>
                              </div>
                            )}
                            {participacao.pontos_atribuidos > 0 && (
                              <div className="flex items-center space-x-1 text-yellow-600">
                                <Star className="h-3 w-3" />
                                <span>{participacao.pontos_atribuidos}</span>
                              </div>
                            )}
                            {participacao.avaliacao && (
                              <div className="flex items-center space-x-1 text-purple-600">
                                <Award className="h-3 w-3" />
                                <span>{participacao.avaliacao}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default VoluntarioDetail;