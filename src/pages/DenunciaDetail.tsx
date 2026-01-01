import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageActionBar from '@/components/PageActionBar';
import TimelineDenuncia from '@/components/TimelineDenuncia';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Shield,
  Target,
  Users,
  Stethoscope,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  Heart,
  Activity,
  Eye,
  EyeOff,
  Phone,
  Globe,
  User,
  Mail,
  Share2,
  HelpCircle,
  ArrowRight,
  Calendar,
  Briefcase,
  Edit,
  Archive,
  RotateCcw,
  DollarSign,
  Award
} from 'lucide-react';

interface Denuncia {
  id: string;
  codigo: string;
  data_denuncia: string;
  canal_denuncia: string;
  canal_denuncia_outro?: string;
  local_completo: string;
  local_encontrado: string;
  descricao_situacao: string;
  denunciante_anonimo: boolean;
  denunciante_nome?: string;
  denunciante_contato?: string;
  denunciante_observacoes?: string;
  quantidade_animais: number;
  intervencao_policial: boolean;
  intervencao_bombeiros: boolean;
  intervencao_veterinaria: boolean;
  autoridade_contacto?: string;
  autoridade_nome?: string;
  autoridade_telefone?: string;
  autoridades_contactadas?: string;
  veterinario_responsavel?: string;
  clinica_veterinaria?: string;
  observacoes_veterinarias?: string;
  voluntario_responsavel?: string;
  voluntarios_participantes?: string;
  observacoes_equipe?: string;
  status_denuncia: string;
  prioridade: string;
  data_conclusao?: string;
  observacoes_gestao?: string;
  responsavel_gestao_id?: string;
  arquivada: boolean;
  data_arquivamento?: string;
  arquivada_por?: string;
  motivo_arquivamento?: string;
  pode_ser_restaurada: boolean;
  // Campos da Fase 2
  data_inicio_operacao?: string;
  data_fim_operacao?: string;
  tempo_total_horas?: number;
  custo_estimado?: number;
  custo_real?: number;
  resultado_final?: string;
  tem_relatorio_conclusao: boolean;
  created_at: string;
  updated_at: string;
}

interface RelatorioConlusao {
  id: string;
  resultado_operacao: string;
  animais_resgatados: number;
  animais_tratados: number;
  animais_adotados: number;
  animais_obito: number;
  custo_total: number;
  tempo_operacao_horas: number;
  voluntarios_envolvidos: number;
  acoes_tomadas: string;
  resultados_obtidos: string;
  licoes_aprendidas?: string;
  recomendacoes?: string;
  responsavel_relatorio_nome: string;
  data_conclusao: string;
}

const DenunciaDetail: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [relatorioConlusao, setRelatorioConlusao] = useState<RelatorioConlusao | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detalhes');

  useEffect(() => {
    if (codigo) {
      loadDenuncia();
    }
  }, [codigo]);

  const loadDenuncia = async () => {
    try {
      console.log('🔍 [DENUNCIA_DETAIL] Carregando denúncia:', codigo);
      
      const { data, error } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .select('*')
        .eq('codigo', codigo)
        .single();

      if (error) {
        console.error('❌ [DENUNCIA_DETAIL] Erro ao carregar:', error);
        throw error;
      }

      console.log('✅ [DENUNCIA_DETAIL] Denúncia carregada:', data.codigo);
      setDenuncia(data);

      // Se tem relatório de conclusão, carregar
      if (data.tem_relatorio_conclusao) {
        loadRelatorioConlusao(data.id);
      }
      
    } catch (error) {
      console.error('❌ [DENUNCIA_DETAIL] Erro:', error);
      toast({
        title: "Erro ao carregar denúncia",
        description: "Não foi possível carregar os dados da denúncia.",
        variant: "destructive",
      });
      navigate('/modulo-denuncias');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatorioConlusao = async (denunciaId: string) => {
    try {
      console.log('📋 [DENUNCIA_DETAIL] Carregando relatório de conclusão...');
      
      const { data, error } = await supabase
        .from('relatorios_conclusao_2025_12_31_23_00')
        .select('*')
        .eq('denuncia_id', denunciaId)
        .single();

      if (error) {
        console.error('❌ [DENUNCIA_DETAIL] Erro ao carregar relatório:', error);
        return;
      }

      console.log('✅ [DENUNCIA_DETAIL] Relatório carregado');
      setRelatorioConlusao(data);
    } catch (error) {
      console.error('❌ [DENUNCIA_DETAIL] Erro ao carregar relatório:', error);
    }
  };

  const handleArquivar = async () => {
    if (!denuncia || !hasPermission('admin')) return;

    try {
      const { error } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .update({
          arquivada: true,
          data_arquivamento: new Date().toISOString(),
          arquivada_por: user?.id,
          motivo_arquivamento: 'Arquivada manualmente pelo administrador',
          updated_by: user?.id
        })
        .eq('id', denuncia.id);

      if (error) throw error;

      toast({
        title: "Denúncia arquivada",
        description: "A denúncia foi arquivada com sucesso.",
      });

      loadDenuncia(); // Recarregar dados
    } catch (error) {
      console.error('❌ [DENUNCIA_DETAIL] Erro ao arquivar:', error);
      toast({
        title: "Erro ao arquivar",
        description: "Não foi possível arquivar a denúncia.",
        variant: "destructive",
      });
    }
  };

  const handleRestaurar = async () => {
    if (!denuncia || !hasPermission('admin')) return;

    try {
      const { error } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .update({
          arquivada: false,
          data_arquivamento: null,
          arquivada_por: null,
          motivo_arquivamento: null,
          updated_by: user?.id
        })
        .eq('id', denuncia.id);

      if (error) throw error;

      toast({
        title: "Denúncia restaurada",
        description: "A denúncia foi restaurada do arquivo.",
      });

      loadDenuncia(); // Recarregar dados
    } catch (error) {
      console.error('❌ [DENUNCIA_DETAIL] Erro ao restaurar:', error);
      toast({
        title: "Erro ao restaurar",
        description: "Não foi possível restaurar a denúncia.",
        variant: "destructive",
      });
    }
  };

  // Componentes de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'nova': { label: 'Nova', variant: 'destructive' as const, icon: AlertTriangle },
      'em_andamento': { label: 'Em Andamento', variant: 'default' as const, icon: Clock },
      'concluida': { label: 'Concluída', variant: 'secondary' as const, icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.nova;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeConfig = {
      'baixa': { label: 'Baixa', className: 'bg-green-100 text-green-800' },
      'normal': { label: 'Normal', className: 'bg-blue-100 text-blue-800' },
      'alta': { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
      'urgente': { label: 'Urgente', className: 'bg-red-100 text-red-800' }
    };

    const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.normal;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getResultadoBadge = (resultado: string) => {
    const resultadoConfig = {
      'sucesso_total': { label: 'Sucesso Total', className: 'bg-green-100 text-green-800' },
      'sucesso_parcial': { label: 'Sucesso Parcial', className: 'bg-yellow-100 text-yellow-800' },
      'sem_sucesso': { label: 'Sem Sucesso', className: 'bg-red-100 text-red-800' },
      'falso_alarme': { label: 'Falso Alarme', className: 'bg-gray-100 text-gray-800' }
    };

    const config = resultadoConfig[resultado as keyof typeof resultadoConfig];
    if (!config) return null;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes da denúncia...</p>
        </div>
      </div>
    );
  }

  if (!denuncia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Denúncia não encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <PageActionBar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Denúncias', href: '/modulo-denuncias' },
          { label: denuncia.codigo }
        ]}
        primaryActions={
          <div className="flex gap-2">
            {hasPermission('admin') && (
              <>
                {denuncia.status_denuncia !== 'concluida' && !denuncia.arquivada && (
                  <Button 
                    onClick={() => navigate(`/denuncia/${codigo}/concluir`)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Concluir
                  </Button>
                )}
                <Button 
                  onClick={() => navigate(`/denuncia/${codigo}/editar`)}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </>
            )}
          </div>
        }
        secondaryActions={hasPermission('admin') ? [
          ...(denuncia.arquivada ? [
            {
              label: 'Restaurar',
              onClick: handleRestaurar,
              icon: RotateCcw
            }
          ] : [
            {
              label: 'Arquivar',
              onClick: handleArquivar,
              icon: Archive
            }
          ])
        ] : []}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                Denúncia {denuncia.codigo}
              </h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(denuncia.status_denuncia)}
                {getPrioridadeBadge(denuncia.prioridade)}
                {denuncia.arquivada && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">
                    <Archive className="h-3 w-3 mr-1" />
                    Arquivada
                  </Badge>
                )}
                {denuncia.resultado_final && getResultadoBadge(denuncia.resultado_final)}
              </div>
            </div>
            
            {/* Métricas rápidas */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{denuncia.quantidade_animais}</div>
                <div className="text-xs text-gray-500">Animais</div>
              </div>
              {denuncia.tempo_total_horas && (
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{denuncia.tempo_total_horas}h</div>
                  <div className="text-xs text-gray-500">Duração</div>
                </div>
              )}
              {denuncia.custo_real && (
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">€{denuncia.custo_real}</div>
                  <div className="text-xs text-gray-500">Custo</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            {denuncia.tem_relatorio_conclusao && (
              <TabsTrigger value="relatorio">Relatório</TabsTrigger>
            )}
            <TabsTrigger value="gestao">Gestão</TabsTrigger>
          </TabsList>

          {/* Tab: Detalhes */}
          <TabsContent value="detalhes" className="space-y-6">
            {/* Informações da Denúncia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações da Denúncia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Data da Denúncia</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(denuncia.data_denuncia).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                  <div>
                    <Label>Canal de Denúncia</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {denuncia.canal_denuncia}
                      {denuncia.canal_denuncia_outro && ` (${denuncia.canal_denuncia_outro})`}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Local Encontrado</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {denuncia.local_encontrado}
                  </div>
                </div>

                <div>
                  <Label>Descrição da Situação</Label>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {denuncia.descricao_situacao}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Quantidade de Animais</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-gray-500" />
                      {denuncia.quantidade_animais} animal(is)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Denunciante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Denunciante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Denúncia</Label>
                    <div className="flex items-center gap-2 text-sm">
                      {denuncia.denunciante_anonimo ? (
                        <>
                          <EyeOff className="h-4 w-4 text-gray-500" />
                          Anônima
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 text-gray-500" />
                          Identificada
                        </>
                      )}
                    </div>
                  </div>
                  {!denuncia.denunciante_anonimo && denuncia.denunciante_nome && (
                    <div>
                      <Label>Nome do Denunciante</Label>
                      <div className="text-sm">{denuncia.denunciante_nome}</div>
                    </div>
                  )}
                </div>

                {!denuncia.denunciante_anonimo && denuncia.denunciante_contato && (
                  <div>
                    <Label>Contacto</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {denuncia.denunciante_contato}
                    </div>
                  </div>
                )}

                {denuncia.denunciante_observacoes && (
                  <div>
                    <Label>Observações do Denunciante</Label>
                    <p className="text-sm text-gray-700">{denuncia.denunciante_observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Intervenções */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Intervenções e Autoridades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${denuncia.intervencao_policial ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${denuncia.intervencao_policial ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      Polícia {denuncia.intervencao_policial ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className={`h-4 w-4 ${denuncia.intervencao_bombeiros ? 'text-red-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${denuncia.intervencao_bombeiros ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      Bombeiros {denuncia.intervencao_bombeiros ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className={`h-4 w-4 ${denuncia.intervencao_veterinaria ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${denuncia.intervencao_veterinaria ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                      Veterinário {denuncia.intervencao_veterinaria ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>

                {(denuncia.autoridade_nome || denuncia.autoridade_contacto) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {denuncia.autoridade_nome && (
                      <div>
                        <Label>Autoridade Contactada</Label>
                        <div className="text-sm">{denuncia.autoridade_nome}</div>
                      </div>
                    )}
                    {denuncia.autoridade_contacto && (
                      <div>
                        <Label>Contacto da Autoridade</Label>
                        <div className="text-sm">{denuncia.autoridade_contacto}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Equipe e Veterinário */}
            {(denuncia.veterinario_responsavel || denuncia.voluntario_responsavel) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Equipe e Veterinário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {denuncia.veterinario_responsavel && (
                      <div>
                        <Label>Veterinário Responsável</Label>
                        <div className="text-sm">{denuncia.veterinario_responsavel}</div>
                      </div>
                    )}
                    {denuncia.clinica_veterinaria && (
                      <div>
                        <Label>Clínica Veterinária</Label>
                        <div className="text-sm">{denuncia.clinica_veterinaria}</div>
                      </div>
                    )}
                  </div>

                  {denuncia.voluntario_responsavel && (
                    <div>
                      <Label>Responsável da Operação</Label>
                      <div className="text-sm">{denuncia.voluntario_responsavel}</div>
                    </div>
                  )}

                  {denuncia.voluntarios_participantes && (
                    <div>
                      <Label>Voluntários Participantes</Label>
                      <div className="text-sm">{denuncia.voluntarios_participantes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Timeline */}
          <TabsContent value="timeline">
            <TimelineDenuncia denunciaId={denuncia.id} denunciaCodigo={denuncia.codigo} />
          </TabsContent>

          {/* Tab: Relatório de Conclusão */}
          {denuncia.tem_relatorio_conclusao && relatorioConlusao && (
            <TabsContent value="relatorio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Relatório de Conclusão
                  </CardTitle>
                  <CardDescription>
                    Relatório final da operação de resgate - {new Date(relatorioConlusao.data_conclusao).toLocaleDateString('pt-PT')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resultado e Métricas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{relatorioConlusao.animais_resgatados}</div>
                      <div className="text-sm text-green-700">Resgatados</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{relatorioConlusao.animais_tratados}</div>
                      <div className="text-sm text-blue-700">Tratados</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{relatorioConlusao.animais_adotados}</div>
                      <div className="text-sm text-purple-700">Adotados</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">€{relatorioConlusao.custo_total}</div>
                      <div className="text-sm text-orange-700">Custo Total</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Ações Tomadas</Label>
                      <p className="text-sm text-gray-700 leading-relaxed mt-2">
                        {relatorioConlusao.acoes_tomadas}
                      </p>
                    </div>
                    <div>
                      <Label>Resultados Obtidos</Label>
                      <p className="text-sm text-gray-700 leading-relaxed mt-2">
                        {relatorioConlusao.resultados_obtidos}
                      </p>
                    </div>
                  </div>

                  {relatorioConlusao.licoes_aprendidas && (
                    <div>
                      <Label>Lições Aprendidas</Label>
                      <p className="text-sm text-gray-700 leading-relaxed mt-2">
                        {relatorioConlusao.licoes_aprendidas}
                      </p>
                    </div>
                  )}

                  {relatorioConlusao.recomendacoes && (
                    <div>
                      <Label>Recomendações</Label>
                      <p className="text-sm text-gray-700 leading-relaxed mt-2">
                        {relatorioConlusao.recomendacoes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Relatório criado por: {relatorioConlusao.responsavel_relatorio_nome}
                    </div>
                    <div className="flex items-center gap-2">
                      {getResultadoBadge(relatorioConlusao.resultado_operacao)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Tab: Gestão */}
          <TabsContent value="gestao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Informações de Gestão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div>{getStatusBadge(denuncia.status_denuncia)}</div>
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <div>{getPrioridadeBadge(denuncia.prioridade)}</div>
                  </div>
                </div>

                {denuncia.data_conclusao && (
                  <div>
                    <Label>Data de Conclusão</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(denuncia.data_conclusao).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                )}

                {denuncia.observacoes_gestao && (
                  <div>
                    <Label>Observações de Gestão</Label>
                    <p className="text-sm text-gray-700">{denuncia.observacoes_gestao}</p>
                  </div>
                )}

                {denuncia.arquivada && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label>Informações de Arquivamento</Label>
                    <div className="space-y-2 mt-2">
                      {denuncia.data_arquivamento && (
                        <div className="text-sm">
                          <strong>Data:</strong> {new Date(denuncia.data_arquivamento).toLocaleDateString('pt-PT')}
                        </div>
                      )}
                      {denuncia.motivo_arquivamento && (
                        <div className="text-sm">
                          <strong>Motivo:</strong> {denuncia.motivo_arquivamento}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-4 border-t">
                  <div>Criada em: {new Date(denuncia.created_at).toLocaleString('pt-PT')}</div>
                  <div>Última atualização: {new Date(denuncia.updated_at).toLocaleString('pt-PT')}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Componente auxiliar para labels
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm font-medium text-gray-700 mb-1">{children}</div>
);

export default DenunciaDetail;