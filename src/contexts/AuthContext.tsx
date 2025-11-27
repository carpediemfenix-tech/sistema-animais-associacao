import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WelcomeMessage from '@/components/WelcomeMessage';

interface User {
  id: string;
  username: string;
  email: string;
  nome: string;
  perfil: 'administrador' | 'tecnico' | 'consulta';
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

  // Verificar se há utilizador logado no localStorage
  useEffect(() => {
    const checkStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('valentao_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('🔐 [AUTH] Utilizador encontrado no localStorage:', userData.username);
          setUser(userData);
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro ao ler localStorage:', error);
        localStorage.removeItem('valentao_user');
      } finally {
        setLoading(false);
      }
    };

    checkStoredUser();
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
  const logout = () => {
    console.log('🚪 [AUTH] Logout realizado');
    
    // Mostrar mensagem de despedida
    setShowGoodbyeMessage(true);
    
    // ✅ Eko: Aguardar a mensagem antes de limpar o estado - aumentado para 4.3 segundos
    setTimeout(() => {
      setUser(null);
      localStorage.removeItem('valentao_user');
      setShowGoodbyeMessage(false);
    }, 4300); // Aumentado de 2300ms para 4300ms para sincronizar com a mensagem de 4 segundos
  };

  // Verificar permissões baseadas no perfil
  const hasPermission = (action: 'create' | 'update' | 'delete' | 'admin'): boolean => {
    if (!user || !user.ativo) return false;

    switch (user.perfil_acesso) {
      case 'administrador':
        return true; // Administrador tem todas as permissões
      
      case 'tecnico':
        return action !== 'delete' && action !== 'admin'; // Técnico pode criar e editar
      
      case 'consulta':
        return false; // Consulta só pode visualizar
      
      default:
        return false;
    }
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