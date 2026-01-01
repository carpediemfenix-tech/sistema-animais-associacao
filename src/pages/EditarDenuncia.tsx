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
  User,
  ArrowLeft
} from 'lucide-react';

interface Denuncia {
  id: string;
  codigo: string;
  data_denuncia: string;
  local_encontrado: string;
  local_completo?: string;
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
    observacoes_gestao: ''
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
        observacoes_gestao: data.observacoes_gestao || ''
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

    // Validações básicas
    if (!formData.local_encontrado.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o local encontrado.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.descricao_situacao.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha a descrição da situação.",
        variant: "destructive",
      });
      return;
    }

    // Validar status
    const statusValidos = ['nova', 'em_andamento', 'concluida'];
    if (!statusValidos.includes(formData.status_denuncia)) {
      toast({
        title: "Status inválido",
        description: "Por favor, selecione um status válido.",
        variant: "destructive",
      });
      return;
    }

    // Validar prioridade
    const prioridadesValidas = ['baixa', 'normal', 'alta', 'urgente'];
    if (!prioridadesValidas.includes(formData.prioridade)) {
      toast({
        title: "Prioridade inválida",
        description: "Por favor, selecione uma prioridade válida.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      console.log('💾 [EDITAR] Salvando alterações...');
      console.log('📝 [EDITAR] Dados a serem salvos:', {
        local_encontrado: formData.local_encontrado,
        local_completo: formData.local_completo || null,
        descricao_situacao: formData.descricao_situacao,
        status_denuncia: formData.status_denuncia,
        prioridade: formData.prioridade,
        quantidade_animais: formData.quantidade_animais,
        observacoes_gestao: formData.observacoes_gestao || null,
        responsavel_gestao_id: user?.id || null,
        updated_by: user?.id || null
      });

      // Verificar se status mudou para criar histórico
      const statusMudou = denuncia.status_denuncia !== formData.status_denuncia;

      // Preparar dados para atualização (sem campos que podem causar problemas)
      const updateData: any = {
        local_encontrado: formData.local_encontrado.trim(),
        descricao_situacao: formData.descricao_situacao.trim(),
        status_denuncia: formData.status_denuncia,
        prioridade: formData.prioridade,
        quantidade_animais: Math.max(0, formData.quantidade_animais)
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (formData.local_completo?.trim()) {
        updateData.local_completo = formData.local_completo.trim();
      }

      if (formData.observacoes_gestao?.trim()) {
        updateData.observacoes_gestao = formData.observacoes_gestao.trim();
      }

      if (user?.id) {
        updateData.responsavel_gestao_id = user.id;
        updateData.updated_by = user.id;
      }

      // Atualizar denúncia
      const { error: updateError } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .update(updateData)
        .eq('id', denuncia.id);

      if (updateError) {
        console.error('❌ [EDITAR] Erro ao atualizar:', updateError);
        console.error('❌ [EDITAR] Detalhes do erro:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        
        // Mensagem de erro mais específica
        let errorMessage = "Não foi possível salvar as alterações.";
        if (updateError.message.includes('check constraint')) {
          errorMessage = "Valores inválidos detectados. Verifique o status e prioridade.";
        } else if (updateError.message.includes('foreign key')) {
          errorMessage = "Erro de referência de dados. Tente novamente.";
        } else if (updateError.message.includes('not-null')) {
          errorMessage = "Campos obrigatórios não preenchidos.";
        }
        
        toast({
          title: "Erro ao salvar",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Criar entrada na timeline se status mudou
      if (statusMudou) {
        console.log('📝 [EDITAR] Criando entrada na timeline...');
        
        try {
          await supabase.rpc('criar_timeline_denuncia', {
            p_denuncia_id: denuncia.id,
            p_tipo_acao: 'edicao',
            p_descricao: `Denúncia editada. Status alterado de "${denuncia.status_denuncia}" para "${formData.status_denuncia}". ${formData.observacoes_gestao ? `Observações: ${formData.observacoes_gestao}` : ''}`,
            p_acao_anterior: denuncia.status_denuncia,
            p_acao_nova: formData.status_denuncia,
            p_usuario_id: user?.id,
            p_usuario_nome: user?.username || user?.email || 'Administrador'
          });
        } catch (timelineError) {
          console.error('⚠️ [EDITAR] Erro ao criar timeline (não crítico):', timelineError);
          // Não falhar por causa da timeline
        }
      }

      console.log('✅ [EDITAR] Denúncia atualizada com sucesso');
      
      toast({
        title: "Denúncia atualizada",
        description: "As alterações foram salvas com sucesso.",
      });

      // Voltar para detalhes
      navigate(`/denuncia/${codigo}`);
    } catch (error) {
      console.error('❌ [EDITAR] Erro geral ao salvar:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
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

  const renderStatusIcon = (status: string) => {
    const IconComponent = getStatusIcon(status);
    return <IconComponent className="h-5 w-5 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados da denúncia...</p>
        </div>
      </div>
    );
  }

  if (!denuncia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Denúncia não encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <PageActionBar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Denúncias', href: '/modulo-denuncias' },
          { label: denuncia.codigo, href: `/denuncia/${codigo}` },
          { label: 'Editar' }
        ]}
        primaryActions={
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
            <Button 
              onClick={() => navigate(`/denuncia/${codigo}`)}
              variant="outline"
              disabled={saving}
            >
              <History className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
            {denuncia && denuncia.status_denuncia !== 'concluida' && (
              <Button 
                onClick={() => navigate(`/denuncia/${codigo}/concluir`)}
                variant="outline"
                disabled={saving}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Concluir
              </Button>
            )}
            <Button 
              onClick={handleCancel}
              variant="outline"
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        }
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
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantidade_animais">Quantidade de Animais</Label>
                    <Input
                      id="quantidade_animais"
                      type="number"
                      min="0"
                      value={formData.quantidade_animais}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantidade_animais: parseInt(e.target.value) || 0 }))}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="local_completo">Endereço Completo</Label>
                  <Input
                    id="local_completo"
                    value={formData.local_completo}
                    onChange={(e) => setFormData(prev => ({ ...prev, local_completo: e.target.value }))}
                    placeholder="Endereço completo do local"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label htmlFor="descricao_situacao">Descrição da Situação *</Label>
                  <Textarea
                    id="descricao_situacao"
                    value={formData.descricao_situacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao_situacao: e.target.value }))}
                    placeholder="Descreva detalhadamente a situação encontrada..."
                    rows={4}
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gestão */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Gestão da Denúncia
                </CardTitle>
                <CardDescription>
                  Status, prioridade e observações administrativas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status_denuncia">Status</Label>
                    <Select 
                      value={formData.status_denuncia} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status_denuncia: value }))}
                      disabled={saving}
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
                      disabled={saving}
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
                    placeholder="Observações administrativas sobre a denúncia..."
                    rows={3}
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações Laterais */}
          <div className="space-y-6">
            {/* Informações da Denúncia */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Originais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Código</Label>
                  <p className="text-sm font-mono">{denuncia.codigo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data da Denúncia</Label>
                  <p className="text-sm">{new Date(denuncia.data_denuncia).toLocaleDateString('pt-PT')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Canal</Label>
                  <p className="text-sm">{denuncia.canal_denuncia}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                  <p className="text-sm">{denuncia.denunciante_anonimo ? 'Anônima' : 'Identificada'}</p>
                </div>
                {!denuncia.denunciante_anonimo && denuncia.denunciante_nome && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Denunciante</Label>
                    <p className="text-sm">{denuncia.denunciante_nome}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Atual */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  {renderStatusIcon(denuncia.status_denuncia)}
                  <span className="font-medium">{denuncia.status_denuncia}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Prioridade: <span className="font-medium">{denuncia.prioridade}</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/denuncia/${codigo}`)}
                  disabled={saving}
                >
                  <History className="h-4 w-4 mr-2" />
                  Ver Timeline
                </Button>
                {denuncia.status_denuncia !== 'concluida' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/denuncia/${codigo}/concluir`)}
                    disabled={saving}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Concluir Denúncia
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarDenuncia;