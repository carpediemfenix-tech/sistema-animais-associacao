import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PageActionBar from '@/components/PageActionBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Save, 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Edit,
  History,
  User
} from 'lucide-react';

interface Denuncia {
  id: string;
  codigo: string;
  data_denuncia: string;
  local_encontrado: string;
  local_completo: string;
  descricao_situacao: string;
  status_denuncia: string;
  prioridade: string;
  quantidade_animais: number;
  canal_denuncia: string;
  denunciante_anonimo: boolean;
  denunciante_nome?: string;
  denunciante_contato?: string;
  observacoes_gestao?: string;
  responsavel_gestao_id?: string;
}

const EditarDenuncia: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    local_encontrado: '',
    local_completo: '',
    descricao_situacao: '',
    status_denuncia: '',
    prioridade: '',
    quantidade_animais: 0,
    observacoes_gestao: '',
    responsavel_gestao_id: ''
  });

  // Verificar permissões
  useEffect(() => {
    if (!hasPermission('admin')) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem editar denúncias.",
        variant: "destructive",
      });
      navigate('/modulo-denuncias');
      return;
    }
  }, [hasPermission, navigate]);

  // Carregar denúncia
  useEffect(() => {
    if (codigo && hasPermission('admin')) {
      loadDenuncia();
    }
  }, [codigo, hasPermission]);

  const loadDenuncia = async () => {
    try {
      console.log('🔍 [EDITAR] Carregando denúncia:', codigo);
      
      const { data, error } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .select('*')
        .eq('codigo', codigo)
        .single();

      if (error) {
        console.error('❌ [EDITAR] Erro ao carregar:', error);
        throw error;
      }

      console.log('✅ [EDITAR] Denúncia carregada:', data);
      setDenuncia(data);
      
      // Preencher formulário
      setFormData({
        local_encontrado: data.local_encontrado || '',
        local_completo: data.local_completo || '',
        descricao_situacao: data.descricao_situacao || '',
        status_denuncia: data.status_denuncia || 'nova',
        prioridade: data.prioridade || 'normal',
        quantidade_animais: data.quantidade_animais || 0,
        observacoes_gestao: data.observacoes_gestao || '',
        responsavel_gestao_id: data.responsavel_gestao_id || user?.id || ''
      });
    } catch (error) {
      console.error('❌ [EDITAR] Erro:', error);
      toast({
        title: "Erro ao carregar denúncia",
        description: "Não foi possível carregar os dados da denúncia.",
        variant: "destructive",
      });
      navigate('/modulo-denuncias');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!denuncia) return;

    try {
      setSaving(true);
      console.log('💾 [EDITAR] Salvando alterações...');

      // Verificar se o status mudou para criar histórico
      const statusMudou = formData.status_denuncia !== denuncia.status_denuncia;

      // Atualizar denúncia
      const { error: updateError } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .update({
          local_encontrado: formData.local_encontrado,
          local_completo: formData.local_completo,
          descricao_situacao: formData.descricao_situacao,
          status_denuncia: formData.status_denuncia,
          prioridade: formData.prioridade,
          quantidade_animais: formData.quantidade_animais,
          observacoes_gestao: formData.observacoes_gestao,
          responsavel_gestao_id: formData.responsavel_gestao_id,
          updated_by: user?.id
        })
        .eq('id', denuncia.id);

      if (updateError) {
        console.error('❌ [EDITAR] Erro ao atualizar:', updateError);
        throw updateError;
      }

      // Criar histórico se status mudou
      if (statusMudou) {
        console.log('📝 [EDITAR] Criando histórico de status...');
        
        const { error: historicoError } = await supabase
          .from('historico_denuncias_2025_12_31_02_00')
          .insert([{
            denuncia_id: denuncia.id,
            status_anterior: denuncia.status_denuncia,
            status_novo: formData.status_denuncia,
            observacoes: `Status alterado via edição. ${formData.observacoes_gestao ? 'Observações: ' + formData.observacoes_gestao : ''}`,
            alterado_por: user?.id
          }]);

        if (historicoError) {
          console.error('⚠️ [EDITAR] Erro ao criar histórico:', historicoError);
          // Não falhar por causa do histórico
        }
      }

      console.log('✅ [EDITAR] Denúncia atualizada com sucesso');
      
      toast({
        title: "Denúncia atualizada",
        description: "As alterações foram salvas com sucesso.",
        variant: "default",
      });

      // Voltar para detalhes
      navigate(`/denuncia/${codigo}`);
    } catch (error) {
      console.error('❌ [EDITAR] Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/denuncia/${codigo}`);
  };

  // Componentes de status
  const getStatusIcon = (status: string) => {
    const icons = {
      'nova': AlertTriangle,
      'em_andamento': Clock,
      'concluida': CheckCircle
    };
    return icons[status as keyof typeof icons] || AlertTriangle;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando denúncia...</p>
        </div>
      </div>
    );
  }

  if (!denuncia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Denúncia não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <PageActionBar
        title={`Editar Denúncia ${denuncia.codigo}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Denúncias', href: '/modulo-denuncias' },
          { label: denuncia.codigo, href: `/denuncia/${codigo}` },
          { label: 'Editar', href: `/denuncia/${codigo}/editar` }
        ]}
        primaryActions={[
          {
            label: 'Salvar',
            onClick: handleSave,
            icon: Save,
            variant: 'default',
            disabled: saving
          },
          {
            label: 'Cancelar',
            onClick: handleCancel,
            icon: X,
            variant: 'outline'
          }
        ]}
        secondaryActions={[
          {
            label: 'Ver Detalhes',
            onClick: () => navigate(`/denuncia/${codigo}`),
            icon: History
          }
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Edit className="h-8 w-8 text-red-600" />
            Editar Denúncia {denuncia.codigo}
          </h1>
          <p className="text-gray-600">Altere as informações da denúncia e gerencie seu status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Informações da Denúncia
                </CardTitle>
                <CardDescription>
                  Dados principais da ocorrência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="local_encontrado">Local Encontrado *</Label>
                    <Input
                      id="local_encontrado"
                      value={formData.local_encontrado}
                      onChange={(e) => setFormData(prev => ({ ...prev, local_encontrado: e.target.value }))}
                      placeholder="Local onde os animais foram encontrados"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quantidade_animais">Quantidade de Animais *</Label>
                    <Input
                      id="quantidade_animais"
                      type="number"
                      min="1"
                      value={formData.quantidade_animais}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantidade_animais: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="local_completo">Endereço Completo</Label>
                  <Input
                    id="local_completo"
                    value={formData.local_completo}
                    onChange={(e) => setFormData(prev => ({ ...prev, local_completo: e.target.value }))}
                    placeholder="Endereço completo e detalhado"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao_situacao">Descrição da Situação *</Label>
                  <Textarea
                    id="descricao_situacao"
                    value={formData.descricao_situacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao_situacao: e.target.value }))}
                    placeholder="Descreva detalhadamente a situação encontrada"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gestão e Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Gestão e Acompanhamento
                </CardTitle>
                <CardDescription>
                  Status e observações de gestão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status_denuncia">Status da Denúncia *</Label>
                    <Select 
                      value={formData.status_denuncia} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status_denuncia: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nova">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            Nova
                          </div>
                        </SelectItem>
                        <SelectItem value="em_andamento">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            Em Andamento
                          </div>
                        </SelectItem>
                        <SelectItem value="concluida">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Concluída
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select 
                      value={formData.prioridade} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes_gestao">Observações de Gestão</Label>
                  <Textarea
                    id="observacoes_gestao"
                    value={formData.observacoes_gestao}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes_gestao: e.target.value }))}
                    placeholder="Observações internas sobre o acompanhamento da denúncia"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Informações */}
          <div className="space-y-6">
            {/* Informações da Denúncia */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações da Denúncia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Código:</span>
                  <div className="text-lg font-bold text-red-600">{denuncia.codigo}</div>
                </div>
                <div>
                  <span className="font-medium">Data:</span>
                  <div>{new Date(denuncia.data_denuncia).toLocaleDateString('pt-PT')}</div>
                </div>
                <div>
                  <span className="font-medium">Canal:</span>
                  <div className="capitalize">{denuncia.canal_denuncia}</div>
                </div>
                <div>
                  <span className="font-medium">Denunciante:</span>
                  <div>{denuncia.denunciante_anonimo ? 'Anônimo' : denuncia.denunciante_nome || 'Não informado'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Status Atual */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {React.createElement(getStatusIcon(denuncia.status_denuncia), { 
                    className: "h-6 w-6 text-gray-600" 
                  })}
                  <div>
                    <div className="font-medium capitalize">{denuncia.status_denuncia.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-500">Status atual</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/denuncia/${codigo}`)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Ver Histórico
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => toast({ title: 'Em desenvolvimento', description: 'Funcionalidade em desenvolvimento.' })}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditarDenuncia;