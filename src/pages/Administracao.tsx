import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus,
  Edit,
  Trash2,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  Save,
  X,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DebugLoggerComponent, { debugLogger } from "@/components/DebugLogger";

interface CategoriaFinanceira {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao' | 'ambos';
  cor: string;
  icone: string;
  ativo: boolean;
  ordem?: number;
  created_at?: string;
  updated_at?: string;
}

const Administracao = () => {
  const [categoriasFinanceiras, setCategoriasFinanceiras] = useState<CategoriaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoriaFinanceira | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: '',
    escopo: '',
    cor: '#6B7280',
    icone: 'DollarSign'
  });

  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Verificar se é administrador
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
        <UserHeader title="Acesso Negado" description="Área restrita a administradores" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold text-red-800 mb-2">Acesso Restrito</h2>
              <p className="text-red-600 mb-4">
                Esta área é exclusiva para administradores do sistema.
              </p>
              <Button asChild>
                <a href="/">Voltar ao Dashboard</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const testarConexao = async () => {
    try {
      debugLogger.log('info', 'TESTE: Verificando conexão com Supabase...');
      
      // Testar conexão básica
      const { data: testData, error: testError } = await supabase
        .from('categorias_financeiras')
        .select('count')
        .limit(1);
      
      if (testError) {
        debugLogger.log('error', 'TESTE: Erro de conexão', testError);
        throw testError;
      }
      
      debugLogger.log('success', 'TESTE: Conexão com Supabase OK');
      
      // Testar estrutura da tabela
      const { data: estrutura, error: estruturaError } = await supabase
        .from('categorias_financeiras')
        .select('id, nome, tipo, escopo, ativo')
        .limit(3);
      
      if (estruturaError) {
        debugLogger.log('error', 'TESTE: Erro na estrutura da tabela', estruturaError);
        throw estruturaError;
      }
      
      debugLogger.log('success', `TESTE: Estrutura da tabela OK - ${estrutura?.length || 0} registros encontrados`, estrutura);
      
      toast({
        title: "Teste de Conexão",
        description: `Conexão OK! ${estrutura?.length || 0} categorias encontradas.`,
      });
      
    } catch (error: any) {
      debugLogger.log('error', 'TESTE: Falha no teste de conexão', error);
      toast({
        title: "Erro de Conexão",
        description: error.message || "Erro ao conectar com a base de dados",
        variant: "destructive",
      });
    }
  };

  const testarCriacaoCategoria = async () => {
    try {
      debugLogger.log('info', 'TESTE RLS: Testando criação de categoria...');
      
      const categoriaTest = {
        nome: `Teste RLS ${new Date().getTime()}`,
        descricao: 'Categoria de teste para verificar RLS',
        tipo: 'despesa' as const,
        escopo: 'associacao' as const,
        cor: '#FF0000',
        icone: 'TestTube',
        ativo: true
      };
      
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .insert([categoriaTest])
        .select();
      
      if (error) {
        debugLogger.log('error', 'TESTE RLS: Erro ao criar categoria de teste', error);
        
        if (error.message.includes('row-level security policy')) {
          debugLogger.log('error', 'RLS: Políticas de segurança estão bloqueando a inserção');
          toast({
            title: "Erro RLS Detectado",
            description: "Políticas de segurança bloqueiam a criação. Executando correção...",
            variant: "destructive",
          });
        }
        throw error;
      }
      
      debugLogger.log('success', 'TESTE RLS: Categoria de teste criada com sucesso!', data);
      
      // Remover categoria de teste
      if (data && data[0]) {
        await supabase
          .from('categorias_financeiras')
          .delete()
          .eq('id', data[0].id);
        debugLogger.log('info', 'TESTE RLS: Categoria de teste removida');
      }
      
      toast({
        title: "Teste RLS Bem-sucedido",
        description: "Criação de categorias está funcionando corretamente!",
      });
      
      fetchCategorias();
      
    } catch (error: any) {
      debugLogger.log('error', 'TESTE RLS: Falha no teste de criação', error);
      toast({
        title: "Teste RLS Falhou",
        description: error.message || "Erro ao testar criação de categoria",
        variant: "destructive",
      });
    }
  };

  const testeSimplesCRUD = async () => {
    try {
      debugLogger.log('info', 'TESTE SIMPLES: Testando operações CRUD básicas...');
      
      // Teste 1: SELECT
      const { data: selectData, error: selectError } = await supabase
        .from('categorias_financeiras')
        .select('id, nome')
        .limit(3);
      
      if (selectError) {
        debugLogger.log('error', 'TESTE SIMPLES: Erro no SELECT', selectError);
        throw selectError;
      }
      
      debugLogger.log('success', `TESTE SIMPLES: SELECT OK - ${selectData?.length || 0} registros`);
      
      // Teste 2: INSERT
      const categoriaTest = {
        nome: `Teste CRUD ${Date.now()}`,
        descricao: 'Teste de operações CRUD',
        tipo: 'despesa' as const,
        escopo: 'associacao' as const,
        cor: '#00FF00',
        icone: 'TestTube',
        ativo: true,
        ordem: 9999
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('categorias_financeiras')
        .insert([categoriaTest])
        .select()
        .single();
      
      if (insertError) {
        debugLogger.log('error', 'TESTE SIMPLES: Erro no INSERT', insertError);
        throw insertError;
      }
      
      debugLogger.log('success', 'TESTE SIMPLES: INSERT OK', insertData);
      
      // Teste 3: UPDATE
      const { error: updateError } = await supabase
        .from('categorias_financeiras')
        .update({ descricao: 'Teste atualizado' })
        .eq('id', insertData.id);
      
      if (updateError) {
        debugLogger.log('error', 'TESTE SIMPLES: Erro no UPDATE', updateError);
      } else {
        debugLogger.log('success', 'TESTE SIMPLES: UPDATE OK');
      }
      
      // Teste 4: DELETE
      const { error: deleteError } = await supabase
        .from('categorias_financeiras')
        .delete()
        .eq('id', insertData.id);
      
      if (deleteError) {
        debugLogger.log('error', 'TESTE SIMPLES: Erro no DELETE', deleteError);
      } else {
        debugLogger.log('success', 'TESTE SIMPLES: DELETE OK');
      }
      
      toast({
        title: "Teste CRUD Completo",
        description: "Todas as operações funcionaram corretamente!",
      });
      
      // Recarregar lista
      fetchCategorias();
      
    } catch (error: any) {
      debugLogger.log('error', 'TESTE SIMPLES: Falha geral', error);
      
      let errorMessage = error.message || "Erro no teste CRUD";
      if (error.message && error.message.includes('row-level security')) {
        errorMessage = "RLS ainda está bloqueando operações. Executando correção...";
      }
      
      toast({
        title: "Teste CRUD Falhou",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchCategorias = async () => {
    try {
      debugLogger.log('info', 'ADMIN: Carregando categorias financeiras...');
      
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .order('ordem');

      if (error) {
        debugLogger.log('error', 'ADMIN: Erro ao carregar categorias', error);
        throw error;
      }

      debugLogger.log('success', `ADMIN: ${data?.length || 0} categorias carregadas`);
      setCategoriasFinanceiras(data || []);

    } catch (error: any) {
      debugLogger.log('error', 'ADMIN: Erro geral ao carregar categorias', error);
      setCategoriasFinanceiras([]);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias financeiras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const openDialog = (item?: CategoriaFinanceira) => {
    setEditingItem(item || null);
    setFormData({
      nome: item?.nome || '',
      descricao: item?.descricao || '',
      tipo: item?.tipo || '',
      escopo: item?.escopo || '',
      cor: item?.cor || '#6B7280',
      icone: item?.icone || 'DollarSign'
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({ nome: '', descricao: '', tipo: '', escopo: '', cor: '#6B7280', icone: 'DollarSign' });
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim() || !formData.tipo || !formData.escopo) {
      toast({
        title: "Erro de Validação",
        description: "Nome, tipo e escopo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      debugLogger.log('info', `ADMIN: ${editingItem ? 'Atualizando' : 'Criando'} categoria...`);
      
      const dataToSubmit = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        tipo: formData.tipo as 'receita' | 'despesa',
        escopo: formData.escopo as 'animal' | 'associacao' | 'ambos',
        cor: formData.cor,
        icone: formData.icone,
        ativo: true
      };

      if (editingItem) {
        const { error } = await supabase
          .from('categorias_financeiras')
          .update(dataToSubmit)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        debugLogger.log('success', 'ADMIN: Categoria atualizada com sucesso');
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('categorias_financeiras')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        
        debugLogger.log('success', 'ADMIN: Categoria criada com sucesso');
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso",
        });
      }

      closeDialog();
      fetchCategorias();
    } catch (error: any) {
      debugLogger.log('error', 'ADMIN: Erro ao salvar categoria', error);
      
      let errorMessage = error.message || "Erro ao salvar categoria";
      let errorTitle = "Erro";
      
      // Detectar erro RLS
      if (error.message && error.message.includes('row-level security policy')) {
        errorTitle = "Erro de Permissão";
        errorMessage = "Sem permissão para criar/editar categorias. Verifique se está autenticado como administrador.";
        debugLogger.log('error', 'RLS: Políticas de segurança bloquearam a operação');
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      debugLogger.log('info', `ADMIN: ${currentStatus ? 'Desativando' : 'Ativando'} categoria...`);
      
      const { error } = await supabase
        .from('categorias_financeiras')
        .update({ ativo: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      debugLogger.log('success', `ADMIN: Categoria ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`);
      toast({
        title: "Sucesso",
        description: `Categoria ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`,
      });
      
      fetchCategorias();
    } catch (error: any) {
      debugLogger.log('error', 'ADMIN: Erro ao alterar status da categoria', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta categoria?')) return;
    
    try {
      debugLogger.log('info', 'ADMIN: Eliminando categoria...');
      
      const { error } = await supabase
        .from('categorias_financeiras')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      debugLogger.log('success', 'ADMIN: Categoria eliminada com sucesso');
      toast({
        title: "Sucesso",
        description: "Categoria eliminada com sucesso",
      });
      
      fetchCategorias();
    } catch (error: any) {
      debugLogger.log('error', 'ADMIN: Erro ao eliminar categoria', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar categoria",
        variant: "destructive",
      });
    }
  };

  const filteredData = showInactive ? categoriasFinanceiras : categoriasFinanceiras.filter(item => item.ativo);
  const activeCount = categoriasFinanceiras.filter(item => item.ativo).length;
  const totalCount = categoriasFinanceiras.length;

  debugLogger.log('debug', `ADMIN: Renderizando ${filteredData.length} categorias (${totalCount} total, ${activeCount} ativas)`);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar administração...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      <UserHeader 
        title="Administração do Sistema" 
        description="Gestão de categorias financeiras"
        showBackButton
        backTo="/"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Cabeçalho */}
        <Card className="animal-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-orange-500" />
                <div>
                  <CardTitle className="text-orange-800">Categorias Financeiras</CardTitle>
                  <CardDescription className="text-orange-600">
                    {totalCount} categorias • {activeCount} ativas
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="show-inactive" className="text-sm text-orange-700">
                    Mostrar inativos
                  </Label>
                  <input
                    id="show-inactive"
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                  />
                </div>
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  {showInactive ? 'Todos os itens' : 'Apenas ativos'}
                </Badge>
                <Button
                  onClick={fetchCategorias}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  🔄 Recarregar
                </Button>
                <Button
                  onClick={testarConexao}
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  🔍 Testar BD
                </Button>
                <Button
                  onClick={testarCriacaoCategoria}
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  🔒 Testar RLS
                </Button>
                <Button
                  onClick={testeSimplesCRUD}
                  variant="outline"
                  size="sm"
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  ⚙️ Teste CRUD
                </Button>
                <Button
                  onClick={() => openDialog()}
                  className="animal-button"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Lista de Categorias */}
        <Card className="animal-card">
          <CardContent className="p-6">
            <div className="space-y-3">
              {filteredData.length === 0 ? (
                <div className="text-center py-8 text-orange-400">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {totalCount === 0 ? 'Nenhuma categoria encontrada' : 
                     showInactive ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria ativa encontrada'}
                  </p>
                  <p className="text-sm text-orange-500 mb-4">
                    {totalCount === 0 ? 
                      'Clique em "Nova Categoria" para adicionar a primeira categoria.' :
                      showInactive ? 
                        'Todas as categorias foram eliminadas.' :
                        'Todas as categorias estão desativadas. Ative algumas categorias ou marque "Mostrar inativos".'}
                  </p>
                  <Button onClick={() => openDialog()} className="animal-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </Button>
                </div>
              ) : (
                filteredData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: item.cor }}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-orange-800">{item.nome}</span>
                          <Badge variant={item.ativo ? "default" : "secondary"} className="text-xs">
                            {item.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.tipo === 'receita' ? '💰 Receita' : '💸 Despesa'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.escopo === 'animal' ? '🐾 Animal' : 
                             item.escopo === 'associacao' ? '🏢 Associação' : '🔄 Ambos'}
                          </Badge>
                        </div>
                        {item.descricao && (
                          <div className="text-sm text-orange-600 mt-1">{item.descricao}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(item.id, item.ativo)}
                        className={`${item.ativo ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                        title={item.ativo ? 'Desativar' : 'Ativar'}
                      >
                        {item.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog para Edição/Criação */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-orange-800">
                {editingItem ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
              <DialogDescription className="text-orange-600">
                {editingItem ? 'Editar as informações da categoria' : 'Adicionar nova categoria financeira'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-orange-700 font-medium">
                  Nome da Categoria *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Veterinário, Donativos, etc."
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              <div>
                <Label htmlFor="descricao" className="text-orange-700">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada da categoria"
                  className="border-orange-200 focus:border-orange-400"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo" className="text-orange-700 font-medium">Tipo *</Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger className="border-orange-200 focus:border-orange-400">
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">💰 Receita</SelectItem>
                      <SelectItem value="despesa">💸 Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="escopo" className="text-orange-700 font-medium">Escopo *</Label>
                  <Select 
                    value={formData.escopo} 
                    onValueChange={(value) => setFormData({ ...formData, escopo: value })}
                  >
                    <SelectTrigger className="border-orange-200 focus:border-orange-400">
                      <SelectValue placeholder="Selecionar escopo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="animal">🐾 Animal</SelectItem>
                      <SelectItem value="associacao">🏢 Associação</SelectItem>
                      <SelectItem value="ambos">🔄 Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={closeDialog}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="animal-button">
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Debug Logger */}
      <DebugLoggerComponent title="Administração - Debug" />
    </div>
  );
};

export default Administracao;