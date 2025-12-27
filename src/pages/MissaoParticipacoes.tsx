import { useState, useEffect } from "react";
import PageActionBar from '@/components/PageActionBar';
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Users,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Target,
  Star,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import VoluntarioSelector from "@/components/VoluntarioSelector";

// Interfaces
interface Missao {
  id: string;
  codigo: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  status: string;
}

interface ParticipacaoMissao {
  id: string;
  missao_id: string;
  voluntario_id: string;
  funcao: string;
  data_participacao: string;
  data_fim?: string;
  horas_dedicadas: number;
  pontos_atribuidos: number;
  status_participacao: string;
  observacoes?: string;
  created_at: string;
}

interface Voluntario {
  id: string;
  nome: string;
  display_name?: string;
  email: string;
}

const MissaoParticipacoes = () => {
  const { id } = useParams();
  const [missao, setMissao] = useState<Missao | null>(null);
  const [participacoes, setParticipacoes] = useState<ParticipacaoMissao[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Estados para diálogos
  const [participacaoDialogOpen, setParticipacaoDialogOpen] = useState(false);
  const [editingParticipacao, setEditingParticipacao] = useState<ParticipacaoMissao | null>(null);

  // Estados para formulários
  const [participacaoForm, setParticipacaoForm] = useState({
    voluntario_id: '',
    funcao: 'participante',
    data_participacao: '',
    data_fim: '',
    horas_dedicadas: '0',
    observacoes: ''
  });

  // Carregar dados
  useEffect(() => {
    console.log('🎯 ID da missão capturado:', id);
    if (id && id !== '[ID_REAL]' && id !== '[ID]') {
      loadData();
    } else {
      console.error('❌ ID da missão inválido ou não encontrado:', id);
      setError(`ID da missão inválido: ${id}. Use um ID real de uma missão existente.`);
      setLoading(false);
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadMissao(),
        loadParticipacoes(),
        loadVoluntarios()
      ]);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadMissao = async () => {
    console.log('🎯 Carregando missão com ID:', id);
    const { data, error } = await supabase
      .from('missoes_2025_12_21_19_00')
      .select('id, codigo, titulo, data_inicio, data_fim, status')
      .eq('id', id)
      .single();

    if (error) throw error;
    setMissao(data);
  };

  const loadParticipacoes = async () => {
    console.log('👥 Carregando participações para missão ID:', id);
    const { data, error } = await supabase
      .from('participacoes_missoes_2025_12_21_20_00')
      .select('*')
      .eq('missao_id', id)
      .order('data_participacao', { ascending: false });

    if (error) throw error;
    setParticipacoes(data || []);
  };

  const loadVoluntarios = async () => {
    const { data, error } = await supabase
      .from('voluntarios')
      .select('id, nome, display_name, email')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    setVoluntarios(data || []);
  };

  // Criar participação
  const handleCreateParticipacao = async () => {
    try {
      // Calcular pontos baseado na função
      const pontosBase = {
        'coordenador': 25,
        'participante': 10,
        'apoio': 8,
        'especialista': 15
      };
      
      const pontosAtribuidos = pontosBase[participacaoForm.funcao as keyof typeof pontosBase] || 10;
      
      const participacaoData = {
        missao_id: id,
        voluntario_id: participacaoForm.voluntario_id,
        funcao: participacaoForm.funcao,
        data_participacao: participacaoForm.data_participacao,
        data_fim: participacaoForm.data_fim || null,
        horas_dedicadas: parseFloat(participacaoForm.horas_dedicadas) || 0,
        pontos_atribuidos: pontosAtribuidos,
        status_participacao: 'ativa',
        observacoes: participacaoForm.observacoes || null
      };

      const { data: participacaoResult, error } = await supabase
        .from('participacoes_missoes_2025_12_21_20_00')
        .insert(participacaoData)
        .select()
        .single();

      if (error) throw error;

      // Atualizar pontuação do voluntário usando a função SQL
      const { error: pontosError } = await supabase.rpc('atualizar_pontuacao_voluntario', {
        p_voluntario_id: participacaoForm.voluntario_id,
        p_pontos: pontosAtribuidos,
        p_descricao: `Participação como ${participacaoForm.funcao} na missão`,
        p_missao_id: id
      });

      if (pontosError) {
        console.warn('⚠️ Erro ao atualizar pontos:', pontosError);
      }

      toast({
        title: "Participação adicionada",
        description: `Voluntário adicionado com ${pontosAtribuidos} pontos!`,
      });

      setParticipacaoDialogOpen(false);
      resetParticipacaoForm();
      await loadParticipacoes();
    } catch (error: any) {
      console.error('❌ Erro ao criar participação:', error);
      toast({
        title: "Erro ao adicionar participação",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Atualizar participação
  const handleUpdateParticipacao = async () => {
    if (!editingParticipacao) return;

    try {
      const participacaoData = {
        funcao: participacaoForm.funcao,
        data_participacao: participacaoForm.data_participacao,
        data_fim: participacaoForm.data_fim || null,
        horas_dedicadas: parseFloat(participacaoForm.horas_dedicadas) || 0,
        observacoes: participacaoForm.observacoes || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('participacoes_missoes_2025_12_21_20_00')
        .update(participacaoData)
        .eq('id', editingParticipacao.id);

      if (error) throw error;

      toast({
        title: "Participação atualizada",
        description: "Participação atualizada com sucesso!",
      });

      setParticipacaoDialogOpen(false);
      setEditingParticipacao(null);
      resetParticipacaoForm();
      await loadParticipacoes();
    } catch (error: any) {
      console.error('❌ Erro ao atualizar participação:', error);
      toast({
        title: "Erro ao atualizar participação",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Eliminar participação
  const handleDeleteParticipacao = async (participacaoId: string) => {
    if (!confirm('Tem certeza que deseja remover esta participação?')) return;

    try {
      const { error } = await supabase
        .from('participacoes_missoes_2025_12_21_20_00')
        .delete()
        .eq('id', participacaoId);

      if (error) throw error;

      toast({
        title: "Participação removida",
        description: "Participação removida com sucesso!",
      });

      await loadParticipacoes();
    } catch (error: any) {
      console.error('❌ Erro ao eliminar participação:', error);
      toast({
        title: "Erro ao remover participação",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Reset formulário
  const resetParticipacaoForm = () => {
    setParticipacaoForm({
      voluntario_id: '',
      funcao: 'participante',
      data_participacao: missao?.data_inicio || '',
      data_fim: '',
      horas_dedicadas: '0',
      observacoes: ''
    });
  };

  // Abrir diálogo
  const openParticipacaoDialog = (participacao?: ParticipacaoMissao) => {
    if (participacao) {
      setEditingParticipacao(participacao);
      setParticipacaoForm({
        voluntario_id: participacao.voluntario_id,
        funcao: participacao.funcao,
        data_participacao: participacao.data_participacao,
        data_fim: participacao.data_fim || '',
        horas_dedicadas: participacao.horas_dedicadas.toString(),
        observacoes: participacao.observacoes || ''
      });
    } else {
      setEditingParticipacao(null);
      resetParticipacaoForm();
    }
    setParticipacaoDialogOpen(true);
  };

  // Obter voluntário por ID
  const getVoluntarioById = (voluntarioId: string) => {
    return voluntarios.find(v => v.id === voluntarioId);
  };

  // Obter badge de função
  const getFuncaoBadge = (funcao: string) => {
    const funcaoConfig = {
      'coordenador': { color: 'bg-purple-100 text-purple-800', label: 'Coordenador' },
      'participante': { color: 'bg-blue-100 text-blue-800', label: 'Participante' },
      'apoio': { color: 'bg-green-100 text-green-800', label: 'Apoio' },
      'especialista': { color: 'bg-orange-100 text-orange-800', label: 'Especialista' }
    };

    const config = funcaoConfig[funcao as keyof typeof funcaoConfig] || funcaoConfig.participante;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando participações...</p>
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
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
              <p className="text-gray-600 mb-6">{error || "Missão não encontrada"}</p>
              <Link to="/modulo-missoes">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar às Missões
                </Button>
              </Link>
            </div>
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
        {/* Header com navegação */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to={'/missao/' + id}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Missão
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                Participações da Missão
              </h1>
              <p className="text-gray-600 mt-1">{missao.titulo} ({missao.codigo})</p>
            </div>
          </div>
          
          <Button 
            onClick={() => openParticipacaoDialog()} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Participação
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Participações</p>
                  <p className="text-3xl font-bold text-blue-600">{participacoes.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas Dedicadas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {participacoes.reduce((total, p) => total + p.horas_dedicadas, 0)}h
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pontos Atribuídos</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {participacoes.reduce((total, p) => total + p.pontos_atribuidos, 0)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Participações */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Voluntários Participantes ({participacoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participacoes.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma participação registada</h3>
                <p className="text-gray-600 mb-6">
                  Adicione voluntários para participar desta missão
                </p>
                <Button onClick={() => openParticipacaoDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Participação
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voluntário</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participacoes.map((participacao) => {
                    const voluntario = getVoluntarioById(participacao.voluntario_id);
                    
                    return (
                      <TableRow key={participacao.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {voluntario?.display_name || voluntario?.nome || 'Voluntário não encontrado'}
                            </p>
                            <p className="text-sm text-gray-600">{voluntario?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getFuncaoBadge(participacao.funcao)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(participacao.data_participacao).toLocaleDateString('pt-PT')}
                            </div>
                            {participacao.data_fim && (
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(participacao.data_fim).toLocaleDateString('pt-PT')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{participacao.horas_dedicadas}h</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-purple-600">
                            <Star className="h-3 w-3 mr-1" />
                            <span>{participacao.pontos_atribuidos}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={participacao.status_participacao === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {participacao.status_participacao === 'confirmada' ? 'Confirmada' : participacao.status_participacao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openParticipacaoDialog(participacao)}
                              className="h-8 w-8 p-0"
                              title="Editar participação"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteParticipacao(participacao.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Remover participação"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Nova/Editar Participação */}
      <Dialog open={participacaoDialogOpen} onOpenChange={setParticipacaoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>{editingParticipacao ? 'Editar Participação' : 'Nova Participação'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingParticipacao ? 'Atualize os dados da participação' : 'Adicione um voluntário à missão'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            editingParticipacao ? handleUpdateParticipacao() : handleCreateParticipacao();
          }} className="space-y-4">
            {!editingParticipacao && (
              <div>
                <Label htmlFor="voluntario_id">Voluntário *</Label>
                <VoluntarioSelector
                  value={participacaoForm.voluntario_id}
                  onValueChange={(value) => setParticipacaoForm(prev => ({ ...prev, voluntario_id: value }))}
                  placeholder="Selecionar voluntário"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="funcao">Função</Label>
                <Select 
                  value={participacaoForm.funcao} 
                  onValueChange={(value) => setParticipacaoForm(prev => ({ ...prev, funcao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="participante">Participante</SelectItem>
                    <SelectItem value="apoio">Apoio</SelectItem>
                    <SelectItem value="especialista">Especialista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="horas_dedicadas">Horas Dedicadas</Label>
                <Input
                  id="horas_dedicadas"
                  type="number"
                  step="0.5"
                  min="0"
                  value={participacaoForm.horas_dedicadas}
                  onChange={(e) => setParticipacaoForm(prev => ({ ...prev, horas_dedicadas: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_participacao">Data de Participação *</Label>
                <Input
                  id="data_participacao"
                  type="date"
                  value={participacaoForm.data_participacao}
                  onChange={(e) => setParticipacaoForm(prev => ({ ...prev, data_participacao: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="data_fim">Data de Fim (opcional)</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={participacaoForm.data_fim}
                  onChange={(e) => setParticipacaoForm(prev => ({ ...prev, data_fim: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={participacaoForm.observacoes}
                onChange={(e) => setParticipacaoForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre a participação..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setParticipacaoDialogOpen(false);
                  setEditingParticipacao(null);
                  resetParticipacaoForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingParticipacao ? 'Atualizar Participação' : 'Adicionar Participação'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default MissaoParticipacoes;