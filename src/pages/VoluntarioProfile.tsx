import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit, 
  Award, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  User,
  Briefcase,
  Hash,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Sprout,
  Shield,
  Sword,
  Crown,
  Heart,
  Zap,
  Star,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";
import { VoluntarioValentao, ProgressaoIndividual, NivelFormacao, Especializacao, VoluntarioConquista } from "@/types/voluntarios";

const VoluntarioProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [voluntario, setVoluntario] = useState<VoluntarioValentao | null>(null);
  const [progressao, setProgressao] = useState<ProgressaoIndividual | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadVoluntarioData();
    }
  }, [id]);

  const loadVoluntarioData = async () => {
    try {
      setLoading(true);

      // Carregar dados do voluntário (sem join problemático)
      const { data: voluntarioData, error: voluntarioError } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('id', id)
        .single();

      if (voluntarioError) throw voluntarioError;

      // Carregar progressão do voluntário (simplificado)
      const { data: progressaoData, error: progressaoError } = await supabase
        .from('voluntario_progressao')
        .select('*')
        .eq('voluntario_id', id)
        .order('created_at', { ascending: false });

      if (progressaoError) throw progressaoError;

      // Carregar especializações do voluntário (simplificado)
      const { data: especializacoesData, error: especializacoesError } = await supabase
        .from('voluntario_especializacoes')
        .select('*')
        .eq('voluntario_id', id);

      if (especializacoesError) throw especializacoesError;

      // Carregar conquistas do voluntário (simplificado)
      const { data: conquistasData, error: conquistasError } = await supabase
        .from('voluntario_conquistas')
        .select('*')
        .eq('voluntario_id', id)
        .order('created_at', { ascending: false });

      if (conquistasError) throw conquistasError;

      // Carregar todos os níveis para calcular progressão
      const { data: niveisData, error: niveisError } = await supabase
        .from('niveis_formacao')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (niveisError) throw niveisError;

      // Carregar especializações disponíveis
      const { data: especializacoesDisponiveis, error: especDispError } = await supabase
        .from('especializacoes')
        .select('*')
        .eq('ativo', true);

      if (especDispError) throw especDispError;

      // Processar dados
      const voluntarioCompleto: VoluntarioValentao = {
        ...voluntarioData,
        progressao: progressaoData,
        especializacoes: especializacoesData,
        conquistas: conquistasData
      };

      // Calcular progressão individual
      const nivelAtual = voluntarioData.nivel_formacao;
      const proximoNivel = nivelAtual ? 
        niveisData?.find(n => n.ordem === nivelAtual.ordem + 1) : 
        niveisData?.[0];

      // Simular cálculo de progresso (implementar lógica real depois)
      const tempoServico = voluntarioData.data_ingresso ? 
        Math.floor((new Date().getTime() - new Date(voluntarioData.data_ingresso).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0;
      
      const progressaoIndividual: ProgressaoIndividual = {
        voluntario: voluntarioCompleto,
        nivel_atual: nivelAtual || niveisData?.[0],
        proximo_nivel: proximoNivel,
        progresso_percentual: proximoNivel ? Math.min((tempoServico / proximoNivel.tempo_minimo_meses) * 100, 100) : 100,
        criterios_cumpridos: {
          tempo_minimo: proximoNivel ? tempoServico >= proximoNivel.tempo_minimo_meses : true,
          missoes_minimas: true, // Implementar depois
          outros_requisitos: true
        },
        tempo_restante_estimado: proximoNivel ? Math.max(proximoNivel.tempo_minimo_meses - tempoServico, 0) : 0,
        missoes_restantes: proximoNivel ? Math.max(proximoNivel.missoes_minimas - 0, 0) : 0, // Implementar depois
        especializacoes_disponiveis: especializacoesDisponiveis?.filter(esp => 
          nivelAtual && esp.nivel_pre_requisito === nivelAtual.id &&
          !especializacoesData?.some(ve => ve.especializacao_id === esp.id)
        ) || [],
        conquistas_proximas: [] // Implementar depois
      };

      setVoluntario(voluntarioCompleto);
      setProgressao(progressaoIndividual);

    } catch (error: any) {
      console.error('Erro ao carregar voluntário:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do voluntário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNivelIcon = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_BASE': return <Sprout className="h-5 w-5" />;
      case 'FORMA_N1': return <Shield className="h-5 w-5" />;
      case 'FORMA_N2': return <Sword className="h-5 w-5" />;
      case 'FORMA_N3': return <Crown className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const getEspecializacaoIcon = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_VET': return <Heart className="h-5 w-5" />;
      case 'FORMA_RESCUE': return <Zap className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil do voluntário...</p>
        </div>
      </div>
    );
  }

  if (!voluntario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Voluntário não encontrado</CardTitle>
            <CardDescription>
              O voluntário solicitado não foi encontrado
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/voluntarios">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Voluntários
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <User className="h-8 w-8 mr-3 text-blue-600" />
              {voluntario.nome}
            </h1>
            <p className="text-gray-600 mt-1 flex items-center">
              {progressao?.nivel_atual && (
                <>
                  <span style={{ color: progressao.nivel_atual.cor }} className="mr-2">
                    {getNivelIcon(progressao.nivel_atual.codigo)}
                  </span>
                  {progressao.nivel_atual.nome}
                  {voluntario.ativo ? (
                    <Badge className="ml-2 bg-green-100 text-green-800">Ativo</Badge>
                  ) : (
                    <Badge className="ml-2 bg-red-100 text-red-800">Inativo</Badge>
                  )}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/voluntarios">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Link to={`/voluntarios/editar/${voluntario.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Principal - Informações e Progressão */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{voluntario.email}</p>
                    </div>
                  </div>

                  {voluntario.telefone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Telefone</p>
                        <p className="font-medium">{voluntario.telefone}</p>
                      </div>
                    </div>
                  )}

                  {voluntario.profissao && (
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Profissão</p>
                        <p className="font-medium">{voluntario.profissao}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Data de Ingresso</p>
                      <p className="font-medium">
                        {new Date(voluntario.data_ingresso).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>

                  {voluntario.nif && (
                    <div className="flex items-center space-x-3">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">NIF</p>
                        <p className="font-medium">{voluntario.nif}</p>
                      </div>
                    </div>
                  )}

                  {voluntario.morada && (
                    <div className="flex items-center space-x-3 md:col-span-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Morada</p>
                        <p className="font-medium">{voluntario.morada}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progressão Formativa */}
            {progressao && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Progressão Formativa
                  </CardTitle>
                  <CardDescription>
                    Acompanhamento do desenvolvimento no sistema Valentão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Nível Atual */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${progressao.nivel_atual.cor}10` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span style={{ color: progressao.nivel_atual.cor }}>
                          {getNivelIcon(progressao.nivel_atual.codigo)}
                        </span>
                        <span className="font-semibold">{progressao.nivel_atual.nome}</span>
                        <Badge style={{ backgroundColor: progressao.nivel_atual.cor, color: 'white' }}>
                          Atual
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{progressao.nivel_atual.descricao}</p>
                    
                    {/* Competências do Nível Atual */}
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Competências:</p>
                      <div className="flex flex-wrap gap-1">
                        {progressao.nivel_atual.competencias.map((competencia, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {competencia}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Próximo Nível */}
                  {progressao.proximo_nivel && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Próximo Nível: {progressao.proximo_nivel.nome}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {progressao.progresso_percentual.toFixed(1)}%
                        </span>
                      </div>
                      
                      <Progress value={progressao.progresso_percentual} className="mb-4" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {progressao.criterios_cumpridos.tempo_minimo ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>
                            Tempo: {progressao.tempo_restante_estimado || 0} meses restantes
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {progressao.criterios_cumpridos.missoes_minimas ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>
                            Missões: {progressao.missoes_restantes || 0} restantes
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {progressao.criterios_cumpridos.outros_requisitos ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Outros requisitos</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Histórico de Progressão */}
            {voluntario.progressao && voluntario.progressao.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Histórico de Formação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {voluntario.progressao.map((prog) => (
                      <div key={prog.id} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50">
                        <div style={{ color: prog.nivel?.cor }}>
                          {getNivelIcon(prog.nivel?.codigo || '')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{prog.nivel?.nome}</h4>
                            {prog.data_conclusao && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Concluído
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Início: {new Date(prog.data_inicio).toLocaleDateString('pt-PT')}
                            {prog.data_conclusao && (
                              <> • Conclusão: {new Date(prog.data_conclusao).toLocaleDateString('pt-PT')}</>
                            )}
                          </p>
                          {prog.formador && (
                            <p className="text-xs text-gray-500 mt-1">
                              Formador: {prog.formador.nome}
                            </p>
                          )}
                          {prog.avaliacao_final && (
                            <p className="text-xs text-gray-500 mt-1">
                              Avaliação: {prog.avaliacao_final}/10
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Lateral - Especializações e Conquistas */}
          <div className="space-y-6">
            
            {/* Especializações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Especializações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {voluntario.especializacoes && voluntario.especializacoes.length > 0 ? (
                  <div className="space-y-3">
                    {voluntario.especializacoes.map((esp) => (
                      <div key={esp.id} className="p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <span style={{ color: esp.especializacao?.cor }}>
                            {getEspecializacaoIcon(esp.especializacao?.codigo || '')}
                          </span>
                          <span className="font-medium">{esp.especializacao?.nome}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Obtida em: {new Date(esp.data_obtencao).toLocaleDateString('pt-PT')}
                        </p>
                        {esp.certificado_emitido && (
                          <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Certificado
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Nenhuma especialização obtida</p>
                  </div>
                )}

                {/* Especializações Disponíveis */}
                {progressao?.especializacoes_disponiveis && progressao.especializacoes_disponiveis.length > 0 && (
                  <div className="mt-6">
                    <Separator className="mb-4" />
                    <h4 className="font-medium text-sm text-gray-700 mb-3">Especializações Disponíveis:</h4>
                    <div className="space-y-2">
                      {progressao.especializacoes_disponiveis.map((esp) => (
                        <div key={esp.id} className="p-2 rounded border border-dashed border-gray-300">
                          <div className="flex items-center space-x-2">
                            <span style={{ color: esp.cor }}>
                              {getEspecializacaoIcon(esp.codigo)}
                            </span>
                            <span className="text-sm font-medium">{esp.nome}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{esp.descricao}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conquistas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {voluntario.conquistas && voluntario.conquistas.length > 0 ? (
                  <div className="space-y-3">
                    {voluntario.conquistas.map((conquista) => (
                      <div key={conquista.id} className="p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2 mb-1">
                          <span style={{ color: conquista.conquista?.cor }}>
                            <Award className="h-4 w-4" />
                          </span>
                          <span className="font-medium text-sm">{conquista.conquista?.nome}</span>
                        </div>
                        <p className="text-xs text-gray-600">{conquista.conquista?.descricao}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conquista.data_obtencao).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Nenhuma conquista obtida</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoluntarioProfile;