import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Shield,
  Clock,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  UserCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface TipoResponsabilidade {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const GestaoResponsabilidades = () => {
  const [tiposResponsabilidade, setTiposResponsabilidade] = useState<TipoResponsabilidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editandoTipo, setEditandoTipo] = useState<TipoResponsabilidade | null>(null);
  const [novoTipoOpen, setNovoTipoOpen] = useState(false);
  const [editarTipoOpen, setEditarTipoOpen] = useState(false);
  
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Formulário para novo tipo
  const [tipoForm, setTipoForm] = useState({
    nome: '',
    descricao: '',
    ativo: true
  });

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem gerir tipos de responsabilidades
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Principal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadTiposResponsabilidade();
  }, []);

  const loadTiposResponsabilidade = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tipos_responsabilidades')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTiposResponsabilidade(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar tipos de responsabilidades:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tipos de responsabilidades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTipoForm({
      nome: '',
      descricao: '',
      ativo: true
    });
  };

  const handleSalvarTipo = async () => {
    try {
      if (!tipoForm.nome.trim()) {
        toast({
          title: "Erro",
          description: "O nome do tipo de responsabilidade é obrigatório",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('tipos_responsabilidades')
        .insert([tipoForm]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tipo de responsabilidade criado com sucesso",
      });

      setNovoTipoOpen(false);
      resetForm();
      loadTiposResponsabilidade();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar tipo de responsabilidade",
        variant: "destructive",
      });
    }
  };

  const handleEditarTipo = async () => {
    try {
      if (!editandoTipo || !editandoTipo.nome.trim()) {
        toast({
          title: "Erro",
          description: "O nome do tipo de responsabilidade é obrigatório",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('tipos_responsabilidades')
        .update({
          nome: editandoTipo.nome,
          descricao: editandoTipo.descricao,
          ativo: editandoTipo.ativo
        })
        .eq('id', editandoTipo.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tipo de responsabilidade atualizado com sucesso",
      });

      setEditarTipoOpen(false);
      setEditandoTipo(null);
      loadTiposResponsabilidade();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar tipo de responsabilidade",
        variant: "destructive",
      });
    }
  };

  const handleToggleAtivo = async (tipo: TipoResponsabilidade) => {
    try {
      const { error } = await supabase
        .from('tipos_responsabilidades')
        .update({ ativo: !tipo.ativo })
        .eq('id', tipo.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Tipo ${!tipo.ativo ? 'ativado' : 'desativado'} com sucesso`,
      });

      loadTiposResponsabilidade();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do tipo",
        variant: "destructive",
      });
    }
  };

  const handleRemoverTipo = async (tipo: TipoResponsabilidade) => {
    if (!confirm(`Tem certeza que deseja remover o tipo '${tipo.nome}'? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tipos_responsabilidades')
        .delete()
        .eq('id', tipo.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tipo de responsabilidade removido com sucesso",
      });

      loadTiposResponsabilidade();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover tipo de responsabilidade",
        variant: "destructive",
      });
    }
  };

  const tiposFiltrados = tiposResponsabilidade.filter(tipo =>
    tipo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tipo.descricao && tipo.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar tipos de responsabilidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/configuracoes">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 mr-3 text-blue-600" />
                Gestão de Tipos de Responsabilidades
              </h1>
              <p className="text-gray-600 mt-1">
                Gerir tipos de responsabilidades para voluntários
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={loadTiposResponsabilidade} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Dialog open={novoTipoOpen} onOpenChange={setNovoTipoOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Tipo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Tipo de Responsabilidade</DialogTitle>
                  <DialogDescription>
                    Adicione um novo tipo de responsabilidade ao sistema
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={tipoForm.nome}
                      onChange={(e) => setTipoForm({...tipoForm, nome: e.target.value})}
                      placeholder="Ex: Cuidador Principal"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={tipoForm.descricao}
                      onChange={(e) => setTipoForm({...tipoForm, descricao: e.target.value})}
                      placeholder="Descrição do tipo de responsabilidade..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={tipoForm.ativo}
                      onCheckedChange={(checked) => setTipoForm({...tipoForm, ativo: checked})}
                    />
                    <Label>Tipo ativo</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setNovoTipoOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSalvarTipo}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Tipo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tipos</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tiposResponsabilidade.length}</div>
              <p className="text-xs text-muted-foreground">
                {tiposResponsabilidade.filter(t => t.ativo).length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipos Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tiposResponsabilidade.filter(t => t.ativo).length}</div>
              <p className="text-xs text-muted-foreground">
                Disponíveis para uso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipos Inativos</CardTitle>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tiposResponsabilidade.filter(t => !t.ativo).length}</div>
              <p className="text-xs text-muted-foreground">
                Desativados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Pesquisar tipos de responsabilidades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Tipos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiposFiltrados.map((tipo) => (
            <Card key={tipo.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{tipo.nome}</CardTitle>
                    {tipo.descricao && (
                      <p className="text-sm text-gray-500 mt-1">{tipo.descricao}</p>
                    )}
                  </div>
                  <Badge variant={tipo.ativo ? "default" : "secondary"}>
                    {tipo.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-gray-500">
                  Criado em: {new Date(tipo.created_at).toLocaleDateString('pt-PT')}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditandoTipo(tipo);
                        setEditarTipoOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleAtivo(tipo)}
                    >
                      {tipo.ativo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoverTipo(tipo)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tiposFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum tipo encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Comece adicionando o primeiro tipo de responsabilidade'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setNovoTipoOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Tipo
              </Button>
            )}
          </div>
        )}

        {/* Dialog de Edição */}
        <Dialog open={editarTipoOpen} onOpenChange={setEditarTipoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tipo de Responsabilidade</DialogTitle>
              <DialogDescription>
                Altere as informações do tipo de responsabilidade
              </DialogDescription>
            </DialogHeader>
            {editandoTipo && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome *</Label>
                  <Input
                    id="edit-nome"
                    value={editandoTipo.nome}
                    onChange={(e) => setEditandoTipo({...editandoTipo, nome: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-descricao">Descrição</Label>
                  <Textarea
                    id="edit-descricao"
                    value={editandoTipo.descricao || ''}
                    onChange={(e) => setEditandoTipo({...editandoTipo, descricao: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editandoTipo.ativo}
                    onCheckedChange={(checked) => setEditandoTipo({...editandoTipo, ativo: checked})}
                  />
                  <Label>Tipo ativo</Label>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setEditarTipoOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditarTipo}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default GestaoResponsabilidades;