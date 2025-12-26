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
  Shield, 
  Heart, 
  Brain, 
  Truck, 
  Calendar, 
  Camera, 
  Share, 
  FileText, 
  DollarSign, 
  BookOpen,
  Star,
  Award,
  Settings,
  CheckCircle,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface Especialidade {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: string;
  cor: string;
  icone: string;
  pontos_bonus: number;
  requer_certificacao: boolean;
  ativo: boolean;
  created_at: string;
}

const iconOptions = [
  { value: 'Shield', label: 'Escudo', icon: Shield },
  { value: 'Heart', label: 'Coração', icon: Heart },
  { value: 'Brain', label: 'Cérebro', icon: Brain },
  { value: 'Truck', label: 'Camião', icon: Truck },
  { value: 'Calendar', label: 'Calendário', icon: Calendar },
  { value: 'Camera', label: 'Câmara', icon: Camera },
  { value: 'Share', label: 'Partilhar', icon: Share },
  { value: 'FileText', label: 'Documento', icon: FileText },
  { value: 'DollarSign', label: 'Dinheiro', icon: DollarSign },
  { value: 'BookOpen', label: 'Livro', icon: BookOpen },
  { value: 'Star', label: 'Estrela', icon: Star },
  { value: 'Award', label: 'Prémio', icon: Award }
];

const corOptions = [
  { value: 'red', label: 'Vermelho', class: 'bg-red-100 text-red-800' },
  { value: 'green', label: 'Verde', class: 'bg-green-100 text-green-800' },
  { value: 'blue', label: 'Azul', class: 'bg-blue-100 text-blue-800' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-100 text-purple-800' },
  { value: 'yellow', label: 'Amarelo', class: 'bg-yellow-100 text-yellow-800' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-100 text-pink-800' },
  { value: 'cyan', label: 'Ciano', class: 'bg-cyan-100 text-cyan-800' },
  { value: 'gray', label: 'Cinzento', class: 'bg-gray-100 text-gray-800' },
  { value: 'orange', label: 'Laranja', class: 'bg-orange-100 text-orange-800' }
];

const categoriaOptions = [
  { value: 'resgate', label: 'Resgate' },
  { value: 'saude', label: 'Saúde' },
  { value: 'comportamento', label: 'Comportamento' },
  { value: 'logistica', label: 'Logística' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'admin', label: 'Administração' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'educacao', label: 'Educação' },
  { value: 'geral', label: 'Geral' }
];

const ConfiguracaoEspecialidades = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    categoria: 'geral',
    cor: 'blue',
    icone: 'Star',
    pontos_bonus: 0,
    requer_certificacao: false,
    ativo: true
  });

  useEffect(() => {
    loadEspecialidades();
  }, []);

  const loadEspecialidades = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('especialidades_voluntarios_2025_12_21_22_00')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      
      setEspecialidades(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar especialidades:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar especialidades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.codigo || !formData.nome) {
      toast({
        title: "Erro",
        description: "Código e nome são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        // Atualizar
        const { error } = await supabase
          .from('especialidades_voluntarios_2025_12_21_22_00')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Especialidade atualizada com sucesso",
        });
      } else {
        // Criar nova
        const { error } = await supabase
          .from('especialidades_voluntarios_2025_12_21_22_00')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Especialidade criada com sucesso",
        });
      }

      setDialogOpen(false);
      resetForm();
      await loadEspecialidades();
    } catch (error: any) {
      console.error('Erro ao salvar especialidade:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar especialidade",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (especialidade: Especialidade) => {
    setFormData({
      codigo: especialidade.codigo,
      nome: especialidade.nome,
      descricao: especialidade.descricao || '',
      categoria: especialidade.categoria,
      cor: especialidade.cor,
      icone: especialidade.icone,
      pontos_bonus: especialidade.pontos_bonus,
      requer_certificacao: especialidade.requer_certificacao,
      ativo: especialidade.ativo
    });
    setEditingId(especialidade.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta especialidade?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('especialidades_voluntarios_2025_12_21_22_00')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Especialidade excluída com sucesso",
      });

      await loadEspecialidades();
    } catch (error: any) {
      console.error('Erro ao excluir especialidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir especialidade",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nome: '',
      descricao: '',
      categoria: 'geral',
      cor: 'blue',
      icone: 'Star',
      pontos_bonus: 0,
      requer_certificacao: false,
      ativo: true
    });
    setEditingId(null);
  };

  const getIcon = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    if (iconOption) {
      const IconComponent = iconOption.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Star className="h-4 w-4" />;
  };

  const getCor = (corName: string) => {
    const corOption = corOptions.find(opt => opt.value === corName);
    return corOption?.class || 'bg-gray-100 text-gray-800';
  };

  const getCategoria = (categoriaValue: string) => {
    const categoria = categoriaOptions.find(opt => opt.value === categoriaValue);
    return categoria?.label || categoriaValue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar especialidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/modulo-voluntarios')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Módulo
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuração de Especialidades</h1>
              <p className="text-gray-600">Gerir especialidades e competências dos voluntários</p>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Especialidade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar Especialidade' : 'Nova Especialidade'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Código *</Label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Ex: resgate_emergencia"
                  />
                </div>
                
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Resgate de Emergência"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição da especialidade..."
                  />
                </div>
                
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriaOptions.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Cor</Label>
                  <Select
                    value={formData.cor}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cor: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {corOptions.map((cor) => (
                        <SelectItem key={cor.value} value={cor.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded ${cor.class}`}></div>
                            <span>{cor.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Ícone</Label>
                  <Select
                    value={formData.icone}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, icone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center space-x-2">
                            <icon.icon className="h-4 w-4" />
                            <span>{icon.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Pontos Bónus</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.pontos_bonus}
                    onChange={(e) => setFormData(prev => ({ ...prev, pontos_bonus: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.requer_certificacao}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requer_certificacao: checked }))}
                  />
                  <Label>Requer Certificação</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? "Salvando..." : (editingId ? "Atualizar" : "Criar")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Especialidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {especialidades.map((especialidade) => (
            <Card key={especialidade.id} className={!especialidade.ativo ? 'opacity-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={`${getCor(especialidade.cor)} border`}>
                    {getIcon(especialidade.icone)}
                    <span className="ml-2">{especialidade.nome}</span>
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(especialidade)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(especialidade.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{especialidade.descricao}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline">
                      {getCategoria(especialidade.categoria)}
                    </Badge>
                    {especialidade.pontos_bonus > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        +{especialidade.pontos_bonus} pts
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs">
                    {especialidade.requer_certificacao && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Certificação</span>
                      </div>
                    )}
                    {!especialidade.ativo && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <X className="h-3 w-3" />
                        <span>Inativo</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {especialidades.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma especialidade configurada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando especialidades para os seus voluntários
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Especialidade
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default ConfiguracaoEspecialidades;