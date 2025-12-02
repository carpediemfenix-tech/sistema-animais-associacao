import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  GraduationCap, 
  AlertCircle,
  Plus,
  Users,
  TrendingUp,
  Award,
  Loader2,
  Save,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  BookOpen,
  Sprout,
  Shield,
  Sword,
  Crown,
  User,
  Heart,
  Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { supabase } from "@/lib/supabase";

const GestaoFormacao = () => {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [voluntarios, setVoluntarios] = useState([]);
  const [niveisFormacao, setNiveisFormacao] = useState([]);
  const [especializacoes, setEspecializacoes] = useState([]);
  const [progressoes, setProgressoes] = useState([]);
  
  // Estados do diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVoluntario, setSelectedVoluntario] = useState("");
  const [selectedNivel, setSelectedNivel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem gerir formação
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

      // Carregar voluntários com nível atual
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select(`
          *,
          nivel_formacao:nivel_formacao_atual(*)
        `)
        .eq('ativo', true)
        .order('nome');

      if (voluntariosError) throw voluntariosError;

      // Carregar níveis de formação
      const { data: niveisData, error: niveisError } = await supabase
        .from('niveis_formacao')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (niveisError) throw niveisError;

      // Carregar especializações
      const { data: especializacoesData, error: especializacoesError } = await supabase
        .from('especializacoes')
        .select('*')
        .eq('ativo', true);

      if (especializacoesError) throw especializacoesError;

      // Carregar progressões recentes
      const { data: progressoesData, error: progressoesError } = await supabase
        .from('voluntario_progressao')
        .select(`
          *,
          voluntario:voluntario_id(nome),
          nivel:nivel_id(nome, codigo, cor)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (progressoesError) throw progressoesError;

      setVoluntarios(voluntariosData || []);
      setNiveisFormacao(niveisData || []);
      setEspecializacoes(especializacoesData || []);
      setProgressoes(progressoesData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de formação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAtribuirNivel = async () => {
    if (!selectedVoluntario || !selectedNivel) {
      toast({
        title: "Erro",
        description: "Selecione um voluntário e um nível",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Criar progressão
      const { error: progressaoError } = await supabase
        .from('voluntario_progressao')
        .insert([{
          voluntario_id: selectedVoluntario,
          nivel_id: selectedNivel,
          data_inicio: new Date().toISOString().split('T')[0],
          data_conclusao: new Date().toISOString().split('T')[0],
          certificado_emitido: true,
          observacoes: observacoes.trim() || null
        }]);

      if (progressaoError) throw progressaoError;

      // Atualizar nível atual do voluntário
      const { error: voluntarioError } = await supabase
        .from('voluntarios')
        .update({ nivel_formacao_atual: selectedNivel })
        .eq('id', selectedVoluntario);

      if (voluntarioError) throw voluntarioError;

      toast({
        title: "Sucesso",
        description: "Nível de formação atribuído com sucesso",
      });

      setDialogOpen(false);
      setSelectedVoluntario("");
      setSelectedNivel("");
      setObservacoes("");
      loadData();

    } catch (error: any) {
      console.error('Erro ao atribuir nível:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atribuir nível de formação",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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

  const getEspecializacaoIcon = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_VET': return <Heart className="h-4 w-4" />;
      case 'FORMA_RESCUE': return <Zap className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  // Calcular estatísticas
  const estatisticas = {
    totalVoluntarios: voluntarios.length,
    distribuicaoPorNivel: niveisFormacao.map(nivel => ({
      nivel,
      quantidade: voluntarios.filter(v => v.nivel_formacao_atual === nivel.id).length
    })),
    progressoesRecentes: progressoes.length,
    voluntariosSemNivel: voluntarios.filter(v => !v.nivel_formacao_atual).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando gestão de formação...</p>
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
              <GraduationCap className="h-8 w-8 mr-3 text-blue-600" />
              Gestão de Formação
            </h1>
            <p className="text-gray-600 mt-1">
              Gerir progressão formativa dos voluntários Valentão
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/voluntarios">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Voluntários
              </Button>
            </Link>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Atribuir Formação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atribuir Nível de Formação</DialogTitle>
                  <DialogDescription>
                    Atribua um nível de formação a um voluntário
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  
                  {/* Voluntário */}
                  <div>
                    <Label htmlFor="voluntario">Voluntário</Label>
                    <Select value={selectedVoluntario} onValueChange={setSelectedVoluntario}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar voluntário" />
                      </SelectTrigger>
                      <SelectContent>
                        {voluntarios.map((voluntario) => (
                          <SelectItem key={voluntario.id} value={voluntario.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{voluntario.nome}</span>
                              {voluntario.nivel_formacao && (
                                <Badge 
                                  variant="secondary" 
                                  style={{ backgroundColor: `${voluntario.nivel_formacao.cor}20`, color: voluntario.nivel_formacao.cor }}
                                  className="ml-2"
                                >
                                  {voluntario.nivel_formacao.codigo}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Nível */}
                  <div>
                    <Label htmlFor="nivel">Nível de Formação</Label>
                    <Select value={selectedNivel} onValueChange={setSelectedNivel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar nível" />
                      </SelectTrigger>
                      <SelectContent>
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

                  {/* Observações */}
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Observações sobre a atribuição"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAtribuirNivel} disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Atribuir
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Voluntários</p>
                  <p className="text-2xl font-bold">{estatisticas.totalVoluntarios}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sem Nível</p>
                  <p className="text-2xl font-bold text-orange-600">{estatisticas.voluntariosSemNivel}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progressões</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.progressoesRecentes}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Níveis Ativos</p>
                  <p className="text-2xl font-bold text-purple-600">{niveisFormacao.length}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Página em Desenvolvimento
            </CardTitle>
            <CardDescription>
              Esta página está a ser implementada. Funcionalidade completa em breve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Gestão de Formação Valentão
              </h3>
              <p className="text-gray-500 mb-6">
                Funcionalidades de atribuição de níveis, progressão e relatórios formativos
              </p>
              <Link to="/voluntarios">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestaoFormacao;