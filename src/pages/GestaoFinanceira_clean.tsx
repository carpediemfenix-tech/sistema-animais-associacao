import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileText,
  RefreshCw,
  CheckCircle,
  Loader2,
  X,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MovimentoFinanceiro {
  id: string;
  animal_id?: string;
  tipo_movimento: 'Receita' | 'Despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data_movimento: string;
  voluntario_id?: string;
  observacoes?: string;
  animal?: { nome: string; numero_processo?: string };
  voluntario?: { nome: string };
}

const GestaoFinanceira = () => {
  const { hasPermission } = useAuth();
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const fetchMovimentos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('💰 [FINANCEIRO] Carregando movimentos...');

      const { data, error } = await supabase
        .from('movimentos_financeiros')
        .select(`
          *,
          animais(nome, numero_processo)
        `)
        .order('data_movimento', { ascending: false });

      if (error) {
        console.error('❌ [FINANCEIRO] Erro:', error);
        throw error;
      }

      console.log('✅ [FINANCEIRO] Movimentos carregados:', data?.length || 0);
      setMovimentos(data || []);

    } catch (error: any) {
      console.error('💥 [FINANCEIRO] Erro geral:', error);
      setError(error.message);
      toast({
        title: "❌ Erro ao carregar dados",
        description: error.message || "Não foi possível carregar os movimentos financeiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimentos();
  }, []);

  // Cálculos financeiros
  const totalReceitas = movimentos
    .filter(m => m.tipo_movimento === 'Receita')
    .reduce((sum, m) => sum + m.valor, 0);

  const totalDespesas = movimentos
    .filter(m => m.tipo_movimento === 'Despesa')
    .reduce((sum, m) => sum + m.valor, 0);

  const saldoAtual = totalReceitas - totalDespesas;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  if (!hasPermission('read')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Não tem permissão para aceder à gestão financeira
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title="Gestão Financeira" 
        subtitle="Controlo de receitas, despesas e movimentos financeiros"
        backTo="/"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Cabeçalho com Novo Movimento */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Movimentos Financeiros</h2>
            <p className="text-gray-600">Registo e controlo de todas as transações</p>
          </div>
            
          {hasPermission('create') && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Movimento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Teste Modal</DialogTitle>
                  <DialogDescription>Modal básico funcionando</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p>✅ Modal básico funcionando!</p>
                  <p>🔧 Eko identificou que o problema não é estrutural.</p>
                  <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Receitas</p>
                  <p className="text-3xl font-bold text-green-700">{formatCurrency(totalReceitas)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Despesas</p>
                  <p className="text-3xl font-bold text-red-700">{formatCurrency(totalDespesas)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={`border-2 ${saldoAtual >= 0 ? 'border-blue-200' : 'border-orange-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                  <p className={`text-3xl font-bold ${saldoAtual >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {formatCurrency(saldoAtual)}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${saldoAtual >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Movimentos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Histórico de Movimentos</CardTitle>
                <CardDescription>
                  {movimentos.length} movimentos registados
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMovimentos}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {movimentos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum movimento registado</p>
                <p className="text-sm">Os movimentos financeiros aparecerão aqui</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentos.map((movimento) => (
                    <TableRow key={movimento.id}>
                      <TableCell>{formatDate(movimento.data_movimento)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={movimento.tipo_movimento === 'Receita' 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                          }
                        >
                          {movimento.tipo_movimento === 'Receita' ? '💰' : '💸'} {movimento.tipo_movimento}
                        </Badge>
                      </TableCell>
                      <TableCell>{movimento.categoria}</TableCell>
                      <TableCell>{movimento.descricao}</TableCell>
                      <TableCell>
                        {movimento.animal ? (
                          <span className="text-blue-600">
                            🐶 {movimento.animal.nome}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={movimento.tipo_movimento === 'Receita' ? 'text-green-600' : 'text-red-600'}>
                          {movimento.tipo_movimento === 'Receita' ? '+' : '-'}{formatCurrency(movimento.valor)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestaoFinanceira;