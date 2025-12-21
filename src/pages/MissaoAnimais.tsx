import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  PawPrint,
  Loader2,
  AlertCircle,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Shield,
  Heart,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interfaces
interface Missao {
  id: string;
  codigo: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  status: string;
}

interface MissaoAnimal {
  id: string;
  missao_id: string;
  animal_id: string;
  funcao_animal: string;
  data_vinculacao: string;
  data_desvinculacao?: string;
  status_participacao: string;
  observacoes?: string;
  created_at: string;
}

interface Animal {
  id: string;
  nome: string;
  especie: string;
  numero_processo: string;
  idade_estimada?: number;
  genero?: string;
}

const MissaoAnimais = () => {
  const { id } = useParams();
  const [missao, setMissao] = useState<Missao | null>(null);
  const [missoesAnimais, setMissoesAnimais] = useState<MissaoAnimal[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Estados para diálogos
  const [animalDialogOpen, setAnimalDialogOpen] = useState(false);
  const [editingMissaoAnimal, setEditingMissaoAnimal] = useState<MissaoAnimal | null>(null);

  // Estados para formulários
  const [animalForm, setAnimalForm] = useState({
    animal_id: '',
    funcao_animal: 'participante',
    data_vinculacao: '',
    data_desvinculacao: '',
    observacoes: ''
  });

  // Carregar dados
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadMissao(),
        loadMissoesAnimais(),
        loadAnimais()
      ]);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadMissao = async () => {
    const { data, error } = await supabase
      .from('missoes_2025_12_18_14_15')
      .select('id, codigo, titulo, data_inicio, data_fim, status')
      .eq('id', id)
      .single();

    if (error) throw error;
    setMissao(data);
  };

  const loadMissoesAnimais = async () => {
    const { data, error } = await supabase
      .from('missoes_animais_2025_12_18_14_15')
      .select('*')
      .eq('missao_id', id)
      .order('data_vinculacao', { ascending: false });

    if (error) throw error;
    setMissoesAnimais(data || []);
  };

  const loadAnimais = async () => {
    const { data, error } = await supabase
      .from('animais')
      .select('id, nome, especie, numero_processo, idade_estimada, genero')
      .eq('arquivado', false)
      .order('nome');

    if (error) throw error;
    setAnimais(data || []);
  };

  // Criar vinculação animal
  const handleCreateMissaoAnimal = async () => {
    try {
      const missaoAnimalData = {
        missao_id: id,
        animal_id: animalForm.animal_id,
        funcao_animal: animalForm.funcao_animal,
        data_vinculacao: animalForm.data_vinculacao,
        data_desvinculacao: animalForm.data_desvinculacao || null,
        status_participacao: 'ativo',
        observacoes: animalForm.observacoes || null
      };

      const { error } = await supabase
        .from('missoes_animais_2025_12_18_14_15')
        .insert(missaoAnimalData);

      if (error) throw error;

      toast({
        title: "Animal vinculado",
        description: "Animal adicionado à missão com sucesso!",
      });

      setAnimalDialogOpen(false);
      resetAnimalForm();
      await loadMissoesAnimais();
    } catch (error: any) {
      console.error('❌ Erro ao vincular animal:', error);
      toast({
        title: "Erro ao vincular animal",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Atualizar vinculação animal
  const handleUpdateMissaoAnimal = async () => {
    if (!editingMissaoAnimal) return;

    try {
      const missaoAnimalData = {
        funcao_animal: animalForm.funcao_animal,
        data_vinculacao: animalForm.data_vinculacao,
        data_desvinculacao: animalForm.data_desvinculacao || null,
        observacoes: animalForm.observacoes || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('missoes_animais_2025_12_18_14_15')
        .update(missaoAnimalData)
        .eq('id', editingMissaoAnimal.id);

      if (error) throw error;

      toast({
        title: "Vinculação atualizada",
        description: "Vinculação do animal atualizada com sucesso!",
      });

      setAnimalDialogOpen(false);
      setEditingMissaoAnimal(null);
      resetAnimalForm();
      await loadMissoesAnimais();
    } catch (error: any) {
      console.error('❌ Erro ao atualizar vinculação:', error);
      toast({
        title: "Erro ao atualizar vinculação",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Eliminar vinculação animal
  const handleDeleteMissaoAnimal = async (missaoAnimalId: string) => {
    if (!confirm('Tem certeza que deseja remover este animal da missão?')) return;

    try {
      const { error } = await supabase
        .from('missoes_animais_2025_12_18_14_15')
        .delete()
        .eq('id', missaoAnimalId);

      if (error) throw error;

      toast({
        title: "Animal removido",
        description: "Animal removido da missão com sucesso!",
      });

      await loadMissoesAnimais();
    } catch (error: any) {
      console.error('❌ Erro ao remover animal:', error);
      toast({
        title: "Erro ao remover animal",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Reset formulário
  const resetAnimalForm = () => {
    setAnimalForm({
      animal_id: '',
      funcao_animal: 'participante',
      data_vinculacao: missao?.data_inicio || '',
      data_desvinculacao: '',
      observacoes: ''
    });
  };

  // Abrir diálogo
  const openAnimalDialog = (missaoAnimal?: MissaoAnimal) => {
    if (missaoAnimal) {
      setEditingMissaoAnimal(missaoAnimal);
      setAnimalForm({
        animal_id: missaoAnimal.animal_id,
        funcao_animal: missaoAnimal.funcao_animal,
        data_vinculacao: missaoAnimal.data_vinculacao,
        data_desvinculacao: missaoAnimal.data_desvinculacao || '',
        observacoes: missaoAnimal.observacoes || ''
      });
    } else {
      setEditingMissaoAnimal(null);
      resetAnimalForm();
    }
    setAnimalDialogOpen(true);
  };

  // Obter animal por ID
  const getAnimalById = (animalId: string) => {
    return animais.find(a => a.id === animalId);
  };

  // Obter badge de função
  const getFuncaoAnimalBadge = (funcao: string) => {
    const funcaoConfig = {
      'protagonista': { color: 'bg-purple-100 text-purple-800', label: 'Protagonista' },
      'participante': { color: 'bg-blue-100 text-blue-800', label: 'Participante' },
      'resgatado': { color: 'bg-red-100 text-red-800', label: 'Resgatado' },
      'adocao': { color: 'bg-green-100 text-green-800', label: 'Para Adoção' },
      'embaixador': { color: 'bg-orange-100 text-orange-800', label: 'Embaixador' }
    };

    const config = funcaoConfig[funcao as keyof typeof funcaoConfig] || funcaoConfig.participante;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Filtrar animais disponíveis (não vinculados à missão)
  const animaisDisponiveis = animais.filter(animal => 
    !missoesAnimais.some(ma => ma.animal_id === animal.id && !ma.data_desvinculacao)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando animais da missão...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  if (error || !missao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
              <p className="text-gray-600 mb-6">{error || "Missão não encontrada"}</p>
              <Link to="/modulo-missoes">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar às Missões
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header com navegação */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to={`/missao/${id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Missão
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PawPrint className="h-8 w-8 text-blue-600 mr-3" />
                Animais da Missão
              </h1>
              <p className="text-gray-600 mt-1">{missao.titulo} ({missao.codigo})</p>
            </div>
          </div>
          
          <Button 
            onClick={() => openAnimalDialog()} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={animaisDisponiveis.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Vincular Animal
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Animais Vinculados</p>
                  <p className="text-3xl font-bold text-blue-600">{missoesAnimais.length}</p>
                </div>
                <PawPrint className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos na Missão</p>
                  <p className="text-3xl font-bold text-green-600">
                    {missoesAnimais.filter(ma => !ma.data_desvinculacao).length}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                  <p className="text-3xl font-bold text-purple-600">{animaisDisponiveis.length}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Animais */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PawPrint className="h-5 w-5 mr-2" />
              Animais Participantes ({missoesAnimais.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {missoesAnimais.length === 0 ? (
              <div className="text-center py-12">
                <PawPrint className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum animal vinculado</h3>
                <p className="text-gray-600 mb-6">
                  Vincule animais para participar desta missão
                </p>
                {animaisDisponiveis.length > 0 ? (
                  <Button onClick={() => openAnimalDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Vincular Primeiro Animal
                  </Button>
                ) : (
                  <p className="text-gray-500">Não há animais disponíveis para vincular</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missoesAnimais.map((missaoAnimal) => {
                    const animal = getAnimalById(missaoAnimal.animal_id);
                    
                    return (
                      <TableRow key={missaoAnimal.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {animal?.nome || 'Animal não encontrado'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {animal?.especie} - {animal?.numero_processo}
                            </p>
                            {animal?.idade_estimada && (
                              <p className="text-xs text-gray-500">
                                {animal.idade_estimada} anos - {animal.genero}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getFuncaoAnimalBadge(missaoAnimal.funcao_animal)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(missaoAnimal.data_vinculacao).toLocaleDateString('pt-PT')}
                            </div>
                            {missaoAnimal.data_desvinculacao && (
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(missaoAnimal.data_desvinculacao).toLocaleDateString('pt-PT')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={missaoAnimal.data_desvinculacao ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}>
                            {missaoAnimal.data_desvinculacao ? 'Desvinculado' : 'Ativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600 max-w-xs truncate">
                            {missaoAnimal.observacoes || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAnimalDialog(missaoAnimal)}
                              className="h-8 w-8 p-0"
                              title="Editar vinculação"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMissaoAnimal(missaoAnimal.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Remover animal"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Nova/Editar Vinculação */}
      <Dialog open={animalDialogOpen} onOpenChange={setAnimalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <PawPrint className="h-5 w-5 text-blue-600" />
              <span>{editingMissaoAnimal ? 'Editar Vinculação' : 'Vincular Animal'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingMissaoAnimal ? 'Atualize os dados da vinculação' : 'Vincule um animal à missão'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            editingMissaoAnimal ? handleUpdateMissaoAnimal() : handleCreateMissaoAnimal();
          }} className="space-y-4">
            {!editingMissaoAnimal && (
              <div>
                <Label htmlFor="animal_id">Animal *</Label>
                <Select 
                  value={animalForm.animal_id} 
                  onValueChange={(value) => setAnimalForm(prev => ({ ...prev, animal_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {animaisDisponiveis.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.nome} ({animal.especie}) - {animal.numero_processo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="funcao_animal">Função do Animal</Label>
              <Select 
                value={animalForm.funcao_animal} 
                onValueChange={(value) => setAnimalForm(prev => ({ ...prev, funcao_animal: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="protagonista">Protagonista</SelectItem>
                  <SelectItem value="participante">Participante</SelectItem>
                  <SelectItem value="resgatado">Resgatado</SelectItem>
                  <SelectItem value="adocao">Para Adoção</SelectItem>
                  <SelectItem value="embaixador">Embaixador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_vinculacao">Data de Vinculação *</Label>
                <Input
                  id="data_vinculacao"
                  type="date"
                  value={animalForm.data_vinculacao}
                  onChange={(e) => setAnimalForm(prev => ({ ...prev, data_vinculacao: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="data_desvinculacao">Data de Desvinculação (opcional)</Label>
                <Input
                  id="data_desvinculacao"
                  type="date"
                  value={animalForm.data_desvinculacao}
                  onChange={(e) => setAnimalForm(prev => ({ ...prev, data_desvinculacao: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={animalForm.observacoes}
                onChange={(e) => setAnimalForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre a participação do animal..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setAnimalDialogOpen(false);
                  setEditingMissaoAnimal(null);
                  resetAnimalForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingMissaoAnimal ? 'Atualizar Vinculação' : 'Vincular Animal'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default MissaoAnimais;