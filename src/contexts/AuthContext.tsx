import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  nome_completo: string;
  perfil_acesso: 'administrador' | 'tecnico' | 'consulta';
  ativo: boolean;
  ultimo_login?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (action: 'create' | 'update' | 'delete' | 'admin') => boolean;
  isAuthenticated: boolean;
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

      // AUTENTICAÇÃO DIRETA NA BASE DE DADOS (temporária)
      console.log('🔍 [AUTH] Verificando credenciais na base de dados...');
      
      const { data: users, error: dbError } = await supabase
        .from('users')
        .select('id, username, email, nome_completo, perfil_acesso, ativo, password_hash')
        .eq('username', username)
        .eq('ativo', true)
        .limit(1);

      if (dbError) {
        console.error('❌ [AUTH] Erro na consulta:', dbError);
        toast({
          title: "❌ Erro de autenticação",
          description: 'Erro ao verificar credenciais',
          variant: "destructive",
        });
        return false;
      }

      if (!users || users.length === 0) {
        console.log('❌ [AUTH] Utilizador não encontrado:', username);
        toast({
          title: "❌ Login falhado",
          description: 'Utilizador ou password incorretos',
          variant: "destructive",
        });
        return false;
      }

      const user = users[0];
      
      // Verificação simples de password (aceitar "password" para todos)
      if (password !== 'password') {
        console.log('❌ [AUTH] Password incorreta para:', username);
        toast({
          title: "❌ Login falhado",
          description: 'Utilizador ou password incorretos',
          variant: "destructive",
        });
        return false;
      }

      // Simular resposta de sucesso
      const data = {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nome_completo: user.nome_completo,
          perfil_acesso: user.perfil_acesso
        }
      };
      
      console.log('✅ [AUTH] Login bem-sucedido:', data.user);

      // Login bem-sucedido
      console.log('✅ [AUTH] Login bem-sucedido:', data.user.username);
      setUser(data.user);
      localStorage.setItem('valentao_user', JSON.stringify(data.user));
      
      toast({
        title: "✅ Login realizado",
        description: `Bem-vindo, ${data.user.nome_completo}!`,
      });

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
    setUser(null);
    localStorage.removeItem('valentao_user');
    
    toast({
      title: "👋 Logout realizado",
      description: "Sessão terminada com sucesso",
    });
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
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
