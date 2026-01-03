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
import PageActionBar from "@/components/PageActionBar";
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

interface EspecialidadeVoluntario {
  id: string;
  especialidade: {
    id: string;
    nome: string;
    descricao: string;
    categoria: string;
    cor: string;
    icone: string;
    pontos_bonus: number;
    requer_certificacao: boolean;
  };
  nivel_experiencia: string;
  data_certificacao?: string;
  certificado_valido_ate?: string;
  observacoes?: string;
  ativo: boolean;
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
  const [especialidades, setEspecialidades] = useState<EspecialidadeVoluntario[]>([]);
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

      // Buscar especialidades do voluntário
      const { data: especialidadesData, error: especialidadesError } = await supabase
        .from('voluntario_especialidades_2025_12_21_22_00')
        .select(`
          *,
          especialidade:especialidades_voluntarios_2025_12_21_22_00(*)
        `)
        .eq('voluntario_id', id)
        .eq('ativo', true);

      if (especialidadesError) {
        console.error('Erro ao buscar especialidades:', especialidadesError);
      } else {
        setEspecialidades(especialidadesData || []);
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

  // Função para renderizar ícones das especialidades com cores
  const renderEspecialidadeIcon = (icone: string, cor: string) => {
    const iconProps = { size: 20, className: `text-${cor}-600` };
    
    switch (icone) {
      case 'Shield': return <Shield {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'Brain': return <Activity {...iconProps} />;
      case 'Truck': return <Users {...iconProps} />;
      case 'Calendar': return <Calendar {...iconProps} />;
      case 'Camera': return <Star {...iconProps} />;
      case 'Share': return <Megaphone {...iconProps} />;
      case 'FileText': return <Clipboard {...iconProps} />;
      case 'DollarSign': return <Target {...iconProps} />;
      case 'BookOpen': return <PlayCircle {...iconProps} />;
      case 'Stethoscope': return <Stethoscope {...iconProps} />;
      case 'Plus': return <CheckCircle {...iconProps} />;
      default: return <Star {...iconProps} />;
    }
  };

  // Função para obter cor do badge baseada na cor da especialidade
  const getBadgeColor = (cor: string) => {
    const colorMap: { [key: string]: string } = {
      'red': 'bg-red-100 text-red-800 border-red-200',
      'green': 'bg-green-100 text-green-800 border-green-200',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pink': 'bg-pink-100 text-pink-800 border-pink-200',
      'cyan': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'gray': 'bg-gray-100 text-gray-800 border-gray-200',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200',
      'teal': 'bg-teal-100 text-teal-800 border-teal-200',
      'emerald': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colorMap[cor] || 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />
      
      {/* Page Action Bar */}
      <PageActionBar 
        title={`Perfil: ${voluntario.nome}`}
        subtitle="Detalhes completos do voluntário"
        actions={[
          {
            label: "Editar Voluntário",
            href: `/editar-voluntario/${voluntario.id}`,
            variant: "default",
            icon: "edit"
          },
          {
            label: "Voltar",
            href: "/voluntarios",
            variant: "outline",
            icon: "arrow-left"
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Perfil do Voluntário - Design Moderno */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{voluntario.nome}</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge 
                    variant={voluntario.ativo ? "default" : "secondary"}
                    className={voluntario.ativo ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"}
                  >
                    {voluntario.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  {voluntario.especialidade && (
                    <span className="text-blue-100 text-sm">{voluntario.especialidade}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voluntario.email && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{voluntario.email}</p>
                  </div>
                </div>
              )}
              
              {voluntario.telefone && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium text-gray-900">{voluntario.telefone}</p>
                  </div>
                </div>
              )}
              
              {voluntario.morada && (
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Morada</p>
                    <p className="font-medium text-gray-900">{voluntario.morada}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membro desde</p>
                  <p className="font-medium text-gray-900">
                    {new Date(voluntario.created_at).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas - Design Moderno */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Animais Ativos</p>
                <p className="text-3xl font-bold text-orange-600">{responsabilidadesAtivas.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <PawPrint className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <span>Sob responsabilidade</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Intervenções</p>
                <p className="text-3xl font-bold text-green-600">{intervencoes.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <span>Total realizadas</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Especialidades</p>
                <p className="text-3xl font-bold text-purple-600">{especialidades.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <span>Áreas de atuação</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Histórico</p>
                <p className="text-3xl font-bold text-blue-600">{responsabilidadesHistorico.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <span>Animais cuidados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Especialidades - Design Moderno */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Especialidades do Voluntário</h2>
                <p className="text-sm text-gray-600">Áreas de especialização e competências</p>
              </div>
            </div>
            {especialidades.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma especialidade atribuída</p>
                <p className="text-sm text-gray-400 mt-2">
                  As especialidades podem ser adicionadas na página de edição
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {especialidades.map((esp) => (
                  <div key={esp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${getBadgeColor(esp.especialidade.cor).replace('text-', 'bg-').replace('-800', '-100')}`}>
                          {renderEspecialidadeIcon(esp.especialidade.icone, esp.especialidade.cor)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {esp.especialidade.nome}
                          </h4>
                          <Badge className={`${getBadgeColor(esp.especialidade.cor)} text-xs`}>
                            {esp.especialidade.categoria}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {esp.especialidade.descricao}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Nível:</span>
                            <Badge variant="outline" className="capitalize">
                              {esp.nivel_experiencia}
                            </Badge>
                          </div>
                          {esp.especialidade.pontos_bonus > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Pontos Bónus:</span>
                              <span className="font-medium text-green-600">+{esp.especialidade.pontos_bonus}</span>
                            </div>
                          )}
                          {esp.especialidade.requer_certificacao && (
                            <div className="flex items-center space-x-1 text-xs">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-600">Requer Certificação</span>
                            </div>
                          )}
                          {esp.data_certificacao && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Certificado em:</span>
                              <span className="text-gray-700">
                                {new Date(esp.data_certificacao).toLocaleDateString('pt-PT')}
                              </span>
                            </div>
                          )}
                          {esp.certificado_valido_ate && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Válido até:</span>
                              <span className={`font-medium ${
                                new Date(esp.certificado_valido_ate) > new Date() 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {new Date(esp.certificado_valido_ate).toLocaleDateString('pt-PT')}
                              </span>
                            </div>
                          )}
                          {esp.observacoes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <span className="text-gray-500">Observações:</span>
                              <p className="text-gray-700 mt-1">{esp.observacoes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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