import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft,
  Package,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface Equipamento {
  id: string;
  codigo_interno: string;
  numero_serie: string;
  tipo_equipamento_id: string;
  estado: 'disponivel' | 'em_uso' | 'manutencao' | 'danificado' | 'perdido' | 'descartado';
  condicao: 'novo' | 'bom' | 'regular' | 'mau';
  localizacao: string;
  data_aquisicao: string;
  valor_aquisicao: number;
  garantia_ate: string;
  observacoes: string;
  ativo: boolean;
  tipo_equipamento?: {
    nome: string;
    categoria?: {
      nome: string;
      cor: string;
    };
  };
}

const EquipamentosInventario: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [filteredEquipamentos, setFilteredEquipamentos] = useState<Equipamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [condicaoFilter, setCondicaoFilter] = useState('todos');
  const [showNovoEquipamento, setShowNovoEquipamento] = useState(false);
  const [criandoEquipamento, setCriandoEquipamento] = useState(false);
  const [novoEquipamento, setNovoEquipamento] = useState({
    codigo_interno: '',
    numero_serie: '',
    tipo_equipamento_id: '',
    localizacao: '',
    estado: 'disponivel',
    condicao: 'bom',
    valor_aquisicao: 0,
    data_aquisicao: new Date().toISOString().split('T')[0],
    observacoes: ''
  });
  const [tiposEquipamentos, setTiposEquipamentos] = useState<any[]>([]);

  const loadEquipamentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .select(`
          *,
          tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(
            nome,
            categoria:categorias_equipamentos_2025_12_13_01_00(nome, cor)
          )
        `)
        .eq('ativo', true)
        .order('codigo_interno');

      if (error) throw error;
      
      setEquipamentos(data || []);
      setFilteredEquipamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar equipamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTiposEquipamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_equipamentos_2025_12_13_01_00')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setTiposEquipamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar tipos de equipamentos:', error);
    }
  };

  const criarEquipamento = async () => {
    if (!novoEquipamento.codigo_interno || !novoEquipamento.tipo_equipamento_id) {
      toast({
        title: "Erro",
        description: "Código interno e tipo de equipamento são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setCriandoEquipamento(true);
      
      const { data, error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .insert([
          {
            codigo_interno: novoEquipamento.codigo_interno,
            numero_serie: novoEquipamento.numero_serie,
            tipo_equipamento_id: novoEquipamento.tipo_equipamento_id,
            localizacao: novoEquipamento.localizacao,
            estado: novoEquipamento.estado,
            condicao: novoEquipamento.condicao,
            valor_aquisicao: novoEquipamento.valor_aquisicao,
            data_aquisicao: novoEquipamento.data_aquisicao,
            observacoes: novoEquipamento.observacoes,
            ativo: true
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Equipamento criado com sucesso!",
      });

      // Reset form
      setNovoEquipamento({
        codigo_interno: '',
        numero_serie: '',
        tipo_equipamento_id: '',
        localizacao: '',
        estado: 'disponivel',
        condicao: 'bom',
        valor_aquisicao: 0,
        data_aquisicao: new Date().toISOString().split('T')[0],
        observacoes: ''
      });
      
      setShowNovoEquipamento(false);
      loadEquipamentos(); // Recarregar lista
      
    } catch (error: any) {
      console.error('Erro ao criar equipamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar equipamento",
        variant: "destructive",
      });
    } finally {
      setCriandoEquipamento(false);
    }
  };

  useEffect(() => {
    loadEquipamentos();
    loadTiposEquipamentos();
  }, []);

  useEffect(() => {
    let filtered = equipamentos;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(eq => 
        eq.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.numero_serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.tipo_equipamento?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (estadoFilter !== 'todos') {
      filtered = filtered.filter(eq => eq.estado === estadoFilter);
    }

    // Filtro por condição
    if (condicaoFilter !== 'todos') {
      filtered = filtered.filter(eq => eq.condicao === condicaoFilter);
    }

    setFilteredEquipamentos(filtered);
  }, [equipamentos, searchTerm, estadoFilter, condicaoFilter]);

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'disponivel': 'bg-green-100 text-green-800',
      'em_uso': 'bg-blue-100 text-blue-800',
      'manutencao': 'bg-yellow-100 text-yellow-800',
      'danificado': 'bg-red-100 text-red-800',
      'perdido': 'bg-gray-100 text-gray-800',
      'descartado': 'bg-black text-white'
    };
    return variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getCondicaoBadge = (condicao: string) => {
    const variants = {
      'novo': 'bg-green-100 text-green-800',
      'bom': 'bg-blue-100 text-blue-800',
      'regular': 'bg-yellow-100 text-yellow-800',
      'mau': 'bg-red-100 text-red-800'
    };
    return variants[condicao as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Carregando inventário...</p>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link to="/equipamentos">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventário de Equipamentos</h1>
                <p className="text-gray-600">Gestão completa de equipamentos, categorias e tipos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={loadEquipamentos} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowNovoEquipamento(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Equipamento
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-600" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Código, série, tipo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Estados</SelectItem>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="danificado">Danificado</SelectItem>
                      <SelectItem value="perdido">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Condição</label>
                  <Select value={condicaoFilter} onValueChange={setCondicaoFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as Condições</SelectItem>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="bom">Bom</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="mau">Mau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ações</label>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{equipamentos.length}</div>
                <p className="text-sm text-gray-600">Total de Equipamentos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {equipamentos.filter(e => e.estado === 'disponivel').length}
                </div>
                <p className="text-sm text-gray-600">Disponíveis</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {equipamentos.filter(e => e.estado === 'em_uso').length}
                </div>
                <p className="text-sm text-gray-600">Em Uso</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {equipamentos.filter(e => e.estado === 'manutencao').length}
                </div>
                <p className="text-sm text-gray-600">Manutenção</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Equipamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-green-600" />
                  Equipamentos ({filteredEquipamentos.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipamentos.map((equipamento) => (
                      <TableRow key={equipamento.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{equipamento.codigo_interno}</div>
                            <div className="text-sm text-gray-600">{equipamento.numero_serie}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{equipamento.tipo_equipamento?.nome}</div>
                            <div className="text-sm text-gray-600">
                              {equipamento.tipo_equipamento?.categoria?.nome}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEstadoBadge(equipamento.estado)}>
                            {equipamento.estado.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCondicaoBadge(equipamento.condicao)}>
                            {equipamento.condicao}
                          </Badge>
                        </TableCell>
                        <TableCell>{equipamento.localizacao}</TableCell>
                        <TableCell>{formatCurrency(equipamento.valor_aquisicao || 0)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredEquipamentos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum equipamento encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal Novo Equipamento */}
      <Dialog open={showNovoEquipamento} onOpenChange={setShowNovoEquipamento}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Equipamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código Interno *</Label>
              <Input 
                id="codigo" 
                placeholder="Ex: EQ001"
                value={novoEquipamento.codigo_interno}
                onChange={(e) => setNovoEquipamento({...novoEquipamento, codigo_interno: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="serie">Número de Série</Label>
              <Input 
                id="serie" 
                placeholder="Ex: ABC123"
                value={novoEquipamento.numero_serie}
                onChange={(e) => setNovoEquipamento({...novoEquipamento, numero_serie: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de Equipamento *</Label>
              <Select 
                value={novoEquipamento.tipo_equipamento_id}
                onValueChange={(value) => setNovoEquipamento({...novoEquipamento, tipo_equipamento_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEquipamentos.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="localizacao">Localização</Label>
              <Input 
                id="localizacao" 
                placeholder="Ex: Sala 1"
                value={novoEquipamento.localizacao}
                onChange={(e) => setNovoEquipamento({...novoEquipamento, localizacao: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select 
                value={novoEquipamento.estado}
                onValueChange={(value) => setNovoEquipamento({...novoEquipamento, estado: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="atribuido">Atribuído</SelectItem>
                  <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  <SelectItem value="danificado">Danificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="condicao">Condição</Label>
              <Select 
                value={novoEquipamento.condicao}
                onValueChange={(value) => setNovoEquipamento({...novoEquipamento, condicao: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excelente">Excelente</SelectItem>
                  <SelectItem value="bom">Bom</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="ruim">Ruim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="valor">Valor de Aquisição (€)</Label>
              <Input 
                id="valor" 
                type="number"
                step="0.01"
                placeholder="0.00"
                value={novoEquipamento.valor_aquisicao}
                onChange={(e) => setNovoEquipamento({...novoEquipamento, valor_aquisicao: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
              <Input 
                id="data_aquisicao" 
                type="date"
                value={novoEquipamento.data_aquisicao}
                onChange={(e) => setNovoEquipamento({...novoEquipamento, data_aquisicao: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input 
                id="observacoes" 
                placeholder="Observações adicionais..."
                value={novoEquipamento.observacoes}
                onChange={(e) => setNovoEquipamento({...novoEquipamento, observacoes: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowNovoEquipamento(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={criarEquipamento}
              disabled={criandoEquipamento}
            >
              {criandoEquipamento ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Equipamento'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default EquipamentosInventario;