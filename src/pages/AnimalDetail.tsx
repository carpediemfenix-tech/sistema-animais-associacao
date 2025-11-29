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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  Heart,
  Archive,
  ArchiveRestore,
  UserCheck,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Intervencao, Evento, Localizacao, Voluntario, TipoIntervencao, ResponsabilidadeVoluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import LogotipoValentao from "@/components/LogotipoValentao";
import UserHeader from "@/components/UserHeader";

const AnimalDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Função básica para carregar dados do animal
  const fetchAnimalData = async () => {
    if (!id) {
      setError("ID do animal não fornecido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 [ANIMAL] Carregando dados do animal:', id);

      const { data: animalData, error: animalError } = await supabase
        .from('animais')
        .select(`
          *,
          grupos (
            id,
            nome,
            descricao
          )
        `)
        .eq('id', id)
        .single();

      if (animalError) {
        console.error('❌ [ANIMAL] Erro ao carregar animal:', animalError);
        throw animalError;
      }

      if (!animalData) {
        throw new Error('Animal não encontrado');
      }

      console.log('✅ [ANIMAL] Animal carregado:', animalData.nome);
      setAnimal(animalData);
      setError(null);

    } catch (error: any) {
      console.error('💥 [ANIMAL] Erro geral:', error);
      setError(error.message || 'Erro ao carregar dados do animal');
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao carregar dados do animal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimalData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar dados do animal...</p>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Erro ao Carregar Animal</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button asChild>
              <Link to="/animais">Voltar à Lista de Animais</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      <UserHeader 
        title={`${animal.nome} - Ficha Completa`}
        description={`${animal.especie} • Processo: ${animal.numero_processo || 'N/A'}`}
        showBackButton
        backTo="/animais"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Informações Básicas do Animal */}
        <Card className="animal-card mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {animal.especie === 'Cão' ? (
                  <Dog className="h-8 w-8 text-orange-500" />
                ) : animal.especie === 'Gato' ? (
                  <Cat className="h-8 w-8 text-orange-500" />
                ) : (
                  <PawPrint className="h-8 w-8 text-orange-500" />
                )}
                <div>
                  <CardTitle className="text-2xl text-orange-800">{animal.nome}</CardTitle>
                  <CardDescription className="text-orange-600">
                    {animal.especie} • {animal.sexo} • {animal.raca || 'Raça não especificada'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={animal.estado === 'Ativo' ? 'default' : 'secondary'}>
                  {animal.estado}
                </Badge>
                {animal.arquivado && (
                  <Badge variant="outline" className="text-gray-600">
                    Arquivado
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-orange-700 font-medium">Número de Processo</Label>
                <p className="text-orange-900">{animal.numero_processo || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Data de Entrada</Label>
                <p className="text-orange-900">
                  {new Date(animal.data_entrada).toLocaleDateString('pt-PT')}
                </p>
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Idade Estimada</Label>
                <p className="text-orange-900">
                  {animal.idade_estimada ? `${Math.floor(animal.idade_estimada / 12)} anos e ${animal.idade_estimada % 12} meses` : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Peso</Label>
                <p className="text-orange-900">{animal.peso ? `${animal.peso} kg` : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Cor</Label>
                <p className="text-orange-900">{animal.cor || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Transponder</Label>
                <p className="text-orange-900">{animal.transponder || 'N/A'}</p>
              </div>
            </div>
            
            {animal.caracteristicas_fisicas && (
              <div className="mt-4">
                <Label className="text-orange-700 font-medium">Características Físicas</Label>
                <p className="text-orange-900 mt-1">{animal.caracteristicas_fisicas}</p>
              </div>
            )}
            
            {animal.observacoes && (
              <div className="mt-4">
                <Label className="text-orange-700 font-medium">Observações</Label>
                <p className="text-orange-900 mt-1">{animal.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Abas de Informações Detalhadas */}
        <Tabs defaultValue="intervencoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="intervencoes">🏥 Intervenções</TabsTrigger>
            <TabsTrigger value="eventos">📅 Eventos</TabsTrigger>
            <TabsTrigger value="localizacoes">📍 Localizações</TabsTrigger>
            <TabsTrigger value="responsabilidades">👥 Responsabilidades</TabsTrigger>
            <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>
          </TabsList>

          {/* Aba de Intervenções */}
          <TabsContent value="intervencoes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Intervenções Médicas</CardTitle>
                  {hasPermission('create') && (
                    <Button
                      onClick={() => {
                        toast({
                          title: "🚧 Em Desenvolvimento",
                          description: "Funcionalidade de intervenções será implementada em breve",
                        });
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Intervenção
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhuma intervenção registrada</p>
                  <p className="text-sm mb-4">Clique em "Nova Intervenção" para adicionar a primeira intervenção médica.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outras abas simplificadas */}
          <TabsContent value="eventos">
            <Card>
              <CardHeader>
                <CardTitle>Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localizacoes">
            <Card>
              <CardHeader>
                <CardTitle>Localizações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responsabilidades">
            <Card>
              <CardHeader>
                <CardTitle>Responsabilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro">
            <Card>
              <CardHeader>
                <CardTitle>Movimentos Financeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnimalDetail;