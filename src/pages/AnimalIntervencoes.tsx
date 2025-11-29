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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2,
  PawPrint,
  Loader2,
  AlertCircle,
  Stethoscope,
  Calendar,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Intervencao, TipoIntervencao, Voluntario, ClinicaVeterinaria } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";

const AnimalIntervencoes = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados para intervenções
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [tiposIntervencoes, setTiposIntervencoes] = useState<TipoIntervencao[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [clinicas, setClinicas] = useState<ClinicaVeterinaria[]>([]);
  const [intervencaoDialogOpen, setIntervencaoDialogOpen] = useState(false);
  const [editingIntervencao, setEditingIntervencao] = useState<Intervencao | null>(null);

  // Formulário de intervenção
  const [intervencaoForm, setIntervencaoForm] = useState({
    tipo_intervencao_id: '',
    data_intervencao: '',
    veterinario: '',
    clinica_id: '',
    observacoes: '',
    custo: '',
    desconto_protocolo: '',
    urgente: false
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
      // Carregar intervenções
      const { data: intervencoesData } = await supabase
        .from('intervencoes')
        .select(`
          *,
          tipos_intervencoes(nome),
          clinicas_veterinarias(nome, tem_protocolo)
        `)
        .eq('animal_id', id)
        .order('data_intervencao', { ascending: false });

      if (intervencoesData) {
        setIntervencoes(intervencoesData);
      }

      // Carregar tipos de intervenções
      const { data: tiposData } = await supabase
        .from('tipos_intervencoes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (tiposData) {
        setTiposIntervencoes(tiposData);
      }

      // Carregar voluntários
      const { data: voluntariosData } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (voluntariosData) {
        setVoluntarios(voluntariosData);
      }

      // Carregar clínicas veterinárias
      const { data: clinicasData } = await supabase
        .from('clinicas_veterinarias')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (clinicasData) {
        setClinicas(clinicasData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
    }
  };

  useEffect(() => {
    fetchAnimalData();
  }, [id]);

  // Funções de gestão de intervenções
  const resetIntervencaoForm = () => {
    setIntervencaoForm({
      tipo_intervencao_id: '',
      data_intervencao: '',
      veterinario: '',
      clinica_id: '',
      observacoes: '',
      custo: '',
      desconto_protocolo: '',
      urgente: false
    });
  };

  const openIntervencaoDialog = (intervencao?: Intervencao) => {
    if (intervencao) {
      setEditingIntervencao(intervencao);
      setIntervencaoForm({
        tipo_intervencao_id: intervencao.tipo_intervencao_id || '',
        data_intervencao: intervencao.data_intervencao || '',
        veterinario: intervencao.veterinario || '',
        clinica_id: intervencao.clinica_id || '',
        observacoes: intervencao.observacoes || '',
        custo: intervencao.custo?.toString() || '',
        desconto_protocolo: intervencao.desconto_protocolo?.toString() || '',
        urgente: intervencao.urgente || false
      });
    } else {
      setEditingIntervencao(null);
      resetIntervencaoForm();
    }
    setIntervencaoDialogOpen(true);
  };

  const handleIntervencaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const intervencaoData = {
        animal_id: id,
        tipo_intervencao_id: intervencaoForm.tipo_intervencao_id,
        data_intervencao: intervencaoForm.data_intervencao,
        veterinario: intervencaoForm.veterinario,
        clinica_id: intervencaoForm.clinica_id || null,
        observacoes: intervencaoForm.observacoes,
        custo: intervencaoForm.custo ? parseFloat(intervencaoForm.custo) : null,
        desconto_protocolo: intervencaoForm.desconto_protocolo ? parseFloat(intervencaoForm.desconto_protocolo) : null,
        urgente: intervencaoForm.urgente,
        concluida: true // Sempre concluída na data
      };

      let error;
      if (editingIntervencao) {
        const { error: updateError } = await supabase
          .from('intervencoes')
          .update(intervencaoData)
          .eq('id', editingIntervencao.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('intervencoes')
          .insert([intervencaoData]);
        error = insertError;
      }

      if (error) {
        console.error('Erro ao salvar intervenção:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar a intervenção",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: editingIntervencao ? "Intervenção atualizada" : "Intervenção registrada",
        description: editingIntervencao ? "Intervenção atualizada com sucesso" : "Nova intervenção registrada com sucesso",
      });

      setIntervencaoDialogOpen(false);
      resetIntervencaoForm();
      setEditingIntervencao(null);
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

  const handleDeleteIntervencao = async (intervencaoId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta intervenção?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('intervencoes')
        .delete()
        .eq('id', intervencaoId);

      if (error) {
        console.error('Erro ao eliminar intervenção:', error);
        toast({
          title: "Erro ao eliminar",
          description: "Não foi possível eliminar a intervenção",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Intervenção eliminada",
        description: "Intervenção eliminada com sucesso",
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

  // Função para determinar status da intervenção
  const getIntervencaoStatus = (dataIntervencao: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const dataInterv = new Date(dataIntervencao);
    dataInterv.setHours(0, 0, 0, 0);
    
    if (dataInterv.getTime() === hoje.getTime()) {
      return { status: 'Hoje', color: 'bg-orange-100 text-orange-800' };
    } else if (dataInterv > hoje) {
      return { status: 'Agendada', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'Concluída', color: 'bg-green-100 text-green-800' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar intervenções...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title={`${animal.nome} - Intervenções Médicas`}
        subtitle={`${animal.especie} • ${animal.sexo} • ${animal.estado}`}
        backTo={`/animal/${id}`}
      />

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
          <Button onClick={() => openIntervencaoDialog()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Intervenção
          </Button>
        </div>

        {/* Lista de Intervenções */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Stethoscope className="h-6 w-6 mr-2" />
              Histórico de Intervenções Médicas
            </CardTitle>
            <CardDescription className="text-blue-600">
              Registo completo de consultas, tratamentos e procedimentos médicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {intervencoes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Veterinário</TableHead>
                      <TableHead>Clínica</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {intervencoes.map((intervencao) => {
                      const statusInfo = getIntervencaoStatus(intervencao.data_intervencao);
                      return (
                        <TableRow key={intervencao.id}>
                          <TableCell>
                            {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-600">
                              {intervencao.tipos_intervencoes?.nome || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>{intervencao.veterinario || 'N/A'}</TableCell>
                          <TableCell>
                            {intervencao.clinicas_veterinarias?.nome ? (
                              <div className="flex items-center space-x-2">
                                <span>{intervencao.clinicas_veterinarias.nome}</span>
                                {intervencao.clinicas_veterinarias.tem_protocolo && (
                                  <Badge variant="outline" className="text-xs text-green-600">
                                    PROTOCOLO
                                  </Badge>
                                )}
                              </div>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {intervencao.custo_final || intervencao.custo ? (
                              <div>
                                <span className="font-semibold text-green-600">
                                  €{(intervencao.custo_final || intervencao.custo || 0).toFixed(2)}
                                </span>
                                {intervencao.desconto_protocolo && intervencao.desconto_protocolo > 0 && (
                                  <div className="text-xs text-green-600">
                                    Base: €{(intervencao.custo || 0).toFixed(2)} (-{intervencao.desconto_protocolo}%)
                                  </div>
                                )}
                              </div>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              {statusInfo.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openIntervencaoDialog(intervencao)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteIntervencao(intervencao.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhuma intervenção registrada</p>
                <p className="text-sm">Clique em "Nova Intervenção" para registrar a primeira consulta.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Diálogo de Intervenção */}
      <Dialog open={intervencaoDialogOpen} onOpenChange={setIntervencaoDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-blue-800">
              {editingIntervencao ? 'Editar Intervenção' : 'Nova Intervenção Médica'}
            </DialogTitle>
            <DialogDescription className="text-blue-600">
              {editingIntervencao ? 'Editar informações da intervenção' : `Registar nova intervenção médica para ${animal?.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleIntervencaoSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tipo_intervencao_id" className="text-blue-700 font-medium">
                Tipo de Intervenção *
              </Label>
              <Select 
                value={intervencaoForm.tipo_intervencao_id} 
                onValueChange={(value) => setIntervencaoForm({ ...intervencaoForm, tipo_intervencao_id: value })}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposIntervencoes.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data_intervencao" className="text-blue-700 font-medium">
                Data da Intervenção *
              </Label>
              <Input
                id="data_intervencao"
                type="date"
                value={intervencaoForm.data_intervencao}
                onChange={(e) => setIntervencaoForm({ ...intervencaoForm, data_intervencao: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="veterinario" className="text-blue-700 font-medium">
                Veterinário
              </Label>
              <Input
                id="veterinario"
                value={intervencaoForm.veterinario}
                onChange={(e) => setIntervencaoForm({ ...intervencaoForm, veterinario: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
                placeholder="Nome do veterinário"
              />
            </div>

            <div>
              <Label htmlFor="clinica_id" className="text-blue-700 font-medium">
                Clínica Veterinária
              </Label>
              <Select 
                value={intervencaoForm.clinica_id} 
                onValueChange={(value) => setIntervencaoForm({ ...intervencaoForm, clinica_id: value === "none" ? "" : value })}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Selecionar clínica (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Outra clínica</SelectItem>
                  {clinicas.map((clinica) => (
                    <SelectItem key={clinica.id} value={clinica.id}>
                      {clinica.nome} {clinica.tem_protocolo && '(PROTOCOLO)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custo" className="text-blue-700 font-medium">
                  Custo (€)
                </Label>
                <Input
                  id="custo"
                  type="number"
                  step="0.01"
                  value={intervencaoForm.custo}
                  onChange={(e) => setIntervencaoForm({ ...intervencaoForm, custo: e.target.value })}
                  className="border-blue-200 focus:border-blue-400"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="desconto_protocolo" className="text-blue-700 font-medium">
                  Desconto (%)
                </Label>
                <Input
                  id="desconto_protocolo"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={intervencaoForm.desconto_protocolo}
                  onChange={(e) => setIntervencaoForm({ ...intervencaoForm, desconto_protocolo: e.target.value })}
                  className="border-blue-200 focus:border-blue-400"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="observacoes" className="text-blue-700 font-medium">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={intervencaoForm.observacoes}
                onChange={(e) => setIntervencaoForm({ ...intervencaoForm, observacoes: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
                placeholder="Observações sobre a intervenção..."
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> A intervenção será marcada como concluída automaticamente na data especificada.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIntervencaoDialogOpen(false);
                  resetIntervencaoForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingIntervencao ? 'Atualizar' : 'Registar Intervenção'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalIntervencoes;