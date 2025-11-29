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
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2,
  PawPrint,
  Loader2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Euro,
  Calculator,
  PieChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, MovimentoFinanceiro, CategoriaFinanceira, Intervencao } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";

const AnimalFinanceiro = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados para movimentos financeiros
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [movimentoDialogOpen, setMovimentoDialogOpen] = useState(false);
  const [editingMovimento, setEditingMovimento] = useState<MovimentoFinanceiro | null>(null);

  // Estados para filtros
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');

  // Formulário de movimento
  const [movimentoForm, setMovimentoForm] = useState({
    categoria_id: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    descricao: '',
    valor: '',
    data_movimento: '',
    observacoes: ''
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
      // Carregar movimentos financeiros do animal
      const { data: movimentosData, error: movimentosError } = await supabase
        .from('movimentos_financeiros')
        .select(`
          *,
          categorias_financeiras(nome, icone, cor)
        `)
        .eq('animal_id', id)
        .order('data_movimento', { ascending: false });

      if (movimentosError) {
        console.error('Erro ao carregar movimentos:', movimentosError);
      } else {
        console.log('DEBUG: Movimentos carregados:', movimentosData?.length || 0);
        setMovimentos(movimentosData || []);
      }

      // Carregar categorias financeiras
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .in('escopo', ['animal', 'ambos'])
        .eq('ativo', true)
        .order('nome');

      if (categoriasError) {
        console.error('Erro ao carregar categorias:', categoriasError);
      } else {
        console.log('DEBUG: Categorias carregadas:', categoriasData?.length || 0);
        setCategorias(categoriasData || []);
      }

      // Carregar intervenções com custos (consulta simplificada)
      const { data: intervencoesData, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select('*')
        .eq('animal_id', id)
        .not('custo_final', 'is', null)
        .order('data_intervencao', { ascending: false });

      if (intervencoesError) {
        console.error('Erro ao carregar intervenções:', intervencoesError);
      } else {
        console.log('DEBUG: Intervenções carregadas:', intervencoesData?.length || 0);
        setIntervencoes(intervencoesData || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
    }
  };

  useEffect(() => {
    fetchAnimalData();
  }, [id]);

  // Funções de gestão de movimentos
  const resetMovimentoForm = () => {
    setMovimentoForm({
      categoria_id: '',
      tipo: 'despesa',
      descricao: '',
      valor: '',
      data_movimento: new Date().toISOString().split('T')[0],
      observacoes: ''
    });
  };

  const openMovimentoDialog = (movimento?: MovimentoFinanceiro) => {
    if (movimento) {
      setEditingMovimento(movimento);
      setMovimentoForm({
        categoria_id: movimento.categoria_id || '',
        tipo: movimento.tipo,
        descricao: movimento.descricao || '',
        valor: movimento.valor.toString(),
        data_movimento: movimento.data_movimento || '',
        observacoes: movimento.observacoes || ''
      });
    } else {
      setEditingMovimento(null);
      resetMovimentoForm();
    }
    setMovimentoDialogOpen(true);
  };

  const handleMovimentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Usar exatamente a mesma estrutura da GestaoFinanceira.tsx
      const movimentoData = {
        categoria_id: movimentoForm.categoria_id,
        tipo: movimentoForm.tipo,
        descricao: movimentoForm.descricao.trim(),
        valor: parseFloat(movimentoForm.valor),
        data_movimento: movimentoForm.data_movimento,
        observacoes: movimentoForm.observacoes.trim() || null,
        animal_id: id
      };

      let error;
      if (editingMovimento) {
        const { error: updateError } = await supabase
          .from('movimentos_financeiros')
          .update(movimentoData)
          .eq('id', editingMovimento.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('movimentos_financeiros')
          .insert([movimentoData]);
        error = insertError;
      }

      if (error) {
        console.error('Erro ao salvar movimento:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar o movimento financeiro",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: editingMovimento ? "Movimento atualizado" : "Movimento registrado",
        description: editingMovimento ? "Movimento atualizado com sucesso" : "Novo movimento registrado com sucesso",
      });

      setMovimentoDialogOpen(false);
      resetMovimentoForm();
      setEditingMovimento(null);
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

  const handleDeleteMovimento = async (movimentoId: string) => {
    if (!confirm('Tem certeza que deseja eliminar este movimento financeiro?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('movimentos_financeiros')
        .delete()
        .eq('id', movimentoId);

      if (error) {
        console.error('Erro ao eliminar movimento:', error);
        toast({
          title: "Erro ao eliminar",
          description: "Não foi possível eliminar o movimento",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Movimento eliminado",
        description: "Movimento eliminado com sucesso",
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

  // Função para calcular totais
  const calcularTotais = () => {
    const movimentosFiltrados = movimentos.filter(movimento => {
      const matchTipo = filtroTipo === 'todos' || movimento.tipo === filtroTipo;
      const matchCategoria = filtroCategoria === 'todas' || movimento.categoria_id === filtroCategoria;
      const matchData = (!filtroDataInicio || movimento.data_movimento >= filtroDataInicio) &&
                       (!filtroDataFim || movimento.data_movimento <= filtroDataFim);
      return matchTipo && matchCategoria && matchData;
    });

    const totalReceitas = movimentosFiltrados
      .filter(m => m.tipo === 'receita')
      .reduce((sum, m) => sum + m.valor, 0);

    const totalDespesas = movimentosFiltrados
      .filter(m => m.tipo === 'despesa')
      .reduce((sum, m) => sum + m.valor, 0);

    const totalIntervencoes = intervencoes
      .reduce((sum, i) => sum + (i.custo_final || 0), 0);

    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      intervencoes: totalIntervencoes,
      saldo: totalReceitas - totalDespesas - totalIntervencoes
    };
  };

  const totais = calcularTotais();

  // Função para obter categoria
  const getCategoria = (categoriaId: string) => {
    return categorias.find(c => c.id === categoriaId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-lg text-gray-600">A carregar dados financeiros...</p>
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
        title={`${animal.nome} - Gestão Financeira`}
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
          <Button onClick={() => openMovimentoDialog()} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Movimento
          </Button>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600">Receitas</p>
                  <p className="text-xl font-bold text-green-800">€{totais.receitas.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-600 p-2 rounded-full">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-600">Despesas</p>
                  <p className="text-xl font-bold text-red-800">€{totais.despesas.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">Intervenções</p>
                  <p className="text-xl font-bold text-blue-800">€{totais.intervencoes.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-gray-200 ${totais.saldo >= 0 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' : 'bg-gradient-to-br from-orange-50 to-orange-100'}`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${totais.saldo >= 0 ? 'bg-emerald-600' : 'bg-orange-600'}`}>
                  <Euro className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm ${totais.saldo >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>Saldo</p>
                  <p className={`text-xl font-bold ${totais.saldo >= 0 ? 'text-emerald-800' : 'text-orange-800'}`}>
                    €{totais.saldo.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-emerald-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="receita">Receitas</SelectItem>
                    <SelectItem value="despesa">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoria</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                />
              </div>

              <div>
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFiltroTipo('todos');
                    setFiltroCategoria('todas');
                    setFiltroDataInicio('');
                    setFiltroDataFim('');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custos das Intervenções */}
        {intervencoes.length > 0 && (
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Calculator className="h-6 w-6 mr-2" />
                Custos das Intervenções ({intervencoes.length})
              </CardTitle>
              <CardDescription className="text-blue-600">
                Custos automáticos das intervenções veterinárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {intervencoes.map((intervencao) => (
                  <div key={intervencao.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">{intervencao.tipos_intervencoes?.nome}</h4>
                      <p className="text-sm text-blue-600">
                        {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                        {intervencao.clinicas_veterinarias?.nome && ` • ${intervencao.clinicas_veterinarias.nome}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-800">€{(intervencao.custo_final || 0).toFixed(2)}</p>
                      {intervencao.custo !== intervencao.custo_final && (
                        <p className="text-xs text-blue-600 line-through">€{(intervencao.custo || 0).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Movimentos */}
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-800">
              <DollarSign className="h-6 w-6 mr-2" />
              Movimentos Financeiros ({movimentos.filter(m => {
                const matchTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;
                const matchCategoria = filtroCategoria === 'todas' || m.categoria_id === filtroCategoria;
                const matchData = (!filtroDataInicio || m.data_movimento >= filtroDataInicio) &&
                                 (!filtroDataFim || m.data_movimento <= filtroDataFim);
                return matchTipo && matchCategoria && matchData;
              }).length})
            </CardTitle>
            <CardDescription className="text-emerald-600">
              Receitas e despesas específicas deste animal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movimentos.filter(movimento => {
              const matchTipo = filtroTipo === 'todos' || movimento.tipo === filtroTipo;
              const matchCategoria = filtroCategoria === 'todas' || movimento.categoria_id === filtroCategoria;
              const matchData = (!filtroDataInicio || movimento.data_movimento >= filtroDataInicio) &&
                               (!filtroDataFim || movimento.data_movimento <= filtroDataFim);
              return matchTipo && matchCategoria && matchData;
            }).length > 0 ? (
              <div className="space-y-3">
                {movimentos.filter(movimento => {
                  const matchTipo = filtroTipo === 'todos' || movimento.tipo === filtroTipo;
                  const matchCategoria = filtroCategoria === 'todas' || movimento.categoria_id === filtroCategoria;
                  const matchData = (!filtroDataInicio || movimento.data_movimento >= filtroDataInicio) &&
                                   (!filtroDataFim || movimento.data_movimento <= filtroDataFim);
                  return matchTipo && matchCategoria && matchData;
                }).map((movimento) => {
                  const categoria = getCategoria(movimento.categoria_id);
                  return (
                    <div key={movimento.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-emerald-200">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${movimento.tipo === 'receita' ? 'bg-green-600' : 'bg-red-600'}`}>
                          {movimento.tipo === 'receita' ? (
                            <TrendingUp className="h-4 w-4 text-white" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{movimento.descricao}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(movimento.data_movimento).toLocaleDateString('pt-PT')}
                            </div>
                            {movimento.categorias_financeiras ? (
                              <Badge variant="outline" className="text-xs">
                                {movimento.categorias_financeiras.icone} {movimento.categorias_financeiras.nome}
                              </Badge>
                            ) : categoria && (
                              <Badge variant="outline" className="text-xs">
                                {categoria.nome}
                              </Badge>
                            )}

                          </div>
                          {movimento.observacoes && (
                            <p className="text-sm text-gray-600 mt-1">{movimento.observacoes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`font-bold ${movimento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                            {movimento.tipo === 'receita' ? '+' : '-'}€{movimento.valor.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMovimentoDialog(movimento)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMovimento(movimento.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum movimento encontrado</p>
                <p className="text-sm">Clique em "Novo Movimento" para registrar o primeiro movimento financeiro.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Diálogo de Movimento Financeiro */}
      <Dialog open={movimentoDialogOpen} onOpenChange={setMovimentoDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-emerald-800">
              {editingMovimento ? 'Editar Movimento' : 'Novo Movimento Financeiro'}
            </DialogTitle>
            <DialogDescription>
              {editingMovimento ? 'Edite os dados do movimento financeiro' : 'Registre uma nova receita ou despesa para este animal'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleMovimentoSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tipo" className="text-emerald-700 font-medium">
                Tipo de Movimento
              </Label>
              <Select 
                value={movimentoForm.tipo} 
                onValueChange={(value: 'receita' | 'despesa') => setMovimentoForm({ ...movimentoForm, tipo: value })}
              >
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">💰 Receita</SelectItem>
                  <SelectItem value="despesa">💸 Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="categoria_id" className="text-emerald-700 font-medium">
                Categoria
              </Label>
              <Select 
                value={movimentoForm.categoria_id} 
                onValueChange={(value) => setMovimentoForm({ ...movimentoForm, categoria_id: value })}
              >
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias
                    .filter(c => c.tipo === movimentoForm.tipo)
                    .map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.icone} {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricao" className="text-emerald-700 font-medium">
                Descrição
              </Label>
              <Input
                id="descricao"
                value={movimentoForm.descricao}
                onChange={(e) => setMovimentoForm({ ...movimentoForm, descricao: e.target.value })}
                className="border-emerald-200 focus:border-emerald-400"
                placeholder="Descrição do movimento"
                required
              />
            </div>

            <div>
              <Label htmlFor="valor" className="text-emerald-700 font-medium">
                Valor (€)
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={movimentoForm.valor}
                onChange={(e) => setMovimentoForm({ ...movimentoForm, valor: e.target.value })}
                className="border-emerald-200 focus:border-emerald-400"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="data_movimento" className="text-emerald-700 font-medium">
                Data do Movimento
              </Label>
              <Input
                id="data_movimento"
                type="date"
                value={movimentoForm.data_movimento}
                onChange={(e) => setMovimentoForm({ ...movimentoForm, data_movimento: e.target.value })}
                className="border-emerald-200 focus:border-emerald-400"
                required
              />
            </div>

            
            <div>
              <Label htmlFor="observacoes" className="text-emerald-700 font-medium">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={movimentoForm.observacoes}
                onChange={(e) => setMovimentoForm({ ...movimentoForm, observacoes: e.target.value })}
                className="border-emerald-200 focus:border-emerald-400"
                placeholder="Detalhes adicionais sobre o movimento..."
                rows={3}
              />
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg">
              <p className="text-sm text-emerald-700">
                <strong>Nota:</strong> Este movimento será associado especificamente a este animal e aparecerá no Dashboard Financeiro geral.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setMovimentoDialogOpen(false);
                  resetMovimentoForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingMovimento ? 'Atualizar' : 'Registrar'} Movimento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AnimalFinanceiro;