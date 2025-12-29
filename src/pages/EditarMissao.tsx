import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Save,
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  User,
  AlertCircle,
  Loader2,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interface para missão
interface Missao {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  data_inicio: string;
  data_fim: string;
  local_principal: string;
  orcamento_previsto: number;
  orcamento_gasto: number;
  responsavel_id: string;
  observacoes: string;
}

const EditarMissao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [missao, setMissao] = useState<Missao | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    codigo: '',
    titulo: '',
    descricao: '',
    status: 'rascunho',
    prioridade: 'media',
    data_inicio: '',
    data_fim: '',
    local_principal: '',
    orcamento_previsto: '',
    responsavel_id: '',
    observacoes: ''
  });

  useEffect(() => {
    if (id) {
      loadMissao();
    } else {
      setError('ID da missão não encontrado');
      setLoading(false);
    }
  }, [id]);

  const loadMissao = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('missoes_2025_12_29_07_00')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setMissao(data);
      
      // Preencher formulário com dados da missão
      setFormData({
        codigo: data.codigo || '',
        titulo: data.titulo || '',
        descricao: data.descricao || '',
        status: data.status || 'rascunho',
        prioridade: data.prioridade || 'media',
        data_inicio: data.data_inicio ? data.data_inicio.split('T')[0] : '',
        data_fim: data.data_fim ? data.data_fim.split('T')[0] : '',
        local_principal: data.local_principal || '',
        orcamento_previsto: data.orcamento_previsto?.toString() || '',
        responsavel_id: data.responsavel_id || '',
        observacoes: data.observacoes || ''
      });
    } catch (error: any) {
      console.error('❌ Erro ao carregar missão:', error);
      setError(error.message || 'Erro ao carregar missão');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validações básicas
      if (!formData.titulo.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "O título da missão é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!formData.data_inicio) {
        toast({
          title: "Campo obrigatório",
          description: "A data de início é obrigatória",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para atualização
      const updateData = {
        codigo: formData.codigo.trim(),
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        status: formData.status,
        prioridade: formData.prioridade,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim || null,
        local_principal: formData.local_principal.trim(),
        orcamento_previsto: formData.orcamento_previsto ? parseFloat(formData.orcamento_previsto) : 0,
        responsavel_id: formData.responsavel_id.trim() || null,
        observacoes: formData.observacoes.trim(),
        updated_at: new Date().toISOString(),
        updated_by: 'admin'
      };

      const { error } = await supabase
        .from('missoes_2025_12_29_07_00')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Missão atualizada",
        description: "A missão foi atualizada com sucesso!",
      });

      // Redirecionar para a página de detalhes
      navigate(`/missao/${id}`);
    } catch (error: any) {
      console.error('❌ Erro ao salvar missão:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro inesperado ao salvar a missão",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Carregando dados da missão...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  if (error || !missao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Erro ao carregar missão
                </h3>
                <p className="text-gray-600 mb-4">
                  {error || 'Missão não encontrada'}
                </p>
                <Button onClick={() => navigate('/modulo-missoes')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar às Missões
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <PageActionBar
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Módulo de Missões', href: '/modulo-missoes' },
            { label: 'Detalhes da Missão', href: `/missao/${id}` },
            { label: 'Editar Missão' }
          ]}
          primaryActions={
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/missao/${id}`)}
                disabled={saving}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </>
          }
          secondaryActions={[
            {
              label: 'Voltar ao Dashboard',
              onClick: () => navigate('/dashboard'),
              icon: <Home className="h-4 w-4" />
            }
          ]}
          showBackToDashboard={false}
        />

        {/* Título da Página */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Editar Missão
          </h1>
          <p className="text-gray-600">
            Atualize as informações da missão "{missao.titulo}"
          </p>
        </div>

        {/* Formulário de Edição */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Básicas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais da missão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código da Missão</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    placeholder="Ex: MISS-2024-001"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="planejada">Planejada</SelectItem>
                      <SelectItem value="ativa">Ativa</SelectItem>
                      <SelectItem value="pausada">Pausada</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="titulo">Título da Missão *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  placeholder="Digite o título da missão"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descreva os objetivos e detalhes da missão"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => handleInputChange('data_fim', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="local_principal">Local Principal</Label>
                <Input
                  id="local_principal"
                  value={formData.local_principal}
                  onChange={(e) => handleInputChange('local_principal', e.target.value)}
                  placeholder="Local onde a missão será realizada"
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais sobre a missão"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações Avançadas */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Prioridade, orçamento e responsável
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={formData.prioridade} onValueChange={(value) => handleInputChange('prioridade', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="orcamento_previsto">Orçamento Previsto (€)</Label>
                <Input
                  id="orcamento_previsto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.orcamento_previsto}
                  onChange={(e) => handleInputChange('orcamento_previsto', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="responsavel_id">Responsável</Label>
                <Input
                  id="responsavel_id"
                  value={formData.responsavel_id}
                  onChange={(e) => handleInputChange('responsavel_id', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>

              {/* Informações da Missão Original */}
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Informações da Missão</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-mono text-xs">{missao.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Criada em:</span>
                    <span>{new Date(missao.created_at).toLocaleDateString('pt-PT')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última atualização:</span>
                    <span>{new Date(missao.updated_at).toLocaleDateString('pt-PT')}</span>
                  </div>
                  {missao.orcamento_gasto > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gasto atual:</span>
                      <span className="text-red-600">€{missao.orcamento_gasto.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default EditarMissao;