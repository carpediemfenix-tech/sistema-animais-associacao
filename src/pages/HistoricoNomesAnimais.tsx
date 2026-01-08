import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Search,
  History,
  PawPrint,
  Calendar,
  Edit,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface HistoricoNome {
  id: string;
  animal_id: string;
  nome: string;
  data_inicio: string;
  data_fim?: string;
  ativo: boolean;
  motivo_alteracao?: string;
  created_at: string;
  updated_at: string;
}

interface Animal {
  id: string;
  nome: string;
  numero_processo?: string;
  especie: string;
  estado: string;
  created_at: string;
}

interface HistoricoComAnimal extends HistoricoNome {
  animal?: Animal;
}

const HistoricoNomesAnimais = () => {
  const { animalId } = useParams();
  const [historicos, setHistoricos] = useState<HistoricoComAnimal[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [animalSelecionado, setAnimalSelecionado] = useState<string>('todos');
  const [novoNomeOpen, setNovoNomeOpen] = useState(false);
  const [animalParaRenomear, setAnimalParaRenomear] = useState<Animal | null>(null);
  const [novoNome, setNovoNome] = useState('');
  const [motivoAlteracao, setMotivoAlteracao] = useState('');
  const [editandoHistorico, setEditandoHistorico] = useState<HistoricoNome | null>(null);
  const [editarNomeOpen, setEditarNomeOpen] = useState(false);
  const [confirmarDeleteOpen, setConfirmarDeleteOpen] = useState(false);
  const [historicoParaDelete, setHistoricoParaDelete] = useState<HistoricoNome | null>(null);
  
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  useEffect(() => {
    loadHistoricos();
    loadAnimais();
  }, [animalId]); // Recarregar quando animalId mudar

  useEffect(() => {
    if (animalId) {
      setAnimalSelecionado(animalId);
    }
  }, [animalId]);

  const loadHistoricos = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 [HISTORICO] Carregando históricos para animalId:', animalId);
      
      let query = supabase
        .from('historico_nomes_animais')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (animalId) {
        console.log('🎯 [HISTORICO] Aplicando filtro por animal:', animalId);
        query = query.eq('animal_id', animalId);
      } else {
        console.log('🌍 [HISTORICO] Carregando todos os históricos (sem filtro)');
      }

      const { data: historicosData, error } = await query;

      if (error) throw error;
      
      console.log('✅ [HISTORICO] Dados recebidos:', historicosData?.length || 0, 'registos');
      console.log('🔍 [HISTORICO] Primeiros dados:', historicosData?.slice(0, 2));

      // Buscar dados dos animais para cada histórico
      const historicosComAnimais = [];
      if (historicosData) {
        for (const hist of historicosData) {
          const { data: animalData } = await supabase
            .from('animais')
            .select('id, nome, numero_processo, especie, estado, created_at')
            .eq('id', hist.animal_id)
            .single();
          
          historicosComAnimais.push({
            ...hist,
            animal: animalData
          });
        }
      }

      setHistoricos(historicosComAnimais);
    } catch (error: any) {
      console.error('Erro ao carregar históricos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de nomes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnimais = async () => {
    try {
      const { data, error } = await supabase
        .from('animais')
        .select('id, nome, numero_processo, especie, estado, created_at')
        .eq('arquivado', false)
        .order('nome');

      if (error) throw error;
      setAnimais(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar animais:', error);
    }
  };

  const handleAlterarNome = async () => {
    if (!animalParaRenomear || !novoNome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      // Atualizar o nome do animal (o trigger cuidará do histórico)
      const { error } = await supabase
        .from('animais')
        .update({ nome: novoNome.trim() })
        .eq('id', animalParaRenomear.id);

      if (error) throw error;

      // Se foi fornecido um motivo específico, atualizar o histórico
      if (motivoAlteracao.trim()) {
        const { error: histError } = await supabase
          .from('historico_nomes_animais')
          .update({ motivo_alteracao: motivoAlteracao.trim() })
          .eq('animal_id', animalParaRenomear.id)
          .eq('ativo', true);

        if (histError) console.warn('Erro ao atualizar motivo:', histError);
      }

      toast({
        title: "Sucesso",
        description: `Nome do animal alterado para "${novoNome}"`,
      });

      setNovoNomeOpen(false);
      setAnimalParaRenomear(null);
      setNovoNome('');
      setMotivoAlteracao('');
      loadHistoricos();
      loadAnimais();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar nome do animal",
        variant: "destructive",
      });
    }
  };

  const editarHistorico = async () => {
    if (!editandoHistorico || !novoNome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('historico_nomes_animais')
        .update({
          nome: novoNome.trim(),
          motivo_alteracao: motivoAlteracao.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editandoHistorico.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Histórico atualizado com sucesso",
      });

      setEditarNomeOpen(false);
      setEditandoHistorico(null);
      setNovoNome('');
      setMotivoAlteracao('');
      loadHistoricos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao editar histórico",
        variant: "destructive",
      });
    }
  };

  const eliminarHistorico = async () => {
    if (!historicoParaDelete) return;

    try {
      // Verificar se é o único histórico ativo do animal
      const { data: historicosAtivos } = await supabase
        .from('historico_nomes_animais')
        .select('id')
        .eq('animal_id', historicoParaDelete.animal_id)
        .eq('ativo', true);

      if (historicosAtivos && historicosAtivos.length === 1 && historicoParaDelete.ativo) {
        toast({
          title: "Erro",
          description: "Não é possível eliminar o único nome ativo do animal",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('historico_nomes_animais')
        .delete()
        .eq('id', historicoParaDelete.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Histórico eliminado com sucesso",
      });

      setConfirmarDeleteOpen(false);
      setHistoricoParaDelete(null);
      loadHistoricos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar histórico",
        variant: "destructive",
      });
    }
  };

  const iniciarEdicao = (historico: HistoricoNome) => {
    setEditandoHistorico(historico);
    setNovoNome(historico.nome);
    setMotivoAlteracao(historico.motivo_alteracao || '');
    setEditarNomeOpen(true);
  };

  const iniciarEliminacao = (historico: HistoricoNome) => {
    setHistoricoParaDelete(historico);
    setConfirmarDeleteOpen(true);
  };

  const historicosFiltrados = historicos.filter(hist => {
    const matchesSearch = hist.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (hist.animal?.nome && hist.animal.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (hist.animal?.numero_processo && hist.animal.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Se há animalId na URL, o filtro SQL já filtrou, então só aplicar filtro de pesquisa
    if (animalId) {
      return matchesSearch;
    }
    
    // Caso contrário, aplicar ambos os filtros
    const matchesAnimal = animalSelecionado === 'todos' || hist.animal_id === animalSelecionado;
    return matchesSearch && matchesAnimal;
  });

  // Agrupar por animal
  const historicosAgrupados = historicosFiltrados.reduce((acc, hist) => {
    const animalId = hist.animal_id;
    if (!acc[animalId]) {
      acc[animalId] = {
        animal: hist.animal,
        historicos: []
      };
    }
    acc[animalId].historicos.push(hist);
    return acc;
  }, {} as Record<string, { animal?: Animal; historicos: HistoricoComAnimal[] }>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando histórico de nomes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to={animalId ? `/animal/${animalId}` : "/"}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {animalId ? 'Voltar ao Animal' : 'Dashboard Principal'}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <History className="h-8 w-8 mr-3 text-blue-600" />
                Histórico de Nomes dos Animais
              </h1>
              <p className="text-gray-600 mt-1">
                {animalId ? 'Histórico de nomes do animal selecionado' : 'Histórico completo de alterações de nomes'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={loadHistoricos} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            {hasPermission('admin') && (
              <Dialog open={novoNomeOpen} onOpenChange={setNovoNomeOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Alterar Nome
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Alterar Nome do Animal</DialogTitle>
                    <DialogDescription>
                      Selecione um animal e defina o novo nome
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Animal</Label>
                      <select 
                        className="w-full p-2 border rounded"
                        value={animalParaRenomear?.id || ''}
                        onChange={(e) => {
                          const animal = animais.find(a => a.id === e.target.value);
                          setAnimalParaRenomear(animal || null);
                          setNovoNome(animal?.nome || '');
                        }}
                      >
                        <option value="">Selecione um animal</option>
                        {animais.map((animal) => (
                          <option key={animal.id} value={animal.id}>
                            {animal.nome} ({animal.numero_processo}) - {animal.especie}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Novo Nome *</Label>
                      <Input
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        placeholder="Digite o novo nome"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Motivo da Alteração</Label>
                      <select 
                        className="w-full p-2 border rounded"
                        value={motivoAlteracao}
                        onChange={(e) => setMotivoAlteracao(e.target.value)}
                      >
                        <option value="">Selecione o motivo</option>
                        <option value="Alteração por adoção">Alteração por adoção</option>
                        <option value="Alteração administrativa">Alteração administrativa</option>
                        <option value="Correção de nome">Correção de nome</option>
                        <option value="Pedido do adotante">Pedido do adotante</option>
                        <option value="Nome mais adequado">Nome mais adequado</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setNovoNomeOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAlterarNome}>
                      <Edit className="h-4 w-4 mr-2" />
                      Alterar Nome
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registos</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{historicos.length}</div>
              <p className="text-xs text-muted-foreground">
                Alterações de nomes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nomes Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{historicos.filter(h => h.ativo).length}</div>
              <p className="text-xs text-muted-foreground">
                Nomes atuais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Animais Únicos</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(historicosAgrupados).length}</div>
              <p className="text-xs text-muted-foreground">
                Com histórico
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alterações Recentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {historicos.filter(h => {
                  const dataInicio = new Date(h.data_inicio);
                  const agora = new Date();
                  const diasAtras = (agora.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24);
                  return diasAtras <= 30;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Pesquisar por nome do animal ou processo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {!animalId && (
                <select 
                  className="p-2 border rounded w-64"
                  value={animalSelecionado}
                  onChange={(e) => setAnimalSelecionado(e.target.value)}
                >
                  <option value="todos">Todos os Animais</option>
                  {animais.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.nome} ({animal.numero_processo})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Históricos Agrupados por Animal */}
        <div className="space-y-6">
          {Object.entries(historicosAgrupados).map(([animalId, grupo]) => (
            <Card key={animalId} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <PawPrint className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-xl">
                        {grupo.animal?.nome || 'Animal Desconhecido'}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span>Processo: {grupo.animal?.numero_processo || 'N/A'}</span>
                        <span>Espécie: {grupo.animal?.especie || 'N/A'}</span>
                        <Badge variant="outline">{grupo.animal?.estado || 'N/A'}</Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {grupo.historicos.length} alteração{grupo.historicos.length !== 1 ? 'ões' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {grupo.historicos.map((hist, index) => (
                    <div key={hist.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${hist.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <div>
                            <h4 className="font-semibold text-lg">{hist.nome}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Início: {new Date(hist.data_inicio).toLocaleDateString('pt-PT')}
                              </div>
                              {hist.data_fim && (
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Fim: {new Date(hist.data_fim).toLocaleDateString('pt-PT')}
                                </div>
                              )}
                            </div>
                            {hist.motivo_alteracao && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                <span className="font-medium text-blue-800">Motivo:</span>
                                <span className="text-blue-700 ml-2">{hist.motivo_alteracao}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {hasPermission('admin') && (
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => iniciarEdicao(hist)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => iniciarEliminacao(hist)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <Badge variant={hist.ativo ? "default" : "secondary"}>
                            {hist.ativo ? "Nome Atual" : "Nome Anterior"}
                          </Badge>
                          {index === 0 && hist.ativo && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Mais Recente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {Object.keys(historicosAgrupados).length === 0 && (
          <div className="text-center py-12">
            <History className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum histórico encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || animalSelecionado !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Ainda não há alterações de nomes registadas'
              }
            </p>
            {hasPermission('admin') && !searchTerm && animalSelecionado === 'todos' && (
              <Button onClick={() => setNovoNomeOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Fazer Primeira Alteração
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Diálogo de Edição */}
      <Dialog open={editarNomeOpen} onOpenChange={setEditarNomeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Histórico de Nome</DialogTitle>
            <DialogDescription>
              Edite as informações do histórico de nome selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome-edit">Nome</Label>
              <Input
                id="nome-edit"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Digite o nome"
              />
            </div>
            <div>
              <Label htmlFor="motivo-edit">Motivo da Alteração</Label>
              <Textarea
                id="motivo-edit"
                value={motivoAlteracao}
                onChange={(e) => setMotivoAlteracao(e.target.value)}
                placeholder="Descreva o motivo da alteração (opcional)"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setEditarNomeOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editarHistorico}>
              Guardar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Eliminação */}
      <Dialog open={confirmarDeleteOpen} onOpenChange={setConfirmarDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem a certeza que pretende eliminar este histórico de nome?
            </DialogDescription>
          </DialogHeader>
          {historicoParaDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium">{historicoParaDelete.nome}</div>
              <div className="text-sm text-gray-600">
                {historicoParaDelete.ativo ? 'Nome Atual' : 'Nome Anterior'}
              </div>
              {historicoParaDelete.motivo_alteracao && (
                <div className="text-sm text-gray-600 mt-1">
                  Motivo: {historicoParaDelete.motivo_alteracao}
                </div>
              )}
            </div>
          )}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
              <div className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. O histórico será permanentemente eliminado.
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setConfirmarDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={eliminarHistorico}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default HistoricoNomesAnimais;