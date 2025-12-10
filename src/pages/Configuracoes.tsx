import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Settings, User, Bell, Palette, Database, Shield, Moon, Sun, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";

const Configuracoes = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { hasPermission } = useAuth();
  const [perfilUsuario, setPerfilUsuario] = useState<'consulta' | 'edicao' | 'admin'>('edicao');
  const [notificacoes, setNotificacoes] = useState(true);
  const [notificacoesEmail, setNotificacoesEmail] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    const savedConfig = localStorage.getItem('sistema_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setPerfilUsuario(config.perfil_usuario || 'edicao');
        setNotificacoes(config.notificacoes !== undefined ? config.notificacoes : true);
        setNotificacoesEmail(config.notificacoes_email !== undefined ? config.notificacoes_email : false);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    // Salvar configurações no localStorage
    localStorage.setItem('sistema_config', JSON.stringify({
      perfil_usuario: perfilUsuario,
      tema: theme,
      notificacoes,
      notificacoes_email: notificacoesEmail
    }));

    toast({
      title: "✅ Configurações salvas",
      description: "As suas preferências foram atualizadas com sucesso",
    });
  };

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'system': return <Monitor className="h-4 w-4" />;
      default: return <Sun className="h-4 w-4" />;
    }
  };

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return 'Claro';
      case 'dark': return 'Escuro';
      case 'system': return 'Sistema';
      default: return 'Claro';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b">
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
                <Settings className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Configurações</h1>
                  <p className="text-sm text-muted-foreground">Gerir preferências do sistema</p>
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
                  <p className="text-sm text-muted-foreground">
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
                      perfilUsuario === 'admin' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' :
                      perfilUsuario === 'edicao' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' :
                      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
                    }
                  >
                    {perfilUsuario === 'admin' ? 'Acesso Total' : 
                     perfilUsuario === 'edicao' ? 'Edição' : 'Apenas Leitura'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Permissões do Perfil:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Consulta:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Ver animais</li>
                      <li>• Ver relatórios</li>
                      <li>• Ver estatísticas</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Edição:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Todas as de Consulta</li>
                      <li>• Adicionar/editar animais</li>
                      <li>• Registar intervenções</li>
                      <li>• Gerir eventos</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Administrador:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Todas as anteriores</li>
                      <li>• Gerir voluntários</li>
                      <li>• Configurações</li>
                      <li>• Eliminar registos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CORRIGIDO: Aparência e Tema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Aparência</span>
              </CardTitle>
              <CardDescription>
                Personalize a aparência da interface do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tema">Tema da Interface</Label>
                  <p className="text-sm text-muted-foreground">
                    Escolha entre tema claro, escuro ou automático
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-40">
                      <SelectValue>
                        <div className="flex items-center space-x-2">
                          {getThemeIcon(theme)}
                          <span>{getThemeLabel(theme)}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4" />
                          <span>Claro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4" />
                          <span>Escuro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4" />
                          <span>Sistema</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {theme === 'system' ? 'Automático' : theme === 'dark' ? 'Escuro' : 'Claro'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-background">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Tema Claro</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Interface clara e limpa, ideal para uso durante o dia
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-background">
                    <div className="flex items-center space-x-2 mb-2">
                      <Moon className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Tema Escuro</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Interface escura, reduz o cansaço visual em ambientes com pouca luz
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-background">
                    <div className="flex items-center space-x-2 mb-2">
                      <Monitor className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Automático</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Segue as configurações do sistema operativo
                    </p>
                  </div>
                </div>
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
                Configure como e quando receber notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificacoes">Notificações no Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas e lembretes dentro da aplicação
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
                  <p className="text-sm text-muted-foreground">
                    Receber resumos e alertas importantes por email
                  </p>
                </div>
                <Switch
                  id="notificacoes-email"
                  checked={notificacoesEmail}
                  onCheckedChange={setNotificacoesEmail}
                />
              </div>

              {notificacoes && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Tipos de Notificações:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Vacinas em atraso</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Consultas próximas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Medicação diária</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Novos animais</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Adoções concluídas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Relatórios mensais</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gestão de Dados */}
          {hasPermission('admin') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Gestão de Dados</span>
                </CardTitle>
                <CardDescription>
                  Configurar e gerir dados do sistema (apenas administradores)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link to="/configuracoes/especies">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <div className="font-medium">Espécies</div>
                        <div className="text-sm text-muted-foreground">Gerir espécies de animais</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/configuracoes/localizacoes">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <div className="font-medium">Localizações</div>
                        <div className="text-sm text-muted-foreground">Gerir locais de alojamento</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/configuracoes/categorias">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <div className="font-medium">Categorias</div>
                        <div className="text-sm text-muted-foreground">Gerir categorias de eventos</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/configuracoes/clinicas">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <div className="font-medium">Clínicas</div>
                        <div className="text-sm text-muted-foreground">Gerir clínicas veterinárias</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/configuracoes/responsabilidades">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <div className="font-medium">Responsabilidades</div>
                        <div className="text-sm text-muted-foreground">Tipos de responsabilidades</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/utilizadores">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <div className="font-medium">Utilizadores</div>
                        <div className="text-sm text-muted-foreground">Gerir utilizadores do sistema</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/historico-nomes">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <div className="font-medium">Histórico de Nomes</div>
                        <div className="text-sm text-muted-foreground">Ver alterações de nomes dos animais</div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Informações do Sistema</span>
              </CardTitle>
              <CardDescription>
                Detalhes técnicos e informações sobre o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Versão do Sistema</Label>
                    <p className="text-sm text-muted-foreground">v2.1.0 - Novembro 2024</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Base de Dados</Label>
                    <p className="text-sm text-muted-foreground">Supabase PostgreSQL</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Última Sincronização</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleString('pt-PT')}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Desenvolvido por</Label>
                    <p className="text-sm text-muted-foreground">Skywork Agent</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tecnologias</Label>
                    <p className="text-sm text-muted-foreground">React, TypeScript, Tailwind CSS</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status do Sistema</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Operacional</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Salvar */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
              <Shield className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;