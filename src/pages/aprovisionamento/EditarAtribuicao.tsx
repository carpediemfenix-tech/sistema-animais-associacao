import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import EnhancedHeader from '@/components/EnhancedHeader';
import EnhancedFooter from '@/components/EnhancedFooter';
import PageActionBar from '@/components/PageActionBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  ArrowLeft,
  User,
  Heart,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  Save,
  Loader2
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

const EditarAtribuicao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [atribuicao, setAtribuicao] = useState<Atribuicao | null>(null);
  const [config, setConfig] = useState<ConfigAtribuicao | null>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    quantidade_atribuida: 0,
    data_devolucao_prevista: '',
    motivo: '',
    observacoes: '',
    valor_responsabilidade: '',
  });
  
  // Estados de validação
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadAtribuicao();
    }
  }, [id]);

  const getEntidadeNome = (atribuicao: Atribuicao): string => {
    switch (atribuicao.tipo_atribuicao) {
      case 'VOLUNTARIO':
        return atribuicao.voluntario_id || 'Voluntário não identificado';
      case 'ANIMAL':
        return atribuicao.animal_id || 'Animal não identificado';
      case 'MISSAO':
        return atribuicao.missao_id || 'Missão não identificada';
      default:
        return 'Entidade desconhecida';
    }
  };

  const loadAtribuicao = async () => {
    try {
      setLoading(true);
      console.log('🔍 [EDITAR ATRIBUIÇÃO] Carregando atribuição:', id);

      // Carregar atribuição com item, tipo e categoria
      const { data: atribuicaoData, error: atribuicaoError } = await supabase
        .from('atribuicoes_itens_2026_01_07_00_52')
        .select(`
          *,
          item:itens_aprovisionamento_2026_01_06(
            *,
            tipo:tipos_aprovisionamento_2026_01_06(
              *,
              categoria:categorias_aprovisionamento_2026_01_06(*)
            )
          )
        `)
        .eq('id', id)
        .single();

      if (atribuicaoError) throw atribuicaoError;
      if (!atribuicaoData) throw new Error('Atribuição não encontrada');

      // Calcular dias restantes
      const hoje = new Date();
      const dataPrevista = new Date(atribuicaoData.data_devolucao_prevista || '');
      const diasRestantes = Math.ceil((dataPrevista.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      const atribuicaoCompleta: Atribuicao = {
        ...atribuicaoData,
        entidade_nome: getEntidadeNome(atribuicaoData),
        dias_restantes: diasRestantes
      };

      setAtribuicao(atribuicaoCompleta);

      // Preencher formulário
      setFormData({
        quantidade_atribuida: atribuicaoData.quantidade_atribuida,
        data_devolucao_prevista: atribuicaoData.data_devolucao_prevista || '',
        motivo: atribuicaoData.motivo || '',
        observacoes: atribuicaoData.observacoes || '',
        valor_responsabilidade: atribuicaoData.valor_responsabilidade?.toString() || '',
      });

      // Carregar configuração da categoria
      if (atribuicaoData.item?.tipo?.categoria?.id) {
        const { data: configData, error: configError } = await supabase
          .from('config_atribuicoes_2026_01_07_00_52')
          .select('*')
          .eq('categoria_id', atribuicaoData.item.tipo.categoria.id)
          .single();

        if (configError) {
          console.warn('Configuração não encontrada para categoria:', configError);
        } else {
          setConfig(configData);
        }
      }

      console.log('✅ [EDITAR ATRIBUIÇÃO] Dados carregados:', {
        atribuicao: atribuicaoCompleta.id,
        item: atribuicaoCompleta.item?.nome,
        entidade: atribuicaoCompleta.entidade_nome,
        estado: atribuicaoCompleta.estado
      });

    } catch (error: any) {
      console.error('❌ [EDITAR ATRIBUIÇÃO] Erro ao carregar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar atribuição",
        variant: "destructive",
      });
      navigate('/aprovisionamento/atribuicoes');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.quantidade_atribuida || formData.quantidade_atribuida <= 0) {
      newErrors.quantidade_atribuida = 'Quantidade deve ser maior que zero';
    }

    if (!formData.data_devolucao_prevista) {
      newErrors.data_devolucao_prevista = 'Data de devolução prevista é obrigatória';
    }

    // Validar se a quantidade não excede o stock disponível
    if (atribuicao?.item && formData.quantidade_atribuida > atribuicao.item.quantidade_atual + atribuicao.quantidade_atribuida) {
      newErrors.quantidade_atribuida = `Quantidade excede stock disponível (${atribuicao.item.quantidade_atual + atribuicao.quantidade_atribuida} unidades)`;
    }

    // Validar configurações da categoria
    if (config && atribuicao) {
      const maxQuantidade = atribuicao.tipo_atribuicao === 'VOLUNTARIO' 
        ? config.quantidade_maxima_por_voluntario
        : atribuicao.tipo_atribuicao === 'ANIMAL'
        ? config.quantidade_maxima_por_animal
        : config.quantidade_maxima_por_missao;

      if (maxQuantidade && formData.quantidade_atribuida > maxQuantidade) {
        newErrors.quantidade_atribuida = `Quantidade máxima permitida: ${maxQuantidade} unidades`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !atribuicao) return;

    try {
      setSaving(true);
      console.log('💾 [EDITAR ATRIBUIÇÃO] Salvando alterações:', formData);

      const updateData = {
        quantidade_atribuida: formData.quantidade_atribuida,
        data_devolucao_prevista: formData.data_devolucao_prevista,
        motivo: formData.motivo || null,
        observacoes: formData.observacoes || null,
        valor_responsabilidade: formData.valor_responsabilidade ? parseFloat(formData.valor_responsabilidade) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('atribuicoes_itens_2026_01_07_00_52')
        .update(updateData)
        .eq('id', atribuicao.id);

      if (error) throw error;

      toast({
        title: "✅ Atribuição Atualizada",
        description: `${atribuicao.item?.nome} foi atualizada com sucesso`,
      });

      navigate('/aprovisionamento/atribuicoes');

    } catch (error: any) {
      console.error('❌ [EDITAR ATRIBUIÇÃO] Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar atribuição",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando atribuição...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  if (!atribuicao) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Atribuição não encontrada</h2>
            <p className="text-gray-600 mb-4">A atribuição solicitada não existe ou foi removida.</p>
            <Button onClick={() => navigate('/aprovisionamento/atribuicoes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Atribuições
            </Button>
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
          { label: 'Editar Atribuição' }
        ]}
        primaryActions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/aprovisionamento/atribuicoes')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Atribuições
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Editar Atribuição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Quantidade Atribuída */}
                  <div>
                    <Label htmlFor="quantidade">Quantidade Atribuída *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={formData.quantidade_atribuida}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        quantidade_atribuida: parseInt(e.target.value) || 0
                      }))}
                      className={errors.quantidade_atribuida ? 'border-red-500' : ''}
                    />
                    {errors.quantidade_atribuida && (
                      <p className="text-sm text-red-600 mt-1">{errors.quantidade_atribuida}</p>
                    )}
                  </div>

                  {/* Data de Devolução Prevista */}
                  <div>
                    <Label htmlFor="data_devolucao">Data de Devolução Prevista *</Label>
                    <Input
                      id="data_devolucao"
                      type="date"
                      value={formData.data_devolucao_prevista}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        data_devolucao_prevista: e.target.value
                      }))}
                      className={errors.data_devolucao_prevista ? 'border-red-500' : ''}
                    />
                    {errors.data_devolucao_prevista && (
                      <p className="text-sm text-red-600 mt-1">{errors.data_devolucao_prevista}</p>
                    )}
                  </div>

                  {/* Valor de Responsabilidade */}
                  <div>
                    <Label htmlFor="valor_responsabilidade">Valor de Responsabilidade (€)</Label>
                    <Input
                      id="valor_responsabilidade"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.valor_responsabilidade}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        valor_responsabilidade: e.target.value
                      }))}
                    />
                  </div>

                  {/* Motivo */}
                  <div>
                    <Label htmlFor="motivo">Motivo da Atribuição</Label>
                    <Input
                      id="motivo"
                      placeholder="Ex: Missão de resgate, cuidados especiais..."
                      value={formData.motivo}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        motivo: e.target.value
                      }))}
                    />
                  </div>

                  {/* Observações */}
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Observações adicionais sobre a atribuição..."
                      value={formData.observacoes}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        observacoes: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/aprovisionamento/atribuicoes')}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Informações */}
          <div className="space-y-6">
            {/* Informações da Atribuição */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações da Atribuição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Item */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Item</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{atribuicao.item?.nome}</span>
                  </div>
                  {atribuicao.item?.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{atribuicao.item.descricao}</p>
                  )}
                </div>

                {/* Tipo e Categoria */}
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {atribuicao.item?.tipo?.categoria?.nome}
                  </Badge>
                  <Badge variant="secondary">
                    {atribuicao.item?.tipo?.nome}
                  </Badge>
                </div>

                {/* Entidade */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Atribuído a</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {atribuicao.tipo_atribuicao === 'VOLUNTARIO' && <User className="h-4 w-4 text-green-600" />}
                    {atribuicao.tipo_atribuicao === 'ANIMAL' && <Heart className="h-4 w-4 text-red-600" />}
                    {atribuicao.tipo_atribuicao === 'MISSAO' && <MapPin className="h-4 w-4 text-purple-600" />}
                    <span className="font-medium">{atribuicao.entidade_nome}</span>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={atribuicao.estado === 'ATIVO' ? 'default' : 'secondary'}
                      className={
                        atribuicao.estado === 'ATIVO' ? 'bg-green-600' :
                        atribuicao.estado === 'DEVOLVIDO' ? 'bg-blue-600' :
                        'bg-gray-600'
                      }
                    >
                      {atribuicao.estado === 'ATIVO' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {atribuicao.estado}
                    </Badge>
                  </div>
                </div>

                {/* Data de Atribuição */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data de Atribuição</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(atribuicao.data_atribuicao).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>

                {/* Dias Restantes */}
                {atribuicao.dias_restantes !== undefined && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Prazo</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className={
                        atribuicao.dias_restantes < 0 ? 'text-red-600 font-medium' :
                        atribuicao.dias_restantes <= 3 ? 'text-orange-600 font-medium' :
                        'text-green-600'
                      }>
                        {atribuicao.dias_restantes < 0 
                          ? `${Math.abs(atribuicao.dias_restantes)} dias em atraso`
                          : atribuicao.dias_restantes === 0
                          ? 'Vence hoje'
                          : `${atribuicao.dias_restantes} dias restantes`
                        }
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Disponível */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stock Disponível</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {atribuicao.item?.quantidade_atual || 0}
                  </div>
                  <div className="text-sm text-gray-600">unidades disponíveis</div>
                  {atribuicao.item?.preco_unitario && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600">
                      <Euro className="h-3 w-3" />
                      <span>{atribuicao.item.preco_unitario.toFixed(2)} por unidade</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configurações da Categoria */}
            {config && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Regras da Categoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prazo padrão:</span>
                    <span className="font-medium">{config.prazo_devolucao_dias} dias</span>
                  </div>
                  {config.quantidade_maxima_por_voluntario && atribuicao.tipo_atribuicao === 'VOLUNTARIO' && (
                    <div className="flex justify-between">
                      <span>Máx. por voluntário:</span>
                      <span className="font-medium">{config.quantidade_maxima_por_voluntario} unidades</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Requer verificação:</span>
                    <span className="font-medium">{config.requer_verificacao ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Permite consumo:</span>
                    <span className="font-medium">{config.permite_consumo ? 'Sim' : 'Não'}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default EditarAtribuicao;