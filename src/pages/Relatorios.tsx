import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import SistemaRelatoriosProfissional from "@/components/SistemaRelatoriosProfissional";

const Relatorios = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-indigo-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-indigo-100">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-2xl shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    📊 Relatórios e Análises
                  </h1>
                  <p className="text-sm text-gray-600">Sistema completo de relatórios profissionais</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SistemaRelatoriosProfissional />
      </div>
    </div>
  );
};

export default Relatorios;