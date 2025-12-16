import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell,
  BellRing,
  Check,
  X,
  Archive,
  Filter,
  Settings,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  User,
  Package,
  Heart,
  Users,
  FileText,
  Database,
  AlertCircle,
  Wrench,
  UserPlus,
  Search,
  RefreshCw,
  Volume2,
  VolumeX
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCache } from "@/hooks/useCache";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica' | 'urgente';
  categoria: string;
  entidade_tipo?: string;
  entidade_id?: string;
  acao_url?: string;
  acao_texto?: string;
  lida: boolean;
  arquivada: boolean;
  data_leitura?: string;
  auto_dismiss: boolean;
  som_ativo: boolean;
  tags?: string[];
  metadata?: any;
  created_at: string;
  tipos_notificacoes_2025_12_16_12_00?: {
    nome: string;
    icone: string;
    cor: string;
  };
}

interface TipoNotificacao {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  ativo: boolean;
}

interface ConfiguracaoNotificacao {
  id: string;
  tipo_notificacao_id: string;
  ativo: boolean;
  email_ativo: boolean;
  push_ativo: boolean;
  som_ativo: boolean;
  prioridade_minima: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notificacoes: Notificacao[];
  onMarcarLida: (id: string) => void;
  onMarcarTodasLidas: () => void;
  onRefresh: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notificacoes,
  onMarcarLida,
  onMarcarTodasLidas,
  onRefresh
}) => {
  const { toast } = useToast();
  const [filtro, setFiltro] = useState<'todas' | 'nao_lidas' | 'lidas' | 'arquivadas'>('todas');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState<string>('todas');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [busca, setBusca] = useState('');
  const [tiposNotificacao, setTiposNotificacao] = useState<TipoNotificacao[]>([]);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoNotificacao[]>([]);
  const [showConfiguracoes, setShowConfiguracoes] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Cache para tipos de notificação
  const { data: tiposCache } = useCache(
    'tipos_notificacao',
    () => loadTiposNotificacao(),
    { ttl: 10 * 60 * 1000 } // 10 minutos
  );

  const loadTiposNotificacao = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_notificacoes_2025_12_16_12_00')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar tipos de notificação:', error);
      return [];
    }
  };

  const loadConfiguracoes = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_notificacoes_usuario_2025_12_16_12_00')
        .select('*')
        .eq('usuario_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) throw error;
      setConfiguracoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const getIconeNotificacao = (notificacao: Notificacao) => {
    const icone = notificacao.tipos_notificacoes_2025_12_16_12_00?.icone;
    const cor = notificacao.tipos_notificacoes_2025_12_16_12_00?.cor;
    
    const iconProps = {
      className: `h-4 w-4 text-${cor}-600`
    };
    
    switch (icone) {
      case 'Package': return <Package {...iconProps} />;
      case 'Wrench': return <Wrench {...iconProps} />;
      case 'Clock': return <Clock {...iconProps} />;
      case 'UserPlus': return <UserPlus {...iconProps} />;
      case 'AlertTriangle': return <AlertTriangle {...iconProps} />;
      case 'Database': return <Database {...iconProps} />;
      case 'AlertCircle': return <AlertCircle {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'FileText': return <FileText {...iconProps} />;
      default: return <Bell {...iconProps} />;
    }
  };

  const getIconePrioridade = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return <AlertTriangle className="h-4 w-4 text-red-700" />;
      case 'critica':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'alta':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'media':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'baixa':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBadgeVariant = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
      case 'critica':
        return 'destructive';
      case 'alta':
        return 'destructive';
      case 'media':
        return 'default';
      case 'baixa':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleArquivar = async (notificacaoId: string) => {
    try {
      const { error } = await supabase
        .rpc('arquivar_notificacao', {
          p_notificacao_id: notificacaoId,
          p_usuario_id: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Notificação arquivada com sucesso",
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao arquivar notificação",
        variant: "destructive",
      });
    }
  };

  const handleAcaoNotificacao = (notificacao: Notificacao) => {
    if (notificacao.acao_url) {
      window.location.href = notificacao.acao_url;
    }
    if (!notificacao.lida) {
      onMarcarLida(notificacao.id);
    }
  };

  const notificacoesFiltradas = notificacoes.filter(notificacao => {
    // Filtro por status
    if (filtro === 'nao_lidas' && notificacao.lida) return false;
    if (filtro === 'lidas' && !notificacao.lida) return false;
    if (filtro === 'arquivadas' && !notificacao.arquivada) return false;
    if (filtro !== 'arquivadas' && notificacao.arquivada) return false;
    
    // Filtro por prioridade
    if (prioridadeFiltro !== 'todas' && notificacao.prioridade !== prioridadeFiltro) return false;
    
    // Filtro por categoria
    if (categoriaFiltro !== 'todas' && notificacao.categoria !== categoriaFiltro) return false;
    
    // Filtro por busca
    if (busca && !notificacao.titulo.toLowerCase().includes(busca.toLowerCase()) && 
        !notificacao.mensagem.toLowerCase().includes(busca.toLowerCase())) return false;
    
    return true;
  });

  const categorias = [...new Set(notificacoes.map(n => n.categoria))].filter(Boolean);

  useEffect(() => {
    if (isOpen) {
      loadConfiguracoes();
      if (tiposCache) {
        setTiposNotificacao(tiposCache);
      }
    }
  }, [isOpen, tiposCache]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            <BellRing className="h-5 w-5 mr-2 text-blue-600" />
            Central de Notificações Avançada
            <Badge variant="outline" className="ml-2">
              {notificacoesFiltradas.length} de {notificacoes.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowConfiguracoes(!showConfiguracoes)}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button variant="outline" size="sm" onClick={onMarcarTodasLidas}>
              <Check className="h-4 w-4 mr-2" />
              Marcar Todas Lidas
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="notificacoes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notificacoes" className="space-y-4">
              {/* Filtros Avançados */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar notificações..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filtro} onValueChange={(value: any) => setFiltro(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="nao_lidas">Não Lidas</SelectItem>
                      <SelectItem value="lidas">Lidas</SelectItem>
                      <SelectItem value="arquivadas">Arquivadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select value={prioridadeFiltro} onValueChange={setPrioridadeFiltro}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lista de Notificações */}
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {notificacoesFiltradas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma notificação encontrada</p>
                      <p className="text-sm mt-1">Tente ajustar os filtros</p>
                    </div>
                  ) : (
                    notificacoesFiltradas.map((notificacao) => (
                      <div
                        key={notificacao.id}
                        className={`p-4 border rounded-lg transition-all hover:shadow-md cursor-pointer ${
                          notificacao.lida 
                            ? 'bg-gray-50' 
                            : notificacao.prioridade === 'urgente' || notificacao.prioridade === 'critica'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-blue-50 border-blue-200'
                        } ${notificacao.arquivada ? 'opacity-60' : ''}`}
                        onClick={() => handleAcaoNotificacao(notificacao)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getIconeNotificacao(notificacao)}
                              {getIconePrioridade(notificacao.prioridade)}
                              <h4 className="font-medium text-gray-900">{notificacao.titulo}</h4>
                              <Badge variant={getBadgeVariant(notificacao.prioridade)}>
                                {notificacao.prioridade}
                              </Badge>
                              {notificacao.categoria && (
                                <Badge variant="outline">
                                  {notificacao.categoria}
                                </Badge>
                              )}
                              {!notificacao.lida && (
                                <Badge variant="default" className="bg-blue-600">
                                  Nova
                                </Badge>
                              )}
                              {notificacao.som_ativo && (
                                <Volume2 className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{notificacao.mensagem}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(notificacao.created_at).toLocaleString('pt-PT')}
                                {notificacao.tipos_notificacoes_2025_12_16_12_00 && (
                                  <span className="ml-2">
                                    • {notificacao.tipos_notificacoes_2025_12_16_12_00.nome}
                                  </span>
                                )}
                              </div>
                              {notificacao.acao_texto && (
                                <Badge variant="secondary" className="text-xs">
                                  {notificacao.acao_texto}
                                </Badge>
                              )}
                            </div>
                            {notificacao.tags && notificacao.tags.length > 0 && (
                              <div className="flex items-center space-x-1 mt-2">
                                {notificacao.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notificacao.lida && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarcarLida(notificacao.id);
                                }}
                                title="Marcar como lida"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {!notificacao.arquivada && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArquivar(notificacao.id);
                                }}
                                title="Arquivar"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="configuracoes" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações de Notificação</h3>
                <p className="text-sm text-gray-600">
                  Configure como você deseja receber notificações para cada tipo.
                </p>
                
                <div className="space-y-3">
                  {tiposNotificacao.map((tipo) => {
                    const config = configuracoes.find(c => c.tipo_notificacao_id === tipo.id);
                    return (
                      <div key={tipo.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full bg-${tipo.cor}-100`}>
                            {getIconeNotificacao({ tipos_notificacoes_2025_12_16_12_00: tipo } as Notificacao)}
                          </div>
                          <div>
                            <h4 className="font-medium">{tipo.nome}</h4>
                            <p className="text-sm text-gray-600">{tipo.descricao}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={config?.ativo !== false}
                              className="rounded"
                            />
                            <span className="text-sm">Ativo</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={config?.som_ativo !== false}
                              className="rounded"
                            />
                            <Volume2 className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;