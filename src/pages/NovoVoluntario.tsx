import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Users, AlertCircle, User, Mail, Phone, Hash, Calendar, Briefcase, MapPin, CheckCircle, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { supabase } from "@/lib/supabase";

// Função auxiliar para ícones dos níveis
const getNivelIcon = (codigo: string) => {
  switch (codigo) {
    case 'V1': return '🟢';
    case 'V2': return '🔵';
    case 'V3': return '🟡';
    case 'V4': return '🟠';
    case 'V5': return '🔴';
    case 'V6': return '🟣';
    default: return '⚪';
  }
};

const NovoVoluntario = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [niveisFormacao, setNiveisFormacao] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    morada: '',
    nif: '',
    data_nascimento: '',
    profissao: '',
    observacoes: '',
    nivel_formacao_atual: ''
  });

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem criar voluntários
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
    loadNiveisFormacao();
  }, []);

  const loadNiveisFormacao = async () => {
    try {
      setLoading(true);

      const { data: niveisData, error: niveisError } = await supabase
        .from('niveis_formacao')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (niveisError) throw niveisError;

      setNiveisFormacao(niveisData || []);

    } catch (error: any) {
      console.error('Erro ao carregar níveis:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar níveis de formação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const voluntarioData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone?.trim() || null,
        morada: formData.morada?.trim() || null,
        nif: formData.nif?.trim() || null,
        data_nascimento: formData.data_nascimento || null,
        profissao: formData.profissao?.trim() || null,
        observacoes: formData.observacoes?.trim() || null,
        ativo: true,
        data_ingresso: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('voluntarios')
        .insert([voluntarioData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Voluntário criado com sucesso",
      });

      // Redirecionar para a gestão
      navigate('/voluntarios/gestao');

    } catch (error: any) {
      console.error('Erro ao criar voluntário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar voluntário",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Plus className="h-8 w-8 mr-3 text-blue-600" />
              Novo Voluntário
            </h1>
            <p className="text-gray-600 mt-1">
              Adicionar novo voluntário ao sistema Valentão
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/voluntarios/gestao">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Gestão
              </Button>
            </Link>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Dados do Voluntário
            </CardTitle>
            <CardDescription>
              Preencha as informações do novo voluntário. Os campos marcados com * são obrigatórios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Informações Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Nome */}
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Nome completo do voluntário"
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@exemplo.com"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Telefone */}
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                        placeholder="+351 912 345 678"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* NIF */}
                  <div>
                    <Label htmlFor="nif">NIF</Label>
                    <div className="relative mt-1">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="nif"
                        value={formData.nif}
                        onChange={(e) => setFormData({...formData, nif: e.target.value})}
                        placeholder="123456789"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="data_nascimento"
                        type="date"
                        value={formData.data_nascimento}
                        onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Profissão */}
                  <div>
                    <Label htmlFor="profissao">Profissão</Label>
                    <div className="relative mt-1">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="profissao"
                        value={formData.profissao}
                        onChange={(e) => setFormData({...formData, profissao: e.target.value})}
                        placeholder="Engenheiro, Professor, etc."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Morada */}
                  <div className="md:col-span-2">
                    <Label htmlFor="morada">Morada</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="morada"
                        value={formData.morada}
                        onChange={(e) => setFormData({...formData, morada: e.target.value})}
                        placeholder="Rua, número, código postal, cidade"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Formação Valentão */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Formação Valentão
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  
                  {/* Nível de Formação */}
                  <div>
                    <Label htmlFor="nivel_formacao">Nível de Formação Inicial</Label>
                    <Select 
                      value={formData.nivel_formacao_atual} 
                      onValueChange={(value) => setFormData({...formData, nivel_formacao_atual: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecionar nível de formação (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sem nível atribuído</SelectItem>
                        {niveisFormacao.map((nivel) => (
                          <SelectItem key={nivel.id} value={nivel.id}>
                            <div className="flex items-center space-x-2">
                              <span style={{ color: nivel.cor }}>
                                {getNivelIcon(nivel.codigo)}
                              </span>
                              <span>{nivel.nome}</span>
                              <Badge 
                                variant="secondary" 
                                style={{ backgroundColor: `${nivel.cor}20`, color: nivel.cor }}
                                className="ml-2"
                              >
                                {nivel.codigo}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      O nível pode ser atribuído posteriormente através da progressão formativa
                    </p>
                  </div>

                  {/* Observações */}
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                      placeholder="Observações adicionais sobre o voluntário (experiência prévia, especialidades, etc.)"
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Link to="/voluntarios/gestao">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Criar Voluntário
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Após criar o voluntário, poderá aceder ao seu perfil completo</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>A progressão formativa pode ser gerida através do perfil individual</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Especializações e conquistas serão atribuídas automaticamente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovoVoluntario;