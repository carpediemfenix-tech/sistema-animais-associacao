import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Download,
  Eye,
  X,
  ArrowRight,
  Package,
  User,
  FileText,
  Clock,
  Euro,
  MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MovimentoStock {
  id: string;
  item_id: string;
  tipo_movimento: string;
  quantidade: number;
  quantidade_anterior: number;
  quantidade_nova: number;
  motivo?: string;
  documento_referencia?: string;
  voluntario_id?: string;
  animal_id?: string;
  missao_id?: string;
  preco_unitario?: number;
  valor_total?: number;
  data_movimento: string;
  observacoes?: string;
  created_by?: string;
}

interface Item {
  id: string;
  nome: string;
  descricao?: string;
  tipo?: {
    nome: string;
    categoria?: {
      nome: string;
    };
  };
}

interface HistoricoMovimentosProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
}

const HistoricoMovimentos: React.FC<HistoricoMovimentosProps> = ({ item, isOpen, onClose }) => {
  const { toast } = useToast();
  
  const [movimentos, setMovimentos] = useState<MovimentoStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');

  useEffect(() => {
    if (isOpen && item.id) {
      loadMovimentos();
    }
  }, [isOpen, item.id]);

  const loadMovimentos = async () => {
    try {
      setLoading(true);
      console.log('🔍 [HISTÓRICO] Carregando movimentos para item:', item.id);

      const { data, error } = await supabase
        .from('movimentos_stock_2026_01_06')
        .select('*')
        .eq('item_id', item.id)
        .order('data_movimento', { ascending: false });

      if (error) throw error;

      console.log('✅ [HISTÓRICO] Movimentos carregados:', data?.length || 0);
      setMovimentos(data || []);

    } catch (error: any) {
      console.error('❌ [HISTÓRICO] Erro ao carregar movimentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de movimentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTipoMovimentoInfo = (tipo: string) => {
    const tipos = {
      'ENTRADA_COMPRA': { 
        label: 'Compra', 
        icon: TrendingUp, 
        color: 'text-green-600 bg-green-50 border-green-200',
        prefix: '📦'
      },
      'ENTRADA_DOACAO': { 
        label: 'Doação', 
        icon: TrendingUp, 
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        prefix: '🎁'
      },
      'ENTRADA_DEVOLUCAO': { 
        label: 'Devolução', 
        icon: TrendingUp, 
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        prefix: '↩️'
      },
      'ENTRADA_AJUSTE': { 
        label: 'Ajuste +', 
        icon: TrendingUp, 
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        prefix: '⚖️'
      },
      'SAIDA_CONSUMO': { 
        label: 'Consumo', 
        icon: TrendingDown, 
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        prefix: '🔽'
      },
      'SAIDA_ATRIBUICAO': { 
        label: 'Atribuição', 
        icon: TrendingDown, 
        color: 'text-red-600 bg-red-50 border-red-200',
        prefix: '👤'
      },
      'SAIDA_PERDA': { 
        label: 'Perda/Dano', 
        icon: TrendingDown, 
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        prefix: '❌'
      },
      'SAIDA_AJUSTE': { 
        label: 'Ajuste -', 
        icon: TrendingDown, 
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        prefix: '⚖️'
      }
    };
    return tipos[tipo as keyof typeof tipos] || { 
      label: tipo, 
      icon: Package, 
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      prefix: '📦'
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportarHistorico = () => {
    const csvContent = [
      ['Data', 'Tipo', 'Quantidade', 'Stock Anterior', 'Stock Novo', 'Motivo', 'Documento', 'Valor'].join(','),
      ...movimentosFiltrados.map(mov => [
        formatDate(mov.data_movimento),
        getTipoMovimentoInfo(mov.tipo_movimento).label,
        mov.quantidade,
        mov.quantidade_anterior,
        mov.quantidade_nova,
        mov.motivo || '',
        mov.documento_referencia || '',
        mov.valor_total ? `€${mov.valor_total.toFixed(2)}` : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_${item.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar movimentos
  const movimentosFiltrados = movimentos.filter(movimento => {
    const matchesTipo = filtroTipo === 'all' || movimento.tipo_movimento === filtroTipo;
    
    const dataMovimento = new Date(movimento.data_movimento);
    const matchesDataInicio = !filtroDataInicio || dataMovimento >= new Date(filtroDataInicio);
    const matchesDataFim = !filtroDataFim || dataMovimento <= new Date(filtroDataFim + 'T23:59:59');
    
    return matchesTipo && matchesDataInicio && matchesDataFim;
  });

  // Calcular estatísticas
  const stats = {
    totalMovimentos: movimentosFiltrados.length,
    totalEntradas: movimentosFiltrados.filter(m => m.tipo_movimento.startsWith('ENTRADA')).length,
    totalSaidas: movimentosFiltrados.filter(m => m.tipo_movimento.startsWith('SAIDA')).length,
    valorTotal: movimentosFiltrados.reduce((sum, m) => sum + (m.valor_total || 0), 0)
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Movimentos
              </CardTitle>
              <CardDescription>
                {item.nome} - {item.tipo?.categoria?.nome} / {item.tipo?.nome}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filtro-tipo">Tipo de Movimento</Label>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="ENTRADA_COMPRA">📦 Compra</SelectItem>
                      <SelectItem value="ENTRADA_DOACAO">🎁 Doação</SelectItem>
                      <SelectItem value="ENTRADA_DEVOLUCAO">↩️ Devolução</SelectItem>
                      <SelectItem value="ENTRADA_AJUSTE">⚖️ Ajuste +</SelectItem>
                      <SelectItem value="SAIDA_CONSUMO">🔽 Consumo</SelectItem>
                      <SelectItem value="SAIDA_ATRIBUICAO">👤 Atribuição</SelectItem>
                      <SelectItem value="SAIDA_PERDA">❌ Perda/Dano</SelectItem>
                      <SelectItem value="SAIDA_AJUSTE">⚖️ Ajuste -</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data-inicio">Data Início</Label>
                  <Input
                    id="data-inicio"
                    type="date"
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="data-fim">Data Fim</Label>
                  <Input
                    id="data-fim"
                    type="date"
                    value={filtroDataFim}
                    onChange={(e) => setFiltroDataFim(e.target.value)}
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFiltroTipo('all');
                      setFiltroDataInicio('');
                      setFiltroDataFim('');
                    }}
                    className="flex-1"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={exportarHistorico}
                    disabled={movimentosFiltrados.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Movimentos</p>
                    <p className="text-2xl font-bold">{stats.totalMovimentos}</p>
                  </div>
                  <History className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Entradas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalEntradas}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Saídas</p>
                    <p className="text-2xl font-bold text-red-600">{stats.totalSaidas}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-green-600">€{stats.valorTotal.toFixed(2)}</p>
                  </div>
                  <Euro className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline de Movimentos */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Timeline de Movimentos</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-96">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
                    <p className="text-gray-600">Carregando histórico...</p>
                  </div>
                </div>
              ) : movimentosFiltrados.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Nenhum movimento encontrado</p>
                    <p className="text-sm text-gray-500">Tente ajustar os filtros</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {movimentosFiltrados.map((movimento, index) => {
                    const tipoInfo = getTipoMovimentoInfo(movimento.tipo_movimento);
                    const Icon = tipoInfo.icon;
                    const isEntrada = movimento.tipo_movimento.startsWith('ENTRADA');
                    
                    return (
                      <div key={movimento.id} className="relative">
                        {/* Linha da timeline */}
                        {index < movimentosFiltrados.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          {/* Ícone da timeline */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${tipoInfo.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          {/* Conteúdo do movimento */}
                          <Card className={`flex-1 border-l-4 ${isEntrada ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={tipoInfo.color}>
                                      {tipoInfo.prefix} {tipoInfo.label}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      {formatDate(movimento.data_movimento)}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold">
                                    {isEntrada ? '+' : '-'}{movimento.quantidade} unidades
                                  </h4>
                                </div>
                                
                                <div className="text-right">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{movimento.quantidade_anterior}</span>
                                    <ArrowRight className="h-3 w-3" />
                                    <span className={isEntrada ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                      {movimento.quantidade_nova}
                                    </span>
                                  </div>
                                  {movimento.valor_total && (
                                    <p className="text-sm font-semibold text-green-600">
                                      €{movimento.valor_total.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {movimento.motivo && (
                                <p className="text-sm text-gray-700 mb-2">
                                  <strong>Motivo:</strong> {movimento.motivo}
                                </p>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                                {movimento.documento_referencia && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    <span>Doc: {movimento.documento_referencia}</span>
                                  </div>
                                )}
                                {movimento.preco_unitario && (
                                  <div className="flex items-center gap-1">
                                    <Euro className="h-3 w-3" />
                                    <span>Unit: €{movimento.preco_unitario.toFixed(2)}</span>
                                  </div>
                                )}
                                {movimento.observacoes && (
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>Obs: {movimento.observacoes}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricoMovimentos;