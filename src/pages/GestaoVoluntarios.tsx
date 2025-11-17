import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const GestaoVoluntarios = () => {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchVoluntarios();
  }, []);

  const fetchVoluntarios = async () => {
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .order('nome');

      if (error) throw error;
      setVoluntarios(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar voluntários",
        description: error.message,
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
      if (editingVoluntario) {
        // Atualizar voluntário existente
        const { error } = await supabase
          .from('voluntarios_2025_11_16_18_00')
          .update({
            nome: formData.nome,
            email: formData.email || null,
            telefone: formData.telefone || null,
            especialidade: formData.especialidade,
            observacoes: formData.observacoes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingVoluntario.id);

        if (error) throw error;

        toast({
          title: "Voluntário atualizado",
          description: `${formData.nome} foi atualizado com sucesso.`,
        });
      } else {
        // Criar novo voluntário
        const { error } = await supabase
          .from('voluntarios')
          .insert({
            nome: formData.nome,
            email: formData.email || null,
            telefone: formData.telefone || null,
            especialidade: formData.especialidade,
            observacoes: formData.observacoes || null
          });

        if (error) throw error;

        toast({
          title: "Voluntário cadastrado",
          description: `${formData.nome} foi cadastrado com sucesso.`,
        });
      }

      setDialogOpen(false);
      setEditingVoluntario(null);
      setFormData({ nome: "", email: "", telefone: "", especialidade: "", observacoes: "" });
      fetchVoluntarios();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
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

  const toggleAtivo = async (voluntario: Voluntario) => {
    try {
      const { error } = await supabase
        .from('voluntarios')
        .update({ 
          ativo: !voluntario.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', voluntario.id);

      if (error) throw error;

      toast({
        title: voluntario.ativo ? "Voluntário desativado" : "Voluntário ativado",
        description: `${voluntario.nome} foi ${voluntario.ativo ? 'desativado' : 'ativado'} com sucesso.`,
      });

      fetchVoluntarios();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getEspecialidadeColor = (especialidade: string) => {
    switch (especialidade) {
      case "Veterinário": return "bg-red-500 text-white";
      case "Cuidador": return "bg-green-500 text-white";
      case "Transporte": return "bg-blue-500 text-white";
      case "Administrativo": return "bg-purple-500 text-white";
      case "Geral": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">A carregar voluntários...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/images/BackgroundEraser_20250411_205630024.png" 
            alt="Valentão ao Resgate" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold">Gestão de Voluntários - Valentão ao Resgate</h1>
            <p className="text-muted-foreground">
              Gerir voluntários e suas especialidades - Total: {voluntarios.length}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingVoluntario(null);
                setFormData({ nome: "", email: "", telefone: "", especialidade: "", observacoes: "" });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Voluntário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVoluntario ? "Editar Voluntário" : "Novo Voluntário"}
                </DialogTitle>
                <DialogDescription>
                  {editingVoluntario ? "Atualizar informações do voluntário" : "Cadastrar novo voluntário na associação"}
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
                    placeholder="Número de telefone"
                  />
                </div>
                
                <div>
                  <Label htmlFor="especialidade">Especialidade *</Label>
                  <Select value={formData.especialidade} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, especialidade: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar especialidade" />
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
                    placeholder="Informações adicionais sobre o voluntário"
                    rows={3}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingVoluntario ? "Atualizar" : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" asChild>
            <Link to="/">Voltar</Link>
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {voluntarios.filter(v => v.ativo).length}
              </div>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {voluntarios.filter(v => v.especialidade === 'Veterinário').length}
              </div>
              <p className="text-sm text-muted-foreground">Veterinários</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {voluntarios.filter(v => v.especialidade === 'Cuidador').length}
              </div>
              <p className="text-sm text-muted-foreground">Cuidadores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {voluntarios.filter(v => v.especialidade === 'Transporte').length}
              </div>
              <p className="text-sm text-muted-foreground">Transporte</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {voluntarios.length}
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Voluntários */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {voluntarios.map((voluntario) => (
          <Card key={voluntario.id} className={`hover:shadow-lg transition-shadow ${!voluntario.ativo ? 'opacity-75' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{voluntario.nome}</CardTitle>
                  <CardDescription>
                    {voluntario.email && (
                      <div className="text-sm">{voluntario.email}</div>
                    )}
                    {voluntario.telefone && (
                      <div className="text-sm">{voluntario.telefone}</div>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getEspecialidadeColor(voluntario.especialidade)}>
                    {voluntario.especialidade}
                  </Badge>
                  {voluntario.ativo ? (
                    <UserCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <UserX className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Início:</strong> {new Date(voluntario.data_inicio).toLocaleDateString('pt-PT')}</p>
                {voluntario.observacoes && (
                  <p><strong>Observações:</strong> {voluntario.observacoes}</p>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(voluntario)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <Button
                  variant={voluntario.ativo ? "destructive" : "default"}
                  size="sm"
                  onClick={() => toggleAtivo(voluntario)}
                >
                  {voluntario.ativo ? (
                    <>
                      <UserX className="h-4 w-4 mr-1" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-1" />
                      Ativar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {voluntarios.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum voluntário cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece cadastrando os voluntários da associação.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Primeiro Voluntário
          </Button>
        </div>
      )}
    </div>
  );
};

export default GestaoVoluntarios;