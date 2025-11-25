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
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings,
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  PawPrint,
  Stethoscope,
  Activity,
  Eye,
  EyeOff,
  Save,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  EspecieOpcao, 
  SexoOpcao, 
  EspecialidadeOpcao, 
  EstadoOpcao, 
  TipoIntervencaoOpcao 
} from "@/types/animal";

const Administracao = () => {
  const [especies, setEspecies] = useState<EspecieOpcao[]>([]);
  const [sexos, setSexos] = useState<SexoOpcao[]>([]);
  const [especialidades, setEspecialidades] = useState<EspecialidadeOpcao[]>([]);
  const [estados, setEstados] = useState<EstadoOpcao[]>([]);
  const [tiposIntervencoes, setTiposIntervencoes] = useState<TipoIntervencaoOpcao[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentTable, setCurrentTable] = useState<string>('');
  const [showInactive, setShowInactive] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    cor: ''
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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Carregando dados de administração
      
      const [
        especiesData,
        sexosData,
        especialidadesData,
        estadosData,
        tiposData
      ] = await Promise.all([
        supabase.from('especies_opcoes').select('*').order('nome'),
        supabase.from('sexos_opcoes').select('*').order('nome'),
        supabase.from('especialidades_opcoes').select('*').order('nome'),
        supabase.from('estados_opcoes').select('*').order('nome'),
        supabase.from('tipos_intervencoes_opcoes').select('*').order('nome')
      ]);

      // Dados carregados com sucesso

      // Verificar erros individuais
      if (especiesData.error) console.error('❌ Erro espécies:', especiesData.error);
      if (sexosData.error) console.error('❌ Erro sexos:', sexosData.error);
      if (especialidadesData.error) console.error('❌ Erro especialidades:', especialidadesData.error);
      if (estadosData.error) console.error('❌ Erro estados:', estadosData.error);
      if (tiposData.error) console.error('❌ Erro tipos intervenções:', tiposData.error);

      setEspecies(especiesData.data || []);
      setSexos(sexosData.data || []);
      setEspecialidades(especialidadesData.data || []);
      setEstados(estadosData.data || []);
      setTiposIntervencoes(tiposData.data || []);
      
      // Estados atualizados
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de administração",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (table: string, item?: any) => {
    setCurrentTable(table);
    setEditingItem(item);
    setFormData({
      nome: item?.nome || '',
      descricao: item?.descricao || '',
      categoria: item?.categoria || '',
      cor: item?.cor || ''
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setCurrentTable('');
    setFormData({ nome: '', descricao: '', categoria: '', cor: '' });
  };

  const handleSubmit = async () => {
    // Validação
    if (!formData.nome.trim()) {
      toast({
        title: "Erro de Validação",
        description: "O nome da opção é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataToSubmit = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        ...(formData.categoria && { categoria: formData.categoria.trim() }),
        ...(formData.cor && { cor: formData.cor.trim() }),
        ativo: true
      };

      if (editingItem) {
        // Atualizar
        const { error } = await supabase
          .from(currentTable)
          .update(dataToSubmit)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Item atualizado com sucesso",
        });
      } else {
        // Criar novo
        const { error } = await supabase
          .from(currentTable)
          .insert([dataToSubmit]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Item criado com sucesso",
        });
      }

      closeDialog();
      fetchAllData();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar item",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (table: string, id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ ativo: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Item ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });
      
      fetchAllData();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (table: string, id: number) => {
    if (!confirm('Tem certeza que deseja eliminar este item?')) return;
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Item eliminado com sucesso",
      });
      
      fetchAllData();
    } catch (error: any) {
      console.error('Erro ao eliminar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar item",
        variant: "destructive",
      });
    }
  };

  const renderTable = (title: string, data: any[], tableName: string, icon: any) => {
    const IconComponent = icon;
    const activeCount = data.filter(item => item.ativo).length;
    const totalCount = data.length;
    const filteredData = showInactive ? data : data.filter(item => item.ativo);
    
    return (
      <Card className="animal-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconComponent className="h-5 w-5 text-orange-500" />
              <div>
                <CardTitle className="text-orange-800">{title}</CardTitle>
                <CardDescription className="text-orange-600">
                  {activeCount} ativos de {totalCount} total
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => openDialog(tableName)}
              className="animal-button"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Opção
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredData.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={item.ativo ? "default" : "secondary"}
                    className={item.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                  >
                    {item.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  <div>
                    <div className="font-medium text-orange-900">{item.nome}</div>
                    {item.descricao && (
                      <div className="text-sm text-orange-600">{item.descricao}</div>
                    )}
                    {item.categoria && (
                      <div className="text-xs text-orange-500">Categoria: {item.categoria}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(tableName, item.id, item.ativo)}
                    className={`${item.ativo ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                    title={item.ativo ? 'Desativar' : 'Ativar'}
                  >
                    {item.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDialog(tableName, item)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(tableName, item.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-orange-400">
                <IconComponent className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {totalCount === 0 ? 'Nenhuma opção encontrada' : 
                   showInactive ? 'Nenhuma opção encontrada' : 'Nenhuma opção ativa encontrada'}
                </p>
                <p className="text-sm text-orange-500 mb-4">
                  {totalCount === 0 ? 
                    'Clique em "Nova Opção" para adicionar a primeira opção desta categoria.' :
                    showInactive ? 
                      'Todas as opções foram eliminadas.' :
                      'Todas as opções estão desativadas. Ative algumas opções ou marque "Mostrar inativos".'}
                </p>
                <Button 
                  onClick={() => openDialog(tableName)}
                  className="animal-button"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Opção
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-xl font-bold text-orange-800">Carregando Administração</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      <UserHeader 
        title="Administração do Sistema" 
        description="Gestão de campos e opções do sistema"
        showBackButton
        backTo="/"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Cabeçalho */}
        <Card className="animal-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-orange-500" />
                <div>
                  <CardTitle className="text-orange-800">Painel de Administração</CardTitle>
                  <CardDescription className="text-orange-600">
                    Gerir campos com opções e configurações do sistema
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
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabelas de Gestão */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderTable("Espécies", especies, "especies_opcoes", PawPrint)}
          {renderTable("Sexos", sexos, "sexos_opcoes", Users)}
          {renderTable("Especialidades", especialidades, "especialidades_opcoes", Stethoscope)}
          {renderTable("Estados", estados, "estados_opcoes", Activity)}
          {renderTable("Tipos de Intervenções", tiposIntervencoes, "tipos_intervencoes_opcoes", Settings)}
        </div>

        {/* Dialog para Edição/Criação */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-orange-800">
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </DialogTitle>
              <DialogDescription className="text-orange-600">
                {editingItem ? 'Editar as informações do item' : 'Adicionar novo item ao sistema'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-orange-700 font-medium">
                  Nome da Opção *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome da opção"
                  className={`border-orange-200 focus:border-orange-400 ${
                    !formData.nome.trim() ? 'border-red-300' : ''
                  }`}
                  required
                />
                {!formData.nome.trim() && (
                  <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="descricao" className="text-orange-700">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição opcional"
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>
              
              {(currentTable === 'especialidades_opcoes' || currentTable === 'tipos_intervencoes_opcoes') && (
                <div>
                  <Label htmlFor="categoria" className="text-orange-700">Categoria</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    placeholder="Categoria (opcional)"
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>
              )}
              
              {currentTable === 'estados_opcoes' && (
                <div>
                  <Label htmlFor="cor" className="text-orange-700">Cor</Label>
                  <Select value={formData.cor} onValueChange={(value) => setFormData({ ...formData, cor: value })}>
                    <SelectTrigger className="border-orange-200 focus:border-orange-400">
                      <SelectValue placeholder="Selecionar cor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="red">Vermelho</SelectItem>
                      <SelectItem value="yellow">Amarelo</SelectItem>
                      <SelectItem value="orange">Laranja</SelectItem>
                      <SelectItem value="purple">Roxo</SelectItem>
                      <SelectItem value="gray">Cinza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
    </div>
  );
};

export default Administracao;