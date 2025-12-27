import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  GraduationCap,
  Calendar,
  Clock,
  Star,
  Award,
  FileText,
  Filter,
  Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface FormacaoFrequentada {
  id: string;
  status: string;
  data_inscricao: string;
  data_avaliacao?: string;
  nota_final?: number;
  resultado?: string;
  relatorio_desempenho?: string;
  acao_formacao: {
    id: string;
    codigo_acao: string;
    nome_acao: string;
    data_inicio: string;
    data_fim: string;
    carga_horaria_real: number;
    tipo_formacao: {
      codigo: string;
      nome: string;
      icone: string;
      cor: string;
    };
  };
}

const FormacoesFrequentadas: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [voluntario, setVoluntario] = useState<any>(null);
  const [formacoes, setFormacoes] = useState<FormacaoFrequentada[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroResultado, setFiltroResultado] = useState('todos');
  const [termoPesquisa, setTermoPesquisa] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar dados do voluntário
      const { data: voluntarioData, error: voluntarioError } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('id', id)
        .single();

      if (voluntarioError) throw voluntarioError;
      setVoluntario(voluntarioData);

      // Carregar formações frequentadas
      const { data: formacoesData, error: formacoesError } = await supabase
        .from('participacoes_formacao')
        .select(`
          *,
          acao_formacao:acoes_formacao(
            id,
            codigo_acao,
            nome_acao,
            data_inicio,
            data_fim,
            carga_horaria_real,
            tipo_formacao:tipos_formacao(
              codigo,
              nome,
              icone,
              cor
            )
          )
        `)
        .eq('voluntario_id', id)
        .order('data_inscricao', { ascending: false });

      if (formacoesError) throw formacoesError;
      setFormacoes(formacoesData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "🚨 Erro",
        description: "Erro ao carregar formações do voluntário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formacoesFiltered = formacoes.filter(formacao => {
    const matchesResultado = filtroResultado === 'todos' || 
                            (filtroResultado === 'aprovado' && formacao.resultado === 'aprovado') ||
                            (filtroResultado === 'reprovado' && formacao.resultado === 'reprovado') ||
                            (filtroResultado === 'em_curso' && formacao.status === 'inscrito') ||
                            (filtroResultado === 'em_avaliacao' && formacao.status === 'em_avaliacao');
    
    const matchesPesquisa = !termoPesquisa || 
                           formacao.acao_formacao.nome_acao.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                           formacao.acao_formacao.codigo_acao.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                           formacao.acao_formacao.tipo_formacao.nome.toLowerCase().includes(termoPesquisa.toLowerCase());
    
    return matchesResultado && matchesPesquisa;
  });

  const getStatusBadge = (formacao: FormacaoFrequentada) => {
    if (formacao.status === 'concluido') {
      return (
        <Badge 
          variant={formacao.resultado === 'aprovado' ? 'default' : 'destructive'}
          className={formacao.resultado === 'aprovado' ? 'bg-green-600' : ''}
        >
          {formacao.resultado === 'aprovado' ? '✅ Aprovado' : '❌ Reprovado'}
        </Badge>
      );
    } else if (formacao.status === 'em_avaliacao') {
      return <Badge variant="secondary">📝 Em Avaliação</Badge>;
    } else if (formacao.status === 'inscrito') {
      return <Badge variant="outline">📚 Em Curso</Badge>;
    } else {
      return <Badge variant="outline">{formacao.status}</Badge>;
    }
  };

  const estatisticas = {
    total: formacoes.length,
    aprovadas: formacoes.filter(f => f.resultado === 'aprovado').length,
    reprovadas: formacoes.filter(f => f.resultado === 'reprovado').length,
    em_curso: formacoes.filter(f => f.status === 'inscrito').length,
    em_avaliacao: formacoes.filter(f => f.status === 'em_avaliacao').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando formações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />
      
      <PageActionBar
        breadcrumbs={[
          { label: 'Voluntários', href: '/voluntarios', icon: <Users className="h-4 w-4" /> },
          { label: voluntario?.nome || 'Voluntário', href: `/voluntarios/perfil/${id}` },
          { label: 'Formações', icon: <GraduationCap className="h-4 w-4" /> }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{estatisticas.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{estatisticas.aprovadas}</p>
                <p className="text-sm text-gray-600">Aprovadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{estatisticas.reprovadas}</p>
                <p className="text-sm text-gray-600">Reprovadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{estatisticas.em_curso}</p>
                <p className="text-sm text-gray-600">Em Curso</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{estatisticas.em_avaliacao}</p>
                <p className="text-sm text-gray-600">Em Avaliação</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Pesquisar formações..."
                    value={termoPesquisa}
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filtroResultado} onValueChange={setFiltroResultado}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="aprovado">Aprovadas</SelectItem>
                  <SelectItem value="reprovado">Reprovadas</SelectItem>
                  <SelectItem value="em_curso">Em Curso</SelectItem>
                  <SelectItem value="em_avaliacao">Em Avaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Formações */}
        <div className="space-y-4">
          {formacoesFiltered.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {termoPesquisa || filtroResultado !== 'todos' ? 
                      'Nenhuma formação encontrada com os filtros aplicados' : 
                      'Nenhuma formação frequentada ainda'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            formacoesFiltered.map((formacao) => (
              <Card key={formacao.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div 
                        className="text-3xl p-2 rounded-lg"
                        style={{ backgroundColor: `${formacao.acao_formacao.tipo_formacao.cor}20` }}
                      >
                        {formacao.acao_formacao.tipo_formacao.icone}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{formacao.acao_formacao.nome_acao}</h3>
                          {getStatusBadge(formacao)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {formacao.acao_formacao.tipo_formacao.nome} • {formacao.acao_formacao.codigo_acao}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(formacao.acao_formacao.data_inicio).toLocaleDateString('pt-PT')} - {' '}
                              {new Date(formacao.acao_formacao.data_fim).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formacao.acao_formacao.carga_horaria_real}h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Avaliação */}
                  {formacao.status === 'concluido' && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <Award className="h-4 w-4" />
                        <span>Resultado da Avaliação</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">Nota Final:</span>
                            <Badge variant="outline" className="font-bold">
                              {formacao.nota_final}/20
                            </Badge>
                          </div>
                          {formacao.data_avaliacao && (
                            <p className="text-sm text-gray-600">
                              Avaliado em: {new Date(formacao.data_avaliacao).toLocaleDateString('pt-PT')}
                            </p>
                          )}
                        </div>
                        {formacao.relatorio_desempenho && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">Relatório:</span>
                            </div>
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                              {formacao.relatorio_desempenho}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Informações de Inscrição */}
                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    Inscrito em: {new Date(formacao.data_inscricao).toLocaleDateString('pt-PT')}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default FormacoesFrequentadas;