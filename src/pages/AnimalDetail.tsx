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
import { Animal, Intervencao, Evento, TipoIntervencao } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tiposIntervencoes, setTiposIntervencoes] = useState<TipoIntervencao[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para formulários
  const [novaIntervencao, setNovaIntervencao] = useState({
    tipo_intervencao_id: "",
    data_intervencao: "",
    veterinario: "",
    clinica: "",
    observacoes: "",
    custo: "",
    proxima_data: ""
  });
  
  const [novoEvento, setNovoEvento] = useState({
    tipo_evento: "",
    data_evento: "",
    descricao: "",
    observacoes: ""
  });

  useEffect(() => {
    if (id) {
      fetchAnimalData();
      fetchTiposIntervencoes();
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

  const handleAddIntervencao = async () => {
    try {
      if (!novaIntervencao.tipo_intervencao_id || !novaIntervencao.data_intervencao) {
        throw new Error("Tipo de intervenção e data são obrigatórios");
      }

      const dataToInsert = {
        animal_id: id,
        ...novaIntervencao,
        custo: novaIntervencao.custo ? parseFloat(novaIntervencao.custo) : null,
        proxima_data: novaIntervencao.proxima_data || null
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
        proxima_data: ""
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
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="intervencoes">Intervenções</TabsTrigger>
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
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
                    <Label className="text-sm font-medium text-gray-500">Número de Registro</Label>
                    <p className="text-lg font-mono">{animal.numero_registo || "Não informado"}</p>
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
        </Tabs>
      </div>
    </div>
  );
};

export default AnimalDetail;