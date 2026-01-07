import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  ShoppingCart,
  Minus,
  History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";
import HistoricoMovimentos from "@/components/HistoricoMovimentos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Categoria {
  id: string;
  nome: string;
  cor_interface: string;
  icone: string;
}

interface Tipo {
  id: string;
  nome: string;
  categoria_id: string;
  categoria?: Categoria;
}

interface Item {
  id: string;
  tipo_id: string;
  nome: string;
  descricao: string;
  codigo_interno?: string;
  codigo_barras?: string;
  referencia_fornecedor?: string;
  tamanho?: string;
  cor?: string;
  especificacao?: string;
  quantidade_atual: number;
  stock_minimo: number;
  stock_maximo?: number;
  preco_unitario?: number;
  valor_total_stock?: number;
  data_validade?: string;
  lote?: string;
  localizacao_fisica?: string;
  ativo: boolean;
  alerta_stock_baixo: boolean;
  created_at: string;
  updated_at: string;
  tipo?: Tipo;
}

interface MovimentoStock {
  id: string;
  item_id: string;
  tipo_movimento: string;
  quantidade: number;
  quantidade_anterior: number;
  quantidade_nova: number;
  motivo?: string;
  documento_referencia?: string;
  preco_unitario?: number;
  valor_total?: number;
  data_movimento: string;
  observacoes?: string;
}

const ItensAprovisionamento = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [itens, setItens] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [filterAlerta, setFilterAlerta] = useState<string>('all');
  
  // Estados para paginação e ordenação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<string>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    tipo_id: '',
    nome: '',
    descricao: '',
    codigo_interno: '',
    codigo_barras: '',
    referencia_fornecedor: '',
    tamanho: '',
    cor: '',
    especificacao: '',
    quantidade_atual: 0,
    stock_minimo: 0,
    stock_maximo: '',
    preco_unitario: '',
    data_validade: '',
    lote: '',
    localizacao_fisica: ''
  });

  // Estados para movimento de stock
  const [showMovimentoForm, setShowMovimentoForm] = useState(false);
  const [itemMovimento, setItemMovimento] = useState<Item | null>(null);
  const [movimentoData, setMovimentoData] = useState({
    tipo_movimento: '',
    quantidade: 0,
    motivo: '',
    documento_referencia: '',
    preco_unitario: '',
    observacoes: ''
  });

  // Estados para histórico de movimentos
  const [showHistorico, setShowHistorico] = useState(false);
  const [itemHistorico, setItemHistorico] = useState<Item | null>(null);
  
  // Estado para autorizar stock negativo
  const [stockNegativoAutorizado, setStockNegativoAutorizado] = useState(false);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 [ITENS] Carregando dados...');

      // Carregar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias_aprovisionamento_2026_01_06')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Carregar tipos
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipos_aprovisionamento_2026_01_06')
        .select(`
          *,
          categoria:categorias_aprovisionamento_2026_01_06(*)
        `)
        .eq('ativo', true)
        .order('nome');

      if (tiposError) throw tiposError;
      setTipos(tiposData || []);

      // Carregar itens
      const { data: itensData, error: itensError } = await supabase
        .from('itens_aprovisionamento_2026_01_06')
        .select(`
          *,
          tipo:tipos_aprovisionamento_2026_01_06(
            *,
            categoria:categorias_aprovisionamento_2026_01_06(*)
          )
        `)
        .eq('ativo', true)
        .order('nome');

      if (itensError) throw itensError;
      setItens(itensData || []);

      console.log('✅ [ITENS] Dados carregados:', {
        categorias: categoriasData?.length || 0,
        tipos: tiposData?.length || 0,
        itens: itensData?.length || 0
      });

    } catch (error: any) {
      console.error('❌ [ITENS] Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos itens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_id: '',
      nome: '',
      descricao: '',
      codigo_interno: '',
      codigo_barras: '',
      referencia_fornecedor: '',
      tamanho: '',
      cor: '',
      especificacao: '',
      quantidade_atual: 0,
      stock_minimo: 0,
      stock_maximo: '',
      preco_unitario: '',
      data_validade: '',
      lote: '',
      localizacao_fisica: ''
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.tipo_id || !formData.nome) {
        toast({
          title: "Erro",
          description: "Tipo e nome são obrigatórios",
          variant: "destructive",
        });
        return;
      }

      const itemData = {
        ...formData,
        stock_maximo: formData.stock_maximo ? parseInt(formData.stock_maximo) : null,
        preco_unitario: formData.preco_unitario ? parseFloat(formData.preco_unitario) : null,
        data_validade: formData.data_validade || null
      };

      if (editingId) {
        // Atualizar item existente
        const { error } = await supabase
          .from('itens_aprovisionamento_2026_01_06')
          .update(itemData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Item atualizado com sucesso",
        });
      } else {
        // Criar novo item
        const { error } = await supabase
          .from('itens_aprovisionamento_2026_01_06')
          .insert([itemData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Item criado com sucesso",
        });
      }

      setEditingId(null);
      setShowNewForm(false);
      resetForm();
      loadData();

    } catch (error: any) {
      console.error('Erro ao salvar item:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: Item) => {
    setFormData({
      tipo_id: item.tipo_id,
      nome: item.nome,
      descricao: item.descricao || '',
      codigo_interno: item.codigo_interno || '',
      codigo_barras: item.codigo_barras || '',
      referencia_fornecedor: item.referencia_fornecedor || '',
      tamanho: item.tamanho || '',
      cor: item.cor || '',
      especificacao: item.especificacao || '',
      quantidade_atual: item.quantidade_atual,
      stock_minimo: item.stock_minimo,
      stock_maximo: item.stock_maximo?.toString() || '',
      preco_unitario: item.preco_unitario?.toString() || '',
      data_validade: item.data_validade || '',
      lote: item.lote || '',
      localizacao_fisica: item.localizacao_fisica || ''
    });
    setEditingId(item.id);
    setShowNewForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este item?')) return;

    try {
      const { error } = await supabase
        .from('itens_aprovisionamento_2026_01_06')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item desativado com sucesso",
      });

      loadData();
    } catch (error: any) {
      console.error('Erro ao desativar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao desativar item",
        variant: "destructive",
      });
    }
  };

  // Função para validar se o movimento é válido
  const isMovimentoValido = () => {
    if (!itemMovimento || !movimentoData.tipo_movimento || !movimentoData.quantidade) {
      return { valido: false, motivo: "Campos obrigatórios em falta" };
    }

    if (movimentoData.quantidade <= 0) {
      return { valido: false, motivo: "Quantidade deve ser maior que zero" };
    }

    // Validação crítica: stock insuficiente para saídas (exceto se autorizado)
    if (movimentoData.tipo_movimento.startsWith('SAIDA') && 
        movimentoData.quantidade > itemMovimento.quantidade_atual && 
        !stockNegativoAutorizado) {
      return { 
        valido: false, 
        motivo: `Stock insuficiente (disponível: ${itemMovimento.quantidade_atual}, solicitado: ${movimentoData.quantidade})`,
        podeAutorizar: true
      };
    }

    return { valido: true, motivo: "" };
  };

  const handleMovimentoStock = async () => {
    try {
      // Validação centralizada e robusta
      const validacao = isMovimentoValido();
      if (!validacao.valido) {
        toast({
          title: "❌ Movimento Inválido",
          description: validacao.motivo,
          variant: "destructive",
        });
        return;
      }

      // Validação melhorada para saídas
      if (movimentoData.tipo_movimento.startsWith('SAIDA') && 
          movimentoData.quantidade > itemMovimento.quantidade_atual) {
        
        const stockDisponivel = itemMovimento.quantidade_atual;
        const quantidadeSolicitada = movimentoData.quantidade;
        const diferenca = quantidadeSolicitada - stockDisponivel;
        
        // Opções para o utilizador
        const opcoes = [
          `1. Ajustar para ${stockDisponivel} unidades (stock disponível)`,
          `2. Continuar com ${quantidadeSolicitada} unidades (stock negativo: -${diferenca})`,
          `3. Cancelar operação`
        ].join('\n');
        
        const escolha = window.prompt(
          `⚠️ STOCK INSUFICIENTE\n\n` +
          `Item: ${itemMovimento.nome}\n` +
          `Stock disponível: ${stockDisponivel} unidades\n` +
          `Quantidade solicitada: ${quantidadeSolicitada} unidades\n` +
          `Diferença: ${diferenca} unidades em falta\n\n` +
          `Escolha uma opção:\n${opcoes}\n\n` +
          `Digite 1, 2 ou 3:`,
          '1'
        );
        
        if (escolha === '1') {
          // Ajustar para stock disponível
          setMovimentoData(prev => ({
            ...prev,
            quantidade: stockDisponivel
          }));
          
          toast({
            title: "🔄 Quantidade Ajustada",
            description: `Quantidade alterada para ${stockDisponivel} unidades (stock disponível)`,
          });
          
          // Não continuar com a operação, deixar o utilizador confirmar novamente
          return;
          
        } else if (escolha === '2') {
          // Continuar com stock negativo - confirmação adicional
          const confirmarNegativo = window.confirm(
            `⚠️ CONFIRMAÇÃO FINAL\n\n` +
            `Tem a certeza que deseja continuar?\n\n` +
            `Esta operação irá resultar em:\n` +
            `• Stock atual: ${stockDisponivel} unidades\n` +
            `• Stock final: ${stockDisponivel - quantidadeSolicitada} unidades (NEGATIVO)\n\n` +
            `Isto pode indicar:\n` +
            `• Perda/dano não registado\n` +
            `• Erro de contagem\n` +
            `• Movimento em falta\n\n` +
            `Continuar mesmo assim?`
          );
          
          if (!confirmarNegativo) return;
          
          // Adicionar observação automática
          setMovimentoData(prev => ({
            ...prev,
            observacoes: (prev.observacoes || '') + 
              ` [STOCK NEGATIVO AUTORIZADO: ${stockDisponivel} → ${stockDisponivel - quantidadeSolicitada}]`
          }));
          
        } else {
          // Cancelar (opção 3 ou qualquer outra)
          return;
        }
      }

      // Confirmação para operações críticas
      const isOperacaoCritica = movimentoData.quantidade > 100 || 
                               (movimentoData.preco_unitario && parseFloat(movimentoData.preco_unitario) > 1000);
      
      if (isOperacaoCritica) {
        const confirmar = window.confirm(
          `Operação de alto valor/quantidade detectada:\n\n` +
          `Item: ${itemMovimento.nome}\n` +
          `Tipo: ${movimentoData.tipo_movimento}\n` +
          `Quantidade: ${movimentoData.quantidade}\n` +
          `Valor unitário: €${movimentoData.preco_unitario || 'N/A'}\n\n` +
          `Confirma esta operação?`
        );
        if (!confirmar) return;
      }

      console.log('📦 [MOVIMENTO] Iniciando movimento de stock:', {
        item: itemMovimento.nome,
        tipo: movimentoData.tipo_movimento,
        quantidade: movimentoData.quantidade,
        stockAtual: itemMovimento.quantidade_atual
      });

      // Chamar função do Supabase para atualizar stock
      const { data, error } = await supabase.rpc('atualizar_stock_item', {
        p_item_id: itemMovimento.id,
        p_tipo_movimento: movimentoData.tipo_movimento,
        p_quantidade: movimentoData.quantidade,
        p_motivo: movimentoData.motivo || null,
        p_documento_referencia: movimentoData.documento_referencia || null,
        p_preco_unitario: movimentoData.preco_unitario ? parseFloat(movimentoData.preco_unitario) : null,
        p_observacoes: movimentoData.observacoes || null
      });

      if (error) throw error;

      const result = data as any;
      if (!result.success) {
        throw new Error(result.error);
      }

      // Feedback de sucesso melhorado
      const tipoLabel = movimentoData.tipo_movimento.startsWith('ENTRADA') ? 'Entrada' : 'Saída';
      const valorInfo = result.valor_total ? ` (€${result.valor_total.toFixed(2)})` : '';
      
      toast({
        title: `✅ ${tipoLabel} Registrada`,
        description: `${itemMovimento.nome}: ${result.quantidade_anterior} → ${result.quantidade_nova} unidades${valorInfo}`,
      });

      // Alertas de stock
      if (result.alerta_stock_baixo) {
        setTimeout(() => {
          toast({
            title: "⚠️ Alerta de Stock Baixo",
            description: `${itemMovimento.nome} está abaixo do stock mínimo (${itemMovimento.stock_minimo} unidades)`,
            variant: "destructive",
          });
        }, 1000);
      }

      if (result.quantidade_nova <= 0) {
        setTimeout(() => {
          toast({
            title: "🚫 Stock Esgotado",
            description: `${itemMovimento.nome} ficou sem stock disponível`,
            variant: "destructive",
          });
        }, 1500);
      }

      console.log('✅ [MOVIMENTO] Movimento concluído com sucesso:', {
        item: itemMovimento.nome,
        stockAnterior: result.quantidade_anterior,
        stockNovo: result.quantidade_nova,
        valorTotal: result.valor_total
      });

      setShowMovimentoForm(false);
      setItemMovimento(null);
      setMovimentoData({
        tipo_movimento: '',
        quantidade: 0,
        motivo: '',
        documento_referencia: '',
        preco_unitario: '',
        observacoes: ''
      });
      loadData();

    } catch (error: any) {
      console.error('❌ [MOVIMENTO] Erro ao atualizar stock:', error);
      
      // Tratamento de erros específicos melhorado
      let errorMessage = "Erro inesperado ao processar movimento";
      let showRetryOptions = false;
      
      if (error.message?.includes('Stock insuficiente') || error.message?.includes('insufficient_stock')) {
        // Extrair informações do erro
        const match = error.message.match(/Disponível: (\d+)/);
        const stockDisponivel = match ? parseInt(match[1]) : itemMovimento?.quantidade_atual || 0;
        
        errorMessage = `Stock insuficiente: apenas ${stockDisponivel} unidades disponíveis`;
        showRetryOptions = true;
        
        // Mostrar opções de recuperação
        setTimeout(() => {
          const retry = window.confirm(
            `🚫 MOVIMENTO BLOQUEADO\n\n` +
            `O sistema bloqueou esta operação por segurança.\n\n` +
            `Detalhes:\n` +
            `• Item: ${itemMovimento?.nome}\n` +
            `• Stock disponível: ${stockDisponivel} unidades\n` +
            `• Quantidade solicitada: ${movimentoData.quantidade} unidades\n\n` +
            `Deseja ajustar a quantidade para ${stockDisponivel} unidades?`
          );
          
          if (retry) {
            setMovimentoData(prev => ({
              ...prev,
              quantidade: stockDisponivel
            }));
            
            toast({
              title: "🔄 Quantidade Ajustada",
              description: `Pronto para nova tentativa com ${stockDisponivel} unidades`,
            });
          }
        }, 1000);
        
      } else if (error.message?.includes('invalid_quantity')) {
        errorMessage = "Quantidade inválida especificada";
      } else if (error.message?.includes('item_not_found')) {
        errorMessage = "Item não encontrado";
      } else if (error.message?.includes('permission_denied')) {
        errorMessage = "Sem permissão para esta operação";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Erro no Movimento",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openMovimentoForm = (item: Item, tipoMovimento: string) => {
    setItemMovimento(item);
    setMovimentoData({
      tipo_movimento: tipoMovimento,
      quantidade: 1,
      motivo: '',
      documento_referencia: '',
      preco_unitario: item.preco_unitario?.toString() || '',
      observacoes: ''
    });
    setShowMovimentoForm(true);
  };

  // Filtrar itens
  const filteredItens = itens.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = filterCategoria === 'all' || 
                            item.tipo?.categoria?.id === filterCategoria;
    
    const matchesAlerta = filterAlerta === 'all' ||
                         (filterAlerta === 'baixo' && item.alerta_stock_baixo) ||
                         (filterAlerta === 'ok' && !item.alerta_stock_baixo);
    
    return matchesSearch && matchesCategoria && matchesAlerta;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando itens...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />
      
      <PageActionBar
        breadcrumbs={[
          { label: 'Aprovisionamento', href: '/aprovisionamento' },
          { label: 'Gestão de Itens' }
        ]}
        primaryActions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/aprovisionamento')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <Button 
              onClick={() => {
                setShowNewForm(true);
                setEditingId(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome, descrição, código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="alerta">Status Stock</Label>
                <Select value={filterAlerta} onValueChange={setFilterAlerta}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="baixo">⚠️ Stock baixo</SelectItem>
                    <SelectItem value="ok">✅ Stock OK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategoria('all');
                    setFilterAlerta('all');
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Itens</p>
                  <p className="text-2xl font-bold">{filteredItens.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alertas Stock</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredItens.filter(item => item.alerta_stock_baixo).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{filteredItens.reduce((sum, item) => sum + (item.valor_total_stock || 0), 0).toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stock OK</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredItens.filter(item => !item.alerta_stock_baixo).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Itens */}
        <div className="grid grid-cols-1 gap-4">
          {filteredItens.map((item) => (
            <Card key={item.id} className={`${item.alerta_stock_baixo ? 'border-red-300 bg-red-50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{item.nome}</h3>
                      {item.alerta_stock_baixo && (
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Stock Baixo
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {item.tipo?.categoria?.nome}
                      </Badge>
                      <Badge variant="secondary">
                        {item.tipo?.nome}
                      </Badge>
                    </div>
                    
                    {item.descricao && (
                      <p className="text-gray-600 mb-3">{item.descricao}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Stock Atual:</span>
                        <span className={`ml-2 font-bold ${
                          item.alerta_stock_baixo ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {item.quantidade_atual}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Stock Mínimo:</span>
                        <span className="ml-2">{item.stock_minimo}</span>
                      </div>
                      {item.preco_unitario && (
                        <div>
                          <span className="font-medium">Preço Unit.:</span>
                          <span className="ml-2">€{item.preco_unitario.toFixed(2)}</span>
                        </div>
                      )}
                      {item.valor_total_stock && (
                        <div>
                          <span className="font-medium">Valor Total:</span>
                          <span className="ml-2 font-bold text-green-600">
                            €{item.valor_total_stock.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {(item.especificacao || item.tamanho || item.cor || item.localizacao_fisica) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.especificacao && (
                          <Badge variant="outline">{item.especificacao}</Badge>
                        )}
                        {item.tamanho && (
                          <Badge variant="outline">Tamanho: {item.tamanho}</Badge>
                        )}
                        {item.cor && (
                          <Badge variant="outline">Cor: {item.cor}</Badge>
                        )}
                        {item.localizacao_fisica && (
                          <Badge variant="outline">📍 {item.localizacao_fisica}</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openMovimentoForm(item, 'ENTRADA_COMPRA')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Entrada
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openMovimentoForm(item, 'SAIDA_CONSUMO')}
                      className="text-red-600 hover:text-red-700"
                      disabled={item.quantidade_atual === 0}
                    >
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Saída
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setItemHistorico(item);
                        setShowHistorico(true);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <History className="h-4 w-4 mr-1" />
                      Histórico
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Desativar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItens.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum item encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterCategoria !== 'all' || filterAlerta !== 'all'
                  ? 'Tente ajustar os filtros ou criar um novo item.'
                  : 'Comece criando o seu primeiro item de aprovisionamento.'}
              </p>
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Formulário */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingId ? 'Editar Item' : 'Novo Item'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Atualize as informações do item' : 'Preencha os dados do novo item'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo_id">Tipo *</Label>
                  <Select value={formData.tipo_id} onValueChange={(value) => setFormData({...formData, tipo_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.categoria?.nome} - {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Nome do item"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição detalhada do item"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="codigo_interno">Código Interno</Label>
                  <Input
                    id="codigo_interno"
                    value={formData.codigo_interno}
                    onChange={(e) => setFormData({...formData, codigo_interno: e.target.value})}
                    placeholder="Código interno"
                  />
                </div>

                <div>
                  <Label htmlFor="codigo_barras">Código de Barras</Label>
                  <Input
                    id="codigo_barras"
                    value={formData.codigo_barras}
                    onChange={(e) => setFormData({...formData, codigo_barras: e.target.value})}
                    placeholder="Código de barras"
                  />
                </div>

                <div>
                  <Label htmlFor="referencia_fornecedor">Ref. Fornecedor</Label>
                  <Input
                    id="referencia_fornecedor"
                    value={formData.referencia_fornecedor}
                    onChange={(e) => setFormData({...formData, referencia_fornecedor: e.target.value})}
                    placeholder="Referência do fornecedor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tamanho">Tamanho</Label>
                  <Input
                    id="tamanho"
                    value={formData.tamanho}
                    onChange={(e) => setFormData({...formData, tamanho: e.target.value})}
                    placeholder="XS, S, M, L, XL, XXL"
                  />
                </div>

                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={(e) => setFormData({...formData, cor: e.target.value})}
                    placeholder="Cor do item"
                  />
                </div>

                <div>
                  <Label htmlFor="especificacao">Especificação</Label>
                  <Input
                    id="especificacao"
                    value={formData.especificacao}
                    onChange={(e) => setFormData({...formData, especificacao: e.target.value})}
                    placeholder="20kg, 500ml, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantidade_atual">Quantidade Atual *</Label>
                  <Input
                    id="quantidade_atual"
                    type="number"
                    min="0"
                    value={formData.quantidade_atual}
                    onChange={(e) => setFormData({...formData, quantidade_atual: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
                  <Input
                    id="stock_minimo"
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({...formData, stock_minimo: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <Label htmlFor="stock_maximo">Stock Máximo</Label>
                  <Input
                    id="stock_maximo"
                    type="number"
                    min="0"
                    value={formData.stock_maximo}
                    onChange={(e) => setFormData({...formData, stock_maximo: e.target.value})}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preco_unitario">Preço Unitário (€)</Label>
                  <Input
                    id="preco_unitario"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_unitario}
                    onChange={(e) => setFormData({...formData, preco_unitario: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="data_validade">Data de Validade</Label>
                  <Input
                    id="data_validade"
                    type="date"
                    value={formData.data_validade}
                    onChange={(e) => setFormData({...formData, data_validade: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lote">Lote</Label>
                  <Input
                    id="lote"
                    value={formData.lote}
                    onChange={(e) => setFormData({...formData, lote: e.target.value})}
                    placeholder="Número do lote"
                  />
                </div>

                <div>
                  <Label htmlFor="localizacao_fisica">Localização Física</Label>
                  <Input
                    id="localizacao_fisica"
                    value={formData.localizacao_fisica}
                    onChange={(e) => setFormData({...formData, localizacao_fisica: e.target.value})}
                    placeholder="Armazém A - Prateleira 1"
                  />
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewForm(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingId ? 'Atualizar' : 'Criar'} Item
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Movimento de Stock */}
      {showMovimentoForm && itemMovimento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>
                {movimentoData.tipo_movimento.includes('ENTRADA') ? 'Entrada de Stock' : 'Saída de Stock'}
              </CardTitle>
              <CardDescription>
                Item: {itemMovimento.nome} (Stock atual: {itemMovimento.quantidade_atual})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tipo_movimento">Tipo de Movimento</Label>
                <Select 
                  value={movimentoData.tipo_movimento} 
                  onValueChange={(value) => setMovimentoData({...movimentoData, tipo_movimento: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRADA_COMPRA">📦 Entrada - Compra</SelectItem>
                    <SelectItem value="ENTRADA_DOACAO">🎁 Entrada - Doação</SelectItem>
                    <SelectItem value="ENTRADA_DEVOLUCAO">↩️ Entrada - Devolução</SelectItem>
                    <SelectItem value="ENTRADA_AJUSTE">⚖️ Entrada - Ajuste</SelectItem>
                    <SelectItem value="SAIDA_CONSUMO">🔽 Saída - Consumo</SelectItem>
                    <SelectItem value="SAIDA_ATRIBUICAO">👤 Saída - Atribuição</SelectItem>
                    <SelectItem value="SAIDA_PERDA">❌ Saída - Perda/Dano</SelectItem>
                    <SelectItem value="SAIDA_AJUSTE">⚖️ Saída - Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantidade">Quantidade *</Label>
                <div className="space-y-2">
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={movimentoData.quantidade}
                    onChange={(e) => setMovimentoData({...movimentoData, quantidade: parseInt(e.target.value) || 0})}
                    className={`${
                      movimentoData.tipo_movimento.startsWith('SAIDA') && 
                      movimentoData.quantidade > (itemMovimento?.quantidade_atual || 0)
                        ? 'border-red-500 bg-red-50' 
                        : ''
                    }`}
                  />
                  
                  {/* Feedback visual em tempo real */}
                  {itemMovimento && (
                    <div className="text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Stock atual:</span>
                        <span className="font-semibold">{itemMovimento.quantidade_atual} unidades</span>
                      </div>
                      
                      {movimentoData.quantidade > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Stock após operação:</span>
                          <span className={`font-semibold ${
                            movimentoData.tipo_movimento.startsWith('ENTRADA')
                              ? 'text-green-600'
                              : movimentoData.tipo_movimento.startsWith('SAIDA') && 
                                movimentoData.quantidade > itemMovimento.quantidade_atual
                                ? 'text-red-600'
                                : 'text-blue-600'
                          }`}>
                            {movimentoData.tipo_movimento.startsWith('ENTRADA')
                              ? itemMovimento.quantidade_atual + movimentoData.quantidade
                              : itemMovimento.quantidade_atual - movimentoData.quantidade
                            } unidades
                          </span>
                        </div>
                      )}
                      
                      {/* Alerta de stock insuficiente */}
                      {movimentoData.tipo_movimento.startsWith('SAIDA') && 
                       movimentoData.quantidade > itemMovimento.quantidade_atual && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-red-700 text-xs">
                            Stock insuficiente! Faltam {movimentoData.quantidade - itemMovimento.quantidade_atual} unidades
                          </span>
                        </div>
                      )}
                      
                      {/* Sugestão de quantidade máxima */}
                      {movimentoData.tipo_movimento.startsWith('SAIDA') && 
                       movimentoData.quantidade > itemMovimento.quantidade_atual && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setMovimentoData(prev => ({
                            ...prev,
                            quantidade: itemMovimento.quantidade_atual
                          }))}
                          className="w-full text-xs"
                        >
                          🔄 Ajustar para {itemMovimento.quantidade_atual} unidades (máximo disponível)
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="motivo">Motivo</Label>
                <Textarea
                  id="motivo"
                  value={movimentoData.motivo}
                  onChange={(e) => setMovimentoData({...movimentoData, motivo: e.target.value})}
                  placeholder="Descrição do motivo do movimento"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documento_referencia">Documento</Label>
                  <Input
                    id="documento_referencia"
                    value={movimentoData.documento_referencia}
                    onChange={(e) => setMovimentoData({...movimentoData, documento_referencia: e.target.value})}
                    placeholder="Fatura, recibo, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="preco_unitario_mov">Preço Unit. (€)</Label>
                  <Input
                    id="preco_unitario_mov"
                    type="number"
                    step="0.01"
                    min="0"
                    value={movimentoData.preco_unitario}
                    onChange={(e) => setMovimentoData({...movimentoData, preco_unitario: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={movimentoData.observacoes}
                  onChange={(e) => setMovimentoData({...movimentoData, observacoes: e.target.value})}
                  placeholder="Observações adicionais"
                  rows={2}
                />
              </div>
            </CardContent>
            <div className="space-y-3 p-6 pt-0">
              {/* Status de validação */}
              {(() => {
                const validacao = isMovimentoValido();
                if (!validacao.valido) {
                  return (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700 text-sm font-medium">
                        {validacao.motivo}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowMovimentoForm(false);
                    setItemMovimento(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleMovimentoStock}
                  disabled={!isMovimentoValido().valido}
                  className={`${
                    !isMovimentoValido().valido 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {!isMovimentoValido().valido 
                    ? '❌ Movimento Inválido' 
                    : '✅ Confirmar Movimento'
                  }
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Histórico de Movimentos */}
      {showHistorico && itemHistorico && (
        <HistoricoMovimentos
          item={itemHistorico}
          isOpen={showHistorico}
          onClose={() => {
            setShowHistorico(false);
            setItemHistorico(null);
          }}
        />
      )}

      <EnhancedFooter />
    </div>
  );
};

export default ItensAprovisionamento;