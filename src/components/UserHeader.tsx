import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Clock, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
}

const UserHeader = ({ title, description, showBackButton = false, backTo = "/" }: UserHeaderProps) => {
  const { user, logout } = useAuth();

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'tecnico':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consulta':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'administrador':
        return <Shield className="h-3 w-3" />;
      case 'tecnico':
        return <User className="h-3 w-3" />;
      case 'consulta':
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Título da Página */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button variant="ghost" size="sm" asChild>
                <a href={backTo}>
                  ← Voltar
                </a>
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
            </div>
          </div>

          {/* Informações do Utilizador */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* Informações do Utilizador */}
              <div className="hidden md:flex items-center space-x-3 text-sm">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{user.nome || user.username}</span>
                    <Badge className={`text-xs ${getRoleColor(user.perfil)}`}>
                      {getRoleIcon(user.perfil)}
                      <span className="ml-1 capitalize">{user.perfil}</span>
                    </Badge>
                  </div>
                  {user.last_login && (
                    <div className="flex items-center space-x-1 text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">
                        Último acesso: {formatLastLogin(user.last_login)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Versão Mobile */}
              <div className="md:hidden flex items-center space-x-2">
                <Badge className={`text-xs ${getRoleColor(user.perfil)}`}>
                  {getRoleIcon(user.perfil)}
                  <span className="ml-1">{user.nome || user.username}</span>
                </Badge>
              </div>

              {/* Botão de Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHeader;