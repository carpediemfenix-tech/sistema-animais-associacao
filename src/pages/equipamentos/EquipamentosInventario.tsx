import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NovoEquipamentoModal from "@/components/NovoEquipamentoModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Settings,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle
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

interface TipoEquipamento {
  id: string;
  nome: string;
  categoria_id: string;
}

const EquipamentosInventario = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [filteredEquipamentos, setFilteredEquipamentos] = useState<Equipamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [condicaoFilter, setCondicaoFilter] = useState('todos');
  const [ativoFilter, setAtivoFilter] = useState('ativos'); // Novo filtro para ativos/inativos
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
  
  const [tiposEquipamentos, setTiposEquipamentos] = useState<TipoEquipamento[]>([]);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showConfirmarExclusao, setShowConfirmarExclusao] = useState(false);
  const [showConfirmarReativacao, setShowConfirmarReativacao] = useState(false);
  const [showConfirmarExclusaoPermanente, setShowConfirmarExclusaoPermanente] = useState(false); // Novo estado
  const [showEditarEquipamento, setShowEditarEquipamento] = useState(false); // Novo estado
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<Equipamento | null>(null);
  const [equipamentoEditando, setEquipamentoEditando] = useState<any>(null); // Novo estado
  const [historicoEquipamento, setHistoricoEquipamento] = useState<any>(null); // Novo estado
  const [showConfiguracoes, setShowConfiguracoes] = useState(false);

  useEffect(() => {
    loadEquipamentos();
    loadTiposEquipamentos();
  }, [ativoFilter]); // Recarregar quando filtro ativo mudar

  useEffect(() => {
    filterEquipamentos();
  }, [equipamentos, searchTerm, estadoFilter, condicaoFilter, ativoFilter]);

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

  const verificarHistoricoEquipamento = async (equipamentoId: string) => {
    try {
      // Verificar atribuições
      const { data: atribuicoes, error: atribuicoesError } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
        .select('id')
        .eq('equipamento_id', equipamentoId);

      if (atribuicoesError) throw atribuicoesError;

      // Verificar manutenções
      const { data: manutencoes, error: manutencoesError } = await supabase
        .from('manutencoes_equipamentos_2025_12_13_01_00')
        .select('id')
        .eq('equipamento_id', equipamentoId);

      if (manutencoesError) {
        console.warn('Tabela de manutenções não encontrada:', manutencoesError);
      }

      const temHistorico = {
        atribuicoes: (atribuicoes || []).length > 0,
        manutencoes: (manutencoes || []).length > 0,
        total: (atribuicoes || []).length + (manutencoes || []).length
      };

      console.log('Histórico do equipamento:', equipamentoId, temHistorico);
      return temHistorico;
    } catch (error) {
      console.error('Erro ao verificar histórico do equipamento:', error);
      return { atribuicoes: false, manutencoes: false, total: 0 };
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
            peso: novoEquipamento.peso,
            dimensoes: novoEquipamento.dimensoes,
            manual_url: novoEquipamento.manual_url,
            foto_url: novoEquipamento.foto_url,
            qr_code: novoEquipamento.qr_code,
            responsavel_id: novoEquipamento.responsavel_id || null,
            centro_custo: novoEquipamento.centro_custo,
            categoria_fiscal: novoEquipamento.categoria_fiscal,
            depreciacao_anual: novoEquipamento.depreciacao_anual,
            vida_util_anos: novoEquipamento.vida_util_anos,
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
    // Preparar dados para edição
    setEquipamentoEditando({
      id: equipamento.id,
      codigo_interno: equipamento.codigo_interno || '',
      numero_serie: equipamento.numero_serie || '',
      tipo_equipamento_id: equipamento.tipo_equipamento_id || '',
      localizacao: equipamento.localizacao || '',
      estado: equipamento.estado || 'disponivel',
      condicao: equipamento.condicao || 'bom',
      valor_aquisicao: equipamento.valor_aquisicao || 0,
      data_aquisicao: equipamento.data_aquisicao ? equipamento.data_aquisicao.split('T')[0] : new Date().toISOString().split('T')[0],
      garantia_ate: equipamento.garantia_ate ? equipamento.garantia_ate.split('T')[0] : '',
      observacoes: equipamento.observacoes || ''
    });
    setShowEditarEquipamento(true);
  };

  const handleDesativarEquipamento = async (equipamento: any) => {
    setEquipamentoSelecionado(equipamento);
    
    // Verificar histórico para decidir entre desativar ou apagar
    const historico = await verificarHistoricoEquipamento(equipamento.id);
    setHistoricoEquipamento(historico);
    
    if (historico.total > 0) {
      // Tem histórico - apenas desativar
      setShowConfirmarExclusao(true);
    } else {
      // Não tem histórico - pode apagar permanentemente
      setShowConfirmarExclusaoPermanente(true);
    }
  };

  const handleReativarEquipamento = (equipamento: any) => {
    setEquipamentoSelecionado(equipamento);
    setShowConfirmarReativacao(true);
  };

  const confirmarDesativacao = async () => {
    if (!equipamentoSelecionado) return;

    try {
      const { error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .update({ ativo: false })
        .eq('id', equipamentoSelecionado.id);

      if (error) throw error;

      toast({
        title: "Equipamento desativado",
        description: `Equipamento "${equipamentoSelecionado.numero_serie || equipamentoSelecionado.id}" foi desativado com sucesso`,
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

  const confirmarReativacao = async () => {
    if (!equipamentoSelecionado) return;

    try {
      const { error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .update({ ativo: true })
        .eq('id', equipamentoSelecionado.id);

      if (error) throw error;

      toast({
        title: "Equipamento reativado",
        description: `Equipamento "${equipamentoSelecionado.numero_serie || equipamentoSelecionado.id}" foi reativado com sucesso`,
      });

      setShowConfirmarReativacao(false);
      setEquipamentoSelecionado(null);
      loadEquipamentos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao reativar equipamento",
        variant: "destructive",
      });
    }
  };

  const confirmarExclusaoPermanente = async () => {
    if (!equipamentoSelecionado) return;

    try {
      const { error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .delete()
        .eq('id', equipamentoSelecionado.id);

      if (error) throw error;

      toast({
        title: "Equipamento apagado",
        description: `Equipamento "${equipamentoSelecionado.numero_serie || equipamentoSelecionado.id}" foi apagado permanentemente`,
      });

      setShowConfirmarExclusaoPermanente(false);
      setEquipamentoSelecionado(null);
      setHistoricoEquipamento(null);
      loadEquipamentos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao apagar equipamento",
        variant: "destructive",
      });
    }
  };

  const salvarEdicaoEquipamento = async () => {
    if (!equipamentoEditando) return;

    // Validar campos obrigatórios
    if (!equipamentoEditando.codigo_interno || !equipamentoEditando.tipo_equipamento_id) {
      toast({
        title: "Erro",
        description: "Código interno e tipo de equipamento são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar UUID do tipo de equipamento
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(equipamentoEditando.tipo_equipamento_id)) {
      toast({
        title: "Erro",
        description: "Tipo de equipamento inválido. Por favor, selecione um tipo válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .update({
          codigo_interno: equipamentoEditando.codigo_interno,
          numero_serie: equipamentoEditando.numero_serie,
          tipo_equipamento_id: equipamentoEditando.tipo_equipamento_id,
          localizacao: equipamentoEditando.localizacao,
          estado: equipamentoEditando.estado,
          condicao: equipamentoEditando.condicao,
          valor_aquisicao: equipamentoEditando.valor_aquisicao,
          data_aquisicao: equipamentoEditando.data_aquisicao,
          garantia_ate: equipamentoEditando.garantia_ate || null,
          observacoes: equipamentoEditando.observacoes
        })
        .eq('id', equipamentoEditando.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Equipamento atualizado com sucesso!",
      });

      setShowEditarEquipamento(false);
      setEquipamentoEditando(null);
      loadEquipamentos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar equipamento",
        variant: "destructive",
      });
    }
  };

  const loadEquipamentos = async () => {
    try {
      let query = supabase
        .from('equipamentos_2025_12_13_01_00')
        .select(`
          *,
          tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(
            nome,
            categoria:categorias_equipamentos_2025_12_13_01_00(nome, cor)
          )
        `);

      // Aplicar filtro de ativo/inativo
      if (ativoFilter === 'ativos') {
        query = query.eq('ativo', true);
      } else if (ativoFilter === 'inativos') {
        query = query.eq('ativo', false);
      }
      // Se for 'todos', não aplicar filtro

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setEquipamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar equipamentos",
        variant: "destructive",
      });
    }
  };

  const filterEquipamentos = () => {
    let filtered = equipamentos;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(eq => 
        eq.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.tipo_equipamento?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.localizacao?.toLowerCase().includes(searchTerm.toLowerCase())
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
  };

  const getEstadoBadge = (estado: string) => {
    const cores = {
      'disponivel': 'bg-green-100 text-green-800',
      'em_uso': 'bg-blue-100 text-blue-800',
      'manutencao': 'bg-yellow-100 text-yellow-800',
      'danificado': 'bg-red-100 text-red-800',
      'perdido': 'bg-gray-100 text-gray-800',
      'descartado': 'bg-black text-white'
    };
    return cores[estado as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  const getCondicaoBadge = (condicao: string) => {
    const cores = {
      'novo': 'bg-emerald-100 text-emerald-800',
      'bom': 'bg-green-100 text-green-800',
      'regular': 'bg-yellow-100 text-yellow-800',
      'mau': 'bg-red-100 text-red-800'
    };
    return cores[condicao as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-8 w-8 text-green-600" />
              Inventário de Equipamentos
            </h1>
            <p className="text-gray-600 mt-1">Gestão completa do inventário de equipamentos</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setShowNovoEquipamento(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Equipamento
            </Button>
            <Button variant="outline" onClick={() => setShowConfiguracoes(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label>Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Código, série, tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Status</Label>
                <Select value={ativoFilter} onValueChange={setAtivoFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativos">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Ativos
                      </div>
                    </SelectItem>
                    <SelectItem value="inativos">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Desativados
                      </div>
                    </SelectItem>
                    <SelectItem value="todos">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        Todos
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Estado</Label>
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="em_uso">Em Uso</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="danificado">Danificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Condição</Label>
                <Select value={condicaoFilter} onValueChange={setCondicaoFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="bom">Bom</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="mau">Mau</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={loadEquipamentos} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{equipamentos.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {equipamentos.filter(eq => eq.ativo).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Desativados</p>
                  <p className="text-2xl font-bold text-red-600">
                    {equipamentos.filter(eq => !eq.ativo).length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disponíveis</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {equipamentos.filter(eq => eq.estado === 'disponivel' && eq.ativo).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Equipamentos */}
        <Card>
          <CardHeader>
            <CardTitle>
              Equipamentos ({filteredEquipamentos.length})
              {ativoFilter === 'inativos' && (
                <Badge variant="destructive" className="ml-2">
                  <XCircle className="h-3 w-3 mr-1" />
                  Desativados
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Código/Série</TableHead>
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
                    <TableRow key={equipamento.id} className={!equipamento.ativo ? 'opacity-60 bg-gray-50' : ''}>
                      <TableCell>
                        {equipamento.ativo ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Desativado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{equipamento.codigo_interno}</p>
                          <p className="text-sm text-gray-500">{equipamento.numero_serie}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{equipamento.tipo_equipamento?.nome}</p>
                          {equipamento.tipo_equipamento?.categoria && (
                            <Badge 
                              className="text-xs mt-1" 
                              style={{ backgroundColor: equipamento.tipo_equipamento.categoria.cor + '20', color: equipamento.tipo_equipamento.categoria.cor }}
                            >
                              {equipamento.tipo_equipamento.categoria.nome}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadge(equipamento.estado)}>
                          {equipamento.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCondicaoBadge(equipamento.condicao)}>
                          {equipamento.condicao}
                        </Badge>
                      </TableCell>
                      <TableCell>{equipamento.localizacao || '-'}</TableCell>
                      <TableCell>
                        {equipamento.valor_aquisicao ? `€${equipamento.valor_aquisicao.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerEquipamento(equipamento)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          
                          {equipamento.ativo ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditarEquipamento(equipamento)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDesativarEquipamento(equipamento)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReativarEquipamento(equipamento)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredEquipamentos.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {ativoFilter === 'inativos' 
                      ? 'Nenhum equipamento desativado encontrado' 
                      : 'Nenhum equipamento encontrado'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
                  <Label>Status</Label>
                  {equipamentoSelecionado.ativo ? (
                    <Badge className="bg-green-100 text-green-800 block w-fit mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="block w-fit mt-1">
                      <XCircle className="h-3 w-3 mr-1" />
                      Desativado
                    </Badge>
                  )}
                </div>
                <div>
                  <Label>Código Interno</Label>
                  <p className="font-medium">{equipamentoSelecionado.codigo_interno}</p>
                </div>
                <div>
                  <Label>Número de Série</Label>
                  <p className="font-medium">{equipamentoSelecionado.numero_serie}</p>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <p className="font-medium">{equipamentoSelecionado.tipo_equipamento?.nome}</p>
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
                  <p className="font-medium">{equipamentoSelecionado.localizacao || '-'}</p>
                </div>
                <div>
                  <Label>Valor de Aquisição</Label>
                  <p className="font-medium">
                    {equipamentoSelecionado.valor_aquisicao ? `€${equipamentoSelecionado.valor_aquisicao.toFixed(2)}` : '-'}
                  </p>
                </div>
              </div>
              
              {equipamentoSelecionado.observacoes && (
                <div>
                  <Label>Observações</Label>
                  <p className="text-sm text-gray-600 mt-1">{equipamentoSelecionado.observacoes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setShowDetalhes(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Desativação */}
      <Dialog open={showConfirmarExclusao} onOpenChange={setShowConfirmarExclusao}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Desativação</DialogTitle>
            <DialogDescription>
              Esta ação irá desativar o equipamento. Pode ser reativado posteriormente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm">
                Tem certeza que deseja desativar o equipamento <strong>{equipamentoSelecionado?.codigo_interno}</strong>?
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirmarExclusao(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarDesativacao}
              className="bg-red-600 hover:bg-red-700"
            >
              Desativar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Reativação */}
      <Dialog open={showConfirmarReativacao} onOpenChange={setShowConfirmarReativacao}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Reativação</DialogTitle>
            <DialogDescription>
              Esta ação irá reativar o equipamento e torná-lo disponível novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm">
                Tem certeza que deseja reativar o equipamento <strong>{equipamentoSelecionado?.codigo_interno}</strong>?
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirmarReativacao(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarReativacao}
              className="bg-green-600 hover:bg-green-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reativar
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
              <h3 className="text-lg font-semibold mb-3 text-blue-600">Exibição</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Itens por página</Label>
                  <Select defaultValue="20">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Densidade da tabela</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Alertas de manutenção</Label>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Alertas de garantia</Label>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Relatórios automáticos</Label>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfiguracoes(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowConfiguracoes(false)}>
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão Permanente */}
      <Dialog open={showConfirmarExclusaoPermanente} onOpenChange={setShowConfirmarExclusaoPermanente}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão Permanente</DialogTitle>
            <DialogDescription>
              Esta ação irá apagar o equipamento permanentemente. Não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Apagar permanentemente o equipamento <strong>{equipamentoSelecionado?.codigo_interno}</strong>?
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Este equipamento não tem histórico de utilização e pode ser apagado com segurança.
                </p>
              </div>
            </div>
            {historicoEquipamento && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <p>• Atribuições: {historicoEquipamento.atribuicoes ? 'Sim' : 'Não'}</p>
                <p>• Manutenções: {historicoEquipamento.manutencoes ? 'Sim' : 'Não'}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirmarExclusaoPermanente(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarExclusaoPermanente}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Apagar Permanentemente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Equipamento */}
      <Dialog open={showEditarEquipamento} onOpenChange={setShowEditarEquipamento}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Equipamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do equipamento
            </DialogDescription>
          </DialogHeader>
          {equipamentoEditando && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código Interno *</Label>
                  <Input
                    value={equipamentoEditando.codigo_interno}
                    onChange={(e) => setEquipamentoEditando({...equipamentoEditando, codigo_interno: e.target.value})}
                    placeholder="Código do equipamento"
                  />
                </div>
                <div>
                  <Label>Número de Série</Label>
                  <Input
                    value={equipamentoEditando.numero_serie}
                    onChange={(e) => setEquipamentoEditando({...equipamentoEditando, numero_serie: e.target.value})}
                    placeholder="Número de série"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Equipamento *</Label>
                  <Select 
                    value={equipamentoEditando.tipo_equipamento_id} 
                    onValueChange={(value) => setEquipamentoEditando({...equipamentoEditando, tipo_equipamento_id: value})}
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
                  <Label>Localização</Label>
                  <Input
                    value={equipamentoEditando.localizacao}
                    onChange={(e) => setEquipamentoEditando({...equipamentoEditando, localizacao: e.target.value})}
                    placeholder="Localização do equipamento"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Select 
                    value={equipamentoEditando.estado} 
                    onValueChange={(value) => setEquipamentoEditando({...equipamentoEditando, estado: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="danificado">Danificado</SelectItem>
                      <SelectItem value="perdido">Perdido</SelectItem>
                      <SelectItem value="descartado">Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Condição</Label>
                  <Select 
                    value={equipamentoEditando.condicao} 
                    onValueChange={(value) => setEquipamentoEditando({...equipamentoEditando, condicao: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="bom">Bom</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="mau">Mau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor de Aquisição (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={equipamentoEditando.valor_aquisicao}
                    onChange={(e) => setEquipamentoEditando({...equipamentoEditando, valor_aquisicao: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Data de Aquisição</Label>
                  <Input
                    type="date"
                    value={equipamentoEditando.data_aquisicao}
                    onChange={(e) => setEquipamentoEditando({...equipamentoEditando, data_aquisicao: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>Garantia Até</Label>
                <Input
                  type="date"
                  value={equipamentoEditando.garantia_ate}
                  onChange={(e) => setEquipamentoEditando({...equipamentoEditando, garantia_ate: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={equipamentoEditando.observacoes}
                  onChange={(e) => setEquipamentoEditando({...equipamentoEditando, observacoes: e.target.value})}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditarEquipamento(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicaoEquipamento}>
              <Edit className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default EquipamentosInventario;