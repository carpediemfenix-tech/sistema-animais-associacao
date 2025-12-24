import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WelcomeMessage from '@/components/WelcomeMessage';

interface User {
  id: string;
  username: string;
  email: string;
  nome: string;
  perfil: 'administrador'; // MODO DEV: Sempre administrador
  ativo: boolean;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (action: 'create' | 'update' | 'delete' | 'admin') => boolean;
  isAuthenticated: boolean;
  showWelcomeMessage: boolean;
  showGoodbyeMessage: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showGoodbyeMessage, setShowGoodbyeMessage] = useState(false);
  const { toast } = useToast();

  // Função para registar logs de acesso
  const registarLogAcesso = async (utilizadorNome: string, acao: 'login' | 'logout', sessaoId?: string, duracaoSessao?: number) => {
    try {
      console.log(`📝 [LOG] Registando ${acao} para ${utilizadorNome}`);
      
      const logData = {
        utilizador_nome: utilizadorNome,
        utilizador_id: utilizadorNome, // Por agora usar o nome como ID
        acao,
        data_hora: new Date().toISOString(),
        sessao_id: sessaoId || `sess_${Date.now()}`,
        duracao_sessao: duracaoSessao,
        ip_address: null, // Pode ser implementado posteriormente
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('user_access_logs')
        .insert([logData]);

      if (error) {
        console.error('❌ [LOG] Erro ao registar log:', error);
      } else {
        console.log('✅ [LOG] Log registado com sucesso');
      }
    } catch (error) {
      console.error('💥 [LOG] Erro inesperado ao registar log:', error);
    }
  };
  // Verificar se há utilizador logado no localStorage
  useEffect(() => {
    const checkStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('valentao_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('🔐 [AUTH] Utilizador encontrado no localStorage:', userData.username);
          
          // Verificar se a sessão não excedeu 12 horas
          const loginTime = localStorage.getItem('valentao_login_time');
          if (loginTime) {
            const loginDate = new Date(loginTime);
            const currentDate = new Date();
            const hoursElapsed = (currentDate.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
            
            if (hoursElapsed >= 12) {
              console.log('⏰ [AUTH] Sessão expirada (>12h), fazendo logout automático');
              toast({
                title: "⏰ Sessão expirada",
                description: "A sua sessão expirou após 12 horas. Por favor, faça login novamente.",
                variant: "destructive",
              });
              
              // Registar logout automático
              const sessaoId = localStorage.getItem('valentao_sessao_id');
              const duracaoSessao = Math.floor(hoursElapsed * 60); // converter para minutos
              registarLogAcesso(userData.username, 'logout', sessaoId || undefined, duracaoSessao);
              
              // Limpar dados
              localStorage.removeItem('valentao_user');
              localStorage.removeItem('valentao_sessao_id');
              localStorage.removeItem('valentao_login_time');
              setUser(null);
              setLoading(false);
              return;
            }
          }
          
          setUser(userData);
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro ao ler localStorage:', error);
        localStorage.removeItem('valentao_user');
        localStorage.removeItem('valentao_sessao_id');
        localStorage.removeItem('valentao_login_time');
      } finally {
        setLoading(false);
      }
    };

    checkStoredUser();
    
    // Verificar sessões longas a cada 30 minutos
    const intervalId = setInterval(() => {
      const loginTime = localStorage.getItem('valentao_login_time');
      const storedUser = localStorage.getItem('valentao_user');
      
      if (loginTime && storedUser) {
        const loginDate = new Date(loginTime);
        const currentDate = new Date();
        const hoursElapsed = (currentDate.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursElapsed >= 12) {
          console.log('⏰ [AUTH] Logout automático por sessão longa');
          
          try {
            const userData = JSON.parse(storedUser);
            const sessaoId = localStorage.getItem('valentao_sessao_id');
            const duracaoSessao = Math.floor(hoursElapsed * 60);
            
            // Registar logout automático
            registarLogAcesso(userData.username, 'logout', sessaoId || undefined, duracaoSessao);
            
            toast({
              title: "⏰ Sessão expirada",
              description: "A sua sessão expirou após 12 horas. Faça login novamente.",
              variant: "destructive",
            });
          } catch (error) {
            console.error('❌ [AUTH] Erro ao processar logout automático:', error);
          }
          
          // Limpar dados
          localStorage.removeItem('valentao_user');
          localStorage.removeItem('valentao_sessao_id');
          localStorage.removeItem('valentao_login_time');
          setUser(null);
        }
      }
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(intervalId);
  }, []);

  // Função de login
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔐 [AUTH] Tentando login para:', username);

      // AUTENTICAÇÃO COM PASSWORDS REAIS
      console.log('🔍 [AUTH] Verificando credenciais para:', username);
      
      const { data, error } = await supabase.functions.invoke('auth_improved_2025_11_23_03_00', {
        body: {
          username,
          password
        }
      });

      console.log('🔍 [AUTH] Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('❌ [AUTH] Erro na Edge Function:', error);
        toast({
          title: "❌ Erro de autenticação",
          description: 'Erro interno do servidor',
          variant: "destructive",
        });
        return false;
      }

      if (!data.success) {
        console.log('❌ [AUTH] Login falhado:', data.error);
        toast({
          title: "❌ Login falhado",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }

      // LOGIN BEM-SUCEDIDO
      const userData = {
        ...data.user,
        ativo: true
      };
      
      console.log('✅ [AUTH] Login bem-sucedido para:', userData.username);

      // Definir utilizador no estado
      setUser(userData);
      localStorage.setItem('valentao_user', JSON.stringify(userData));
      
      // Registar log de login
      const sessaoId = `sess_${Date.now()}_${userData.username}`;
      localStorage.setItem('valentao_sessao_id', sessaoId);
      localStorage.setItem('valentao_login_time', new Date().toISOString());
      await registarLogAcesso(userData.username, 'login', sessaoId);
      
      console.log('🔍 [AUTH] Estado atualizado:', userData);
      
      // Mostrar mensagem de boas-vindas
      setShowWelcomeMessage(true);

      return true;
    } catch (error) {
      console.error('💥 [AUTH] Erro inesperado:', error);
      toast({
        title: "❌ Erro inesperado",
        description: "Não foi possível realizar o login",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    console.log('🚪 [AUTH] Logout realizado');
    
    // Calcular duração da sessão
    const loginTime = localStorage.getItem('valentao_login_time');
    const sessaoId = localStorage.getItem('valentao_sessao_id');
    let duracaoSessao = 0;
    
    if (loginTime) {
      const loginDate = new Date(loginTime);
      const logoutDate = new Date();
      duracaoSessao = Math.floor((logoutDate.getTime() - loginDate.getTime()) / (1000 * 60)); // em minutos
    }
    
    // Registar log de logout se há utilizador logado
    if (user && sessaoId) {
      await registarLogAcesso(user.username, 'logout', sessaoId, duracaoSessao);
    }
    
    // Mostrar mensagem de despedida
    setShowGoodbyeMessage(true);
    
    // ✅ Eko: Aguardar a mensagem antes de limpar o estado - aumentado para 4.3 segundos
    setTimeout(() => {
      setUser(null);
      localStorage.removeItem('valentao_user');
      localStorage.removeItem('valentao_sessao_id');
      localStorage.removeItem('valentao_login_time');
      setShowGoodbyeMessage(false);
    }, 4300); // Aumentado de 2300ms para 4300ms para sincronizar com a mensagem de 4 segundos
  };

  // MODO DESENVOLVIMENTO: Permissões totais para todos os usuários autenticados
  const hasPermission = (action: 'create' | 'update' | 'delete' | 'admin'): boolean => {
    // Se o usuário está logado, tem todas as permissões
    return !!user && user.ativo;
  };

  const isAuthenticated = !!user && user.ativo;

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated,
    showWelcomeMessage,
    showGoodbyeMessage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Mensagem de Boas-vindas */}
      {showWelcomeMessage && user && (
        <WelcomeMessage
          type="welcome"
          userName={user.nome || user.username}
          onComplete={() => setShowWelcomeMessage(false)}
        />
      )}
      
      {/* Mensagem de Despedida */}
      {showGoodbyeMessage && user && (
        <WelcomeMessage
          type="goodbye"
          userName={user.nome || user.username}
          onComplete={() => setShowGoodbyeMessage(false)}
        />
      )}
    </AuthContext.Provider>
  );
};