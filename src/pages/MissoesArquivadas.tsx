import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Archive,
  Search,
  RefreshCw,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Target,
  Shield,
  Heart,
  Megaphone,
  Clipboard,
  Activity,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  XCircle,
  Eye,
  RotateCcw,
  Home,
  ArrowLeft,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interface para missão
interface MissaoArquivada {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  data_inicio: string;
  data_fim: string;
  local_principal: string;
  orcamento_previsto: number;
  orcamento_gasto: number;
  responsavel_id: string;
  arquivada: boolean;
  data_arquivamento: string;
  arquivada_por: string;
  created_at: string;
  updated_at: string;
}

const MissoesArquivadas: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [missoesArquivadas, setMissoesArquivadas] = useState<MissaoArquivada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMissoesArquivadas();
  }, []);

  const loadMissoesArquivadas = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('missoes_2025_12_29_07_00')
        .select('*')
        .eq('arquivada', true)
        .order('data_arquivamento', { ascending: false });

      if (error) throw error;
      
      setMissoesArquivadas(data || []);
    } catch (error: any) {
      console.error('❌ Erro ao carregar missões arquivadas:', error);
      toast({
        title: "Erro ao carregar missões",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDesarquivar = async (missaoId: string) => {
    if (!window.confirm('Tem certeza que deseja desarquivar esta missão?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('missoes_2025_12_29_07_00')
        .update({ 
          arquivada: false,
          data_arquivamento: null,
          arquivada_por: null,
          updated_at: new Date().toISOString(),
          updated_by: 'admin'
        })
        .eq('id', missaoId);

      if (error) throw error;

      toast({
        title: "Missão desarquivada",
        description: "A missão foi desarquivada e voltará a aparecer na listagem principal",
      });

      // Recarregar dados
      loadMissoesArquivadas();
    } catch (error: any) {
      console.error('❌ Erro ao desarquivar missão:', error);
      toast({
        title: "Erro ao desarquivar",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Filtrar missões por termo de busca
  const missoesFiltered = missoesArquivadas.filter(missao =>
    missao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    missao.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    missao.local_principal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obter badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'rascunho': { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Rascunho' },
      'planejada': { color: 'bg-blue-100 text-blue-800', icon: Calendar, label: 'Planejada' },
      'ativa': { color: 'bg-green-100 text-green-800', icon: PlayCircle, label: 'Ativa' },
      'pausada': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pausada' },
      'concluida': { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Concluída' },
      'cancelada': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelada' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.rascunho;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  // Obter badge de prioridade
  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeConfig = {
      'baixa': { color: 'bg-green-100 text-green-800', icon: Shield, label: 'Baixa' },
      'media': { color: 'bg-yellow-100 text-yellow-800', icon: Target, label: 'Média' },
      'alta': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Alta' },
      'critica': { color: 'bg-red-100 text-red-800', icon: Megaphone, label: 'Crítica' }
    };

    const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.media;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <PageActionBar
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Módulo de Missões', href: '/modulo-missoes' },
            { label: 'Missões Arquivadas' }
          ]}
          primaryActions={
            <>
              <Button variant="outline" onClick={loadMissoesArquivadas} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => navigate('/modulo-missoes')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar às Missões
              </Button>
            </>
          }
          secondaryActions={[
            {
              label: 'Voltar ao Dashboard',
              onClick: () => navigate('/dashboard'),
              icon: <Home className="h-4 w-4" />
            }
          ]}
          showBackToDashboard={false}
        />

        {/* Título da Página */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Missões Arquivadas
          </h1>
          <p className="text-gray-600">
            Histórico de missões arquivadas da associação
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar missões arquivadas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Arquivadas</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{missoesArquivadas.length}</div>
              <p className="text-xs text-muted-foreground">
                missões no arquivo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {missoesArquivadas.filter(m => m.status === 'concluida').length}
              </div>
              <p className="text-xs text-muted-foreground">
                missões finalizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {missoesArquivadas.filter(m => m.status === 'cancelada').length}
              </div>
              <p className="text-xs text-muted-foreground">
                missões canceladas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Missões Arquivadas */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Carregando missões arquivadas...</span>
          </div>
        ) : missoesFiltered.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhuma missão encontrada' : 'Nenhuma missão arquivada'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de pesquisa.'
                  : 'Quando arquivar missões, elas aparecerão aqui.'
                }
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpar Pesquisa
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {missoesFiltered.map((missao) => (
              <Card key={missao.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-xl">{missao.titulo}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {missao.codigo}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {missao.descricao || 'Sem descrição'}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {getStatusBadge(missao.status)}
                      {getPrioridadeBadge(missao.prioridade)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Data de Início</p>
                        <p className="text-sm font-medium">
                          {new Date(missao.data_inicio).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Local</p>
                        <p className="text-sm font-medium">
                          {missao.local_principal || 'Não definido'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Orçamento</p>
                        <p className="text-sm font-medium">
                          €{missao.orcamento_previsto?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Archive className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Arquivada em</p>
                        <p className="text-sm font-medium">
                          {new Date(missao.data_arquivamento).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      Arquivada por: {missao.arquivada_por || 'Sistema'}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/missao/${missao.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDesarquivar(missao.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Desarquivar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default MissoesArquivadas;