import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell,
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Settings,
  Filter,
  MoreVertical
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Notificacao {
  id: string;
  tipo_notificacao: string;
  titulo: string;
  mensagem: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  categoria: string;
  dados_contexto: any;
  lida: boolean;
  acao_url?: string;
  data_criacao: string;
  data_leitura?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (notificacao: Notificacao) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNotificationClick
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todas');

  const loadNotificacoes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notificacoes_sistema_2025_12_16_05_00')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotificacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar notificações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (notificacaoId: string) => {
    try {
      const { error } = await supabase
        .rpc('marcar_notificacao_lida', {
          p_notificacao_id: notificacaoId,
          p_usuario_id: user?.id
        });

      if (error) throw error;

      setNotificacoes(prev => 
        prev.map(n => 
          n.id === notificacaoId 
            ? { ...n, lida: true, data_leitura: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const { error } = await supabase
        .rpc('marcar_todas_notificacoes_lidas', {
          p_usuario_id: user?.id
        });

      if (error) throw error;

      setNotificacoes(prev => 
        prev.map(n => ({ 
          ...n, 
          lida: true, 
          data_leitura: new Date().toISOString() 
        }))
      );

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar notificações como lidas",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadNotificacoes();
    }
  }, [isOpen, user]);

  // Configurar subscription para notificações em tempo real
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('notificacoes_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes_sistema_2025_12_16_05_00',
          filter: `usuario_id=eq.${user.id}`
        },
        (payload) => {
          const novaNotificacao = payload.new as Notificacao;
          setNotificacoes(prev => [novaNotificacao, ...prev]);
          
          // Mostrar toast para notificações críticas
          if (novaNotificacao.prioridade === 'critica') {
            toast({
              title: novaNotificacao.titulo,
              description: novaNotificacao.mensagem,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, toast]);

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      'baixa': 'bg-gray-100 text-gray-800',
      'media': 'bg-blue-100 text-blue-800',
      'alta': 'bg-orange-100 text-orange-800',
      'critica': 'bg-red-100 text-red-800'
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'critica':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'alta':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'media':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const notificacoesFiltradas = notificacoes.filter(n => {
    if (filtroTipo !== 'todas' && n.categoria !== filtroTipo) return false;
    if (filtroPrioridade !== 'todas' && n.prioridade !== filtroPrioridade) return false;
    return true;
  });

  const notificacaoNaoLidas = notificacoes.filter(n => !n.lida).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4">
      <Card className="w-96 max-h-[80vh] bg-white shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificações
              {notificacaoNaoLidas > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {notificacaoNaoLidas}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={marcarTodasComoLidas}>
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex space-x-2 mt-3">
            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="todas">Todas</option>
              <option value="animais">Animais</option>
              <option value="equipamentos">Equipamentos</option>
              <option value="financeiro">Financeiro</option>
              <option value="sistema">Sistema</option>
            </select>
            
            <select 
              value={filtroPrioridade} 
              onChange={(e) => setFiltroPrioridade(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="todas">Todas</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando notificações...
              </div>
            ) : notificacoesFiltradas.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notificacoesFiltradas.map((notificacao) => (
                  <div
                    key={notificacao.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notificacao.lida ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      if (!notificacao.lida) {
                        marcarComoLida(notificacao.id);
                      }
                      onNotificationClick?.(notificacao);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getPrioridadeIcon(notificacao.prioridade)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notificacao.titulo}
                            </h4>
                            <Badge className={getPrioridadeColor(notificacao.prioridade)}>
                              {notificacao.prioridade.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notificacao.mensagem}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notificacao.data_criacao).toLocaleString('pt-PT')}
                            </span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {notificacao.categoria}
                              </Badge>
                              {!notificacao.lida && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    marcarComoLida(notificacao.id);
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;