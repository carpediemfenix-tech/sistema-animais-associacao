import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  GraduationCap, 
  AlertCircle, 
  Plus, 
  Users, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  Clock, 
  Edit, 
  Eye, 
  Loader2,
  Sprout,
  Shield,
  Sword,
  Crown,
  User,
  Calendar,
  FileText,
  Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/UserHeader";
import { 
  NivelFormacao, 
  VoluntarioValentao, 
  VoluntarioProgressao,
  VoluntarioSimples,
  ProgressaoSimples,
  getNivelIcon,
  getNivelCor
} from "@/types/voluntarios";

const GestaoFormacao = () => {
  const [voluntarios, setVoluntarios] = useState<VoluntarioSimples[]>([]);
  const [niveisFormacao, setNiveisFormacao] = useState<NivelFormacao[]>([]);
  const [progressoes, setProgressoes] = useState<ProgressaoSimples[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para nova progressão
  const [novaProgressao, setNovaProgressao] = useState({
    voluntario_id: '',
    nivel_novo_id: '',
    observacoes: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  
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
              Apenas administradores podem gerir a formação
            </CardDescription>
          </CardHeader>
          <CardContent>
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

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar voluntários ativos
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('*')
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

      // Carregar progressões recentes
      const { data: progressoesData, error: progressoesError } = await supabase
        .from('voluntario_progressao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (progressoesError) throw progressoesError;

      setVoluntarios(voluntariosData || []);
      setNiveisFormacao(niveisData || []);
      setProgressoes(progressoesData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao Carregar",
        description: error.message || "Erro ao carregar dados de formação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProgressao = async () => {
    if (!novaProgressao.voluntario_id || !novaProgressao.nivel_novo_id) {
      toast({
        title: "Dados Incompletos",
        description: "Selecione o voluntário e o nível de formação",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Buscar o voluntário atual
      const voluntario = voluntarios.find(v => v.id === novaProgressao.voluntario_id);
      if (!voluntario) throw new Error('Voluntário não encontrado');

      // Inserir nova progressão
      const progressaoData = {
        voluntario_id: novaProgressao.voluntario_id,
        nivel_id: novaProgressao.nivel_novo_id,
        nivel_anterior_id: voluntario.nivel_formacao_atual || null,
        nivel_novo_id: novaProgressao.nivel_novo_id,
        data_progressao: new Date().toISOString().split('T')[0],
        observacoes: novaProgressao.observacoes.trim() || null,
        data_inicio: new Date().toISOString().split('T')[0]
      };

      const { error: progressaoError } = await supabase
        .from('voluntario_progressao')
        .insert([progressaoData]);

      if (progressaoError) throw progressaoError;

      // Atualizar o voluntário
      const { error: voluntarioError } = await supabase
        .from('voluntarios')
        .update({
          nivel_formacao_atual: novaProgressao.nivel_novo_id,
          tem_formacao: true
        })
        .eq('id', novaProgressao.voluntario_id);

      if (voluntarioError) throw voluntarioError;

      toast({
        title: "Progressão Registada",
        description: `Progressão de ${voluntario.nome} registada com sucesso!`,
      });

      // Resetar formulário e recarregar dados
      setNovaProgressao({
        voluntario_id: '',
        nivel_novo_id: '',
        observacoes: ''
      });
      setDialogOpen(false);
      loadData();

    } catch (error: any) {
      console.error('Erro ao registar progressão:', error);
      toast({
        title: "Erro ao Registar",
        description: error.message || "Erro ao registar progressão",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getNivelNome = (nivelId: string): string => {
    const nivel = niveisFormacao.find(n => n.id === nivelId);
    return nivel?.nome || 'Desconhecido';
  };

  const getVoluntarioNome = (voluntarioId: string): string => {
    const voluntario = voluntarios.find(v => v.id === voluntarioId);
    return voluntario?.nome || 'Desconhecido';
  };

  const getNivelIconComponent = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_BASE': return Sprout;
      case 'FORMA_N1': return Shield;
      case 'FORMA_N2': return Sword;
      case 'FORMA_N3': return Crown;
      default: return User;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <UserHeader />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando dados de formação...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <UserHeader />
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/voluntarios">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-purple-600" />
                Gestão de Formação Valentão
              </h1>
              <p className="text-gray-600">
                Gerir progressão formativa dos voluntários
              </p>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Progressão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registar Nova Progressão</DialogTitle>
                <DialogDescription>
                  Atribuir um novo nível de formação a um voluntário
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Voluntário</Label>
                  <Select
                    value={novaProgressao.voluntario_id}
                    onValueChange={(value) => setNovaProgressao(prev => ({ ...prev, voluntario_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar voluntário" />
                    </SelectTrigger>
                    <SelectContent>
                      {voluntarios.map((voluntario) => (
                        <SelectItem key={voluntario.id} value={voluntario.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {voluntario.nome}
                            {voluntario.nivel_formacao_atual && (
                              <Badge variant="outline" className="ml-2">
                                {getNivelNome(voluntario.nivel_formacao_atual)}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Novo Nível de Formação</Label>
                  <Select
                    value={novaProgressao.nivel_novo_id}
                    onValueChange={(value) => setNovaProgressao(prev => ({ ...prev, nivel_novo_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {niveisFormacao.map((nivel) => {
                        const IconComponent = getNivelIconComponent(nivel.codigo);
                        return (
                          <SelectItem key={nivel.id} value={nivel.id}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" style={{ color: nivel.cor }} />
                              {nivel.nome}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={novaProgressao.observacoes}
                    onChange={(e) => setNovaProgressao(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre a progressão..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleProgressao} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Registar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Voluntários</p>
                  <p className="text-2xl font-bold">{voluntarios.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Com Formação</p>
                  <p className="text-2xl font-bold">
                    {voluntarios.filter(v => v.tem_formacao).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Sem Formação</p>
                  <p className="text-2xl font-bold">
                    {voluntarios.filter(v => !v.tem_formacao).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Progressões</p>
                  <p className="text-2xl font-bold">{progressoes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="voluntarios" className="space-y-4">
          <TabsList>
            <TabsTrigger value="voluntarios">Voluntários</TabsTrigger>
            <TabsTrigger value="progressoes">Progressões Recentes</TabsTrigger>
            <TabsTrigger value="niveis">Níveis de Formação</TabsTrigger>
          </TabsList>

          {/* Tab Voluntários */}
          <TabsContent value="voluntarios">
            <Card>
              <CardHeader>
                <CardTitle>Voluntários e Formação Atual</CardTitle>
                <CardDescription>
                  Estado atual da formação de cada voluntário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voluntário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Nível Atual</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voluntarios.map((voluntario) => {
                      const nivelAtual = voluntario.nivel_formacao_atual 
                        ? niveisFormacao.find(n => n.id === voluntario.nivel_formacao_atual)
                        : null;
                      
                      return (
                        <TableRow key={voluntario.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{voluntario.nome}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {voluntario.email}
                          </TableCell>
                          <TableCell>
                            {nivelAtual ? (
                              <Badge 
                                variant="outline" 
                                className="flex items-center gap-1 w-fit"
                                style={{ borderColor: nivelAtual.cor, color: nivelAtual.cor }}
                              >
                                {React.createElement(getNivelIconComponent(nivelAtual.codigo), { 
                                  className: "h-3 w-3" 
                                })}
                                {nivelAtual.nome}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Sem Formação</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={voluntario.ativo ? "default" : "secondary"}>
                              {voluntario.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link to={`/voluntarios/perfil/${voluntario.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Progressões */}
          <TabsContent value="progressoes">
            <Card>
              <CardHeader>
                <CardTitle>Progressões Recentes</CardTitle>
                <CardDescription>
                  Histórico das últimas progressões formativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Voluntário</TableHead>
                      <TableHead>Nível Anterior</TableHead>
                      <TableHead>Novo Nível</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressoes.map((progressao) => (
                      <TableRow key={progressao.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(progressao.data_progressao).toLocaleDateString('pt-PT')}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {getVoluntarioNome(progressao.voluntario_id)}
                        </TableCell>
                        <TableCell>
                          {progressao.nivel_anterior_id ? (
                            <Badge variant="outline">
                              {getNivelNome(progressao.nivel_anterior_id)}
                            </Badge>
                          ) : (
                            <span className="text-gray-500">Sem formação</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {getNivelNome(progressao.nivel_novo_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {progressao.observacoes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Níveis */}
          <TabsContent value="niveis">
            <Card>
              <CardHeader>
                <CardTitle>Níveis de Formação Valentão</CardTitle>
                <CardDescription>
                  Estrutura do sistema de formação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {niveisFormacao.map((nivel) => {
                    const IconComponent = getNivelIconComponent(nivel.codigo);
                    const voluntariosNivel = voluntarios.filter(v => v.nivel_formacao_atual === nivel.id).length;
                    
                    return (
                      <Card key={nivel.id} className="border-2" style={{ borderColor: nivel.cor + '20' }}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: nivel.cor + '20' }}
                            >
                              <IconComponent className="h-5 w-5" style={{ color: nivel.cor }} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{nivel.nome}</h3>
                              <p className="text-sm text-gray-600 mt-1">{nivel.descricao}</p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <span>Ordem: {nivel.ordem}</span>
                                <span>Voluntários: {voluntariosNivel}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GestaoFormacao;