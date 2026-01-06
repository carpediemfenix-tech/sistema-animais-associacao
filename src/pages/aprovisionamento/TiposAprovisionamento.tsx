import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  Package,
  CheckCircle,
  AlertCircle,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";

interface Categoria {
  id: string;
  nome: string;
  cor_interface: string;
  icone: string;
}

interface Tipo {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string;
  unidade_medida: string;
  dias_alerta_validade: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  categoria?: Categoria;
}

const TiposAprovisionamento = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedCategoriaFilter, setSelectedCategoriaFilter] = useState<string>(searchParams.get('categoria') || 'all');
  const [formData, setFormData] = useState({
    categoria_id: searchParams.get('categoria') || '',
    nome: '',
    descricao: '',
    unidade_medida: 'unidades',
    dias_alerta_validade: 30
  });

  const unidadesMedida = [
    'unidades', 'kg', 'litros', 'metros', 'pares', 'pacotes', 'caixas', 
    'frascos', 'comprimidos', 'doses', 'latas', 'resmas', 'rolos', 'folhas'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias_aprovisionamento_2026_01_06')
        .select('id, nome, cor_interface, icone')
        .eq('ativo', true)
        .order('nome');

      if (categoriasError) {
        console.error('Erro ao carregar categorias:', categoriasError);
        toast({
          title: "Erro",
          description: "Erro ao carregar categorias",
          variant: "destructive",
        });
        return;
      }

      setCategorias(categoriasData || []);

      // Carregar tipos
      let tiposQuery = supabase
        .from('tipos_aprovisionamento_2026_01_06')
        .select(`
          *,
          categoria:categorias_aprovisionamento_2026_01_06(id, nome, cor_interface, icone)
        `)
        .order('nome');

      // Filtrar por categoria se especificado
      if (selectedCategoriaFilter !== 'all') {
        tiposQuery = tiposQuery.eq('categoria_id', selectedCategoriaFilter);
      }

      const { data: tiposData, error: tiposError } = await tiposQuery;

      if (tiposError) {
        console.error('Erro ao carregar tipos:', tiposError);
        toast({
          title: "Erro",
          description: "Erro ao carregar tipos",
          variant: "destructive",
        });
        return;
      }

      setTipos(tiposData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.nome.trim()) {
        toast({
          title: "Erro",
          description: "Nome do tipo é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!formData.categoria_id) {
        toast({
          title: "Erro",
          description: "Categoria é obrigatória",
          variant: "destructive",
        });
        return;
      }

      if (editingId) {
        // Atualizar tipo existente
        const { error } = await supabase
          .from('tipos_aprovisionamento_2026_01_06')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tipo atualizado com sucesso",
        });
      } else {
        // Criar novo tipo
        const { error } = await supabase
          .from('tipos_aprovisionamento_2026_01_06')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tipo criado com sucesso",
        });
      }

      setEditingId(null);
      setShowNewForm(false);
      resetForm();
      loadData();

    } catch (error: any) {
      console.error('Erro ao salvar tipo:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar tipo",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tipo: Tipo) => {
    setFormData({
      categoria_id: tipo.categoria_id,
      nome: tipo.nome,
      descricao: tipo.descricao || '',
      unidade_medida: tipo.unidade_medida,
      dias_alerta_validade: tipo.dias_alerta_validade
    });
    setEditingId(tipo.id);
    setShowNewForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar este tipo? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tipos_aprovisionamento_2026_01_06')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tipo apagado com sucesso",
      });

      loadData();

    } catch (error: any) {
      console.error('Erro ao apagar tipo:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao apagar tipo",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('tipos_aprovisionamento_2026_01_06')
        .update({ 
          ativo: !ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Tipo ${!ativo ? 'ativado' : 'desativado'} com sucesso`,
      });

      loadData();

    } catch (error: any) {
      console.error('Erro ao alterar estado do tipo:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar estado do tipo",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      categoria_id: selectedCategoriaFilter !== 'all' ? selectedCategoriaFilter : '',
      nome: '',
      descricao: '',
      unidade_medida: 'unidades',
      dias_alerta_validade: 30
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNewForm(false);
    resetForm();
  };

  const handleCategoriaFilterChange = (categoriaId: string) => {
    setSelectedCategoriaFilter(categoriaId);
    if (categoriaId !== 'all') {
      navigate(`/aprovisionamento/tipos?categoria=${categoriaId}`, { replace: true });
    } else {
      navigate('/aprovisionamento/tipos', { replace: true });
    }
    loadData();
  };

  const filteredTipos = selectedCategoriaFilter === 'all' 
    ? tipos 
    : tipos.filter(tipo => tipo.categoria_id === selectedCategoriaFilter);

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
        title="Gestão de Tipos"
        subtitle="Configurar tipos específicos por categoria"
        actions={[
          {
            label: "Voltar ao Dashboard",
            onClick: () => navigate('/aprovisionamento'),
            variant: "outline" as const,
            icon: ArrowLeft
          },
          {
            label: "Novo Tipo",
            onClick: () => {
              setShowNewForm(true);
              setEditingId(null);
              resetForm();
            },
            variant: "default" as const,
            icon: Plus
          }
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Filtro por Categoria */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <Label>Filtrar por Categoria:</Label>
              <Select value={selectedCategoriaFilter} onValueChange={handleCategoriaFilterChange}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {filteredTipos.length} tipos encontrados
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Novo Tipo ou Edição */}
        {(showNewForm || editingId) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingId ? 'Editar Tipo' : 'Novo Tipo'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Atualize as informações do tipo' : 'Preencha os dados do novo tipo'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoria_id">Categoria *</Label>
                    <Select value={formData.categoria_id} onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nome">Nome do Tipo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Ração Cão Adulto"
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição detalhada do tipo..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="unidade_medida">Unidade de Medida</Label>
                    <Select value={formData.unidade_medida} onValueChange={(value) => setFormData({ ...formData, unidade_medida: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unidadesMedida.map((unidade) => (
                          <SelectItem key={unidade} value={unidade}>
                            {unidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dias_alerta_validade">Dias de Alerta de Validade</Label>
                    <Input
                      id="dias_alerta_validade"
                      type="number"
                      min="0"
                      value={formData.dias_alerta_validade}
                      onChange={(e) => setFormData({ ...formData, dias_alerta_validade: parseInt(e.target.value) || 0 })}
                      placeholder="30"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Quantos dias antes da validade deve alertar (0 = sem alerta)
                    </p>
                  </div>

                  {/* Preview do Tipo */}
                  {formData.categoria_id && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <Label className="text-sm font-medium mb-2 block">Preview</Label>
                      {(() => {
                        const categoria = categorias.find(c => c.id === formData.categoria_id);
                        return categoria ? (
                          <div 
                            className="border-l-4 bg-white p-3 rounded"
                            style={{ borderLeftColor: categoria.cor_interface }}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${categoria.cor_interface}20` }}
                              >
                                <Package className="h-4 w-4" style={{ color: categoria.cor_interface }} />
                              </div>
                              <div>
                                <h4 className="font-semibold">{formData.nome || 'Nome do Tipo'}</h4>
                                <p className="text-sm text-gray-600">{categoria.nome}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {formData.unidade_medida}
                                  </Badge>
                                  {formData.dias_alerta_validade > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      Alerta: {formData.dias_alerta_validade} dias
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Atualizar' : 'Criar'} Tipo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Tipos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tipos Existentes ({filteredTipos.length})
            </CardTitle>
            <CardDescription>
              Gerir todos os tipos de aprovisionamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTipos.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum tipo encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedCategoriaFilter === 'all' 
                    ? 'Comece por criar o primeiro tipo de aprovisionamento'
                    : 'Nenhum tipo encontrado para a categoria selecionada'
                  }
                </p>
                <Button onClick={() => setShowNewForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Tipo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTipos.map((tipo) => (
                  <div 
                    key={tipo.id}
                    className={`border rounded-lg p-4 ${tipo.ativo ? 'bg-white' : 'bg-gray-50 opacity-75'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {tipo.categoria && (
                          <div 
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: `${tipo.categoria.cor_interface}20` }}
                          >
                            <Package className="h-5 w-5" style={{ color: tipo.categoria.cor_interface }} />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{tipo.nome}</h3>
                            {tipo.ativo ? (
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
                          </div>
                          
                          {tipo.categoria && (
                            <p className="text-sm text-gray-600 mb-1">
                              Categoria: <span className="font-medium">{tipo.categoria.nome}</span>
                            </p>
                          )}
                          
                          {tipo.descricao && (
                            <p className="text-gray-600 mb-2">{tipo.descricao}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {tipo.unidade_medida}
                            </Badge>
                            {tipo.dias_alerta_validade > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Alerta: {tipo.dias_alerta_validade} dias
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tipo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(tipo.id, tipo.ativo)}
                        >
                          {tipo.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tipo.id)}
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

export default TiposAprovisionamento;