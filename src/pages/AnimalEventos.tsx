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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2,
  PawPrint,
  Loader2,
  AlertCircle,
  Calendar,
  Star,
  Clock,
  User,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, EventoAnimal, TipoEvento, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";

const AnimalEventos = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados para eventos
  const [eventos, setEventos] = useState<EventoAnimal[]>([]);
  const [tiposEventos, setTiposEventos] = useState<TipoEvento[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoAnimal | null>(null);

  // Formulário de evento
  const [eventoForm, setEventoForm] = useState({
    tipo_evento: '',
    data_evento: '',
    descricao: '',
    observacoes: '',
    voluntario_id: '',
    documento_referencia: '',
    importante: false
  });

  // Função para carregar dados do animal
  const fetchAnimalData = async () => {
    if (!id) {
      setError("ID do animal não fornecido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao carregar animal:', error);
        setError('Erro ao carregar dados do animal');
        return;
      }

      if (!data) {
        setError('Animal não encontrado');
        return;
      }

      setAnimal(data);
      await loadRelatedData();
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro inesperado ao carregar animal');
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar dados relacionados
  const loadRelatedData = async () => {
    try {
      // Carregar eventos com joins robustos
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos_animal')
        .select(`
          *,
          tipos_eventos(id, nome, emoji, descricao),
          voluntarios(id, nome, email, telefone)
        `)
        .eq('animal_id', id)
        .order('data_evento', { ascending: false });

      if (eventosError) {
        console.error('Erro ao carregar eventos:', eventosError);
        // Fallback: carregar eventos sem joins se houver erro
        const { data: eventosFallback } = await supabase
          .from('eventos_animal')
          .select('*')
          .eq('animal_id', id)
          .order('data_evento', { ascending: false });
        
        setEventos(eventosFallback || []);
      } else {
        setEventos(eventosData || []);
      }

      // Carregar tipos de eventos
      const { data: tiposEventosData } = await supabase
        .from('tipos_eventos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      setTiposEventos(tiposEventosData || []);

      // Carregar voluntários
      const { data: voluntariosData } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      setVoluntarios(voluntariosData || []);

    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
    }
  };

  useEffect(() => {
    fetchAnimalData();
  }, [id]);

  // Funções de gestão de eventos
  const resetEventoForm = () => {
    setEventoForm({
      tipo_evento: '',
      data_evento: '',
      descricao: '',
      observacoes: '',
      voluntario_id: '',
      documento_referencia: '',
      importante: false
    });
  };

  const openEventoDialog = (evento?: EventoAnimal) => {
    if (evento) {
      setEditingEvento(evento);
      setEventoForm({
        tipo_evento: evento.tipo_evento?.toString() || '',
        data_evento: evento.data_evento || '',
        descricao: evento.descricao || '',
        observacoes: evento.observacoes || '',
        voluntario_id: evento.voluntario_id || '',
        documento_referencia: evento.documento_referencia || '',
        importante: evento.importante || false
      });
    } else {
      setEditingEvento(null);
      resetEventoForm();
    }
    setEventoDialogOpen(true);
  };

  const handleEventoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventoData = {
        animal_id: id,
        tipo_evento: parseInt(eventoForm.tipo_evento),
        titulo: eventoForm.descricao,
        data_evento: eventoForm.data_evento,
        descricao: eventoForm.descricao,
        observacoes: eventoForm.observacoes,
        voluntario_id: eventoForm.voluntario_id || null,
        documento_referencia: eventoForm.documento_referencia,
        importante: eventoForm.importante
      };

      let error;
      if (editingEvento) {
        const { error: updateError } = await supabase
          .from('eventos_animal')
          .update(eventoData)
          .eq('id', editingEvento.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('eventos_animal')
          .insert([eventoData]);
        error = insertError;
      }

      if (error) {
        console.error('Erro ao salvar evento:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar o evento",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: editingEvento ? "Evento atualizado" : "Evento registrado",
        description: editingEvento ? "Evento atualizado com sucesso" : "Novo evento registrado com sucesso",
      });

      setEventoDialogOpen(false);
      resetEventoForm();
      setEditingEvento(null);
      await loadRelatedData();

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvento = async (eventoId: string) => {
    if (!confirm('Tem certeza que deseja eliminar este evento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('eventos_animal')
        .delete()
        .eq('id', eventoId);

      if (error) {
        console.error('Erro ao eliminar evento:', error);
        toast({
          title: "Erro ao eliminar",
          description: "Não foi possível eliminar o evento",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Evento eliminado",
        description: "Evento eliminado com sucesso",
      });

      await loadRelatedData();

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Função para formatar data relativa
  const getRelativeDate = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    if (diffDays === -1) return "Ontem";
    if (diffDays > 0) return `Em ${diffDays} dias`;
    if (diffDays < 0) return `Há ${Math.abs(diffDays)} dias`;
    return eventDate.toLocaleDateString('pt-PT');
  };

  // Função para obter emoji do tipo de evento
  const getTipoEventoInfo = (tipoId: number) => {
    const tipo = tiposEventos.find(t => t.id === tipoId);
    return {
      emoji: tipo?.emoji || '📅',
      nome: tipo?.nome || 'Evento'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-lg text-gray-600">A carregar eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Link to="/animais">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Animais
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 mb-4">Animal não encontrado</p>
          <Link to="/animais">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Animais
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navegação */}
        <div className="flex items-center space-x-4">
          <Link to={`/animal/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Ficha
            </Button>
          </Link>
          <div className="flex-1" />
          <Button onClick={() => openEventoDialog()} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        {/* Timeline de Eventos */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Calendar className="h-6 w-6 mr-2" />
              Timeline de Eventos ({eventos.length})
            </CardTitle>
            <CardDescription className="text-green-600">
              Histórico cronológico de marcos importantes na vida do animal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventos.length > 0 ? (
              <div className="space-y-6">
                {eventos.map((evento, index) => {
                  const tipoInfo = getTipoEventoInfo(evento.tipo_evento);
                  return (
                    <div key={evento.id} className="relative">
                      {/* Linha da timeline */}
                      {index < eventos.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-green-200"></div>
                      )}
                      
                      {/* Card do evento */}
                      <div className="flex items-start space-x-4">
                        {/* Ícone do evento */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg ${
                          evento.importante ? 'bg-red-500' : 'bg-green-500'
                        }`}>
                          {tipoInfo.emoji}
                        </div>
                        
                        {/* Conteúdo do evento */}
                        <div className="flex-1 min-w-0">
                          <Card className={`${evento.importante ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-semibold text-gray-900">{evento.descricao}</h3>
                                    {evento.importante && (
                                      <Badge className="bg-red-100 text-red-800">
                                        <Star className="h-3 w-3 mr-1" />
                                        IMPORTANTE
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {new Date(evento.data_evento).toLocaleDateString('pt-PT')}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {getRelativeDate(evento.data_evento)}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {tipoInfo.nome}
                                    </Badge>
                                  </div>
                                  
                                  {evento.voluntarios?.nome && (
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                      <User className="h-4 w-4 mr-1" />
                                      Responsável: {evento.voluntarios.nome}
                                    </div>
                                  )}
                                  
                                  {evento.documento_referencia && (
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                      <FileText className="h-4 w-4 mr-1" />
                                      Documento: {evento.documento_referencia}
                                    </div>
                                  )}
                                  
                                  {evento.observacoes && (
                                    <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                                      {evento.observacoes}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEventoDialog(evento)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteEvento(evento.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum evento registrado</p>
                <p className="text-sm">Clique em "Novo Evento" para registrar o primeiro marco importante.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Diálogo de Evento */}
      <Dialog open={eventoDialogOpen} onOpenChange={setEventoDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-green-800">
              {editingEvento ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
            <DialogDescription className="text-green-600">
              {editingEvento ? 'Editar informações do evento' : `Registar novo evento para ${animal?.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEventoSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tipo_evento" className="text-green-700 font-medium">
                Tipo de Evento *
              </Label>
              <Select 
                value={eventoForm.tipo_evento} 
                onValueChange={(value) => setEventoForm({ ...eventoForm, tipo_evento: value })}
              >
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEventos.length === 0 && (
                    <SelectItem value="loading" disabled>
                      Carregando tipos...
                    </SelectItem>
                  )}
                  {tiposEventos.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.emoji} {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data_evento" className="text-green-700 font-medium">
                Data do Evento *
              </Label>
              <Input
                id="data_evento"
                type="date"
                value={eventoForm.data_evento}
                onChange={(e) => setEventoForm({ ...eventoForm, data_evento: e.target.value })}
                className="border-green-200 focus:border-green-400"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="descricao" className="text-green-700 font-medium">
                Descrição do Evento *
              </Label>
              <Input
                id="descricao"
                value={eventoForm.descricao}
                onChange={(e) => setEventoForm({ ...eventoForm, descricao: e.target.value })}
                className="border-green-200 focus:border-green-400"
                placeholder="Breve descrição do evento"
                required
              />
            </div>

            <div>
              <Label htmlFor="voluntario_id" className="text-green-700 font-medium">
                Voluntário Responsável
              </Label>
              <Select 
                value={eventoForm.voluntario_id} 
                onValueChange={(value) => setEventoForm({ ...eventoForm, voluntario_id: value === "none" ? "" : value })}
              >
                <SelectTrigger className="border-green-200 focus:border-green-400">
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

            <div>
              <Label htmlFor="documento_referencia" className="text-green-700 font-medium">
                Documento de Referência
              </Label>
              <Input
                id="documento_referencia"
                value={eventoForm.documento_referencia}
                onChange={(e) => setEventoForm({ ...eventoForm, documento_referencia: e.target.value })}
                className="border-green-200 focus:border-green-400"
                placeholder="Ex: Certificado, Relatório, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="observacoes" className="text-green-700 font-medium">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={eventoForm.observacoes}
                onChange={(e) => setEventoForm({ ...eventoForm, observacoes: e.target.value })}
                className="border-green-200 focus:border-green-400"
                placeholder="Detalhes adicionais sobre o evento..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="importante"
                checked={eventoForm.importante}
                onCheckedChange={(checked) => setEventoForm({ ...eventoForm, importante: !!checked })}
              />
              <Label htmlFor="importante" className="text-green-700 font-medium">
                Marcar como evento importante
              </Label>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Dica:</strong> Eventos importantes aparecem destacados na timeline e são úteis para marcos significativos.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setEventoDialogOpen(false);
                  resetEventoForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingEvento ? 'Atualizar' : 'Registar Evento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default AnimalEventos;