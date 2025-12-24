import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bell,
  BellRing,
  Check,
  Archive,
  Settings,
  Trash2,
  AlertTriangle,
  Info,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  Volume2,
  VolumeX,
  Zap,
  Bug
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [somAtivo, setSomAtivo] = useState(true);
  const { toast } = useToast();
  
  // Usar o hook de notificações
  const {
    notificacoes,
    loading,
    contadorNaoLidas,
    carregarNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    arquivarNotificacao,
    eliminarNotificacao,
    recalcularContador,
    limparDadosInconsistentes
  } = useNotifications();

  // Função de debug
  const debugContador = async () => {
    console.log('🐛 [DEBUG] Iniciando debug do contador...');
    console.log('🐛 [DEBUG] Contador atual:', contadorNaoLidas);
    console.log('🐛 [DEBUG] Notificações carregadas:', notificacoes.length);
    
    const naoLidasLocal = notificacoes.filter(n => !n.lida && !n.arquivada);
    console.log('🐛 [DEBUG] Não lidas localmente:', naoLidasLocal.length);
    
    if (naoLidasLocal.length > 0) {
      console.log('🐛 [DEBUG] Notificações não lidas:');
      naoLidasLocal.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.titulo} - ID: ${notif.id}`);
      });
    }
    
    // Verificar dados na base de dados
    const realCount = await limparDadosInconsistentes();
    console.log('🐛 [DEBUG] Contador real da BD:', realCount);
    
    // Recalcular contador local
    const localCount = recalcularContador();
    console.log('🐛 [DEBUG] Contador recalculado:', localCount);
    
    toast({
      title: "🐛 Debug Completo",
      description: `Contador: ${contadorNaoLidas} | BD: ${realCount} | Local: ${localCount}`,
    });
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-blue-600" />
                {contadorNaoLidas > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {contadorNaoLidas > 99 ? '99+' : contadorNaoLidas}
                  </Badge>
                )}
              </div>
              <span className="text-xl font-bold">Central de Notificações</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={debugContador}
                className="hidden sm:flex text-purple-600 hover:text-purple-700"
                title="Debug Contador"
              >
                <Bug className="h-4 w-4" />
              </Button>
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

          {/* Debug Info */}
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700">
                🐛 Debug: Contador={contadorNaoLidas} | Local={stats.naoLidas} | Total={stats.total}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={debugContador}
                className="text-purple-600 hover:text-purple-700"
              >
                <Bug className="h-4 w-4 mr-1" />
                Debug
              </Button>
            </div>
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