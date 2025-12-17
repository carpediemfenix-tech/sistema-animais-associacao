import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  User,
  FileText,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TipoWorkflow {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  etapas: any[];
  ativo: boolean;
}

interface Workflow {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: string;
  etapa_atual: number;
  solicitante_nome: string;
  prazo_aprovacao?: string;
  created_at: string;
}

interface AprovacaoWorkflow {
  id: string;
  workflow_id: string;
  etapa: number;
  acao: 'aprovado' | 'rejeitado' | 'solicitado_alteracao';
  comentario?: string;
  created_at: string;
}

const WorkflowAprovacoes: React.FC = () => {
  const { toast } = useToast();
  const [tiposWorkflow, setTiposWorkflow] = useState<TipoWorkflow[]>([]);
  const [workflowsPendentes, setWorkflowsPendentes] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoWorkflowOpen, setNovoWorkflowOpen] = useState(false);
  const [aprovacaoOpen, setAprovacaoOpen] = useState(false);
  const [workflowSelecionado, setWorkflowSelecionado] = useState<Workflow | null>(null);

  const [novoWorkflow, setNovoWorkflow] = useState({
    tipo_workflow_id: '',
    titulo: '',
    descricao: '',
    dados_processo: {}
  });

  const [aprovacao, setAprovacao] = useState({
    acao: 'aprovado' as 'aprovado' | 'rejeitado' | 'solicitado_alteracao',
    comentario: ''
  });

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      
      // Carregar tipos de workflow
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipos_workflow_2025_12_16_13_30')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (tiposError) throw tiposError;

      // Carregar workflows pendentes para o usuário
      const { data: pendentesData, error: pendentesError } = await supabase
        .rpc('obter_workflows_pendentes_usuario');

      if (pendentesError) throw pendentesError;

      setTiposWorkflow(tiposData || []);
      setWorkflowsPendentes(pendentesData || []);
    } catch (error) {
      console.error('Erro ao carregar workflows:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const criarWorkflow = async () => {
    try {
      const { data, error } = await supabase
        .rpc('criar_workflow', {
          p_tipo_workflow_id: novoWorkflow.tipo_workflow_id,
          p_titulo: novoWorkflow.titulo,
          p_descricao: novoWorkflow.descricao,
          p_dados_processo: novoWorkflow.dados_processo
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Workflow criado com sucesso!",
      });

      setNovoWorkflowOpen(false);
      setNovoWorkflow({
        tipo_workflow_id: '',
        titulo: '',
        descricao: '',
        dados_processo: {}
      });

      await loadWorkflows();
    } catch (error: any) {
      console.error('Erro ao criar workflow:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar workflow",
        variant: "destructive",
      });
    }
  };

  const processarAprovacao = async () => {
    if (!workflowSelecionado) return;

    try {
      const { error } = await supabase
        .rpc('processar_aprovacao_workflow', {
          p_workflow_id: workflowSelecionado.id,
          p_acao: aprovacao.acao,
          p_comentario: aprovacao.comentario
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Workflow ${aprovacao.acao} com sucesso!`,
      });

      setAprovacaoOpen(false);
      setWorkflowSelecionado(null);
      setAprovacao({
        acao: 'aprovado',
        comentario: ''
      });

      await loadWorkflows();
    } catch (error: any) {
      console.error('Erro ao processar aprovação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar aprovação",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (etapa: number, totalEtapas: number) => {
    if (etapa === totalEtapas) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case 'aprovado': return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'rejeitado': return <ThumbsDown className="h-4 w-4 text-red-600" />;
      case 'solicitado_alteracao': return <MessageSquare className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'animais': return 'bg-green-100 text-green-800';
      case 'voluntarios': return 'bg-blue-100 text-blue-800';
      case 'equipamentos': return 'bg-purple-100 text-purple-800';
      case 'financeiro': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <GitBranch className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando workflows...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow e Aprovações</h1>
          <p className="text-gray-600">
            Sistema de processos organizacionais e aprovações
          </p>
        </div>
        
        <Dialog open={novoWorkflowOpen} onOpenChange={setNovoWorkflowOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Processo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Iniciar Novo Processo</DialogTitle>
              <DialogDescription>
                Selecione o tipo de processo e preencha as informações
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="tipo_workflow">Tipo de Processo</Label>
                <Select 
                  value={novoWorkflow.tipo_workflow_id} 
                  onValueChange={(value) => setNovoWorkflow(prev => ({ ...prev, tipo_workflow_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposWorkflow.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getCategoriaColor(tipo.categoria)}>
                            {tipo.categoria}
                          </Badge>
                          <span>{tipo.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="titulo">Título do Processo</Label>
                <Input
                  id="titulo"
                  value={novoWorkflow.titulo}
                  onChange={(e) => setNovoWorkflow(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título descritivo do processo"
                />
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novoWorkflow.descricao}
                  onChange={(e) => setNovoWorkflow(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Detalhes do processo..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setNovoWorkflowOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={criarWorkflow} disabled={!novoWorkflow.tipo_workflow_id || !novoWorkflow.titulo}>
                Iniciar Processo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowsPendentes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos Disponíveis</CardTitle>
            <GitBranch className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tiposWorkflow.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(tiposWorkflow.map(t => t.categoria)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflowsPendentes.filter(w => w.prazo_aprovacao && new Date(w.prazo_aprovacao) < new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pendentes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendentes">Aprovações Pendentes</TabsTrigger>
          <TabsTrigger value="tipos">Tipos de Processo</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-6">
          <div className="space-y-4">
            {workflowsPendentes.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma aprovação pendente</p>
                    <p className="text-sm mt-1">Todos os processos estão em dia!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              workflowsPendentes.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(workflow.etapa_atual, 2)}
                        <div>
                          <CardTitle className="text-lg">{workflow.titulo}</CardTitle>
                          <p className="text-sm text-gray-600">
                            Solicitado por: {workflow.solicitante_nome}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getCategoriaColor(workflow.categoria)}>
                          {workflow.categoria}
                        </Badge>
                        <Badge variant="outline">
                          Etapa {workflow.etapa_atual}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {workflow.descricao && (
                      <p className="text-sm text-gray-700">{workflow.descricao}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Criado em: {new Date(workflow.created_at).toLocaleDateString('pt-PT')}</span>
                        </div>
                        {workflow.prazo_aprovacao && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>Prazo: {new Date(workflow.prazo_aprovacao).toLocaleDateString('pt-PT')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setWorkflowSelecionado(workflow);
                            setAprovacao({ acao: 'rejeitado', comentario: '' });
                            setAprovacaoOpen(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => {
                            setWorkflowSelecionado(workflow);
                            setAprovacao({ acao: 'aprovado', comentario: '' });
                            setAprovacaoOpen(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tipos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiposWorkflow.map((tipo) => (
              <Card key={tipo.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tipo.nome}</CardTitle>
                    <Badge className={getCategoriaColor(tipo.categoria)}>
                      {tipo.categoria}
                    </Badge>
                  </div>
                  {tipo.descricao && (
                    <p className="text-sm text-gray-600">{tipo.descricao}</p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Etapas do Processo:</h4>
                    {tipo.etapas.map((etapa: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span>{etapa.nome}</span>
                        {index < tipo.etapas.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Aprovações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Histórico em desenvolvimento</p>
                <p className="text-sm mt-1">Em breve você poderá ver todo o histórico de aprovações</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Aprovação */}
      <Dialog open={aprovacaoOpen} onOpenChange={setAprovacaoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {aprovacao.acao === 'aprovado' ? 'Aprovar' : 'Rejeitar'} Processo
            </DialogTitle>
            <DialogDescription>
              {workflowSelecionado?.titulo}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="acao">Ação</Label>
              <Select 
                value={aprovacao.acao} 
                onValueChange={(value: 'aprovado' | 'rejeitado' | 'solicitado_alteracao') => 
                  setAprovacao(prev => ({ ...prev, acao: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aprovado">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span>Aprovar</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rejeitado">
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span>Rejeitar</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="solicitado_alteracao">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-yellow-600" />
                      <span>Solicitar Alteração</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="comentario">Comentário</Label>
              <Textarea
                id="comentario"
                value={aprovacao.comentario}
                onChange={(e) => setAprovacao(prev => ({ ...prev, comentario: e.target.value }))}
                placeholder="Adicione um comentário (opcional)..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAprovacaoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={processarAprovacao}>
              Confirmar {aprovacao.acao === 'aprovado' ? 'Aprovação' : 'Rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowAprovacoes;