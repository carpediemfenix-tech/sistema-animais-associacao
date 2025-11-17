import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Calendar, Activity, FileText, MapPin, Heart, Phone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Intervencao, Evento, Localizacao } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAnimalData();
    }
  }, [id]);

  const fetchAnimalData = async () => {
    try {
      setLoading(true);

      // Buscar dados do animal
      const { data: animalData, error: animalError } = await supabase
        .from('animais')
        .select('*')
        .eq('id', id)
        .single();

      if (animalError) throw animalError;
      setAnimal(animalData);

      // Buscar intervenções
      const { data: intervencoesData, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select(`
          *,
          tipo_intervencao:tipos_intervencoes(nome, cor),
          voluntario:voluntarios(nome)
        `)
        .eq('animal_id', id)
        .order('data_intervencao', { ascending: false });

      if (intervencoesError) throw intervencoesError;
      setIntervencoes(intervencoesData || []);

      // Buscar eventos
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select('*')
        .eq('animal_id', id)
        .order('data_evento', { ascending: false });

      if (eventosError) throw eventosError;
      setEventos(eventosData || []);

      // Buscar localizações
      const { data: localizacoesData, error: localizacoesError } = await supabase
        .from('localizacoes')
        .select('*')
        .eq('animal_id', id)
        .order('data_entrada', { ascending: false });

      if (localizacoesError) throw localizacoesError;
      setLocalizacoes(localizacoesData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados do animal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do animal",
        variant: "destructive",
      });
      navigate('/animais');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Ativo': return 'default';
      case 'Adotado': return 'secondary';
      case 'Óbito': return 'destructive';
      case 'Não Adotável': return 'outline';
      default: return 'default';
    }
  };

  const getIdadeTexto = (idadeMeses?: number) => {
    if (!idadeMeses) return 'Idade não informada';
    
    if (idadeMeses < 12) {
      return `${idadeMeses} ${idadeMeses === 1 ? 'mês' : 'meses'}`;
    } else {
      const anos = Math.floor(idadeMeses / 12);
      const mesesRestantes = idadeMeses % 12;
      
      if (mesesRestantes === 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
      } else {
        return `${anos}a ${mesesRestantes}m`;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar dados do animal...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Animal não encontrado</h2>
          <p className="text-gray-600 mb-4">O animal solicitado não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/animais">Voltar à Lista</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/animais">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Lista
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <img 
                  src="/images/BackgroundEraser_20250411_205630024.png" 
                  alt="Valentão ao Resgate" 
                  className="h-8 w-8 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{animal.nome}</h1>
                  <p className="text-sm text-gray-500">Processo: {animal.numero_processo}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getEstadoBadgeVariant(animal.estado)}>
                {animal.estado}
              </Badge>
              {animal.arquivado && (
                <Badge variant="outline">Arquivado</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
            <TabsTrigger value="intervencoes">Intervenções ({intervencoes.length})</TabsTrigger>
            <TabsTrigger value="eventos">Eventos ({eventos.length})</TabsTrigger>
            <TabsTrigger value="localizacoes">Localizações ({localizacoes.length})</TabsTrigger>
          </TabsList>

          {/* Informações Gerais */}
          <TabsContent value="geral">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dados Básicos */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados Básicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      <p className="text-lg font-semibold">{animal.nome}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Espécie</label>
                      <p className="text-lg">{animal.especie}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Raça</label>
                      <p className="text-lg">{animal.raca || "Não informada"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Sexo</label>
                      <p className="text-lg">{animal.sexo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Idade</label>
                      <p className="text-lg">{getIdadeTexto(animal.idade_estimada)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Peso</label>
                      <p className="text-lg">{animal.peso ? `${animal.peso} kg` : "Não informado"}</p>
                    </div>
                  </div>
                  
                  {animal.cor && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cor</label>
                      <p className="text-lg">{animal.cor}</p>
                    </div>
                  )}
                  
                  {animal.caracteristicas_fisicas && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Características Físicas</label>
                      <p className="text-sm text-gray-700">{animal.caracteristicas_fisicas}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Identificação */}
              <Card>
                <CardHeader>
                  <CardTitle>Identificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número de Processo</label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono font-bold text-blue-600">{animal.numero_processo}</p>
                      <Badge variant="outline" className="text-xs">Processo Oficial</Badge>
                    </div>
                  </div>
                  
                  {animal.transponder && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Transponder</label>
                      <p className="text-lg font-mono">{animal.transponder}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Entrada</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-lg">{new Date(animal.data_entrada).toLocaleDateString('pt-PT')}</p>
                    </div>
                  </div>
                  
                  {animal.local_encontrado && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Local Encontrado</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-lg">{animal.local_encontrado}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Estado e Adoção */}
              {animal.estado === 'Adotado' && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Informações de Adoção
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {animal.data_adocao && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Data de Adoção</label>
                          <p className="text-lg">{new Date(animal.data_adocao).toLocaleDateString('pt-PT')}</p>
                        </div>
                      )}
                      
                      {animal.adotante_nome && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Adotante</label>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <p className="text-lg">{animal.adotante_nome}</p>
                          </div>
                        </div>
                      )}
                      
                      {animal.adotante_contacto && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Contacto</label>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p className="text-lg">{animal.adotante_contacto}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observações */}
              {animal.observacoes && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{animal.observacoes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Intervenções */}
          <TabsContent value="intervencoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Histórico de Intervenções
                </CardTitle>
                <CardDescription>
                  Todas as intervenções médicas realizadas neste animal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {intervencoes.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma intervenção registada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {intervencoes.map((intervencao) => (
                      <div key={intervencao.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge 
                              style={{ 
                                backgroundColor: intervencao.tipo_intervencao?.cor || '#3B82F6',
                                color: 'white'
                              }}
                            >
                              {intervencao.tipo_intervencao?.nome}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                          {intervencao.custo && (
                            <span className="text-sm font-medium">€{intervencao.custo.toFixed(2)}</span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {intervencao.veterinario && (
                            <div>
                              <span className="font-medium">Veterinário:</span> {intervencao.veterinario}
                            </div>
                          )}
                          {intervencao.clinica && (
                            <div>
                              <span className="font-medium">Clínica:</span> {intervencao.clinica}
                            </div>
                          )}
                          {intervencao.voluntario && (
                            <div>
                              <span className="font-medium">Responsável:</span> {intervencao.voluntario.nome}
                            </div>
                          )}
                          {intervencao.proxima_data && (
                            <div>
                              <span className="font-medium">Próxima consulta:</span> {new Date(intervencao.proxima_data).toLocaleDateString('pt-PT')}
                            </div>
                          )}
                        </div>
                        
                        {intervencao.observacoes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <span className="font-medium">Observações:</span> {intervencao.observacoes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Eventos */}
          <TabsContent value="eventos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Histórico de Eventos
                </CardTitle>
                <CardDescription>
                  Eventos importantes na vida deste animal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventos.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum evento registado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventos.map((evento) => (
                      <div key={evento.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">{evento.tipo_evento}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(evento.data_evento).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-2">{evento.descricao}</p>
                        {evento.observacoes && (
                          <p className="text-sm text-gray-600">{evento.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Localizações */}
          <TabsContent value="localizacoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Histórico de Localizações
                </CardTitle>
                <CardDescription>
                  Locais onde o animal esteve alojado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {localizacoes.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma localização registada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {localizacoes.map((localizacao) => (
                      <div key={localizacao.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={localizacao.ativo ? "default" : "outline"}>
                              {localizacao.localizacao}
                            </Badge>
                            {localizacao.ativo && (
                              <Badge variant="secondary" className="text-xs">Atual</Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(localizacao.data_entrada).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
                        
                        {localizacao.endereco && (
                          <p className="text-sm text-gray-600 mb-2">{localizacao.endereco}</p>
                        )}
                        
                        {localizacao.data_saida && (
                          <p className="text-sm text-gray-500">
                            Saída: {new Date(localizacao.data_saida).toLocaleDateString('pt-PT')}
                          </p>
                        )}
                        
                        {localizacao.observacoes && (
                          <p className="text-sm text-gray-600 mt-2">{localizacao.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnimalDetail;