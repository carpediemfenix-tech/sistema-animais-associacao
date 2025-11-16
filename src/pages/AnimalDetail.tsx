import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Edit, Plus, Calendar, Activity, FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Intervencao, Evento, TipoIntervencao, HistoricoLocalizacao, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [localizacoes, setLocalizacoes] = useState<HistoricoLocalizacao[]>([]);
  const [tiposIntervencoes, setTiposIntervencoes] = useState<TipoIntervencao[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Animal>>({});
  
  // Estados para formulários
  const [novaIntervencao, setNovaIntervencao] = useState({
    tipo_intervencao_id: "",
    data_intervencao: "",
    veterinario: "",
    clinica: "",
    observacoes: "",
    custo: "",
    proxima_data: "",
    voluntario_id: ""
  });
  
  const [novoEvento, setNovoEvento] = useState({
    tipo_evento: "",
    data_evento: "",
    descricao: "",
    observacoes: ""
  });

  // Estados para edição de intervenções e eventos
  const [editingIntervencao, setEditingIntervencao] = useState<Intervencao | null>(null);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [editIntervencaoData, setEditIntervencaoData] = useState({
    tipo_intervencao_id: "",
    data_intervencao: "",
    veterinario: "",
    clinica: "",
    observacoes: "",
    custo: "",
    proxima_data: ""
  });
  const [editEventoData, setEditEventoData] = useState({
    tipo_evento: "",
    data_evento: "",
    descricao: "",
    observacoes: ""
  });

  useEffect(() => {
    if (id) {
      fetchAnimalData();
      fetchTiposIntervencoes();
      fetchVoluntarios();
    }
  }, [id]);

  const fetchAnimalData = async () => {
    try {
      // Buscar dados do animal
      const { data: animalData, error: animalError } = await supabase
        .from('animais_2025_11_13_03_23')
        .select('*')
        .eq('id', id)
        .single();

      if (animalError) throw animalError;
      setAnimal(animalData);

      // Buscar intervenções
      const { data: intervencoesData, error: intervencoesError } = await supabase
        .from('intervencoes_2025_11_13_03_23')
        .select(`
          *,
          tipo_intervencao:tipos_intervencoes_2025_11_13_03_23(*)
        `)
        .eq('animal_id', id)
        .order('data_intervencao', { ascending: false });

      if (intervencoesError) throw intervencoesError;
      setIntervencoes(intervencoesData || []);

      // Buscar eventos
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos_2025_11_13_03_23')
        .select('*')
        .eq('animal_id', id)
        .order('data_evento', { ascending: false });

      if (eventosError) throw eventosError;
      setEventos(eventosData || []);

      // Buscar histórico de localizações
      const { data: localizacoesData, error: localizacoesError } = await supabase
        .from('historico_localizacoes_2025_11_16_18_00')
        .select('*')
        .eq('animal_id', id)
        .order('data_entrada', { ascending: false });

      if (localizacoesError) throw localizacoesError;
      setLocalizacoes(localizacoesData || []);

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
      navigate('/animais');
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposIntervencoes = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_intervencoes_2025_11_13_03_23')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTiposIntervencoes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar tipos de intervenções:', error);
    }
  };

  const fetchVoluntarios = async () => {
    try {
      const { data, error } = await supabase
        .from('voluntarios_2025_11_16_18_00')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setVoluntarios(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar voluntários:', error);
    }
  };

  const handleAddIntervencao = async () => {
    try {
      if (!novaIntervencao.tipo_intervencao_id || !novaIntervencao.data_intervencao) {
        throw new Error("Tipo de intervenção e data são obrigatórios");
      }

      const dataToInsert = {
        animal_id: id,
        ...novaIntervencao,
        custo: novaIntervencao.custo ? parseFloat(novaIntervencao.custo) : null,
        proxima_data: novaIntervencao.proxima_data || null,
        voluntario_id: novaIntervencao.voluntario_id || null
      };

      const { error } = await supabase
        .from('intervencoes_2025_11_13_03_23')
        .insert([dataToInsert]);

      if (error) throw error;

      toast({
        title: "Intervenção adicionada",
        description: "Nova intervenção registrada com sucesso",
      });

      // Resetar formulário
      setNovaIntervencao({
        tipo_intervencao_id: "",
        data_intervencao: "",
        veterinario: "",
        clinica: "",
        observacoes: "",
        custo: "",
        proxima_data: "",
        voluntario_id: ""
      });

      // Recarregar dados
      fetchAnimalData();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar intervenção",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddEvento = async () => {
    try {
      if (!novoEvento.tipo_evento || !novoEvento.data_evento || !novoEvento.descricao) {
        throw new Error("Todos os campos são obrigatórios");
      }

      const dataToInsert = {
        animal_id: id,
        ...novoEvento
      };

      const { error } = await supabase
        .from('eventos_2025_11_13_03_23')
        .insert([dataToInsert]);

      if (error) throw error;

      toast({
        title: "Evento adicionado",
        description: "Novo evento registrado com sucesso",
      });

      // Resetar formulário
      setNovoEvento({
        tipo_evento: "",
        data_evento: "",
        descricao: "",
        observacoes: ""
      });

      // Recarregar dados
      fetchAnimalData();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar evento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditAnimal = () => {
    if (animal) {
      setEditData({
        nome: animal.nome,
        especie: animal.especie,
        raca: animal.raca || '',
        sexo: animal.sexo,
        data_nascimento: animal.data_nascimento || '',
        idade_estimada: animal.idade_estimada || '',
        peso: animal.peso || 0,
        cor: animal.cor || '',
        caracteristicas_fisicas: animal.caracteristicas_fisicas || '',
        transponder: animal.transponder || '',
        numero_registo: animal.numero_registo || '',
        estado: animal.estado,
        origem: animal.origem || '',
        observacoes: animal.observacoes || '',
        foto_url: animal.foto_url || ''
      });
      setEditMode(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!editData.nome || !editData.especie || !editData.sexo) {
        throw new Error("Nome, espécie e sexo são obrigatórios");
      }

      const dataToUpdate = {
        ...editData,
        peso: editData.peso ? parseFloat(editData.peso.toString()) : null,
        data_nascimento: editData.data_nascimento || null,
        transponder: editData.transponder || null,
        numero_registo: editData.numero_registo || null,
      };

      const { error } = await supabase
        .from('animais_2025_11_13_03_23')
        .update(dataToUpdate)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Animal atualizado com sucesso!",
        description: `${editData.nome} foi atualizado.`,
      });

      setEditMode(false);
      fetchAnimalData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar animal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Funções para editar intervenções
  const handleEditIntervencao = (intervencao: Intervencao) => {
    setEditingIntervencao(intervencao);
    setEditIntervencaoData({
      tipo_intervencao_id: intervencao.tipo_intervencao_id,
      data_intervencao: intervencao.data_intervencao,
      veterinario: intervencao.veterinario || '',
      clinica: intervencao.clinica || '',
      observacoes: intervencao.observacoes || '',
      custo: intervencao.custo?.toString() || '',
      proxima_data: intervencao.proxima_data || ''
    });
  };

  const handleSaveIntervencao = async () => {
    try {
      if (!editIntervencaoData.tipo_intervencao_id || !editIntervencaoData.data_intervencao) {
        throw new Error("Tipo de intervenção e data são obrigatórios");
      }

      const dataToUpdate = {
        ...editIntervencaoData,
        custo: editIntervencaoData.custo ? parseFloat(editIntervencaoData.custo) : null,
        proxima_data: editIntervencaoData.proxima_data || null
      };

      const { error } = await supabase
        .from('intervencoes_2025_11_13_03_23')
        .update(dataToUpdate)
        .eq('id', editingIntervencao?.id);

      if (error) throw error;

      toast({
        title: "Intervenção atualizada",
        description: "Intervenção foi atualizada com sucesso",
      });

      setEditingIntervencao(null);
      fetchAnimalData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar intervenção",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteIntervencao = async (intervencaoId: string) => {
    try {
      const { error } = await supabase
        .from('intervencoes_2025_11_13_03_23')
        .delete()
        .eq('id', intervencaoId);

      if (error) throw error;

      toast({
        title: "Intervenção removida",
        description: "Intervenção foi removida com sucesso",
      });

      fetchAnimalData();
    } catch (error: any) {
      toast({
        title: "Erro ao remover intervenção",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Funções para editar eventos
  const handleEditEvento = (evento: Evento) => {
    setEditingEvento(evento);
    setEditEventoData({
      tipo_evento: evento.tipo_evento,
      data_evento: evento.data_evento,
      descricao: evento.descricao,
      observacoes: evento.observacoes || ''
    });
  };

  const handleSaveEvento = async () => {
    try {
      if (!editEventoData.tipo_evento || !editEventoData.data_evento || !editEventoData.descricao) {
        throw new Error("Todos os campos são obrigatórios");
      }

      const { error } = await supabase
        .from('eventos_2025_11_13_03_23')
        .update(editEventoData)
        .eq('id', editingEvento?.id);

      if (error) throw error;

      toast({
        title: "Evento atualizado",
        description: "Evento foi atualizado com sucesso",
      });

      setEditingEvento(null);
      fetchAnimalData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar evento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvento = async (eventoId: string) => {
    try {
      const { error } = await supabase
        .from('eventos_2025_11_13_03_23')
        .delete()
        .eq('id', eventoId);

      if (error) throw error;

      toast({
        title: "Evento removido",
        description: "Evento foi removido com sucesso",
      });

      fetchAnimalData();
    } catch (error: any) {
      toast({
        title: "Erro ao remover evento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dados do animal...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Animal não encontrado</p>
          <Link to="/animais">
            <Button>Voltar à Lista</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Ativo': return 'default';
      case 'Adotado': return 'secondary';
      case 'Óbito': return 'destructive';
      case 'Transferido': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/animais">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{animal.nome}</h1>
              <p className="text-gray-600 mt-1">
                {animal.especie} {animal.raca && `• ${animal.raca}`} • {animal.sexo}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={getEstadoBadgeVariant(animal.estado)} className="text-sm">
              {animal.estado}
            </Badge>
            <Button variant="outline" onClick={handleEditAnimal}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="intervencoes">Intervenções</TabsTrigger>
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
            <TabsTrigger value="localizacoes">Localizações</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          {/* Informações Básicas */}
          <TabsContent value="info">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Dados do Animal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nome</Label>
                      <p className="text-lg">{animal.nome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Espécie</Label>
                      <p className="text-lg">{animal.especie}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Raça</Label>
                      <p className="text-lg">{animal.raca || "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Sexo</Label>
                      <p className="text-lg">{animal.sexo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Idade</Label>
                      <p className="text-lg">{animal.idade_estimada || "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Peso</Label>
                      <p className="text-lg">{animal.peso ? `${animal.peso} kg` : "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Cor</Label>
                      <p className="text-lg">{animal.cor || "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Data de Entrada</Label>
                      <p className="text-lg">{new Date(animal.data_entrada).toLocaleDateString('pt-PT')}</p>
                    </div>
                  </div>
                  
                  {animal.caracteristicas_fisicas && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-500">Características Físicas</Label>
                      <p className="mt-1">{animal.caracteristicas_fisicas}</p>
                    </div>
                  )}
                  
                  {animal.observacoes && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-500">Observações</Label>
                      <p className="mt-1">{animal.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Identificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Transponder</Label>
                    <p className="text-lg font-mono">{animal.transponder || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Número de Processo</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono font-bold text-blue-600">{animal.numero_registo || "Não informado"}</p>
                      {animal.numero_registo && animal.numero_registo.startsWith('P') && (
                        <Badge variant="outline" className="text-xs">
                          Processo Oficial
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Origem</Label>
                    <p className="text-lg">{animal.origem || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Estado</Label>
                    <Badge variant={getEstadoBadgeVariant(animal.estado)} className="mt-1">
                      {animal.estado}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Intervenções */}
          <TabsContent value="intervencoes">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Histórico de Intervenções</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Intervenção
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar Intervenção</DialogTitle>
                      <DialogDescription>
                        Registre uma nova intervenção médica ou procedimento
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tipo_intervencao">Tipo de Intervenção *</Label>
                        <Select 
                          value={novaIntervencao.tipo_intervencao_id} 
                          onValueChange={(value) => setNovaIntervencao(prev => ({...prev, tipo_intervencao_id: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposIntervencoes.map((tipo) => (
                              <SelectItem key={tipo.id} value={tipo.id}>
                                {tipo.nome} ({tipo.categoria})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="data_intervencao">Data *</Label>
                        <Input
                          id="data_intervencao"
                          type="date"
                          value={novaIntervencao.data_intervencao}
                          onChange={(e) => setNovaIntervencao(prev => ({...prev, data_intervencao: e.target.value}))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="veterinario">Veterinário</Label>
                        <Input
                          id="veterinario"
                          value={novaIntervencao.veterinario}
                          onChange={(e) => setNovaIntervencao(prev => ({...prev, veterinario: e.target.value}))}
                          placeholder="Nome do veterinário"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="clinica">Clínica</Label>
                        <Input
                          id="clinica"
                          value={novaIntervencao.clinica}
                          onChange={(e) => setNovaIntervencao(prev => ({...prev, clinica: e.target.value}))}
                          placeholder="Nome da clínica"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="custo">Custo (€)</Label>
                        <Input
                          id="custo"
                          type="number"
                          step="0.01"
                          value={novaIntervencao.custo}
                          onChange={(e) => setNovaIntervencao(prev => ({...prev, custo: e.target.value}))}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="observacoes_intervencao">Observações</Label>
                        <Textarea
                          id="observacoes_intervencao"
                          value={novaIntervencao.observacoes}
                          onChange={(e) => setNovaIntervencao(prev => ({...prev, observacoes: e.target.value}))}
                          placeholder="Observações sobre a intervenção"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="voluntario_intervencao">Voluntário</Label>
                        <Select value={novaIntervencao.voluntario_id} onValueChange={(value) => 
                          setNovaIntervencao(prev => ({...prev, voluntario_id: value}))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar voluntário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhum voluntário</SelectItem>
                            {voluntarios.map((voluntario) => (
                              <SelectItem key={voluntario.id} value={voluntario.id}>
                                {voluntario.nome} - {voluntario.especialidade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button onClick={handleAddIntervencao} className="w-full">
                        Adicionar Intervenção
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {intervencoes.map((intervencao) => (
                  <Card key={intervencao.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <h3 className="font-semibold">{intervencao.tipo_intervencao?.nome}</h3>
                            <Badge variant="outline">{intervencao.tipo_intervencao?.categoria}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                          </p>
                          {intervencao.veterinario && (
                            <p className="text-sm text-gray-600">
                              <strong>Veterinário:</strong> {intervencao.veterinario}
                            </p>
                          )}
                          {intervencao.clinica && (
                            <p className="text-sm text-gray-600">
                              <strong>Clínica:</strong> {intervencao.clinica}
                            </p>
                          )}
                          {intervencao.voluntario && (
                            <p className="text-sm text-gray-600">
                              <strong>Voluntário:</strong> {intervencao.voluntario.nome}
                            </p>
                          )}
                          {intervencao.observacoes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Observações:</strong> {intervencao.observacoes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {intervencao.custo && (
                            <p className="font-semibold text-lg">€{intervencao.custo}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditIntervencao(intervencao)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteIntervencao(intervencao.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {intervencoes.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">Nenhuma intervenção registrada ainda.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Eventos */}
          <TabsContent value="eventos">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Eventos da Vida</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar Evento</DialogTitle>
                      <DialogDescription>
                        Registre um evento importante na vida do animal
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tipo_evento">Tipo de Evento *</Label>
                        <Select 
                          value={novoEvento.tipo_evento} 
                          onValueChange={(value) => setNovoEvento(prev => ({...prev, tipo_evento: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Adoção">Adoção</SelectItem>
                            <SelectItem value="Resgate">Resgate</SelectItem>
                            <SelectItem value="Transferência">Transferência</SelectItem>
                            <SelectItem value="Fuga">Fuga</SelectItem>
                            <SelectItem value="Retorno">Retorno</SelectItem>
                            <SelectItem value="Comportamento">Comportamento</SelectItem>
                            <SelectItem value="Socialização">Socialização</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="data_evento">Data *</Label>
                        <Input
                          id="data_evento"
                          type="date"
                          value={novoEvento.data_evento}
                          onChange={(e) => setNovoEvento(prev => ({...prev, data_evento: e.target.value}))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="descricao_evento">Descrição *</Label>
                        <Textarea
                          id="descricao_evento"
                          value={novoEvento.descricao}
                          onChange={(e) => setNovoEvento(prev => ({...prev, descricao: e.target.value}))}
                          placeholder="Descreva o evento"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="observacoes_evento">Observações</Label>
                        <Textarea
                          id="observacoes_evento"
                          value={novoEvento.observacoes}
                          onChange={(e) => setNovoEvento(prev => ({...prev, observacoes: e.target.value}))}
                          placeholder="Observações adicionais"
                          rows={2}
                        />
                      </div>
                      
                      <Button onClick={handleAddEvento} className="w-full">
                        Adicionar Evento
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {eventos.map((evento) => (
                  <Card key={evento.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{evento.tipo_evento}</h3>
                            <span className="text-sm text-gray-500">
                              {new Date(evento.data_evento).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{evento.descricao}</p>
                          {evento.observacoes && (
                            <p className="text-sm text-gray-600">
                              <strong>Observações:</strong> {evento.observacoes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditEvento(evento)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteEvento(evento.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {eventos.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">Nenhum evento registrado ainda.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Histórico Completo */}
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Completo</CardTitle>
                <CardDescription>
                  Cronologia de todas as intervenções e eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Combinar e ordenar intervenções e eventos por data */}
                  {[...intervencoes.map(i => ({...i, type: 'intervencao', date: i.data_intervencao})), 
                    ...eventos.map(e => ({...e, type: 'evento', date: e.data_evento}))]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item, index) => (
                      <div key={`${item.type}-${item.id}`} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {item.type === 'intervencao' 
                                ? (item as any).tipo_intervencao?.nome 
                                : (item as any).tipo_evento}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.type === 'intervencao' ? 'Intervenção' : 'Evento'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {new Date(item.date).toLocaleDateString('pt-PT')}
                          </p>
                          <p className="text-sm text-gray-700">
                            {item.type === 'intervencao' 
                              ? (item as any).observacoes || 'Sem observações'
                              : (item as any).descricao}
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {intervencoes.length === 0 && eventos.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum histórico registrado ainda.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nova aba para Histórico de Localizações */}
          <TabsContent value="localizacoes">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Histórico de Localizações</h3>
              </div>
              
              {localizacoes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma localização registada ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {localizacoes.map((localizacao) => (
                    <Card key={localizacao.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{localizacao.localizacao}</Badge>
                              <span className="text-sm text-muted-foreground">
                                Entrada: {new Date(localizacao.data_entrada).toLocaleDateString('pt-PT')}
                              </span>
                              {localizacao.data_saida && (
                                <span className="text-sm text-muted-foreground">
                                  Saída: {new Date(localizacao.data_saida).toLocaleDateString('pt-PT')}
                                </span>
                              )}
                            </div>
                            {localizacao.observacoes && (
                              <p className="text-sm text-muted-foreground">
                                {localizacao.observacoes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Edição */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Animal - {animal?.nome}</DialogTitle>
            <DialogDescription>
              Modifique as informações do animal
            </DialogDescription>
          </DialogHeader>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="edit_nome">Nome *</Label>
                  <Input
                    id="edit_nome"
                    value={editData.nome || ''}
                    onChange={(e) => setEditData(prev => ({...prev, nome: e.target.value}))}
                    placeholder="Nome do animal"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_especie">Espécie *</Label>
                  <Select 
                    value={editData.especie || ''} 
                    onValueChange={(value) => setEditData(prev => ({...prev, especie: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cão">Cão</SelectItem>
                      <SelectItem value="Gato">Gato</SelectItem>
                      <SelectItem value="Coelho">Coelho</SelectItem>
                      <SelectItem value="Ave">Ave</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_raca">Raça</Label>
                  <Input
                    id="edit_raca"
                    value={editData.raca || ''}
                    onChange={(e) => setEditData(prev => ({...prev, raca: e.target.value}))}
                    placeholder="Raça do animal"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_sexo">Sexo *</Label>
                  <Select 
                    value={editData.sexo || ''} 
                    onValueChange={(value) => setEditData(prev => ({...prev, sexo: value as 'Macho' | 'Fêmea'}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_idade">Idade Estimada</Label>
                  <Input
                    id="edit_idade"
                    value={editData.idade_estimada || ''}
                    onChange={(e) => setEditData(prev => ({...prev, idade_estimada: e.target.value}))}
                    placeholder="Ex: 2 anos, 6 meses"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_peso">Peso (kg)</Label>
                  <Input
                    id="edit_peso"
                    type="number"
                    step="0.1"
                    value={editData.peso || ''}
                    onChange={(e) => setEditData(prev => ({...prev, peso: parseFloat(e.target.value) || 0}))}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_cor">Cor</Label>
                  <Input
                    id="edit_cor"
                    value={editData.cor || ''}
                    onChange={(e) => setEditData(prev => ({...prev, cor: e.target.value}))}
                    placeholder="Cor predominante"
                  />
                </div>
              </div>
            </div>

            {/* Identificação e Estado */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Identificação e Estado</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="edit_transponder">Transponder/Microchip</Label>
                  <Input
                    id="edit_transponder"
                    value={editData.transponder || ''}
                    onChange={(e) => setEditData(prev => ({...prev, transponder: e.target.value}))}
                    placeholder="Número do microchip"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_numero_registo">Número de Registro</Label>
                  <Input
                    id="edit_numero_registo"
                    value={editData.numero_registo || ''}
                    onChange={(e) => setEditData(prev => ({...prev, numero_registo: e.target.value}))}
                    placeholder="Número de registro oficial"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_estado">Estado</Label>
                  <Select 
                    value={editData.estado || ''} 
                    onValueChange={(value) => setEditData(prev => ({...prev, estado: value as 'Ativo' | 'Adotado' | 'Óbito' | 'Transferido'}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Adotado">Adotado</SelectItem>
                      <SelectItem value="Óbito">Óbito</SelectItem>
                      <SelectItem value="Transferido">Transferido</SelectItem>
                      <SelectItem value="Não Adotável">Não Adotável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_origem">Origem</Label>
                  <Input
                    id="edit_origem"
                    value={editData.origem || ''}
                    onChange={(e) => setEditData(prev => ({...prev, origem: e.target.value}))}
                    placeholder="De onde veio o animal"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_caracteristicas">Características Físicas</Label>
                  <Textarea
                    id="edit_caracteristicas"
                    value={editData.caracteristicas_fisicas || ''}
                    onChange={(e) => setEditData(prev => ({...prev, caracteristicas_fisicas: e.target.value}))}
                    placeholder="Características distintivas, marcas, cicatrizes, etc."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_observacoes">Observações</Label>
                  <Textarea
                    id="edit_observacoes"
                    value={editData.observacoes || ''}
                    onChange={(e) => setEditData(prev => ({...prev, observacoes: e.target.value}))}
                    placeholder="Observações gerais"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => setEditMode(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Intervenção */}
      <Dialog open={!!editingIntervencao} onOpenChange={() => setEditingIntervencao(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Intervenção</DialogTitle>
            <DialogDescription>
              Modifique os dados da intervenção
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_tipo_intervencao">Tipo de Intervenção *</Label>
              <Select 
                value={editIntervencaoData.tipo_intervencao_id} 
                onValueChange={(value) => setEditIntervencaoData(prev => ({...prev, tipo_intervencao_id: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposIntervencoes.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome} ({tipo.categoria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit_data_intervencao">Data *</Label>
              <Input
                id="edit_data_intervencao"
                type="date"
                value={editIntervencaoData.data_intervencao}
                onChange={(e) => setEditIntervencaoData(prev => ({...prev, data_intervencao: e.target.value}))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_veterinario">Veterinário</Label>
              <Input
                id="edit_veterinario"
                value={editIntervencaoData.veterinario}
                onChange={(e) => setEditIntervencaoData(prev => ({...prev, veterinario: e.target.value}))}
                placeholder="Nome do veterinário"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_clinica">Clínica</Label>
              <Input
                id="edit_clinica"
                value={editIntervencaoData.clinica}
                onChange={(e) => setEditIntervencaoData(prev => ({...prev, clinica: e.target.value}))}
                placeholder="Nome da clínica"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_custo">Custo (€)</Label>
              <Input
                id="edit_custo"
                type="number"
                step="0.01"
                value={editIntervencaoData.custo}
                onChange={(e) => setEditIntervencaoData(prev => ({...prev, custo: e.target.value}))}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_observacoes_intervencao">Observações</Label>
              <Textarea
                id="edit_observacoes_intervencao"
                value={editIntervencaoData.observacoes}
                onChange={(e) => setEditIntervencaoData(prev => ({...prev, observacoes: e.target.value}))}
                placeholder="Observações sobre a intervenção"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingIntervencao(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveIntervencao}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Evento */}
      <Dialog open={!!editingEvento} onOpenChange={() => setEditingEvento(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Modifique os dados do evento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_tipo_evento">Tipo de Evento *</Label>
              <Select 
                value={editEventoData.tipo_evento} 
                onValueChange={(value) => setEditEventoData(prev => ({...prev, tipo_evento: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adoção">Adoção</SelectItem>
                  <SelectItem value="Resgate">Resgate</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Fuga">Fuga</SelectItem>
                  <SelectItem value="Retorno">Retorno</SelectItem>
                  <SelectItem value="Comportamento">Comportamento</SelectItem>
                  <SelectItem value="Socialização">Socialização</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit_data_evento">Data *</Label>
              <Input
                id="edit_data_evento"
                type="date"
                value={editEventoData.data_evento}
                onChange={(e) => setEditEventoData(prev => ({...prev, data_evento: e.target.value}))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_descricao_evento">Descrição *</Label>
              <Textarea
                id="edit_descricao_evento"
                value={editEventoData.descricao}
                onChange={(e) => setEditEventoData(prev => ({...prev, descricao: e.target.value}))}
                placeholder="Descreva o evento"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_observacoes_evento">Observações</Label>
              <Textarea
                id="edit_observacoes_evento"
                value={editEventoData.observacoes}
                onChange={(e) => setEditEventoData(prev => ({...prev, observacoes: e.target.value}))}
                placeholder="Observações adicionais"
                rows={2}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingEvento(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEvento}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalDetail;