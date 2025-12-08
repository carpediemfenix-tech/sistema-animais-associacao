import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Eye,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  Award,
  Sprout,
  Shield,
  Sword,
  Crown,
  Heart,
  Zap,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { VoluntarioValentao, NivelFormacao, Especializacao, VoluntarioFormData } from "@/types/voluntarios";

const GestaoVoluntarios = () => {
  const [voluntarios, setVoluntarios] = useState<VoluntarioValentao[]>([]);
  const [niveisFormacao, setNiveisFormacao] = useState<NivelFormacao[]>([]);
  const [especializacoes, setEspecializacoes] = useState<Especializacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  const [nivelFilter, setNivelFilter] = useState<string>("todos");

  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem gerir voluntários
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/voluntarios">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar voluntários com última formação aprovada
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('*')
        .order('nome');

      if (voluntariosError) throw voluntariosError;

      // Para cada voluntário, buscar a última formação aprovada
      const voluntariosComFormacao = await Promise.all(
        (voluntariosData || []).map(async (voluntario) => {
          try {
            // Consulta simplificada - buscar última participação aprovada
            const { data: participacoes } = await supabase
              .from('participacoes_formacao')
              .select('acao_formacao_id, data_avaliacao')
              .eq('voluntario_id', voluntario.id)
              .eq('status', 'concluido')
              .eq('resultado', 'aprovado')
              .order('data_avaliacao', { ascending: false })
              .limit(1);

            if (participacoes && participacoes.length > 0) {
              // Buscar ação de formação
              const { data: acaoFormacao } = await supabase
                .from('acoes_formacao')
                .select('tipo_formacao_id')
                .eq('id', participacoes[0].acao_formacao_id)
                .single();

              if (acaoFormacao) {
                // Buscar tipo de formação
                const { data: tipoFormacao } = await supabase
                  .from('tipos_formacao')
                  .select('nome')
                  .eq('id', acaoFormacao.tipo_formacao_id)
                  .single();

                return {
                  ...voluntario,
                  ultima_formacao: tipoFormacao?.nome || 'Sem formação'
                };
              }
            }
          } catch (error) {
            console.error('Erro ao buscar formação:', voluntario.nome, error);
          }

          return {
            ...voluntario,
            ultima_formacao: 'Sem formação'
          };
        })
      );

      setVoluntarios(voluntariosComFormacao);

      // Dados fixos para compatibilidade
      const niveisFixos = [
        { id: '1', nome: 'FORMA BASE', codigo: 'FORMA_BASE', ativo: true },
        { id: '2', nome: 'Formação N1', codigo: 'FORMA_N1', ativo: true },
        { id: '3', nome: 'Formação N2', codigo: 'FORMA_N2', ativo: true }
      ];
      
      const especializacoesFixas = [
        { id: '1', nome: 'Geral', ativo: true },
        { id: '2', nome: 'Veterinária', ativo: true },
        { id: '3', nome: 'Resgate', ativo: true }
      ];

      setNiveisFormacao(niveisFixos);
      setEspecializacoes(especializacoesFixas);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos voluntários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções do modal removidas - agora usa página dedicada de edição

  const handleToggleStatus = async (voluntario: VoluntarioValentao) => {
    try {
      const novoStatus = !voluntario.ativo;
      const updateData: any = { ativo: novoStatus };
      
      if (!novoStatus) {
        updateData.data_inativacao = new Date().toISOString().split('T')[0];
        updateData.motivo_inativacao = "Inativado via sistema";
      } else {
        updateData.data_inativacao = null;
        updateData.motivo_inativacao = null;
      }

      const { error } = await supabase
        .from('voluntarios')
        .update(updateData)
        .eq('id', voluntario.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Voluntário ${novoStatus ? 'ativado' : 'inativado'} com sucesso`,
      });

      loadData();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do voluntário",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (voluntario: VoluntarioValentao) => {
    try {
      console.log('🔍 [DEBUG] Verificando dependências para voluntário:', voluntario.nome);
      
      // Primeiro, verificar se o voluntário tem dependências
      const { data: responsabilidades, error: checkError } = await supabase
        .from('responsabilidades_voluntarios')
        .select('id')
        .eq('voluntario_id', voluntario.id)
        .limit(1);

      if (checkError) {
        console.error('Erro ao verificar dependências:', checkError);
      }

      console.log('📊 [DEBUG] Responsabilidades encontradas:', responsabilidades?.length || 0);

      // Se tem dependências, oferecer arquivamento em vez de eliminação
      if (responsabilidades && responsabilidades.length > 0) {
        toast({
          title: "❌ Não é possível eliminar",
          description: `${voluntario.nome} tem responsabilidades por animais registradas. Use o botão 'Inativar' para arquivar o voluntário mantendo todo o histórico.`,
          variant: "destructive",
        });
        return;
      }

      // Se não tem dependências, pode eliminar
      console.log('✅ [DEBUG] Sem dependências, procedendo com eliminação');
      const { error } = await supabase
        .from('voluntarios')
        .delete()
        .eq('id', voluntario.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: `${voluntario.nome} foi removido com sucesso`,
      });

      loadData();
    } catch (error: any) {
      console.error('🚨 [ERRO] Erro ao remover voluntário:', error);
      
      // Tratar especificamente erro de constraint de integridade referencial
      if (error.code === '23503') {
        toast({
          title: "❌ Não é possível eliminar",
          description: `${voluntario.nome} tem registros associados (responsabilidades, histórico, etc.). Use o botão 'Inativar' para arquivar o voluntário preservando os dados.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "🚨 Erro",
          description: error.message || "Erro inesperado ao remover voluntário",
          variant: "destructive",
        });
      }
    }
  };

  const getNivelIcon = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_BASE': return <Sprout className="h-4 w-4" />;
      case 'FORMA_N1': return <Shield className="h-4 w-4" />;
      case 'FORMA_N2': return <Sword className="h-4 w-4" />;
      case 'FORMA_N3': return <Crown className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getNivelBadge = (nivel?: NivelFormacao) => {
    if (!nivel) {
      return (
        <Badge variant="secondary" className="text-xs">
          <User className="h-3 w-3 mr-1" />
          Sem nível
        </Badge>
      );
    }

    return (
      <Badge 
        className="text-xs text-white"
        style={{ backgroundColor: nivel.cor }}
      >
        <span style={{ color: 'white' }} className="mr-1">
          {getNivelIcon(nivel.codigo)}
        </span>
        {nivel.nome}
      </Badge>
    );
  };

  // Filtrar voluntários
  const voluntariosFiltrados = voluntarios.filter(voluntario => {
    const matchesSearch = voluntario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voluntario.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || 
                         (statusFilter === "ativo" && voluntario.ativo) ||
                         (statusFilter === "inativo" && !voluntario.ativo);
    
    const matchesNivel = nivelFilter === "todos" || 
                        voluntario.nivel_formacao_atual === nivelFilter;

    return matchesSearch && matchesStatus && matchesNivel;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando voluntários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3 text-blue-600" />
              Gestão de Voluntários
            </h1>
            <p className="text-gray-600 mt-1">
              Gerir voluntários do sistema Valentão
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/voluntarios">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Voluntários
              </Button>
            </Link>
            <Link to="/voluntarios/novo">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Voluntário
              </Button>
            </Link>
          {/* Modal removido - agora usa página dedicada */}
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Pesquisa */}
              <div>
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nível de Formação */}
              <div>
                <Label htmlFor="nivel">Nível de Formação</Label>
                <Select value={nivelFilter} onValueChange={setNivelFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os níveis</SelectItem>
                    {niveisFormacao.map((nivel) => (
                      <SelectItem key={nivel.id} value={nivel.id}>
                        <div className="flex items-center space-x-2">
                          <span style={{ color: nivel.cor }}>
                            {getNivelIcon(nivel.codigo)}
                          </span>
                          <span>{nivel.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Limpar Filtros */}
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("todos");
                    setNivelFilter("todos");
                  }}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{voluntarios.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {voluntarios.filter(v => v.ativo).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inativos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {voluntarios.filter(v => !v.ativo).length}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Filtrados</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {voluntariosFiltrados.length}
                  </p>
                </div>
                <Filter className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Voluntários */}
        <Card>
          <CardHeader>
            <CardTitle>Voluntários ({voluntariosFiltrados.length})</CardTitle>
            <CardDescription>
              Lista de todos os voluntários do sistema Valentão
            </CardDescription>
          </CardHeader>
          <CardContent>
            {voluntariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum voluntário encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  {voluntarios.length === 0 
                    ? "Ainda não há voluntários registados no sistema."
                    : "Nenhum voluntário corresponde aos filtros aplicados."
                  }
                </p>
                {voluntarios.length === 0 && (
                  <Button onClick={() => openDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Voluntário
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Nível Formação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Ingresso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voluntariosFiltrados.map((voluntario) => (
                      <TableRow key={voluntario.id}>
                        <TableCell className="font-medium">
                          {voluntario.nome}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{voluntario.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {voluntario.telefone ? (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{voluntario.telefone}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {voluntario.ultima_formacao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {voluntario.ativo ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <UserX className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(voluntario.data_ingresso).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            
                            {/* Ver Perfil Completo */}
                            <Link to={`/voluntarios/perfil/${voluntario.id}`}>
                              <Button variant="outline" size="sm" title="Ver perfil completo">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            {/* Editar Voluntário (Única Opção) */}
                            <Link to={`/voluntarios/editar/${voluntario.id}`}>
                              <Button variant="outline" size="sm" title="Editar voluntário">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>

                            {/* Toggle Status */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(voluntario)}
                              className={voluntario.ativo ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                              title={voluntario.ativo ? "Inativar voluntário (preserva histórico)" : "Ativar voluntário"}
                            >
                              {voluntario.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>

                            {/* Remover */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  title="Eliminar permanentemente (apenas se sem dependências)"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-red-600">
                                    ⚠️ Remover Voluntário Permanentemente
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="space-y-2">
                                    <p>
                                      Tem a certeza que deseja <strong>eliminar permanentemente</strong> o voluntário <strong>{voluntario.nome}</strong>?
                                    </p>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                      <p className="text-sm text-yellow-800">
                                        💡 <strong>Sugestão:</strong> Se o voluntário tem responsabilidades por animais, 
                                        use o botão <strong>"Inativar"</strong> em vez de eliminar para preservar o histórico.
                                      </p>
                                    </div>
                                    <p className="text-red-600 font-medium">
                                      ⚠️ Esta ação não pode ser desfeita!
                                    </p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(voluntario)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestaoVoluntarios;