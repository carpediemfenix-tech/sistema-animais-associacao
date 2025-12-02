import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Plus, 
  Award, 
  Users, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Save,
  Edit,
  Eye,
  Sprout,
  Shield,
  Sword,
  Crown,
  Heart,
  Zap,
  User,
  Star,
  Target,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { VoluntarioValentao, NivelFormacao, Especializacao, VoluntarioProgressao, VoluntarioEspecializacao } from "@/types/voluntarios";

const GestaoFormacao = () => {
  const [voluntarios, setVoluntarios] = useState<VoluntarioValentao[]>([]);
  const [niveisFormacao, setNiveisFormacao] = useState<NivelFormacao[]>([]);
  const [especializacoes, setEspecializacoes] = useState<Especializacao[]>([]);
  const [progressoes, setProgressoes] = useState<VoluntarioProgressao[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVoluntario, setSelectedVoluntario] = useState<string>("");
  const [selectedNivel, setSelectedNivel] = useState<string>("");
  const [selectedEspecializacao, setSelectedEspecializacao] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");

  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem gerir formação
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/voluntarios">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar voluntários com nível atual
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select(`
          *,
          nivel_formacao:nivel_formacao_atual(*)
        `)
        .eq('ativo', true)
        .order('nome');

      if (voluntariosError) throw voluntariosError;

      // Carregar níveis de formação
      const { data: niveisData, error: niveisError } = await supabase
        .from('niveis_formacao')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (niveisError) throw niveisError;

      // Carregar especializações
      const { data: especializacoesData, error: especializacoesError } = await supabase
        .from('especializacoes')
        .select('*')
        .eq('ativo', true);

      if (especializacoesError) throw especializacoesError;

      // Carregar progressões recentes
      const { data: progressoesData, error: progressoesError } = await supabase
        .from('voluntario_progressao')
        .select(`
          *,
          voluntario:voluntario_id(nome),
          nivel:nivel_id(nome, codigo, cor)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (progressoesError) throw progressoesError;

      setVoluntarios(voluntariosData || []);
      setNiveisFormacao(niveisData || []);
      setEspecializacoes(especializacoesData || []);
      setProgressoes(progressoesData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de formação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAtribuirNivel = async () => {
    if (!selectedVoluntario || !selectedNivel) {
      toast({
        title: "Erro",
        description: "Selecione um voluntário e um nível",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Criar progressão
      const { error: progressaoError } = await supabase
        .from('voluntario_progressao')
        .insert([{
          voluntario_id: selectedVoluntario,
          nivel_id: selectedNivel,
          data_inicio: new Date().toISOString().split('T')[0],
          data_conclusao: new Date().toISOString().split('T')[0],
          certificado_emitido: true,
          observacoes: observacoes.trim() || null
        }]);

      if (progressaoError) throw progressaoError;

      // Atualizar nível atual do voluntário
      const { error: voluntarioError } = await supabase
        .from('voluntarios')
        .update({ nivel_formacao_atual: selectedNivel })
        .eq('id', selectedVoluntario);

      if (voluntarioError) throw voluntarioError;

      toast({
        title: "Sucesso",
        description: "Nível de formação atribuído com sucesso",
      });

      setDialogOpen(false);
      setSelectedVoluntario("");
      setSelectedNivel("");
      setObservacoes("");
      loadData();

    } catch (error: any) {
      console.error('Erro ao atribuir nível:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atribuir nível de formação",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getNivelIcon = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_BASE': return <Sprout className="h-4 w-4" />;
      case 'FORMA_N1': return <Shield className="h-4 w-4" />;
      case 'FORMA_N2': return <Sword className="h-4 w-4" />;
      case 'FORMA_N3': return <Crown className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getEspecializacaoIcon = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_VET': return <Heart className="h-4 w-4" />;
      case 'FORMA_RESCUE': return <Zap className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  // Calcular estatísticas
  const estatisticas = {
    totalVoluntarios: voluntarios.length,
    distribuicaoPorNivel: niveisFormacao.map(nivel => ({
      nivel,
      quantidade: voluntarios.filter(v => v.nivel_formacao_atual === nivel.id).length
    })),
    progressoesRecentes: progressoes.length,
    voluntariosSemNivel: voluntarios.filter(v => !v.nivel_formacao_atual).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando gestão de formação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="h-8 w-8 mr-3 text-blue-600" />
              Gestão de Formação
            </h1>
            <p className="text-gray-600 mt-1">
              Gerir progressão formativa dos voluntários Valentão
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/voluntarios">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Voluntários
              </Button>
            </Link>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Atribuir Formação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atribuir Nível de Formação</DialogTitle>
                  <DialogDescription>
                    Atribua um nível de formação a um voluntário
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  
                  {/* Voluntário */}
                  <div>
                    <Label htmlFor="voluntario">Voluntário</Label>
                    <Select value={selectedVoluntario} onValueChange={setSelectedVoluntario}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar voluntário" />
                      </SelectTrigger>
                      <SelectContent>
                        {voluntarios.map((voluntario) => (
                          <SelectItem key={voluntario.id} value={voluntario.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{voluntario.nome}</span>
                              {voluntario.nivel_formacao && (
                                <Badge 
                                  variant="secondary" 
                                  style={{ backgroundColor: `${voluntario.nivel_formacao.cor}20`, color: voluntario.nivel_formacao.cor }}
                                  className="ml-2"
                                >
                                  {voluntario.nivel_formacao.codigo}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Nível */}
                  <div>
                    <Label htmlFor="nivel">Nível de Formação</Label>
                    <Select value={selectedNivel} onValueChange={setSelectedNivel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {niveisFormacao.map((nivel) => (
                          <SelectItem key={nivel.id} value={nivel.id}>
                            <div className="flex items-center space-x-2">
                              <span style={{ color: nivel.cor }}>
                                {getNivelIcon(nivel.codigo)}
                              </span>
                              <span>{nivel.nome}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Observações */}
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Observações sobre a atribuição"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAtribuirNivel} disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Atribuir
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Voluntários</p>
                  <p className="text-2xl font-bold">{estatisticas.totalVoluntarios}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sem Nível</p>
                  <p className="text-2xl font-bold text-orange-600">{estatisticas.voluntariosSemNivel}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progressões</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.progressoesRecentes}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Níveis Ativos</p>
                  <p className="text-2xl font-bold text-purple-600">{niveisFormacao.length}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="distribuicao" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="distribuicao">Distribuição por Nível</TabsTrigger>
            <TabsTrigger value="progressoes">Progressões Recentes</TabsTrigger>
            <TabsTrigger value="voluntarios">Voluntários por Nível</TabsTrigger>
          </TabsList>

          {/* Tab: Distribuição por Nível */}
          <TabsContent value="distribuicao">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Nível de Formação</CardTitle>
                <CardDescription>
                  Visualização da distribuição dos voluntários pelos níveis Valentão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {estatisticas.distribuicaoPorNivel.map((item) => (
                  <div key={item.nivel.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded-full"
                          style={{ backgroundColor: `${item.nivel.cor}20` }}
                        >
                          <span style={{ color: item.nivel.cor }}>
                            {getNivelIcon(item.nivel.codigo)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{item.nivel.nome}</p>
                          <p className="text-sm text-gray-500">{item.nivel.codigo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{item.quantidade}</p>
                        <p className="text-sm text-gray-500">
                          {estatisticas.totalVoluntarios > 0 
                            ? `${Math.round((item.quantidade / estatisticas.totalVoluntarios) * 100)}%`
                            : '0%'
                          }
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={estatisticas.totalVoluntarios > 0 
                        ? (item.quantidade / estatisticas.totalVoluntarios) * 100 
                        : 0
                      } 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Progressões Recentes */}
          <TabsContent value="progressoes">
            <Card>
              <CardHeader>
                <CardTitle>Progressões Recentes</CardTitle>
                <CardDescription>
                  Últimas progressões de formação registadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {progressoes.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma progressão registada
                    </h3>
                    <p className="text-gray-500">
                      As progressões de formação aparecerão aqui quando forem registadas
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voluntário</TableHead>
                          <TableHead>Nível</TableHead>
                          <TableHead>Data Início</TableHead>
                          <TableHead>Data Conclusão</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {progressoes.map((progressao) => (
                          <TableRow key={progressao.id}>
                            <TableCell className="font-medium">
                              {progressao.voluntario?.nome}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span style={{ color: progressao.nivel?.cor }}>
                                  {getNivelIcon(progressao.nivel?.codigo || '')}
                                </span>
                                <span>{progressao.nivel?.nome}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>
                                  {new Date(progressao.data_inicio).toLocaleDateString('pt-PT')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {progressao.data_conclusao ? (
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>
                                    {new Date(progressao.data_conclusao).toLocaleDateString('pt-PT')}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-yellow-500" />
                                  <span>Em curso</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {progressao.certificado_emitido ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Certificado
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Link to={`/voluntarios/perfil/${progressao.voluntario_id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Voluntários por Nível */}
          <TabsContent value="voluntarios">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {niveisFormacao.map((nivel) => {
                const voluntariosDoNivel = voluntarios.filter(v => v.nivel_formacao_atual === nivel.id);
                
                return (
                  <Card key={nivel.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span style={{ color: nivel.cor }}>
                          {getNivelIcon(nivel.codigo)}
                        </span>
                        <span>{nivel.nome}</span>
                        <Badge 
                          style={{ backgroundColor: nivel.cor, color: 'white' }}
                        >
                          {voluntariosDoNivel.length}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {nivel.descricao}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {voluntariosDoNivel.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Nenhum voluntário neste nível
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {voluntariosDoNivel.map((voluntario) => (
                            <div key={voluntario.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                              <div>
                                <p className="font-medium">{voluntario.nome}</p>
                                <p className="text-sm text-gray-500">{voluntario.email}</p>
                              </div>
                              <Link to={`/voluntarios/perfil/${voluntario.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GestaoFormacao;