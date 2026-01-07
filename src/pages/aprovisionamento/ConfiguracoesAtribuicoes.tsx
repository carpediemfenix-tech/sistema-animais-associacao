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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  ArrowLeft,
  Save,
  Plus,
  Edit,
  Trash2,
  Package,
  Users,
  Heart,
  MapPin,
  UsersIcon,
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

// Interfaces
interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  cor_interface: string;
  icone: string;
  ativo: boolean;
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
  categoria?: Categoria;
}

const ConfiguracoesAtribuicoes: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<ConfigAtribuicao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  // Estados de edição
  const [editingConfig, setEditingConfig] = useState<ConfigAtribuicao | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    categoria_id: '',
    permite_voluntarios: true,
    permite_animais: true,
    permite_missoes: true,
    permite_grupos: true,
    quantidade_maxima_por_voluntario: '',
    quantidade_maxima_por_animal: '',
    quantidade_maxima_por_missao: '',
    quantidade_maxima_por_grupo: '',
    prazo_devolucao_dias: 30,
    requer_verificacao: false,
    permite_consumo: false,
    valor_responsabilidade_padrao: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 [CONFIG ATRIBUIÇÕES] Carregando dados...');

      // Carregar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias_aprovisionamento_2026_01_06')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Carregar configurações
      const { data: configsData, error: configsError } = await supabase
        .from('config_atribuicoes_2026_01_07_00_52')
        .select(`
          *,
          categoria:categorias_aprovisionamento_2026_01_06(*)
        `)
        .order('categoria_id');

      if (configsError) throw configsError;
      setConfigs(configsData || []);

      console.log('✅ [CONFIG ATRIBUIÇÕES] Dados carregados:', {
        categorias: categoriasData?.length || 0,
        configs: configsData?.length || 0
      });

    } catch (error: any) {
      console.error('❌ [CONFIG ATRIBUIÇÕES] Erro ao carregar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      categoria_id: '',
      permite_voluntarios: true,
      permite_animais: true,
      permite_missoes: true,
      permite_grupos: true,
      quantidade_maxima_por_voluntario: '',
      quantidade_maxima_por_animal: '',
      quantidade_maxima_por_missao: '',
      quantidade_maxima_por_grupo: '',
      prazo_devolucao_dias: 30,
      requer_verificacao: false,
      permite_consumo: false,
      valor_responsabilidade_padrao: ''
    });
  };

  const handleEdit = (config: ConfigAtribuicao) => {
    setFormData({
      categoria_id: config.categoria_id,
      permite_voluntarios: config.permite_voluntarios,
      permite_animais: config.permite_animais,
      permite_missoes: config.permite_missoes,
      permite_grupos: config.permite_grupos || false,
      quantidade_maxima_por_voluntario: config.quantidade_maxima_por_voluntario?.toString() || '',
      quantidade_maxima_por_animal: config.quantidade_maxima_por_animal?.toString() || '',
      quantidade_maxima_por_missao: config.quantidade_maxima_por_missao?.toString() || '',
      quantidade_maxima_por_grupo: config.quantidade_maxima_por_grupo?.toString() || '',
      prazo_devolucao_dias: config.prazo_devolucao_dias,
      requer_verificacao: config.requer_verificacao,
      permite_consumo: config.permite_consumo,
      valor_responsabilidade_padrao: config.valor_responsabilidade_padrao?.toString() || ''
    });
    setEditingConfig(config);
    setShowNewForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoria_id) {
      toast({
        title: "Erro",
        description: "Selecione uma categoria",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      console.log('💾 [CONFIG ATRIBUIÇÕES] Salvando configuração:', formData);

      const configData = {
        categoria_id: formData.categoria_id,
        permite_voluntarios: formData.permite_voluntarios,
        permite_animais: formData.permite_animais,
        permite_missoes: formData.permite_missoes,
        permite_grupos: formData.permite_grupos,
        quantidade_maxima_por_voluntario: formData.quantidade_maxima_por_voluntario ? parseInt(formData.quantidade_maxima_por_voluntario) : null,
        quantidade_maxima_por_animal: formData.quantidade_maxima_por_animal ? parseInt(formData.quantidade_maxima_por_animal) : null,
        quantidade_maxima_por_missao: formData.quantidade_maxima_por_missao ? parseInt(formData.quantidade_maxima_por_missao) : null,
        quantidade_maxima_por_grupo: formData.quantidade_maxima_por_grupo ? parseInt(formData.quantidade_maxima_por_grupo) : null,
        prazo_devolucao_dias: formData.prazo_devolucao_dias,
        requer_verificacao: formData.requer_verificacao,
        permite_consumo: formData.permite_consumo,
        valor_responsabilidade_padrao: formData.valor_responsabilidade_padrao ? parseFloat(formData.valor_responsabilidade_padrao) : null
      };

      if (editingConfig) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('config_atribuicoes_2026_01_07_00_52')
          .update(configData)
          .eq('id', editingConfig.id);

        if (error) throw error;

        toast({
          title: "✅ Configuração Atualizada",
          description: "As regras foram atualizadas com sucesso",
        });
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('config_atribuicoes_2026_01_07_00_52')
          .insert([configData]);

        if (error) throw error;

        toast({
          title: "✅ Configuração Criada",
          description: "Nova configuração foi criada com sucesso",
        });
      }

      setEditingConfig(null);
      setShowNewForm(false);
      resetForm();
      loadData();

    } catch (error: any) {
      console.error('❌ [CONFIG ATRIBUIÇÕES] Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configuração",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta configuração?')) return;

    try {
      const { error } = await supabase
        .from('config_atribuicoes_2026_01_07_00_52')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Configuração Removida",
        description: "A configuração foi removida com sucesso",
      });

      loadData();
    } catch (error: any) {
      console.error('❌ [CONFIG ATRIBUIÇÕES] Erro ao remover:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover configuração",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando configurações...</p>
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
          { label: 'Configurações de Atribuições' }
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
                setEditingConfig(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Configuração
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Configurações */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {configs.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma configuração encontrada
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Comece criando configurações para as suas categorias
                    </p>
                    <Button onClick={() => setShowNewForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Configuração
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {configs.map((config) => (
                      <Card key={config.id} className="border-l-4" style={{ borderLeftColor: config.categoria?.cor_interface }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{config.categoria?.nome}</h3>
                                <Badge variant="outline">
                                  {config.prazo_devolucao_dias} dias
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Voluntários:</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    {config.permite_voluntarios ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <AlertTriangle className="h-3 w-3 text-red-600" />
                                    )}
                                    <span className={config.permite_voluntarios ? 'text-green-600' : 'text-red-600'}>
                                      {config.permite_voluntarios ? 'Permitido' : 'Bloqueado'}
                                    </span>
                                  </div>
                                  {config.quantidade_maxima_por_voluntario && (
                                    <p className="text-xs text-gray-600">Máx: {config.quantidade_maxima_por_voluntario}</p>
                                  )}
                                </div>
                                
                                <div>
                                  <span className="font-medium">Animais:</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    {config.permite_animais ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <AlertTriangle className="h-3 w-3 text-red-600" />
                                    )}
                                    <span className={config.permite_animais ? 'text-green-600' : 'text-red-600'}>
                                      {config.permite_animais ? 'Permitido' : 'Bloqueado'}
                                    </span>
                                  </div>
                                  {config.quantidade_maxima_por_animal && (
                                    <p className="text-xs text-gray-600">Máx: {config.quantidade_maxima_por_animal}</p>
                                  )}
                                </div>
                                
                                <div>
                                  <span className="font-medium">Missões:</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    {config.permite_missoes ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <AlertTriangle className="h-3 w-3 text-red-600" />
                                    )}
                                    <span className={config.permite_missoes ? 'text-green-600' : 'text-red-600'}>
                                      {config.permite_missoes ? 'Permitido' : 'Bloqueado'}
                                    </span>
                                  </div>
                                  {config.quantidade_maxima_por_missao && (
                                    <p className="text-xs text-gray-600">Máx: {config.quantidade_maxima_por_missao}</p>
                                  )}
                                </div>
                                
                                <div>
                                  <span className="font-medium">Grupos:</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    {config.permite_grupos ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <AlertTriangle className="h-3 w-3 text-red-600" />
                                    )}
                                    <span className={config.permite_grupos ? 'text-green-600' : 'text-red-600'}>
                                      {config.permite_grupos ? 'Permitido' : 'Bloqueado'}
                                    </span>
                                  </div>
                                  {config.quantidade_maxima_por_grupo && (
                                    <p className="text-xs text-gray-600">Máx: {config.quantidade_maxima_por_grupo}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2 mt-3">
                                {config.requer_verificacao && (
                                  <Badge variant="secondary">Requer Verificação</Badge>
                                )}
                                {config.permite_consumo && (
                                  <Badge variant="outline">Permite Consumo</Badge>
                                )}
                                {config.valor_responsabilidade_padrao && (
                                  <Badge variant="outline">€{config.valor_responsabilidade_padrao.toFixed(2)}</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(config)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(config.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Edição */}
          {showNewForm && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Categoria */}
                    <div>
                      <Label htmlFor="categoria">Categoria *</Label>
                      <select
                        id="categoria"
                        value={formData.categoria_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoria_id: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        disabled={!!editingConfig}
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Permissões */}
                    <div className="space-y-3">
                      <Label>Tipos de Atribuição Permitidos</Label>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span>Voluntários</span>
                        </div>
                        <Switch
                          checked={formData.permite_voluntarios}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permite_voluntarios: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-600" />
                          <span>Animais</span>
                        </div>
                        <Switch
                          checked={formData.permite_animais}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permite_animais: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span>Missões</span>
                        </div>
                        <Switch
                          checked={formData.permite_missoes}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permite_missoes: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-green-600" />
                          <span>Grupos</span>
                        </div>
                        <Switch
                          checked={formData.permite_grupos}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permite_grupos: checked }))}
                        />
                      </div>
                    </div>

                    {/* Quantidades Máximas */}
                    <div className="space-y-3">
                      <Label>Quantidades Máximas (opcional)</Label>
                      
                      {formData.permite_voluntarios && (
                        <div>
                          <Label htmlFor="max_voluntario">Por Voluntário</Label>
                          <Input
                            id="max_voluntario"
                            type="number"
                            min="1"
                            placeholder="Sem limite"
                            value={formData.quantidade_maxima_por_voluntario}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantidade_maxima_por_voluntario: e.target.value }))}
                          />
                        </div>
                      )}
                      
                      {formData.permite_animais && (
                        <div>
                          <Label htmlFor="max_animal">Por Animal</Label>
                          <Input
                            id="max_animal"
                            type="number"
                            min="1"
                            placeholder="Sem limite"
                            value={formData.quantidade_maxima_por_animal}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantidade_maxima_por_animal: e.target.value }))}
                          />
                        </div>
                      )}
                      
                      {formData.permite_missoes && (
                        <div>
                          <Label htmlFor="max_missao">Por Missão</Label>
                          <Input
                            id="max_missao"
                            type="number"
                            min="1"
                            placeholder="Sem limite"
                            value={formData.quantidade_maxima_por_missao}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantidade_maxima_por_missao: e.target.value }))}
                          />
                        </div>
                      )}
                      
                      {formData.permite_grupos && (
                        <div>
                          <Label htmlFor="max_grupo">Por Grupo</Label>
                          <Input
                            id="max_grupo"
                            type="number"
                            min="1"
                            placeholder="Sem limite"
                            value={formData.quantidade_maxima_por_grupo}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantidade_maxima_por_grupo: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>

                    {/* Prazo de Devolução */}
                    <div>
                      <Label htmlFor="prazo">Prazo de Devolução (dias) *</Label>
                      <Input
                        id="prazo"
                        type="number"
                        min="1"
                        value={formData.prazo_devolucao_dias}
                        onChange={(e) => setFormData(prev => ({ ...prev, prazo_devolucao_dias: parseInt(e.target.value) || 30 }))}
                        required
                      />
                    </div>

                    {/* Outras Configurações */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Requer Verificação</span>
                        <Switch
                          checked={formData.requer_verificacao}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requer_verificacao: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Permite Consumo</span>
                        <Switch
                          checked={formData.permite_consumo}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permite_consumo: checked }))}
                        />
                      </div>
                    </div>

                    {/* Valor de Responsabilidade */}
                    <div>
                      <Label htmlFor="valor_responsabilidade">Valor de Responsabilidade Padrão (€)</Label>
                      <Input
                        id="valor_responsabilidade"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.valor_responsabilidade_padrao}
                        onChange={(e) => setFormData(prev => ({ ...prev, valor_responsabilidade_padrao: e.target.value }))}
                      />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-2 pt-4">
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
                            {editingConfig ? 'Atualizar' : 'Criar'}
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowNewForm(false);
                          setEditingConfig(null);
                          resetForm();
                        }}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default ConfiguracoesAtribuicoes;