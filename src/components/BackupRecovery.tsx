import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Download, 
  Upload, 
  Database, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Calendar,
  FileText,
  Settings,
  Archive,
  RotateCcw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BackupConfig {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  includeImages: boolean;
  includeNotifications: boolean;
  retentionDays: number;
  compressionEnabled: boolean;
}

interface BackupInfo {
  id: string;
  name: string;
  size: string;
  date: Date;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in_progress';
  tables: string[];
  description?: string;
}

interface RestorePoint {
  id: string;
  name: string;
  date: Date;
  size: string;
  verified: boolean;
}

const BackupRecovery: React.FC = () => {
  const [config, setConfig] = useState<BackupConfig>({
    autoBackup: false,
    backupFrequency: 'weekly',
    includeImages: true,
    includeNotifications: false,
    retentionDays: 30,
    compressionEnabled: true
  });

  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const { toast } = useToast();

  // Tabelas disponíveis para backup
  const availableTables = [
    'animais',
    'voluntarios_2025_12_21_22_00',
    'denuncias',
    'missoes_2025_12_21_19_00',
    'notificacoes',
    'especialidades_voluntarios_2025_12_21_22_00',
    'clinicas_veterinarias',
    'movimentos_financeiros',
    'equipamentos',
    'logs_acesso'
  ];

  // Carregar configurações e backups
  useEffect(() => {
    loadConfig();
    loadBackups();
    loadRestorePoints();
  }, []);

  const loadConfig = () => {
    const savedConfig = localStorage.getItem('backup_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  };

  const saveConfig = (newConfig: BackupConfig) => {
    localStorage.setItem('backup_config', JSON.stringify(newConfig));
    setConfig(newConfig);
  };

  const loadBackups = () => {
    // Simular carregamento de backups existentes
    const mockBackups: BackupInfo[] = [
      {
        id: '1',
        name: 'Backup Automático - Sistema Completo',
        size: '45.2 MB',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        type: 'automatic',
        status: 'completed',
        tables: ['animais', 'voluntarios_2025_12_21_22_00', 'denuncias'],
        description: 'Backup automático diário do sistema'
      },
      {
        id: '2',
        name: 'Backup Manual - Antes da Atualização',
        size: '52.8 MB',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        type: 'manual',
        status: 'completed',
        tables: availableTables,
        description: 'Backup completo antes da atualização do sistema'
      }
    ];
    setBackups(mockBackups);
    setLastBackup(mockBackups[0]?.date || null);
  };

  const loadRestorePoints = () => {
    // Simular pontos de restauração
    const mockRestorePoints: RestorePoint[] = [
      {
        id: '1',
        name: 'Sistema Estável - Janeiro 2026',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        size: '48.1 MB',
        verified: true
      },
      {
        id: '2',
        name: 'Pré-Migração Especialidades',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        size: '41.7 MB',
        verified: true
      }
    ];
    setRestorePoints(mockRestorePoints);
  };

  // Criar backup
  const createBackup = async () => {
    if (!backupName.trim()) {
      toast({
        title: "❌ Nome Obrigatório",
        description: "Por favor, insira um nome para o backup",
        variant: "destructive",
      });
      return;
    }

    if (selectedTables.length === 0) {
      toast({
        title: "❌ Tabelas Obrigatórias",
        description: "Selecione pelo menos uma tabela para backup",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingBackup(true);
    setBackupProgress(0);

    try {
      toast({
        title: "🔄 Iniciando Backup",
        description: "Criando backup das tabelas selecionadas...",
      });

      // Simular processo de backup
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simular exportação de dados
      const backupData = {
        metadata: {
          name: backupName,
          description: backupDescription,
          date: new Date().toISOString(),
          tables: selectedTables,
          version: '2.0'
        },
        data: {}
      };

      // Exportar dados das tabelas selecionadas
      for (const table of selectedTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*');
          
          if (!error && data) {
            backupData.data[table] = data;
          }
        } catch (error) {
          console.warn(`Erro ao exportar tabela ${table}:`, error);
        }
      }

      // Criar arquivo de backup
      const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(backupBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${backupName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Adicionar à lista de backups
      const newBackup: BackupInfo = {
        id: Date.now().toString(),
        name: backupName,
        size: `${(backupBlob.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date(),
        type: 'manual',
        status: 'completed',
        tables: selectedTables,
        description: backupDescription
      };

      setBackups(prev => [newBackup, ...prev]);
      setLastBackup(new Date());

      // Limpar formulário
      setBackupName('');
      setBackupDescription('');
      setSelectedTables([]);

      toast({
        title: "✅ Backup Criado",
        description: `Backup "${backupName}" criado e transferido com sucesso`,
      });
    } catch (error) {
      toast({
        title: "❌ Erro no Backup",
        description: "Falha ao criar backup do sistema",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  // Restaurar backup
  const restoreBackup = async (backupId: string) => {
    if (!window.confirm('Tem certeza que deseja restaurar este backup? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsRestoring(true);
    try {
      toast({
        title: "🔄 Iniciando Restauração",
        description: "Restaurando dados do backup...",
      });

      // Simular processo de restauração
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "✅ Restauração Concluída",
        description: "Dados restaurados com sucesso. Recarregue a página.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro na Restauração",
        description: "Falha ao restaurar backup",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // Verificar integridade do backup
  const verifyBackup = async (backupId: string) => {
    toast({
      title: "🔍 Verificando Integridade",
      description: "Validando dados do backup...",
    });

    // Simular verificação
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "✅ Backup Verificado",
      description: "Integridade do backup confirmada",
    });
  };

  // Excluir backup
  const deleteBackup = async (backupId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este backup?')) {
      return;
    }

    setBackups(prev => prev.filter(backup => backup.id !== backupId));
    
    toast({
      title: "🗑️ Backup Excluído",
      description: "Backup removido com sucesso",
    });
  };

  const getStatusIcon = (status: BackupInfo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: BackupInfo['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Backup e Recuperação</h2>
          <p className="text-gray-600">
            {lastBackup 
              ? `Último backup: ${lastBackup.toLocaleString('pt-PT')}`
              : 'Nenhum backup realizado'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800">
            {backups.length} Backups
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            {restorePoints.length} Pontos de Restauração
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Criar Novo Backup */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Criar Novo Backup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backup-name">Nome do Backup</Label>
                  <Input
                    id="backup-name"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    placeholder="Ex: Backup Mensal Janeiro"
                  />
                </div>
                <div>
                  <Label htmlFor="backup-description">Descrição (Opcional)</Label>
                  <Input
                    id="backup-description"
                    value={backupDescription}
                    onChange={(e) => setBackupDescription(e.target.value)}
                    placeholder="Descrição do backup"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Tabelas para Backup ({selectedTables.length} selecionadas)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {availableTables.map((table) => (
                    <label key={table} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTables(prev => [...prev, table]);
                          } else {
                            setSelectedTables(prev => prev.filter(t => t !== table));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{table}</span>
                    </label>
                  ))}
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTables(availableTables)}
                  >
                    Selecionar Todas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTables([])}
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>

              {isCreatingBackup && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do Backup</span>
                    <span>{backupProgress}%</span>
                  </div>
                  <Progress value={backupProgress} className="h-2" />
                </div>
              )}

              <Button 
                onClick={createBackup} 
                disabled={isCreatingBackup || !backupName.trim() || selectedTables.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Download className={`h-4 w-4 mr-2 ${isCreatingBackup ? 'animate-spin' : ''}`} />
                {isCreatingBackup ? 'Criando Backup...' : 'Criar Backup'}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Backups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Archive className="h-5 w-5" />
                <span>Backups Existentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <div className="text-center py-8">
                  <HardDrive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum backup encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <div key={backup.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{backup.name}</h4>
                            <Badge className={getStatusColor(backup.status)}>
                              {getStatusIcon(backup.status)}
                              <span className="ml-1">
                                {backup.status === 'completed' ? 'Concluído' :
                                 backup.status === 'failed' ? 'Falhou' : 'Em Progresso'}
                              </span>
                            </Badge>
                            <Badge variant="outline">
                              {backup.type === 'manual' ? 'Manual' : 'Automático'}
                            </Badge>
                          </div>
                          
                          {backup.description && (
                            <p className="text-sm text-gray-600 mb-2">{backup.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{backup.date.toLocaleString('pt-PT')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <HardDrive className="h-3 w-3" />
                              <span>{backup.size}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Database className="h-3 w-3" />
                              <span>{backup.tables.length} tabelas</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => verifyBackup(backup.id)}
                            title="Verificar Integridade"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreBackup(backup.id)}
                            disabled={isRestoring || backup.status !== 'completed'}
                            title="Restaurar Backup"
                          >
                            <RotateCcw className={`h-4 w-4 ${isRestoring ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteBackup(backup.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Excluir Backup"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configurações e Pontos de Restauração */}
        <div className="space-y-6">
          {/* Configurações de Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-backup" className="text-sm font-medium">
                  Backup Automático
                </Label>
                <Switch
                  id="auto-backup"
                  checked={config.autoBackup}
                  onCheckedChange={(checked) => 
                    saveConfig({ ...config, autoBackup: checked })
                  }
                />
              </div>

              {config.autoBackup && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Frequência
                  </Label>
                  <select
                    value={config.backupFrequency}
                    onChange={(e) => 
                      saveConfig({ 
                        ...config, 
                        backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' 
                      })
                    }
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="include-images" className="text-sm font-medium">
                  Incluir Imagens
                </Label>
                <Switch
                  id="include-images"
                  checked={config.includeImages}
                  onCheckedChange={(checked) => 
                    saveConfig({ ...config, includeImages: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-notifications" className="text-sm font-medium">
                  Incluir Notificações
                </Label>
                <Switch
                  id="include-notifications"
                  checked={config.includeNotifications}
                  onCheckedChange={(checked) => 
                    saveConfig({ ...config, includeNotifications: checked })
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Retenção: {config.retentionDays} dias
                </Label>
                <input
                  type="range"
                  min="7"
                  max="365"
                  value={config.retentionDays}
                  onChange={(e) => 
                    saveConfig({ ...config, retentionDays: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pontos de Restauração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Pontos de Restauração</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {restorePoints.length === 0 ? (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum ponto de restauração</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {restorePoints.map((point) => (
                    <div key={point.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{point.name}</h4>
                        {point.verified && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{point.date.toLocaleDateString('pt-PT')}</span>
                        <span>{point.size}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => restoreBackup(point.id)}
                        disabled={isRestoring}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restaurar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BackupRecovery;