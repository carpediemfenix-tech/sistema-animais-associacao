import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, 
  User, 
  ArrowLeft,
  Home,
  PawPrint,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  FileText,
  Settings,
  Stethoscope,
  Heart,
  Wifi,
  Plus,
  Edit,
  History,
  BarChart3,
  Database,
  Shield,
  Package,
  DollarSign,
  Bell,
  Archive
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import NotificationCenter from "./NotificationCenter";

interface NavigationButton {
  label: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

interface PageConfig {
  id: string; // Referência única da página
  title: string;
  navigationButtons: NavigationButton[];
}

const EnhancedHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Atualizar hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Verificar conexão com Supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('animais').select('id').limit(1);
        setIsConnected(!error);
      } catch {
        setIsConnected(false);
      }
    };

    checkConnection();
    const connectionTimer = setInterval(checkConnection, 30000); // Verificar a cada 30s

    return () => clearInterval(connectionTimer);
  }, []);

// Estados para notificações avançadas
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Carregar notificações avançadas
  const loadNotificacoes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notificacoes_avancadas_2025_12_16_12_00')
        .select(`
          *,
          tipos_notificacoes_2025_12_16_12_00(
            nome,
            icone,
            cor
          )
        `)
        .eq('arquivada', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotificacoes(data || []);
      const naoLidas = data?.filter(n => !n.lida && !n.arquivada).length || 0;
      setNotificacoesNaoLidas(naoLidas);
      setNotificationCount(naoLidas);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Funções para gerenciar notificações
  const handleMarcarNotificacaoLida = async (id: string) => {
    try {
      const { error } = await supabase
        .rpc('marcar_notificacao_lida_avancada', {
          p_notificacao_id: id,
          p_usuario_id: user?.id
        });
      
      if (error) throw error;
      
      await loadNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleMarcarTodasNotificacoesLidas = async () => {
    try {
      const notificacoesNaoLidas = notificacoes.filter(n => !n.lida && !n.arquivada);
      
      for (const notificacao of notificacoesNaoLidas) {
        await supabase
          .rpc('marcar_notificacao_lida_avancada', {
            p_notificacao_id: notificacao.id,
            p_usuario_id: user?.id
          });
      }
      
      await loadNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  // Carregar notificações
  useEffect(() => {
    loadNotificacoes();
    
    // Auto-refresh se ativado
    let refreshTimer: NodeJS.Timeout;
    if (autoRefresh) {
      refreshTimer = setInterval(loadNotificacoes, 2 * 60 * 1000); // 2 minutos
    }
    
    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [user, autoRefresh]);

  // Mapeamento completo de páginas com IDs únicos
  const pageConfigs: Record<string, PageConfig> = {
    // A## = Dashboard e Principais
    '/': {
      id: 'A01',
      title: 'Dashboard Principal',
      navigationButtons: [
        { label: 'Animais', path: '/animais', icon: <PawPrint className="h-4 w-4" />, description: 'Gestão de animais' },
        { label: 'Voluntários', path: '/voluntarios/gestao', icon: <Users className="h-4 w-4" />, description: 'Gestão de voluntários' },
        { label: 'Formação', path: '/modulo-formacao', icon: <GraduationCap className="h-4 w-4" />, description: 'Sistema de formação' },
        { label: 'Relatórios', path: '/relatorios', icon: <FileText className="h-4 w-4" />, description: 'Relatórios e análises' }
      ]
    },
    '/administracao': {
      id: 'A02',
      title: 'Painel de Administração',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Utilizadores', path: '/utilizadores', icon: <Users className="h-4 w-4" /> },
        { label: 'Configurações', path: '/configuracoes', icon: <Settings className="h-4 w-4" /> }
      ]
    },

    // B## = Módulo de Animais
    '/animais': {
      id: 'B01',
      title: 'Lista de Animais',
      navigationButtons: [
        { label: 'Voltar', path: '/modulo-animais', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Novo Animal', path: '/novo-animal', icon: <Plus className="h-4 w-4" /> },
        { label: 'Arquivados', path: '/animais-arquivados', icon: <Archive className="h-4 w-4" /> },
        { label: 'Adotados', path: '/animais-adotados', icon: <Heart className="h-4 w-4" /> }
      ]
    },
    '/modulo-animais': {
      id: 'B02',
      title: 'Módulo de Animais',
      navigationButtons: [
        // Navegação será gerida pelo próprio componente ModuloAnimais
      ]
    },
    '/animal/novo': {
      id: 'B03',
      title: 'Novo Animal',
      navigationButtons: [
        { label: 'Lista Animais', path: '/animais', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/animais-arquivados': {
      id: 'B04',
      title: 'Animais Arquivados',
      navigationButtons: [
        { label: 'Lista Animais', path: '/animais', icon: <PawPrint className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },

    // C## = Módulo de Voluntários
    '/voluntarios/gestao': {
      id: 'C01',
      title: 'Gestão de Voluntários',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Novo Voluntário', path: '/voluntario/novo', icon: <Plus className="h-4 w-4" /> },
        { label: 'Módulo Voluntários', path: '/modulo-voluntarios', icon: <Users className="h-4 w-4" /> },
        { label: 'Dashboard Voluntários', path: '/voluntarios/dashboard', icon: <BarChart3 className="h-4 w-4" /> }
      ]
    },
    '/modulo-voluntarios': {
      id: 'C02',
      title: 'Módulo de Voluntários',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Gestão Voluntários', path: '/voluntarios/gestao', icon: <Users className="h-4 w-4" /> },
        { label: 'Relatórios', path: '/voluntarios/relatorios', icon: <FileText className="h-4 w-4" /> }
      ]
    },
    '/voluntario/novo': {
      id: 'C03',
      title: 'Novo Voluntário',
      navigationButtons: [
        { label: 'Gestão Voluntários', path: '/voluntarios/gestao', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/voluntarios/dashboard': {
      id: 'C04',
      title: 'Dashboard de Voluntários',
      navigationButtons: [
        { label: 'Gestão Voluntários', path: '/voluntarios/gestao', icon: <Users className="h-4 w-4" /> },
        { label: 'Módulo Voluntários', path: '/modulo-voluntarios', icon: <Users className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/voluntarios/relatorios': {
      id: 'C05',
      title: 'Relatórios de Voluntários',
      navigationButtons: [
        { label: 'Módulo Voluntários', path: '/modulo-voluntarios', icon: <Users className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },

    // D## = Módulo de Formação
    '/modulo-formacao': {
      id: 'D01',
      title: 'Módulo de Formação',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Sistema Formação', path: '/sistema-formacao', icon: <GraduationCap className="h-4 w-4" /> },
        { label: 'Relatórios', path: '/voluntarios/relatorios', icon: <FileText className="h-4 w-4" /> }
      ]
    },
    '/sistema-formacao': {
      id: 'D02',
      title: 'Sistema de Formação',
      navigationButtons: [
        { label: 'Módulo Formação', path: '/modulo-formacao', icon: <GraduationCap className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },

    // E## = Módulo de Clínicas
    '/modulo-clinicas': {
      id: 'E01',
      title: 'Módulo de Clínicas',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Gestão Clínicas', path: '/configuracoes/clinicas', icon: <Building2 className="h-4 w-4" /> },
        { label: 'Intervenções', path: '/intervencoes', icon: <Stethoscope className="h-4 w-4" /> }
      ]
    },
    '/intervencoes': {
      id: 'E02',
      title: 'Intervenções Médicas',
      navigationButtons: [
        { label: 'Módulo Clínicas', path: '/modulo-clinicas', icon: <Building2 className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },

    // F## = Relatórios e Estatísticas
    '/relatorios': {
      id: 'F01',
      title: 'Relatórios e Análises',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Estatísticas', path: '/estatisticas-avancadas', icon: <BarChart3 className="h-4 w-4" /> }
      ]
    },
    '/estatisticas-avancadas': {
      id: 'F02',
      title: 'Estatísticas Avançadas',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Relatórios', path: '/relatorios', icon: <FileText className="h-4 w-4" /> }
      ]
    },

    // G## = Configurações
    '/configuracoes': {
      id: 'G01',
      title: 'Configurações do Sistema',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Espécies', path: '/configuracoes/especies', icon: <PawPrint className="h-4 w-4" /> },
        { label: 'Clínicas', path: '/configuracoes/clinicas', icon: <Building2 className="h-4 w-4" /> },
        { label: 'Responsabilidades', path: '/configuracoes/responsabilidades', icon: <Shield className="h-4 w-4" /> }
      ]
    },
    '/configuracoes/especies': {
      id: 'G02',
      title: 'Gestão de Espécies',
      navigationButtons: [
        { label: 'Configurações', path: '/configuracoes', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/configuracoes/localizacoes': {
      id: 'G03',
      title: 'Gestão de Localizações',
      navigationButtons: [
        { label: 'Configurações', path: '/configuracoes', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/configuracoes/categorias': {
      id: 'G04',
      title: 'Gestão de Categorias',
      navigationButtons: [
        { label: 'Configurações', path: '/configuracoes', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/configuracoes/clinicas': {
      id: 'G05',
      title: 'Gestão de Clínicas',
      navigationButtons: [
        { label: 'Configurações', path: '/configuracoes', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Módulo Clínicas', path: '/modulo-clinicas', icon: <Building2 className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/configuracoes/responsabilidades': {
      id: 'G06',
      title: 'Gestão de Responsabilidades',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Configurações', path: '/configuracoes', icon: <Settings className="h-4 w-4" /> }
      ]
    },

    // H## = Histórico e Logs
    '/historico-nomes': {
      id: 'H01',
      title: 'Histórico de Nomes dos Animais',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Módulo Animais', path: '/modulo-animais', icon: <PawPrint className="h-4 w-4" /> },
        { label: 'Lista Animais', path: '/animais', icon: <PawPrint className="h-4 w-4" /> }
      ]
    },

    // I## = Gestão de Utilizadores
    '/utilizadores': {
      id: 'I01',
      title: 'Gestão de Utilizadores',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Administração', path: '/administracao', icon: <Shield className="h-4 w-4" /> }
      ]
    },
    '/grupos': {
      id: 'I02',
      title: 'Gestão de Grupos',
      navigationButtons: [
        { label: 'Módulo Animais', path: '/modulo-animais', icon: <PawPrint className="h-4 w-4" /> },
        { label: 'Novo Grupo', path: '/grupo/novo', icon: <Plus className="h-4 w-4" /> },
        { label: 'Arquivados', path: '/grupos-arquivados', icon: <Archive className="h-4 w-4" /> },
        { label: 'Dashboard Principal', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/grupos-arquivados': {
      id: 'I03',
      title: 'Grupos Arquivados',
      navigationButtons: [
        { label: 'Voltar', path: '/grupos', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Módulo Animais', path: '/modulo-animais', icon: <PawPrint className="h-4 w-4" /> }
      ]
    },

    // J## = Módulos Especiais
    '/modulo-agenda': {
      id: 'J01',
      title: 'Módulo Agenda e Calendário',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Novo Evento', path: '/modulo-agenda', icon: <Plus className="h-4 w-4" /> }
      ]
    },
    '/modulo-missoes': {
      id: 'J02',
      title: 'Módulo Missões e Tarefas',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Nova Missão', path: '/modulo-missoes', icon: <Plus className="h-4 w-4" /> }
      ]
    },
    '/equipamentos': {
      id: 'J03',
      title: 'Módulo Equipamentos',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Navegação', path: '/equipamentos', icon: <Package className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/equipamentos/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
        { label: 'Inventário', path: '/equipamentos/inventario', icon: <Package className="h-4 w-4" /> }
      ]
    },
    '/equipamentos/dashboard': {
      id: 'J03-1',
      title: 'Dashboard Equipamentos',
      navigationButtons: [
        { label: 'Voltar', path: '/equipamentos', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Inventário', path: '/equipamentos/inventario', icon: <Package className="h-4 w-4" /> },
        { label: 'Atribuições', path: '/equipamentos/atribuicoes', icon: <Users className="h-4 w-4" /> }
      ]
    },
    '/equipamentos/inventario': {
      id: 'J03-2',
      title: 'Inventário de Equipamentos',
      navigationButtons: [
        { label: 'Voltar', path: '/equipamentos', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/equipamentos/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
        { label: 'Novo', path: '/equipamentos/inventario', icon: <Plus className="h-4 w-4" /> }
      ]
    },
    '/equipamentos/atribuicoes': {
      id: 'J03-3',
      title: 'Atribuições de Equipamentos',
      navigationButtons: [
        { label: 'Voltar', path: '/equipamentos', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/equipamentos/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
        { label: 'Nova', path: '/equipamentos/atribuicoes', icon: <Plus className="h-4 w-4" /> }
      ]
    },
    '/equipamentos/manutencoes': {
      id: 'J03-4',
      title: 'Manutenções de Equipamentos',
      navigationButtons: [
        { label: 'Voltar', path: '/equipamentos', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/equipamentos/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
        { label: 'Agendar', path: '/equipamentos/manutencoes', icon: <Plus className="h-4 w-4" /> }
      ]
    },
    '/equipamentos/alertas': {
      id: 'J03-5',
      title: 'Alertas de Equipamentos',
      navigationButtons: [
        { label: 'Voltar', path: '/equipamentos', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/equipamentos/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
        { label: 'Configurar', path: '/equipamentos/alertas', icon: <Settings className="h-4 w-4" /> }
      ]
    },
    '/equipamentos/relatorios': {
      id: 'J03-6',
      title: 'Relatórios de Equipamentos',
      navigationButtons: [
        { label: 'Voltar', path: '/equipamentos', icon: <ArrowLeft className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/equipamentos/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
        { label: 'Exportar', path: '/equipamentos/relatorios', icon: <FileText className="h-4 w-4" /> }
      ]
    },

    // K## = Sistema Financeiro
    '/financeiro': {
      id: 'K01',
      title: 'Dashboard Financeiro',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
        { label: 'Novo Movimento', path: '/financeiro/movimentos/novo', icon: <Plus className="h-4 w-4" /> },
        { label: 'Ver Movimentos', path: '/financeiro/movimentos', icon: <FileText className="h-4 w-4" /> }
      ]
    },
    '/financeiro/movimentos': {
      id: 'K02',
      title: 'Gestão de Movimentos Financeiros',
      navigationButtons: [
        { label: 'Dashboard Financeiro', path: '/financeiro', icon: <DollarSign className="h-4 w-4" /> },
        { label: 'Novo Movimento', path: '/financeiro/movimentos/novo', icon: <Plus className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/financeiro/movimentos/novo': {
      id: 'K03',
      title: 'Novo Movimento Financeiro',
      navigationButtons: [
        { label: 'Ver Movimentos', path: '/financeiro/movimentos', icon: <FileText className="h-4 w-4" /> },
        { label: 'Dashboard Financeiro', path: '/financeiro', icon: <DollarSign className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/financeiro/contas': {
      id: 'K04',
      title: 'Gestão de Contas Financeiras',
      navigationButtons: [
        { label: 'Dashboard Financeiro', path: '/financeiro', icon: <DollarSign className="h-4 w-4" /> },
        { label: 'Movimentos', path: '/financeiro/movimentos', icon: <FileText className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/financeiro/configuracoes': {
      id: 'K05',
      title: 'Configurações Financeiras',
      navigationButtons: [
        { label: 'Dashboard Financeiro', path: '/financeiro', icon: <DollarSign className="h-4 w-4" /> },
        { label: 'Movimentos', path: '/financeiro/movimentos', icon: <FileText className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    },
    '/financeiro/relatorios': {
      id: 'K06',
      title: 'Relatórios Financeiros',
      navigationButtons: [
        { label: 'Dashboard Financeiro', path: '/financeiro', icon: <DollarSign className="h-4 w-4" /> },
        { label: 'Movimentos', path: '/financeiro/movimentos', icon: <FileText className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    }
  };

  // Detectar configuração da página atual
  const getCurrentPageConfig = (): PageConfig => {
    const path = location.pathname;
    
    // Verificar rotas específicas primeiro
    if (pageConfigs[path]) {
      return pageConfigs[path];
    }
    
    // Verificar rotas dinâmicas com IDs únicos
    if (path.startsWith('/animal/') && path.includes('/intervencoes')) {
      return {
        id: 'B10', // ID único para intervenções de animal específico
        title: 'Intervenções do Animal',
        navigationButtons: [
          { label: 'Voltar ao Animal', path: path.replace('/intervencoes', ''), icon: <ArrowLeft className="h-4 w-4" /> },
          { label: 'Lista Animais', path: '/animais', icon: <PawPrint className="h-4 w-4" /> },
          { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
        ]
      };
    }
    
    if (path.startsWith('/animal/') && path.includes('/responsabilidades')) {
      return {
        id: 'B11', // ID único para responsabilidades de animal específico
        title: 'Responsabilidades do Animal',
        navigationButtons: [
          { label: 'Voltar ao Animal', path: path.replace('/responsabilidades', ''), icon: <ArrowLeft className="h-4 w-4" /> },
          { label: 'Lista Animais', path: '/animais', icon: <PawPrint className="h-4 w-4" /> },
          { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
        ]
      };
    }
    
    if (path.startsWith('/animal/') && path.includes('/historico-nomes')) {
      return {
        id: 'B12', // ID único para histórico de nomes de animal específico
        title: 'Histórico de Nomes do Animal',
        navigationButtons: [
          { label: 'Voltar ao Animal', path: path.replace('/historico-nomes', ''), icon: <ArrowLeft className="h-4 w-4" /> },
          { label: 'Histórico Geral', path: '/historico-nomes', icon: <History className="h-4 w-4" /> },
          { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
        ]
      };
    }
    
    if (path.startsWith('/animal/') && path.includes('/editar')) {
      return {
        id: 'B13', // ID único para edição de animal específico
        title: 'Editar Animal',
        navigationButtons: [
          { label: 'Voltar ao Animal', path: path.replace('/editar', ''), icon: <ArrowLeft className="h-4 w-4" /> },
          { label: 'Lista Animais', path: '/animais', icon: <PawPrint className="h-4 w-4" /> },
          { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
        ]
      };
    }
    
    if (path.startsWith('/animal/') && !path.includes('/novo')) {
      return {
        id: 'B05', // ID único para ficha completa do animal
        title: 'Ficha Completa do Animal',
        navigationButtons: [
          { label: 'Lista Animais', path: '/animais', icon: <PawPrint className="h-4 w-4" /> },
          { label: 'Editar Animal', path: `${path}/editar`, icon: <Edit className="h-4 w-4" /> },
          { label: 'Histórico Nomes', path: `/animal/${path.split('/')[2]}/historico-nomes`, icon: <History className="h-4 w-4" /> },
          { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
        ]
      };
    }
    
    if (path.startsWith('/voluntarios/perfil/')) {
      return {
        id: 'C10', // ID único para perfil de voluntário específico
        title: 'Perfil Completo do Voluntário',
        navigationButtons: [
          { label: 'Lista Voluntários', path: '/voluntarios/gestao', icon: <Users className="h-4 w-4" /> },
          { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
        ]
      };
    }
    
    if (path.startsWith('/voluntario/') && path.includes('/formacoes')) {
      return {
        id: 'C11', // ID único para formações de voluntário específico
        title: 'Formações do Voluntário',
        navigationButtons: [
          { label: 'Voltar ao Voluntário', path: path.replace('/formacoes', ''), icon: <ArrowLeft className="h-4 w-4" /> },
          { label: 'Lista Voluntários', path: '/voluntarios/gestao', icon: <Users className="h-4 w-4" /> },
          { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
        ]
      };
    }
    
    // Página padrão para rotas não mapeadas
    return {
      id: 'X00', // ID para páginas não identificadas
      title: 'Sistema de Gestão Animal',
      navigationButtons: [
        { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> }
      ]
    };
  };

  const currentPage = getCurrentPageConfig();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('pt-PT', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('pt-PT', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    };
  };

  const { date, time } = formatDateTime(currentTime);

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* Cabeçalho Principal */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado Esquerdo - Logo e Títulos */}
          <div className="flex items-center space-x-4">
            <img 
              src="/images/BackgroundEraser_20250411_205630024.png" 
              alt="Valentão ao Resgate" 
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-gray-900">Valentão Operacional</h1>
                <span className="text-gray-400">|</span>
                <h2 className="text-sm font-medium text-gray-600">Sistema de Gestão Animal</h2>
                <span className="text-gray-400">|</span>
                <h3 className="text-sm text-gray-500">{currentPage.title}</h3>
              </div>
            </div>
          </div>

          {/* Centro - Referência da Página, Data/Hora e Status */}
          <div className="hidden md:flex items-center space-x-6">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono">
              Pag. {currentPage.id}
            </Badge>
            
            <div className="text-center">
              <div className="text-xs font-medium text-gray-900">{date}</div>
              <div className="text-xs text-gray-500 font-mono">{time}</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>

          {/* Lado Direito - Usuário e Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900">{user?.email}</div>
              <div className="text-xs text-gray-500">Administrador</div>
            </div>
            
{/* Botão de Notificações Avançadas */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotificacoes(true)}
              className="relative flex items-center space-x-2 hover:bg-blue-50 hover:text-blue-600"
            >
              <Bell className="h-4 w-4" />
              {notificacoesNaoLidas > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  {notificacoesNaoLidas > 99 ? '99+' : notificacoesNaoLidas}
                </Badge>
              )}
              <span className="hidden sm:inline">Notificações</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600"
            >
              <User className="h-4 w-4" />
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Barra de Navegação Contextual */}
      {currentPage.navigationButtons.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-3 overflow-x-auto">
            {currentPage.navigationButtons.map((button, index) => (
              <Link key={index} to={button.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 whitespace-nowrap hover:bg-white hover:shadow-sm transition-all duration-200"
                  title={button.description}
                >
                  {button.icon}
                  <span className="text-xs">{button.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Centro de Notificações */}
      <NotificationCenter
        isOpen={showNotificacoes}
        onClose={() => setShowNotificacoes(false)}
        notificacoes={notificacoes}
        onMarcarLida={handleMarcarNotificacaoLida}
        onMarcarTodasLidas={handleMarcarTodasNotificacoesLidas}
        onRefresh={loadNotificacoes}
      />
    </div>
  );
};
    
    export default EnhancedHeader;