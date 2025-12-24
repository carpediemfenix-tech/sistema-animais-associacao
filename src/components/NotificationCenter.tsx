import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Heart,
  Users,
  FileText,
  AlertCircle,
  Wrench,
  Search,
  RefreshCw,
  Volume2,
  VolumeX,
  MoreVertical,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Notificacao {
  id: string;
  tipo_id?: string;
  utilizador_id: string;
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
  updated_at: string;
  tipos_notificacoes?: {
    nome: string;
    icone: string;
    cor: string;
    categoria: string;
  };
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [configuracaoOpen, setConfiguracaoOpen] = useState(false);
  const [somAtivo, setSomAtivo] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar notificações
  const carregarNotificacoes = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('🔔 Carregando notificações...');

      const { data, error } = await supabase
        .from('notificacoes')
        .select(`
          *,
          tipos_notificacoes (
            nome,
            icone,
            cor,
            categoria
          )
        `)
        .eq('utilizador_id', user.username)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Erro ao carregar notificações:', error);
        throw error;
      }

      console.log('✅ Notificações carregadas:', data?.length || 0);
      setNotificacoes(data || []);
    } catch (error: any) {
      console.error('💥 Erro geral:', error);
      toast({
        title: "Erro ao carregar notificações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Marcar como lida
  const marcarComoLida = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ 
          lida: true, 
          data_leitura: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id === id 
            ? { ...notif, lida: true, data_leitura: new Date().toISOString() }
            : notif
        )
      );

      toast({
        title: "✅ Notificação marcada como lida",
        description: "A notificação foi marcada como lida",
      });
    } catch (error: any) {
      console.error('❌ Erro ao marcar como lida:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ 
          lida: true, 
          data_leitura: new Date().toISOString() 
        })
        .eq('utilizador_id', user.username)
        .eq('lida', false);

      if (error) throw error;

      setNotificacoes(prev => 
        prev.map(notif => ({ 
          ...notif, 
          lida: true, 
          data_leitura: new Date().toISOString() 
        }))
      );

      toast({
        title: "✅ Todas as notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error: any) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Arquivar notificação
  const arquivarNotificacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ arquivada: true })
        .eq('id', id);

      if (error) throw error;

      setNotificacoes(prev => prev.filter(notif => notif.id !== id));

      toast({
        title: "📁 Notificação arquivada",
        description: "A notificação foi arquivada",
      });
    } catch (error: any) {
      console.error('❌ Erro ao arquivar:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Eliminar notificação
  const eliminarNotificacao = async (id: string) => {
    const confirmacao = window.confirm('Tem certeza que deseja eliminar esta notificação?');
    if (!confirmacao) return;

    try {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotificacoes(prev => prev.filter(notif => notif.id !== id));

      toast({
        title: "🗑️ Notificação eliminada",
        description: "A notificação foi eliminada permanentemente",
      });
    } catch (error: any) {
      console.error('❌ Erro ao eliminar:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Filtrar notificações
  const notificacoesFiltradas = notificacoes.filter(notif => {
    const matchCategoria = filtroCategoria === 'todas' || notif.categoria === filtroCategoria;
    const matchPrioridade = filtroPrioridade === 'todas' || notif.prioridade === filtroPrioridade;
    const matchStatus = filtroStatus === 'todas' || 
      (filtroStatus === 'lidas' && notif.lida) ||
      (filtroStatus === 'nao_lidas' && !notif.lida);
    const matchSearch = searchTerm === '' || 
      notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.mensagem.toLowerCase().includes(searchTerm.toLowerCase());

    return matchCategoria && matchPrioridade && matchStatus && matchSearch;
  });

  // Obter ícone da prioridade
  const getIconePrioridade = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return <Info className="h-4 w-4 text-blue-500" />;
      case 'media': return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'alta': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'critica': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'urgente': return <Zap className="h-4 w-4 text-red-600" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Obter cor da prioridade
  const getCorPrioridade = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return 'bg-blue-50 border-blue-200';
      case 'media': return 'bg-yellow-50 border-yellow-200';
      case 'alta': return 'bg-orange-50 border-orange-200';
      case 'critica': return 'bg-red-50 border-red-200';
      case 'urgente': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Obter ícone da categoria
  const getIconeCategoria = (categoria: string) => {
    switch (categoria) {
      case 'animais': return '🐕';
      case 'saude': return '🏥';
      case 'sistema': return '⚙️';
      case 'seguranca': return '🔒';
      case 'financeiro': return '💰';
      default: return '🔔';
    }
  };

  // Estatísticas
  const stats = {
    total: notificacoes.length,
    naoLidas: notificacoes.filter(n => !n.lida).length,
    criticas: notificacoes.filter(n => n.prioridade === 'critica' || n.prioridade === 'urgente').length,
    hoje: notificacoes.filter(n => {
      const hoje = new Date().toDateString();
      const notifData = new Date(n.created_at).toDateString();
      return hoje === notifData;
    }).length
  };

  useEffect(() => {
    if (isOpen) {
      carregarNotificacoes();
    }
  }, [isOpen, carregarNotificacoes]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-blue-600" />
                {stats.naoLidas > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {stats.naoLidas > 99 ? '99+' : stats.naoLidas}
                  </Badge>
                )}
              </div>
              <span className="text-xl font-bold">Central de Notificações</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSomAtivo(!somAtivo)}
                className="hidden sm:flex"
              >
                {somAtivo ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfiguracaoOpen(true)}
                className="hidden sm:flex"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={carregarNotificacoes}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-lg font-bold text-blue-600">{stats.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <BellRing className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Não Lidas</p>
                  <p className="text-lg font-bold text-orange-600">{stats.naoLidas}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Críticas</p>
                  <p className="text-lg font-bold text-red-600">{stats.criticas}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Hoje</p>
                  <p className="text-lg font-bold text-green-600">{stats.hoje}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros e Pesquisa */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar notificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="animais">Animais</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="sistema">Sistema</SelectItem>
                  <SelectItem value="seguranca">Segurança</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="nao_lidas">Não Lidas</SelectItem>
                  <SelectItem value="lidas">Lidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ações em Lote */}
          {stats.naoLidas > 0 && (
            <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {stats.naoLidas} notificação{stats.naoLidas > 1 ? 'ões' : ''} não lida{stats.naoLidas > 1 ? 's' : ''}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={marcarTodasComoLidas}
                className="text-blue-600 hover:text-blue-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar Todas como Lidas
              </Button>
            </div>
          )}
        </div>

        {/* Lista de Notificações */}
        <ScrollArea className="flex-1 px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Carregando notificações...</span>
            </div>
          ) : notificacoesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificacoesFiltradas.map((notificacao) => (
                <Card 
                  key={notificacao.id} 
                  className={`transition-all duration-200 hover:shadow-md ${
                    !notificacao.lida ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''
                  } ${getCorPrioridade(notificacao.prioridade)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-lg">
                              {getIconeCategoria(notificacao.categoria)}
                            </span>
                            {getIconePrioridade(notificacao.prioridade)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-medium ${!notificacao.lida ? 'font-bold' : ''}`}>
                              {notificacao.titulo}
                            </h4>
                            {!notificacao.lida && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                Nova
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notificacao.mensagem}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(notificacao.created_at).toLocaleString('pt-PT')}
                              </span>
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notificacao.categoria}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                notificacao.prioridade === 'critica' || notificacao.prioridade === 'urgente'
                                  ? 'border-red-300 text-red-700'
                                  : ''
                              }`}
                            >
                              {notificacao.prioridade}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-4">
                        {!notificacao.lida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => marcarComoLida(notificacao.id)}
                            className="h-8 w-8 p-0"
                            title="Marcar como lida"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => arquivarNotificacao(notificacao.id)}
                          className="h-8 w-8 p-0"
                          title="Arquivar"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarNotificacao(notificacao.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;