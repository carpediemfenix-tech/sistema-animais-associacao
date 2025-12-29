import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  FileText, 
  Activity,
  Clock,
  User,
  AlertCircle,
  Edit,
  Trash2,
  Save,
  X
} from "lucide-react";

interface TipoEstado {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  ativo: boolean;
}

interface EstadoAnimal {
  id: string;
  animal_id: string;
  tipo_estado_id: string;
  data_inicio: string;
  data_fim: string | null;
  observacoes: string | null;
  ativo: boolean;
  usuario_id: string | null;
  created_at: string;
  tipos_estado: TipoEstado;
}

interface Animal {
  id: string;
  nome: string;
  numero_processo: string;
  estado: string;
}

const AnimalEstados: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [estados, setEstados] = useState<EstadoAnimal[]>([]);
  const [tiposEstado, setTiposEstado] = useState<TipoEstado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEstado, setEditingEstado] = useState<string | null>(null);
  
  // Form state
  const [novoEstado, setNovoEstado] = useState({
    tipo_estado_id: "",
    data_inicio: new Date().toISOString().split('T')[0],
    observacoes: ""
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    tipo_estado_id: "",
    data_inicio: "",
    observacoes: ""
  });

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar dados do animal
      const { data: animalData, error: animalError } = await supabase
        .from('animais')
        .select('id, nome, numero_processo, estado')
        .eq('id', id)
        .single();

      if (animalError) throw animalError;
      setAnimal(animalData);

      // Carregar histórico de estados - ordenar por ativo primeiro, depois por data
      const { data: estadosData, error: estadosError } = await supabase
        .from('estados_animal')
        .select(`
          *,
          tipos_estado (
            id,
            nome,
            descricao,
            cor,
            ativo
          )
        `)
        .eq('animal_id', id)
        .order('ativo', { ascending: false })  // Estados ativos primeiro
        .order('data_inicio', { ascending: false }); // Depois por data mais recente

      if (estadosError) throw estadosError;
      
      // Organizar estados: ativo primeiro, depois histórico por data
      const estadosOrganizados = estadosData || [];
      const estadoAtivo = estadosOrganizados.find(e => e.ativo);
      const estadosInativos = estadosOrganizados.filter(e => !e.ativo)
        .sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());
      
      // Colocar estado ativo no topo, seguido do histórico
      const estadosFinais = estadoAtivo ? [estadoAtivo, ...estadosInativos] : estadosInativos;
      setEstados(estadosFinais);

      // Carregar tipos de estado disponíveis
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipos_estado')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (tiposError) throw tiposError;
      setTiposEstado(tiposData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos estados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarEstado = async () => {
    if (!novoEstado.tipo_estado_id) {
      toast({
        title: "Erro",
        description: "Selecione um tipo de estado",
        variant: "destructive",
      });
      return;
    }

    // Verificar autenticação
    if (!isAuthenticated || !user) {
      toast({
        title: "Erro de Autenticação",
        description: "É necessário estar autenticado para adicionar estados. Por favor, faça login.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔐 [ESTADOS] Usuário autenticado:', user.username, 'Perfil:', user.perfil);
      
      // 1. Primeiro, desativar estados anteriores manualmente
      const { error: updateError } = await supabase
        .from('estados_animal')
        .update({ 
          ativo: false, 
          data_fim: novoEstado.data_inicio 
        })
        .eq('animal_id', id)
        .eq('ativo', true);

      if (updateError) {
        console.warn('⚠️ [ESTADOS] Aviso ao desativar estados anteriores:', updateError);
      }

      // 2. Inserir o novo estado com dados do usuário autenticado
      const { error: insertError } = await supabase
        .from('estados_animal')
        .insert({
          animal_id: id,
          tipo_estado_id: novoEstado.tipo_estado_id,
          data_inicio: novoEstado.data_inicio,
          observacoes: novoEstado.observacoes || null,
          ativo: true,
          usuario_id: user.username || user.id
        });

      if (insertError) throw insertError;

      // 2. Obter o nome do novo tipo de estado para sincronização
      const { data: tipoEstado, error: tipoError } = await supabase
        .from('tipos_estado')
        .select('nome')
        .eq('id', novoEstado.tipo_estado_id)
        .single();

      if (tipoError) {
        console.warn('Aviso: Não foi possível obter nome do tipo de estado:', tipoError);
      } else {
        // 3. Atualizar o campo estado na tabela animais (opcional)
        try {
          await supabase
            .from('animais')
            .update({ estado: tipoEstado.nome })
            .eq('id', id);
        } catch (syncError) {
          console.warn('Aviso: Não foi possível sincronizar o campo estado:', syncError);
          // Não falha a operação principal
        }
      }

      console.log('✅ [ESTADOS] Estado adicionado com sucesso!');
      toast({
        title: "Sucesso",
        description: `Estado "${tipoEstado?.nome || 'novo estado'}" adicionado com sucesso`,
      });

      // Reset form
      setNovoEstado({
        tipo_estado_id: "",
        data_inicio: new Date().toISOString().split('T')[0],
        observacoes: ""
      });

      setIsDialogOpen(false);
      carregarDados();

    } catch (error: any) {
      console.error('❌ [ESTADOS] Erro ao adicionar estado:', error);
      
      // Mensagem de erro mais específica baseada no código
      let errorMessage = "Erro ao adicionar estado";
      let errorTitle = "Erro";
      
      if (error.code === '42501') {
        errorTitle = "Erro de Permissão";
        errorMessage = "Sem permissão para adicionar estados. Verifique se está autenticado como administrador.";
      } else if (error.code === '23505') {
        errorTitle = "Erro de Duplicação";
        errorMessage = "Já existe um estado ativo para este animal na mesma data.";
      } else if (error.code === '23503') {
        errorTitle = "Erro de Referência";
        errorMessage = "Tipo de estado ou animal não encontrado.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const iniciarEdicao = (estado: EstadoAnimal) => {
    setEditingEstado(estado.id);
    setEditForm({
      tipo_estado_id: estado.tipo_estado_id,
      data_inicio: estado.data_inicio,
      observacoes: estado.observacoes || ""
    });
  };

  const cancelarEdicao = () => {
    setEditingEstado(null);
    setEditForm({
      tipo_estado_id: "",
      data_inicio: "",
      observacoes: ""
    });
  };

  const salvarEdicao = async (estadoId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Erro de Autenticação",
        description: "É necessário estar autenticado para editar estados",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('✏️ [ESTADOS] Editando estado:', estadoId);

      const { error } = await supabase
        .from('estados_animal')
        .update({
          tipo_estado_id: editForm.tipo_estado_id,
          data_inicio: editForm.data_inicio,
          observacoes: editForm.observacoes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', estadoId);

      if (error) throw error;

      // Se este é o estado ativo, atualizar também o campo estado na tabela animais
      const estadoEditado = estados.find(e => e.id === estadoId);
      if (estadoEditado?.ativo) {
        try {
          const { data: tipoEstado } = await supabase
            .from('tipos_estado')
            .select('nome')
            .eq('id', editForm.tipo_estado_id)
            .single();

          if (tipoEstado) {
            await supabase
              .from('animais')
              .update({ estado: tipoEstado.nome })
              .eq('id', id);
          }
        } catch (syncError) {
          console.warn('Aviso: Não foi possível sincronizar campo estado:', syncError);
        }
      }

      toast({
        title: "Sucesso",
        description: "Estado editado com sucesso",
      });

      setEditingEstado(null);
      carregarDados();

    } catch (error: any) {
      console.error('❌ [ESTADOS] Erro ao editar estado:', error);
      toast({
        title: "Erro",
        description: "Erro ao editar estado: " + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    }
  };

  const eliminarEstado = async (estadoId: string, estadoNome: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Erro de Autenticação",
        description: "É necessário estar autenticado para eliminar estados",
        variant: "destructive",
      });
      return;
    }

    // Confirmar eliminação
    if (!window.confirm(`Tem certeza que deseja eliminar o estado "${estadoNome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      console.log('🗑️ [ESTADOS] Eliminando estado:', estadoId);

      const { error } = await supabase
        .from('estados_animal')
        .delete()
        .eq('id', estadoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Estado "${estadoNome}" eliminado com sucesso`,
      });

      carregarDados();

    } catch (error: any) {
      console.error('❌ [ESTADOS] Erro ao eliminar estado:', error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar estado: " + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    }
  };
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-PT');
  };

  const getEstadoBadgeColor = (cor: string) => {
    return {
      backgroundColor: cor + '20',
      color: cor,
      borderColor: cor
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Animal não encontrado</h2>
              <p className="text-gray-600 mb-4">O animal solicitado não foi encontrado.</p>
              <Link to="/animais">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Animais
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={`/animal/${id}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Estados do Animal</h1>
              <p className="text-gray-600">
                {animal.nome} - {animal.numero_processo}
              </p>
              {user && (
                <p className="text-sm text-green-600 font-medium">
                  ✅ Autenticado como: {user.nome || user.username} ({user.perfil})
                </p>
              )}
              {!isAuthenticated && (
                <p className="text-sm text-red-600 font-medium">
                  ❌ Não autenticado - Faça login para adicionar estados
                </p>
              )}
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Estado
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Estado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tipo_estado">Tipo de Estado *</Label>
                  <Select 
                    value={novoEstado.tipo_estado_id} 
                    onValueChange={(value) => setNovoEstado({...novoEstado, tipo_estado_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEstado.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: tipo.cor }}
                            />
                            {tipo.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_inicio">Data de Início *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={novoEstado.data_inicio}
                    onChange={(e) => setNovoEstado({...novoEstado, data_inicio: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações sobre a mudança de estado..."
                    value={novoEstado.observacoes}
                    onChange={(e) => setNovoEstado({...novoEstado, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={adicionarEstado} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estado Atual */}
        {(() => {
          const estadoAtivo = estados.find(e => e.ativo);
          return estadoAtivo ? (
            <Card className="mb-6 border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Activity className="h-6 w-6 text-green-600" />
                  <span className="text-green-800 font-bold">Estado Atual</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Badge do Estado - Destaque Principal */}
                <div className="flex-shrink-0">
                  <Badge 
                    style={getEstadoBadgeColor(estadoAtivo.tipos_estado.cor)}
                    className="text-2xl md:text-3xl px-6 py-3 font-bold shadow-md border-2"
                  >
                    {estadoAtivo.tipos_estado.nome.toUpperCase()}
                  </Badge>
                </div>
                
                {/* Informações Complementares */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-gray-800">
                      Desde: <span className="text-green-700">{formatarData(estadoAtivo.data_inicio)}</span>
                    </span>
                  </div>
                  
                  {estadoAtivo.usuario_id && (
                    <div className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Definido por: <span className="font-medium">{estadoAtivo.usuario_id}</span>
                      </span>
                    </div>
                  )}
                  
                  {estadoAtivo.observacoes && (
                    <div className="mt-4 p-4 bg-white rounded-lg border-l-4 border-green-400 shadow-sm">
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 mb-1">Observações:</p>
                          <p className="text-base text-gray-700 italic font-medium">"{estadoAtivo.observacoes}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          ) : (
            <Card className="mb-6 border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  <span className="text-orange-800 font-bold">Nenhum Estado Ativo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-orange-700 text-lg">
                  Este animal não possui um estado ativo definido. Adicione um novo estado para definir o status atual.
                </p>
              </CardContent>
            </Card>
          );
        })()}

        {/* Histórico de Estados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Estados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {estados.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum estado registrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Este animal ainda não possui histórico de estados.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Estado
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {estados.map((estado, index) => (
                  <div 
                    key={estado.id} 
                    className={`border rounded-lg p-4 ${estado.ativo ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingEstado === estado.id ? (
                          // Modo de edição
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                Editando Estado
                              </Badge>
                              {estado.ativo && (
                                <Badge variant="default" className="bg-green-600">
                                  Atual
                                </Badge>
                              )}
                            </div>

                            {/* Formulário de edição */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`edit-tipo-${estado.id}`}>Tipo de Estado</Label>
                                <Select 
                                  value={editForm.tipo_estado_id} 
                                  onValueChange={(value) => setEditForm({...editForm, tipo_estado_id: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tiposEstado.map((tipo) => (
                                      <SelectItem key={tipo.id} value={tipo.id}>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: tipo.cor }}
                                          />
                                          {tipo.nome}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor={`edit-data-${estado.id}`}>Data de Início</Label>
                                <Input
                                  id={`edit-data-${estado.id}`}
                                  type="date"
                                  value={editForm.data_inicio}
                                  onChange={(e) => setEditForm({...editForm, data_inicio: e.target.value})}
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor={`edit-obs-${estado.id}`}>Observações</Label>
                              <Textarea
                                id={`edit-obs-${estado.id}`}
                                placeholder="Observações sobre o estado..."
                                value={editForm.observacoes}
                                onChange={(e) => setEditForm({...editForm, observacoes: e.target.value})}
                                rows={2}
                              />
                            </div>

                            {/* Botões de ação da edição */}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm" 
                                onClick={() => salvarEdicao(estado.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Salvar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={cancelarEdicao}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Modo de visualização
                          <>
                            <div className="flex items-center gap-3 mb-2">
                              <Badge 
                                style={getEstadoBadgeColor(estado.tipos_estado.cor)}
                                className="font-semibold"
                              >
                                {estado.tipos_estado.nome}
                              </Badge>
                              {estado.ativo && (
                                <Badge variant="default" className="bg-green-600">
                                  Atual
                                </Badge>
                              )}
                            </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>
                              <strong>Início:</strong> {formatarData(estado.data_inicio)}
                            </span>
                          </div>
                          
                          {estado.data_fim && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>
                                <strong>Fim:</strong> {formatarData(estado.data_fim)}
                              </span>
                            </div>
                          )}
                          
                          {estado.usuario_id && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>
                                <strong>Por:</strong> {estado.usuario_id}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>
                              <strong>Registrado:</strong> {formatarData(estado.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        {estado.observacoes && (
                          <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-400">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Observações:</p>
                                <p className="text-sm text-gray-600 italic">"{estado.observacoes}"</p>
                              </div>
                            </div>
                          </div>
                        )}
                          </>
                        )}
                      </div>

                      {/* Botões de ação (apenas no modo visualização) */}
                      {editingEstado !== estado.id && isAuthenticated && (
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => iniciarEdicao(estado)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => eliminarEstado(estado.id, estado.tipos_estado.nome)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnimalEstados;