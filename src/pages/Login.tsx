import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, User, Eye, EyeOff, Heart, PawPrint } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, loading } = useAuth();

  // Se já estiver autenticado, redirecionar para dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A verificar autenticação...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await login(username.trim(), password);
      if (success) {
        console.log('✅ [LOGIN] Login bem-sucedido, aguardando mensagens de boas-vindas...');
        // O redirecionamento será controlado pelas mensagens de boas-vindas
        // Não há mais redirecionamento automático aqui
      }
    } catch (error) {
      console.error('💥 [LOGIN] Erro no submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos gráficos decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Patas decorativas */}
        <div className="absolute top-10 left-10 text-blue-200 opacity-30">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.64 7 14.31 7.14 14.05 7.36L12 9.41L9.95 7.36C9.69 7.14 9.36 7 9 7H3V9H8.54L10.5 10.96L8.54 12.92H3V15H9C9.36 15 9.69 14.86 9.95 14.64L12 12.59L14.05 14.64C14.31 14.86 14.64 15 15 15H21V12.92H15.46L13.5 10.96L15.46 9H21Z"/>
          </svg>
        </div>
        <div className="absolute top-20 right-16 text-pink-200 opacity-25">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.5 3C3.12 3 2 4.12 2 5.5C2 6.88 3.12 8 4.5 8S7 6.88 7 5.5C7 4.12 5.88 3 4.5 3ZM19.5 3C18.12 3 17 4.12 17 5.5C17 6.88 18.12 8 19.5 8S22 6.88 22 5.5C22 4.12 20.88 3 19.5 3ZM12 7C10.62 7 9.5 8.12 9.5 9.5C9.5 10.88 10.62 12 12 12S14.5 10.88 14.5 9.5C14.5 8.12 13.38 7 12 7ZM6 10C4.62 10 3.5 11.12 3.5 12.5C3.5 13.88 4.62 15 6 15S8.5 13.88 8.5 12.5C8.5 11.12 7.38 10 6 10ZM18 10C16.62 10 15.5 11.12 15.5 12.5C15.5 13.88 16.62 15 18 15S20.5 13.88 20.5 12.5C20.5 11.12 19.38 10 18 10ZM12 14C9.79 14 8 15.79 8 18V22H16V18C16 15.79 14.21 14 12 14Z"/>
          </svg>
        </div>
        <div className="absolute bottom-16 left-20 text-purple-200 opacity-20">
          <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
          </svg>
        </div>
        <div className="absolute bottom-10 right-10 text-blue-200 opacity-25">
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.64 7 14.31 7.14 14.05 7.36L12 9.41L9.95 7.36C9.69 7.14 9.36 7 9 7H3V9H8.54L10.5 10.96L8.54 12.92H3V15H9C9.36 15 9.69 14.86 9.95 14.64L12 12.59L14.05 14.64C14.31 14.86 14.64 15 15 15H21V12.92H15.46L13.5 10.96L15.46 9H21Z"/>
          </svg>
        </div>
        <div className="absolute top-1/2 left-5 text-pink-200 opacity-15">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
          </svg>
        </div>
        <div className="absolute top-1/3 right-8 text-purple-200 opacity-20">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.5 3C3.12 3 2 4.12 2 5.5C2 6.88 3.12 8 4.5 8S7 6.88 7 5.5C7 4.12 5.88 3 4.5 3ZM19.5 3C18.12 3 17 4.12 17 5.5C17 6.88 18.12 8 19.5 8S22 6.88 22 5.5C22 4.12 20.88 3 19.5 3ZM12 7C10.62 7 9.5 8.12 9.5 9.5C9.5 10.88 10.62 12 12 12S14.5 10.88 14.5 9.5C14.5 8.12 13.38 7 12 7ZM6 10C4.62 10 3.5 11.12 3.5 12.5C3.5 13.88 4.62 15 6 15S8.5 13.88 8.5 12.5C8.5 11.12 7.38 10 6 10ZM18 10C16.62 10 15.5 11.12 15.5 12.5C15.5 13.88 16.62 15 18 15S20.5 13.88 20.5 12.5C20.5 11.12 19.38 10 18 10ZM12 14C9.79 14 8 15.79 8 18V22H16V18C16 15.79 14.21 14 12 14Z"/>
          </svg>
        </div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          {/* Logotipo da Associação Valentão - MAIOR */}
          <div className="inline-flex items-center justify-center mb-6 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-full opacity-30"></div>
            <img 
              src="./images/BackgroundEraser_20250411_205630024.png" 
              alt="Valentão Operacionais" 
              className="h-32 w-auto object-contain drop-shadow-2xl relative z-10"
            />
            {/* Elementos decorativos ao redor do logo */}
            <div className="absolute -top-2 -right-2 text-pink-400">
              <Heart className="h-6 w-6 animate-bounce" style={{animationDelay: '0.5s'}} />
            </div>
            <div className="absolute -bottom-2 -left-2 text-blue-400">
              <PawPrint className="h-5 w-5 animate-bounce" style={{animationDelay: '1s'}} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Valentão Operacionais v2.0
          </h1>
          <p className="text-gray-600">
            Sistema de Gestão Operacional
          </p>
        </div>

        {/* Formulário de Login */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md ring-1 ring-purple-100">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-white">
              Iniciar Sessão
            </CardTitle>
            <CardDescription className="text-blue-100">
              Aceda ao sistema com as suas credenciais
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Nome de Utilizador
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite o seu username"
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Campo Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a sua password"
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isSubmitting || !username.trim() || !password.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    A entrar...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Informações de Acesso */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-sm font-medium text-amber-900 mb-2">
                🔐 Acesso ao Sistema
              </h4>
              <div className="text-xs text-amber-700 space-y-2">
                <p>
                  Para aceder ao sistema, entre em contacto com o Administrador:
                </p>
                <div className="bg-white p-2 rounded border border-amber-300">
                  <strong>📧 E-mail:</strong> geral@valentao.org
                </div>
                <p className="text-amber-600 mt-2">
                  ℹ️ Será fornecido um nome de utilizador e password personalizados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 Valentão ao Resgate - Valentão Operacionais</p>
          <p className="mt-1">Desenvolvido com muito ❤️ para o bem-estar animal</p>
        </div>
      </div>
    </div>
  );
};

export default Login;