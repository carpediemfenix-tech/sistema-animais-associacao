import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Bell,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  AlertTriangle,
  Info,
  Zap,
  Save,
  RotateCcw,
  ArrowLeft,
  Smartphone,
  Mail,
  MessageSquare,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";

interface ConfiguracaoNotificacao {
  id?: string;
  username: string;
  categoria: string;
  ativo: boolean;
  som_ativo: boolean;
  prioridade_minima: string;
  frequencia_email: string;
  horario_silencioso_inicio?: string;
  horario_silencioso_fim?: string;
  dias_semana_ativo: string[];
  created_at?: string;
  updated_at?: string;
}

const ConfiguracoesNotificacoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoNotificacao[]>([]);

  // Configurações padrão por categoria
  const categoriasDisponiveis = [
    { id: 'animais', nome: 'Animais', descricao: 'Notificações sobre animais, resgates e adoções', icone: '🐕' },
    { id: 'saude', nome: 'Saúde', descricao: 'Intervenções veterinárias e cuidados médicos', icone: '🏥' },
    { id: 'sistema', nome: 'Sistema', descricao: 'Atualizações e manutenções do sistema', icone: '⚙️' },
    { id: 'seguranca', nome: 'Segurança', descricao: 'Alertas de segurança e acesso', icone: '🔒' },
    { id: 'financeiro', nome: 'Financeiro', descricao: 'Movimentos financeiros e despesas', icone: '💰' },
    { id: 'missoes', nome: 'Missões', descricao: 'Operações de resgate e missões', icone: '🎯' },
    { id: 'voluntarios', nome: 'Voluntários', descricao: 'Gestão de voluntários e formações', icone: '👥' }
  ];

  const prioridadesDisponiveis = [
    { id: 'baixa', nome: 'Baixa', cor: 'text-blue-600' },
    { id: 'media', nome: 'Média', cor: 'text-yellow-600' },
    { id: 'alta', nome: 'Alta', cor: 'text-orange-600' },
    { id: 'critica', nome: 'Crítica', cor: 'text-red-600' },
    { id: 'urgente', nome: 'Urgente', cor: 'text-red-700' }
  ];

  const frequenciasEmail = [
    { id: 'imediato', nome: 'Imediato' },
    { id: 'diario', nome: 'Resumo Diário' },
    { id: 'semanal', nome: 'Resumo Semanal' },
    { id: 'nunca', nome: 'Nunca' }
  ];

  const diasSemana = [
    { id: 'segunda', nome: 'Seg' },
    { id: 'terca', nome: 'Ter' },
    { id: 'quarta', nome: 'Qua' },
    { id: 'quinta', nome: 'Qui' },
    { id: 'sexta', nome: 'Sex' },
    { id: 'sabado', nome: 'Sáb' },
    { id: 'domingo', nome: 'Dom' }
  ];

  useEffect(() => {
    carregarConfiguracoes();
  }, [user]);

  const carregarConfiguracoes = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Usar a nova tabela compatível com sistema de autenticação personalizado
      const { data, error } = await supabase
        .from('configuracoes_notificacoes_username_2026_01_02_05_00')
        .select('*')
        .eq('username', user.username);

      if (error) throw error;

      // Se não há configurações, criar padrões
      if (!data || data.length === 0) {
        const configsPadrao = categoriasDisponiveis.map(categoria => ({
          username: user.username,
          categoria: categoria.id,
          ativo: true,
          som_ativo: true,
          prioridade_minima: 'media',
          frequencia_email: 'diario',
          horario_silencioso_inicio: '22:00',
          horario_silencioso_fim: '08:00',
          dias_semana_ativo: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
        }));

        setConfiguracoes(configsPadrao);
      } else {
        setConfiguracoes(data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao carregar configurações de notificações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Deletar configurações existentes
      await supabase
        .from('configuracoes_notificacoes_username_2026_01_02_05_00')
        .delete()
        .eq('username', user.username);

      // Inserir novas configurações
      const { error } = await supabase
        .from('configuracoes_notificacoes_username_2026_01_02_05_00')
        .insert(configuracoes.map(config => ({
          username: user.username,
          categoria: config.categoria,
          ativo: config.ativo,
          som_ativo: config.som_ativo,
          prioridade_minima: config.prioridade_minima,
          frequencia_email: config.frequencia_email,
          horario_silencioso_inicio: config.horario_silencioso_inicio,
          horario_silencioso_fim: config.horario_silencioso_fim,
          dias_semana_ativo: config.dias_semana_ativo,
          updated_at: new Date().toISOString()
        })));

      if (error) throw error;

      toast({
        title: "✅ Configurações Salvas",
        description: "As configurações de notificações foram salvas com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar configurações de notificações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const atualizarConfiguracao = (categoria: string, campo: string, valor: any) => {
    setConfiguracoes(prev => prev.map(config => 
      config.categoria === categoria 
        ? { ...config, [campo]: valor }
        : config
    ));
  };

  const toggleDiaSemana = (categoria: string, dia: string) => {
    setConfiguracoes(prev => prev.map(config => {
      if (config.categoria === categoria) {
        const diasAtivos = config.dias_semana_ativo || [];
        const novosDias = diasAtivos.includes(dia)
          ? diasAtivos.filter(d => d !== dia)
          : [...diasAtivos, dia];
        return { ...config, dias_semana_ativo: novosDias };
      }
      return config;
    }));
  };

  const restaurarPadroes = () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações padrão? Todas as personalizações serão perdidas.')) {
      const configsPadrao = categoriasDisponiveis.map(categoria => ({
        username: user?.username || '',
        categoria: categoria.id,
        ativo: true,
        som_ativo: true,
        prioridade_minima: 'media',
        frequencia_email: 'diario',
        horario_silencioso_inicio: '22:00',
        horario_silencioso_fim: '08:00',
        dias_semana_ativo: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
      }));

      setConfiguracoes(configsPadrao);
      
      toast({
        title: "🔄 Configurações Restauradas",
        description: "As configurações padrão foram restauradas",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <PageActionBar
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Configurações de Notificações' }
        ]}
        primaryActions={
          <div className="flex gap-2">
            <Button 
              onClick={salvarConfiguracoes}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
            <Button 
              onClick={restaurarPadroes}
              variant="outline"
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            Configurações de Notificações
          </h1>
          <p className="text-gray-600">Personalize como e quando receber notificações do sistema</p>
        </div>

        {/* Configurações Globais */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Configurações Globais
            </CardTitle>
            <CardDescription>
              Configurações que se aplicam a todas as categorias de notificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Som das Notificações</Label>
                    <p className="text-sm text-gray-500">Reproduzir som ao receber notificações</p>
                  </div>
                  <Switch
                    checked={configuracoes.every(c => c.som_ativo)}
                    onCheckedChange={(checked) => {
                      setConfiguracoes(prev => prev.map(config => ({ ...config, som_ativo: checked })));
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notificações Ativas</Label>
                    <p className="text-sm text-gray-500">Receber notificações do sistema</p>
                  </div>
                  <Switch
                    checked={configuracoes.every(c => c.ativo)}
                    onCheckedChange={(checked) => {
                      setConfiguracoes(prev => prev.map(config => ({ ...config, ativo: checked })));
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-2 block">Horário Silencioso</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={configuracoes[0]?.horario_silencioso_inicio || '22:00'}
                      onChange={(e) => {
                        setConfiguracoes(prev => prev.map(config => ({ 
                          ...config, 
                          horario_silencioso_inicio: e.target.value 
                        })));
                      }}
                      className="w-24"
                    />
                    <span className="text-gray-500">até</span>
                    <Input
                      type="time"
                      value={configuracoes[0]?.horario_silencioso_fim || '08:00'}
                      onChange={(e) => {
                        setConfiguracoes(prev => prev.map(config => ({ 
                          ...config, 
                          horario_silencioso_fim: e.target.value 
                        })));
                      }}
                      className="w-24"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Período sem notificações sonoras</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações por Categoria */}
        <div className="space-y-6">
          {categoriasDisponiveis.map((categoria) => {
            const config = configuracoes.find(c => c.categoria === categoria.id) || {
              username: user?.username || '',
              categoria: categoria.id,
              ativo: true,
              som_ativo: true,
              prioridade_minima: 'media',
              frequencia_email: 'diario',
              horario_silencioso_inicio: '22:00',
              horario_silencioso_fim: '08:00',
              dias_semana_ativo: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
            };

            return (
              <Card key={categoria.id} className={`${config.ativo ? 'ring-2 ring-blue-200' : 'opacity-75'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{categoria.icone}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{categoria.nome}</h3>
                        <p className="text-sm text-gray-500 font-normal">{categoria.descricao}</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.ativo}
                      onCheckedChange={(checked) => atualizarConfiguracao(categoria.id, 'ativo', checked)}
                    />
                  </CardTitle>
                </CardHeader>
                
                {config.ativo && (
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Prioridade Mínima */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Prioridade Mínima</Label>
                        <Select
                          value={config.prioridade_minima}
                          onValueChange={(value) => atualizarConfiguracao(categoria.id, 'prioridade_minima', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {prioridadesDisponiveis.map((prioridade) => (
                              <SelectItem key={prioridade.id} value={prioridade.id}>
                                <span className={prioridade.cor}>{prioridade.nome}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Frequência de Email */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Frequência de Email</Label>
                        <Select
                          value={config.frequencia_email}
                          onValueChange={(value) => atualizarConfiguracao(categoria.id, 'frequencia_email', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequenciasEmail.map((freq) => (
                              <SelectItem key={freq.id} value={freq.id}>
                                {freq.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Som Ativo */}
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Som</Label>
                          <p className="text-xs text-gray-500">Reproduzir som</p>
                        </div>
                        <Switch
                          checked={config.som_ativo}
                          onCheckedChange={(checked) => atualizarConfiguracao(categoria.id, 'som_ativo', checked)}
                        />
                      </div>
                    </div>

                    {/* Dias da Semana */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Dias Ativos</Label>
                      <div className="flex flex-wrap gap-2">
                        {diasSemana.map((dia) => (
                          <Button
                            key={dia.id}
                            variant={config.dias_semana_ativo?.includes(dia.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleDiaSemana(categoria.id, dia.id)}
                            className="w-12 h-8"
                          >
                            {dia.nome}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Informações Adicionais */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• As configurações são aplicadas imediatamente após salvar</p>
              <p>• O horário silencioso aplica-se apenas às notificações sonoras</p>
              <p>• Notificações críticas e urgentes podem ignorar algumas configurações</p>
              <p>• Os resumos por email são enviados automaticamente conforme a frequência definida</p>
              <p>• Desativar uma categoria impede todas as notificações dessa categoria</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default ConfiguracoesNotificacoes;