import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  Download, 
  ExternalLink,
  Home,
  Users,
  PawPrint,
  DollarSign,
  BarChart3,
  Settings,
  Smartphone,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import LogotipoValentao from "@/components/LogotipoValentao";

const ManualUtilizador = () => {
  const [activeSection, setActiveSection] = useState("introducao");

  const sections = [
    { id: "introducao", title: "1. Introdução ao Sistema", icon: BookOpen },
    { id: "login", title: "2. Como Fazer Login", icon: Users },
    { id: "dashboard", title: "3. Dashboard Principal", icon: Home },
    { id: "animais", title: "4. Gestão de Animais", icon: PawPrint },
    { id: "grupos", title: "5. Matilhas e Colónias", icon: Users },
    { id: "financeiro", title: "6. Gestão Financeira", icon: DollarSign },
    { id: "relatorios", title: "7. Relatórios", icon: BarChart3 },
    { id: "mobile", title: "8. Dicas para Telemóvel", icon: Smartphone },
    { id: "suporte", title: "9. Suporte e Contactos", icon: HelpCircle }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "introducao":
        return (
          <div className="space-y-6">
            <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">🐾 Sistema Valentão</h2>
              <p className="text-lg text-gray-600 mb-4">
                Plataforma completa para gestão de animais de associações de proteção animal
              </p>
              <Badge className="bg-blue-100 text-blue-800 text-sm px-4 py-2">
                Versão 1.0 - Novembro 2025
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <PawPrint className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">Gestão de Animais</h4>
                      <p className="text-sm text-gray-600">Registo completo com histórico médico</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-semibold">Matilhas e Colónias</h4>
                      <p className="text-sm text-gray-600">Organização em grupos geográficos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-8 w-8 text-purple-500" />
                    <div>
                      <h4 className="font-semibold">Gestão Financeira</h4>
                      <p className="text-sm text-gray-600">Controlo de receitas e despesas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">Relatórios</h4>
                      <p className="text-sm text-gray-600">Estatísticas e análises detalhadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-8 w-8 text-red-500" />
                    <div>
                      <h4 className="font-semibold">Gestão de Utilizadores</h4>
                      <p className="text-sm text-gray-600">Sistema de permissões</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-teal-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-8 w-8 text-teal-500" />
                    <div>
                      <h4 className="font-semibold">Otimizado para Telemóvel</h4>
                      <p className="text-sm text-gray-600">Interface responsiva</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800">Dica</h4>
                  <p className="text-green-700">
                    O sistema foi desenvolvido para ser intuitivo. Se tiver dúvidas, procure os ícones de ajuda (?) ou contacte o administrador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "login":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Como Fazer Login
            </h2>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">🔑 Credenciais de Acesso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <strong>URL:</strong> https://xg65bxhsm5.skywork.website
                </div>
                <div className="bg-white p-3 rounded border">
                  <strong>Utilizador:</strong> admin
                </div>
                <div className="bg-white p-3 rounded border">
                  <strong>Password:</strong> password
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Passos para Login</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Aceder ao Sistema</h4>
                    <p className="text-gray-600">Abra o navegador do seu telemóvel e digite o endereço do sistema.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Inserir Credenciais</h4>
                    <p className="text-gray-600">Digite o seu nome de utilizador e password nos campos correspondentes.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Fazer Login</h4>
                    <p className="text-gray-600">Toque no botão "Entrar" para aceder ao sistema.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Importante</h4>
                  <p className="text-yellow-700">
                    Guarde as suas credenciais em local seguro. Não partilhe a sua password com outros utilizadores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Home className="h-6 w-6 mr-2 text-blue-600" />
              Dashboard Principal
            </h2>

            <p className="text-gray-600">
              Após fazer login, será direcionado para o Dashboard principal. Esta é a página inicial onde pode ver um resumo geral do sistema.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <h4 className="font-semibold">Estatísticas Rápidas</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    No topo, vê cartões com números importantes: total de animais, adoções, intervenções médicas, etc.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <h4 className="font-semibold">Módulos Principais</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Cartões grandes com as principais funcionalidades: Gestão de Animais, Matilhas e Colónias, etc.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <h4 className="font-semibold">Agenda e Lembretes</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Lista de eventos próximos e lembretes importantes (vacinações, consultas, etc.).
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                    <h4 className="font-semibold">Ações Rápidas</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Botões para ações frequentes como "Novo Animal", "Nova Intervenção", etc.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-3 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">📱 Dica para Telemóvel</h3>
              <p className="text-gray-600">
                No telemóvel, deslize para baixo para ver todos os módulos. Toque nos cartões para aceder às funcionalidades.
              </p>
            </div>
          </div>
        );

      case "mobile":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Smartphone className="h-6 w-6 mr-2 text-blue-600" />
              Dicas para Uso em Telemóvel
            </h2>

            <p className="text-gray-600">
              O sistema foi otimizado para telemóveis. Aqui estão algumas dicas para melhor experiência:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Pesquisa Rápida</h4>
                    <p className="text-sm text-gray-600">Use a barra de pesquisa para encontrar animais rapidamente</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Listas Otimizadas</h4>
                    <p className="text-sm text-gray-600">Listas adaptadas para ecrãs pequenos com informações essenciais</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Ações Rápidas</h4>
                    <p className="text-sm text-gray-600">Botões grandes e fáceis de tocar</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🔋 Dica de Performance</h3>
                <p className="text-gray-600">
                  Para melhor performance, feche outras aplicações enquanto usa o sistema e certifique-se de ter boa ligação à internet.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700">Resolução de Problemas Comuns</h3>
              
              <div className="space-y-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <strong className="text-yellow-800">Página não carrega:</strong>
                      <span className="text-yellow-700"> Verifique a ligação à internet e recarregue a página.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <strong className="text-yellow-800">Botões não respondem:</strong>
                      <span className="text-yellow-700"> Aguarde alguns segundos - o sistema pode estar a processar.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <strong className="text-yellow-800">Formulário não guarda:</strong>
                      <span className="text-yellow-700"> Verifique se preencheu todos os campos obrigatórios (marcados com *).</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "suporte":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <HelpCircle className="h-6 w-6 mr-2 text-blue-600" />
              Suporte e Contactos
            </h2>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">📞 Contactos de Suporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <strong>Sistema:</strong> https://xg65bxhsm5.skywork.website
                </div>
                <div className="bg-white p-3 rounded border">
                  <strong>Administrador:</strong> [Contactar responsável da associação]
                </div>
                <div className="bg-white p-3 rounded border">
                  <strong>Suporte Técnico:</strong> [Definir contacto técnico]
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Boas Práticas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Faça logout quando terminar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Mantenha credenciais seguras</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Atualize dados regularmente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Verifique relatórios mensalmente</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">💝 Obrigado por Cuidar dos Animais!</h3>
              <p className="text-gray-600">
                Este sistema é uma ferramenta para apoiar o vosso trabalho incrível de proteção animal. Juntos, fazemos a diferença! 🐾
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Selecione uma secção do manual para ver o conteúdo.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <LogotipoValentao size="sm" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
                  Manual do Utilizador
                </h1>
                <p className="text-sm text-gray-600">
                  Guia completo do Sistema Valentão
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <a href="/manual-utilizador.html" target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Versão PDF
                </a>
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Índice */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">📋 Índice</CardTitle>
                <CardDescription>
                  Navegue pelas secções do manual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                          activeSection === section.id
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                {renderSection()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualUtilizador;