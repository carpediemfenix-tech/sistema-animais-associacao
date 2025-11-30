import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
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

// Interfaces
interface Animal {
  id: string;
  nome: string;
  especie: string;
  sexo: string;
  estado: string;
}

interface MovimentoFinanceiro {
  id: string;
  animal_id?: string;
  categoria_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data_movimento: string;
  observacoes?: string;
  categorias_financeiras?: { nome: string; icone: string; cor: string };
}

interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao' | 'ambos';
  icone: string;
  cor: string;
  ativo: boolean;
}

interface Intervencao {
  id: string;
  animal_id: string;
  data_intervencao: string;
  custo_final: number;
  custo: number;
  urgente: boolean;
  estado: string;
  veterinario?: string;
  observacoes?: string;
  tipos_intervencoes?: { nome: string };
  clinicas_veterinarias?: { nome: string };
}

const AnimalFinanceiro: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Estados principais
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do diálogo
  const [movimentoDialogOpen, setMovimentoDialogOpen] = useState(false);
  const [editingMovimento, setEditingMovimento] = useState<MovimentoFinanceiro | null>(null);

  // Estados dos filtros
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
        .select('id, nome, especie, sexo, estado')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Animal não encontrado');
        return;
      }

      setAnimal(data);
      await loadRelatedData();
    } catch (error) {
      console.error('Erro ao carregar animal:', error);
      setError('Erro ao carregar dados do animal');
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
        setCategorias(categoriasData || []);
      }

      // Carregar intervenções com custos
      const { data: intervencoesData, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select('*')
        .eq('animal_id', id)
        .not('custo_final', 'is', null)
        .order('data_intervencao', { ascending: false });

      if (intervencoesError) {
        console.error('Erro ao carregar intervenções:', intervencoesError);
      } else {
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
          title: "Erro",
          description: "Erro ao salvar movimento financeiro",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: editingMovimento ? "Movimento atualizado com sucesso" : "Movimento criado com sucesso",
      });

      setMovimentoDialogOpen(false);
      resetMovimentoForm();
      setEditingMovimento(null);
      await loadRelatedData();

    } catch (error) {
      console.error('Erro ao processar movimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar movimento financeiro",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMovimento = async (movimentoId: string) => {
    try {
      const { error } = await supabase
        .from('movimentos_financeiros')
        .delete()
        .eq('id', movimentoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Movimento eliminado com sucesso",
      });

      await loadRelatedData();
    } catch (error) {
      console.error('Erro ao eliminar movimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar movimento",
        variant: "destructive",
      });
    }
  };

  // Funções auxiliares
  const getCategoria = (categoriaId: string) => {
    return categorias.find(c => c.id === categoriaId);
  };

  const calcularTotais = () => {
    const receitas = movimentos
      .filter(m => m.tipo === 'receita')
      .reduce((sum, m) => sum + m.valor, 0);
    
    const despesas = movimentos
      .filter(m => m.tipo === 'despesa')
      .reduce((sum, m) => sum + m.valor, 0);

    const custosIntervencoes = intervencoes
      .reduce((sum, i) => sum + (i.custo_final || 0), 0);

    return {
      receitas,
      despesas: despesas + custosIntervencoes,
      saldo: receitas - (despesas + custosIntervencoes),
      custosIntervencoes
    };
  };

  const totais = calcularTotais();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro</h2>
          <p className="text-gray-600 mb-6">{error || 'Animal não encontrado'}</p>
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
                <div className="p-2 bg-green-600 rounded-full">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Receitas</p>
                  <p className="text-2xl font-bold text-green-800">€{totais.receitas.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-600 rounded-full">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700">Despesas</p>
                  <p className="text-2xl font-bold text-red-800">€{totais.despesas.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-full">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Intervenções</p>
                  <p className="text-2xl font-bold text-blue-800">€{totais.custosIntervencoes.toFixed(2)}</p>
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
                  <p className={`text-sm font-medium ${totais.saldo >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>Saldo</p>
                  <p className={`text-2xl font-bold ${totais.saldo >= 0 ? 'text-emerald-800' : 'text-orange-800'}`}>€{totais.saldo.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <PieChart className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select value={filtroTipo} onValueChange={(value: 'todos' | 'receita' | 'despesa') => setFiltroTipo(value)}>
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
                  className="w-full"
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
                  <div key={intervencao.id} className="flex items-start justify-between p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-blue-900">{intervencao.tipos_intervencoes?.nome || 'Intervenção'}</h4>
                        {intervencao.urgente && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            URGENTE
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-700">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                        </div>
                        
                        {intervencao.clinicas_veterinarias?.nome && (
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {intervencao.clinicas_veterinarias.nome}
                          </div>
                        )}
                        
                        {intervencao.veterinario && (
                          <div className="flex items-center">
                            <span className="h-3 w-3 mr-1">👨‍⚕️</span>
                            Dr(a). {intervencao.veterinario}
                          </div>
                        )}
                        
                        {intervencao.estado && (
                          <div className="flex items-center">
                            <span className={`h-2 w-2 rounded-full mr-2 ${
                              intervencao.estado === 'concluida' ? 'bg-green-500' :
                              intervencao.estado === 'agendada' ? 'bg-yellow-500' :
                              intervencao.estado === 'cancelada' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                            {intervencao.estado.charAt(0).toUpperCase() + intervencao.estado.slice(1)}
                          </div>
                        )}
                      </div>
                      
                      {intervencao.observacoes && (
                        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                          {intervencao.observacoes}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg text-blue-800">€{(intervencao.custo_final || 0).toFixed(2)}</p>
                      {intervencao.custo !== intervencao.custo_final && (
                        <p className="text-sm text-blue-600 line-through">€{(intervencao.custo || 0).toFixed(2)}</p>
                      )}
                      {intervencao.custo_final === 0 && (
                        <p className="text-xs text-blue-500">Gratuito</p>
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
              Receitas e despesas registradas para este animal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movimentos.filter(m => {
                const matchTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;
                const matchCategoria = filtroCategoria === 'todas' || m.categoria_id === filtroCategoria;
                const matchData = (!filtroDataInicio || m.data_movimento >= filtroDataInicio) &&
                                 (!filtroDataFim || m.data_movimento <= filtroDataFim);
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
              
              {movimentos.filter(m => {
                const matchTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;
                const matchCategoria = filtroCategoria === 'todas' || m.categoria_id === filtroCategoria;
                const matchData = (!filtroDataInicio || m.data_movimento >= filtroDataInicio) &&
                                 (!filtroDataFim || m.data_movimento <= filtroDataFim);
                return matchTipo && matchCategoria && matchData;
              }).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum movimento encontrado com os filtros aplicados</p>
                </div>
              )}
            </div>
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

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMovimentoDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {editingMovimento ? 'Atualizar' : 'Criar'} Movimento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalFinanceiro;