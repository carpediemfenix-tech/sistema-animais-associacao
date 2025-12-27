import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Stethoscope, 
  Heart, 
  Scissors, 
  Syringe, 
  Pill, 
  Activity, 
  Shield, 
  Zap,
  Settings,
  CheckCircle,
  X,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface TipoIntervencao {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  icone: string;
  cor: string;
  custo_estimado: number;
  duracao_estimada: number;
  requer_anestesia: boolean;
  requer_internamento: boolean;
  ativo: boolean;
  created_at: string;
}

const ConfiguracaoIntervencoes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tiposIntervencao, setTiposIntervencao] = useState<TipoIntervencao[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoIntervencao | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: 'cirurgia',
    icone: '🏥',
    cor: '#3B82F6',
    custo_estimado: 0,
    duracao_estimada: 60,
    requer_anestesia: false,
    requer_internamento: false,
    ativo: true
  });

  const categorias = [
    { value: 'cirurgia', label: 'Cirurgia', icon: Scissors },
    { value: 'consulta', label: 'Consulta', icon: Stethoscope },
    { value: 'vacinacao', label: 'Vacinação', icon: Syringe },
    { value: 'tratamento', label: 'Tratamento', icon: Pill },
    { value: 'emergencia', label: 'Emergência', icon: Zap },
    { value: 'preventivo', label: 'Preventivo', icon: Shield },
    { value: 'diagnostico', label: 'Diagnóstico', icon: Activity }
  ];

  const icones = [
    '🏥', '💉', '🩺', '💊', '🔬', '🩹', '❤️', '🦷', '👁️', '🧬', 
    '⚡', '🛡️', '✂️', '🔍', '📊', '🎯', '⭐', '🔥', '💎', '🌟'
  ];

  const cores = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  useEffect(() => {
    fetchTiposIntervencao();
  }, []);

  const fetchTiposIntervencao = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando tipos de intervenção...');
      
      const { data, error } = await supabase
        .from('tipos_intervencoes')
        .select('*')
        .order('nome');

      if (error) {
        console.error('❌ Erro ao carregar tipos:', error);
        throw error;
      }

      console.log('✅ Tipos carregados:', data?.length || 0);
      setTiposIntervencao(data || []);
    } catch (error: any) {
      console.error('💥 Erro geral:', error);
      toast({
        title: "Erro ao carregar tipos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('💾 Salvando tipo de intervenção...', formData);
      
      if (editingTipo) {
        // Atualizar
        const { error } = await supabase
          .from('tipos_intervencoes')
          .update(formData)
          .eq('id', editingTipo.id);

        if (error) throw error;

        toast({
          title: "✅ Tipo atualizado",
          description: "Tipo de intervenção atualizado com sucesso",
        });
      } else {
        // Criar novo
        const { error } = await supabase
          .from('tipos_intervencoes')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "✅ Tipo criado",
          description: "Novo tipo de intervenção criado com sucesso",
        });
      }

      setDialogOpen(false);
      setEditingTipo(null);
      resetForm();
      fetchTiposIntervencao();
    } catch (error: any) {
      console.error('💥 Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tipo: TipoIntervencao) => {
    setEditingTipo(tipo);
    setFormData({
      nome: tipo.nome,
      descricao: tipo.descricao,
      categoria: tipo.categoria,
      icone: tipo.icone,
      cor: tipo.cor,
      custo_estimado: tipo.custo_estimado,
      duracao_estimada: tipo.duracao_estimada,
      requer_anestesia: tipo.requer_anestesia,
      requer_internamento: tipo.requer_internamento,
      ativo: tipo.ativo
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tipo de intervenção?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tipos_intervencoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Tipo excluído",
        description: "Tipo de intervenção excluído com sucesso",
      });

      fetchTiposIntervencao();
    } catch (error: any) {
      console.error('💥 Erro ao excluir:', error);
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: 'cirurgia',
      icone: '🏥',
      cor: '#3B82F6',
      custo_estimado: 0,
      duracao_estimada: 60,
      requer_anestesia: false,
      requer_internamento: false,
      ativo: true
    });
  };

  const openNewDialog = () => {
    setEditingTipo(null);
    resetForm();
    setDialogOpen(true);
  };

  const getCategoriaInfo = (categoria: string) => {
    return categorias.find(c => c.value === categoria) || categorias[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <div className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-blue-600" />
                <span className="hidden sm:inline">Configuração de Intervenções</span>
                <span className="sm:hidden">Intervenções</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                <span className="hidden sm:inline">Gerir tipos de intervenções médicas e veterinárias</span>
                <span className="sm:hidden">Tipos de intervenções médicas</span>
              </p>
            </div>
            <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tipo
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{tiposIntervencao.length}</p>
                </div>
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-xl sm:text-3xl font-bold text-green-600">
                    {tiposIntervencao.filter(t => t.ativo).length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Cirurgias</p>
                  <p className="text-xl sm:text-3xl font-bold text-red-600">
                    {tiposIntervencao.filter(t => t.categoria === 'cirurgia').length}
                  </p>
                </div>
                <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Consultas</p>
                  <p className="text-xl sm:text-3xl font-bold text-purple-600">
                    {tiposIntervencao.filter(t => t.categoria === 'consulta').length}
                  </p>
                </div>
                <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Tipos */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Intervenção ({tiposIntervencao.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando tipos...</p>
              </div>
            ) : tiposIntervencao.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum tipo encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece criando o primeiro tipo de intervenção
                </p>
                <Button onClick={openNewDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Tipo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tiposIntervencao.map((tipo) => {
                  const categoriaInfo = getCategoriaInfo(tipo.categoria);
                  const IconComponent = categoriaInfo.icon;
                  
                  return (
                    <Card key={tipo.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                              style={{ backgroundColor: tipo.cor }}
                            >
                              {tipo.icone}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{tipo.nome}</h3>
                              <Badge variant="outline" className="text-xs">
                                <IconComponent className="h-3 w-3 mr-1" />
                                {categoriaInfo.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(tipo)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(tipo.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{tipo.descricao}</p>
                        
                        <div className="space-y-2 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Custo estimado:</span>
                            <span className="font-medium">€{tipo.custo_estimado}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duração:</span>
                            <span className="font-medium">{tipo.duracao_estimada}min</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge variant={tipo.ativo ? "default" : "secondary"}>
                              {tipo.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </div>
                        
                        {(tipo.requer_anestesia || tipo.requer_internamento) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex flex-wrap gap-1">
                              {tipo.requer_anestesia && (
                                <Badge variant="outline" className="text-xs">
                                  Anestesia
                                </Badge>
                              )}
                              {tipo.requer_internamento && (
                                <Badge variant="outline" className="text-xs">
                                  Internamento
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Novo/Editar Tipo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTipo ? 'Editar Tipo de Intervenção' : 'Novo Tipo de Intervenção'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome da intervenção"
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => setFormData({...formData, categoria: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => {
                      const IconComponent = categoria.icon;
                      return (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          <div className="flex items-center">
                            <IconComponent className="h-4 w-4 mr-2" />
                            {categoria.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição detalhada da intervenção"
                rows={3}
              />
            </div>

            {/* Visual */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ícone</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {icones.map((icone) => (
                    <button
                      key={icone}
                      type="button"
                      className={`p-2 text-lg border rounded hover:bg-gray-50 ${
                        formData.icone === icone ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onClick={() => setFormData({...formData, icone})}
                    >
                      {icone}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Cor</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {cores.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      className={`w-8 h-8 rounded border-2 ${
                        formData.cor === cor ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: cor }}
                      onClick={() => setFormData({...formData, cor})}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Custos e Duração */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custo_estimado">Custo Estimado (€)</Label>
                <Input
                  id="custo_estimado"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.custo_estimado}
                  onChange={(e) => setFormData({...formData, custo_estimado: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="duracao_estimada">Duração Estimada (min)</Label>
                <Input
                  id="duracao_estimada"
                  type="number"
                  min="1"
                  value={formData.duracao_estimada}
                  onChange={(e) => setFormData({...formData, duracao_estimada: parseInt(e.target.value) || 60})}
                />
              </div>
            </div>

            {/* Opções */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requer Anestesia</Label>
                  <p className="text-sm text-gray-500">Intervenção necessita de anestesia</p>
                </div>
                <Switch
                  checked={formData.requer_anestesia}
                  onCheckedChange={(checked) => setFormData({...formData, requer_anestesia: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requer Internamento</Label>
                  <p className="text-sm text-gray-500">Animal precisa ficar internado</p>
                </div>
                <Switch
                  checked={formData.requer_internamento}
                  onCheckedChange={(checked) => setFormData({...formData, requer_internamento: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ativo</Label>
                  <p className="text-sm text-gray-500">Tipo disponível para uso</p>
                </div>
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingTipo ? 'Atualizar' : 'Criar'} Tipo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default ConfiguracaoIntervencoes;