import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Moon, 
  Sun, 
  Monitor, 
  Palette, 
  Bell, 
  Globe, 
  Save,
  RotateCcw,
  Zap,
  Shield,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConfiguracaoSistema {
  tema: 'claro' | 'escuro' | 'sistema';
  notificacoes: boolean;
  alertasEmail: boolean;
  alertasSom: boolean;
  idioma: 'pt' | 'en' | 'es';
  autoSave: boolean;
  backupAutomatico: boolean;
  modoPerformance: boolean;
}

const ConfiguracoesSistema = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<ConfiguracaoSistema>({
    tema: 'sistema',
    notificacoes: true,
    alertasEmail: true,
    alertasSom: false,
    idioma: 'pt',
    autoSave: true,
    backupAutomatico: false,
    modoPerformance: false
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedConfig = localStorage.getItem('valentao-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        aplicarTema(parsed.tema);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const aplicarTema = (tema: string) => {
    const root = document.documentElement;
    
    if (tema === 'escuro') {
      root.classList.add('dark');
    } else if (tema === 'claro') {
      root.classList.remove('dark');
    } else {
      // Sistema - detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleConfigChange = (key: keyof ConfiguracaoSistema, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);

    // Aplicar tema imediatamente
    if (key === 'tema') {
      aplicarTema(value);
    }
  };

  const salvarConfiguracoes = () => {
    try {
      localStorage.setItem('valentao-config', JSON.stringify(config));
      setIsDirty(false);
      
      toast({
        title: "Configurações Guardadas",
        description: "As suas preferências foram guardadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Guardar",
        description: "Não foi possível guardar as configurações.",
        variant: "destructive",
      });
    }
  };

  const restaurarPadrao = () => {
    const configPadrao: ConfiguracaoSistema = {
      tema: 'sistema',
      notificacoes: true,
      alertasEmail: true,
      alertasSom: false,
      idioma: 'pt',
      autoSave: true,
      backupAutomatico: false,
      modoPerformance: false
    };
    
    setConfig(configPadrao);
    aplicarTema(configPadrao.tema);
    setIsDirty(true);
    
    toast({
      title: "Configurações Restauradas",
      description: "As configurações foram restauradas para os valores padrão.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Personalize a sua experiência no sistema Valentão ao Resgate
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={restaurarPadrao}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
          <Button 
            onClick={salvarConfiguracoes}
            disabled={!isDirty}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar Alterações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="aparencia" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
          <TabsTrigger value="avancado">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência e Tema
              </CardTitle>
              <CardDescription>
                Personalize a aparência do sistema conforme as suas preferências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Tema do Sistema</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Escolha entre tema claro, escuro ou automático baseado no sistema
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${config.tema === 'claro' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleConfigChange('tema', 'claro')}
                  >
                    <CardContent className="p-4 text-center">
                      <Sun className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Claro</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${config.tema === 'escuro' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleConfigChange('tema', 'escuro')}
                  >
                    <CardContent className="p-4 text-center">
                      <Moon className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Escuro</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${config.tema === 'sistema' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleConfigChange('tema', 'sistema')}
                  >
                    <CardContent className="p-4 text-center">
                      <Monitor className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Sistema</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Idioma</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione o idioma da interface (funcionalidade futura)
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${config.idioma === 'pt' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleConfigChange('idioma', 'pt')}
                  >
                    <CardContent className="p-4 text-center">
                      <Globe className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Português</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-not-allowed opacity-50">
                    <CardContent className="p-4 text-center">
                      <Globe className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">English</p>
                      <Badge variant="secondary" className="text-xs">Em breve</Badge>
                    </CardContent>
                  </Card>
                  <Card className="cursor-not-allowed opacity-50">
                    <CardContent className="p-4 text-center">
                      <Globe className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Español</p>
                      <Badge variant="secondary" className="text-xs">Em breve</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações e Alertas
              </CardTitle>
              <CardDescription>
                Configure como e quando receber notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Notificações do Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações gerais do sistema
                  </p>
                </div>
                <Switch
                  checked={config.notificacoes}
                  onCheckedChange={(checked) => handleConfigChange('notificacoes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Alertas por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas importantes por email (funcionalidade futura)
                  </p>
                </div>
                <Switch
                  checked={config.alertasEmail}
                  onCheckedChange={(checked) => handleConfigChange('alertasEmail', checked)}
                  disabled
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Sons de Alerta</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduzir sons para alertas importantes
                  </p>
                </div>
                <Switch
                  checked={config.alertasSom}
                  onCheckedChange={(checked) => handleConfigChange('alertasSom', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Configurações relacionadas ao funcionamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Gravação Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Gravar automaticamente as alterações nos formulários
                  </p>
                </div>
                <Switch
                  checked={config.autoSave}
                  onCheckedChange={(checked) => handleConfigChange('autoSave', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Modo de Performance</Label>
                  <p className="text-sm text-muted-foreground">
                    Otimizar o sistema para dispositivos mais lentos
                  </p>
                </div>
                <Switch
                  checked={config.modoPerformance}
                  onCheckedChange={(checked) => handleConfigChange('modoPerformance', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avancado">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Configurações avançadas para utilizadores experientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Criar backups automáticos dos dados (funcionalidade futura)
                  </p>
                </div>
                <Switch
                  checked={config.backupAutomatico}
                  onCheckedChange={(checked) => handleConfigChange('backupAutomatico', checked)}
                  disabled
                />
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5" />
                  <Label className="text-base font-medium">Informações do Sistema</Label>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Versão:</span>
                    <Badge variant="outline">v2.0.0</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Base de Dados:</span>
                    <Badge variant="outline">Supabase</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Última Atualização:</span>
                    <span className="text-muted-foreground">16/11/2025</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                  ⚠️ Zona de Perigo
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                  As ações abaixo podem afetar o funcionamento do sistema. Use com cuidado.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" disabled>
                    Limpar Cache do Sistema
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Exportar Todas as Configurações
                  </Button>
                  <Button variant="destructive" size="sm" disabled>
                    Restaurar Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isDirty && (
        <div className="fixed bottom-4 right-4 p-4 bg-primary text-primary-foreground rounded-lg shadow-lg">
          <p className="text-sm font-medium">Tem alterações não guardadas</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="secondary" onClick={salvarConfiguracoes}>
              Guardar
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setIsDirty(false);
                window.location.reload();
              }}
            >
              Descartar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesSistema;