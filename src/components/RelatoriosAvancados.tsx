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
  FileText,
  Play,
  Plus,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Settings,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RelatorioPersonalizado {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  query_sql: string;
  formato: 'tabela' | 'grafico' | 'kpi';
  publico: boolean;
  agendado: boolean;
  frequencia?: string;
  created_at: string;
}

interface ExecucaoRelatorio {
  id: string;
  relatorio_id: string;
  status: 'executando' | 'sucesso' | 'erro';
  resultado?: any;
  erro_mensagem?: string;
  tempo_execucao_ms?: number;
  linhas_retornadas?: number;
  created_at: string;
}

const RelatoriosAvancados: React.FC = () => {
  const { toast } = useToast();
  const [relatorios, setRelatorios] = useState<RelatorioPersonalizado[]>([]);
  const [execucoes, setExecucoes] = useState<ExecucaoRelatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [executando, setExecutando] = useState<string | null>(null);
  const [novoRelatorioOpen, setNovoRelatorioOpen] = useState(false);
  const [estatisticas, setEstatisticas] = useState<any>({});

  const [novoRelatorio, setNovoRelatorio] = useState({
    nome: '',
    descricao: '',
    categoria: 'geral',
    query_sql: '',
    formato: 'tabela' as 'tabela' | 'grafico' | 'kpi',
    publico: false
  });

  const loadRelatorios = async () => {
    try {
      setLoading(true);
      
      const { data: relatoriosData, error: relatoriosError } = await supabase
        .from('relatorios_personalizados_2025_12_16_13_30')
        .select('*')
        .order('created_at', { ascending: false });

      if (relatoriosError) throw relatoriosError;

      const { data: execucoesData, error: execucoesError } = await supabase
        .from('execucoes_relatorios_2025_12_16_13_30')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (execucoesError) throw execucoesError;

      const { data: statsData, error: statsError } = await supabase
        .rpc('obter_estatisticas_relatorios');

      if (statsError) throw statsError;

      setRelatorios(relatoriosData || []);
      setExecucoes(execucoesData || []);
      setEstatisticas(statsData || {});
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const executarRelatorio = async (relatorioId: string) => {
    try {
      setExecutando(relatorioId);
      
      const { data, error } = await supabase
        .rpc('executar_relatorio_personalizado', {
          p_relatorio_id: relatorioId,
          p_parametros: {}
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Relatório executado com sucesso!",
      });

      // Recarregar dados
      await loadRelatorios();
    } catch (error: any) {
      console.error('Erro ao executar relatório:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao executar relatório",
        variant: "destructive",
      });
    } finally {
      setExecutando(null);
    }
  };

  const criarRelatorio = async () => {
    try {
      const { error } = await supabase
        .from('relatorios_personalizados_2025_12_16_13_30')
        .insert([{
          ...novoRelatorio,
          criado_por: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Relatório criado com sucesso!",
      });

      setNovoRelatorioOpen(false);
      setNovoRelatorio({
        nome: '',
        descricao: '',
        categoria: 'geral',
        query_sql: '',
        formato: 'tabela',
        publico: false
      });

      await loadRelatorios();
    } catch (error: any) {
      console.error('Erro ao criar relatório:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar relatório",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sucesso': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'erro': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'executando': return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFormatoIcon = (formato: string) => {
    switch (formato) {
      case 'grafico': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'kpi': return <TrendingUp className="h-4 w-4 text-green-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  useEffect(() => {
    loadRelatorios();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando relatórios...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600">
            Sistema de relatórios personalizados e dashboards executivos
          </p>
        </div>
        
        <Dialog open={novoRelatorioOpen} onOpenChange={setNovoRelatorioOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Relatório</DialogTitle>
              <DialogDescription>
                Configure um novo relatório personalizado
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Relatório</Label>
                  <Input
                    id="nome"
                    value={novoRelatorio.nome}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do relatório"
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select 
                    value={novoRelatorio.categoria} 
                    onValueChange={(value) => setNovoRelatorio(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="animais">Animais</SelectItem>
                      <SelectItem value="voluntarios">Voluntários</SelectItem>
                      <SelectItem value="equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novoRelatorio.descricao}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do relatório"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formato">Formato</Label>
                  <Select 
                    value={novoRelatorio.formato} 
                    onValueChange={(value: 'tabela' | 'grafico' | 'kpi') => setNovoRelatorio(prev => ({ ...prev, formato: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tabela">Tabela</SelectItem>
                      <SelectItem value="grafico">Gráfico</SelectItem>
                      <SelectItem value="kpi">KPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="publico"
                    checked={novoRelatorio.publico}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, publico: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="publico">Relatório Público</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="query_sql">Query SQL</Label>
                <Textarea
                  id="query_sql"
                  value={novoRelatorio.query_sql}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, query_sql: e.target.value }))}
                  placeholder="SELECT * FROM tabela WHERE condicao..."
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Apenas queries SELECT são permitidas por motivos de segurança
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setNovoRelatorioOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={criarRelatorio} disabled={!novoRelatorio.nome || !novoRelatorio.query_sql}>
                Criar Relatório
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total_relatorios || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Públicos</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.relatorios_publicos || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções Hoje</CardTitle>
            <Play className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.execucoes_hoje || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.tempo_medio_execucao ? `${Math.round(estatisticas.tempo_medio_execucao)}ms` : '0ms'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="relatorios" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="execucoes">Histórico de Execuções</TabsTrigger>
          <TabsTrigger value="agendados">Relatórios Agendados</TabsTrigger>
        </TabsList>

        <TabsContent value="relatorios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatorios.map((relatorio) => (
              <Card key={relatorio.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getFormatoIcon(relatorio.formato)}
                      <CardTitle className="text-lg">{relatorio.nome}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary">{relatorio.categoria}</Badge>
                      {relatorio.publico && <Badge variant="outline">Público</Badge>}
                    </div>
                  </div>
                  {relatorio.descricao && (
                    <p className="text-sm text-gray-600">{relatorio.descricao}</p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-500">
                    Criado em: {new Date(relatorio.created_at).toLocaleDateString('pt-PT')}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => executarRelatorio(relatorio.id)}
                      disabled={executando === relatorio.id}
                    >
                      {executando === relatorio.id ? (
                        <Clock className="h-4 w-4 mr-2 animate-pulse" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Executar
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="execucoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Execuções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {execucoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma execução encontrada</p>
                  </div>
                ) : (
                  execucoes.map((execucao) => (
                    <div key={execucao.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(execucao.status)}
                        <div>
                          <div className="font-medium">
                            {relatorios.find(r => r.id === execucao.relatorio_id)?.nome || 'Relatório não encontrado'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(execucao.created_at).toLocaleString('pt-PT')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {execucao.status === 'sucesso' && (
                          <div className="text-sm">
                            <div>{execucao.linhas_retornadas} linhas</div>
                            <div className="text-gray-500">{execucao.tempo_execucao_ms}ms</div>
                          </div>
                        )}
                        {execucao.status === 'erro' && (
                          <div className="text-sm text-red-600">
                            Erro na execução
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agendados" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Relatórios Agendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Funcionalidade de agendamento em desenvolvimento</p>
                <p className="text-sm mt-1">Em breve você poderá agendar execuções automáticas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RelatoriosAvancados;