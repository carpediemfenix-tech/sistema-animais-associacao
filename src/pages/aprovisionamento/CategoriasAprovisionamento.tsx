import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  Shield,
  Cookie,
  Pill,
  Wrench,
  FileText,
  Sparkles,
  Camera,
  Gift,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  tem_numero_serie: boolean;
  tem_validade: boolean;
  permite_devolucao: boolean;
  permite_atribuicao_animais: boolean;
  requer_verificacao: boolean;
  cor_interface: string;
  icone: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  total_tipos?: number;
}

const CategoriasAprovisionamento = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tem_numero_serie: false,
    tem_validade: false,
    permite_devolucao: true,
    permite_atribuicao_animais: false,
    requer_verificacao: false,
    cor_interface: '#3B82F6',
    icone: 'Package'
  });

  const iconOptions = [
    { value: 'Package', label: 'Package (Padrão)', icon: Package },
    { value: 'Shield', label: 'Shield (Proteção)', icon: Shield },
    { value: 'Cookie', label: 'Cookie (Alimentação)', icon: Cookie },
    { value: 'Pill', label: 'Pill (Medicação)', icon: Pill },
    { value: 'Wrench', label: 'Wrench (Ferramentas)', icon: Wrench },
    { value: 'FileText', label: 'FileText (Escritório)', icon: FileText },
    { value: 'Sparkles', label: 'Sparkles (Limpeza)', icon: Sparkles },
    { value: 'Camera', label: 'Camera (Eletrônicos)', icon: Camera },
    { value: 'Gift', label: 'Gift (Merchandising)', icon: Gift }
  ];

  const colorOptions = [
    { value: '#3B82F6', label: 'Azul', color: '#3B82F6' },
    { value: '#10B981', label: 'Verde', color: '#10B981' },
    { value: '#F59E0B', label: 'Amarelo', color: '#F59E0B' },
    { value: '#EF4444', label: 'Vermelho', color: '#EF4444' },
    { value: '#8B5CF6', label: 'Roxo', color: '#8B5CF6' },
    { value: '#6B7280', label: 'Cinza', color: '#6B7280' },
    { value: '#06B6D4', label: 'Ciano', color: '#06B6D4' },
    { value: '#EC4899', label: 'Rosa', color: '#EC4899' }
  ];

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('categorias_aprovisionamento_2026_01_06')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar categorias:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar categorias",
          variant: "destructive",
        });
        return;
      }

      // Carregar contagem de tipos para cada categoria
      const categoriasComContagem = await Promise.all(
        (data || []).map(async (categoria) => {
          const { count } = await supabase
            .from('tipos_aprovisionamento_2026_01_06')
            .select('*', { count: 'exact', head: true })
            .eq('categoria_id', categoria.id)
            .eq('ativo', true);
          
          return {
            ...categoria,
            total_tipos: count || 0
          };
        })
      );

      setCategorias(categoriasComContagem);

    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log('🔍 [CATEGORIAS] Iniciando salvamento...', { formData, editingId });
      
      if (!formData.nome.trim()) {
        toast({
          title: "Erro",
          description: "Nome da categoria é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (editingId) {
        // Atualizar categoria existente
        console.log('🔍 [CATEGORIAS] Atualizando categoria existente...', editingId);
        const { error } = await supabase
          .from('categorias_aprovisionamento_2026_01_06')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) {
          console.error('❌ [CATEGORIAS] Erro ao atualizar:', error);
          throw error;
        }

        console.log('✅ [CATEGORIAS] Categoria atualizada com sucesso');
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso",
        });
      } else {
        // Criar nova categoria
        console.log('🔍 [CATEGORIAS] Criando nova categoria...');
        const { data, error } = await supabase
          .from('categorias_aprovisionamento_2026_01_06')
          .insert([formData])
          .select();

        console.log('🔍 [CATEGORIAS] Resultado da inserção:', { data, error });

        if (error) {
          console.error('❌ [CATEGORIAS] Erro ao criar:', error);
          throw error;
        }

        console.log('✅ [CATEGORIAS] Categoria criada com sucesso');
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso",
        });
      }

      setEditingId(null);
      setShowNewForm(false);
      resetForm();
      loadCategorias();

    } catch (error: any) {
      console.error('❌ [CATEGORIAS] Erro ao salvar categoria:', error);
      
      let errorMessage = "Erro ao salvar categoria";
      
      if (error.code === 'PGRST116' || error.message?.includes('JWT')) {
        errorMessage = "Erro de autenticação. Faça login novamente.";
      } else if (error.code === '42501') {
        errorMessage = "Sem permissão para esta operação. Verifique as políticas RLS.";
      } else if (error.message) {
        errorMessage = `${error.code ? error.code + ': ' : ''}${error.message}`;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || '',
      tem_numero_serie: categoria.tem_numero_serie,
      tem_validade: categoria.tem_validade,
      permite_devolucao: categoria.permite_devolucao,
      permite_atribuicao_animais: categoria.permite_atribuicao_animais,
      requer_verificacao: categoria.requer_verificacao,
      cor_interface: categoria.cor_interface,
      icone: categoria.icone
    });
    setEditingId(categoria.id);
    setShowNewForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar esta categoria? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categorias_aprovisionamento_2026_01_06')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria apagada com sucesso",
      });

      loadCategorias();

    } catch (error: any) {
      console.error('Erro ao apagar categoria:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao apagar categoria",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('categorias_aprovisionamento_2026_01_06')
        .update({ 
          ativo: !ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Categoria ${!ativo ? 'ativada' : 'desativada'} com sucesso`,
      });

      loadCategorias();

    } catch (error: any) {
      console.error('Erro ao alterar estado da categoria:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar estado da categoria",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tem_numero_serie: false,
      tem_validade: false,
      permite_devolucao: true,
      permite_atribuicao_animais: false,
      requer_verificacao: false,
      cor_interface: '#3B82F6',
      icone: 'Package'
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNewForm(false);
    resetForm();
  };

  const getIconComponent = (iconName: string, className = "h-5 w-5") => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    if (iconOption) {
      const IconComponent = iconOption.icon;
      return <IconComponent className={className} />;
    }
    return <Package className={className} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          { label: 'Gestão de Categorias' }
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
                console.log('🔍 [CATEGORIAS] Botão Nova Categoria clicado');
                setShowNewForm(true);
                setEditingId(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        {/* Formulário de Nova Categoria ou Edição */}
        {(showNewForm || editingId) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Atualize as informações da categoria' : 'Preencha os dados da nova categoria'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome da Categoria *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Fardamento e EPI"
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição detalhada da categoria..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="icone">Ícone</Label>
                      <Select value={formData.icone} onValueChange={(value) => setFormData({ ...formData, icone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <option.icon className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cor">Cor</Label>
                      <Select value={formData.cor_interface} onValueChange={(value) => setFormData({ ...formData, cor_interface: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: option.color }}
                                />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Características da Categoria</Label>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="tem_numero_serie" className="text-sm font-medium">
                          Tem Número de Série
                        </Label>
                        <p className="text-xs text-gray-600">Itens desta categoria têm número de série único</p>
                      </div>
                      <Switch
                        id="tem_numero_serie"
                        checked={formData.tem_numero_serie}
                        onCheckedChange={(checked) => setFormData({ ...formData, tem_numero_serie: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="tem_validade" className="text-sm font-medium">
                          Tem Validade
                        </Label>
                        <p className="text-xs text-gray-600">Itens desta categoria têm data de validade</p>
                      </div>
                      <Switch
                        id="tem_validade"
                        checked={formData.tem_validade}
                        onCheckedChange={(checked) => setFormData({ ...formData, tem_validade: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="permite_devolucao" className="text-sm font-medium">
                          Permite Devolução
                        </Label>
                        <p className="text-xs text-gray-600">Itens podem ser devolvidos após uso</p>
                      </div>
                      <Switch
                        id="permite_devolucao"
                        checked={formData.permite_devolucao}
                        onCheckedChange={(checked) => setFormData({ ...formData, permite_devolucao: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="permite_atribuicao_animais" className="text-sm font-medium">
                          Permite Atribuição a Animais
                        </Label>
                        <p className="text-xs text-gray-600">Itens podem ser atribuídos a animais</p>
                      </div>
                      <Switch
                        id="permite_atribuicao_animais"
                        checked={formData.permite_atribuicao_animais}
                        onCheckedChange={(checked) => setFormData({ ...formData, permite_atribuicao_animais: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requer_verificacao" className="text-sm font-medium">
                          Requer Verificação
                        </Label>
                        <p className="text-xs text-gray-600">Itens devolvidos precisam de verificação</p>
                      </div>
                      <Switch
                        id="requer_verificacao"
                        checked={formData.requer_verificacao}
                        onCheckedChange={(checked) => setFormData({ ...formData, requer_verificacao: checked })}
                      />
                    </div>
                  </div>

                  {/* Preview da Categoria */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <Label className="text-sm font-medium mb-2 block">Preview</Label>
                    <div 
                      className="border-l-4 bg-white p-3 rounded"
                      style={{ borderLeftColor: formData.cor_interface }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${formData.cor_interface}20` }}
                        >
                          <div style={{ color: formData.cor_interface }}>
                            {getIconComponent(formData.icone)}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold">{formData.nome || 'Nome da Categoria'}</h4>
                          <p className="text-sm text-gray-600">{formData.descricao || 'Descrição da categoria'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Atualizar' : 'Criar'} Categoria
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Categorias */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Categorias Existentes ({categorias.length})
                </CardTitle>
                <CardDescription>
                  Gerir todas as categorias de aprovisionamento
                </CardDescription>
              </div>
              <Button 
                onClick={() => {
                  console.log('🔍 [CATEGORIAS] Botão alternativo Nova Categoria clicado');
                  setShowNewForm(true);
                  setEditingId(null);
                  resetForm();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {categorias.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma categoria encontrada
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece por criar a primeira categoria de aprovisionamento
                </p>
                <Button onClick={() => setShowNewForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Categoria
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {categorias.map((categoria) => (
                  <div 
                    key={categoria.id}
                    className={`border rounded-lg p-4 ${categoria.ativo ? 'bg-white' : 'bg-gray-50 opacity-75'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: `${categoria.cor_interface}20` }}
                        >
                          <div style={{ color: categoria.cor_interface }}>
                            {getIconComponent(categoria.icone, "h-6 w-6")}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{categoria.nome}</h3>
                            {categoria.ativo ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Inativo
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {categoria.total_tipos || 0} tipos
                            </Badge>
                          </div>
                          
                          {categoria.descricao && (
                            <p className="text-gray-600 mb-2">{categoria.descricao}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-1">
                            {categoria.tem_numero_serie && (
                              <Badge variant="outline" className="text-xs">Nº Série</Badge>
                            )}
                            {categoria.tem_validade && (
                              <Badge variant="outline" className="text-xs">Validade</Badge>
                            )}
                            {categoria.permite_devolucao && (
                              <Badge variant="outline" className="text-xs">Devolução</Badge>
                            )}
                            {categoria.permite_atribuicao_animais && (
                              <Badge variant="outline" className="text-xs">Animais</Badge>
                            )}
                            {categoria.requer_verificacao && (
                              <Badge variant="outline" className="text-xs">Verificação</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/aprovisionamento/tipos?categoria=${categoria.id}`)}
                        >
                          Ver Tipos ({categoria.total_tipos || 0})
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(categoria)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(categoria.id, categoria.ativo)}
                        >
                          {categoria.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(categoria.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default CategoriasAprovisionamento;