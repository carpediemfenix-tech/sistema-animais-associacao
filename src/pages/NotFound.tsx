import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl">
          {/* 404 Grande */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              404
            </h1>
          </div>
          
          {/* Mensagem */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Página Não Encontrada
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              A página que procura não existe ou foi movida.
            </p>
            <p className="text-sm text-gray-500">
              Caminho tentado: <code className="bg-gray-200 px-2 py-1 rounded">{location.pathname}</code>
            </p>
          </div>

          {/* Ícone */}
          <div className="mb-8">
            <div className="inline-block p-6 bg-white rounded-full shadow-lg">
              <Search className="h-16 w-16 text-gray-400" />
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link to="/">
                <Home className="h-5 w-5 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default NotFound;
