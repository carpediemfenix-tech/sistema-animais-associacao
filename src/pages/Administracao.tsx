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
  Users,
  PawPrint,
  Stethoscope,
  Activity,
  Eye,
  EyeOff,
  Save,
  X,
  Calendar,
  MapPin,
  Settings,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DebugLoggerComponent, { debugLogger } from "@/components/DebugLogger";

// Interfaces para todas as tabelas
interface Especie {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface Sexo {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface EspecialidadeVoluntario {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface TipoGrupo {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface TipoEvento {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface TipoLocalizacao {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface TipoIntervencao {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

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
}

const Administracao = () => {
  // Estados para todas as tabelas
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [sexos, setSexos] = useState<Sexo[]>([]);
  const [especialidadesVoluntarios, setEspecialidadesVoluntarios] = useState<EspecialidadeVoluntario[]>([]);
  const [tiposGrupos, setTiposGrupos] = useState<TipoGrupo[]>([]);
  const [tiposEventos, setTiposEventos] = useState<TipoEvento[]>([]);
  const [tiposLocalizacoes, setTiposLocalizacoes] = useState<TipoLocalizacao[]>([]);
  const [tiposIntervencoes, setTiposIntervencoes] = useState<TipoIntervencao[]>([]);
  const [categoriasFinanceiras, setCategoriasFinanceiras] = useState<CategoriaFinanceira[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentTable, setCurrentTable] = useState<string>('');
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

  const fetchAllData = async () => {
    try {
      setLoading(true);
      debugLogger.log('info', 'ADMIN: Carregando todas as tabelas de administração...');

      // Carregar todas as tabelas em paralelo
      const [
        especiesData,
        sexosData,
        especialidadesVoluntariosData,
        tiposGruposData,
        tiposEventosData,
        tiposLocalizacoesData,
        tiposIntervencoesData,
        categoriasFinanceirasData
      ] = await Promise.all([
        supabase.from('especies').select('*').order('nome'),
        supabase.from('sexos').select('*').order('nome'),
        supabase.from('especialidades_voluntarios').select('*').order('nome'),
        supabase.from('tipos_grupos').select('*').order('nome'),
        supabase.from('tipos_eventos').select('*').order('nome'),
        supabase.from('tipos_localizacoes').select('*').order('nome'),
        supabase.from('tipos_intervencoes').select('*').order('nome'),
        supabase.from('categorias_financeiras').select('*').order('ordem')
      ]);

      // Verificar erros e definir dados
      if (especiesData.error) debugLogger.log('error', 'Erro ao carregar espécies', especiesData.error);
      else setEspecies(especiesData.data || []);

      if (sexosData.error) debugLogger.log('error', 'Erro ao carregar sexos', sexosData.error);
      else setSexos(sexosData.data || []);

      if (especialidadesVoluntariosData.error) debugLogger.log('error', 'Erro ao carregar especialidades', especialidadesVoluntariosData.error);
      else setEspecialidadesVoluntarios(especialidadesVoluntariosData.data || []);

      if (tiposGruposData.error) debugLogger.log('error', 'Erro ao carregar tipos de grupos', tiposGruposData.error);
      else setTiposGrupos(tiposGruposData.data || []);

      if (tiposEventosData.error) debugLogger.log('error', 'Erro ao carregar tipos de eventos', tiposEventosData.error);
      else setTiposEventos(tiposEventosData.data || []);

      if (tiposLocalizacoesData.error) debugLogger.log('error', 'Erro ao carregar tipos de localizações', tiposLocalizacoesData.error);
      else setTiposLocalizacoes(tiposLocalizacoesData.data || []);

      if (tiposIntervencoesData.error) debugLogger.log('error', 'Erro ao carregar tipos de intervenções', tiposIntervencoesData.error);
      else setTiposIntervencoes(tiposIntervencoesData.data || []);

      if (categoriasFinanceirasData.error) debugLogger.log('error', 'Erro ao carregar categorias financeiras', categoriasFinanceirasData.error);
      else setCategoriasFinanceiras(categoriasFinanceirasData.data || []);

      debugLogger.log('success', 'ADMIN: Todas as tabelas carregadas com sucesso');

    } catch (error: any) {
      debugLogger.log('error', 'ADMIN: Erro geral ao carregar dados', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de administração",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openDialog = (tableName: string, item?: any) => {
    setCurrentTable(tableName);
    setEditingItem(item);
    
    if (tableName === 'categorias_financeiras') {
      setFormData({
        nome: item?.nome || '',
        descricao: item?.descricao || '',
        tipo: item?.tipo || '',
        escopo: item?.escopo || '',
        cor: item?.cor || '#6B7280',
        icone: item?.icone || 'DollarSign'
      });
    } else {
      setFormData({
        nome: item?.nome || '',
        descricao: item?.descricao || '',
        tipo: '',
        escopo: '',
        cor: '#6B7280',
        icone: 'DollarSign'
      });
    }
    
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setCurrentTable('');
    setFormData({ nome: '', descricao: '', tipo: '', escopo: '', cor: '#6B7280', icone: 'DollarSign' });
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro de Validação",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    // Validação específica para categorias financeiras
    if (currentTable === 'categorias_financeiras' && (!formData.tipo || !formData.escopo)) {
      toast({
        title: "Erro de Validação",
        description: "Tipo e escopo são obrigatórios para categorias financeiras",
        variant: "destructive",
      });
      return;
    }

    try {
      debugLogger.log('info', `ADMIN: ${editingItem ? 'Atualizando' : 'Criando'} item na tabela ${currentTable}`);
      
      let dataToSubmit: any = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        ativo: true
      };

      // Campos específicos para categorias financeiras
      if (currentTable === 'categorias_financeiras') {
        dataToSubmit = {
          ...dataToSubmit,
          tipo: formData.tipo,
          escopo: formData.escopo,
          cor: formData.cor,
          icone: formData.icone
        };
      }

      if (editingItem) {
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
      debugLogger.log('error', `ADMIN: Erro ao salvar item na tabela ${currentTable}`, error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar item",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (tableName: string, id: string, currentStatus: boolean) => {
    try {
      debugLogger.log('info', `ADMIN: ${currentStatus ? 'Desativando' : 'Ativando'} item na tabela ${tableName}`);
      
      const { error } = await supabase
        .from(tableName)
        .update({ ativo: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Item ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });
      
      fetchAllData();
    } catch (error: any) {
      debugLogger.log('error', `ADMIN: Erro ao alterar status na tabela ${tableName}`, error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (tableName: string, id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este item?')) return;
    
    try {
      debugLogger.log('info', `ADMIN: Eliminando item da tabela ${tableName}`);
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Item eliminado com sucesso",
      });
      
      fetchAllData();
    } catch (error: any) {
      debugLogger.log('error', `ADMIN: Erro ao eliminar item da tabela ${tableName}`, error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar item",
        variant: "destructive",
      });
    }
  };

  const renderTable = (title: string, data: any[], tableName: string, icon: any) => {
    const IconComponent = icon;
    const filteredData = showInactive ? data : data.filter(item => item.ativo);
    const activeCount = data.filter(item => item.ativo).length;
    const totalCount = data.length;

    return (
      <Card key={tableName} className="animal-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-5 w-5 text-orange-500" />
              <div>
                <CardTitle className="text-sm text-orange-800">{title}</CardTitle>
                <CardDescription className="text-xs text-orange-600">
                  {totalCount} itens • {activeCount} ativos
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => openDialog(tableName)}
              size="sm"
              className="animal-button text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Novo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {filteredData.length === 0 ? (
              <div className="text-center py-4 text-orange-400">
                <IconComponent className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {totalCount === 0 ? 'Nenhum item encontrado' : 'Nenhum item ativo'}
                </p>
              </div>
            ) : (
              filteredData.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border border-orange-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-orange-800 truncate">{item.nome}</span>
                      <Badge variant={item.ativo ? "default" : "secondary"} className="text-xs">
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {tableName === 'categorias_financeiras' && (
                        <>
                          <Badge variant="outline" className="text-xs">
                            {item.tipo === 'receita' ? '💰' : '💸'}
                          </Badge>
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: item.cor }}
                          />
                        </>
                      )}
                    </div>
                    {item.descricao && (
                      <p className="text-xs text-orange-600 truncate mt-1">{item.descricao}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(tableName, item.id, item.ativo)}
                      className="h-6 w-6 p-0"
                    >
                      {item.ativo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(tableName, item)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(tableName, item.id)}
                      className="h-6 w-6 p-0 text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            {filteredData.length > 5 && (
              <div className="text-center pt-2">
                <Badge variant="outline" className="text-xs">
                  +{filteredData.length - 5} mais itens
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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
        description="Gestão de campos e configurações do sistema"
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
                <Button
                  onClick={fetchAllData}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  🔄 Recarregar Tudo
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabelas de Gestão */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderTable("Espécies de Animais", especies, "especies", PawPrint)}
          {renderTable("Sexos de Animais", sexos, "sexos", Users)}
          {renderTable("Especialidades de Voluntários", especialidadesVoluntarios, "especialidades_voluntarios", Stethoscope)}
          {renderTable("Tipos de Grupos", tiposGrupos, "tipos_grupos", Users)}
          {renderTable("Tipos de Eventos", tiposEventos, "tipos_eventos", Calendar)}
          {renderTable("Tipos de Localizações", tiposLocalizacoes, "tipos_localizacoes", MapPin)}
          {renderTable("Tipos de Intervenções", tiposIntervencoes, "tipos_intervencoes", Settings)}
          {renderTable("Categorias Financeiras", categoriasFinanceiras, "categorias_financeiras", DollarSign)}
        </div>

        {/* Dialog para Edição/Criação */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-orange-800">
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </DialogTitle>
              <DialogDescription className="text-orange-600">
                {editingItem ? 'Editar as informações do item' : `Adicionar novo item à tabela ${currentTable}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-orange-700 font-medium">
                  Nome *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do item"
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
                  placeholder="Descrição detalhada (opcional)"
                  className="border-orange-200 focus:border-orange-400"
                  rows={3}
                />
              </div>

              {/* Campos específicos para categorias financeiras */}
              {currentTable === 'categorias_financeiras' && (
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
      
      {/* Debug Logger */}
      <DebugLoggerComponent title="Administração Completa - Debug" />
    </div>
  );
};

export default Administracao;