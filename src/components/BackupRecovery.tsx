import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  Archive,
  Clock,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  Cloud,
  FileText,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BackupRecord {
  id: string;
  name: string;
  description: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'creating' | 'completed' | 'failed' | 'restoring';
  size: number;
  tables: string[];
  createdAt: string;
  createdBy: string;
  progress: number;
  error?: string;
}

interface RestorePoint {
  id: string;
  timestamp: string;
  description: string;
  tables: string[];
  recordCount: number;
}

const BackupRecovery: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [createBackupDialog, setCreateBackupDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const { toast } = useToast();

  const [newBackup, setNewBackup] = useState({
    name: '',
    description: '',
    type: 'full' as 'full' | 'incremental' | 'differential',
    tables: [] as string[]
  });

  const availableTables = [
    'animais',
    'voluntarios',
    'intervencoes',
    'eventos',
    'localizacoes',
    'responsabilidades',
    'notificacoes',
    'denuncias_2025_12_29_23_00',
    'especialidades_voluntarios_2025_12_21_22_00',
    'voluntario_especialidades_2025_12_21_22_00',
    'clinicas_veterinarias',
    'especies',
    'grupos',
    'user_access_logs'
  ];

  useEffect(() => {
    loadBackups();
    loadRestorePoints();
  }, []);

  const loadBackups = async () => {
    try {
      // Simular carregamento de backups
      const mockBackups: BackupRecord[] = [
        {
          id: '1',
          name: 'Backup Completo - Janeiro 2026',
          description: 'Backup completo de todas as tabelas do sistema',
          type: 'full',
          status: 'completed',
          size: 15728640, // 15MB
          tables: availableTables,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin',
          progress: 100
        },
        {
          id: '2',
          name: 'Backup Incremental - Hoje',
          description: 'Backup incremental das alterações de hoje',
          type: 'incremental',
          status: 'completed',
          size: 2097152, // 2MB
          tables: ['animais', 'intervencoes', 'notificacoes'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin',
          progress: 100
        }
      ];

      setBackups(mockBackups);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    }
  };

  const loadRestorePoints = async () => {
    try {
      // Simular pontos de restauro
      const mockRestorePoints: RestorePoint[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          description: 'Antes da atualização do sistema',
          tables: availableTables,
          recordCount: 15420
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          description: 'Backup diário automático',
          tables: availableTables,
          recordCount: 15380
        }
      ];

      setRestorePoints(mockRestorePoints);
    } catch (error) {
      console.error('Erro ao carregar pontos de restauro:', error);
    }
  };

  const createBackup = async () => {
    if (!newBackup.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para o backup",
        variant: "destructive",
      });
      return;
    }

    const backupId = Date.now().toString();
    const backup: BackupRecord = {
      id: backupId,
      name: newBackup.name,
      description: newBackup.description,
      type: newBackup.type,
      status: 'creating',
      size: 0,
      tables: newBackup.tables.length > 0 ? newBackup.tables : availableTables,
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      progress: 0
    };

    setBackups(prev => [backup, ...prev]);
    setCreateBackupDialog(false);

    // Simular processo de backup
    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setBackups(prev => prev.map(b => 
          b.id === backupId 
            ? { ...b, progress: i }
            : b
        ));
      }

      // Simular tamanho do backup
      const estimatedSize = backup.tables.length * 1024 * 1024; // 1MB por tabela

      setBackups(prev => prev.map(b => 
        b.id === backupId 
          ? { 
              ...b, 
              status: 'completed', 
              progress: 100,
              size: estimatedSize
            }
          : b
      ));

      toast({
        title: "✅ Backup Criado",
        description: `Backup "${backup.name}" criado com sucesso`,
      });

      // Reset form
      setNewBackup({
        name: '',
        description: '',
        type: 'full',
        tables: []
      });

    } catch (error: any) {
      setBackups(prev => prev.map(b => 
        b.id === backupId 
          ? { 
              ...b, 
              status: 'failed',
              error: error.message
            }
          : b
      ));

      toast({
        title: "❌ Erro no Backup",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const restoreBackup = async (backup: BackupRecord) => {
    setLoading(true);
    
    try {
      // Atualizar status para restoring
      setBackups(prev => prev.map(b => 
        b.id === backup.id 
          ? { ...b, status: 'restoring', progress: 0 }
          : b
      ));

      // Simular processo de restauro
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setBackups(prev => prev.map(b => 
          b.id === backup.id 
            ? { ...b, progress: i }
            : b
        ));
      }

      // Restauro concluído
      setBackups(prev => prev.map(b => 
        b.id === backup.id 
          ? { ...b, status: 'completed', progress: 100 }
          : b
      ));

      toast({
        title: "✅ Restauro Concluído",
        description: `Dados restaurados a partir do backup "${backup.name}"`,
      });

      setRestoreDialog(false);
      setSelectedBackup(null);

    } catch (error: any) {
      setBackups(prev => prev.map(b => 
        b.id === backup.id 
          ? { 
              ...b, 
              status: 'failed',
              error: error.message
            }
          : b
      ));

      toast({
        title: "❌ Erro no Restauro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = (backup: BackupRecord) => {
    // Simular download
    const data = {
      backup: backup,
      timestamp: new Date().toISOString(),
      tables: backup.tables,
      metadata: {
        version: '2.0',
        system: 'Valentão Operacionais'
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${backup.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📥 Download Iniciado",
      description: `Backup "${backup.name}" está sendo descarregado`,
    });
  };

  const deleteBackup = async (backupId: string) => {
    setBackups(prev => prev.filter(b => b.id !== backupId));
    
    toast({
      title: "🗑️ Backup Removido",
      description: "Backup removido com sucesso",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'creating':
      case 'restoring':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'incremental':
        return 'bg-green-100 text-green-800';
      case 'differential':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Backup e Recuperação</h2>
          <p className="text-gray-600">Proteja os seus dados com backups automáticos e restauro rápido</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={createBackupDialog} onOpenChange={setCreateBackupDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Criar Backup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Backup</DialogTitle>
                <DialogDescription>
                  Configure um novo backup dos dados do sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="backup-name">Nome do Backup</Label>
                  <Input
                    id="backup-name"
                    value={newBackup.name}
                    onChange={(e) => setNewBackup(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Backup Mensal Janeiro"
                  />
                </div>
                
                <div>
                  <Label htmlFor="backup-description">Descrição</Label>
                  <Textarea
                    id="backup-description"
                    value={newBackup.description}
                    onChange={(e) => setNewBackup(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição opcional do backup..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Tipo de Backup</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['full', 'incremental', 'differential'].map((type) => (
                      <Button
                        key={type}
                        variant={newBackup.type === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewBackup(prev => ({ ...prev, type: type as any }))}
                      >
                        {type === 'full' ? 'Completo' : 
                         type === 'incremental' ? 'Incremental' : 'Diferencial'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={createBackup} className="flex-1">
                    Criar Backup
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCreateBackupDialog(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" onClick={loadBackups}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-blue-600">{backups.length}</p>
              </div>
              <Archive className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Espaço Usado</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatFileSize(backups.reduce((acc, b) => acc + b.size, 0))}
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Último Backup</p>
                <p className="text-2xl font-bold text-purple-600">
                  {backups.length > 0 ? 
                    new Date(Math.max(...backups.map(b => new Date(b.createdAt).getTime()))).toLocaleDateString('pt-PT') :
                    'Nunca'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pontos Restauro</p>
                <p className="text-2xl font-bold text-orange-600">{restorePoints.length}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Backups Disponíveis</span>
          </CardTitle>
          <CardDescription>
            Gerir e restaurar backups do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(backup.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{backup.name}</h4>
                        <p className="text-sm text-gray-600">{backup.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getTypeColor(backup.type)}>
                            {backup.type === 'full' ? 'Completo' : 
                             backup.type === 'incremental' ? 'Incremental' : 'Diferencial'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(backup.size)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {backup.tables.length} tabelas
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(backup.createdAt).toLocaleString('pt-PT')}
                      </p>
                      <p className="text-xs text-gray-400">por {backup.createdBy}</p>
                    </div>
                  </div>

                  {(backup.status === 'creating' || backup.status === 'restoring') && (
                    <div className="mb-3">
                      <Progress value={backup.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {backup.status === 'creating' ? 'Criando' : 'Restaurando'} - {backup.progress}%
                      </p>
                    </div>
                  )}

                  {backup.error && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Erro:</strong> {backup.error}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadBackup(backup)}
                      disabled={backup.status !== 'completed'}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={backup.status !== 'completed'}
                          onClick={() => setSelectedBackup(backup)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Restaurar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmar Restauro</DialogTitle>
                          <DialogDescription>
                            Tem a certeza que deseja restaurar os dados a partir deste backup?
                            Esta ação irá substituir os dados atuais.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                            <h4 className="font-medium text-yellow-800">Aviso Importante</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              O restauro irá substituir os dados atuais. Recomendamos criar um backup 
                              dos dados atuais antes de prosseguir.
                            </p>
                          </div>
                          
                          {selectedBackup && (
                            <div className="space-y-2">
                              <p><strong>Backup:</strong> {selectedBackup.name}</p>
                              <p><strong>Data:</strong> {new Date(selectedBackup.createdAt).toLocaleString('pt-PT')}</p>
                              <p><strong>Tabelas:</strong> {selectedBackup.tables.join(', ')}</p>
                              <p><strong>Tamanho:</strong> {formatFileSize(selectedBackup.size)}</p>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => selectedBackup && restoreBackup(selectedBackup)}
                              disabled={loading}
                              className="flex-1"
                              variant="destructive"
                            >
                              {loading ? 'Restaurando...' : 'Confirmar Restauro'}
                            </Button>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">
                                Cancelar
                              </Button>
                            </DialogTrigger>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBackup(backup.id)}
                      disabled={backup.status === 'creating' || backup.status === 'restoring'}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}

              {backups.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum backup disponível</p>
                  <p className="text-sm">Crie o seu primeiro backup para proteger os dados</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Restore Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Pontos de Restauro</span>
          </CardTitle>
          <CardDescription>
            Pontos de restauro automáticos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {restorePoints.map((point) => (
              <div
                key={point.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{point.description}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(point.timestamp).toLocaleString('pt-PT')} • {point.recordCount} registos
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-1" />
                  Restaurar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupRecovery;