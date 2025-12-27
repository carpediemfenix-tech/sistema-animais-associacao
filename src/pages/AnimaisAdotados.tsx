import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft,
  Search,
  Calendar,
  MapPin,
  User,
  FileText,
  Heart,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface AnimalAdotado {
  id: string;
  nome: string;
  especie: string;
  estado: string;
  created_at: string;
}

const AnimaisAdotados: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [animaisAdotados, setAnimaisAdotados] = useState<AnimalAdotado[]>([]);
  const [filteredAnimais, setFilteredAnimais] = useState<AnimalAdotado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAnimaisAdotados();
  }, []);

  useEffect(() => {
    // Filtrar animais baseado no termo de pesquisa
    if (searchTerm.trim() === '') {
      setFilteredAnimais(animaisAdotados);
    } else {
      const filtered = animaisAdotados.filter(animal =>
        animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.especie.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAnimais(filtered);
    }
  }, [searchTerm, animaisAdotados]);

  const loadAnimaisAdotados = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('animais')
        .select(`
          id,
          nome,
          especie,
          estado,
          created_at
        `)
        .eq('estado', 'Adotado')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar animais adotados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os animais adotados",
          variant: "destructive"
        });
        return;
      }

      setAnimaisAdotados(data || []);
      setFilteredAnimais(data || []);

    } catch (error) {
      console.error('Erro ao carregar animais adotados:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT');
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando animais adotados...</p>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="bg-gradient-to-br from-pink-50 to-rose-100 p-4 sm:p-6 flex-1">
        <div className="max-w-7xl mx-auto">
          
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-pink-600" />
                Animais Adotados
              </h1>
              <p className="text-gray-600 mt-1">
                Listagem completa de animais que encontraram um lar
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/modulo-animais">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Módulo Animais
                </Button>
              </Link>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Adotados</CardTitle>
                <Heart className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{animaisAdotados.length}</div>
                <p className="text-xs text-muted-foreground">
                  Animais com lar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cães Adotados</CardTitle>
                <Heart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {animaisAdotados.filter(a => a.especie === 'Cão').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cães felizes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gatos Adotados</CardTitle>
                <Heart className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {animaisAdotados.filter(a => a.especie === 'Gato').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gatos felizes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {animaisAdotados.filter(a => {
                    if (!a.created_at) return false;
                    const criadoDate = new Date(a.created_at);
                    const now = new Date();
                    return criadoDate.getMonth() === now.getMonth() && 
                           criadoDate.getFullYear() === now.getFullYear();
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Adoções recentes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Pesquisa */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Pesquisar Animais Adotados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Pesquisar por nome do animal ou espécie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="sm:w-auto w-full"
                >
                  Limpar
                </Button>
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-600 mt-2">
                  Encontrados {filteredAnimais.length} de {animaisAdotados.length} animais
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tabela de Animais Adotados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Lista de Animais Adotados ({filteredAnimais.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAnimais.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'Nenhum animal encontrado' : 'Nenhum animal adotado'}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? 'Tente ajustar os termos de pesquisa'
                      : 'Ainda não há registos de animais adotados no sistema'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Versão Desktop - Tabela */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome do Animal</TableHead>
                          <TableHead>Espécie</TableHead>
                          <TableHead>Data de Registo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAnimais.map((animal) => (
                          <TableRow key={animal.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Heart className="h-4 w-4 mr-2 text-pink-500" />
                                {animal.nome}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {animal.especie}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {formatDate(animal.created_at)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Versão Mobile - Cards */}
                  <div className="lg:hidden space-y-4">
                    {filteredAnimais.map((animal) => (
                      <Card key={animal.id} className="border-l-4 border-l-pink-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg flex items-center">
                              <Heart className="h-4 w-4 mr-2 text-pink-500" />
                              {animal.nome}
                            </h3>
                            <Badge variant="outline">
                              {animal.especie}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-gray-600">Data Registo:</span>
                              <span className="ml-1 font-medium">
                                {formatDate(animal.created_at)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default AnimaisAdotados;