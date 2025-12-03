import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Eye,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  Award,
  Sprout,
  Shield,
  Sword,
  Crown,
  Heart,
  Zap,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { VoluntarioValentao, NivelFormacao, Especializacao, VoluntarioFormData } from "@/types/voluntarios";

const GestaoVoluntarios = () => {
  const [voluntarios, setVoluntarios] = useState<VoluntarioValentao[]>([]);
  const [niveisFormacao, setNiveisFormacao] = useState<NivelFormacao[]>([]);
  const [especializacoes, setEspecializacoes] = useState<Especializacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVoluntario, setEditingVoluntario] = useState<VoluntarioValentao | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  const [nivelFilter, setNivelFilter] = useState<string>("todos");
  
  const [formData, setFormData] = useState<VoluntarioFormData>({
    nome: "",
    email: "",
    telefone: "",
    morada: "",
    nif: "",
    data_nascimento: "",
    profissao: "",
    nivel_formacao_atual: "",
    observacoes: ""
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
              Apenas administradores podem gerir voluntários
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

      // Carregar voluntários (sem join problemático)
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('*')
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

      setVoluntarios(voluntariosData || []);
      setNiveisFormacao(niveisData || []);
      setEspecializacoes(especializacoesData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos voluntários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      morada: "",
      nif: "",
      data_nascimento: "",
      profissao: "",
      nivel_formacao_atual: "",
      observacoes: ""
    });
    setEditingVoluntario(null);
  };

  const openDialog = (voluntario?: VoluntarioValentao) => {
    if (voluntario) {
      setEditingVoluntario(voluntario);
      setFormData({
        nome: voluntario.nome,
        email: voluntario.email,
        telefone: voluntario.telefone || "",
        morada: voluntario.morada || "",
        nif: voluntario.nif || "",
        data_nascimento: voluntario.data_nascimento || "",
        profissao: voluntario.profissao || "",
        nivel_formacao_atual: voluntario.nivel_formacao_atual || "",
        observacoes: voluntario.observacoes || ""
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const voluntarioData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone?.trim() || null,
        morada: formData.morada?.trim() || null,
        nif: formData.nif?.trim() || null,
        data_nascimento: formData.data_nascimento || null,
        profissao: formData.profissao?.trim() || null,
        nivel_formacao_atual: formData.nivel_formacao_atual || null,
        observacoes: formData.observacoes?.trim() || null,
        ativo: true
      };

      if (editingVoluntario) {
        // Atualizar voluntário existente
        const { error } = await supabase
          .from('voluntarios')
          .update(voluntarioData)
          .eq('id', editingVoluntario.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Voluntário atualizado com sucesso",
        });
      } else {
        // Criar novo voluntário
        const { error } = await supabase
          .from('voluntarios')
          .insert([voluntarioData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Voluntário criado com sucesso",
        });
      }

      setDialogOpen(false);
      resetForm();
      loadData();

    } catch (error: any) {
      console.error('Erro ao salvar voluntário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar voluntário",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (voluntario: VoluntarioValentao) => {
    try {
      const novoStatus = !voluntario.ativo;
      const updateData: any = { ativo: novoStatus };
      
      if (!novoStatus) {
        updateData.data_inativacao = new Date().toISOString().split('T')[0];
        updateData.motivo_inativacao = "Inativado via sistema";
      } else {
        updateData.data_inativacao = null;
        updateData.motivo_inativacao = null;
      }

      const { error } = await supabase
        .from('voluntarios')
        .update(updateData)
        .eq('id', voluntario.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Voluntário ${novoStatus ? 'ativado' : 'inativado'} com sucesso`,
      });

      loadData();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do voluntário",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (voluntario: VoluntarioValentao) => {
    try {
      const { error } = await supabase
        .from('voluntarios')
        .delete()
        .eq('id', voluntario.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Voluntário removido com sucesso",
      });

      loadData();
    } catch (error: any) {
      console.error('Erro ao remover voluntário:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover voluntário",
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

  const getNivelBadge = (nivel?: NivelFormacao) => {
    if (!nivel) {
      return (
        <Badge variant="secondary" className="text-xs">
          <User className="h-3 w-3 mr-1" />
          Sem nível
        </Badge>
      );
    }

    return (
      <Badge 
        className="text-xs text-white"
        style={{ backgroundColor: nivel.cor }}
      >
        <span style={{ color: 'white' }} className="mr-1">
          {getNivelIcon(nivel.codigo)}
        </span>
        {nivel.nome}
      </Badge>
    );
  };

  // Filtrar voluntários
  const voluntariosFiltrados = voluntarios.filter(voluntario => {
    const matchesSearch = voluntario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voluntario.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || 
                         (statusFilter === "ativo" && voluntario.ativo) ||
                         (statusFilter === "inativo" && !voluntario.ativo);
    
    const matchesNivel = nivelFilter === "todos" || 
                        voluntario.nivel_formacao_atual === nivelFilter;

    return matchesSearch && matchesStatus && matchesNivel;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando voluntários...</p>
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
              <Users className="h-8 w-8 mr-3 text-blue-600" />
              Gestão de Voluntários
            </h1>
            <p className="text-gray-600 mt-1">
              Gerir voluntários do sistema Valentão
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
                <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Voluntário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingVoluntario ? 'Editar Voluntário' : 'Novo Voluntário'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingVoluntario 
                      ? 'Edite as informações do voluntário' 
                      : 'Adicione um novo voluntário ao sistema Valentão'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Nome */}
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        placeholder="Nome completo"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@exemplo.com"
                        required
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                        placeholder="+351 912 345 678"
                      />
                    </div>

                    {/* NIF */}
                    <div>
                      <Label htmlFor="nif">NIF</Label>
                      <Input
                        id="nif"
                        value={formData.nif}
                        onChange={(e) => setFormData({...formData, nif: e.target.value})}
                        placeholder="123456789"
                      />
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                      <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                      <Input
                        id="data_nascimento"
                        type="date"
                        value={formData.data_nascimento}
                        onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                      />
                    </div>

                    {/* Profissão */}
                    <div>
                      <Label htmlFor="profissao">Profissão</Label>
                      <Input
                        id="profissao"
                        value={formData.profissao}
                        onChange={(e) => setFormData({...formData, profissao: e.target.value})}
                        placeholder="Engenheiro, Professor, etc."
                      />
                    </div>

                    {/* Nível de Formação */}
                    <div className="md:col-span-2">
                      <Label htmlFor="nivel_formacao">Nível de Formação Valentão</Label>
                      <Select 
                        value={formData.nivel_formacao_atual} 
                        onValueChange={(value) => setFormData({...formData, nivel_formacao_atual: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar nível de formação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sem nível atribuído</SelectItem>
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

                    {/* Morada */}
                    <div className="md:col-span-2">
                      <Label htmlFor="morada">Morada</Label>
                      <Input
                        id="morada"
                        value={formData.morada}
                        onChange={(e) => setFormData({...formData, morada: e.target.value})}
                        placeholder="Rua, número, código postal, cidade"
                      />
                    </div>

                    {/* Observações */}
                    <div className="md:col-span-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                        placeholder="Observações adicionais sobre o voluntário"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingVoluntario ? 'Atualizar' : 'Criar'} Voluntário
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Pesquisa */}
              <div>
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nível de Formação */}
              <div>
                <Label htmlFor="nivel">Nível de Formação</Label>
                <Select value={nivelFilter} onValueChange={setNivelFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os níveis</SelectItem>
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

              {/* Limpar Filtros */}
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("todos");
                    setNivelFilter("todos");
                  }}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{voluntarios.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {voluntarios.filter(v => v.ativo).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inativos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {voluntarios.filter(v => !v.ativo).length}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Filtrados</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {voluntariosFiltrados.length}
                  </p>
                </div>
                <Filter className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Voluntários */}
        <Card>
          <CardHeader>
            <CardTitle>Voluntários ({voluntariosFiltrados.length})</CardTitle>
            <CardDescription>
              Lista de todos os voluntários do sistema Valentão
            </CardDescription>
          </CardHeader>
          <CardContent>
            {voluntariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum voluntário encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  {voluntarios.length === 0 
                    ? "Ainda não há voluntários registados no sistema."
                    : "Nenhum voluntário corresponde aos filtros aplicados."
                  }
                </p>
                {voluntarios.length === 0 && (
                  <Button onClick={() => openDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Voluntário
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Nível Formação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Ingresso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voluntariosFiltrados.map((voluntario) => (
                      <TableRow key={voluntario.id}>
                        <TableCell className="font-medium">
                          {voluntario.nome}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{voluntario.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {voluntario.telefone ? (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{voluntario.telefone}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getNivelBadge(voluntario.nivel_formacao)}
                        </TableCell>
                        <TableCell>
                          {voluntario.ativo ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <UserX className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(voluntario.data_ingresso).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            
                            {/* Ver Perfil */}
                            <Link to={`/voluntarios/perfil/${voluntario.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            {/* Editar */}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDialog(voluntario)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {/* Toggle Status */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(voluntario)}
                              className={voluntario.ativo ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                            >
                              {voluntario.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>

                            {/* Remover */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Voluntário</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem a certeza que deseja remover o voluntário <strong>{voluntario.nome}</strong>? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(voluntario)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestaoVoluntarios;