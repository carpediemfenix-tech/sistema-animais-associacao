import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PageActionBar from '@/components/PageActionBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  FileText, 
  DollarSign, 
  Clock, 
  Users, 
  Shield, 
  AlertTriangle,
  Save,
  ArrowLeft
} from 'lucide-react';

interface Denuncia {
  id: string;
  codigo: string;
  descricao_situacao: string;
  local_encontrado: string;
  quantidade_animais: number;
  status_denuncia: string;
}

interface RelatorioData {
  resultado_operacao: string;
  animais_resgatados: number;
  animais_tratados: number;
  animais_adotados: number;
  animais_obito: number;
  custo_total: number;
  custo_veterinario: number;
  custo_transporte: number;
  custo_alimentacao: number;
  tempo_operacao_horas: number;
  voluntarios_envolvidos: number;
  autoridades_acionadas: string[];
  evidencias_coletadas: string[];
  acoes_tomadas: string;
  resultados_obtidos: string;
  licoes_aprendidas: string;
  recomendacoes: string;
}

const ConcluirDenuncia: React.FC = () => {
  const navigate = useNavigate();
  const { codigo } = useParams<{ codigo: string }>();
  const { user, hasPermission } = useAuth();
  
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [relatorio, setRelatorio] = useState<RelatorioData>({
    resultado_operacao: '',
    animais_resgatados: 0,
    animais_tratados: 0,
    animais_adotados: 0,
    animais_obito: 0,
    custo_total: 0,
    custo_veterinario: 0,
    custo_transporte: 0,
    custo_alimentacao: 0,
    tempo_operacao_horas: 0,
    voluntarios_envolvidos: 0,
    autoridades_acionadas: [],
    evidencias_coletadas: [],
    acoes_tomadas: '',
    resultados_obtidos: '',
    licoes_aprendidas: '',
    recomendacoes: ''
  });

  const [novaAutoridade, setNovaAutoridade] = useState('');
  const [novaEvidencia, setNovaEvidencia] = useState('');

  // Verificar permissões
  useEffect(() => {
    if (!hasPermission('admin')) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem concluir denúncias.",
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
      console.log('🔍 [CONCLUSAO] Carregando denúncia:', codigo);
      
      const { data, error } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .select('*')
        .eq('codigo', codigo)
        .single();

      if (error) {
        console.error('❌ [CONCLUSAO] Erro ao carregar:', error);
        throw error;
      }

      if (data.status_denuncia === 'concluida') {
        toast({
          title: "Denúncia já concluída",
          description: "Esta denúncia já foi concluída anteriormente.",
          variant: "destructive",
        });
        navigate(`/denuncia/${codigo}`);
        return;
      }

      console.log('✅ [CONCLUSAO] Denúncia carregada:', data.codigo);
      setDenuncia(data);
      
      // Pré-preencher alguns campos
      setRelatorio(prev => ({
        ...prev,
        animais_resgatados: data.quantidade_animais || 0
      }));
      
    } catch (error) {
      console.error('❌ [CONCLUSAO] Erro:', error);
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

  const adicionarAutoridade = () => {
    if (novaAutoridade.trim() && !relatorio.autoridades_acionadas.includes(novaAutoridade.trim())) {
      setRelatorio(prev => ({
        ...prev,
        autoridades_acionadas: [...prev.autoridades_acionadas, novaAutoridade.trim()]
      }));
      setNovaAutoridade('');
    }
  };

  const removerAutoridade = (index: number) => {
    setRelatorio(prev => ({
      ...prev,
      autoridades_acionadas: prev.autoridades_acionadas.filter((_, i) => i !== index)
    }));
  };

  const adicionarEvidencia = () => {
    if (novaEvidencia.trim() && !relatorio.evidencias_coletadas.includes(novaEvidencia.trim())) {
      setRelatorio(prev => ({
        ...prev,
        evidencias_coletadas: [...prev.evidencias_coletadas, novaEvidencia.trim()]
      }));
      setNovaEvidencia('');
    }
  };

  const removerEvidencia = (index: number) => {
    setRelatorio(prev => ({
      ...prev,
      evidencias_coletadas: prev.evidencias_coletadas.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!denuncia) return;

    // Validações
    if (!relatorio.resultado_operacao) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione o resultado da operação.",
        variant: "destructive",
      });
      return;
    }

    if (!relatorio.acoes_tomadas.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, descreva as ações tomadas.",
        variant: "destructive",
      });
      return;
    }

    if (!relatorio.resultados_obtidos.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, descreva os resultados obtidos.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSalvando(true);
      console.log('💾 [CONCLUSAO] Salvando relatório de conclusão...');

      // 1. Criar relatório de conclusão
      const { error: relatorioError } = await supabase
        .from('relatorios_conclusao_2025_12_31_23_00')
        .insert({
          denuncia_id: denuncia.id,
          ...relatorio,
          responsavel_relatorio_id: user?.id,
          responsavel_relatorio_nome: user?.username || user?.email || 'Administrador',
          assinatura_digital: `${user?.id}-${Date.now()}` // Assinatura simples
        });

      if (relatorioError) {
        console.error('❌ [CONCLUSAO] Erro ao criar relatório:', relatorioError);
        throw relatorioError;
      }

      // 2. Atualizar denúncia
      const { error: denunciaError } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .update({
          status_denuncia: 'concluida',
          data_conclusao: new Date().toISOString(),
          data_fim_operacao: new Date().toISOString(),
          tempo_total_horas: relatorio.tempo_operacao_horas,
          custo_real: relatorio.custo_total,
          resultado_final: relatorio.resultado_operacao,
          tem_relatorio_conclusao: true,
          updated_by: user?.id
        })
        .eq('id', denuncia.id);

      if (denunciaError) {
        console.error('❌ [CONCLUSAO] Erro ao atualizar denúncia:', denunciaError);
        throw denunciaError;
      }

      // 3. Adicionar entrada na timeline
      await supabase.rpc('criar_timeline_denuncia', {
        p_denuncia_id: denuncia.id,
        p_tipo_acao: 'conclusao',
        p_descricao: `Denúncia concluída com resultado: ${relatorio.resultado_operacao}. Relatório final criado.`,
        p_acao_anterior: denuncia.status_denuncia,
        p_acao_nova: 'concluida',
        p_usuario_id: user?.id,
        p_usuario_nome: user?.username || user?.email || 'Administrador',
        p_dados_extras: { 
          resultado: relatorio.resultado_operacao,
          animais_resgatados: relatorio.animais_resgatados,
          custo_total: relatorio.custo_total
        }
      });

      console.log('✅ [CONCLUSAO] Denúncia concluída com sucesso');
      
      toast({
        title: "Denúncia concluída",
        description: "O relatório de conclusão foi criado e a denúncia foi finalizada.",
      });

      navigate(`/denuncia/${codigo}`);
      
    } catch (error) {
      console.error('❌ [CONCLUSAO] Erro:', error);
      toast({
        title: "Erro ao concluir denúncia",
        description: "Não foi possível salvar o relatório de conclusão.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando formulário de conclusão...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <PageActionBar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Denúncias', href: '/modulo-denuncias' },
          { label: denuncia.codigo, href: `/denuncia/${codigo}` },
          { label: 'Concluir' }
        ]}
        primaryActions={
          <Button onClick={() => navigate(`/denuncia/${codigo}`)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            Concluir Denúncia {denuncia.codigo}
          </h1>
          <p className="text-gray-600">
            Preencha o relatório final da operação de resgate
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações da Denúncia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações da Denúncia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Código da Denúncia</Label>
                  <Input value={denuncia.codigo} disabled />
                </div>
                <div>
                  <Label>Quantidade de Animais</Label>
                  <Input value={denuncia.quantidade_animais} disabled />
                </div>
              </div>
              <div>
                <Label>Local</Label>
                <Input value={denuncia.local_encontrado} disabled />
              </div>
              <div>
                <Label>Descrição da Situação</Label>
                <Textarea value={denuncia.descricao_situacao} disabled rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Resultado da Operação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Resultado da Operação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resultado_operacao">Resultado Geral *</Label>
                <Select 
                  value={relatorio.resultado_operacao} 
                  onValueChange={(value) => setRelatorio(prev => ({ ...prev, resultado_operacao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o resultado da operação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sucesso_total">Sucesso Total</SelectItem>
                    <SelectItem value="sucesso_parcial">Sucesso Parcial</SelectItem>
                    <SelectItem value="sem_sucesso">Sem Sucesso</SelectItem>
                    <SelectItem value="falso_alarme">Falso Alarme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="animais_resgatados">Animais Resgatados</Label>
                  <Input
                    id="animais_resgatados"
                    type="number"
                    min="0"
                    value={relatorio.animais_resgatados}
                    onChange={(e) => setRelatorio(prev => ({ ...prev, animais_resgatados: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="animais_tratados">Animais Tratados</Label>
                  <Input
                    id="animais_tratados"
                    type="number"
                    min="0"
                    value={relatorio.animais_tratados}
                    onChange={(e) => setRelatorio(prev => ({ ...prev, animais_tratados: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="animais_adotados">Animais Adotados</Label>
                  <Input
                    id="animais_adotados"
                    type="number"
                    min="0"
                    value={relatorio.animais_adotados}
                    onChange={(e) => setRelatorio(prev => ({ ...prev, animais_adotados: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="animais_obito">Óbitos</Label>
                  <Input
                    id="animais_obito"
                    type="number"
                    min="0"
                    value={relatorio.animais_obito}
                    onChange={(e) => setRelatorio(prev => ({ ...prev, animais_obito: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custos e Recursos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custos e Recursos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="custo_veterinario">Custo Veterinário (€)</Label>
                  <Input
                    id="custo_veterinario"
                    type="number"
                    step="0.01"
                    min="0"
                    value={relatorio.custo_veterinario}
                    onChange={(e) => {
                      const valor = parseFloat(e.target.value) || 0;
                      setRelatorio(prev => ({ 
                        ...prev, 
                        custo_veterinario: valor,
                        custo_total: valor + prev.custo_transporte + prev.custo_alimentacao
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="custo_transporte">Custo Transporte (€)</Label>
                  <Input
                    id="custo_transporte"
                    type="number"
                    step="0.01"
                    min="0"
                    value={relatorio.custo_transporte}
                    onChange={(e) => {
                      const valor = parseFloat(e.target.value) || 0;
                      setRelatorio(prev => ({ 
                        ...prev, 
                        custo_transporte: valor,
                        custo_total: prev.custo_veterinario + valor + prev.custo_alimentacao
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="custo_alimentacao">Custo Alimentação (€)</Label>
                  <Input
                    id="custo_alimentacao"
                    type="number"
                    step="0.01"
                    min="0"
                    value={relatorio.custo_alimentacao}
                    onChange={(e) => {
                      const valor = parseFloat(e.target.value) || 0;
                      setRelatorio(prev => ({ 
                        ...prev, 
                        custo_alimentacao: valor,
                        custo_total: prev.custo_veterinario + prev.custo_transporte + valor
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="custo_total">Custo Total (€)</Label>
                  <Input
                    id="custo_total"
                    type="number"
                    step="0.01"
                    value={relatorio.custo_total}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tempo_operacao_horas">Tempo de Operação (horas)</Label>
                  <Input
                    id="tempo_operacao_horas"
                    type="number"
                    min="0"
                    step="0.5"
                    value={relatorio.tempo_operacao_horas}
                    onChange={(e) => setRelatorio(prev => ({ ...prev, tempo_operacao_horas: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="voluntarios_envolvidos">Voluntários Envolvidos</Label>
                  <Input
                    id="voluntarios_envolvidos"
                    type="number"
                    min="0"
                    value={relatorio.voluntarios_envolvidos}
                    onChange={(e) => setRelatorio(prev => ({ ...prev, voluntarios_envolvidos: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Autoridades e Evidências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Autoridades e Evidências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Autoridades */}
              <div>
                <Label>Autoridades Contactadas</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Nome da autoridade ou entidade"
                    value={novaAutoridade}
                    onChange={(e) => setNovaAutoridade(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarAutoridade())}
                  />
                  <Button type="button" onClick={adicionarAutoridade} variant="outline">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {relatorio.autoridades_acionadas.map((autoridade, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {autoridade}
                      <button
                        type="button"
                        onClick={() => removerAutoridade(index)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidências */}
              <div>
                <Label>Evidências Coletadas</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Descrição da evidência"
                    value={novaEvidencia}
                    onChange={(e) => setNovaEvidencia(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarEvidencia())}
                  />
                  <Button type="button" onClick={adicionarEvidencia} variant="outline">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {relatorio.evidencias_coletadas.map((evidencia, index) => (
                    <div key={index} className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {evidencia}
                      <button
                        type="button"
                        onClick={() => removerEvidencia(index)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Relatório Detalhado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório Detalhado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="acoes_tomadas">Ações Tomadas *</Label>
                <Textarea
                  id="acoes_tomadas"
                  placeholder="Descreva detalhadamente todas as ações realizadas durante a operação..."
                  value={relatorio.acoes_tomadas}
                  onChange={(e) => setRelatorio(prev => ({ ...prev, acoes_tomadas: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="resultados_obtidos">Resultados Obtidos *</Label>
                <Textarea
                  id="resultados_obtidos"
                  placeholder="Descreva os resultados alcançados com a operação..."
                  value={relatorio.resultados_obtidos}
                  onChange={(e) => setRelatorio(prev => ({ ...prev, resultados_obtidos: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="licoes_aprendidas">Lições Aprendidas</Label>
                <Textarea
                  id="licoes_aprendidas"
                  placeholder="Que lições foram aprendidas com esta operação?"
                  value={relatorio.licoes_aprendidas}
                  onChange={(e) => setRelatorio(prev => ({ ...prev, licoes_aprendidas: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="recomendacoes">Recomendações</Label>
                <Textarea
                  id="recomendacoes"
                  placeholder="Que recomendações você faria para futuras operações similares?"
                  value={relatorio.recomendacoes}
                  onChange={(e) => setRelatorio(prev => ({ ...prev, recomendacoes: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/denuncia/${codigo}`)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={salvando}
              className="bg-green-600 hover:bg-green-700"
            >
              {salvando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Concluir Denúncia
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConcluirDenuncia;