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
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
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
  diagnostico?: string;
  tratamento?: string;
  medicamentos?: string;
  proxima_consulta?: string;
  // Relacionamentos com informações completas
  tipos_intervencoes?: { 
    nome: string;
    cor?: string;
    icone?: string;
  };
  clinicas_veterinarias?: { 
    nome: string;
    telefone?: string;
    endereco?: string;
  };
  voluntarios?: {
    nome: string;
    display_name?: string;
    full_name?: string;
  };
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
.from('movimentos_financeiros_2025_12_13_06_00')
        .select(`
          *,
categorias_financeiras_2025_12_13_06_00(nome, icone, cor)
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
.from('categorias_financeiras_2025_12_13_06_00')
        .select('*')
        .in('escopo', ['animal', 'ambos'])
        .eq('ativo', true)
        .order('nome');

      if (categoriasError) {
        console.error('Erro ao carregar categorias:', categoriasError);
      } else {
        setCategorias(categoriasData || []);
      }

// Carregar intervenções com custos incluindo relacionamentos
      const { data: intervencoesData, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select(`
          *,
          clinicas_veterinarias(nome, tem_protocolo),
          tipos_intervencoes(nome)
        `)
        .eq('animal_id', id)
        .not('custo_final', 'is', null)
        .order('data_intervencao', { ascending: false });

if (intervencoesError) {
        console.error('Erro ao carregar intervenções:', intervencoesError);
      } else {
        console.log('Dados das intervenções carregados:', intervencoesData);
        console.log('Primeira intervenção (exemplo):', intervencoesData?.[0]);
        console.log('Campos disponíveis:', intervencoesData?.[0] ? Object.keys(intervencoesData[0]) : 'Nenhuma intervenção');
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
      // Gerar número único mais curto (máximo 20 caracteres)
      const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos
      const numeroMovimento = `MOV-${timestamp}`;
      
      // Gerar dados completos com campos obrigatórios
      const movimentoData = {
        numero_movimento: numeroMovimento,
        escopo: 'animal', // Sempre 'animal' para movimentos de animais
        categoria_id: movimentoForm.categoria_id || null, // Pode ser null
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
.from('movimentos_financeiros_2025_12_13_06_00')
          .update(movimentoData)
          .eq('id', editingMovimento.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
.from('movimentos_financeiros_2025_12_13_06_00')
          .insert([movimentoData]);
        error = insertError;
      }

      if (error) {
        console.error('Erro ao salvar movimento:', error);
        console.error('Dados enviados:', movimentoData);
        toast({
          title: "Erro",
          description: `Erro ao salvar movimento: ${error.message || 'Erro desconhecido'}`,
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
if (!confirm('Tem certeza que deseja excluir este movimento?')) return;
      
      const { error } = await supabase
        .from('movimentos_financeiros_2025_12_13_06_00')
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

// Aplicar filtros aos movimentos
  const movimentosFiltrados = movimentos.filter(movimento => {
    // Filtro por tipo
    if (filtroTipo !== 'todos' && movimento.tipo !== filtroTipo) return false;
    
    // Filtro por categoria
    if (filtroCategoria !== 'todas' && movimento.categoria_id !== filtroCategoria) return false;
    
    // Filtro por data de início
    if (filtroDataInicio && movimento.data_movimento < filtroDataInicio) return false;
    
    // Filtro por data de fim
    if (filtroDataFim && movimento.data_movimento > filtroDataFim) return false;
    
    return true;
  });

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
                Custos automáticos das intervenções veterinárias com informações completas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {intervencoes.map((intervencao) => (
                  <div key={intervencao.id} className="bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    {/* Cabeçalho da Intervenção */}
                    <div className="flex items-center justify-between p-4 border-b border-blue-100">
                      <div className="flex items-center space-x-3">
                        {/* Ícone do Tipo */}
                        {intervencao.tipos_intervencoes?.icone && (
                          <span className="text-2xl">{intervencao.tipos_intervencoes.icone}</span>
                        )}
                        <div>
<h4 className="font-bold text-blue-900 text-lg">
                            {intervencao.tipo || intervencao.descricao || 'Intervenção Veterinária'}
                          </h4>
                          {intervencao.urgente && (
                            <span className="inline-block px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full mt-1">
                              URGENTE
                            </span>
                          )}
                          <p className="text-sm text-blue-600">
                            {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status e Prioridade */}
                      <div className="flex items-center space-x-2">
                        {intervencao.urgente && (
                          <span className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
URGENTE
                          </span>
                        )}
                        {intervencao.estado && (
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                            intervencao.estado === 'concluida' ? 'bg-green-100 text-green-700 border-green-200' :
                            intervencao.estado === 'agendada' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            intervencao.estado === 'em_andamento' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            intervencao.estado === 'cancelada' ? 'bg-red-100 text-red-700 border-red-200' : 
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
{intervencao.estado === 'concluida' ? 'Concluida' :
                             intervencao.estado === 'agendada' ? 'Agendada' :
                             intervencao.estado === 'em_andamento' ? 'Em Andamento' :
                             intervencao.estado === 'cancelada' ? 'Cancelada' :
                             intervencao.estado.charAt(0).toUpperCase() + intervencao.estado.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
{/* Detalhes da Intervenção */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Veterinário */}
                        {intervencao.veterinario && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <div className="flex items-center mb-1">
                              <span className="text-green-600 mr-2">Veterinário:</span>
                            </div>
                            <p className="font-semibold text-green-900">Dr(a). {intervencao.veterinario}</p>
                          </div>
                        )}
                        
                        {/* Clínica */}
{intervencao.clinicas_veterinarias?.nome && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="flex items-center mb-1">
                              <span className="text-blue-600 mr-2">Clínica:</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-blue-900">{intervencao.clinicas_veterinarias.nome}</p>
                              {intervencao.clinicas_veterinarias.tem_protocolo && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full border border-green-200">
                                  PROTOCOLO
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
{/* Status baseado na data (igual à página de intervenções) */}
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                          <div className="flex items-center mb-1">
                            <span className="text-indigo-600 mr-2">Status:</span>
                          </div>
                          <p className="font-semibold text-indigo-900">
                            {(() => {
                              const hoje = new Date();
                              hoje.setHours(0, 0, 0, 0);
                              const dataInterv = new Date(intervencao.data_intervencao);
                              dataInterv.setHours(0, 0, 0, 0);
                              
                              if (dataInterv.getTime() === hoje.getTime()) {
                                return '🔥 Hoje';
                              } else if (dataInterv > hoje) {
                                return '📅 Agendada';
                              } else {
                                return '✅ Concluída';
                              }
                            })()} 
                          </p>
                        </div>
                        
                        {/* Próxima Data */}
                        {intervencao.proxima_data && (
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                            <div className="flex items-center mb-1">
                              <span className="text-purple-600 mr-2">Próxima Consulta:</span>
                            </div>
                            <p className="font-semibold text-purple-900">
                              {new Date(intervencao.proxima_data).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        )}
                        
                        {/* Desconto de Protocolo */}
                        {intervencao.desconto_protocolo && intervencao.desconto_protocolo > 0 && (
                          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <div className="flex items-center mb-1">
                              <span className="text-emerald-600 mr-2">Desconto Protocolo:</span>
                            </div>
                            <p className="font-semibold text-emerald-900">{intervencao.desconto_protocolo}%</p>
                          </div>
                        )}
                        
                        {/* Diagnóstico */}
                        {intervencao.diagnostico && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <div className="flex items-center mb-1">
                              <span className="text-orange-600 mr-2">Diagnóstico:</span>
                            </div>
                            <p className="font-semibold text-orange-900">{intervencao.diagnostico}</p>
                          </div>
                        )}
                        
                        {/* Tratamento */}
                        {intervencao.tratamento && (
                          <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                            <div className="flex items-center mb-1">
                              <span className="text-teal-600 mr-2">Tratamento:</span>
                            </div>
                            <p className="font-semibold text-teal-900">{intervencao.tratamento}</p>
                          </div>
                        )}
                        
                        {/* Observações */}
                        {intervencao.observacoes && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center mb-1">
                              <span className="text-gray-600 mr-2">Observações:</span>
                            </div>
                            <p className="font-semibold text-gray-900">{intervencao.observacoes}</p>
                          </div>
                        )}
                        
                        {/* Data da Intervenção */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <div className="flex items-center mb-1">
                            <span className="text-blue-600 mr-2">Data:</span>
                          </div>
                          <p className="font-semibold text-blue-900">
                            {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        
                        {/* Custo Original vs Final */}
                        {intervencao.custo && intervencao.custo !== intervencao.custo_final && (
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                            <div className="flex items-center mb-1">
                              <span className="text-yellow-600 mr-2">Custo Original:</span>
                            </div>
                            <p className="font-semibold text-yellow-900">€{(intervencao.custo || 0).toFixed(2)}</p>
                            <p className="text-sm text-yellow-600">Desconto aplicado</p>
                          </div>
                        )}
                        
                        {/* Urgente */}
                        {intervencao.urgente && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <div className="flex items-center mb-1">
                              <span className="text-red-600 mr-2">Prioridade:</span>
                            </div>
                            <p className="font-semibold text-red-900">URGENTE</p>
                          </div>
                        )}
                        
                        {/* Medicamentos */}
                        {intervencao.medicamentos && (
                          <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                            <div className="flex items-center mb-1">
                              <span className="text-pink-600 mr-2">Medicamentos:</span>
                            </div>
                            <p className="font-semibold text-pink-900">{intervencao.medicamentos}</p>
</div>
                        )}
                        


                        
                        {/* Diagnóstico */}
                        {intervencao.diagnostico && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <div className="flex items-center mb-1">
                              <span className="text-orange-600 mr-2">Diagnostico:</span>
                            </div>
                            <p className="font-semibold text-orange-900">{intervencao.diagnostico}</p>
                          </div>
                        )}
                        
                        {/* Tratamento */}
                        {intervencao.tratamento && (
                          <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                            <div className="flex items-center mb-1">
                              <span className="text-teal-600 mr-2">Tratamento:</span>
                            </div>
                            <p className="font-semibold text-teal-900">{intervencao.tratamento}</p>
                          </div>
                        )}
                        
                        {/* Medicamentos */}
                        {intervencao.medicamentos && (
                          <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                            <div className="flex items-center mb-1">
                              <span className="text-pink-600 mr-2">Medicamentos:</span>
                            </div>
                            <p className="font-semibold text-pink-900">{intervencao.medicamentos}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Próxima Consulta */}
                      {intervencao.proxima_consulta && (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
                          <div className="flex items-center">
                            <span className="text-yellow-600 mr-2">Proxima Consulta:</span>
                            <span className="ml-2 font-semibold text-yellow-900">
                              {new Date(intervencao.proxima_consulta).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Observações */}
                      {intervencao.observacoes && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center mb-2">
                            <span className="text-gray-600 mr-2">Observacoes:</span>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{intervencao.observacoes}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Custo */}
                    <div className="bg-blue-50 px-4 py-3 border-t border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">Custo:</span>
                          <span className="text-sm font-medium text-blue-700">Custo da Intervenção</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-blue-900">€{(intervencao.custo_final || 0).toFixed(2)}</p>
                          {intervencao.custo !== intervencao.custo_final && intervencao.custo > 0 && (
                            <p className="text-sm text-blue-600 line-through">€{(intervencao.custo || 0).toFixed(2)}</p>
                          )}
                          {intervencao.custo_final === 0 && (
                            <p className="text-sm text-green-600 font-medium">Gratuito</p>
                          )}
                        </div>
                      </div>
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
              Movimentos Financeiros
            </CardTitle>
            <CardDescription className="text-emerald-600">
              Receitas e despesas registradas para este animal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movimentos.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum movimento registado</h3>
                <p className="text-gray-500 mb-4">
                  Este animal ainda não possui movimentos financeiros registados.
                </p>
                <Button 
                  onClick={() => openMovimentoDialog()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registar Primeiro Movimento
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
<p className="text-emerald-700 font-medium">{movimentosFiltrados.length} de {movimentos.length} movimento(s)</p>
                  <Button 
                    onClick={() => openMovimentoDialog()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
<Plus className="h-4 w-4 mr-2" />
                    Novo Movimento
                  </Button>
                </div>
                
{movimentosFiltrados.map((movimento) => (
                  <div key={movimento.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-emerald-900">{movimento.descricao}</h4>
                        <Badge className={movimento.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {movimento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-emerald-600">
                        {new Date(movimento.data_movimento).toLocaleDateString('pt-PT')} • {movimento.numero_movimento}
                      </p>
                      {movimento.observacoes && (
                        <p className="text-sm text-gray-600 mt-1">{movimento.observacoes}</p>
                      )}
                    </div>
<div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                        movimento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimento.tipo === 'receita' ? '+' : '-'}€{movimento.valor.toFixed(2)}
</p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openMovimentoDialog(movimento)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMovimento(movimento.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal de Novo Movimento */}
      <Dialog open={movimentoDialogOpen} onOpenChange={setMovimentoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMovimento ? 'Editar Movimento' : 'Novo Movimento Financeiro'}
            </DialogTitle>
            <DialogDescription>
              {animal && `Registar movimento para ${animal.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleMovimentoSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select 
                value={movimentoForm.tipo} 
                onValueChange={(value: 'receita' | 'despesa') => setMovimentoForm({ ...movimentoForm, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={movimentoForm.descricao}
                onChange={(e) => setMovimentoForm({ ...movimentoForm, descricao: e.target.value })}
                placeholder="Descrição do movimento"
                required
              />
            </div>

            <div>
              <Label htmlFor="valor">Valor (€) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={movimentoForm.valor}
                onChange={(e) => setMovimentoForm({ ...movimentoForm, valor: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="data_movimento">Data *</Label>
              <Input
                id="data_movimento"
                type="date"
                value={movimentoForm.data_movimento}
                onChange={(e) => setMovimentoForm({ ...movimentoForm, data_movimento: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={movimentoForm.observacoes}
                onChange={(e) => setMovimentoForm({ ...movimentoForm, observacoes: e.target.value })}
                placeholder="Observações adicionais (opcional)"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setMovimentoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingMovimento ? 'Atualizar' : 'Criar'} Movimento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default AnimalFinanceiro;