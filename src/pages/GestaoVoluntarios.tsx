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
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const GestaoVoluntarios = () => {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVoluntario, setEditingVoluntario] = useState<Voluntario | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    especialidade: "",
    observacoes: ""
  });
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Verificar se o utilizador tem permissão de administrador
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem aceder à gestão de voluntários
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/">
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
    fetchVoluntarios();
  }, []);

  const fetchVoluntarios = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando voluntários...');

      // CORREÇÃO: Usar nome correto da tabela 'voluntarios'
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .order('nome');

      if (error) {
        console.error('❌ Erro ao carregar voluntários:', error);
        throw error;
      }

      console.log('✅ Voluntários carregados:', data?.length || 0);
      setVoluntarios(data || []);
    } catch (error: any) {
      console.error('❌ Erro geral ao carregar voluntários:', error);
      toast({
        title: "Erro ao carregar voluntários",
        description: error.message || "Não foi possível carregar a lista de voluntários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.especialidade) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e especialidade são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      console.log('👤 Processando voluntário:', formData);

      if (editingVoluntario) {
        // CORREÇÃO: Usar nome correto da tabela 'voluntarios'
        console.log('✏️ Atualizando voluntário:', editingVoluntario.id);
        const { error } = await supabase
          .from('voluntarios')
          .update({
            nome: formData.nome,
            email: formData.email || null,
            telefone: formData.telefone || null,
            especialidade: formData.especialidade,
            observacoes: formData.observacoes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingVoluntario.id);

        if (error) {
          console.error('❌ Erro ao atualizar voluntário:', error);
          throw error;
        }

        console.log('✅ Voluntário atualizado com sucesso');
        toast({
          title: "✅ Voluntário atualizado",
          description: `${formData.nome} foi atualizado com sucesso.`,
        });
      } else {
        // Criar novo voluntário
        console.log('➕ Criando novo voluntário');
        const { error } = await supabase
          .from('voluntarios')
          .insert({
            nome: formData.nome,
            email: formData.email || null,
            telefone: formData.telefone || null,
            especialidade: formData.especialidade,
            observacoes: formData.observacoes || null
          });

        if (error) {
          console.error('❌ Erro ao criar voluntário:', error);
          throw error;
        }

        console.log('✅ Voluntário criado com sucesso');
        toast({
          title: "✅ Voluntário registado",
          description: `${formData.nome} foi registado com sucesso.`,
        });
      }

      setDialogOpen(false);
      setEditingVoluntario(null);
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        especialidade: "",
        observacoes: ""
      });
      
      console.log('🔄 Recarregando lista de voluntários...');
      await fetchVoluntarios();

    } catch (error: any) {
      console.error('❌ Erro ao processar voluntário:', error);
      toast({
        title: "Erro ao processar voluntário",
        description: error.message || "Não foi possível processar o voluntário",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (voluntario: Voluntario) => {
    setEditingVoluntario(voluntario);
    setFormData({
      nome: voluntario.nome,
      email: voluntario.email || "",
      telefone: voluntario.telefone || "",
      especialidade: voluntario.especialidade,
      observacoes: voluntario.observacoes || ""
    });
    setDialogOpen(true);
  };

  const handleToggleStatus = async (voluntario: Voluntario) => {
    try {
      console.log(`🔄 Alterando status do voluntário ${voluntario.nome}...`);
      
      // CORREÇÃO: Usar nome correto da tabela 'voluntarios'
      const { error } = await supabase
        .from('voluntarios')
        .update({ 
          ativo: !voluntario.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', voluntario.id);

      if (error) {
        console.error('❌ Erro ao alterar status:', error);
        throw error;
      }

      console.log('✅ Status alterado com sucesso');
      toast({
        title: "Status alterado",
        description: `${voluntario.nome} foi ${!voluntario.ativo ? 'ativado' : 'desativado'} com sucesso.`,
      });

      await fetchVoluntarios();
    } catch (error: any) {
      console.error('❌ Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do voluntário",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (voluntario: Voluntario) => {
    // Confirmação antes de eliminar
    const confirmDelete = confirm(
      `Tem certeza que deseja eliminar o voluntário "${voluntario.nome}"?\n\n` +
      `Esta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      console.log(`🗑️ Eliminando voluntário ${voluntario.nome}...`);
      
      // Verificar se há referências antes de eliminar
      console.log('🔍 Verificando referências...');
      
      const { data: intervencoes, error: checkError } = await supabase
        .from('intervencoes')
        .select('id')
        .eq('veterinario', voluntario.nome)
        .limit(1);
      
      if (checkError) {
        console.error('❌ Erro ao verificar referências:', checkError);
      }
      
      if (intervencoes && intervencoes.length > 0) {
        toast({
          title: "Não é possível eliminar",
          description: `O voluntário ${voluntario.nome} tem intervenções associadas. Desative-o em vez de eliminar.`,
          variant: "destructive",
        });
        return;
      }
      
      // Eliminar o voluntário
      const { error } = await supabase
        .from('voluntarios')
        .delete()
        .eq('id', voluntario.id);

      if (error) {
        console.error('❌ Erro ao eliminar voluntário:', error);
        
        // Tratar erros específicos
        if (error.code === '23503') {
          toast({
            title: "Não é possível eliminar",
            description: `O voluntário ${voluntario.nome} tem registos associados. Desative-o em vez de eliminar.`,
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }

      console.log('✅ Voluntário eliminado com sucesso');
      toast({
        title: "Voluntário eliminado",
        description: `${voluntario.nome} foi eliminado com sucesso.`,
      });

      await fetchVoluntarios();
    } catch (error: any) {
      console.error('❌ Erro ao eliminar voluntário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar o voluntário",
        variant: "destructive",
      });
    }
  };

  const getEspecialidadeColor = (especialidade: string) => {
    switch (especialidade) {
      case 'Veterinário': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cuidador': return 'bg-green-100 text-green-800 border-green-200';
      case 'Transporte': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Administrativo': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Geral': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar gestão de voluntários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Gestão de Voluntários</h1>
                  <p className="text-sm text-gray-500">
                    {voluntarios.length} voluntários registados • {voluntarios.filter(v => v.ativo).length} ativos
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={fetchVoluntarios} variant="outline" size="sm" disabled={loading}>
                <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : 'hidden'}`} />
                Atualizar
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Voluntário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingVoluntario ? 'Editar Voluntário' : 'Novo Voluntário'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingVoluntario 
                        ? 'Atualize as informações do voluntário'
                        : 'Adicione um novo voluntário ao sistema'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Nome completo do voluntário"
                        required
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                          placeholder="912 345 678"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="especialidade">Especialidade *</Label>
                      <Select 
                        value={formData.especialidade} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, especialidade: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a especialidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Veterinário">Veterinário</SelectItem>
                          <SelectItem value="Cuidador">Cuidador</SelectItem>
                          <SelectItem value="Transporte">Transporte</SelectItem>
                          <SelectItem value="Administrativo">Administrativo</SelectItem>
                          <SelectItem value="Geral">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        placeholder="Observações adicionais sobre o voluntário"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setDialogOpen(false);
                          setEditingVoluntario(null);
                          setFormData({
                            nome: "",
                            email: "",
                            telefone: "",
                            especialidade: "",
                            observacoes: ""
                          });
                        }}
                        disabled={submitting}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingVoluntario ? 'A atualizar...' : 'A registar...'}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {editingVoluntario ? 'Atualizar' : 'Registar'}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{voluntarios.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {voluntarios.filter(v => v.ativo).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inativos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {voluntarios.filter(v => !v.ativo).length}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Veterinários</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {voluntarios.filter(v => v.especialidade === 'Veterinário').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Voluntários */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Voluntários</CardTitle>
            <CardDescription>
              Gestão completa dos voluntários da associação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {voluntarios.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum voluntário registado
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece adicionando o primeiro voluntário ao sistema
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Voluntário
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead className="w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voluntarios.map((voluntario) => (
                      <TableRow key={voluntario.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{voluntario.nome}</div>
                            {voluntario.observacoes && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {voluntario.observacoes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {voluntario.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-3 w-3 mr-1" />
                                {voluntario.email}
                              </div>
                            )}
                            {voluntario.telefone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-3 w-3 mr-1" />
                                {voluntario.telefone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEspecialidadeColor(voluntario.especialidade)}>
                            {voluntario.especialidade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              voluntario.ativo 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {voluntario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(voluntario.data_inicio)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(voluntario)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(voluntario)}
                            >
                              {voluntario.ativo ? (
                                <UserX className="h-4 w-4 text-red-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminar Voluntário</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja eliminar {voluntario.nome}? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(voluntario)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
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