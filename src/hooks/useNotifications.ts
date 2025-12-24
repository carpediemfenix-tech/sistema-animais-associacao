import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

export const useNotifications = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [contadorNaoLidas, setContadorNaoLidas] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar notificações
  const carregarNotificacoes = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('🔔 [HOOK] Carregando notificações...');

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
        .eq('arquivada', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ [HOOK] Erro ao carregar notificações:', error);
        throw error;
      }

      console.log('✅ [HOOK] Notificações carregadas:', data?.length || 0);
      setNotificacoes(data || []);
      
      // Atualizar contador de não lidas
      const naoLidas = data?.filter(n => !n.lida).length || 0;
      setContadorNaoLidas(naoLidas);
      
    } catch (error: any) {
      console.error('💥 [HOOK] Erro geral:', error);
      toast({
        title: "Erro ao carregar notificações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Criar nova notificação
  const criarNotificacao = useCallback(async (
    titulo: string,
    mensagem: string,
    prioridade: 'baixa' | 'media' | 'alta' | 'critica' | 'urgente' = 'media',
    categoria: string = 'sistema',
    utilizadorId?: string,
    metadata?: any
  ) => {
    try {
      console.log('📝 [HOOK] Criando notificação:', titulo);

      const novaNotificacao = {
        utilizador_id: utilizadorId || user?.username || 'admin',
        titulo,
        mensagem,
        prioridade,
        categoria,
        lida: false,
        arquivada: false,
        auto_dismiss: false,
        som_ativo: true,
        metadata
      };

      const { data, error } = await supabase
        .from('notificacoes')
        .insert([novaNotificacao])
        .select()
        .single();

      if (error) {
        console.error('❌ [HOOK] Erro ao criar notificação:', error);
        throw error;
      }

      console.log('✅ [HOOK] Notificação criada:', data.id);
      
      // Recarregar notificações se for para o utilizador atual
      if (data.utilizador_id === user?.username) {
        carregarNotificacoes();
      }

      return data;
    } catch (error: any) {
      console.error('💥 [HOOK] Erro ao criar notificação:', error);
      toast({
        title: "Erro ao criar notificação",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  }, [user, carregarNotificacoes, toast]);

  // Marcar como lida
  const marcarComoLida = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ 
          lida: true, 
          data_leitura: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id === id 
            ? { ...notif, lida: true, data_leitura: new Date().toISOString() }
            : notif
        )
      );

      // Atualizar contador
      setContadorNaoLidas(prev => Math.max(0, prev - 1));

      console.log('✅ [HOOK] Notificação marcada como lida:', id);
    } catch (error: any) {
      console.error('❌ [HOOK] Erro ao marcar como lida:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Marcar todas como lidas
  const marcarTodasComoLidas = useCallback(async () => {
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

      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => ({ 
          ...notif, 
          lida: true, 
          data_leitura: new Date().toISOString() 
        }))
      );

      // Zerar contador
      setContadorNaoLidas(0);

      console.log('✅ [HOOK] Todas as notificações marcadas como lidas');
      
      toast({
        title: "✅ Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error: any) {
      console.error('❌ [HOOK] Erro ao marcar todas como lidas:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Arquivar notificação
  const arquivarNotificacao = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ arquivada: true })
        .eq('id', id);

      if (error) throw error;

      // Remover do estado local
      setNotificacoes(prev => {
        const notificacao = prev.find(n => n.id === id);
        if (notificacao && !notificacao.lida) {
          setContadorNaoLidas(prevCount => Math.max(0, prevCount - 1));
        }
        return prev.filter(notif => notif.id !== id);
      });

      console.log('✅ [HOOK] Notificação arquivada:', id);
    } catch (error: any) {
      console.error('❌ [HOOK] Erro ao arquivar:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Eliminar notificação
  const eliminarNotificacao = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remover do estado local
      setNotificacoes(prev => {
        const notificacao = prev.find(n => n.id === id);
        if (notificacao && !notificacao.lida) {
          setContadorNaoLidas(prevCount => Math.max(0, prevCount - 1));
        }
        return prev.filter(notif => notif.id !== id);
      });

      console.log('✅ [HOOK] Notificação eliminada:', id);
    } catch (error: any) {
      console.error('❌ [HOOK] Erro ao eliminar:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Configurar listener para novas notificações
  useEffect(() => {
    if (!user) return;

    console.log('🔔 [HOOK] Configurando listener de notificações...');

    const channel = supabase
      .channel('notificacoes-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `utilizador_id=eq.${user.username}`
        },
        (payload) => {
          console.log('🔔 [HOOK] Nova notificação recebida:', payload.new);
          
          // Adicionar nova notificação ao estado
          setNotificacoes(prev => [payload.new as Notificacao, ...prev]);
          
          // Incrementar contador se não lida
          if (!(payload.new as Notificacao).lida) {
            setContadorNaoLidas(prev => prev + 1);
          }

          // Mostrar toast para notificações importantes
          const notif = payload.new as Notificacao;
          if (notif.prioridade === 'alta' || notif.prioridade === 'critica' || notif.prioridade === 'urgente') {
            toast({
              title: `🔔 ${notif.titulo}`,
              description: notif.mensagem,
              variant: notif.prioridade === 'critica' || notif.prioridade === 'urgente' ? "destructive" : "default",
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔔 [HOOK] Removendo listener de notificações...');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Carregar notificações na inicialização
  useEffect(() => {
    if (user) {
      carregarNotificacoes();
    }
  }, [user, carregarNotificacoes]);

  return {
    notificacoes,
    loading,
    contadorNaoLidas,
    carregarNotificacoes,
    criarNotificacao,
    marcarComoLida,
    marcarTodasComoLidas,
    arquivarNotificacao,
    eliminarNotificacao
  };
};