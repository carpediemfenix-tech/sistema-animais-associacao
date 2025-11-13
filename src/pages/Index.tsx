import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Plus, List, FileText, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <PawPrint className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Sistema de Cadastro de Animais - Valentão ao Resgate</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gerencie o cadastro completo dos animais da Valentão ao Resgate, incluindo histórico médico,
            intervenções e eventos importantes da vida de cada animal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Plus className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Novo Animal</CardTitle>
              <CardDescription>Cadastrar novo animal na associação</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/novo-animal">
                <Button className="w-full" variant="default">
                  Cadastrar Animal
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <List className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Lista de Animais</CardTitle>
              <CardDescription>Ver todos os animais cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/animais">
                <Button className="w-full" variant="outline">
                  Ver Animais
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Intervenções</CardTitle>
              <CardDescription>Histórico médico e tratamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/animais">
                <Button className="w-full" variant="outline">
                  Ver Histórico
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Relatórios</CardTitle>
              <CardDescription>Estatísticas e relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/relatorios">
                <Button className="w-full" variant="outline">
                  Ver Relatórios
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Funcionalidades do Sistema</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-blue-600">Cadastro Completo</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Identificação completa (nome, espécie, raça, sexo)</li>
                <li>• Características físicas detalhadas</li>
                <li>• Registro de transponder/microchip</li>
                <li>• Controle de peso e idade</li>
                <li>• Upload de fotografias</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 text-green-600">Histórico Médico</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Registro de castrações e cirurgias</li>
                <li>• Controle de desparasitações</li>
                <li>• Histórico de vacinações</li>
                <li>• Consultas veterinárias</li>
                <li>• Tratamentos e medicações</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
