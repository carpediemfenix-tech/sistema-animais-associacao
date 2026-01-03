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
          
          {/* Animais Sob Responsabilidade Atual - Design Moderno */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Animais Sob Responsabilidade</h2>
                  <p className="text-sm text-gray-600">Animais atualmente sob os cuidados deste voluntário</p>
                </div>
              </div>
              {responsabilidadesAtivas.length === 0 ? (
                <div className="text-center py-8">
                  <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum animal sob responsabilidade atual</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Este voluntário não tem animais atribuídos no momento
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {responsabilidadesAtivas.map((resp) => (
                    <div key={resp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-orange-50 to-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                            <PawPrint className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {resp.animal_nome}
                              </h4>
                              <Badge variant={resp.animal_estado === 'Ativo' ? 'default' : 'secondary'} className="text-xs">
                                {resp.animal_estado}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">Processo:</span>
                                <span className="ml-2">{resp.animal_numero_processo}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">Espécie:</span>
                                <span className="ml-2">{resp.animal_especie}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span className="font-medium">Responsável desde:</span>
                                <span className="ml-2">{new Date(resp.data_inicio).toLocaleDateString('pt-PT')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Link to={`/animal/${resp.animal_id}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              Ver Animal
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Intervenções Acompanhadas - Design Moderno */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Intervenções Acompanhadas</h2>
                  <p className="text-sm text-gray-600">
                    Intervenções médicas onde este voluntário esteve envolvido (transporte, acompanhamento, coordenação)
                  </p>
                </div>
              </div>
              {intervencoes.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma intervenção acompanhada</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Este voluntário não participou em intervenções médicas recentemente
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
                  {intervencoes.slice(0, 10).map((int) => (
                    <div key={int.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                            <Stethoscope className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {int.animal_nome}
                              </h4>
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Acompanhou
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">Tipo:</span>
                                <span className="ml-2">{int.tipo_intervencao}</span>
                              </div>
                              {int.veterinario && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="font-medium">Veterinário:</span>
                                  <span className="ml-2">Dr. {int.veterinario}</span>
                                </div>
                              )}
                              {int.clinica && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="font-medium">Clínica:</span>
                                  <span className="ml-2">{int.clinica}</span>
                                </div>
                              )}
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span className="font-medium">Data:</span>
                                <span className="ml-2">{new Date(int.data_intervencao).toLocaleDateString('pt-PT')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {int.custo && (
                            <div className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                              €{int.custo.toFixed(2)}
                            </div>
                          )}
                          <Link to={`/animal/${int.animal_id}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              Ver Animal
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Histórico Completo de Responsabilidades - Design Moderno */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Histórico Completo de Responsabilidades</h2>
                <p className="text-sm text-gray-600">Todos os animais que estiveram sob os cuidados deste voluntário</p>
              </div>
            </div>
            {responsabilidadesHistorico.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum histórico de responsabilidades</p>
                <p className="text-sm text-gray-400 mt-2">
                  Este voluntário ainda não teve animais sob sua responsabilidade
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Estatísticas do Histórico */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-700">Total de Animais</p>
                        <p className="text-2xl font-bold text-purple-900">{responsabilidadesHistorico.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">Responsabilidades Ativas</p>
                        <p className="text-2xl font-bold text-green-900">
                          {responsabilidadesHistorico.filter(r => !r.data_fim).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Responsabilidades Finalizadas</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {responsabilidadesHistorico.filter(r => r.data_fim).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline de Responsabilidades */}
                <div className="space-y-4">
                  {responsabilidadesHistorico.map((resp, index) => (
                    <div key={resp.id} className="relative">
                      {/* Linha da Timeline */}
                      {index < responsabilidadesHistorico.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        {/* Indicador da Timeline */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          resp.data_fim 
                            ? 'bg-gray-100 border-2 border-gray-300' 
                            : 'bg-green-100 border-2 border-green-300'
                        }`}>
                          {resp.data_fim ? (
                            <CheckCircle className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-green-500" />
                          )}
                        </div>

                        {/* Conteúdo da Responsabilidade */}
                        <div className="flex-1 border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-purple-50 to-indigo-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {resp.animal_nome}
                                </h4>
                                <Badge variant={resp.data_fim ? "secondary" : "default"} className="text-xs">
                                  {resp.data_fim ? "Finalizada" : "Ativa"}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="font-medium">Processo:</span>
                                  <span className="ml-2">{resp.animal_numero_processo}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="font-medium">Espécie:</span>
                                  <span className="ml-2">{resp.animal_especie}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span className="font-medium">Período:</span>
                                  <span className="ml-2">
                                    {new Date(resp.data_inicio).toLocaleDateString('pt-PT')}
                                    {resp.data_fim && (
                                      <> - {new Date(resp.data_fim).toLocaleDateString('pt-PT')}</>
                                    )}
                                  </span>
                                </div>
                                {resp.motivo_mudanca && (
                                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs border border-yellow-200">
                                    <span className="font-medium text-yellow-700">Motivo da mudança:</span>
                                    <p className="text-yellow-600 mt-1">{resp.motivo_mudanca}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2 ml-4">
                              <Link to={`/animal/${resp.animal_id}`}>
                                <Button size="sm" variant="outline" className="text-xs">
                                  <User className="h-3 w-3 mr-1" />
                                  Ver Animal
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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