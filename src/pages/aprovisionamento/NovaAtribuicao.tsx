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
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  Plus, 
  ArrowLeft,
  User,
  Heart,
  MapPin,
  AlertCircle,
  CheckCircle,
  Info,
  Calendar,
  Hash,
  FileText,
  MessageSquare
} from "lucide-react";

// Interfaces
interface Item {
  id: string;
  nome: string;
  descricao?: string;
  quantidade_atual: number;
  stock_minimo: number;
  preco_unitario?: number;
  tipo?: {
    nome: string;
    categoria?: {
      id: string;
      nome: string;
      cor_interface: string;
    };
  };
}

interface ConfigAtribuicao {
  id: string;
  categoria_id: string;
  permite_voluntarios: boolean;
  permite_animais: boolean;
  permite_missoes: boolean;
  permite_grupos: boolean;
  quantidade_maxima_por_voluntario?: number;
  quantidade_maxima_por_animal?: number;
  quantidade_maxima_por_missao?: number;
  quantidade_maxima_por_grupo?: number;
  prazo_devolucao_dias: number;
  requer_verificacao: boolean;
  permite_consumo: boolean;
  valor_responsabilidade_padrao?: number;
}

const NovaAtribuicao: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itens, setItens] = useState<Item[]>([]);
  const [configs, setConfigs] = useState<ConfigAtribuicao[]>([]);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    item_id: '',
    tipo_atribuicao: 'VOLUNTARIO' as 'VOLUNTARIO' | 'ANIMAL' | 'MISSAO' | 'GRUPO',
    entidade_id: '',
    quantidade: 1,
    data_devolucao_prevista: '',
    motivo: '',
    observacoes: ''
  });

  // Estados de validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itemSelecionado, setItemSelecionado] = useState<Item | null>(null);
  const [configSelecionada, setConfigSelecionada] = useState<ConfigAtribuicao | null>(null);

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Carregando dados para nova atribuição...');
      
      // Carregar categorias
      const { data: categoriasData } = await supabase
        .from('categorias_aprovisionamento_2026_01_06')
        .select('id, nome, cor_interface, ativo')
        .eq('ativo', true);
      
      const categoriasMap = new Map();
      (categoriasData || []).forEach(categoria => {
        categoriasMap.set(categoria.id, categoria);
      });
      
      // Carregar tipos
      const { data: tiposData } = await supabase
        .from('tipos_aprovisionamento_2026_01_06')
        .select('id, nome, categoria_id, ativo')
        .eq('ativo', true);
      
      const tiposMap = new Map();
      (tiposData || []).forEach(tipo => {
        const categoria = categoriasMap.get(tipo.categoria_id);
        tiposMap.set(tipo.id, {
          ...tipo,
          categoria: categoria || null
        });
      });

      // Carregar itens disponíveis
      const { data: itensData, error: itensError } = await supabase
        .from('itens_aprovisionamento_2026_01_06')
        .select('*')
        .eq('ativo', true)
        .gt('quantidade_atual', 0)
        .order('nome');

      if (itensError) {
        console.error('❌ Erro ao carregar itens:', itensError);
        toast({
          title: "Erro ao carregar itens",
          description: itensError.message,
          variant: "destructive",
        });
        return;
      }

      // Processar itens com dados de tipo e categoria
      const processedItens = (itensData || []).map(item => {
        const tipo = tiposMap.get(item.tipo_id);
        return {
          ...item,
          tipo: tipo || null
        };
      });

      setItens(processedItens);

      // Carregar configurações de atribuição
      const { data: configsData, error: configsError } = await supabase
        .from('config_atribuicoes_2026_01_07_00_52')
        .select('*');

      if (configsError) {
        console.error('❌ Erro ao carregar configurações:', configsError);
      } else {
        setConfigs(configsData || []);
      }

      console.log('✅ Dados carregados:', { 
        itens: processedItens.length, 
        configs: configsData?.length || 0 
      });

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

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.item_id) {
      newErrors.item_id = 'Selecione um item';
    }

    if (!formData.entidade_id.trim()) {
      newErrors.entidade_id = 'Digite o ID da entidade';
    }

    if (formData.quantidade < 1) {
      newErrors.quantidade = 'Quantidade deve ser maior que 0';
    }

    if (itemSelecionado && formData.quantidade > itemSelecionado.quantidade_atual) {
      newErrors.quantidade = `Stock insuficiente. Disponível: ${itemSelecionado.quantidade_atual}`;
    }

    // Validar configurações da categoria
    if (configSelecionada) {
      const tipoPermitido = 
        (formData.tipo_atribuicao === 'VOLUNTARIO' && configSelecionada.permite_voluntarios) ||
        (formData.tipo_atribuicao === 'ANIMAL' && configSelecionada.permite_animais) ||
        (formData.tipo_atribuicao === 'MISSAO' && configSelecionada.permite_missoes);

      if (!tipoPermitido) {
        newErrors.tipo_atribuicao = `Esta categoria não permite atribuições a ${formData.tipo_atribuicao.toLowerCase()}s`;
      }

      // Validar quantidade máxima
      const quantidadeMaxima = 
        formData.tipo_atribuicao === 'VOLUNTARIO' ? configSelecionada.quantidade_maxima_por_voluntario :
        formData.tipo_atribuicao === 'ANIMAL' ? configSelecionada.quantidade_maxima_por_animal :
        configSelecionada.quantidade_maxima_por_missao;

      if (quantidadeMaxima && formData.quantidade > quantidadeMaxima) {
        newErrors.quantidade = `Quantidade máxima para ${formData.tipo_atribuicao.toLowerCase()}s: ${quantidadeMaxima}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualizar item selecionado
  const handleItemChange = (itemId: string) => {
    const item = itens.find(i => i.id === itemId);
    setItemSelecionado(item || null);
    
    if (item?.tipo?.categoria?.id) {
      const config = configs.find(c => c.categoria_id === item.tipo.categoria.id);
      setConfigSelecionada(config || null);
      
      // Definir data de devolução prevista baseada na configuração
      if (config?.prazo_devolucao_dias) {
        const dataFutura = new Date();
        dataFutura.setDate(dataFutura.getDate() + config.prazo_devolucao_dias);
        setFormData(prev => ({
          ...prev,
          item_id: itemId,
          data_devolucao_prevista: dataFutura.toISOString().split('T')[0]
        }));
      } else {
        setFormData(prev => ({ ...prev, item_id: itemId }));
      }
    } else {
      setFormData(prev => ({ ...prev, item_id: itemId }));
    }
    
    // Limpar erros do item
    if (errors.item_id) {
      setErrors(prev => ({ ...prev, item_id: '' }));
    }
  };

  // Submeter formulário
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase.rpc('criar_atribuicao_item', {
        p_item_id: formData.item_id,
        p_tipo_atribuicao: formData.tipo_atribuicao,
        p_entidade_id: formData.entidade_id,
        p_quantidade: formData.quantidade,
        p_data_devolucao_prevista: formData.data_devolucao_prevista || null,
        p_motivo: formData.motivo || null,
        p_observacoes: formData.observacoes || null
      });

      if (error) {
        throw error;
      }

      if (data && !data.success) {
        toast({
          title: "Erro na atribuição",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "✅ Atribuição criada com sucesso!",
        description: `Item atribuído. Stock restante: ${data.quantidade_disponivel_restante}`,
      });

      // Redirecionar para a lista de atribuições
      navigate('/aprovisionamento/atribuicoes');

    } catch (error: any) {
      console.error('Erro ao criar atribuição:', error);
      toast({
        title: "Erro ao criar atribuição",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Revalidar quando dados do formulário mudarem
    if (Object.keys(errors).length > 0) {
      validateForm();
    }
  }, [formData, itemSelecionado, configSelecionada]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando formulário...</p>
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
          { label: 'Atribuições', href: '/aprovisionamento/atribuicoes' },
          { label: 'Nova Atribuição' }
        ]}
        primaryActions={
          <Button 
            variant="outline" 
            onClick={() => navigate('/aprovisionamento/atribuicoes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar às Atribuições
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-6 w-6" />
                Nova Atribuição de Item
              </CardTitle>
              <p className="text-gray-600">
                Atribuir um item do stock a um voluntário, animal ou missão.
              </p>
            </CardHeader>
          </Card>

          {/* Formulário Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal - Formulário */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Seleção do Item */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Seleção do Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="item">Item a Atribuir *</Label>
                    <Select value={formData.item_id} onValueChange={handleItemChange}>
                      <SelectTrigger className={errors.item_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione um item disponível" />
                      </SelectTrigger>
                      <SelectContent>
                        {itens.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{item.nome}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant="outline">
                                  Stock: {item.quantidade_atual}
                                </Badge>
                                {item.tipo?.categoria && (
                                  <Badge 
                                    variant="secondary"
                                    style={{ backgroundColor: `${item.tipo.categoria.cor_interface}20`, color: item.tipo.categoria.cor_interface }}
                                  >
                                    {item.tipo.categoria.nome}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.item_id && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.item_id}
                      </p>
                    )}
                  </div>

                  {/* Informações do Item Selecionado */}
                  {itemSelecionado && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Informações do Item:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Nome:</strong> {itemSelecionado.nome}</p>
                          <p><strong>Stock Atual:</strong> {itemSelecionado.quantidade_atual}</p>
                          <p><strong>Stock Mínimo:</strong> {itemSelecionado.stock_minimo}</p>
                        </div>
                        <div>
                          <p><strong>Tipo:</strong> {itemSelecionado.tipo?.nome || 'N/A'}</p>
                          <p><strong>Categoria:</strong> {itemSelecionado.tipo?.categoria?.nome || 'N/A'}</p>
                          {itemSelecionado.preco_unitario && (
                            <p><strong>Preço:</strong> €{itemSelecionado.preco_unitario.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      {itemSelecionado.descricao && (
                        <p className="mt-2"><strong>Descrição:</strong> {itemSelecionado.descricao}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detalhes da Atribuição */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Detalhes da Atribuição
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tipo de Atribuição */}
                  <div>
                    <Label htmlFor="tipo">Tipo de Atribuição *</Label>
                    <Select 
                      value={formData.tipo_atribuicao} 
                      onValueChange={(value: 'VOLUNTARIO' | 'ANIMAL' | 'MISSAO' | 'GRUPO') => 
                        setFormData({...formData, tipo_atribuicao: value})
                      }
                    >
                      <SelectTrigger className={errors.tipo_atribuicao ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VOLUNTARIO">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Voluntário
                          </div>
                        </SelectItem>
                        <SelectItem value="ANIMAL">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Animal
                          </div>
                        </SelectItem>
                        <SelectItem value="MISSAO">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Missão
                          </div>
                        </SelectItem>
                        <SelectItem value="GRUPO">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Grupo de Animais
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipo_atribuicao && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.tipo_atribuicao}
                      </p>
                    )}
                  </div>

                  {/* ID da Entidade */}
                  <div>
                    <Label htmlFor="entidade">
                      {formData.tipo_atribuicao === 'VOLUNTARIO' ? 'ID do Voluntário' :
                       formData.tipo_atribuicao === 'ANIMAL' ? 'ID do Animal' : 'ID da Missão'} *
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="entidade"
                        value={formData.entidade_id}
                        onChange={(e) => setFormData({...formData, entidade_id: e.target.value})}
                        placeholder={`Digite o ID do ${formData.tipo_atribuicao.toLowerCase()}`}
                        className={`pl-10 ${errors.entidade_id ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.entidade_id && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.entidade_id}
                      </p>
                    )}
                  </div>

                  {/* Quantidade */}
                  <div>
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      max={itemSelecionado?.quantidade_atual || 999}
                      value={formData.quantidade}
                      onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 1})}
                      className={errors.quantidade ? 'border-red-500' : ''}
                    />
                    {errors.quantidade && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.quantidade}
                      </p>
                    )}
                    {itemSelecionado && (
                      <p className="text-sm text-gray-600 mt-1">
                        Disponível: {itemSelecionado.quantidade_atual} unidades
                      </p>
                    )}
                  </div>

                  {/* Data de Devolução Prevista */}
                  <div>
                    <Label htmlFor="data_devolucao">Data de Devolução Prevista</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="data_devolucao"
                        type="date"
                        value={formData.data_devolucao_prevista}
                        onChange={(e) => setFormData({...formData, data_devolucao_prevista: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                    {configSelecionada?.prazo_devolucao_dias && (
                      <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                        <Info className="h-4 w-4" />
                        Prazo padrão: {configSelecionada.prazo_devolucao_dias} dias
                      </p>
                    )}
                  </div>

                  {/* Motivo */}
                  <div>
                    <Label htmlFor="motivo">Motivo da Atribuição</Label>
                    <Input
                      id="motivo"
                      value={formData.motivo}
                      onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                      placeholder="Ex: Missão de resgate, formação, uso pessoal"
                    />
                  </div>

                  {/* Observações */}
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                        placeholder="Observações adicionais sobre a atribuição"
                        rows={3}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Lateral - Resumo e Configurações */}
            <div className="space-y-6">
              
              {/* Resumo da Atribuição */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Resumo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p><strong>Item:</strong> {itemSelecionado?.nome || 'Não selecionado'}</p>
                    <p><strong>Tipo:</strong> {formData.tipo_atribuicao}</p>
                    <p><strong>Entidade:</strong> {formData.entidade_id || 'Não definida'}</p>
                    <p><strong>Quantidade:</strong> {formData.quantidade}</p>
                    {formData.data_devolucao_prevista && (
                      <p><strong>Devolução:</strong> {new Date(formData.data_devolucao_prevista).toLocaleDateString('pt-PT')}</p>
                    )}
                  </div>
                  
                  {itemSelecionado && (
                    <div className="pt-3 border-t">
                      <p className="text-sm">
                        <strong>Stock após atribuição:</strong> {itemSelecionado.quantidade_atual - formData.quantidade}
                      </p>
                      {itemSelecionado.preco_unitario && (
                        <p className="text-sm">
                          <strong>Valor total:</strong> €{(itemSelecionado.preco_unitario * formData.quantidade).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configurações da Categoria */}
              {configSelecionada && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Configurações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={configSelecionada.permite_voluntarios ? 'default' : 'secondary'}>
                        Voluntários: {configSelecionada.permite_voluntarios ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={configSelecionada.permite_animais ? 'default' : 'secondary'}>
                        Animais: {configSelecionada.permite_animais ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={configSelecionada.permite_missoes ? 'default' : 'secondary'}>
                        Missões: {configSelecionada.permite_missoes ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    
                    {configSelecionada.prazo_devolucao_dias > 0 && (
                      <p><strong>Prazo padrão:</strong> {configSelecionada.prazo_devolucao_dias} dias</p>
                    )}
                    
                    {configSelecionada.requer_verificacao && (
                      <p className="text-yellow-600"><strong>⚠️ Requer verificação na devolução</strong></p>
                    )}
                    
                    {configSelecionada.valor_responsabilidade_padrao && (
                      <p><strong>Valor responsabilidade:</strong> €{configSelecionada.valor_responsabilidade_padrao.toFixed(2)}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Botões de Ação */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button 
                      onClick={handleSubmit}
                      disabled={saving || Object.keys(errors).length > 0}
                      className="w-full"
                      size="lg"
                    >
                      {saving ? (
                        <>
                          <Package className="h-4 w-4 mr-2 animate-spin" />
                          Criando Atribuição...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Atribuição
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/aprovisionamento/atribuicoes')}
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default NovaAtribuicao;