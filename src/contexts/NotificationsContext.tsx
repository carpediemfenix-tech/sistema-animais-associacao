import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationsContextType {
  notificacoes: any[];
  loading: boolean;
  contadorNaoLidas: number;
  carregarNotificacoes: () => Promise<void>;
  criarNotificacao: (
    titulo: string,
    mensagem: string,
    prioridade?: 'baixa' | 'media' | 'alta' | 'critica' | 'urgente',
    categoria?: string,
    utilizadorId?: string,
    metadata?: any
  ) => Promise<void>;
  marcarComoLida: (id: string) => Promise<void>;
  marcarTodasComoLidas: () => Promise<void>;
  arquivarNotificacao: (id: string) => Promise<void>;
  limparNotificacoes: () => Promise<void>;
  recalcularContador: () => number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const notificationsHook = useNotifications();

  return (
    <NotificationsContext.Provider value={notificationsHook}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};