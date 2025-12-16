import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  BarChart3,
  Package,
  User,
  Wrench,
  AlertTriangle,
  FileText,
  Settings,
  Bell,
  RefreshCw,
  Maximize2,
  Minimize2,
  Copy,
  Save
} from "lucide-react";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  path: string;
  count?: number;
  isActive?: boolean;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  path, 
  count,
  isActive 
}) => (
  <Link to={path}>
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
      isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {count !== undefined && (
            <Badge className="bg-gray-100 text-gray-800">
              {count}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg mb-2">{title}</CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

const EquipamentosNavigation: React.FC = () => {
  const location = useLocation();
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [showConfiguracoes, setShowConfiguracoes] = useState(false);
  
  // Mock data - em produção, estes valores viriam de uma API
  const stats = {
    totalEquipamentos: 156,
    atribuicoesAtivas: 23,
    manutencoesPendentes: 8,
    alertasAtivos: 12,
    relatoriosDisponiveis: 6
  };

  const navigationItems = [
    {
      title: "Dashboard",
      description: "Visão geral e métricas principais do sistema de equipamentos",
      icon: BarChart3,
      color: "bg-blue-500",
      path: "/equipamentos/dashboard",
      count: stats.totalEquipamentos
    },
    {
      title: "Inventário",
      description: "Gestão completa de equipamentos, categorias e tipos",
      icon: Package,
      color: "bg-green-500",
      path: "/equipamentos/inventario",
      count: stats.totalEquipamentos
    },
    {
      title: "Atribuições",
      description: "Controle de atribuições e devoluções de equipamentos",
      icon: User,
      color: "bg-purple-500",
      path: "/equipamentos/atribuicoes",
      count: stats.atribuicoesAtivas
    },
    {
      title: "Manutenções",
      description: "Agendamento e controle de manutenções preventivas e corretivas",
      icon: Wrench,
      color: "bg-orange-500",
      path: "/equipamentos/manutencoes",
      count: stats.manutencoesPendentes
    },
    {
      title: "Alertas",
      description: "Sistema de alertas inteligente e notificações automáticas",
      icon: AlertTriangle,
      color: "bg-red-500",
      path: "/equipamentos/alertas",
      count: stats.alertasAtivos
    },
    {
      title: "Relatórios",
      description: "Dashboard avançado e relatórios executivos com analytics",
      icon: FileText,
      color: "bg-indigo-500",
      path: "/equipamentos/relatorios",
      count: stats.relatoriosDisponiveis
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      {/* Barra de Controles */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-lg font-semibold text-gray-900">Módulo Equipamentos</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowNotificacoes(true)}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowConfiguracoes(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Equipamentos</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEquipamentos}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.atribuicoesAtivas} em uso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atribuições Ativas</CardTitle>
                <User className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.atribuicoesAtivas}</div>
                <p className="text-xs text-muted-foreground">
                  Equipamentos atribuídos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
                <Wrench className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.manutencoesPendentes}</div>
                <p className="text-xs text-muted-foreground">
                  Pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.alertasAtivos}</div>
                <p className="text-xs text-muted-foreground">
                  Requerem atenção
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Navegação Principal */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {navigationItems.map((item) => (
                <NavigationCard
                  key={item.path}
                  {...item}
                  isActive={location.pathname === item.path}
                />
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Backup Manual</div>
                    <div className="text-sm text-gray-600">Criar backup dos dados</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Exportar Dados</div>
                    <div className="text-sm text-gray-600">Exportar para Excel/CSV</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Configurações</div>
                    <div className="text-sm text-gray-600">Configurar sistema</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal de Notificações */}
      <Dialog open={showNotificacoes} onOpenChange={setShowNotificacoes}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Central de Notificações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Novo equipamento adicionado</p>
                    <p className="text-sm text-blue-700">Equipamento EQ-2025-001 foi registrado no sistema</p>
                    <p className="text-xs text-blue-600 mt-1">Há 2 horas</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Novo</Badge>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg bg-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-orange-900">Manutenção programada</p>
                    <p className="text-sm text-orange-700">Equipamento EQ-2024-045 precisa de manutenção</p>
                    <p className="text-xs text-orange-600 mt-1">Há 1 dia</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Alerta</Badge>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">Atribuição concluída</p>
                    <p className="text-sm text-green-700">Equipamento EQ-2024-032 foi devolvido</p>
                    <p className="text-xs text-green-600 mt-1">Há 2 dias</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowNotificacoes(false)}>
              Fechar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Marcar todas como lidas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações */}
      <Dialog open={showConfiguracoes} onOpenChange={setShowConfiguracoes}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações do Sistema</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Configurações Gerais */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-600">Configurações Gerais</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo escuro</Label>
                    <p className="text-sm text-gray-600">Ativar tema escuro do sistema</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por email</Label>
                    <p className="text-sm text-gray-600">Receber alertas por email</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-backup</Label>
                    <p className="text-sm text-gray-600">Backup automático diário</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>

            {/* Configurações de Equipamentos */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-600">Equipamentos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Período de manutenção padrão (dias)</Label>
                  <Input type="number" defaultValue="90" />
                </div>
                <div>
                  <Label>Alerta de garantia (dias antes)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div>
                  <Label>Estado padrão para novos equipamentos</Label>
                  <Select defaultValue="disponivel">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Condição padrão</Label>
                  <Select defaultValue="bom">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excelente">Excelente</SelectItem>
                      <SelectItem value="bom">Bom</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowConfiguracoes(false)}>
              Cancelar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default EquipamentosNavigation;