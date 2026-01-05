import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NovoEquipamentoModal from "@/components/NovoEquipamentoModal";
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
  Settings,
  Power,
  PowerOff
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
    data_validade: '',
    garantia_ate: '',
    fornecedor: '',
    modelo: '',
    marca: '',
    cor: '',
    peso: 0,
    dimensoes: '',
    manual_url: '',
    foto_url: '',
    qr_code: '',
    responsavel_id: '',
    centro_custo: '',
    categoria_fiscal: '',
    depreciacao_anual: 0,
    vida_util_anos: 5,
    observacoes: ''
  });
  const [tiposEquipamentos, setTiposEquipamentos] = useState<any[]>([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<any>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showConfirmarExclusao, setShowConfirmarExclusao] = useState(false);
  const [showConfiguracoes, setShowConfiguracoes] = useState(false);

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

    // Validar se tipo_equipamento_id é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(novoEquipamento.tipo_equipamento_id)) {
      toast({
        title: "Erro",
        description: "Tipo de equipamento inválido. Por favor, selecione um tipo válido.",
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
            data_validade: novoEquipamento.data_validade || null,
            garantia_ate: novoEquipamento.garantia_ate || null,
            fornecedor: novoEquipamento.fornecedor,
            modelo: novoEquipamento.modelo,
            marca: novoEquipamento.marca,
            cor: novoEquipamento.cor,
            peso: novoEquipamento.peso || null,
            dimensoes: novoEquipamento.dimensoes,
            manual_url: novoEquipamento.manual_url,
            foto_url: novoEquipamento.foto_url,
            qr_code: novoEquipamento.qr_code,
            responsavel_id: novoEquipamento.responsavel_id || null,
            centro_custo: novoEquipamento.centro_custo,
            categoria_fiscal: novoEquipamento.categoria_fiscal,
            depreciacao_anual: novoEquipamento.depreciacao_anual || 0,
            vida_util_anos: novoEquipamento.vida_util_anos || 5,
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
        data_validade: '',
        garantia_ate: '',
        fornecedor: '',
        modelo: '',
        marca: '',
        cor: '',
        peso: 0,
        dimensoes: '',
        manual_url: '',
        foto_url: '',
        qr_code: '',
        responsavel_id: '',
        centro_custo: '',
        categoria_fiscal: '',
        depreciacao_anual: 0,
        vida_util_anos: 5,
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

  const handleVerEquipamento = (equipamento: any) => {
    setEquipamentoSelecionado(equipamento);
    setShowDetalhes(true);
  };

  const handleEditarEquipamento = (equipamento: any) => {
    setEquipamentoSelecionado(equipamento);
    setShowEditar(true);
  };

  const handleExcluirEquipamento = (equipamento: any) => {
    setEquipamentoSelecionado(equipamento);
    setShowConfirmarExclusao(true);
  };

  const confirmarExclusao = async () => {
    if (!equipamentoSelecionado) return;

    try {
      const { error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .update({ ativo: false })
        .eq('id', equipamentoSelecionado.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Equipamento desativado com sucesso!",
      });

      setShowConfirmarExclusao(false);
      setEquipamentoSelecionado(null);
      loadEquipamentos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao desativar equipamento",
        variant: "destructive",
      });
    }
  };

  const toggleAtivoEquipamento = async (equipamento: any) => {
    try {
      const { error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .update({ ativo: !equipamento.ativo })
        .eq('id', equipamento.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Equipamento ${equipamento.ativo ? 'desativado' : 'ativado'} com sucesso!`,
      });

      loadEquipamentos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do equipamento",
        variant: "destructive",
      });
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowConfiguracoes(true)}
                  >
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
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerEquipamento(equipamento)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditarEquipamento(equipamento)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleAtivoEquipamento(equipamento)}
                              className={equipamento.ativo ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                              title={equipamento.ativo ? "Desativar" : "Ativar"}
                            >
                              {equipamento.ativo ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleExcluirEquipamento(equipamento)}
                              title="Excluir"
                            >
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
      <NovoEquipamentoModal
        isOpen={showNovoEquipamento}
        onClose={() => setShowNovoEquipamento(false)}
        novoEquipamento={novoEquipamento}
        setNovoEquipamento={setNovoEquipamento}
        tiposEquipamentos={tiposEquipamentos}
        onSubmit={criarEquipamento}
        isLoading={criandoEquipamento}
      />
      
      {/* Modal de Detalhes */}
      <Dialog open={showDetalhes} onOpenChange={setShowDetalhes}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Equipamento</DialogTitle>
            <DialogDescription>
              Visualize todas as informações detalhadas do equipamento selecionado
            </DialogDescription>
          </DialogHeader>
          {equipamentoSelecionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código Interno</Label>
                  <p className="font-medium">{equipamentoSelecionado.codigo_interno}</p>
                </div>
                <div>
                  <Label>Número de Série</Label>
                  <p className="font-medium">{equipamentoSelecionado.numero_serie || 'N/A'}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge className={getEstadoBadge(equipamentoSelecionado.estado)}>
                    {equipamentoSelecionado.estado}
                  </Badge>
                </div>
                <div>
                  <Label>Condição</Label>
                  <Badge className={getCondicaoBadge(equipamentoSelecionado.condicao)}>
                    {equipamentoSelecionado.condicao}
                  </Badge>
                </div>
                <div>
                  <Label>Localização</Label>
                  <p className="font-medium">{equipamentoSelecionado.localizacao || 'N/A'}</p>
                </div>
                <div>
                  <Label>Valor de Aquisição</Label>
                  <p className="font-medium">{formatCurrency(equipamentoSelecionado.valor_aquisicao || 0)}</p>
                </div>
              </div>
              {equipamentoSelecionado.observacoes && (
                <div>
                  <Label>Observações</Label>
                  <p className="text-sm text-gray-600">{equipamentoSelecionado.observacoes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setShowDetalhes(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showConfirmarExclusao} onOpenChange={setShowConfirmarExclusao}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Esta ação irá desativar o equipamento permanentemente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza que deseja desativar o equipamento <strong>{equipamentoSelecionado?.codigo_interno}</strong>?</p>
            <p className="text-sm text-gray-600">Esta ação pode ser revertida posteriormente.</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowConfirmarExclusao(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarExclusao}>
              Desativar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações */}
      <Dialog open={showConfiguracoes} onOpenChange={setShowConfiguracoes}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações do Inventário</DialogTitle>
            <DialogDescription>
              Personalize as configurações de exibição e filtros do inventário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Configurações de Exibição */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-600">Configurações de Exibição</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar equipamentos inativos</Label>
                    <p className="text-sm text-gray-600">Incluir equipamentos desativados na listagem</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-refresh</Label>
                    <p className="text-sm text-gray-600">Atualizar automaticamente a cada 5 minutos</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Densidade da tabela</Label>
                    <p className="text-sm text-gray-600">Compacta ou espaçada</p>
                  </div>
                  <Select defaultValue="normal">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compacta">Compacta</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="espaçada">Espaçada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Configurações de Filtros */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-600">Filtros Padrão</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estado padrão</Label>
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="atribuido">Atribuído</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Condição padrão</Label>
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="excelente">Excelente</SelectItem>
                      <SelectItem value="bom">Bom</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Configurações de Notificações */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-orange-600">Notificações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de manutenção</Label>
                    <p className="text-sm text-gray-600">Notificar quando equipamento precisa de manutenção</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Equipamentos em garantia</Label>
                    <p className="text-sm text-gray-600">Alertar quando garantia está próxima do vencimento</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Novos equipamentos</Label>
                    <p className="text-sm text-gray-600">Notificar quando novos equipamentos são adicionados</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowConfiguracoes(false)}>
              Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default EquipamentosInventario;