import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  Hash, 
  Calendar, 
  Briefcase, 
  MapPin, 
  CheckCircle, 
  Save, 
  Loader2,
  Sprout,
  Shield,
  Sword,
  Crown,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import { 
  NivelFormacao, 
  VoluntarioValentao, 
  VoluntarioFormData,
  getNivelIcon,
  getNivelCor
} from "@/types/voluntarios";

// Função helper para extrair primeiro e último nome
const getDisplayNameFromFullName = (fullName: string): string => {
  const names = fullName.trim().split(' ').filter(name => name.length > 0);
  
  if (names.length === 0) return '';
  if (names.length === 1) return names[0]; // Apenas um nome
  if (names.length === 2) return `${names[0]} ${names[1]}`; // Primeiro e segundo
  
  // Mais de 2 nomes: primeiro + último
  return `${names[0]} ${names[names.length - 1]}`;
};

const NovoVoluntario = () => {
const [formData, setFormData] = useState<VoluntarioFormData>({
    nome: '',
    nickname: '',
    email: '',
    telefone: '',
    morada: '',
    localidade: '',
    codigo_postal: '',
    distrito: '',
    nif: '',
    data_nascimento: '',
    data_ingresso: new Date().toISOString().split('T')[0],
    profissao: '',
    observacoes: ''
  });
  
  const [niveisFormacao, setNiveisFormacao] = useState<NivelFormacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem registar novos voluntários
            </CardDescription>
          </CardHeader>
          <CardContent>
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

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar níveis de formação
      // MODO DEV: Usar dados fixos para níveis de formação
      const niveisFixos = [
        { id: '1', nome: 'FORMA BASE', codigo: 'FORMA_BASE', ativo: true },
        { id: '2', nome: 'Formação N1', codigo: 'FORMA_N1', ativo: true },
        { id: '3', nome: 'Formação N2', codigo: 'FORMA_N2', ativo: true }
      ];
      
      setNiveisFormacao(niveisFixos);
      console.log('📊 Usando níveis de formação fixos:', niveisFixos);
      
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao Carregar",
        description: error.message || "Erro ao carregar dados iniciais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof VoluntarioFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

// Preparar dados do voluntário
      const nickname = formData.nickname.trim();
      const nome = formData.nome.trim();
      
      const voluntarioData = {
        nome: nome,
        nickname: nickname || null,
display_name: nickname || getDisplayNameFromFullName(nome), // REGRA: nickname ou primeiro+último nome
        full_name: nome, // Nome completo sempre preservado
        email: formData.email.trim().toLowerCase(),
        telefone: formData.telefone.trim(),
        morada: formData.morada.trim() || null,
        localidade: formData.localidade.trim() || null,
        codigo_postal: formData.codigo_postal.trim() || null,
        distrito: formData.distrito.trim() || null,
        nif: formData.nif.trim() || null,
        data_nascimento: formData.data_nascimento || null,
        data_ingresso: formData.data_ingresso || new Date().toISOString().split('T')[0],
        profissao: formData.profissao.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        tem_formacao: false, // Novo voluntário sem formação inicial
        ativo: true
      };

      // Inserir voluntário
      const { data: novoVoluntario, error: voluntarioError } = await supabase
        .from('voluntarios')
        .insert([voluntarioData])
        .select()
        .single();

      if (voluntarioError) throw voluntarioError;

      toast({
        title: "Voluntário Registado",
        description: `${formData.nome} foi registado com sucesso!`,
      });

      // Redirecionar para o perfil do voluntário
      navigate(`/voluntarios/perfil/${novoVoluntario.id}`);

    } catch (error: any) {
      console.error('Erro ao registar voluntário:', error);
      toast({
        title: "Erro ao Registar",
        description: error.message || "Erro ao registar voluntário",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
setFormData({
      nome: '',
      nickname: '',
      email: '',
      telefone: '',
      morada: '',
      nif: '',
      data_nascimento: '',
      profissao: '',
      observacoes: ''
    });
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="p-4 flex-1">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Carregando formulário...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      <div className="px-2 sm:px-4 py-4 sm:py-6 flex-1">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Link to="/voluntarios/gestao" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="hidden sm:inline">Voltar</span>
                <span className="sm:hidden">Voltar</span>
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <span className="hidden sm:inline">Registar Novo Voluntário</span>
                <span className="sm:hidden">Novo Voluntário</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                <span className="hidden sm:inline">Adicionar um novo voluntário ao sistema Valentão</span>
                <span className="sm:hidden">Adicionar novo voluntário</span>
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="hidden sm:inline">Informações Pessoais</span>
                <span className="sm:hidden">Dados Pessoais</span>
              </CardTitle>
              <CardDescription className="text-sm">
                <span className="hidden sm:inline">Dados básicos do voluntário</span>
                <span className="sm:hidden">Dados básicos</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-medium">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
placeholder="Nome completo do voluntário"
                    className={`text-sm ${errors.nome ? 'border-red-500' : ''}`}
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600">{errors.nome}</p>
                  )}
                </div>

                {/* Nickname */}
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-sm font-medium">
                    <span className="hidden sm:inline">Nickname/Apelido</span>
                    <span className="sm:hidden">Apelido</span>
                  </Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    placeholder="Como gosta de ser chamado (opcional)"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    <span className="hidden sm:inline">💡 <strong>Display Name:</strong> Se preenchido, este será o nome exibido. Caso contrário, usará "Primeiro Último"</span>
                    <span className="sm:hidden">💡 Nome de exibição</span>
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className={`text-sm ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-sm font-medium">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="+351 912 345 678"
                    className={errors.telefone ? 'border-red-500' : ''}
                  />
                  {errors.telefone && (
                    <p className="text-sm text-red-600">{errors.telefone}</p>
                  )}
                </div>

                {/* NIF */}
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    value={formData.nif}
                    onChange={(e) => handleInputChange('nif', e.target.value)}
                    placeholder="123456789"
                  />
                </div>

                {/* Data de Nascimento */}
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  />
                </div>

                {/* Data de Ingresso */}
                <div className="space-y-2">
                  <Label htmlFor="data_ingresso">Data de Ingresso</Label>
                  <Input
                    id="data_ingresso"
                    type="date"
                    value={formData.data_ingresso}
                    onChange={(e) => handleInputChange('data_ingresso', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Data em que o voluntário ingressou na associação
                  </p>
                </div>

                {/* Profissão */}
                <div className="space-y-2">
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input
                    id="profissao"
                    value={formData.profissao}
                    onChange={(e) => handleInputChange('profissao', e.target.value)}
                    placeholder="Profissão ou área de trabalho"
                  />
                </div>
              </div>

              {/* Morada */}
              <div className="space-y-2">
                <Label htmlFor="morada">Morada</Label>
                <Input
                  id="morada"
                  value={formData.morada}
                  onChange={(e) => handleInputChange('morada', e.target.value)}
                  placeholder="Rua e número"
                />
              </div>

              {/* Campos de Localização */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="localidade">Localidade</Label>
                  <Input
                    id="localidade"
                    value={formData.localidade}
                    onChange={(e) => handleInputChange('localidade', e.target.value)}
                    placeholder="Ex: Lisboa"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={(e) => handleInputChange('codigo_postal', e.target.value)}
                    placeholder="Ex: 1000-001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="distrito">Distrito</Label>
                  <Input
                    id="distrito"
                    value={formData.distrito}
                    onChange={(e) => handleInputChange('distrito', e.target.value)}
                    placeholder="Ex: Lisboa"
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Informações adicionais sobre o voluntário..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações sobre Formação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Sistema de Formação Valentão
              </CardTitle>
              <CardDescription>
                O voluntário será registado sem formação inicial. A progressão formativa será gerida na secção de Formação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sprout className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Próximos Passos</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Após o registo, o voluntário poderá iniciar a formação FORMA BASE na secção de Gestão de Formação.
                    </p>
                  </div>
                </div>
              </div>

              {/* Níveis de Formação Disponíveis */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-3">Níveis de Formação Disponíveis:</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {niveisFormacao.map((nivel) => {
                    const IconComponent = nivel.icone === 'Sprout' ? Sprout :
                                        nivel.icone === 'Shield' ? Shield :
                                        nivel.icone === 'Sword' ? Sword :
                                        nivel.icone === 'Crown' ? Crown : User;
                    
                    return (
                      <div key={nivel.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <IconComponent className="h-4 w-4" style={{ color: nivel.cor }} />
                        <span className="text-sm font-medium">{nivel.nome}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Limpar Formulário</span>
              <span className="sm:hidden">Limpar</span>
            </Button>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Link to="/voluntarios/gestao" className="w-full sm:w-auto">
                <Button variant="ghost" disabled={submitting} className="w-full sm:w-auto">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[120px] w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Registando...</span>
                    <span className="sm:hidden">A registar...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="hidden sm:inline">Registar Voluntário</span>
                    <span className="sm:hidden">Registar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default NovoVoluntario;