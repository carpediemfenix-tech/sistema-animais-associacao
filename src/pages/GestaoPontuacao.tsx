import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  Calculator, 
  Star, 
  Clock, 
  Users, 
  Award,
  Plus,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  TrendingUp,
  Target,
  Zap,
  Timer,
  Medal,
  Activity
} from "lucide-react";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";

// Interfaces
interface ConfigFuncao {
  id: string;
  funcao: string;
  pontos_base: number;
  multiplicador_coordenacao: number;
  multiplicador_especialista: number;
  bonus_lideranca: number;
  descricao: string;
  ativo: boolean;
}

interface ConfigEspecialidade {
  id: string;
  especialidade_codigo: string;
  nivel_experiencia: string;
  pontos_base: number;
  multiplicador_certificado: number;
  bonus_experiencia: number;
  descricao: string;
  ativo: boolean;
}

interface ConfigHoras {
  id: string;
  tipo_atividade: string;
  pontos_por_hora: number;
  minimo_horas: number;
  maximo_horas_dia: number;
  multiplicador_fim_semana: number;
  multiplicador_feriado: number;
  multiplicador_noturno: number;
  descricao: string;
  ativo: boolean;
}

interface ConfigMultiplicador {
  id: string;
  tipo: string;
  valor: string;
  multiplicador: number;
  bonus_adicional: number;
  descricao: string;
  ativo: boolean;
}

const GestaoPontuacao = () => {
  const { toast } = useToast();
  
  // Estados
  const [configFuncoes, setConfigFuncoes] = useState<ConfigFuncao[]>([]);
  const [configEspecialidades, setConfigEspecialidades] = useState<ConfigEspecialidade[]>([]);
  const [configHoras, setConfigHoras] = useState<ConfigHoras[]>([]);
  const [configMultiplicadores, setConfigMultiplicadores] = useState<ConfigMultiplicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("funcoes");
  
  // Estados para formulários
  const [editingFuncao, setEditingFuncao] = useState<ConfigFuncao | null>(null);
  const [editingEspecialidade, setEditingEspecialidade] = useState<ConfigEspecialidade | null>(null);
  const [editingHoras, setEditingHoras] = useState<ConfigHoras | null>(null);
  const [editingMultiplicador, setEditingMultiplicador] = useState<ConfigMultiplicador | null>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadAllConfigurations();
  }, []);

  const loadAllConfigurations = async () => {
    setLoading(true);
    try {
      // Carregar configurações de funções
      const { data: funcoesData, error: funcoesError } = await supabase
        .from('config_pontuacao_funcoes_2026_01_05_15_00')
        .select('*')
        .order('pontos_base', { ascending: false });

      if (funcoesError) throw funcoesError;
      setConfigFuncoes(funcoesData || []);

      // Carregar configurações de especialidades
      const { data: especialidadesData, error: especialidadesError } = await supabase
        .from('config_pontuacao_especialidades_2026_01_05_15_00')
        .select('*')
        .order('especialidade_codigo', { ascending: true });

      if (especialidadesError) throw especialidadesError;
      setConfigEspecialidades(especialidadesData || []);

      // Carregar configurações de horas
      const { data: horasData, error: horasError } = await supabase
        .from('config_pontuacao_horas_2026_01_05_15_00')
        .select('*')
        .order('pontos_por_hora', { ascending: false });

      if (horasError) throw horasError;
      setConfigHoras(horasData || []);

      // Carregar multiplicadores
      const { data: multiplicadoresData, error: multiplicadoresError } = await supabase
        .from('config_multiplicadores_2026_01_05_15_00')
        .select('*')
        .order('tipo', { ascending: true });

      if (multiplicadoresError) throw multiplicadoresError;
      setConfigMultiplicadores(multiplicadoresData || []);

    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções para salvar configurações
  const saveFuncao = async (funcao: Partial<ConfigFuncao>) => {
    try {
      if (funcao.id) {
        // Atualizar
        const { error } = await supabase
          .from('config_pontuacao_funcoes_2026_01_05_15_00')
          .update({
            ...funcao,
            updated_at: new Date().toISOString()
          })
          .eq('id', funcao.id);

        if (error) throw error;
      } else {
        // Criar novo
        const { error } = await supabase
          .from('config_pontuacao_funcoes_2026_01_05_15_00')
          .insert(funcao);

        if (error) throw error;
      }

      toast({
        title: "Configuração salva",
        description: "Configuração de função atualizada com sucesso",
      });

      loadAllConfigurations();
      setEditingFuncao(null);
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveEspecialidade = async (especialidade: Partial<ConfigEspecialidade>) => {
    try {
      if (especialidade.id) {
        const { error } = await supabase
          .from('config_pontuacao_especialidades_2026_01_05_15_00')
          .update({
            ...especialidade,
            updated_at: new Date().toISOString()
          })
          .eq('id', especialidade.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('config_pontuacao_especialidades_2026_01_05_15_00')
          .insert(especialidade);

        if (error) throw error;
      }

      toast({
        title: "Configuração salva",
        description: "Configuração de especialidade atualizada com sucesso",
      });

      loadAllConfigurations();
      setEditingEspecialidade(null);
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveHoras = async (horas: Partial<ConfigHoras>) => {
    try {
      if (horas.id) {
        const { error } = await supabase
          .from('config_pontuacao_horas_2026_01_05_15_00')
          .update({
            ...horas,
            updated_at: new Date().toISOString()
          })
          .eq('id', horas.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('config_pontuacao_horas_2026_01_05_15_00')
          .insert(horas);

        if (error) throw error;
      }

      toast({
        title: "Configuração salva",
        description: "Configuração de horas atualizada com sucesso",
      });

      loadAllConfigurations();
      setEditingHoras(null);
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveMultiplicador = async (multiplicador: Partial<ConfigMultiplicador>) => {
    try {
      if (multiplicador.id) {
        const { error } = await supabase
          .from('config_multiplicadores_2026_01_05_15_00')
          .update({
            ...multiplicador,
            updated_at: new Date().toISOString()
          })
          .eq('id', multiplicador.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('config_multiplicadores_2026_01_05_15_00')
          .insert(multiplicador);

        if (error) throw error;
      }

      toast({
        title: "Configuração salva",
        description: "Multiplicador atualizado com sucesso",
      });

      loadAllConfigurations();
      setEditingMultiplicador(null);
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Componente de formulário para funções
  const FuncaoForm = ({ funcao, onSave, onCancel }: {
    funcao: ConfigFuncao | null;
    onSave: (data: Partial<ConfigFuncao>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Partial<ConfigFuncao>>(
      funcao || {
        funcao: '',
        pontos_base: 10,
        multiplicador_coordenacao: 1.0,
        multiplicador_especialista: 1.0,
        bonus_lideranca: 0,
        descricao: '',
        ativo: true
      }
    );

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="funcao">Função</Label>
          <Input
            id="funcao"
            value={formData.funcao || ''}
            onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
            placeholder="Nome da função"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pontos_base">Pontos Base</Label>
            <Input
              id="pontos_base"
              type="number"
              value={formData.pontos_base || 0}
              onChange={(e) => setFormData({ ...formData, pontos_base: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="bonus_lideranca">Bônus Liderança</Label>
            <Input
              id="bonus_lideranca"
              type="number"
              value={formData.bonus_lideranca || 0}
              onChange={(e) => setFormData({ ...formData, bonus_lideranca: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mult_coord">Multiplicador Coordenação</Label>
            <Input
              id="mult_coord"
              type="number"
              step="0.1"
              value={formData.multiplicador_coordenacao || 1.0}
              onChange={(e) => setFormData({ ...formData, multiplicador_coordenacao: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="mult_esp">Multiplicador Especialista</Label>
            <Input
              id="mult_esp"
              type="number"
              step="0.1"
              value={formData.multiplicador_especialista || 1.0}
              onChange={(e) => setFormData({ ...formData, multiplicador_especialista: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao || ''}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Descrição da função"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ativo"
            checked={formData.ativo || false}
            onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
          />
          <Label htmlFor="ativo">Ativo</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calculator className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando configurações de pontuação...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <EnhancedHeader />
      
      <PageActionBar 
        title="Gestão de Pontuação"
        subtitle="Configure o sistema de pontuação para voluntários"
        actions={[
          {
            label: "Recarregar",
            onClick: loadAllConfigurations,
            icon: RotateCcw,
            variant: "outline"
          }
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calculator className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistema de Pontuação</h1>
              <p className="text-gray-600">Configure regras complexas para cálculo automático de pontos</p>
            </div>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Funções</p>
                    <p className="text-2xl font-bold">{configFuncoes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Especialidades</p>
                    <p className="text-2xl font-bold">{configEspecialidades.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Tipos de Horas</p>
                    <p className="text-2xl font-bold">{configHoras.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Multiplicadores</p>
                    <p className="text-2xl font-bold">{configMultiplicadores.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="funcoes" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Funções</span>
            </TabsTrigger>
            <TabsTrigger value="especialidades" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Especialidades</span>
            </TabsTrigger>
            <TabsTrigger value="horas" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Horas</span>
            </TabsTrigger>
            <TabsTrigger value="multiplicadores" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Multiplicadores</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba Funções */}
          <TabsContent value="funcoes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Configuração por Função</span>
                    </CardTitle>
                    <CardDescription>
                      Configure pontos base e multiplicadores para cada função de voluntário
                    </CardDescription>
                  </div>
                  <Dialog open={dialogOpen && editingFuncao !== null} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setEditingFuncao({} as ConfigFuncao);
                          setDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Função
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingFuncao?.id ? 'Editar Função' : 'Nova Função'}
                        </DialogTitle>
                        <DialogDescription>
                          Configure os parâmetros de pontuação para esta função
                        </DialogDescription>
                      </DialogHeader>
                      <FuncaoForm
                        funcao={editingFuncao}
                        onSave={saveFuncao}
                        onCancel={() => {
                          setEditingFuncao(null);
                          setDialogOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Função</TableHead>
                      <TableHead>Pontos Base</TableHead>
                      <TableHead>Mult. Coord.</TableHead>
                      <TableHead>Mult. Esp.</TableHead>
                      <TableHead>Bônus Liderança</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configFuncoes.map((funcao) => (
                      <TableRow key={funcao.id}>
                        <TableCell className="font-medium">{funcao.funcao}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{funcao.pontos_base} pts</Badge>
                        </TableCell>
                        <TableCell>{funcao.multiplicador_coordenacao}x</TableCell>
                        <TableCell>{funcao.multiplicador_especialista}x</TableCell>
                        <TableCell>+{funcao.bonus_lideranca}</TableCell>
                        <TableCell>
                          <Badge variant={funcao.ativo ? "default" : "secondary"}>
                            {funcao.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingFuncao(funcao);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outras abas serão implementadas de forma similar */}
          <TabsContent value="especialidades">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Configuração por Especialidade</span>
                </CardTitle>
                <CardDescription>
                  Configure pontos baseados na especialidade e nível de experiência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Medal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Configuração de especialidades em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="horas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Configuração por Horas</span>
                </CardTitle>
                <CardDescription>
                  Configure pontos por hora dedicada e multiplicadores temporais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Configuração de horas em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multiplicadores">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Multiplicadores</span>
                </CardTitle>
                <CardDescription>
                  Configure multiplicadores por prioridade, complexidade e urgência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Configuração de multiplicadores em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default GestaoPontuacao;