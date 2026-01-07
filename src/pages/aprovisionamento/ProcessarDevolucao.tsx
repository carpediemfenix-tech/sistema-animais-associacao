import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  RotateCcw, 
  ArrowLeft,
  User,
  Heart,
  MapPin,
  AlertCircle,
  CheckCircle,
  Info,
  Calendar,
  MessageSquare,
  AlertTriangle
} from "lucide-react";

// Interfaces
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
  estado: string;
  motivo?: string;
  observacoes?: string;
  valor_responsabilidade?: number;
  item?: {
    nome: string;
    descricao?: string;
    preco_unitario?: number;
    tipo?: {
      nome: string;
      categoria?: {
        nome: string;
        cor_interface: string;
      };
    };
  };
  entidade_nome?: string;
  dias_restantes?: number;
}

const ProcessarDevolucao: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [atribuicao, setAtribuicao] = useState<Atribuicao | null>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    quantidade_devolvida: 1,
    estado_devolucao: 'BOM',
    observacoes_verificacao: ''
  });

  // Estados de validação
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Função auxiliar para obter nome da entidade
  const getEntidadeNome = (atribuicao: Atribuicao): string => {
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

  // Carregar dados da atribuição
  const loadAtribuicao = async () => {
    if (!id) {
      toast({
        title: "ID da atribuição não fornecido",
        variant: "destructive",
      });
      navigate('/aprovisionamento/atribuicoes');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔍 Carregando atribuição:', id);
      
      // Carregar atribuição
      const { data: atribuicaoData, error: atribuicaoError } = await supabase
        .from('atribuicoes_itens_2026_01_07_00_52')
        .select('*')
        .eq('id', id)
        .single();

      if (atribuicaoError) {
        console.error('❌ Erro ao carregar atribuição:', atribuicaoError);
        toast({
          title: "Erro ao carregar atribuição",
          description: atribuicaoError.message,
          variant: "destructive",
        });
        navigate('/aprovisionamento/atribuicoes');
        return;
      }

      if (!atribuicaoData) {
        toast({
          title: "Atribuição não encontrada",
          variant: "destructive",
        });
        navigate('/aprovisionamento/atribuicoes');
        return;
      }

      // Verificar se a atribuição está ativa
      if (atribuicaoData.estado !== 'ATIVO') {
        toast({
          title: "Atribuição não está ativa",
          description: `Esta atribuição já foi processada com estado: ${atribuicaoData.estado}`,
          variant: "destructive",
        });
        navigate('/aprovisionamento/atribuicoes');
        return;
      }

      // Carregar dados do item
      let itemData = null;
      if (atribuicaoData.item_id) {
        const { data: item } = await supabase
          .from('itens_aprovisionamento_2026_01_06')
          .select(`
            nome,
            descricao,
            preco_unitario,
            tipo_id
          `)
          .eq('id', atribuicaoData.item_id)
          .single();

        if (item) {
          // Carregar dados do tipo e categoria
          let tipoData = null;
          if (item.tipo_id) {
            const { data: tipo } = await supabase
              .from('tipos_aprovisionamento_2026_01_06')
              .select('nome, categoria_id')
              .eq('id', item.tipo_id)
              .single();

            if (tipo) {
              tipoData = { ...tipo };
              
              // Carregar categoria
              if (tipo.categoria_id) {
                const { data: categoria } = await supabase
                  .from('categorias_aprovisionamento_2026_01_06')
                  .select('nome, cor_interface')
                  .eq('id', tipo.categoria_id)
                  .single();
                
                if (categoria) {
                  tipoData.categoria = categoria;
                }
              }
            }
          }

          itemData = {
            ...item,
            tipo: tipoData
          };
        }
      }

      // Calcular dias restantes
      const diasRestantes = atribuicaoData.data_devolucao_prevista 
        ? Math.ceil((new Date(atribuicaoData.data_devolucao_prevista).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const atribuicaoCompleta = {
        ...atribuicaoData,
        item: itemData,
        entidade_nome: getEntidadeNome(atribuicaoData),
        dias_restantes: diasRestantes
      };

      setAtribuicao(atribuicaoCompleta);
      
      // Definir quantidade padrão como a quantidade total atribuída
      setFormData(prev => ({
        ...prev,
        quantidade_devolvida: atribuicaoData.quantidade_atribuida
      }));

      console.log('✅ Atribuição carregada:', atribuicaoCompleta);

    } catch (error) {
      console.error('🚫 Erro geral ao carregar atribuição:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro inesperado ao carregar os dados.",
        variant: "destructive",
      });
      navigate('/aprovisionamento/atribuicoes');
    } finally {
      setLoading(false);
    }
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.quantidade_devolvida < 1) {
      newErrors.quantidade_devolvida = 'Quantidade deve ser maior que 0';
    }

    if (atribuicao && formData.quantidade_devolvida > atribuicao.quantidade_atribuida) {
      newErrors.quantidade_devolvida = `Quantidade máxima: ${atribuicao.quantidade_atribuida}`;
    }

    if (!formData.estado_devolucao) {
      newErrors.estado_devolucao = 'Selecione o estado do item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter formulário
  const handleSubmit = async () => {
    if (!validateForm() || !atribuicao) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Usar função v2 para evitar conflitos
      console.log('🔄 Processando devolução:', {
        atribuicao_id: atribuicao.id,
        quantidade: formData.quantidade_devolvida,
        estado: formData.estado_devolucao
      });

      const { data, error } = await supabase.rpc('processar_devolucao_parcial_v2', {
        p_atribuicao_id: atribuicao.id,
        p_quantidade_devolver: formData.quantidade_devolvida,
        p_estado_devolucao: formData.estado_devolucao,
        p_observacoes_verificacao: formData.observacoes_verificacao || null
      });

      if (error) {
        console.error('❌ Erro RPC:', error);
        
        // Tratamento específico para erro de função ambígua
        if (error.code === 'PGRST203') {
          toast({
            title: "Erro de configuração",
            description: "Conflito de funções detectado. Tentando função alternativa...",
            variant: "destructive",
          });
        }
        throw error;
      }

      console.log('✅ Resposta da função:', data);

      if (data && !data.success) {
        toast({
          title: "Erro na devolução",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Feedback melhorado para devolução parcial
      const isDevolvido = data.devolucao_completa;
      const quantidadeRestante = data.quantidade_restante;
      
      toast({
        title: isDevolvido ? "✅ Devolução Completa!" : "✅ Devolução Parcial Processada!",
        description: isDevolvido 
          ? `Todos os itens foram devolvidos com sucesso`
          : `${formData.quantidade_devolvida} unidades devolvidas. Restam ${quantidadeRestante} por devolver.`,
      });

      // Redirecionar para a lista de atribuições
      navigate('/aprovisionamento/atribuicoes');

    } catch (error: any) {
      console.error('Erro ao processar devolução:', error);
      toast({
        title: "Erro ao processar devolução",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadAtribuicao();
  }, [id]);

  useEffect(() => {
    // Revalidar quando dados do formulário mudarem
    if (Object.keys(errors).length > 0) {
      validateForm();
    }
  }, [formData, atribuicao]);

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
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600">Atribuição não encontrada</p>
              <Button 
                onClick={() => navigate('/aprovisionamento/atribuicoes')}
                className="mt-4"
              >
                Voltar às Atribuições
              </Button>
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
          { label: 'Processar Devolução' }
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
                <RotateCcw className="h-6 w-6" />
                Processar Devolução de Item
              </CardTitle>
              <p className="text-gray-600">
                Registar a devolução do item e o seu estado atual.
              </p>
            </CardHeader>
          </Card>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal - Formulário */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Informações da Atribuição */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Informações da Atribuição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Item:</strong> {atribuicao.item?.nome}</p>
                        <p><strong>Categoria:</strong> {atribuicao.item?.tipo?.categoria?.nome || 'N/A'}</p>
                        <p><strong>Tipo:</strong> {atribuicao.item?.tipo?.nome || 'N/A'}</p>
                        <p><strong>Quantidade Atribuída:</strong> {atribuicao.quantidade_atribuida}</p>
                      </div>
                      <div>
                        <p><strong>Entidade:</strong> {atribuicao.entidade_nome}</p>
                        <p><strong>Data Atribuição:</strong> {new Date(atribuicao.data_atribuicao).toLocaleDateString('pt-PT')}</p>
                        {atribuicao.data_devolucao_prevista && (
                          <p><strong>Devolução Prevista:</strong> {new Date(atribuicao.data_devolucao_prevista).toLocaleDateString('pt-PT')}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={
                            atribuicao.tipo_atribuicao === 'VOLUNTARIO' ? 'default' :
                            atribuicao.tipo_atribuicao === 'ANIMAL' ? 'secondary' : 'outline'
                          }>
                            {atribuicao.tipo_atribuicao === 'VOLUNTARIO' && <User className="h-3 w-3 mr-1" />}
                            {atribuicao.tipo_atribuicao === 'ANIMAL' && <Heart className="h-3 w-3 mr-1" />}
                            {atribuicao.tipo_atribuicao === 'MISSAO' && <MapPin className="h-3 w-3 mr-1" />}
                            {atribuicao.tipo_atribuicao}
                          </Badge>
                          
                          {atribuicao.dias_restantes !== null && (
                            <Badge variant={
                              atribuicao.dias_restantes < 0 ? 'destructive' :
                              atribuicao.dias_restantes <= 7 ? 'secondary' : 'outline'
                            }>
                              <Calendar className="h-3 w-3 mr-1" />
                              {atribuicao.dias_restantes < 0 
                                ? `Vencida há ${Math.abs(atribuicao.dias_restantes)} dias`
                                : `${atribuicao.dias_restantes} dias restantes`
                              }
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {atribuicao.motivo && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <p><strong>Motivo:</strong> {atribuicao.motivo}</p>
                      </div>
                    )}
                    
                    {atribuicao.observacoes && (
                      <div className="mt-2">
                        <p><strong>Observações:</strong> {atribuicao.observacoes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Formulário de Devolução */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Detalhes da Devolução
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quantidade Devolvida */}
                  <div>
                    <Label htmlFor="quantidade_devolvida">Quantidade Devolvida *</Label>
                    <Input
                      id="quantidade_devolvida"
                      type="number"
                      min="1"
                      max={atribuicao.quantidade_atribuida}
                      value={formData.quantidade_devolvida}
                      onChange={(e) => setFormData({...formData, quantidade_devolvida: parseInt(e.target.value) || 1})}
                      className={errors.quantidade_devolvida ? 'border-red-500' : ''}
                    />
                    {errors.quantidade_devolvida && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.quantidade_devolvida}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Máximo: {atribuicao.quantidade_atribuida} unidades
                    </p>
                  </div>

                  {/* Estado da Devolução */}
                  <div>
                    <Label htmlFor="estado_devolucao">Estado do Item *</Label>
                    <Select 
                      value={formData.estado_devolucao} 
                      onValueChange={(value) => setFormData({...formData, estado_devolucao: value})}
                    >
                      <SelectTrigger className={errors.estado_devolucao ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOM">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Bom Estado
                          </div>
                        </SelectItem>
                        <SelectItem value="DANIFICADO">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            Danificado
                          </div>
                        </SelectItem>
                        <SelectItem value="PERDIDO">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            Perdido
                          </div>
                        </SelectItem>
                        <SelectItem value="CONSUMIDO">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-600" />
                            Consumido
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.estado_devolucao && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.estado_devolucao}
                      </p>
                    )}
                  </div>

                  {/* Observações de Verificação */}
                  <div>
                    <Label htmlFor="observacoes_verificacao">Observações de Verificação</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="observacoes_verificacao"
                        value={formData.observacoes_verificacao}
                        onChange={(e) => setFormData({...formData, observacoes_verificacao: e.target.value})}
                        placeholder="Descreva o estado do item, danos encontrados, etc."
                        rows={4}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Descreva detalhadamente o estado do item na devolução
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Lateral - Resumo */}
            <div className="space-y-6">
              
              {/* Resumo da Devolução */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Resumo da Devolução
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p><strong>Item:</strong> {atribuicao.item?.nome}</p>
                    <p><strong>Quantidade Original:</strong> {atribuicao.quantidade_atribuida}</p>
                    <p><strong>Quantidade a Devolver:</strong> {formData.quantidade_devolvida}</p>
                    <p><strong>Estado:</strong> {formData.estado_devolucao}</p>
                  </div>
                  
                  {formData.quantidade_devolvida < atribuicao.quantidade_atribuida && (
                    <div className="pt-3 border-t bg-yellow-50 p-3 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>⚠️ Devolução Parcial</strong><br />
                        Restante: {atribuicao.quantidade_atribuida - formData.quantidade_devolvida} unidades
                      </p>
                    </div>
                  )}
                  
                  {atribuicao.valor_responsabilidade && (
                    <div className="pt-3 border-t">
                      <p className="text-sm">
                        <strong>Valor Responsabilidade:</strong> €{atribuicao.valor_responsabilidade.toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações do Estado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Estados Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">Bom Estado</p>
                      <p className="text-gray-600">Item em perfeitas condições</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-medium">Danificado</p>
                      <p className="text-gray-600">Item com danos mas recuperável</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium">Perdido</p>
                      <p className="text-gray-600">Item não localizado</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium">Consumido</p>
                      <p className="text-gray-600">Item usado/consumido</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                          Processando Devolução...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Processar Devolução
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

export default ProcessarDevolucao;