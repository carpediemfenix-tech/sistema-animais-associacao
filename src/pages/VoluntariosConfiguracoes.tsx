import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  Edit, 
  Trash2, 
  Award,
  Sprout,
  Shield,
  Sword,
  Crown,
  Heart,
  Zap,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  RotateCcw,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { NivelFormacao, Especializacao, Conquista } from "@/types/voluntarios";

const VoluntariosConfiguracoes = () => {
  const [niveisFormacao, setNiveisFormacao] = useState<NivelFormacao[]>([]);
  const [especializacoes, setEspecializacoes] = useState<Especializacao[]>([]);
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para diálogos
  const [nivelDialogOpen, setNivelDialogOpen] = useState(false);
  const [especializacaoDialogOpen, setEspecializacaoDialogOpen] = useState(false);
  const [conquistaDialogOpen, setConquistaDialogOpen] = useState(false);
  
  // Estados para edição
  const [editingNivel, setEditingNivel] = useState<NivelFormacao | null>(null);
  const [editingEspecializacao, setEditingEspecializacao] = useState<Especializacao | null>(null);
  const [editingConquista, setEditingConquista] = useState<Conquista | null>(null);

  // Formulários
  const [nivelForm, setNivelForm] = useState({
    codigo: "",
    nome: "",
    descricao: "",
    ordem: 0,
    tempo_minimo_meses: 0,
    missoes_minimas: 0,
    competencias: [] as string[],
    cor: "#6B7280",
    icone: "User"
  });

  const [especializacaoForm, setEspecializacaoForm] = useState({
    codigo: "",
    nome: "",
    descricao: "",
    nivel_pre_requisito: "",
    competencias: [] as string[],
    cor: "#10B981",
    icone: "Award"
  });

  const [conquistaForm, setConquistaForm] = useState({
    nome: "",
    descricao: "",
    icone: "Award",
    cor: "#F59E0B",
    categoria: "geral" as "geral" | "formacao" | "missoes" | "tempo" | "especializacao",
    criterios: {} as Record<string, any>,
    pontos_requeridos: 0,
    nivel_minimo: ""
  });

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
              Apenas administradores podem aceder às configurações
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

      // Carregar níveis de formação
      const { data: niveisData, error: niveisError } = await supabase
        .from('niveis_formacao')
        .select('*')
        .order('ordem');

      if (niveisError) throw niveisError;

      // Carregar especializações
      const { data: especializacoesData, error: especializacoesError } = await supabase
        .from('especializacoes')
        .select(`
          *,
          nivel_pre_requisito_info:nivel_pre_requisito(nome, codigo, cor)
        `);

      if (especializacoesError) throw especializacoesError;

      // Carregar conquistas
      const { data: conquistasData, error: conquistasError } = await supabase
        .from('conquistas')
        .select(`
          *,
          nivel_minimo_info:nivel_minimo(nome, codigo, cor)
        `)
        .order('categoria', { ascending: true });

      if (conquistasError) throw conquistasError;

      setNiveisFormacao(niveisData || []);
      setEspecializacoes(especializacoesData || []);
      setConquistas(conquistasData || []);

    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetNivelForm = () => {
    setNivelForm({
      codigo: "",
      nome: "",
      descricao: "",
      ordem: niveisFormacao.length,
      tempo_minimo_meses: 0,
      missoes_minimas: 0,
      competencias: [],
      cor: "#6B7280",
      icone: "User"
    });
    setEditingNivel(null);
  };

  const resetEspecializacaoForm = () => {
    setEspecializacaoForm({
      codigo: "",
      nome: "",
      descricao: "",
      nivel_pre_requisito: "",
      competencias: [],
      cor: "#10B981",
      icone: "Award"
    });
    setEditingEspecializacao(null);
  };

  const resetConquistaForm = () => {
    setConquistaForm({
      nome: "",
      descricao: "",
      icone: "Award",
      cor: "#F59E0B",
      categoria: "geral",
      criterios: {},
      pontos_requeridos: 0,
      nivel_minimo: ""
    });
    setEditingConquista(null);
  };

  const openNivelDialog = (nivel?: NivelFormacao) => {
    if (nivel) {
      setEditingNivel(nivel);
      setNivelForm({
        codigo: nivel.codigo,
        nome: nivel.nome,
        descricao: nivel.descricao || "",
        ordem: nivel.ordem,
        tempo_minimo_meses: nivel.tempo_minimo_meses,
        missoes_minimas: nivel.missoes_minimas,
        competencias: nivel.competencias,
        cor: nivel.cor,
        icone: nivel.icone
      });
    } else {
      resetNivelForm();
    }
    setNivelDialogOpen(true);
  };

  const openEspecializacaoDialog = (especializacao?: Especializacao) => {
    if (especializacao) {
      setEditingEspecializacao(especializacao);
      setEspecializacaoForm({
        codigo: especializacao.codigo,
        nome: especializacao.nome,
        descricao: especializacao.descricao || "",
        nivel_pre_requisito: especializacao.nivel_pre_requisito || "",
        competencias: especializacao.competencias,
        cor: especializacao.cor,
        icone: especializacao.icone
      });
    } else {
      resetEspecializacaoForm();
    }
    setEspecializacaoDialogOpen(true);
  };

  const openConquistaDialog = (conquista?: Conquista) => {
    if (conquista) {
      setEditingConquista(conquista);
      setConquistaForm({
        nome: conquista.nome,
        descricao: conquista.descricao || "",
        icone: conquista.icone,
        cor: conquista.cor,
        categoria: conquista.categoria,
        criterios: conquista.criterios,
        pontos_requeridos: conquista.pontos_requeridos,
        nivel_minimo: conquista.nivel_minimo || ""
      });
    } else {
      resetConquistaForm();
    }
    setConquistaDialogOpen(true);
  };

  const handleSaveNivel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nivelForm.codigo.trim() || !nivelForm.nome.trim()) {
      toast({
        title: "Erro",
        description: "Código e nome são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const nivelData = {
        codigo: nivelForm.codigo.trim().toUpperCase(),
        nome: nivelForm.nome.trim(),
        descricao: nivelForm.descricao.trim() || null,
        ordem: nivelForm.ordem,
        tempo_minimo_meses: nivelForm.tempo_minimo_meses,
        missoes_minimas: nivelForm.missoes_minimas,
        competencias: nivelForm.competencias,
        cor: nivelForm.cor,
        icone: nivelForm.icone,
        ativo: true
      };

      if (editingNivel) {
        const { error } = await supabase
          .from('niveis_formacao')
          .update(nivelData)
          .eq('id', editingNivel.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Nível de formação atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('niveis_formacao')
          .insert([nivelData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Nível de formação criado com sucesso",
        });
      }

      setNivelDialogOpen(false);
      resetNivelForm();
      loadData();

    } catch (error: any) {
      console.error('Erro ao salvar nível:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar nível de formação",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleNivelStatus = async (nivel: NivelFormacao) => {
    try {
      const { error } = await supabase
        .from('niveis_formacao')
        .update({ ativo: !nivel.ativo })
        .eq('id', nivel.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Nível ${!nivel.ativo ? 'ativado' : 'desativado'} com sucesso`,
      });

      loadData();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do nível",
        variant: "destructive",
      });
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

  const addCompetencia = (tipo: 'nivel' | 'especializacao', competencia: string) => {
    if (!competencia.trim()) return;
    
    if (tipo === 'nivel') {
      setNivelForm({
        ...nivelForm,
        competencias: [...nivelForm.competencias, competencia.trim()]
      });
    } else {
      setEspecializacaoForm({
        ...especializacaoForm,
        competencias: [...especializacaoForm.competencias, competencia.trim()]
      });
    }
  };

  const removeCompetencia = (tipo: 'nivel' | 'especializacao', index: number) => {
    if (tipo === 'nivel') {
      setNivelForm({
        ...nivelForm,
        competencias: nivelForm.competencias.filter((_, i) => i !== index)
      });
    } else {
      setEspecializacaoForm({
        ...especializacaoForm,
        competencias: especializacaoForm.competencias.filter((_, i) => i !== index)
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando configurações...</p>
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
              <Settings className="h-8 w-8 mr-3 text-blue-600" />
              Configurações de Voluntários
            </h1>
            <p className="text-gray-600 mt-1">
              Gerir níveis de formação, especializações e conquistas
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

        <Tabs defaultValue="niveis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="niveis">Níveis de Formação</TabsTrigger>
            <TabsTrigger value="especializacoes">Especializações</TabsTrigger>
            <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
          </TabsList>

          {/* Tab: Níveis de Formação */}
          <TabsContent value="niveis">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Níveis de Formação Valentão</CardTitle>
                    <CardDescription>
                      Gerir os níveis de formação do sistema (FORMA BASE, N1, N2, N3)
                    </CardDescription>
                  </div>
                  <Dialog open={nivelDialogOpen} onOpenChange={setNivelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => openNivelDialog()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Nível
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingNivel ? 'Editar Nível de Formação' : 'Novo Nível de Formação'}
                        </DialogTitle>
                        <DialogDescription>
                          Configure os detalhes do nível de formação Valentão
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleSaveNivel} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Código */}
                          <div>
                            <Label htmlFor="codigo">Código *</Label>
                            <Input
                              id="codigo"
                              value={nivelForm.codigo}
                              onChange={(e) => setNivelForm({...nivelForm, codigo: e.target.value})}
                              placeholder="FORMA_N1"
                              required
                            />
                          </div>

                          {/* Nome */}
                          <div>
                            <Label htmlFor="nome">Nome *</Label>
                            <Input
                              id="nome"
                              value={nivelForm.nome}
                              onChange={(e) => setNivelForm({...nivelForm, nome: e.target.value})}
                              placeholder="FORMA N1"
                              required
                            />
                          </div>

                          {/* Ordem */}
                          <div>
                            <Label htmlFor="ordem">Ordem</Label>
                            <Input
                              id="ordem"
                              type="number"
                              value={nivelForm.ordem}
                              onChange={(e) => setNivelForm({...nivelForm, ordem: parseInt(e.target.value) || 0})}
                              min="0"
                            />
                          </div>

                          {/* Tempo Mínimo */}
                          <div>
                            <Label htmlFor="tempo_minimo">Tempo Mínimo (meses)</Label>
                            <Input
                              id="tempo_minimo"
                              type="number"
                              value={nivelForm.tempo_minimo_meses}
                              onChange={(e) => setNivelForm({...nivelForm, tempo_minimo_meses: parseInt(e.target.value) || 0})}
                              min="0"
                            />
                          </div>

                          {/* Missões Mínimas */}
                          <div>
                            <Label htmlFor="missoes_minimas">Missões Mínimas</Label>
                            <Input
                              id="missoes_minimas"
                              type="number"
                              value={nivelForm.missoes_minimas}
                              onChange={(e) => setNivelForm({...nivelForm, missoes_minimas: parseInt(e.target.value) || 0})}
                              min="0"
                            />
                          </div>

                          {/* Cor */}
                          <div>
                            <Label htmlFor="cor">Cor</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="cor"
                                type="color"
                                value={nivelForm.cor}
                                onChange={(e) => setNivelForm({...nivelForm, cor: e.target.value})}
                                className="w-16 h-10"
                              />
                              <Input
                                value={nivelForm.cor}
                                onChange={(e) => setNivelForm({...nivelForm, cor: e.target.value})}
                                placeholder="#6B7280"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          {/* Descrição */}
                          <div className="md:col-span-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                              id="descricao"
                              value={nivelForm.descricao}
                              onChange={(e) => setNivelForm({...nivelForm, descricao: e.target.value})}
                              placeholder="Descrição do nível de formação"
                              rows={3}
                            />
                          </div>

                          {/* Competências */}
                          <div className="md:col-span-2">
                            <Label>Competências</Label>
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Nova competência"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addCompetencia('nivel', e.currentTarget.value);
                                      e.currentTarget.value = '';
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    addCompetencia('nivel', input.value);
                                    input.value = '';
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {nivelForm.competencias.map((competencia, index) => (
                                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                    <span>{competencia}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeCompetencia('nivel', index)}
                                      className="ml-1 text-red-500 hover:text-red-700"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setNivelDialogOpen(false)}
                            disabled={submitting}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {editingNivel ? 'Atualizar' : 'Criar'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nível</TableHead>
                        <TableHead>Ordem</TableHead>
                        <TableHead>Requisitos</TableHead>
                        <TableHead>Competências</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {niveisFormacao.map((nivel) => (
                        <TableRow key={nivel.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div 
                                className="p-2 rounded-full"
                                style={{ backgroundColor: `${nivel.cor}20` }}
                              >
                                <span style={{ color: nivel.cor }}>
                                  {getNivelIcon(nivel.codigo)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{nivel.nome}</p>
                                <p className="text-sm text-gray-500">{nivel.codigo}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              #{nivel.ordem}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{nivel.tempo_minimo_meses} meses</p>
                              <p>{nivel.missoes_minimas} missões</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {nivel.competencias.slice(0, 2).map((competencia, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {competencia}
                                </Badge>
                              ))}
                              {nivel.competencias.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{nivel.competencias.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {nivel.ativo ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Inativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openNivelDialog(nivel)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleNivelStatus(nivel)}
                                className={nivel.ativo ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                              >
                                {nivel.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Especializações */}
          <TabsContent value="especializacoes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Especializações</CardTitle>
                    <CardDescription>
                      Gerir especializações disponíveis (FORMA-VET, FORMA-RESCUE)
                    </CardDescription>
                  </div>
                  <Button onClick={() => openEspecializacaoDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Especialização
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {especializacoes.map((especializacao) => (
                    <Card key={especializacao.id} className="border-2" style={{ borderColor: `${especializacao.cor}40` }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="p-2 rounded-full"
                              style={{ backgroundColor: `${especializacao.cor}20` }}
                            >
                              <span style={{ color: especializacao.cor }}>
                                {getEspecializacaoIcon(especializacao.codigo)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{especializacao.nome}</h3>
                              <p className="text-xs text-gray-500">{especializacao.codigo}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEspecializacaoDialog(especializacao)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 mb-3">{especializacao.descricao}</p>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {especializacao.competencias.slice(0, 3).map((competencia, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {competencia}
                              </Badge>
                            ))}
                            {especializacao.competencias.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{especializacao.competencias.length - 3}
                              </Badge>
                            )}
                          </div>
                          {especializacao.ativo ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Conquistas */}
          <TabsContent value="conquistas">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Conquistas e Medalhas</CardTitle>
                    <CardDescription>
                      Gerir conquistas e medalhas do sistema de gamificação
                    </CardDescription>
                  </div>
                  <Button onClick={() => openConquistaDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conquista
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conquistas.map((conquista) => (
                    <Card key={conquista.id} className="border-2" style={{ borderColor: `${conquista.cor}40` }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="p-2 rounded-full"
                              style={{ backgroundColor: `${conquista.cor}20` }}
                            >
                              <Award className="h-4 w-4" style={{ color: conquista.cor }} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{conquista.nome}</h3>
                              <Badge variant="outline" className="text-xs">
                                {conquista.categoria}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openConquistaDialog(conquista)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 mb-3">{conquista.descricao}</p>
                        <div className="space-y-2">
                          {conquista.pontos_requeridos > 0 && (
                            <div className="text-xs text-gray-500">
                              Pontos: {conquista.pontos_requeridos}
                            </div>
                          )}
                          {conquista.ativo ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VoluntariosConfiguracoes;