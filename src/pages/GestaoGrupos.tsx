import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  MapPin,
  Calendar,
  Phone,
  User,
  PawPrint,
  Cat,
  Dog,
  Loader2,
  AlertCircle,
  Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Grupo, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import LogotipoValentao from "@/components/LogotipoValentao";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const GestaoGrupos = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [tiposGrupos, setTiposGrupos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados do formulário
  const [grupoForm, setGrupoForm] = useState({
    nome: "",
    tipo: "",
    localizacao: "",
    endereco: "",
    coordenadas_latitude: "",
    coordenadas_longitude: "",
    localidade: "",
    concelho: "",
    distrito: "",
    responsavel_voluntario_id: "",
    cuidador_informal: "",
    contacto_cuidador: "",
    observacoes: ""
  });

  const fetchTiposGrupos = async () => {
    try {
      console.log('🏷️ [TIPOS] Carregando tipos de grupos...');
      const { data, error } = await supabase
        .from('tipos_grupos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ [TIPOS] Erro ao carregar tipos:', error);
        throw error;
      }

      console.log('✅ [TIPOS] Tipos carregados:', data?.length || 0);
      setTiposGrupos(data || []);
    } catch (error: any) {
      console.error('💥 [TIPOS] Erro geral:', error);
    }
  };

  useEffect(() => {
    fetchGrupos();
    fetchVoluntarios();
    fetchTiposGrupos();
  }, []);

  const fetchGrupos = async () => {
    try {
      setLoading(true);
      console.log('🐕 [GRUPOS] Carregando grupos...');

      const { data, error } = await supabase
        .from('grupos')
        .select(`
          *,
          voluntarios(nome)
        `)
        .eq('ativo', true)
        .order('tipo')
        .order('nome');

      if (error) {
        console.error('❌ [GRUPOS] Erro ao carregar grupos:', error);
        throw error;
      }

      // Buscar contagem de animais para cada grupo
      const gruposComContagem = await Promise.all(
        (data || []).map(async (grupo) => {
          const { count } = await supabase
            .from('animais')
            .select('*', { count: 'exact', head: true })
            .eq('grupo_id', grupo.id)
            .eq('arquivado', false);

          return {
            ...grupo,
            total_animais: count || 0,
            responsavel_nome: grupo.voluntarios?.nome || grupo.cuidador_informal
          };
        })
      );

      console.log('✅ [GRUPOS] Grupos carregados:', gruposComContagem.length);
      setGrupos(gruposComContagem);
    } catch (error: any) {
      console.error('💥 [GRUPOS] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os grupos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVoluntarios = async () => {
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setVoluntarios(data || []);
    } catch (error: any) {
      console.error('❌ [VOLUNTÁRIOS] Erro ao carregar voluntários:', error);
    }
  };

  const resetForm = () => {
    setGrupoForm({
      nome: "",
      tipo: "",
      localizacao: "",
      endereco: "",
      coordenadas_latitude: "",
      coordenadas_longitude: "",
      localidade: "",
      concelho: "",
      distrito: "",
      responsavel_voluntario_id: "",
      cuidador_informal: "",
      contacto_cuidador: "",
      observacoes: ""
    });
    setEditingGrupo(null);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (grupo: Grupo) => {
    setEditingGrupo(grupo);
    setGrupoForm({
      nome: grupo.nome,
      tipo: grupo.tipo,
      localizacao: grupo.localizacao || "",
      endereco: grupo.endereco || "",
      coordenadas_latitude: grupo.coordenadas_latitude?.toString() || "",
      coordenadas_longitude: grupo.coordenadas_longitude?.toString() || "",
      localidade: grupo.localidade || "",
      concelho: grupo.concelho || "",
      distrito: grupo.distrito || "",
      responsavel_voluntario_id: grupo.responsavel_voluntario_id || "",
      cuidador_informal: grupo.cuidador_informal || "",
      contacto_cuidador: grupo.contacto_cuidador || "",
      observacoes: grupo.observacoes || ""
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!grupoForm.nome || !grupoForm.tipo) {
      toast({
        title: "❌ Erro",
        description: "Nome e tipo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar coordenadas se fornecidas
    if (grupoForm.coordenadas_latitude && grupoForm.coordenadas_latitude.trim()) {
      const lat = parseFloat(grupoForm.coordenadas_latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        toast({
          title: "❌ Erro",
          description: "Latitude deve ser um número entre -90 e 90",
          variant: "destructive",
        });
        return;
      }
    }

    if (grupoForm.coordenadas_longitude && grupoForm.coordenadas_longitude.trim()) {
      const lng = parseFloat(grupoForm.coordenadas_longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        toast({
          title: "❌ Erro",
          description: "Longitude deve ser um número entre -180 e 180",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setSubmitting(true);
      console.log('💾 [GRUPOS] Salvando grupo:', grupoForm);

      const grupoData = {
        nome: grupoForm.nome.trim(),
        tipo: grupoForm.tipo,
        localizacao: grupoForm.localizacao.trim() || null,
        endereco: grupoForm.endereco.trim() || null,
        coordenadas_latitude: grupoForm.coordenadas_latitude.trim() ? parseFloat(grupoForm.coordenadas_latitude) : null,
        coordenadas_longitude: grupoForm.coordenadas_longitude.trim() ? parseFloat(grupoForm.coordenadas_longitude) : null,
        localidade: grupoForm.localidade.trim() || null,
        concelho: grupoForm.concelho.trim() || null,
        distrito: grupoForm.distrito.trim() || null,
        responsavel_voluntario_id: grupoForm.responsavel_voluntario_id || null,
        cuidador_informal: grupoForm.cuidador_informal.trim() || null,
        contacto_cuidador: grupoForm.contacto_cuidador.trim() || null,
        observacoes: grupoForm.observacoes.trim() || null,
        updated_at: new Date().toISOString()
      };

      if (editingGrupo) {
        // Atualizar grupo existente
        const { error } = await supabase
          .from('grupos')
          .update(grupoData)
          .eq('id', editingGrupo.id);

        if (error) throw error;

        toast({
          title: "✅ Grupo atualizado",
          description: `${grupoForm.nome} foi atualizado com sucesso`,
        });
      } else {
        // Criar novo grupo
        const { error } = await supabase
          .from('grupos')
          .insert([grupoData]);

        if (error) throw error;

        toast({
          title: "✅ Grupo criado",
          description: `${grupoForm.nome} foi criado com sucesso`,
        });
      }

      setDialogOpen(false);
      resetForm();
      await fetchGrupos();
    } catch (error: any) {
      console.error('💥 [GRUPOS] Erro ao salvar:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Não foi possível salvar o grupo",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (grupo: Grupo) => {
    const confirmDelete = confirm(
      `Tem certeza que deseja eliminar o grupo "${grupo.nome}"?\n\n` +
      `Esta ação não pode ser desfeita e todos os animais associados ficarão sem grupo.`
    );
    
    if (!confirmDelete) return;

    try {
      console.log('🗑️ [GRUPOS] Eliminando grupo:', grupo.nome);

      // Primeiro, remover associações dos animais
      await supabase
        .from('animais')
        .update({ grupo_id: null })
        .eq('grupo_id', grupo.id);

      // Depois, eliminar o grupo
      const { error } = await supabase
        .from('grupos')
        .delete()
        .eq('id', grupo.id);

      if (error) throw error;

      toast({
        title: "✅ Grupo eliminado",
        description: `${grupo.nome} foi eliminado com sucesso`,
      });

      await fetchGrupos();
    } catch (error: any) {
      console.error('💥 [GRUPOS] Erro ao eliminar:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível eliminar o grupo",
        variant: "destructive",
      });
    }
  };

  // Filtrar grupos
  const gruposFiltrados = grupos.filter(grupo => {
    const matchSearch = grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       grupo.localizacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       grupo.responsavel_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === "todos" || grupo.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'Matilha':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Dog className="h-3 w-3 mr-1" />Matilha</Badge>;
      case 'Colónia':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200"><Cat className="h-3 w-3 mr-1" />Colónia</Badge>;
      case 'Sócios':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200"><Users className="h-3 w-3 mr-1" />Sócios</Badge>;
      case 'Especiais':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200"><Heart className="h-3 w-3 mr-1" />Especiais</Badge>;
      case 'Temporários':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200"><Calendar className="h-3 w-3 mr-1" />Temporários</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><Users className="h-3 w-3 mr-1" />{tipo}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3 text-blue-600" />
              Gestão de Grupos
            </h1>
            <p className="text-gray-600 mt-1">
              Matilhas, Colónias, Sócios e grupos especiais
            </p>
          </div>
          <div className="flex space-x-3">
            {hasPermission('create') && (
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Grupo
              </Button>
            )}
            
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Principal
              </Link>
            </Button>
          </div>
        </div>
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Grupos</p>
                  <p className="text-3xl font-bold text-gray-900">{grupos.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Matilhas</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {grupos.filter(g => g.tipo === 'matilha').length}
                  </p>
                </div>
                <Dog className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Colónias</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {grupos.filter(g => g.tipo === 'colonia').length}
                  </p>
                </div>
                <Cat className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Animais</p>
                  <p className="text-3xl font-bold text-green-600">
                    {grupos.reduce((sum, g) => sum + (g.total_animais || 0), 0)}
                  </p>
                </div>
                <PawPrint className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por nome, localização ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="matilha">Matilhas</SelectItem>
                  <SelectItem value="colonia">Colónias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Grupos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Grupos ({gruposFiltrados.length})</CardTitle>
            <CardDescription>
              Gestão de matilhas e colónias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gruposFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum grupo encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterTipo !== "todos" 
                    ? "Tente ajustar os filtros de pesquisa"
                    : "Comece criando uma nova matilha ou colónia"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Animais</TableHead>
                      <TableHead>Data Criação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gruposFiltrados.map((grupo) => (
                      <TableRow key={grupo.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-medium">{grupo.nome}</div>
                              <div className="mt-1">
                                {getTipoBadge(grupo.tipo)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center text-gray-600 mb-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {grupo.localizacao || 'N/A'}
                            </div>
                            {(grupo.localidade || grupo.concelho || grupo.distrito) && (
                              <div className="text-xs text-gray-500">
                                {[grupo.localidade, grupo.concelho, grupo.distrito].filter(Boolean).join(', ')}
                              </div>
                            )}
                            {(grupo.coordenadas_latitude && grupo.coordenadas_longitude) && (
                              <div className="text-xs text-blue-600 mt-1">
                                📍 {Number(grupo.coordenadas_latitude).toFixed(6)}, {Number(grupo.coordenadas_longitude).toFixed(6)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            {grupo.responsavel_nome || 'N/A'}
                          </div>
                          {grupo.contacto_cuidador && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {grupo.contacto_cuidador}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            <PawPrint className="h-3 w-3 mr-1" />
                            {grupo.total_animais || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(grupo.data_criacao)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link to={`/grupo/${grupo.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {hasPermission('update') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(grupo)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {hasPermission('delete') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(grupo)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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

      {/* Dialog para Novo/Editar Grupo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGrupo ? 'Editar Grupo' : 'Novo Grupo'}
            </DialogTitle>
            <DialogDescription>
              {editingGrupo 
                ? 'Edite as informações do grupo'
                : 'Crie uma nova matilha ou colónia'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={grupoForm.nome}
                  onChange={(e) => setGrupoForm({...grupoForm, nome: e.target.value})}
                  placeholder="Nome da matilha ou colónia"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select 
                  value={grupoForm.tipo} 
                  onValueChange={(value) => setGrupoForm({...grupoForm, tipo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposGrupos.map((tipo) => {
                      const IconComponent = tipo.icone === 'Dog' ? Dog : Cat;
                      return (
                        <SelectItem key={tipo.id} value={tipo.nome}>
                          <div className="flex items-center">
                            <IconComponent className="h-4 w-4 mr-2" />
                            {tipo.nome} ({tipo.descricao})
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Localização */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  value={grupoForm.localizacao}
                  onChange={(e) => setGrupoForm({...grupoForm, localizacao: e.target.value})}
                  placeholder="Local onde se encontra o grupo"
                />
              </div>
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={grupoForm.endereco}
                  onChange={(e) => setGrupoForm({...grupoForm, endereco: e.target.value})}
                  placeholder="Endereço completo"
                />
              </div>
            </div>

            {/* Campos Geográficos */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="localidade">Localidade</Label>
                <Input
                  id="localidade"
                  value={grupoForm.localidade}
                  onChange={(e) => setGrupoForm({...grupoForm, localidade: e.target.value})}
                  placeholder="Localidade"
                />
              </div>
              <div>
                <Label htmlFor="concelho">Concelho</Label>
                <Input
                  id="concelho"
                  value={grupoForm.concelho}
                  onChange={(e) => setGrupoForm({...grupoForm, concelho: e.target.value})}
                  placeholder="Concelho"
                />
              </div>
              <div>
                <Label htmlFor="distrito">Distrito</Label>
                <Input
                  id="distrito"
                  value={grupoForm.distrito}
                  onChange={(e) => setGrupoForm({...grupoForm, distrito: e.target.value})}
                  placeholder="Distrito"
                />
              </div>
            </div>

            {/* Coordenadas Geográficas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coordenadas_latitude">Latitude</Label>
                <Input
                  id="coordenadas_latitude"
                  type="number"
                  step="0.000001"
                  value={grupoForm.coordenadas_latitude}
                  onChange={(e) => setGrupoForm({...grupoForm, coordenadas_latitude: e.target.value})}
                  placeholder="Ex: 41.157944"
                />
                <p className="text-xs text-gray-500 mt-1">Entre -90 e 90</p>
              </div>
              <div>
                <Label htmlFor="coordenadas_longitude">Longitude</Label>
                <Input
                  id="coordenadas_longitude"
                  type="number"
                  step="0.000001"
                  value={grupoForm.coordenadas_longitude}
                  onChange={(e) => setGrupoForm({...grupoForm, coordenadas_longitude: e.target.value})}
                  placeholder="Ex: -8.629105"
                />
                <p className="text-xs text-gray-500 mt-1">Entre -180 e 180</p>
              </div>
            </div>

            {/* Responsável */}
            <div>
              <Label htmlFor="responsavel">Voluntário Responsável</Label>
              <Select 
                value={grupoForm.responsavel_voluntario_id} 
                onValueChange={(value) => setGrupoForm({...grupoForm, responsavel_voluntario_id: value === "none" ? "" : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar voluntário (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum voluntário</SelectItem>
                  {voluntarios.map((voluntario) => (
                    <SelectItem key={voluntario.id} value={voluntario.id}>
                      {voluntario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cuidador Informal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cuidador">Cuidador Informal</Label>
                <Input
                  id="cuidador"
                  value={grupoForm.cuidador_informal}
                  onChange={(e) => setGrupoForm({...grupoForm, cuidador_informal: e.target.value})}
                  placeholder="Nome do cuidador não registado"
                />
              </div>
              <div>
                <Label htmlFor="contacto">Contacto do Cuidador</Label>
                <Input
                  id="contacto"
                  value={grupoForm.contacto_cuidador}
                  onChange={(e) => setGrupoForm({...grupoForm, contacto_cuidador: e.target.value})}
                  placeholder="Telefone ou email"
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={grupoForm.observacoes}
                onChange={(e) => setGrupoForm({...grupoForm, observacoes: e.target.value})}
                placeholder="Informações adicionais sobre o grupo"
                rows={3}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    {editingGrupo ? 'Atualizar' : 'Criar'} Grupo
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default GestaoGrupos;