import React, { useState, useEffect } from 'react';
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

const NovoVoluntario = () => {
const [formData, setFormData] = useState<VoluntarioFormData>({
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
      const voluntarioData = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        telefone: formData.telefone.trim(),
        morada: formData.morada.trim() || null,
        nif: formData.nif.trim() || null,
        data_nascimento: formData.data_nascimento || null,
        profissao: formData.profissao.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        data_ingresso: new Date().toISOString().split('T')[0],
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
      <div className="p-4 flex-1">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/voluntarios/gestao">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-6 w-6 text-blue-600" />
                Registar Novo Voluntário
              </h1>
              <p className="text-gray-600">
                Adicionar um novo voluntário ao sistema Valentão
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Dados básicos do voluntário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Nome completo do voluntário"
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600">{errors.nome}</p>
                  )}
</div>

                {/* Nickname */}
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname/Apelido</Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    placeholder="Como gosta de ser chamado (opcional)"
                  />
                  <p className="text-xs text-gray-500">
                    💡 Este nome aparecerá no sistema como preferência
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
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
                  placeholder="Rua, número, código postal, cidade"
                />
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
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={submitting}
            >
              Limpar Formulário
            </Button>
            
            <div className="flex items-center gap-3">
              <Link to="/voluntarios/gestao">
                <Button variant="ghost" disabled={submitting}>
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[120px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Registar Voluntário
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