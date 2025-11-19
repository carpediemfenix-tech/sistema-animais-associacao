import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  PawPrint,
  Stethoscope,
  DollarSign,
  MapPin,
  RefreshCw,
  Eye,
  Filter,
  User,
  Building,
  Heart,
  Clock,
  Search,
  FileUser,
  List,
  Home,
  Activity,
  Euro,
  Phone,
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import RelatorioFinanceiro from "@/components/RelatorioFinanceiro";
import RelatorioAdocoes from "@/components/RelatorioAdocoes";

interface RelatorioData {
  animais: any[];
  intervencoes: any[];
  eventos: any[];
  voluntarios: any[];
  movimentos: any[];
  localizacoes: any[];
  tiposIntervencoes: any[];
}

const SistemaRelatoriosProfissional = () => {
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroAno, setFiltroAno] = useState(2025);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAnimal, setFiltroAnimal] = useState('todos');
  const [filtroVoluntario, setFiltroVoluntario] = useState('todos');
  const [filtroClinica, setFiltroClinica] = useState('todas');
  const [busca, setBusca] = useState('');
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const [fichaAnimalSelecionado, setFichaAnimalSelecionado] = useState<any>(null);
  const [fichaVoluntarioSelecionado, setFichaVoluntarioSelecionado] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('📊 [RELATÓRIOS] Carregando dados completos...');

      // Buscar todos os dados
      const [
        { data: animais, error: animaisError },
        { data: intervencoes, error: intervencoesError },
        { data: eventos, error: eventosError },
        { data: voluntarios, error: voluntariosError },
        { data: movimentos, error: movimentosError },
        { data: localizacoes, error: localizacoesError },
        { data: tiposIntervencoes, error: tiposError }
      ] = await Promise.all([
        supabase.from('animais').select('*').order('created_at', { ascending: false }),
        supabase.from('intervencoes').select('*').order('data_intervencao', { ascending: false }),
        supabase.from('eventos').select('*').order('data_evento', { ascending: false }),
        supabase.from('voluntarios').select('*').order('nome'),
        supabase.from('movimentos_financeiros').select('*').order('data_movimento', { ascending: false }),
        supabase.from('localizacoes').select('*').order('data_entrada', { ascending: false }),
        supabase.from('tipos_intervencoes').select('*').order('nome')
      ]);

      if (animaisError) throw animaisError;
      if (intervencoesError) throw intervencoesError;
      if (eventosError) throw eventosError;
      if (voluntariosError) throw voluntariosError;
      if (movimentosError) throw movimentosError;
      if (localizacoesError) throw localizacoesError;
      if (tiposError) throw tiposError;

      // Calcular anos disponíveis baseado nos dados reais
      const todasDatas = [
        ...(animais || []).map(a => a.data_entrada),
        ...(intervencoes || []).map(i => i.data_intervencao),
        ...(eventos || []).map(e => e.data_evento),
        ...(movimentos || []).map(m => m.data_movimento),
        ...(localizacoes || []).map(l => l.data_entrada)
      ].filter(Boolean);

      const anos = [...new Set(todasDatas.map(data => new Date(data).getFullYear()))]
        .sort((a, b) => b - a);
      
      setAnosDisponiveis(anos.length > 0 ? anos : [2025]);

      setData({
        animais: animais || [],
        intervencoes: intervencoes || [],
        eventos: eventos || [],
        voluntarios: voluntarios || [],
        movimentos: movimentos || [],
        localizacoes: localizacoes || [],
        tiposIntervencoes: tiposIntervencoes || []
      });

      console.log('✅ [RELATÓRIOS] Dados carregados:', {
        animais: animais?.length || 0,
        intervencoes: intervencoes?.length || 0,
        voluntarios: voluntarios?.length || 0,
        anos: anos
      });

    } catch (error: any) {
      console.error('❌ [RELATÓRIOS] Erro ao carregar dados:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os dados dos relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // LISTAGEM COMPLETA DE ANIMAIS
  const gerarListagemAnimais = () => {
    if (!data) return [];

    let animaisFiltrados = data.animais;

    // Filtro por busca
    if (busca) {
      animaisFiltrados = animaisFiltrados.filter(animal => 
        animal.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        animal.numero_processo?.toLowerCase().includes(busca.toLowerCase()) ||
        animal.especie?.toLowerCase().includes(busca.toLowerCase()) ||
        animal.raca?.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // Adicionar dados relacionados
    return animaisFiltrados.map(animal => {
      const intervencoesAnimal = data.intervencoes.filter(i => i.animal_id === animal.id);
      const localizacoesAnimal = data.localizacoes.filter(l => l.animal_id === animal.id);
      const eventosAnimal = data.eventos.filter(e => e.animal_id === animal.id);
      const custoTotal = intervencoesAnimal.reduce((sum, i) => sum + (i.custo || 0), 0);
      const ultimaIntervencao = intervencoesAnimal[0];
      const localizacaoAtual = localizacoesAnimal.find(l => l.ativo) || localizacoesAnimal[0];

      return {
        ...animal,
        totalIntervencoes: intervencoesAnimal.length,
        custoTotal,
        ultimaIntervencao: ultimaIntervencao?.data_intervencao,
        localizacaoAtual: localizacaoAtual?.localizacao,
        totalEventos: eventosAnimal.length
      };
    });
  };

  // LISTAGEM DE INTERVENÇÕES
  const gerarListagemIntervencoes = () => {
    if (!data) return [];

    let intervencoesFiltradas = data.intervencoes;

    // Filtro por ano
    if (filtroAno && filtroAno !== 0) {
      intervencoesFiltradas = intervencoesFiltradas.filter(i => 
        new Date(i.data_intervencao).getFullYear() === filtroAno
      );
    }

    // Filtro por mês
    if (filtroMes && filtroMes !== 0) {
      intervencoesFiltradas = intervencoesFiltradas.filter(i => 
        new Date(i.data_intervencao).getMonth() + 1 === filtroMes
      );
    }

    // Filtro por clínica
    if (filtroClinica !== 'todas') {
      intervencoesFiltradas = intervencoesFiltradas.filter(i => 
        i.clinica?.toLowerCase().includes(filtroClinica.toLowerCase())
      );
    }

    // Adicionar dados relacionados
    return intervencoesFiltradas.map(intervencao => {
      const animal = data.animais.find(a => a.id === intervencao.animal_id);
      const tipo = data.tiposIntervencoes.find(t => t.id === intervencao.tipo_intervencao_id);
      const voluntario = data.voluntarios.find(v => v.id === intervencao.voluntario_id);

      return {
        ...intervencao,
        animalNome: animal?.nome || 'N/A',
        animalNumero: animal?.numero_processo || 'N/A',
        tipoNome: tipo?.nome || 'N/A',
        voluntarioNome: voluntario?.nome || 'N/A'
      };
    });
  };

  // HISTÓRICO DE LOCALIZAÇÕES
  const gerarHistoricoLocalizacoes = (animalId?: string) => {
    if (!data) return [];

    let localizacoesFiltradas = data.localizacoes;

    if (animalId) {
      localizacoesFiltradas = localizacoesFiltradas.filter(l => l.animal_id === animalId);
    }

    return localizacoesFiltradas.map(localizacao => {
      const animal = data.animais.find(a => a.id === localizacao.animal_id);
      const diasPermanencia = localizacao.data_saida 
        ? Math.ceil((new Date(localizacao.data_saida).getTime() - new Date(localizacao.data_entrada).getTime()) / (1000 * 60 * 60 * 24))
        : Math.ceil((new Date().getTime() - new Date(localizacao.data_entrada).getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...localizacao,
        animalNome: animal?.nome || 'N/A',
        animalNumero: animal?.numero_processo || 'N/A',
        diasPermanencia
      };
    });
  };

  // FICHA INDIVIDUAL DO ANIMAL
  const gerarFichaAnimal = (animalId: string) => {
    if (!data) return null;

    const animal = data.animais.find(a => a.id === animalId);
    if (!animal) return null;

    const intervencoes = data.intervencoes
      .filter(i => i.animal_id === animalId)
      .map(i => ({
        ...i,
        tipoNome: data.tiposIntervencoes.find(t => t.id === i.tipo_intervencao_id)?.nome || 'N/A',
        voluntarioNome: data.voluntarios.find(v => v.id === i.voluntario_id)?.nome || 'N/A'
      }));

    const eventos = data.eventos.filter(e => e.animal_id === animalId);
    const localizacoes = data.localizacoes.filter(l => l.animal_id === animalId);
    const custoTotal = intervencoes.reduce((sum, i) => sum + (i.custo || 0), 0);

    return {
      animal,
      intervencoes,
      eventos,
      localizacoes,
      custoTotal,
      totalIntervencoes: intervencoes.length,
      totalEventos: eventos.length,
      totalLocalizacoes: localizacoes.length
    };
  };

  // FICHA INDIVIDUAL DO VOLUNTÁRIO
  const gerarFichaVoluntario = (voluntarioId: string) => {
    if (!data) return null;

    const voluntario = data.voluntarios.find(v => v.id === voluntarioId);
    if (!voluntario) return null;

    const intervencoesRealizadas = data.intervencoes.filter(i => i.voluntario_id === voluntarioId);
    const animaisAtendidos = [...new Set(intervencoesRealizadas.map(i => i.animal_id))]
      .map(animalId => data.animais.find(a => a.id === animalId))
      .filter(Boolean);

    return {
      voluntario,
      intervencoesRealizadas,
      animaisAtendidos,
      ultimaAtividade: intervencoesRealizadas[0]?.data_intervencao,
      totalIntervencoes: intervencoesRealizadas.length
    };
  };

  // ESTATÍSTICAS POR CLÍNICA
  const gerarEstatisticasClinicas = () => {
    if (!data) return [];

    const clinicas = [...new Set(data.intervencoes.map(i => i.clinica).filter(Boolean))];
    
    return clinicas.map(clinica => {
      const intervencoesClinica = data.intervencoes.filter(i => i.clinica === clinica);
      const custoTotal = intervencoesClinica.reduce((sum, i) => sum + (i.custo || 0), 0);
      const animaisAtendidos = [...new Set(intervencoesClinica.map(i => i.animal_id))].length;
      const tiposIntervencoes = [...new Set(intervencoesClinica.map(i => i.tipo_intervencao_id))];

      return {
        clinica,
        totalIntervencoes: intervencoesClinica.length,
        custoTotal,
        animaisAtendidos,
        tiposIntervencoes: tiposIntervencoes.length,
        mediaGasto: custoTotal / intervencoesClinica.length || 0
      };
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 animate-pulse mx-auto mb-4 text-indigo-500" />
          <p className="text-gray-600">A carregar sistema de relatórios...</p>
        </div>
      </div>
    );
  }

  const listagemAnimais = gerarListagemAnimais();
  const listagemIntervencoes = gerarListagemIntervencoes();
  const historicoLocalizacoes = gerarHistoricoLocalizacoes();
  const estatisticasClinicas = gerarEstatisticasClinicas();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sistema de Relatórios Profissional</h2>
            <p className="text-sm text-gray-600">
              Relatórios detalhados, listagens e fichas individuais
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={carregarDados} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={imprimirRelatorio} variant="outline" size="sm" className="no-print">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Filtros Globais */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros e Pesquisa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="busca">Pesquisa Geral</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="busca"
                  placeholder="Nome, número, espécie..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ano">Ano</Label>
              <Select value={filtroAno.toString()} onValueChange={(value) => setFiltroAno(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos os anos</SelectItem>
                  {anosDisponiveis.map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mes">Mês</Label>
              <Select value={filtroMes.toString()} onValueChange={(value) => setFiltroMes(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos os meses</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2024, i).toLocaleDateString('pt-PT', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="voluntario">Voluntário</Label>
              <Select value={filtroVoluntario} onValueChange={setFiltroVoluntario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {data?.voluntarios.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clinica">Clínica</Label>
              <Select value={filtroClinica} onValueChange={setFiltroClinica}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {[...new Set(data?.intervencoes.map(i => i.clinica).filter(Boolean))].map(clinica => (
                    <SelectItem key={clinica} value={clinica}>{clinica}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs dos Relatórios */}
      <Tabs defaultValue="animais" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="animais" className="flex items-center space-x-2">
            <PawPrint className="h-4 w-4" />
            <span>Animais</span>
          </TabsTrigger>
          <TabsTrigger value="intervencoes" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Intervenções</span>
          </TabsTrigger>
          <TabsTrigger value="localizacoes" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Localizações</span>
          </TabsTrigger>
          <TabsTrigger value="voluntarios" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Voluntários</span>
          </TabsTrigger>
          <TabsTrigger value="clinicas" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Clínicas</span>
          </TabsTrigger>
          <TabsTrigger value="fichas" className="flex items-center space-x-2">
            <FileUser className="h-4 w-4" />
            <span>Fichas</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="flex items-center space-x-2">
            <Euro className="h-4 w-4" />
            <span>Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="adocoes" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Adoções</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB: LISTAGEM DE ANIMAIS */}
        <TabsContent value="animais">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <List className="h-5 w-5 text-orange-600" />
                <span>Listagem Completa de Animais</span>
              </CardTitle>
              <CardDescription>
                {listagemAnimais.length} animais encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Processo</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Espécie/Raça</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Intervenções</TableHead>
                      <TableHead>Custo Total</TableHead>
                      <TableHead>Última Intervenção</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listagemAnimais.map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell className="font-mono">{animal.numero_processo}</TableCell>
                        <TableCell className="font-medium">{animal.nome}</TableCell>
                        <TableCell>{animal.especie} • {animal.raca}</TableCell>
                        <TableCell>
                          <Badge className={
                            animal.estado === 'Ativo' ? 'bg-green-100 text-green-800' :
                            animal.estado === 'Adotado' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {animal.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>{animal.localizacaoAtual || 'N/A'}</TableCell>
                        <TableCell>{animal.totalIntervencoes}</TableCell>
                        <TableCell>{formatCurrency(animal.custoTotal)}</TableCell>
                        <TableCell>
                          {animal.ultimaIntervencao ? formatDate(animal.ultimaIntervencao) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFichaAnimalSelecionado(gerarFichaAnimal(animal.id))}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ficha
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: LISTAGEM DE INTERVENÇÕES */}
        <TabsContent value="intervencoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <span>Listagem de Intervenções</span>
              </CardTitle>
              <CardDescription>
                {listagemIntervencoes.length} intervenções encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Veterinário</TableHead>
                      <TableHead>Clínica</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Próxima Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listagemIntervencoes.map((intervencao) => (
                      <TableRow key={intervencao.id}>
                        <TableCell>{formatDate(intervencao.data_intervencao)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{intervencao.animalNome}</div>
                            <div className="text-sm text-gray-500">{intervencao.animalNumero}</div>
                          </div>
                        </TableCell>
                        <TableCell>{intervencao.tipoNome}</TableCell>
                        <TableCell>{intervencao.veterinario || 'N/A'}</TableCell>
                        <TableCell>{intervencao.clinica || 'N/A'}</TableCell>
                        <TableCell>{intervencao.custo ? formatCurrency(intervencao.custo) : 'N/A'}</TableCell>
                        <TableCell>{intervencao.voluntarioNome}</TableCell>
                        <TableCell>
                          {intervencao.proxima_data ? formatDate(intervencao.proxima_data) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: HISTÓRICO DE LOCALIZAÇÕES */}
        <TabsContent value="localizacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <span>Histórico de Localizações</span>
              </CardTitle>
              <CardDescription>
                {historicoLocalizacoes.length} registos de localização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Data Entrada</TableHead>
                      <TableHead>Data Saída</TableHead>
                      <TableHead>Dias</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicoLocalizacoes.map((localizacao) => (
                      <TableRow key={localizacao.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{localizacao.animalNome}</div>
                            <div className="text-sm text-gray-500">{localizacao.animalNumero}</div>
                          </div>
                        </TableCell>
                        <TableCell>{localizacao.localizacao}</TableCell>
                        <TableCell>{localizacao.endereco}</TableCell>
                        <TableCell>{formatDate(localizacao.data_entrada)}</TableCell>
                        <TableCell>
                          {localizacao.data_saida ? formatDate(localizacao.data_saida) : 'Atual'}
                        </TableCell>
                        <TableCell>{localizacao.diasPermanencia}</TableCell>
                        <TableCell>
                          <Badge className={localizacao.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {localizacao.ativo ? 'Ativo' : 'Histórico'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: VOLUNTÁRIOS */}
        <TabsContent value="voluntarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Listagem de Voluntários</span>
              </CardTitle>
              <CardDescription>
                {data?.voluntarios.length} voluntários registados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.voluntarios.map((voluntario) => {
                  const fichaVoluntario = gerarFichaVoluntario(voluntario.id);
                  return (
                    <Card key={voluntario.id} className="hover-lift">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{voluntario.nome}</h4>
                            <p className="text-sm text-gray-600">{voluntario.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Telefone:</span>
                            <span>{voluntario.telefone || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Intervenções:</span>
                            <Badge variant="outline">{fichaVoluntario?.totalIntervencoes || 0}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Animais atendidos:</span>
                            <Badge variant="outline">{fichaVoluntario?.animaisAtendidos.length || 0}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className={voluntario.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {voluntario.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => setFichaVoluntarioSelecionado(fichaVoluntario)}
                        >
                          <FileUser className="h-4 w-4 mr-2" />
                          Ver Ficha Completa
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ESTATÍSTICAS POR CLÍNICA */}
        <TabsContent value="clinicas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-indigo-600" />
                <span>Estatísticas por Clínica</span>
              </CardTitle>
              <CardDescription>
                Análise de desempenho e custos por clínica veterinária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {estatisticasClinicas.map((clinica) => (
                  <Card key={clinica.clinica} className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <Building className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{clinica.clinica}</h4>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Intervenções:</span>
                          <Badge variant="outline">{clinica.totalIntervencoes}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Animais atendidos:</span>
                          <Badge variant="outline">{clinica.animaisAtendidos}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Custo total:</span>
                          <span className="font-medium">{formatCurrency(clinica.custoTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Média por intervenção:</span>
                          <span className="font-medium">{formatCurrency(clinica.mediaGasto)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tipos diferentes:</span>
                          <Badge variant="outline">{clinica.tiposIntervencoes}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: FICHAS INDIVIDUAIS */}
        <TabsContent value="fichas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seletor de Animal para Ficha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PawPrint className="h-5 w-5 text-orange-600" />
                  <span>Ficha Individual do Animal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select onValueChange={(animalId) => {
                    const ficha = gerarFichaAnimal(animalId);
                    setFichaAnimalSelecionado(ficha);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {data?.animais.map(animal => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.nome} ({animal.numero_processo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">
                    Selecione um animal para gerar a ficha completa com histórico médico, localizações e eventos.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Seletor de Voluntário para Ficha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple-600" />
                  <span>Ficha Individual do Voluntário</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select onValueChange={(voluntarioId) => {
                    const ficha = gerarFichaVoluntario(voluntarioId);
                    setFichaVoluntarioSelecionado(ficha);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um voluntário" />
                    </SelectTrigger>
                    <SelectContent>
                      {data?.voluntarios.map(voluntario => (
                        <SelectItem key={voluntario.id} value={voluntario.id}>
                          {voluntario.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">
                    Selecione um voluntário para gerar a ficha com atividades realizadas e animais sob responsabilidade.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: RELATÓRIO FINANCEIRO */}
        <TabsContent value="financeiro">
          <RelatorioFinanceiro 
            data={data} 
            filtroAno={filtroAno} 
            filtroMes={filtroMes} 
          />
        </TabsContent>

        {/* TAB: RELATÓRIO DE ADOÇÕES */}
        <TabsContent value="adocoes">
          <RelatorioAdocoes 
            data={data} 
            filtroAno={filtroAno} 
            filtroMes={filtroMes} 
          />
        </TabsContent>
      </Tabs>

      {/* MODAL: FICHA DO ANIMAL */}
      {fichaAnimalSelecionado && (
        <Dialog open={!!fichaAnimalSelecionado} onOpenChange={() => setFichaAnimalSelecionado(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <PawPrint className="h-5 w-5 text-orange-600" />
                <span>Ficha Completa - {fichaAnimalSelecionado.animal.nome}</span>
              </DialogTitle>
              <DialogDescription>
                Número de Processo: {fichaAnimalSelecionado.animal.numero_processo}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Dados Básicos */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados Básicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Nome</Label>
                      <p className="font-semibold">{fichaAnimalSelecionado.animal.nome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Espécie</Label>
                      <p>{fichaAnimalSelecionado.animal.especie}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Raça</Label>
                      <p>{fichaAnimalSelecionado.animal.raca}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Sexo</Label>
                      <p>{fichaAnimalSelecionado.animal.sexo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Idade</Label>
                      <p>{fichaAnimalSelecionado.animal.idade} anos</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Peso</Label>
                      <p>{fichaAnimalSelecionado.animal.peso} kg</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Estado</Label>
                      <Badge className={
                        fichaAnimalSelecionado.animal.estado === 'Ativo' ? 'bg-green-100 text-green-800' :
                        fichaAnimalSelecionado.animal.estado === 'Adotado' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {fichaAnimalSelecionado.animal.estado}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Data de Entrada</Label>
                      <p>{formatDate(fichaAnimalSelecionado.animal.data_entrada)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Custo Total</Label>
                      <p className="font-semibold text-green-600">{formatCurrency(fichaAnimalSelecionado.custoTotal)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Histórico Médico */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico Médico ({fichaAnimalSelecionado.totalIntervencoes} intervenções)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fichaAnimalSelecionado.intervencoes.map((intervencao: any) => (
                      <div key={intervencao.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge variant="outline">{intervencao.tipoNome}</Badge>
                            <p className="text-sm text-gray-600 mt-1">{formatDate(intervencao.data_intervencao)}</p>
                          </div>
                          {intervencao.custo && (
                            <span className="font-medium text-green-600">{formatCurrency(intervencao.custo)}</span>
                          )}
                        </div>
                        {intervencao.veterinario && (
                          <p className="text-sm"><strong>Veterinário:</strong> {intervencao.veterinario}</p>
                        )}
                        {intervencao.clinica && (
                          <p className="text-sm"><strong>Clínica:</strong> {intervencao.clinica}</p>
                        )}
                        {intervencao.observacoes && (
                          <p className="text-sm text-gray-600 mt-2">{intervencao.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Histórico de Localizações */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Localizações ({fichaAnimalSelecionado.totalLocalizacoes} registos)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fichaAnimalSelecionado.localizacoes.map((localizacao: any) => (
                      <div key={localizacao.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge variant="outline">{localizacao.localizacao}</Badge>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(localizacao.data_entrada)} - {localizacao.data_saida ? formatDate(localizacao.data_saida) : 'Atual'}
                            </p>
                          </div>
                          <Badge className={localizacao.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {localizacao.ativo ? 'Ativo' : 'Histórico'}
                          </Badge>
                        </div>
                        <p className="text-sm"><strong>Endereço:</strong> {localizacao.endereco}</p>
                        {localizacao.observacoes && (
                          <p className="text-sm text-gray-600 mt-2">{localizacao.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: FICHA DO VOLUNTÁRIO */}
      {fichaVoluntarioSelecionado && (
        <Dialog open={!!fichaVoluntarioSelecionado} onOpenChange={() => setFichaVoluntarioSelecionado(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <span>Ficha Completa - {fichaVoluntarioSelecionado.voluntario.nome}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Nome Completo</Label>
                      <p className="font-semibold">{fichaVoluntarioSelecionado.voluntario.nome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p>{fichaVoluntarioSelecionado.voluntario.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Telefone</Label>
                      <p>{fichaVoluntarioSelecionado.voluntario.telefone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge className={fichaVoluntarioSelecionado.voluntario.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {fichaVoluntarioSelecionado.voluntario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas de Atividade */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Atividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{fichaVoluntarioSelecionado.totalIntervencoes}</div>
                      <div className="text-sm text-gray-600">Intervenções Realizadas</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{fichaVoluntarioSelecionado.animaisAtendidos.length}</div>
                      <div className="text-sm text-gray-600">Animais Atendidos</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-600">Última Atividade</div>
                      <div className="text-sm text-gray-600">
                        {fichaVoluntarioSelecionado.ultimaAtividade ? formatDate(fichaVoluntarioSelecionado.ultimaAtividade) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Animais Atendidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Animais Atendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fichaVoluntarioSelecionado.animaisAtendidos.map((animal: any) => (
                      <div key={animal.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{animal.nome}</p>
                            <p className="text-sm text-gray-600">{animal.numero_processo}</p>
                            <p className="text-sm text-gray-600">{animal.especie} • {animal.raca}</p>
                          </div>
                          <Badge className={
                            animal.estado === 'Ativo' ? 'bg-green-100 text-green-800' :
                            animal.estado === 'Adotado' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {animal.estado}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SistemaRelatoriosProfissional;