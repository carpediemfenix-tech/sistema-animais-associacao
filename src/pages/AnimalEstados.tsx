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
import EnhancedHeader from "@/components/EnhancedHeader";
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  FileText, 
  Activity,
  Clock,
  User,
  AlertCircle
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
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [estados, setEstados] = useState<EstadoAnimal[]>([]);
  const [tiposEstado, setTiposEstado] = useState<TipoEstado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [novoEstado, setNovoEstado] = useState({
    tipo_estado_id: "",
    data_inicio: new Date().toISOString().split('T')[0],
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

      // Carregar histórico de estados
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
        .order('data_inicio', { ascending: false });

      if (estadosError) throw estadosError;
      setEstados(estadosData || []);

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

    try {
      // 1. Inserir o novo estado (o trigger vai desativar os anteriores)
      const { error: insertError } = await supabase
        .from('estados_animal')
        .insert({
          animal_id: id,
          tipo_estado_id: novoEstado.tipo_estado_id,
          data_inicio: novoEstado.data_inicio,
          observacoes: novoEstado.observacoes || null,
          ativo: true,
          usuario_id: 'admin' // TODO: Usar usuário atual
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

      toast({
        title: "Sucesso",
        description: "Estado adicionado com sucesso",
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
      console.error('Erro ao adicionar estado:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar estado: " + (error.message || 'Erro desconhecido'),
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
        {estados.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Estado Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge 
                  style={getEstadoBadgeColor(estados[0].tipos_estado.cor)}
                  className="text-lg px-4 py-2"
                >
                  {estados[0].tipos_estado.nome}
                </Badge>
                <div className="text-sm text-gray-600">
                  <p>Desde: {formatarData(estados[0].data_inicio)}</p>
                  {estados[0].observacoes && (
                    <p className="mt-1 italic">"{estados[0].observacoes}"</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                      </div>
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