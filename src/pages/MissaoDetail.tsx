import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Target,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ExternalLink,
  Edit,
  Archive,
  Clock,
  User,
  Shield,
  Settings,
  Wrench,
  Euro,
  CheckCircle,
  PlayCircle,
  XCircle,
  Eye,
  Trash2,
  PawPrint
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interface para Missão
interface Missao {
  id: string;
  codigo: string;
  tipo_missao_id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  local_principal: string;
  animal_id?: string;
  prioridade: string;
  orcamento_previsto: number;
  pontos_totais: number;
  responsavel_id?: string;
  status: string;
  custo_real: number;
  min_participantes: number;
  created_at: string;
  updated_at: string;
  ativo: boolean;
  arquivado: boolean;
}

// Interface para Tipo de Missão
interface TipoMissao {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  cor: string;
  pontos_base: number;
}

const MissaoDetail = () => {
  const { id } = useParams();
  const [missao, setMissao] = useState<Missao | null>(null);
  const [tipoMissao, setTipoMissao] = useState<TipoMissao | null>(null);
  const [responsavel, setResponsavel] = useState<any>(null);
  const [animalAssociado, setAnimalAssociado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  // Função para carregar dados da missão
  const fetchMissaoData = async () => {
    if (!id) {
      setError("ID da missão não fornecido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Carregando dados da missão:', id);

      // Carregar dados da missão
      const { data: missaoData, error: missaoError } = await supabase
        .from('missoes_2025_12_18_14_15')
        .select('*')
        .eq('id', id)
        .single();

      if (missaoError) {
        console.error('❌ Erro ao carregar missão:', missaoError);
        throw new Error(`Erro ao carregar missão: ${missaoError.message}`);
      }

      if (!missaoData) {
        throw new Error('Missão não encontrada');
      }

      setMissao(missaoData);
      console.log('✅ Missão carregada:', missaoData);

      // Carregar tipo de missão
      if (missaoData.tipo_missao_id) {
        const { data: tipoData, error: tipoError } = await supabase
          .from('tipos_missoes_2025_12_18_14_15')
          .select('*')
          .eq('id', missaoData.tipo_missao_id)
          .single();

        if (!tipoError && tipoData) {
          setTipoMissao(tipoData);
          console.log('✅ Tipo de missão carregado:', tipoData);
        }
      }

      // Carregar responsável
      if (missaoData.responsavel_id) {
        const { data: responsavelData, error: responsavelError } = await supabase
          .from('voluntarios')
          .select('id, nome, display_name, email')
          .eq('id', missaoData.responsavel_id)
          .single();

        if (!responsavelError && responsavelData) {
          setResponsavel(responsavelData);
          console.log('✅ Responsável carregado:', responsavelData);
        }
      }

      // Carregar animal associado
      if (missaoData.animal_id) {
        const { data: animalData, error: animalError } = await supabase
          .from('animais')
          .select('id, nome, especie, numero_processo')
          .eq('id', missaoData.animal_id)
          .single();

        if (!animalError && animalData) {
          setAnimalAssociado(animalData);
          console.log('✅ Animal associado carregado:', animalData);
        }
      }

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados da missão:', error);
      setError(error.message || 'Erro ao carregar dados da missão');
      toast({
        title: "Erro ao carregar missão",
        description: error.message || "Erro inesperado ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para obter badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
      'em_curso': { color: 'bg-blue-100 text-blue-800', icon: PlayCircle, label: 'Em Curso' },
      'concluida_sucesso': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Concluída com Sucesso' },
      'concluida_insucesso': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Concluída sem Sucesso' },
      'arquivada': { color: 'bg-gray-100 text-gray-800', icon: Archive, label: 'Arquivada' }
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

  // Função para obter badge de prioridade
  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeConfig = {
      'baixa': { color: 'bg-gray-100 text-gray-800', label: 'Baixa' },
      'media': { color: 'bg-blue-100 text-blue-800', label: 'Média' },
      'alta': { color: 'bg-orange-100 text-orange-800', label: 'Alta' },
      'critica': { color: 'bg-red-100 text-red-800', label: 'Crítica' }
    };

    const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.media;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Função para desativar/ativar missão
  const handleToggleAtivo = async () => {
    if (!missao) return;

    try {
      const novoStatus = !missao.ativo;
      
      const { error } = await supabase
        .from('missoes_2025_12_18_14_15')
        .update({ 
          ativo: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', missao.id);

      if (error) throw error;

      setMissao(prev => prev ? { ...prev, ativo: novoStatus } : null);
      
      toast({
        title: novoStatus ? "Missão ativada" : "Missão desativada",
        description: novoStatus ? "A missão foi ativada com sucesso" : "A missão foi desativada com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status da missão",
        variant: "destructive",
      });
    }
  };

  // Função para arquivar missão
  const handleArquivar = async () => {
    if (!missao) return;
    
    if (!confirm('Tem certeza que deseja arquivar esta missão? Ela será removida da listagem principal.')) return;

    try {
      const { error } = await supabase
        .from('missoes_2025_12_18_14_15')
        .update({ 
          arquivado: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', missao.id);

      if (error) throw error;

      toast({
        title: "Missão arquivada",
        description: "A missão foi arquivada com sucesso",
      });

      navigate('/modulo-missoes');
    } catch (error: any) {
      toast({
        title: "Erro ao arquivar",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Função para eliminar missão
  const handleEliminar = async () => {
    if (!missao) return;
    
    if (!confirm('Tem certeza que deseja eliminar esta missão? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('missoes_2025_12_18_14_15')
        .delete()
        .eq('id', missao.id);

      if (error) throw error;

      toast({
        title: "Missão eliminada",
        description: "A missão foi eliminada com sucesso",
      });

      navigate('/modulo-missoes');
    } catch (error: any) {
      toast({
        title: "Erro ao eliminar",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMissaoData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando dados da missão...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  if (error || !missao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar missão</h2>
              <p className="text-gray-600 mb-6">{error || "Missão não encontrada"}</p>
              <Link to="/modulo-missoes">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar às Missões
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header com navegação */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/modulo-missoes">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar às Missões
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                {missao.titulo}
                {tipoMissao && (
                  <span className="ml-3 text-lg font-medium text-blue-600">
                    ({tipoMissao.nome})
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">Código: {missao.codigo}</p>
            </div>
          </div>
          
          {/* Badges de Status */}
          <div className="flex items-center space-x-3">
            {getStatusBadge(missao.status)}
            {getPrioridadeBadge(missao.prioridade)}
            {!missao.ativo && (
              <Badge className="bg-gray-100 text-gray-800">Desativada</Badge>
            )}
          </div>
        </div>

        {/* Informações Básicas */}
        <Card className="mb-8 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-white">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <Target className="h-6 w-6" />
              </div>
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Período</h4>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Início: {new Date(missao.data_inicio).toLocaleDateString('pt-PT')}</span>
                  </div>
                  {missao.data_fim && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Fim: {new Date(missao.data_fim).toLocaleDateString('pt-PT')}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Local</h4>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{missao.local_principal}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Responsável</h4>
                  {responsavel ? (
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>{responsavel.display_name || responsavel.nome}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Não definido</span>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Animal Associado</h4>
                  {animalAssociado ? (
                    <div className="flex items-center text-gray-600">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>{animalAssociado.nome} ({animalAssociado.especie})</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Nenhum animal associado</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Orçamento</h4>
                  <div className="flex items-center text-gray-600">
                    <Euro className="h-4 w-4 mr-2" />
                    <span>€{missao.orcamento_previsto.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pontos</h4>
                  <div className="flex items-center text-gray-600">
                    <Target className="h-4 w-4 mr-2" />
                    <span>{missao.pontos_totais} pontos</span>
                  </div>
                </div>
              </div>
            </div>

            {missao.descricao && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Descrição</h4>
                <p className="text-gray-600">{missao.descricao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gestão da Missão */}
        <Card className="mb-8 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-white">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <Settings className="h-6 w-6" />
              </div>
              Gestão da Missão
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Participações de Voluntários */}
              <Link to={`/missao/${missao.id}/participacoes`}>
                <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-800">Participações</h3>
                    <p className="text-sm text-blue-600">Voluntários vinculados</p>
                  </CardContent>
                </Card>
              </Link>

              {/* Animais da Missão */}
              <Link to={`/missao/${missao.id}/animais`}>
                <Card className="border-2 border-pink-200 hover:border-pink-400 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <PawPrint className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-pink-800">Animais</h3>
                    <p className="text-sm text-pink-600">Animais vinculados</p>
                  </CardContent>
                </Card>
              </Link>

              {/* Controle Financeiro */}
              <Link to={`/missao/${missao.id}/financeiro`}>
                <Card className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-800">Financeiro</h3>
                    <p className="text-sm text-green-600">Receitas e despesas</p>
                  </CardContent>
                </Card>
              </Link>

              {/* Equipamentos */}
              <Link to={`/missao/${missao.id}/equipamentos`}>
                <Card className="border-2 border-orange-200 hover:border-orange-400 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <Wrench className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-orange-800">Equipamentos</h3>
                    <p className="text-sm text-orange-600">Material vinculado</p>
                  </CardContent>
                </Card>
              </Link>

              {/* Configurações */}
              <Link to={`/missao/${missao.id}/configuracoes`}>
                <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-purple-800">Configurações</h3>
                    <p className="text-sm text-purple-600">Opções da missão</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Ações da Missão */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-white">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <Settings className="h-6 w-6" />
              </div>
              Ações da Missão
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              {/* Ver Detalhes */}
              <Button variant="outline" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>

              {/* Editar */}
              {missao.ativo && (
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => navigate(`/missao/${missao.id}/editar`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}

              {/* Ativar/Desativar */}
              <Button 
                variant="outline" 
                className={`flex items-center ${missao.ativo ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                onClick={handleToggleAtivo}
              >
                {missao.ativo ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>

              {/* Arquivar */}
              <Button 
                variant="outline" 
                className="flex items-center text-blue-600 hover:text-blue-700"
                onClick={handleArquivar}
              >
                <Archive className="h-4 w-4 mr-2" />
                Arquivar
              </Button>

              {/* Eliminar */}
              <Button 
                variant="outline" 
                className="flex items-center text-red-600 hover:text-red-700"
                onClick={handleEliminar}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default MissaoDetail;