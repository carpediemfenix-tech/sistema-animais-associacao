import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Settings, User, Bell, Palette, Database, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Configuracoes = () => {
  const { toast } = useToast();
  const [perfilUsuario, setPerfilUsuario] = useState<'consulta' | 'edicao' | 'admin'>('edicao');
  const [tema, setTema] = useState<'claro' | 'escuro' | 'sistema'>('claro');
  const [notificacoes, setNotificacoes] = useState(true);
  const [notificacoesEmail, setNotificacoesEmail] = useState(false);

  const handleSaveSettings = () => {
    // Aqui você pode implementar a lógica para salvar as configurações
    // Por exemplo, no localStorage ou numa base de dados
    localStorage.setItem('sistema_config', JSON.stringify({
      perfil_usuario: perfilUsuario,
      tema,
      notificacoes,
      notificacoes_email: notificacoesEmail
    }));

    toast({
      title: "Configurações salvas",
      description: "As suas preferências foram atualizadas com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
                  <p className="text-sm text-gray-500">Gerir preferências do sistema</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Perfil de Usuário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Perfil de Usuário</span>
              </CardTitle>
              <CardDescription>
                Define o nível de acesso e permissões no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="perfil">Perfil Atual</Label>
                  <p className="text-sm text-gray-600">
                    Determina quais funcionalidades estão disponíveis
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={perfilUsuario} onValueChange={(value: any) => setPerfilUsuario(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="edicao">Edição</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge 
                    variant="outline" 
                    className={
                      perfilUsuario === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                      perfilUsuario === 'edicao' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }
                  >
                    {perfilUsuario === 'admin' ? 'Acesso Total' : 
                     perfilUsuario === 'edicao' ? 'Pode Editar' : 'Só Leitura'}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Permissões do Perfil:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">Consulta</h5>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Ver animais</li>
                      <li>• Ver relatórios</li>
                      <li>• Ver dashboard</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">Edição</h5>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Todas as de Consulta</li>
                      <li>• Cadastrar animais</li>
                      <li>• Editar informações</li>
                      <li>• Registar intervenções</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">Administrador</h5>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Todas as anteriores</li>
                      <li>• Gerir voluntários</li>
                      <li>• Eliminar registos</li>
                      <li>• Configurações</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Aparência</span>
              </CardTitle>
              <CardDescription>
                Personalizar a aparência da interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tema">Tema</Label>
                  <p className="text-sm text-gray-600">
                    Escolha entre tema claro, escuro ou automático
                  </p>
                </div>
                <Select value={tema} onValueChange={(value: any) => setTema(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claro">Claro</SelectItem>
                    <SelectItem value="escuro">Escuro</SelectItem>
                    <SelectItem value="sistema">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notificações</span>
              </CardTitle>
              <CardDescription>
                Gerir como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificacoes">Notificações do Sistema</Label>
                  <p className="text-sm text-gray-600">
                    Receber alertas sobre eventos importantes
                  </p>
                </div>
                <Switch
                  id="notificacoes"
                  checked={notificacoes}
                  onCheckedChange={setNotificacoes}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificacoes-email">Notificações por Email</Label>
                  <p className="text-sm text-gray-600">
                    Receber resumos diários por email
                  </p>
                </div>
                <Switch
                  id="notificacoes-email"
                  checked={notificacoesEmail}
                  onCheckedChange={setNotificacoesEmail}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Sistema</span>
              </CardTitle>
              <CardDescription>
                Informações e configurações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Informações do Sistema</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Versão: 2.0.0</div>
                    <div>Base de Dados: Supabase</div>
                    <div>Última Atualização: {new Date().toLocaleDateString('pt-PT')}</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Estatísticas de Uso</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div>Sessão Iniciada: {new Date().toLocaleTimeString('pt-PT')}</div>
                    <div>Perfil Ativo: {perfilUsuario}</div>
                    <div>Estado: Online</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Segurança</span>
              </CardTitle>
              <CardDescription>
                Configurações de segurança e privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Aviso de Segurança</h4>
                <p className="text-sm text-yellow-700">
                  Este sistema contém dados sensíveis sobre animais e voluntários. 
                  Certifique-se de que apenas pessoas autorizadas têm acesso.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sessão Automática</Label>
                  <p className="text-sm text-gray-600">
                    Terminar sessão automaticamente após inatividade
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Ativo (30 min)
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" asChild>
              <Link to="/">Cancelar</Link>
            </Button>
            <Button onClick={handleSaveSettings}>
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;