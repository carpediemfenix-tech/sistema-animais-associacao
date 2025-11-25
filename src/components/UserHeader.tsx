import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Clock, Shield, Heart } from "lucide-react";
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
        return 'bg-red-50 text-red-700 border-red-200';
      case 'tecnico':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'consulta':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 shadow-sm border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            {/* Logo Valentão Operacionais */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/images/BackgroundEraser_20250411_205630024.png" 
                  alt="Valentão Operacionais" 
                  className="h-10 w-10 md:h-12 md:w-12 object-contain"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
              </div>
              
              <div className="hidden sm:block">
                <div className="text-lg md:text-xl font-bold text-orange-800">
                  Valentão Operacionais
                </div>
                <div className="text-xs text-orange-600 font-medium">
                  Sistema de Gestão Animal
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="hidden md:block w-px h-8 bg-orange-300"></div>

            {/* Título da Página */}
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <Button variant="ghost" size="sm" asChild className="text-orange-700 hover:bg-orange-100">
                  <a href={backTo}>
                    ← Voltar
                  </a>
                </Button>
              )}
              <div>
                <h1 className="text-lg md:text-xl font-bold text-orange-900">{title}</h1>
                {description && (
                  <p className="text-sm text-orange-600">{description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informações do Utilizador */}
          {user && (
            <div className="flex items-center space-x-3 md:space-x-4">
              
              {/* Informações do Utilizador - Desktop */}
              <div className="hidden lg:flex items-center space-x-3 text-sm">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-900">
                      {user.nome || user.username}
                    </span>
                  </div>
                  
                  {user.last_login && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-3 w-3 text-orange-500" />
                      <span className="text-xs text-orange-600">
                        {formatLastLogin(user.last_login)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Badge do Perfil */}
              <Badge 
                variant="outline" 
                className={`${getRoleColor(user.perfil)} border text-xs font-medium`}
              >
                <div className="flex items-center space-x-1">
                  {getRoleIcon(user.perfil)}
                  <span className="capitalize">{user.perfil}</span>
                </div>
              </Badge>

              {/* Botão de Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-orange-700 hover:bg-orange-100 hover:text-orange-800 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
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