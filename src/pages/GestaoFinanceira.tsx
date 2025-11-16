import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Euro, Plus, TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MovimentoFinanceiro, Animal, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const GestaoFinanceira = () => {
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: "",
    tipo_movimento: "",
    categoria: "",
    descricao: "",
    valor: "",
    data_movimento: new Date().toISOString().split('T')[0],
    voluntario_id: "",
    observacoes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar movimentos financeiros
      const { data: movimentosData, error: movimentosError } = await supabase
        .from('movimentos_financeiros_2025_11_16_18_00')
        .select(`
          *,
          animal:animais_2025_11_13_03_23(nome),
          voluntario:voluntarios_2025_11_16_18_00(nome)
        `)
        .order('data_movimento', { ascending: false });

      if (movimentosError) throw movimentosError;

      // Buscar animais ativos
      const { data: animaisData, error: animaisError } = await supabase
        .from('animais_2025_11_13_03_23')
        .select('id, nome')
        .eq('arquivado', false)
        .order('nome');

      if (animaisError) throw animaisError;

      // Buscar voluntários ativos
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios_2025_11_16_18_00')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (voluntariosError) throw voluntariosError;

      setMovimentos(movimentosData || []);
      setAnimais(animaisData || []);
      setVoluntarios(voluntariosData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo_movimento || !formData.categoria || !formData.descricao || !formData.valor) {
      toast({
        title: "Campos obrigatórios",
        description: "Tipo, categoria, descrição e valor são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('movimentos_financeiros_2025_11_16_18_00')
        .insert({
          animal_id: formData.animal_id || null,
          tipo_movimento: formData.tipo_movimento,
          categoria: formData.categoria,
          descricao: formData.descricao,
          valor: parseFloat(formData.valor),
          data_movimento: formData.data_movimento,
          voluntario_id: formData.voluntario_id || null,
          observacoes: formData.observacoes || null
        });

      if (error) throw error;

      toast({
        title: "Movimento registado",
        description: `${formData.tipo_movimento} de €${formData.valor} registada com sucesso.`,
      });

      setDialogOpen(false);
      setFormData({
        animal_id: "",
        tipo_movimento: "",
        categoria: "",
        descricao: "",
        valor: "",
        data_movimento: new Date().toISOString().split('T')[0],
        voluntario_id: "",
        observacoes: ""
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Cálculos financeiros
  const totalReceitas = movimentos
    .filter(m => m.tipo_movimento === 'Receita')
    .reduce((sum, m) => sum + m.valor, 0);

  const totalDespesas = movimentos
    .filter(m => m.tipo_movimento === 'Despesa')
    .reduce((sum, m) => sum + m.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  // Movimentos por categoria
  const movimentosPorCategoria = movimentos.reduce((acc, movimento) => {
    const key = movimento.categoria;
    if (!acc[key]) {
      acc[key] = { receitas: 0, despesas: 0 };
    }
    if (movimento.tipo_movimento === 'Receita') {
      acc[key].receitas += movimento.valor;
    } else {
      acc[key].despesas += movimento.valor;
    }
    return acc;
  }, {} as Record<string, { receitas: number; despesas: number }>);

  // Movimentos dos últimos 30 dias
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
  
  const movimentosRecentes = movimentos.filter(m => 
    new Date(m.data_movimento) >= trintaDiasAtras
  );

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Veterinário": return "bg-red-500 text-white";
      case "Medicação": return "bg-blue-500 text-white";
      case "Alimentação": return "bg-green-500 text-white";
      case "Transporte": return "bg-yellow-500 text-white";
      case "Doação": return "bg-purple-500 text-white";
      case "Adoção": return "bg-pink-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">A carregar dados financeiros...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/images/BackgroundEraser_20250411_205630024.png" 
            alt="Valentão ao Resgate" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold">Gestão Financeira - Valentão ao Resgate</h1>
            <p className="text-muted-foreground">
              Controlo de receitas e despesas da associação
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Movimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registar Movimento Financeiro</DialogTitle>
                <DialogDescription>
                  Adicionar nova receita ou despesa
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_movimento">Tipo *</Label>
                    <Select value={formData.tipo_movimento} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, tipo_movimento: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Receita">Receita</SelectItem>
                        <SelectItem value="Despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={formData.categoria} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, categoria: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Veterinário">Veterinário</SelectItem>
                        <SelectItem value="Medicação">Medicação</SelectItem>
                        <SelectItem value="Alimentação">Alimentação</SelectItem>
                        <SelectItem value="Transporte">Transporte</SelectItem>
                        <SelectItem value="Doação">Doação</SelectItem>
                        <SelectItem value="Adoção">Adoção</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição do movimento"
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valor">Valor (€) *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor}
                      onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="data_movimento">Data</Label>
                    <Input
                      id="data_movimento"
                      type="date"
                      value={formData.data_movimento}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_movimento: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="animal_id">Animal (opcional)</Label>
                    <Select value={formData.animal_id} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, animal_id: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar animal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum animal específico</SelectItem>
                        {animais.map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="voluntario_id">Voluntário (opcional)</Label>
                    <Select value={formData.voluntario_id} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, voluntario_id: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar voluntário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum voluntário</SelectItem>
                        {voluntarios.map((voluntario) => (
                          <SelectItem key={voluntario.id} value={voluntario.id}>
                            {voluntario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Informações adicionais"
                    rows={3}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Registar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" asChild>
            <Link to="/">Voltar</Link>
          </Button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">€{totalReceitas.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">€{totalDespesas.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{saldo.toFixed(2)}
                </p>
              </div>
              <PiggyBank className={`h-8 w-8 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Movimentos (30d)</p>
                <p className="text-2xl font-bold">{movimentosRecentes.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movimentos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="movimentos">Movimentos</TabsTrigger>
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
        </TabsList>

        <TabsContent value="movimentos">
          <Card>
            <CardHeader>
              <CardTitle>Movimentos Recentes</CardTitle>
              <CardDescription>
                Últimos movimentos financeiros registados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {movimentos.length === 0 ? (
                <div className="text-center py-8">
                  <Euro className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum movimento registado</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece registando receitas e despesas da associação.
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registar Primeiro Movimento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {movimentos.slice(0, 10).map((movimento) => (
                    <div key={movimento.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${movimento.tipo_movimento === 'Receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {movimento.tipo_movimento === 'Receita' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{movimento.descricao}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge className={getCategoriaColor(movimento.categoria)}>
                              {movimento.categoria}
                            </Badge>
                            <span>{new Date(movimento.data_movimento).toLocaleDateString('pt-PT')}</span>
                            {movimento.animal && (
                              <span>• {movimento.animal.nome}</span>
                            )}
                            {movimento.voluntario && (
                              <span>• {movimento.voluntario.nome}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${movimento.tipo_movimento === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {movimento.tipo_movimento === 'Receita' ? '+' : '-'}€{movimento.valor.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Categoria</CardTitle>
              <CardDescription>
                Receitas e despesas organizadas por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(movimentosPorCategoria).map(([categoria, valores]) => (
                  <div key={categoria} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoriaColor(categoria)}>
                        {categoria}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Saldo: <span className={`font-bold ${(valores.receitas - valores.despesas) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          €{(valores.receitas - valores.despesas).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>Receitas:</span>
                        <span className="font-bold text-green-600">€{valores.receitas.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Despesas:</span>
                        <span className="font-bold text-red-600">€{valores.despesas.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GestaoFinanceira;