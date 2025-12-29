import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EnhancedHeader from "@/components/EnhancedHeader";
import PageActionBar from "@/components/PageActionBar";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Palette,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Activity
} from "lucide-react";

interface TipoEstado {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

const GestaoEstados: React.FC = () => {
  const { toast } = useToast();
  const [tiposEstado, setTiposEstado] = useState<TipoEstado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoEstado | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    cor: "#6B7280",
    ativo: true,
    ordem: 0
  });

  // Cores predefinidas
  const coresPredefinidas = [
    { nome: "Verde", valor: "#10B981" },
    { nome: "Azul", valor: "#3B82F6" },
    { nome: "Amarelo", valor: "#F59E0B" },
    { nome: "Vermelho", valor: "#EF4444" },
    { nome: "Cinza", valor: "#6B7280" },
    { nome: "Roxo", valor: "#8B5CF6" },
    { nome: "Laranja", valor: "#F97316" },
    { nome: "Rosa", valor: "#EC4899" },
    { nome: "Índigo", valor: "#6366F1" },
    { nome: "Teal", valor: "#14B8A6" }
  ];

  useEffect(() => {
    carregarTiposEstado();
  }, []);

  const carregarTiposEstado = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tipos_estado')
        .select('*')
        .order('ordem');

      if (error) throw error;
      setTiposEstado(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar tipos de estado:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tipos de estado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      cor: "#6B7280",
      ativo: true,
      ordem: tiposEstado.length
    });
    setEditingTipo(null);
  };

  const abrirDialogEdicao = (tipo: TipoEstado) => {
    setFormData({
      nome: tipo.nome,
      descricao: tipo.descricao || "",
      cor: tipo.cor,
      ativo: tipo.ativo,
      ordem: tipo.ordem
    });
    setEditingTipo(tipo);
    setIsDialogOpen(true);
  };

  const salvarTipoEstado = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTipo) {
        // Atualizar
        const { error } = await supabase
          .from('tipos_estado')
          .update({
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim() || null,
            cor: formData.cor,
            ativo: formData.ativo,
            ordem: formData.ordem
          })
          .eq('id', editingTipo.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tipo de estado atualizado com sucesso",
        });
      } else {
        // Criar novo
        const { error } = await supabase
          .from('tipos_estado')
          .insert({
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim() || null,
            cor: formData.cor,
            ativo: formData.ativo,
            ordem: formData.ordem
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tipo de estado criado com sucesso",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      carregarTiposEstado();

    } catch (error: any) {
      console.error('Erro ao salvar tipo de estado:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar tipo de estado",
        variant: "destructive",
      });
    }
  };

  const alternarAtivo = async (tipo: TipoEstado) => {
    try {
      const { error } = await supabase
        .from('tipos_estado')
        .update({ ativo: !tipo.ativo })
        .eq('id', tipo.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Tipo de estado ${!tipo.ativo ? 'ativado' : 'desativado'} com sucesso`,
      });

      carregarTiposEstado();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do tipo de estado",
        variant: "destructive",
      });
    }
  };

  const excluirTipoEstado = async (tipo: TipoEstado) => {
    try {
      const { error } = await supabase
        .from('tipos_estado')
        .delete()
        .eq('id', tipo.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tipo de estado excluído com sucesso",
      });

      carregarTiposEstado();
    } catch (error: any) {
      console.error('Erro ao excluir tipo de estado:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir tipo de estado. Pode estar em uso por algum animal.",
        variant: "destructive",
      });
    }
  };

  const alterarOrdem = async (tipo: TipoEstado, direcao: 'up' | 'down') => {
    const tiposOrdenados = [...tiposEstado].sort((a, b) => a.ordem - b.ordem);
    const indiceAtual = tiposOrdenados.findIndex(t => t.id === tipo.id);
    
    if (
      (direcao === 'up' && indiceAtual === 0) ||
      (direcao === 'down' && indiceAtual === tiposOrdenados.length - 1)
    ) {
      return;
    }

    const novoIndice = direcao === 'up' ? indiceAtual - 1 : indiceAtual + 1;
    const tipoTroca = tiposOrdenados[novoIndice];

    try {
      // Trocar ordens
      await supabase
        .from('tipos_estado')
        .update({ ordem: tipoTroca.ordem })
        .eq('id', tipo.id);

      await supabase
        .from('tipos_estado')
        .update({ ordem: tipo.ordem })
        .eq('id', tipoTroca.id);

      carregarTiposEstado();
    } catch (error: any) {
      console.error('Erro ao alterar ordem:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar ordem",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <PageActionBar
        title="Gestão de Estados"
        breadcrumbs={[
          { label: "Módulo Administrador", href: "/modulo-administrador" },
          { label: "Gestão de Estados", href: "/gestao-estados" }
        ]}
        badge={{ text: "Configuração", variant: "secondary" }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Gestão de Estados
            </h1>
            <p className="text-gray-600 mt-2">
              Configure os tipos de estado disponíveis para os animais
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo de Estado
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTipo ? 'Editar Tipo de Estado' : 'Novo Tipo de Estado'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: Ativo, Adotado, Em Tratamento..."
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descrição do tipo de estado..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Cor</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="color"
                      value={formData.cor}
                      onChange={(e) => setFormData({...formData, cor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <div className="flex flex-wrap gap-1">
                      {coresPredefinidas.map((cor) => (
                        <button
                          key={cor.valor}
                          type="button"
                          className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                          style={{ backgroundColor: cor.valor }}
                          onClick={() => setFormData({...formData, cor: cor.valor})}
                          title={cor.nome}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ordem">Ordem de Exibição</Label>
                  <Input
                    id="ordem"
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData({...formData, ordem: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="ativo">Ativo</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={salvarTipoEstado} className="flex-1">
                    {editingTipo ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Tipos de Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tipos de Estado Configurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tiposEstado.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum tipo de estado configurado
                </h3>
                <p className="text-gray-500 mb-4">
                  Configure os tipos de estado que os animais podem ter.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Tipo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tiposEstado
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((tipo) => (
                    <div 
                      key={tipo.id} 
                      className={`border rounded-lg p-4 ${tipo.ativo ? 'bg-white' : 'bg-gray-50 opacity-75'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: tipo.cor }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{tipo.nome}</h3>
                              <Badge 
                                variant={tipo.ativo ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {tipo.ativo ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                            {tipo.descricao && (
                              <p className="text-gray-600 text-sm mt-1">{tipo.descricao}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Ordem: {tipo.ordem}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Botões de ordem */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alterarOrdem(tipo, 'up')}
                            disabled={tiposEstado.findIndex(t => t.id === tipo.id) === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alterarOrdem(tipo, 'down')}
                            disabled={tiposEstado.findIndex(t => t.id === tipo.id) === tiposEstado.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>

                          {/* Botão ativar/desativar */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alternarAtivo(tipo)}
                          >
                            {tipo.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>

                          {/* Botão editar */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirDialogEdicao(tipo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Botão excluir */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o tipo de estado "{tipo.nome}"? 
                                  Esta ação não pode ser desfeita e pode afetar animais que usam este estado.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => excluirTipoEstado(tipo)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestaoEstados;