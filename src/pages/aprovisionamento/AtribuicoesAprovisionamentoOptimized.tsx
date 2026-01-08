import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import EnhancedHeader from '@/components/EnhancedHeader';
import EnhancedFooter from '@/components/EnhancedFooter';
import PageActionBar from '@/components/PageActionBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft,
  User,
  Users,
  Heart,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  Eye,
  RotateCcw,
  Trash2
} from "lucide-react";

// Interfaces
interface Item {
  id: string;
  nome: string;
  descricao?: string;
  quantidade_atual: number;
  stock_minimo: number;
  preco_unitario?: number;
  valor_total_stock?: number;
  tipo?: {
    nome: string;
    categoria?: {
      id: string;
      nome: string;
      cor_interface: string;
    };
  };
}

interface Atribuicao {
  id: string;
  item_id: string;
  tipo_atribuicao: 'VOLUNTARIO' | 'ANIMAL' | 'MISSAO';
  voluntario_id?: string;
  animal_id?: string;
  missao_id?: string;
  quantidade_atribuida: number;
  data_atribuicao: string;
  data_devolucao_prevista?: string;
  data_devolucao_real?: string;
  estado: 'ATIVO' | 'DEVOLVIDO' | 'CONSUMIDO' | 'PERDIDO' | 'DANIFICADO';
  motivo?: string;
  observacoes?: string;
  valor_responsabilidade?: number;
  verificado_por?: string;
  data_verificacao?: string;
  estado_devolucao?: string;
  observacoes_verificacao?: string;
  item?: Item;
  entidade_nome?: string;
  dias_restantes?: number;
}

interface ConfigAtribuicao {
  id: string;
  categoria_id: string;
  permite_voluntarios: boolean;
  permite_animais: boolean;
  permite_missoes: boolean;
  quantidade_maxima_por_voluntario?: number;
  quantidade_maxima_por_animal?: number;
  quantidade_maxima_por_missao?: number;
  prazo_devolucao_dias: number;
  requer_verificacao: boolean;
  permite_consumo: boolean;
  valor_responsabilidade_padrao?: number;
}

const AtribuicoesAprovisionamento: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [atribuicoes, setAtribuicoes] = useState<Atribuicao[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [configs, setConfigs] = useState<ConfigAtribuicao[]>([]);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterVencimento, setFilterVencimento] = useState<string>('all');

  // 🚀 CARREGAMENTO OTIMIZADO - Elimina N+1 queries
  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 DEBUG - Iniciando carregamento otimizado de dados...');
      
      // 🚀 OTIMIZAÇÃO: Carregar todas as tabelas de referência primeiro (evita N+1)
      console.log('📊 Carregando tabelas de referência...');
      
      // Carregar todas as categorias de uma vez
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias_aprovisionamento_2026_01_06')
        .select('id, nome, cor_interface, ativo')
        .eq('ativo', true);
      
      if (categoriasError) {
        console.error('❌ Erro ao carregar categorias:', categoriasError);
        toast({
          title: "Erro ao carregar categorias",
          description: `${categoriasError.message} (Código: ${categoriasError.code || 'N/A'})`,
          variant: "destructive",
        });
      }
      
      // Criar mapa de categorias por ID para lookup rápido
      const categoriasMap = new Map();
      (categoriasData || []).forEach(categoria => {
        categoriasMap.set(categoria.id, categoria);
      });
      
      console.log('🗺️ Mapa de categorias criado:', categoriasMap.size, 'categorias');
      
      // Carregar todos os tipos de uma vez
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipos_aprovisionamento_2026_01_06')
        .select('id, nome, categoria_id, ativo')
        .eq('ativo', true);
      
      if (tiposError) {
        console.error('❌ Erro ao carregar tipos:', tiposError);
      }
      
      // Criar mapa de tipos por ID e enriquecer com dados da categoria
      const tiposMap = new Map();
      (tiposData || []).forEach(tipo => {
        const categoria = categoriasMap.get(tipo.categoria_id);
        tiposMap.set(tipo.id, {
          ...tipo,
          categoria: categoria || null
        });
      });
      
      console.log('🗺️ Mapa de tipos criado:', tiposMap.size, 'tipos');
      
      // Carregar atribuições com campos de devolução parcial
      const { data: atribuicoesData, error: atribuicoesError } = await supabase
        .from('atribuicoes_itens_2026_01_07_00_52')
        .select(`
          *,
          quantidade_devolvida,
          quantidade_restante
        `)
        .order('created_at', { ascending: false });

      console.log('📊 DEBUG - Atribuições carregadas:', { count: atribuicoesData?.length, atribuicoesError });

      if (atribuicoesError) {
        console.error('❌ Erro ao carregar atribuições:', atribuicoesError);
        toast({
          title: "Erro ao carregar atribuições",
          description: `${atribuicoesError.message} (Código: ${atribuicoesError.code || 'N/A'})`,
          variant: "destructive",
        });
        setAtribuicoes([]);
      } else {
        // Carregar todos os itens referenciados pelas atribuições
        const itemIds = [...new Set((atribuicoesData || []).map(a => a.item_id).filter(Boolean))];
        console.log('📦 Carregando', itemIds.length, 'itens referenciados...');
        
        let itensAtribuicaoMap = new Map();
        if (itemIds.length > 0) {
          const { data: itensAtribuicaoData } = await supabase
            .from('itens_aprovisionamento_2026_01_06')
            .select('id, nome, descricao, quantidade_atual, preco_unitario, tipo_id')
            .in('id', itemIds);
          
          (itensAtribuicaoData || []).forEach(item => {
            const tipo = tiposMap.get(item.tipo_id);
            itensAtribuicaoMap.set(item.id, {
              ...item,
              tipo: tipo || null
            });
          });
        }
        
        // Processar atribuições com dados enriquecidos
        const processedAtribuicoes = (atribuicoesData || []).map(atribuicao => {
          const item = itensAtribuicaoMap.get(atribuicao.item_id);
          
          return {
            ...atribuicao,
            item: item || { nome: 'Item não encontrado' },
            entidade_nome: getEntidadeNome(atribuicao),
            dias_restantes: atribuicao.data_devolucao_prevista 
              ? Math.ceil((new Date(atribuicao.data_devolucao_prevista).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null
          };
        });
        
        console.log('✅ Atribuições processadas:', processedAtribuicoes.length);
        setAtribuicoes(processedAtribuicoes);
      }

      // Carregar itens disponíveis
      const { data: itensData, error: itensError } = await supabase
        .from('itens_aprovisionamento_2026_01_06')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      console.log('📦 DEBUG - Itens disponíveis carregados:', { count: itensData?.length, itensError });

      if (itensError) {
        console.error('❌ Erro ao carregar itens:', itensError);
        toast({
          title: "Erro ao carregar itens",
          description: `${itensError.message} (Código: ${itensError.code || 'N/A'})`,
          variant: "destructive",
        });
        setItens([]);
      } else {
        // Processar itens com dados de tipo e categoria (usando mapas)
        const processedItens = (itensData || []).map(item => {
          const tipo = tiposMap.get(item.tipo_id);
          return {
            ...item,
            tipo: tipo || null
          };
        });
        
        console.log('✅ Itens processados:', processedItens.length);
        setItens(processedItens);
      }

      // Carregar configurações
      const { data: configsData, error: configsError } = await supabase
        .from('config_atribuicoes_2026_01_07_00_52')
        .select('*');

      console.log('⚙️ DEBUG - Configurações carregadas:', { count: configsData?.length, configsError });

      if (configsError) {
        console.error('❌ Erro ao carregar configurações:', configsError);
        setConfigs([]);
      } else {
        setConfigs(configsData || []);
      }

    } catch (error) {
      console.error('🚫 Erro geral ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro inesperado ao carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para obter nome da entidade
  const getEntidadeNome = (atribuicao: any): string => {
    if (atribuicao.tipo_atribuicao === 'VOLUNTARIO' && atribuicao.voluntario_id) {
      return `Voluntário: ${atribuicao.voluntario_id.substring(0, 8)}...`;
    }
    if (atribuicao.tipo_atribuicao === 'ANIMAL' && atribuicao.animal_id) {
      return `Animal: ${atribuicao.animal_id.substring(0, 8)}...`;
    }
    if (atribuicao.tipo_atribuicao === 'MISSAO' && atribuicao.missao_id) {
      return `Missão: ${atribuicao.missao_id.substring(0, 8)}...`;
    }
    return 'Entidade não identificada';
  };

  // Filtrar atribuições
  const filteredAtribuicoes = atribuicoes.filter(atribuicao => {
    const matchesSearch = atribuicao.item?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atribuicao.entidade_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atribuicao.motivo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === 'all' || atribuicao.tipo_atribuicao === filterTipo;
    
    const matchesEstado = filterEstado === 'all' || atribuicao.estado === filterEstado;
    
    const matchesVencimento = filterVencimento === 'all' ||
                             (filterVencimento === 'vencido' && atribuicao.dias_restantes !== null && atribuicao.dias_restantes < 0) ||
                             (filterVencimento === 'vence_7_dias' && atribuicao.dias_restantes !== null && atribuicao.dias_restantes >= 0 && atribuicao.dias_restantes <= 7) ||
                             (filterVencimento === 'ok' && (atribuicao.dias_restantes === null || atribuicao.dias_restantes > 7));
    
    return matchesSearch && matchesTipo && matchesEstado && matchesVencimento;
  });

  // Estatísticas
  const stats = {
    total: atribuicoes.length,
    ativas: atribuicoes.filter(a => a.estado === 'ATIVO').length,
    vencidas: atribuicoes.filter(a => a.dias_restantes !== null && a.dias_restantes < 0).length,
    valor_total: atribuicoes.filter(a => a.estado === 'ATIVO').reduce((sum, a) => sum + (a.valor_responsabilidade || 0), 0)
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando atribuições...</p>
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
          { label: 'Atribuições' }
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
              onClick={() => navigate('/aprovisionamento/nova-atribuicao')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Atribuição
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
                    placeholder="Item, entidade, motivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo de Atribuição</Label>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="VOLUNTARIO">Voluntários</SelectItem>
                    <SelectItem value="ANIMAL">Animais</SelectItem>
                    <SelectItem value="MISSAO">Missões</SelectItem>
                    <SelectItem value="GRUPO">Grupos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estados</SelectItem>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="DEVOLVIDO">Devolvido</SelectItem>
                    <SelectItem value="CONSUMIDO">Consumido</SelectItem>
                    <SelectItem value="PERDIDO">Perdido</SelectItem>
                    <SelectItem value="DANIFICADO">Danificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="vencimento">Vencimento</Label>
                <Select value={filterVencimento} onValueChange={setFilterVencimento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="vencido">Vencidas</SelectItem>
                    <SelectItem value="vence_7_dias">Vence em 7 dias</SelectItem>
                    <SelectItem value="ok">OK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterTipo('all');
                  setFilterEstado('all');
                  setFilterVencimento('all');
                }}
                className="w-full md:w-auto"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Atribuições</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Atribuições Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.ativas}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vencidas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.vencidas}</p>
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
                  <p className="text-2xl font-bold text-purple-600">€{stats.valor_total.toFixed(2)}</p>
                </div>
                <Euro className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Atribuições */}
        <div className="grid grid-cols-1 gap-4">
          {filteredAtribuicoes.map((atribuicao) => (
            <Card key={atribuicao.id} className={`${
              atribuicao.dias_restantes !== null && atribuicao.dias_restantes < 0 ? 'border-red-300 bg-red-50' : 
              atribuicao.dias_restantes !== null && atribuicao.dias_restantes <= 7 ? 'border-yellow-300 bg-yellow-50' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{atribuicao.item?.nome}</h3>
                      
                      {/* Indicador visual para dados de teste */}
                      {(atribuicao.item?.nome?.includes('TESTE') || atribuicao.entidade_nome?.includes('TESTE')) && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          TESTE
                        </span>
                      )}
                      
                      {/* Badge do tipo de atribuição */}
                      <Badge variant={
                        atribuicao.tipo_atribuicao === 'VOLUNTARIO' ? 'default' :
                        atribuicao.tipo_atribuicao === 'ANIMAL' ? 'secondary' : 'outline'
                      }>
                        {atribuicao.tipo_atribuicao === 'VOLUNTARIO' && <User className="h-3 w-3 mr-1" />}
                        {atribuicao.tipo_atribuicao === 'ANIMAL' && <Heart className="h-3 w-3 mr-1" />}
                        {atribuicao.tipo_atribuicao === 'MISSAO' && <MapPin className="h-3 w-3 mr-1" />}
                        {atribuicao.tipo_atribuicao === 'GRUPO' && <Users className="h-3 w-3 mr-1" />}
                        {atribuicao.tipo_atribuicao}
                      </Badge>
                      
                      {/* Badge do estado */}
                      <Badge variant={
                        atribuicao.estado === 'ATIVO' ? 'default' :
                        atribuicao.estado === 'PARCIALMENTE_DEVOLVIDO' ? 'secondary' :
                        atribuicao.estado === 'DEVOLVIDO' ? 'outline' :
                        atribuicao.estado === 'CONSUMIDO' ? 'outline' : 'destructive'
                      } className={
                        atribuicao.estado === 'PARCIALMENTE_DEVOLVIDO' ? 'bg-yellow-600 text-white' : ''
                      }>
                        {atribuicao.estado === 'PARCIALMENTE_DEVOLVIDO' ? 'PARCIAL. DEVOLVIDO' : atribuicao.estado}
                      </Badge>
                      
                      {/* Badge de vencimento */}
                      {atribuicao.dias_restantes !== null && (
                        <Badge variant={
                          atribuicao.dias_restantes < 0 ? 'destructive' :
                          atribuicao.dias_restantes <= 7 ? 'secondary' : 'outline'
                        }>
                          <Clock className="h-3 w-3 mr-1" />
                          {atribuicao.dias_restantes < 0 
                            ? `Vencida há ${Math.abs(atribuicao.dias_restantes)} dias`
                            : `${atribuicao.dias_restantes} dias restantes`
                          }
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Entidade:</strong> {atribuicao.entidade_nome}</p>
                        <p><strong>Quantidade:</strong> 
                          {atribuicao.estado === 'PARCIALMENTE_DEVOLVIDO' ? (
                            <span>
                              {atribuicao.quantidade_restante || atribuicao.quantidade_atribuida} restantes 
                              <span className="text-gray-500"> (de {atribuicao.quantidade_atribuida})</span>
                            </span>
                          ) : (
                            atribuicao.quantidade_atribuida
                          )}
                        </p>
                        <p><strong>Categoria:</strong> {atribuicao.item?.tipo?.categoria?.nome || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p><strong>Data Atribuição:</strong> {new Date(atribuicao.data_atribuicao).toLocaleDateString('pt-PT')}</p>
                        {atribuicao.data_devolucao_prevista && (
                          <p><strong>Devolução Prevista:</strong> {new Date(atribuicao.data_devolucao_prevista).toLocaleDateString('pt-PT')}</p>
                        )}
                        {atribuicao.data_devolucao_real && (
                          <p><strong>Devolvido em:</strong> {new Date(atribuicao.data_devolucao_real).toLocaleDateString('pt-PT')}</p>
                        )}
                      </div>
                      
                      <div>
                        {atribuicao.quantidade_devolvida && atribuicao.quantidade_devolvida > 0 && (
                          <p><strong>Quantidade Devolvida:</strong> {atribuicao.quantidade_devolvida}</p>
                        )}
                        {atribuicao.valor_responsabilidade && (
                          <p><strong>Valor Responsabilidade:</strong> €{atribuicao.valor_responsabilidade.toFixed(2)}</p>
                        )}
                        {atribuicao.motivo && (
                          <p><strong>Motivo:</strong> {atribuicao.motivo}</p>
                        )}
                        {atribuicao.observacoes && (
                          <p><strong>Observações:</strong> {atribuicao.observacoes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Funcionalidade em desenvolvimento",
                          description: "Visualização detalhada será implementada em breve.",
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    
                    {(atribuicao.estado === 'ATIVO' || atribuicao.estado === 'PARCIALMENTE_DEVOLVIDO') && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/aprovisionamento/editar-atribuicao/${atribuicao.id}`)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/aprovisionamento/devolucao/${atribuicao.id}`)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {atribuicao.estado === 'PARCIALMENTE_DEVOLVIDO' ? 'Devolver Resto' : 'Devolver'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAtribuicoes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhuma atribuição encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterTipo !== 'all' || filterEstado !== 'all' || filterVencimento !== 'all'
                  ? 'Tente ajustar os filtros ou criar uma nova atribuição.'
                  : 'Comece criando a sua primeira atribuição de item.'}
              </p>
              <Button onClick={() => navigate('/aprovisionamento/nova-atribuicao')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Atribuição
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default AtribuicoesAprovisionamento;