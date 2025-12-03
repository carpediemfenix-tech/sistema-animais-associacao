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
import { ArrowLeft, GraduationCap, AlertCircle, Plus, Users, TrendingUp, Award, CheckCircle, Clock, Edit, Eye, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/UserHeader";

interface NivelFormacao {
  id: string;
  nome: string;
  codigo: string;
  cor: string;
  ordem: number;
  ativo: boolean;
  descricao?: string;
}

interface Voluntario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  ativo: boolean;
  nivel_formacao_atual?: string;
  data_entrada?: string;
  nivel_formacao?: NivelFormacao;
}

interface VoluntarioProgressao {
  id: string;
  voluntario_id: string;
  nivel_anterior?: string;
  nivel_atual: string;
  data_progressao: string;
  observacoes?: string;
  aprovado_por?: string;
}

const getNivelIcon = (codigo: string) => {
  switch (codigo) {
    case 'FORMA_BASE': return '🌱';
    case 'N1': return '🟢';
    case 'N2': return '🔵';
    case 'N3': return '🟡';
    case 'FORMA_VET': return '🏥';
    case 'FORMA_RESCUE': return '🚑';
    default: return '⚪';
  }
};

const getNivelColor = (codigo: string) => {
  switch (codigo) {
    case 'FORMA_BASE': return 'bg-green-100 text-green-800 border-green-200';
    case 'N1': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'N2': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'N3': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'FORMA_VET': return 'bg-red-100 text-red-800 border-red-200';
    case 'FORMA_RESCUE': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const GestaoFormacao = () => {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [niveisFormacao, setNiveisFormacao] = useState<NivelFormacao[]>([]);
  const [progressoes, setProgressoes] = useState<VoluntarioProgressao[]>([]);
  const [selectedVoluntario, setSelectedVoluntario] = useState<Voluntario | null>(null);
  const [novoNivel, setNovoNivel] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (hasPermission('admin')) {
      loadData();
    }
  }, [hasPermission]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar níveis de formação
      const { data: niveisData, error: niveisError } = await supabase
        .from('niveis_formacao')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (niveisError) throw niveisError;

      // Carregar voluntários com nível atual
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select(`
          *,
          nivel_formacao:niveis_formacao!nivel_formacao_atual(*)
        `)
        .eq('ativo', true)
        .order('nome');

      if (voluntariosError) throw voluntariosError;

      // Carregar progressões recentes
      const { data: progressoesData, error: progressoesError } = await supabase
        .from('voluntario_progressao')
        .select(`
          *,
          voluntario:voluntarios!voluntario_id(nome),
          nivel_anterior_info:niveis_formacao!nivel_anterior_id(nome, codigo),
          nivel_atual_info:niveis_formacao!nivel_atual_id(nome, codigo)
        `)
        .order('data_progressao', { ascending: false })
        .limit(20);

      if (progressoesError) throw progressoesError;

      setNiveisFormacao(niveisData || []);
      setVoluntarios(voluntariosData || []);
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

  const handleProgressao = async () => {
    if (!selectedVoluntario || !novoNivel) return;

    try {
      setSubmitting(true);

      // Registar progressão
      const { error: progressaoError } = await supabase
        .from('voluntario_progressao')
        .insert({
          voluntario_id: selectedVoluntario.id,
          nivel_anterior_id: selectedVoluntario.nivel_formacao_atual,
          nivel_atual_id: novoNivel,
          data_progressao: new Date().toISOString(),
          observacoes: observacoes.trim() || null,
          aprovado_por: (await supabase.auth.getUser()).data.user?.id
        });

      if (progressaoError) throw progressaoError;

      // Atualizar nível do voluntário
      const { error: updateError } = await supabase
        .from('voluntarios')
        .update({ nivel_formacao_atual: novoNivel })
        .eq('id', selectedVoluntario.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Progressão de formação registada com sucesso",
      });

      // Resetar formulário e recarregar dados
      setSelectedVoluntario(null);
      setNovoNivel('');
      setObservacoes('');
      setDialogOpen(false);
      loadData();

    } catch (error: any) {
      console.error('Erro ao registar progressão:', error);
      toast({
        title: "Erro",
        description: "Erro ao registar progressão de formação",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openProgressaoDialog = (voluntario: Voluntario) => {
    setSelectedVoluntario(voluntario);
    setNovoNivel('');
    setObservacoes('');
    setDialogOpen(true);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando dados de formação...</p>
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
              Gestão de Formação Valentão
            </h1>
            <p className="text-gray-600 mt-1">
              Gerir progressão formativa dos voluntários no sistema Valentão ao Resgate
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/voluntarios">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Voluntários
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="voluntarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="voluntarios">Voluntários</TabsTrigger>
            <TabsTrigger value="niveis">Níveis de Formação</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          {/* Tab Voluntários */}
          <TabsContent value="voluntarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Voluntários e Formação
                </CardTitle>
                <CardDescription>
                  Gerir níveis de formação dos voluntários ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {voluntarios.map((voluntario) => (
                    <div key={voluntario.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{voluntario.nome}</h3>
                          <p className="text-sm text-gray-500">{voluntario.email}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-600 mr-2">Nível atual:</span>
                            {voluntario.nivel_formacao ? (
                              <Badge className={getNivelColor(voluntario.nivel_formacao.codigo)}>
                                {getNivelIcon(voluntario.nivel_formacao.codigo)} {voluntario.nivel_formacao.nome}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Sem nível atribuído</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProgressaoDialog(voluntario)}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Progressão
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Níveis */}
          <TabsContent value="niveis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Níveis de Formação Valentão
                </CardTitle>
                <CardDescription>
                  Sistema de formação baseado no plano Valentão ao Resgate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {niveisFormacao.map((nivel) => (
                    <Card key={nivel.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={getNivelColor(nivel.codigo)}>
                            {getNivelIcon(nivel.codigo)} {nivel.codigo}
                          </Badge>
                          <span className="text-sm text-gray-500">Ordem: {nivel.ordem}</span>
                        </div>
                        <CardTitle className="text-lg">{nivel.nome}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {nivel.descricao && (
                          <p className="text-sm text-gray-600">{nivel.descricao}</p>
                        )}
                        <div className="mt-3 text-xs text-gray-500">
                          Voluntários neste nível: {voluntarios.filter(v => v.nivel_formacao_atual === nivel.id).length}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Histórico */}
          <TabsContent value="historico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Histórico de Progressões
                </CardTitle>
                <CardDescription>
                  Últimas progressões de formação registadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voluntário</TableHead>
                      <TableHead>Nível Anterior</TableHead>
                      <TableHead>Nível Atual</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressoes.map((progressao) => (
                      <TableRow key={progressao.id}>
                        <TableCell className="font-medium">
                          {(progressao as any).voluntario?.nome || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {(progressao as any).nivel_anterior_info ? (
                            <Badge variant="outline" className="text-xs">
                              {getNivelIcon((progressao as any).nivel_anterior_info.codigo)} {(progressao as any).nivel_anterior_info.nome}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">Inicial</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getNivelColor((progressao as any).nivel_atual_info?.codigo || '')}>
                            {getNivelIcon((progressao as any).nivel_atual_info?.codigo || '')} {(progressao as any).nivel_atual_info?.nome || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(progressao.data_progressao).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {progressao.observacoes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Progressão */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Progressão de Formação</DialogTitle>
              <DialogDescription>
                Atribuir novo nível de formação para {selectedVoluntario?.nome}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nível atual</Label>
                <div className="mt-1">
                  {selectedVoluntario?.nivel_formacao ? (
                    <Badge className={getNivelColor(selectedVoluntario.nivel_formacao.codigo)}>
                      {getNivelIcon(selectedVoluntario.nivel_formacao.codigo)} {selectedVoluntario.nivel_formacao.nome}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Sem nível atribuído</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="novo-nivel">Novo nível</Label>
                <Select value={novoNivel} onValueChange={setNovoNivel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar novo nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveisFormacao.map((nivel) => (
                      <SelectItem key={nivel.id} value={nivel.id}>
                        <div className="flex items-center">
                          <span className="mr-2">{getNivelIcon(nivel.codigo)}</span>
                          {nivel.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Input
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Motivo da progressão, competências adquiridas..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleProgressao} 
                  disabled={!novoNivel || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Progressão
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GestaoFormacao;