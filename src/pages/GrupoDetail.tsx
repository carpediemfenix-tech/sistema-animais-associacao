import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
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
  DollarSign,
  CalendarDays,
  Eye,
  UserMinus,
  UserPlus,
  Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Grupo, Animal, DespesaGrupo, EventoGrupo } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import LogotipoValentao from "@/components/LogotipoValentao";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import { convertGoogleDriveUrl } from "@/lib/utils";

const GrupoDetail = () => {
  const { id } = useParams();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [animaisDisponiveis, setAnimaisDisponiveis] = useState<Animal[]>([]);
  const [todosAnimaisEspecie, setTodosAnimaisEspecie] = useState<Animal[]>([]);
  const [despesas, setDespesas] = useState<DespesaGrupo[]>([]);
  const [eventos, setEventos] = useState<EventoGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados dos diálogos
  const [despesaDialogOpen, setDespesaDialogOpen] = useState(false);
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [animalDialogOpen, setAnimalDialogOpen] = useState(false);
  const [transferirDialogOpen, setTransferirDialogOpen] = useState(false);

  // Estados dos formulários
  const [despesaForm, setDespesaForm] = useState({
    descricao: "",
    valor: "",
    data_despesa: new Date().toISOString().split('T')[0],
    categoria: "",
    observacoes: ""
  });

  const [eventoForm, setEventoForm] = useState({
    titulo: "",
    descricao: "",
    data_evento: new Date().toISOString().split('T')[0],
    tipo_evento: "",
    observacoes: ""
  });

  useEffect(() => {
    if (id) {
      fetchGrupoData();
    }
  }, [id]);

  const fetchGrupoData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🐕 [GRUPO] Carregando dados do grupo ID:', id);

      // Buscar dados do grupo
      const { data: grupoData, error: grupoError } = await supabase
        .from('grupos')
        .select(`
          *,
          voluntarios(nome)
        `)
        .eq('id', id)
        .single();

      if (grupoError) {
        console.error('❌ [GRUPO] Erro ao buscar grupo:', grupoError);
        throw grupoError;
      }

      console.log('✅ [GRUPO] Grupo carregado:', grupoData.nome);
      setGrupo({
        ...grupoData,
        responsavel_nome: grupoData.voluntarios?.nome || grupoData.cuidador_informal
      });

      // Buscar animais do grupo
      const { data: animaisData, error: animaisError } = await supabase
        .from('animais')
        .select('*')
        .eq('grupo_id', id)
        .eq('arquivado', false)
        .order('nome');

      if (animaisError) {
        console.error('❌ [ANIMAIS] Erro ao buscar animais:', animaisError);
      } else {
        console.log('✅ [ANIMAIS] Animais carregados:', animaisData?.length || 0);
        setAnimais(animaisData || []);
      }

      // Buscar animais disponíveis para associar - SISTEMA INTELIGENTE
      // Matilha = apenas Cães, Colónia = apenas Gatos, outros tipos = todos os animais
      let filtroEspecie = null;
      if (grupoData.tipo === 'Matilha') {
        filtroEspecie = 'Cão';
      } else if (grupoData.tipo === 'Colónia') {
        filtroEspecie = 'Gato';
      }
      // Para outros tipos (Sócios, Especiais, etc.) não filtramos por espécie
      
      console.log('🔍 [DEBUG] Sistema inteligente de filtros:', {
        grupoTipo: grupoData.tipo,
        filtroEspecie: filtroEspecie || 'TODOS OS ANIMAIS',
        grupoId: id
      });
      
      // Buscar TODOS os animais (com ou sem filtro de espécie) para debug
      let queryTodosAnimais = supabase
        .from('animais')
        .select('*, grupos(nome, tipo)');
      
      if (filtroEspecie) {
        queryTodosAnimais = queryTodosAnimais.eq('especie', filtroEspecie);
      }
      
      const { data: todosAnimais, error: todosError } = await queryTodosAnimais;
      
      if (!todosError) {
        console.log(`🔍 [DEBUG] Todos os animais ${filtroEspecie ? 'da espécie ' + filtroEspecie : 'de todas as espécies'}:`, todosAnimais?.map(a => ({
          nome: a.nome,
          especie: a.especie,
          estado: a.estado,
          arquivado: a.arquivado,
          temGrupo: a.grupo_id ? 'SIM' : 'NÃO',
          nomeGrupo: a.grupos?.nome || 'N/A',
          disponivel: !a.grupo_id && (a.estado === 'Ativo' || (grupoData.tipo === 'Sócios' && a.estado === 'Adotado')) && !a.arquivado ? 'SIM' : 'NÃO'
        })));
        setTodosAnimaisEspecie(todosAnimais || []);
      }
      
      // Buscar animais disponíveis com filtro inteligente
      let queryAnimaisDisponiveis = supabase
        .from('animais')
        .select('*')
        .is('grupo_id', null)
        .eq('arquivado', false);
      
      // Para grupos Sócios, incluir também animais Adotados
      if (grupoData.tipo === 'Sócios') {
        queryAnimaisDisponiveis = queryAnimaisDisponiveis.in('estado', ['Ativo', 'Adotado']);
      } else {
        queryAnimaisDisponiveis = queryAnimaisDisponiveis.eq('estado', 'Ativo');
      }
      
      // Aplicar filtro de espécie apenas se necessário
      if (filtroEspecie) {
        queryAnimaisDisponiveis = queryAnimaisDisponiveis.eq('especie', filtroEspecie);
      }
      
      const { data: animaisDisponiveisData, error: disponiveisError } = await queryAnimaisDisponiveis.order('nome');

      if (disponiveisError) {
        console.error('❌ [DISPONÍVEIS] Erro ao buscar animais disponíveis:', disponiveisError);
      } else {
        console.log('✅ [DISPONÍVEIS] Animais disponíveis:', animaisDisponiveisData?.length || 0);
        setAnimaisDisponiveis(animaisDisponiveisData || []);
      }

      // Buscar despesas do grupo
      const { data: despesasData, error: despesasError } = await supabase
        .from('despesas_grupos')
        .select('*')
        .eq('grupo_id', id)
        .order('data_despesa', { ascending: false });

      if (despesasError) {
        console.error('❌ [DESPESAS] Erro ao buscar despesas:', despesasError);
      } else {
        console.log('✅ [DESPESAS] Despesas carregadas:', despesasData?.length || 0);
        setDespesas(despesasData || []);
      }

      // Buscar eventos do grupo
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos_grupos')
        .select('*')
        .eq('grupo_id', id)
        .order('data_evento', { ascending: false });

      if (eventosError) {
        console.error('❌ [EVENTOS] Erro ao buscar eventos:', eventosError);
      } else {
        console.log('✅ [EVENTOS] Eventos carregados:', eventosData?.length || 0);
        setEventos(eventosData || []);
      }

    } catch (error: any) {
      console.error('💥 [GRUPO] Erro geral:', error);
      setError(error.message);
      toast({
        title: "❌ Erro",
        description: error.message || "Não foi possível carregar os dados do grupo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDespesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!despesaForm.descricao || !despesaForm.valor) {
      toast({
        title: "❌ Erro",
        description: "Descrição e valor são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💰 [DESPESA] Criando despesa:', despesaForm);

      const { error } = await supabase
        .from('despesas_grupos')
        .insert([{
          grupo_id: id,
          ...despesaForm,
          valor: parseFloat(despesaForm.valor)
        }]);

      if (error) throw error;

      toast({
        title: "✅ Despesa adicionada",
        description: "Despesa foi registada com sucesso",
      });

      setDespesaDialogOpen(false);
      setDespesaForm({
        descricao: "",
        valor: "",
        data_despesa: new Date().toISOString().split('T')[0],
        categoria: "",
        observacoes: ""
      });
      
      await fetchGrupoData();
    } catch (error: any) {
      console.error('💥 [DESPESA] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar a despesa",
        variant: "destructive",
      });
    }
  };

  const handleEventoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventoForm.titulo) {
      toast({
        title: "❌ Erro",
        description: "Título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('📅 [EVENTO] Criando evento:', eventoForm);

      const { error } = await supabase
        .from('eventos_grupos')
        .insert([{
          grupo_id: id,
          ...eventoForm
        }]);

      if (error) throw error;

      toast({
        title: "✅ Evento adicionado",
        description: "Evento foi registado com sucesso",
      });

      setEventoDialogOpen(false);
      setEventoForm({
        titulo: "",
        descricao: "",
        data_evento: new Date().toISOString().split('T')[0],
        tipo_evento: "",
        observacoes: ""
      });
      
      await fetchGrupoData();
    } catch (error: any) {
      console.error('💥 [EVENTO] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar o evento",
        variant: "destructive",
      });
    }
  };

  const handleAssociarAnimal = async (animalId: string) => {
    try {
      console.log('🔗 [ASSOCIAR] Associando animal ao grupo:', animalId);

      const { error } = await supabase
        .from('animais')
        .update({ grupo_id: id })
        .eq('id', animalId);

      if (error) throw error;

      toast({
        title: "✅ Animal associado",
        description: "Animal foi associado ao grupo com sucesso",
      });

      await fetchGrupoData();
    } catch (error: any) {
      console.error('💥 [ASSOCIAR] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível associar o animal",
        variant: "destructive",
      });
    }
  };

  const handleTransferirAnimal = async (animalId: string, animalNome: string, grupoAtual: string) => {
    const confirmTransferir = confirm(
      `Tem certeza que deseja transferir "${animalNome}" do grupo "${grupoAtual}" para "${grupo?.nome}"?`
    );
    
    if (!confirmTransferir) return;

    try {
      console.log('🔄 [TRANSFERIR] Transferindo animal:', animalNome);

      const { error } = await supabase
        .from('animais')
        .update({ grupo_id: id })
        .eq('id', animalId);

      if (error) throw error;

      toast({
        title: "✅ Animal transferido",
        description: `${animalNome} foi transferido para ${grupo?.nome}`,
      });

      await fetchGrupoData();
    } catch (error: any) {
      console.error('💥 [TRANSFERIR] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível transferir o animal",
        variant: "destructive",
      });
    }
  };

  const handleDesassociarAnimal = async (animalId: string, animalNome: string) => {
    const confirmDesassociar = confirm(
      `Tem certeza que deseja remover "${animalNome}" deste grupo?`
    );
    
    if (!confirmDesassociar) return;

    try {
      console.log('🔓 [DESASSOCIAR] Removendo animal do grupo:', animalId);

      const { error } = await supabase
        .from('animais')
        .update({ grupo_id: null })
        .eq('id', animalId);

      if (error) throw error;

      toast({
        title: "✅ Animal removido",
        description: `${animalNome} foi removido do grupo`,
      });

      await fetchGrupoData();
    } catch (error: any) {
      console.error('💥 [DESASSOCIAR] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover o animal",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'Matilha':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Dog className="h-4 w-4 mr-1" />Matilha</Badge>;
      case 'Colónia':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200"><Cat className="h-4 w-4 mr-1" />Colónia</Badge>;
      case 'Sócios':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200"><Users className="h-4 w-4 mr-1" />Sócios</Badge>;
      case 'Especiais':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200"><Heart className="h-4 w-4 mr-1" />Especiais</Badge>;
      case 'Temporários':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200"><Calendar className="h-4 w-4 mr-1" />Temporários</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><Users className="h-4 w-4 mr-1" />{tipo}</Badge>;
    }
  };

  const getTipoDescricao = (tipo: string) => {
    switch (tipo) {
      case 'Matilha':
        return 'Apenas cães podem ser adicionados a este grupo';
      case 'Colónia':
        return 'Apenas gatos podem ser adicionados a este grupo';
      case 'Sócios':
        return 'Animais cujo detentor/responsável é sócio da associação. Inclui todos os tipos (ativos e adotados)';
      case 'Especiais':
        return 'Animais com necessidades especiais ou cuidados específicos. Todos os tipos aceitos';
      case 'Temporários':
        return 'Grupo temporário para situações específicas ou eventos pontuais. Todos os tipos aceitos';
      default:
        return 'Todos os tipos de animais podem ser adicionados a este grupo';
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Ativo':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'Adotado':
        return <Badge className="bg-blue-100 text-blue-800">Adotado</Badge>;
      case 'Óbito':
        return <Badge className="bg-gray-100 text-gray-800">Óbito</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar dados do grupo...</p>
        </div>
      </div>
    );
  }

  if (error || !grupo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Erro ao Carregar</CardTitle>
            <CardDescription>
              {error || "Grupo não encontrado"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button onClick={fetchGrupoData}>
              <Loader2 className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button variant="outline" asChild>
              <Link to="/grupos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Grupos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/grupos">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Grupos
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                {grupo.tipo === 'matilha' ? (
                  <Dog className="h-6 w-6 text-blue-600" />
                ) : (
                  <Cat className="h-6 w-6 text-purple-600" />
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{grupo.nome}</h1>
                  <p className="text-sm text-gray-500">
                    {grupo.localizacao} • {grupo.responsavel_nome}
                  </p>
                </div>
              </div>
            </div>
            {getTipoBadge(grupo.tipo)}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações Básicas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Informações do Grupo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Nome</Label>
                <p className="text-lg font-semibold">{grupo.nome}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                <div className="mt-1">
                  {getTipoBadge(grupo.tipo)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Data de Criação</Label>
                <p className="text-lg">{formatDate(grupo.data_criacao)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Localização</Label>
                <p className="text-lg">{grupo.localizacao || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Endereço</Label>
                <p className="text-lg">{grupo.endereco || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Responsável</Label>
                <p className="text-lg">{grupo.responsavel_nome || 'N/A'}</p>
              </div>
              {grupo.contacto_cuidador && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contacto</Label>
                  <p className="text-lg">{grupo.contacto_cuidador}</p>
                </div>
              )}
              {grupo.observacoes && (
                <div className="md:col-span-2 lg:col-span-3">
                  <Label className="text-sm font-medium text-gray-600">Observações</Label>
                  <p className="text-lg">{grupo.observacoes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Animais no Grupo</p>
                  <p className="text-3xl font-bold text-blue-600">{animais.length}</p>
                </div>
                <PawPrint className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Despesas</p>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eventos Registados</p>
                  <p className="text-3xl font-bold text-green-600">{eventos.length}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com conteúdo */}
        <Tabs defaultValue="animais" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="animais">Animais ({animais.length})</TabsTrigger>
            <TabsTrigger value="despesas">Despesas ({despesas.length})</TabsTrigger>
            <TabsTrigger value="eventos">Eventos ({eventos.length})</TabsTrigger>
          </TabsList>

          {/* Tab Animais */}
          <TabsContent value="animais">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Animais do Grupo</CardTitle>
                    <CardDescription>
                      {grupo.tipo === 'matilha' ? 'Cães' : 'Gatos'} associados a este grupo
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {hasPermission('update') && (
                      <Dialog open={animalDialogOpen} onOpenChange={setAnimalDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Associar Animal
                          </Button>
                        </DialogTrigger>
                      <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Associar Animal ao Grupo</DialogTitle>
                        <DialogDescription>
                          Selecione um {grupo.tipo === 'matilha' ? 'cão' : 'gato'} para associar a este grupo
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Resumo de animais */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">
                            Resumo de {grupo.tipo === 'matilha' ? 'Cães' : 'Gatos'}
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-blue-700">Total da espécie:</span>
                              <span className="font-medium ml-2">{todosAnimaisEspecie.length}</span>
                            </div>
                            <div>
                              <span className="text-green-700">Disponíveis:</span>
                              <span className="font-medium ml-2">{animaisDisponiveis.length}</span>
                            </div>
                            <div>
                              <span className="text-orange-700">Em outros grupos:</span>
                              <span className="font-medium ml-2">
                                {todosAnimaisEspecie.filter(a => a.grupo_id && a.grupo_id !== id).length}
                              </span>
                            </div>
                            <div>
                              <span className="text-red-700">Não ativos:</span>
                              <span className="font-medium ml-2">
                                {todosAnimaisEspecie.filter(a => a.estado !== 'Ativo' || a.arquivado).length}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Lista de animais disponíveis */}
                        {animaisDisponiveis.length === 0 ? (
                          <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium mb-2">
                              Não há {grupo.tipo === 'matilha' ? 'cães' : 'gatos'} disponíveis
                            </p>
                            <p className="text-sm text-gray-500">
                              Todos os animais desta espécie já pertencem a grupos, não estão ativos ou estão arquivados
                            </p>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">
                              Animais Disponíveis ({animaisDisponiveis.length})
                            </h4>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                              {animaisDisponiveis.map((animal) => (
                                <div key={animal.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                  <div>
                                    <p className="font-medium">{animal.nome}</p>
                                    <p className="text-sm text-gray-500">
                                      {animal.raca} • {animal.sexo} • Processo: {animal.numero_processo}
                                    </p>
                                    <div className="flex items-center mt-1">
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        {animal.estado}
                                      </Badge>
                                    </div>
                                  </div>
                                  {hasPermission('update') && (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        handleAssociarAnimal(animal.id);
                                        setAnimalDialogOpen(false);
                                      }}
                                    >
                                      Associar
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lista de animais não disponíveis (para debug) */}
                        {todosAnimaisEspecie.length > animaisDisponiveis.length && (
                          <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-700 mb-3">
                              Animais Não Disponíveis ({todosAnimaisEspecie.length - animaisDisponiveis.length})
                            </h4>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                              {todosAnimaisEspecie
                                .filter(animal => 
                                  animal.grupo_id !== null || 
                                  animal.estado !== 'Ativo' || 
                                  animal.arquivado
                                )
                                .map((animal) => {
                                  let motivo = '';
                                  let corBadge = 'bg-gray-100 text-gray-800';
                                  let podeTransferir = false;
                                  
                                  if (animal.arquivado) {
                                    motivo = 'Arquivado';
                                    corBadge = 'bg-red-100 text-red-800';
                                  } else if (animal.estado !== 'Ativo') {
                                    motivo = animal.estado;
                                    corBadge = 'bg-yellow-100 text-yellow-800';
                                  } else if (animal.grupo_id) {
                                    motivo = animal.grupos?.nome ? `Em: ${animal.grupos.nome}` : 'Em outro grupo';
                                    corBadge = 'bg-blue-100 text-blue-800';
                                    podeTransferir = animal.grupo_id !== id; // Pode transferir se não for do grupo atual
                                  }
                                  
                                  return (
                                    <div key={animal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-700">{animal.nome}</p>
                                        <p className="text-sm text-gray-500">
                                          {animal.raca} • {animal.sexo} • Processo: {animal.numero_processo}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Badge className={`text-xs ${corBadge}`}>
                                          {motivo}
                                        </Badge>
                                        {podeTransferir && hasPermission('update') && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              handleTransferirAnimal(animal.id, animal.nome, animal.grupos?.nome || 'Desconhecido');
                                              setAnimalDialogOpen(false);
                                            }}
                                            className="text-xs"
                                          >
                                            Transferir
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  )}
                  
                  {hasPermission('update') && (
                    <Dialog open={transferirDialogOpen} onOpenChange={setTransferirDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Transferir de Outros Grupos
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Transferir Animal de Outro Grupo</DialogTitle>
                        <DialogDescription>
                          Transferir {grupo.tipo === 'matilha' ? 'cães' : 'gatos'} que já pertencem a outros grupos
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {todosAnimaisEspecie.filter(a => a.grupo_id && a.grupo_id !== id && !a.arquivado && a.estado === 'Ativo').length === 0 ? (
                          <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium mb-2">
                              Não há {grupo.tipo === 'matilha' ? 'cães' : 'gatos'} em outros grupos
                            </p>
                            <p className="text-sm text-gray-500">
                              Todos os animais desta espécie estão disponíveis ou já pertencem a este grupo
                            </p>
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {todosAnimaisEspecie
                              .filter(a => a.grupo_id && a.grupo_id !== id && !a.arquivado && a.estado === 'Ativo')
                              .map((animal) => (
                                <div key={animal.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                  <div>
                                    <p className="font-medium">{animal.nome}</p>
                                    <p className="text-sm text-gray-500">
                                      {animal.raca} • {animal.sexo} • Processo: {animal.numero_processo}
                                    </p>
                                    <div className="flex items-center mt-1">
                                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                                        Grupo: {animal.grupos?.nome || 'Desconhecido'}
                                      </Badge>
                                    </div>
                                  </div>
                                  {hasPermission('update') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        handleTransferirAnimal(animal.id, animal.nome, animal.grupos?.nome || 'Desconhecido');
                                        setTransferirDialogOpen(false);
                                      }}
                                    >
                                      Transferir
                                    </Button>
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
              <CardContent>
                {animais.length === 0 ? (
                  <div className="text-center py-12">
                    <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum animal no grupo
                    </h3>
                    <p className="text-gray-500">
                      Associe {grupo.tipo === 'matilha' ? 'cães' : 'gatos'} a este grupo
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Animal</TableHead>
                          <TableHead>Raça</TableHead>
                          <TableHead>Sexo</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {animais.map((animal) => (
                          <TableRow key={animal.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                {/* Fotografia do Animal */}
                                <div className="flex-shrink-0">
                                  {animal.url_fotografia ? (
                                    <img 
                                      src={convertGoogleDriveUrl(animal.url_fotografia)} 
                                      alt={`Foto de ${animal.nome}`}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  {/* Placeholder quando não há foto */}
                                  <div 
                                    className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                                      animal.url_fotografia ? 'hidden' : 'flex'
                                    }`}
                                  >
                                    {animal.nome.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                {/* Informações do Animal */}
                                <div>
                                  <div className="font-medium">{animal.nome}</div>
                                  <div className="text-sm text-gray-500">
                                    Processo: {animal.numero_processo}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{animal.raca}</TableCell>
                            <TableCell>{animal.sexo}</TableCell>
                            <TableCell>
                              {getEstadoBadge(animal.estado)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                >
                                  <Link to={`/animal/${animal.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                {hasPermission('update') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDesassociarAnimal(animal.id, animal.nome)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <UserMinus className="h-4 w-4" />
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
          </TabsContent>

          {/* Tab Despesas */}
          <TabsContent value="despesas">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Despesas do Grupo</CardTitle>
                    <CardDescription>
                      Total: {formatCurrency(totalDespesas)}
                    </CardDescription>
                  </div>
                  {hasPermission('create') && (
                    <Dialog open={despesaDialogOpen} onOpenChange={setDespesaDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Despesa
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Despesa</DialogTitle>
                        <DialogDescription>
                          Registar uma nova despesa para este grupo
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleDespesaSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="descricao">Descrição *</Label>
                          <Input
                            id="descricao"
                            value={despesaForm.descricao}
                            onChange={(e) => setDespesaForm({...despesaForm, descricao: e.target.value})}
                            placeholder="Descrição da despesa"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="valor">Valor (€) *</Label>
                            <Input
                              id="valor"
                              type="number"
                              step="0.01"
                              min="0"
                              value={despesaForm.valor}
                              onChange={(e) => setDespesaForm({...despesaForm, valor: e.target.value})}
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="data_despesa">Data</Label>
                            <Input
                              id="data_despesa"
                              type="date"
                              value={despesaForm.data_despesa}
                              onChange={(e) => setDespesaForm({...despesaForm, data_despesa: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="categoria">Categoria</Label>
                          <Select 
                            value={despesaForm.categoria} 
                            onValueChange={(value) => setDespesaForm({...despesaForm, categoria: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Alimentação">Alimentação</SelectItem>
                              <SelectItem value="Veterinário">Veterinário</SelectItem>
                              <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                              <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                              <SelectItem value="Transporte">Transporte</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="observacoes_despesa">Observações</Label>
                          <Textarea
                            id="observacoes_despesa"
                            value={despesaForm.observacoes}
                            onChange={(e) => setDespesaForm({...despesaForm, observacoes: e.target.value})}
                            placeholder="Observações adicionais"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setDespesaDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">
                            Registar Despesa
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {despesas.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma despesa registada
                    </h3>
                    <p className="text-gray-500">
                      Comece registando as despesas deste grupo
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {despesas.map((despesa) => (
                          <TableRow key={despesa.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{despesa.descricao}</div>
                                {despesa.observacoes && (
                                  <div className="text-sm text-gray-500">{despesa.observacoes}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {despesa.categoria && (
                                <Badge variant="outline">{despesa.categoria}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-red-600">
                              {formatCurrency(despesa.valor)}
                            </TableCell>
                            <TableCell>{formatDate(despesa.data_despesa)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Eventos */}
          <TabsContent value="eventos">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Eventos do Grupo</CardTitle>
                    <CardDescription>
                      Histórico de eventos e atividades
                    </CardDescription>
                  </div>
                  <Dialog open={eventoDialogOpen} onOpenChange={setEventoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Evento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Novo Evento</DialogTitle>
                        <DialogDescription>
                          Registar um novo evento para este grupo
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEventoSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="titulo">Título *</Label>
                          <Input
                            id="titulo"
                            value={eventoForm.titulo}
                            onChange={(e) => setEventoForm({...eventoForm, titulo: e.target.value})}
                            placeholder="Título do evento"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="data_evento">Data</Label>
                            <Input
                              id="data_evento"
                              type="date"
                              value={eventoForm.data_evento}
                              onChange={(e) => setEventoForm({...eventoForm, data_evento: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="tipo_evento">Tipo</Label>
                            <Select 
                              value={eventoForm.tipo_evento} 
                              onValueChange={(value) => setEventoForm({...eventoForm, tipo_evento: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Tipo de evento" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Alimentação">Alimentação</SelectItem>
                                <SelectItem value="Vacinação">Vacinação</SelectItem>
                                <SelectItem value="Esterilização">Esterilização</SelectItem>
                                <SelectItem value="Resgate">Resgate</SelectItem>
                                <SelectItem value="Adoção">Adoção</SelectItem>
                                <SelectItem value="Visita Veterinária">Visita Veterinária</SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="descricao_evento">Descrição</Label>
                          <Textarea
                            id="descricao_evento"
                            value={eventoForm.descricao}
                            onChange={(e) => setEventoForm({...eventoForm, descricao: e.target.value})}
                            placeholder="Descrição do evento"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="observacoes_evento">Observações</Label>
                          <Textarea
                            id="observacoes_evento"
                            value={eventoForm.observacoes}
                            onChange={(e) => setEventoForm({...eventoForm, observacoes: e.target.value})}
                            placeholder="Observações adicionais"
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setEventoDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">
                            Registar Evento
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {eventos.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum evento registado
                    </h3>
                    <p className="text-gray-500">
                      Comece registando os eventos deste grupo
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Evento</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eventos.map((evento) => (
                          <TableRow key={evento.id}>
                            <TableCell>
                              <div className="font-medium">{evento.titulo}</div>
                            </TableCell>
                            <TableCell>
                              {evento.tipo_evento && (
                                <Badge variant="outline">{evento.tipo_evento}</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(evento.data_evento)}</TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                {evento.descricao && (
                                  <p className="text-sm text-gray-600 truncate">{evento.descricao}</p>
                                )}
                                {evento.observacoes && (
                                  <p className="text-xs text-gray-500 truncate">{evento.observacoes}</p>
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
          </TabsContent>
        </Tabs>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default GrupoDetail;