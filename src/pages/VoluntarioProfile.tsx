import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  GraduationCap,
  Target,
  Shirt,
  Package,
  Award,
  History,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";

interface VoluntarioCompleto {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  morada?: string;
  nif?: string;
  data_nascimento?: string;
  profissao?: string;
  especialidade?: string;
  observacoes?: string;
  ativo: boolean;
  tem_formacao: boolean;
  data_entrada?: string;
  created_at: string;
}

interface ResponsabilidadeAtual {
  id: string;
  animal_id: string;
  data_inicio: string;
  data_fim?: string;
  ativo: boolean;
  animal: {
    nome: string;
    numero_processo: string;
    especie: string;
    estado: string;
  };
}

interface HistoricoResponsabilidade {
  id: string;
  animal_id: string;
  data_inicio: string;
  data_fim: string;
  motivo_fim?: string;
  animal: {
    nome: string;
    numero_processo: string;
    especie: string;
  };
}

interface FormacaoFrequentada {
  id: string;
  data_participacao: string;
  status: string;
  certificado_obtido: boolean;
  acao_formacao: {
    nome: string;
    data_inicio: string;
    data_fim: string;
    tipo_formacao: {
      nome: string;
      codigo: string;
    };
  };
}

interface MissaoParticipada {
  id: string;
  data_missao: string;
  tipo_missao: string;
  descricao: string;
  status: string;
  resultado?: string;
}

interface MaterialFardamento {
  id: string;
  tipo_item: string;
  descricao: string;
  tamanho?: string;
  data_entrega: string;
  data_devolucao?: string;
  estado: string;
  observacoes?: string;
}

const VoluntarioProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [voluntario, setVoluntario] = useState<VoluntarioCompleto | null>(null);
  const [responsabilidadesAtuais, setResponsabilidadesAtuais] = useState<ResponsabilidadeAtual[]>([]);
  const [historicoResponsabilidades, setHistoricoResponsabilidades] = useState<HistoricoResponsabilidade[]>([]);
  const [formacoesFrequentadas, setFormacoesFrequentadas] = useState<FormacaoFrequentada[]>([]);
  const [missoesParticipadas, setMissoesParticipadas] = useState<MissaoParticipada[]>([]);
  const [materialFardamento, setMaterialFardamento] = useState<MaterialFardamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadVoluntarioCompleto();
    }
  }, [id]);

  const loadVoluntarioCompleto = async () => {
    try {
      setLoading(true);
      
      // Carregar dados básicos do voluntário
      const { data: voluntarioData, error: voluntarioError } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('id', id)
        .single();

      if (voluntarioError) throw voluntarioError;
      setVoluntario(voluntarioData);

      // Carregar responsabilidades atuais
      try {
        const { data: responsabilidadesData, error: respError } = await supabase
          .from('responsabilidades_voluntarios')
          .select(`
            *,
            animais:animal_id (
              nome,
              numero_processo,
              especie,
              estado
            )
          `)
          .eq('voluntario_id', id)
          .eq('ativo', true);

        if (respError) {
          console.error('Erro ao carregar responsabilidades:', respError);
        }
        
        // Filtrar apenas responsabilidades com dados de animais válidos
        const responsabilidadesValidas = (responsabilidadesData || []).filter(resp => 
          resp.animal_id && resp.animais
        );
        
        setResponsabilidadesAtuais(responsabilidadesValidas);
      } catch (error) {
        console.error('Erro ao carregar responsabilidades atuais:', error);
        setResponsabilidadesAtuais([]);
      }

      // Carregar histórico de responsabilidades
      try {
        const { data: historicoData, error: histError } = await supabase
          .from('responsabilidades_voluntarios')
          .select(`
            *,
            animais:animal_id (
              nome,
              numero_processo,
              especie
            )
          `)
          .eq('voluntario_id', id)
          .eq('ativo', false)
          .order('data_fim', { ascending: false });

        if (histError) {
          console.error('Erro ao carregar histórico:', histError);
        }
        
        // Filtrar apenas histórico com dados de animais válidos
        const historicoValido = (historicoData || []).filter(hist => 
          hist.animal_id && hist.animais
        );
        
        setHistoricoResponsabilidades(historicoValido);
      } catch (error) {
        console.error('Erro ao carregar histórico de responsabilidades:', error);
        setHistoricoResponsabilidades([]);
      }

      // Carregar formações frequentadas (dados fictícios por enquanto)
      setFormacoesFrequentadas([
        {
          id: '1',
          data_participacao: '2024-01-15',
          status: 'concluida',
          certificado_obtido: true,
          acao_formacao: {
            nome: 'Primeiros Socorros Veterinários',
            data_inicio: '2024-01-10',
            data_fim: '2024-01-15',
            tipo_formacao: {
              nome: 'FORMA BASE',
              codigo: 'FORMA_BASE'
            }
          }
        },
        {
          id: '2',
          data_participacao: '2024-03-20',
          status: 'em_curso',
          certificado_obtido: false,
          acao_formacao: {
            nome: 'Técnicas de Resgate',
            data_inicio: '2024-03-15',
            data_fim: '2024-03-25',
            tipo_formacao: {
              nome: 'Formação N1',
              codigo: 'FORMA_N1'
            }
          }
        }
      ]);

      // Carregar missões participadas (dados fictícios)
      setMissoesParticipadas([
        {
          id: '1',
          data_missao: '2024-02-10',
          tipo_missao: 'Resgate',
          descricao: 'Resgate de cão abandonado na A1',
          status: 'concluida',
          resultado: 'Animal resgatado com sucesso'
        },
        {
          id: '2',
          data_missao: '2024-03-05',
          tipo_missao: 'Transporte',
          descricao: 'Transporte para consulta veterinária',
          status: 'concluida',
          resultado: 'Transporte realizado sem intercorrências'
        }
      ]);

      // Carregar material e fardamento (dados fictícios)
      setMaterialFardamento([
        {
          id: '1',
          tipo_item: 'Fardamento',
          descricao: 'Camisola oficial VR',
          tamanho: 'M',
          data_entrega: '2024-01-01',
          estado: 'bom',
          observacoes: 'Em uso regular'
        },
        {
          id: '2',
          tipo_item: 'Equipamento',
          descricao: 'Kit de primeiros socorros',
          data_entrega: '2024-01-15',
          estado: 'excelente',
          observacoes: 'Completo e atualizado'
        }
      ]);

    } catch (error: any) {
      console.error('Erro ao carregar dados do voluntário:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do voluntário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando perfil completo...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!voluntario) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Voluntário não encontrado</CardTitle>
              <CardDescription>
                O voluntário solicitado não foi encontrado
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/voluntarios/gestao">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Gestão
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/voluntarios/gestao">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Gestão
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <User className="h-8 w-8 mr-3 text-blue-600" />
                {voluntario.nome}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={voluntario.ativo ? "default" : "secondary"}>
                  {voluntario.ativo ? "Ativo" : "Inativo"}
                </Badge>
                <Badge variant="outline">
                  {voluntario.especialidade || "Geral"}
                </Badge>
                {voluntario.tem_formacao && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Com Formação
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex space-x-2">
            <Link to={`/voluntarios/${voluntario.id}/formacoes`}>
              <Button variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                <GraduationCap className="h-4 w-4 mr-2" />
                Formações Frequentadas
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs com informações completas */}
        <Tabs defaultValue="dados-pessoais" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="animais">Animais</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="formacao">Formação</TabsTrigger>
            <TabsTrigger value="missoes">Missões</TabsTrigger>
            <TabsTrigger value="material">Material</TabsTrigger>
          </TabsList>

          {/* Aba: Dados Pessoais */}
          <TabsContent value="dados-pessoais">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nome Completo</Label>
                      <p className="text-sm font-medium">{voluntario.nome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-sm">{voluntario.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Telefone</Label>
                      <p className="text-sm">{voluntario.telefone || "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">NIF</Label>
                      <p className="text-sm">{voluntario.nif || "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Data de Nascimento</Label>
                      <p className="text-sm">
                        {voluntario.data_nascimento 
                          ? new Date(voluntario.data_nascimento).toLocaleDateString('pt-PT')
                          : "Não informado"
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Profissão</Label>
                      <p className="text-sm">{voluntario.profissao || "Não informado"}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Morada</Label>
                    <p className="text-sm">{voluntario.morada || "Não informado"}</p>
                  </div>
                  {voluntario.observacoes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Observações</Label>
                      <p className="text-sm">{voluntario.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Informações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Data de Entrada</Label>
                      <p className="text-sm">
                        {voluntario.data_entrada 
                          ? new Date(voluntario.data_entrada).toLocaleDateString('pt-PT')
                          : new Date(voluntario.created_at).toLocaleDateString('pt-PT')
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Especialidade</Label>
                      <p className="text-sm">{voluntario.especialidade || "Geral"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <Badge variant={voluntario.ativo ? "default" : "secondary"}>
                        {voluntario.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Formação</Label>
                      <Badge variant={voluntario.tem_formacao ? "default" : "outline"}>
                        {voluntario.tem_formacao ? "Com Formação" : "Sem Formação"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Animais Dependentes */}
          <TabsContent value="animais">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PawPrint className="h-5 w-5 mr-2" />
                    Animais Sob Responsabilidade ({responsabilidadesAtuais.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {responsabilidadesAtuais.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhum animal sob responsabilidade atualmente
                    </p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {responsabilidadesAtuais.map((resp) => (
                        <Card key={resp.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{resp.animais?.nome || 'Nome não disponível'}</h4>
                              <Badge variant="outline">{resp.animais?.estado || 'Estado desconhecido'}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Processo: {resp.animais?.numero_processo || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              Espécie: {resp.animais?.especie || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Responsável desde: {new Date(resp.data_inicio).toLocaleDateString('pt-PT')}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Histórico de Responsabilidades */}
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Histórico de Responsabilidades ({historicoResponsabilidades.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historicoResponsabilidades.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum histórico de responsabilidades
                  </p>
                ) : (
                  <div className="space-y-4">
                    {historicoResponsabilidades.map((hist) => (
                      <div key={hist.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{hist.animais?.nome || 'Nome não disponível'}</h4>
                          <Badge variant="secondary">Finalizada</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Processo:</span> {hist.animais?.numero_processo || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Espécie:</span> {hist.animais?.especie || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Início:</span> {new Date(hist.data_inicio).toLocaleDateString('pt-PT')}
                          </div>
                          <div>
                            <span className="font-medium">Fim:</span> {new Date(hist.data_fim).toLocaleDateString('pt-PT')}
                          </div>
                        </div>
                        {hist.motivo_fim && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Motivo:</span> {hist.motivo_fim}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Formações Frequentadas */}
          <TabsContent value="formacao">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Formações Frequentadas ({formacoesFrequentadas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formacoesFrequentadas.map((formacao) => (
                    <div key={formacao.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{formacao.acao_formacao.nome}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={formacao.status === 'concluida' ? 'default' : 'secondary'}>
                            {formacao.status === 'concluida' ? 'Concluída' : 'Em Curso'}
                          </Badge>
                          {formacao.certificado_obtido && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <Award className="h-3 w-3 mr-1" />
                              Certificado
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tipo:</span> {formacao.acao_formacao.tipo_formacao.nome}
                        </div>
                        <div>
                          <span className="font-medium">Início:</span> {new Date(formacao.acao_formacao.data_inicio).toLocaleDateString('pt-PT')}
                        </div>
                        <div>
                          <span className="font-medium">Fim:</span> {new Date(formacao.acao_formacao.data_fim).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Missões Participadas */}
          <TabsContent value="missoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Missões Participadas ({missoesParticipadas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {missoesParticipadas.map((missao) => (
                    <div key={missao.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{missao.tipo_missao}</h4>
                        <Badge variant={missao.status === 'concluida' ? 'default' : 'secondary'}>
                          {missao.status === 'concluida' ? 'Concluída' : 'Em Andamento'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{missao.descricao}</p>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Data:</span> {new Date(missao.data_missao).toLocaleDateString('pt-PT')}
                      </div>
                      {missao.resultado && (
                        <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                          <span className="font-medium">Resultado:</span> {missao.resultado}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Fardamento e Material */}
          <TabsContent value="material">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Fardamento e Material ({materialFardamento.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materialFardamento.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold flex items-center">
                          {item.tipo_item === 'Fardamento' ? (
                            <Shirt className="h-4 w-4 mr-2" />
                          ) : (
                            <Package className="h-4 w-4 mr-2" />
                          )}
                          {item.descricao}
                        </h4>
                        <Badge variant={item.estado === 'excelente' ? 'default' : 'outline'}>
                          {item.estado}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tipo:</span> {item.tipo_item}
                        </div>
                        {item.tamanho && (
                          <div>
                            <span className="font-medium">Tamanho:</span> {item.tamanho}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Entregue em:</span> {new Date(item.data_entrega).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                      {item.observacoes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Observações:</span> {item.observacoes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VoluntarioProfile;