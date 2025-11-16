import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Filter, Archive, ArchiveRestore, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Animal, HistoricoLocalizacao } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const GestaoAnimais = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecie, setFilterEspecie] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [localizacaoDialog, setLocalizacaoDialog] = useState(false);
  const [novaLocalizacao, setNovaLocalizacao] = useState({
    localizacao: "",
    observacoes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnimais();
  }, [showArchived]);

  const fetchAnimais = async () => {
    try {
      const { data, error } = await supabase
        .from('animais_2025_11_13_03_23')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filtrar por arquivado no frontend se a coluna existir
      const animaisFiltrados = data?.filter(animal => {
        const isArchived = animal.arquivado || false;
        return showArchived ? isArchived : !isArchived;
      }) || data || [];
      
      setAnimais(animaisFiltrados);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar animais",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleArquivar = async (animal: Animal) => {
    try {
      const { error } = await supabase
        .from('animais_2025_11_13_03_23')
        .update({ arquivado: !animal.arquivado })
        .eq('id', animal.id);

      if (error) throw error;

      toast({
        title: animal.arquivado ? "Animal desarquivado" : "Animal arquivado",
        description: `${animal.nome} foi ${animal.arquivado ? 'desarquivado' : 'arquivado'} com sucesso.`,
      });

      fetchAnimais();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const adicionarLocalizacao = async () => {
    if (!selectedAnimal || !novaLocalizacao.localizacao) return;

    try {
      // Fechar localização anterior se existir
      const { error: updateError } = await supabase
        .from('historico_localizacoes_2025_11_16_18_00')
        .update({ data_saida: new Date().toISOString() })
        .eq('animal_id', selectedAnimal.id)
        .is('data_saida', null);

      // Adicionar nova localização
      const { error } = await supabase
        .from('historico_localizacoes_2025_11_16_18_00')
        .insert({
          animal_id: selectedAnimal.id,
          localizacao: novaLocalizacao.localizacao,
          observacoes: novaLocalizacao.observacoes
        });

      if (error) throw error;

      toast({
        title: "Localização adicionada",
        description: `Nova localização registada para ${selectedAnimal.nome}.`,
      });

      setLocalizacaoDialog(false);
      setNovaLocalizacao({ localizacao: "", observacoes: "" });
      setSelectedAnimal(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredAnimais = animais.filter((animal) => {
    const matchesSearch = animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEspecie = filterEspecie === "todos" || animal.especie === filterEspecie;
    const matchesEstado = filterEstado === "todos" || animal.estado === filterEstado;
    
    return matchesSearch && matchesEspecie && matchesEstado;
  });

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "Ativo": return "bg-green-500";
      case "Adotado": return "bg-blue-500";
      case "Óbito": return "bg-red-500";
      case "Transferido": return "bg-yellow-500";
      case "Não Adotável": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">A carregar animais...</div>
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
            <h1 className="text-3xl font-bold">Gestão de Animais - Valentão ao Resgate</h1>
            <p className="text-muted-foreground">
              {showArchived ? "Animais arquivados" : "Animais ativos"} - Total: {filteredAnimais.length}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
            {showArchived ? "Ver Ativos" : "Ver Arquivados"}
          </Button>
          <Button asChild>
            <Link to="/novo-animal">
              <Plus className="h-4 w-4 mr-2" />
              Novo Animal
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou número de processo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterEspecie} onValueChange={setFilterEspecie}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por espécie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as espécies</SelectItem>
            <SelectItem value="Cão">Cão</SelectItem>
            <SelectItem value="Gato">Gato</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Adotado">Adotado</SelectItem>
            <SelectItem value="Óbito">Óbito</SelectItem>
            <SelectItem value="Transferido">Transferido</SelectItem>
            <SelectItem value="Não Adotável">Não Adotável</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Animais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAnimais.map((animal) => (
          <Card key={animal.id} className={`hover:shadow-lg transition-shadow ${animal.arquivado ? 'opacity-75' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{animal.nome}</CardTitle>
                  <CardDescription>
                    {animal.numero_processo} • {animal.especie} • {animal.sexo}
                  </CardDescription>
                </div>
                <Badge className={`${getEstadoBadgeColor(animal.estado)} text-white`}>
                  {animal.estado}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Raça:</strong> {animal.raca || "Não especificada"}</p>
                <p><strong>Idade:</strong> {animal.idade_estimada || "Não especificada"}</p>
                <p><strong>Data de entrada:</strong> {new Date(animal.data_entrada).toLocaleDateString('pt-PT')}</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/animal/${animal.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAnimal(animal);
                    setLocalizacaoDialog(true);
                  }}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Localização
                </Button>
                
                <Button
                  variant={animal.arquivado ? "default" : "destructive"}
                  size="sm"
                  onClick={() => toggleArquivar(animal)}
                >
                  {animal.arquivado ? (
                    <ArchiveRestore className="h-4 w-4 mr-1" />
                  ) : (
                    <Archive className="h-4 w-4 mr-1" />
                  )}
                  {animal.arquivado ? "Desarquivar" : "Arquivar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnimais.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {showArchived ? "Nenhum animal arquivado encontrado." : "Nenhum animal encontrado."}
          </p>
        </div>
      )}

      {/* Dialog para adicionar localização */}
      <Dialog open={localizacaoDialog} onOpenChange={setLocalizacaoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Localização</DialogTitle>
            <DialogDescription>
              Registar nova localização para {selectedAnimal?.nome}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="localizacao">Localização</Label>
              <Select value={novaLocalizacao.localizacao} onValueChange={(value) => 
                setNovaLocalizacao(prev => ({ ...prev, localizacao: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar localização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Canil">Canil</SelectItem>
                  <SelectItem value="CRO">CRO</SelectItem>
                  <SelectItem value="FAT">FAT</SelectItem>
                  <SelectItem value="Rua">Rua</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre a localização..."
                value={novaLocalizacao.observacoes}
                onChange={(e) => setNovaLocalizacao(prev => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocalizacaoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={adicionarLocalizacao}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GestaoAnimais;