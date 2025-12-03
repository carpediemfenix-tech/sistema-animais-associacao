import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Users, AlertCircle, User, Mail, Phone, Hash, Calendar, Briefcase, MapPin, CheckCircle, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/UserHeader";

interface NivelFormacao {
  id: string;
  nome: string;
  codigo: string;
  cor: string;
  ordem: number;
  ativo: boolean;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  morada: string;
  nif: string;
  data_nascimento: string;
  profissao: string;
  observacoes: string;
}

const getNivelIcon = (codigo: string) => {
  switch (codigo) {
    case 'FORMA_BASE': return '🌱';
    case 'N1': return '🟢';
    case 'N2': return '🔵';
    case 'N3': return '🟡';
    case 'FORMA_VET': return '🏥';
    case 'FORMA_RESCUE': return '🚑';
    default: return '⚪';
  }
};

const NovoVoluntario = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    telefone: "",
    morada: "",
    nif: "",
    data_nascimento: "",
    profissao: "",
    observacoes: ""
  });

  // Remover useEffect para carregar níveis - não é necessário

  // Função loadNiveis removida - não é necessária

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Erro",
        description: "Email é obrigatório",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "Erro",
        description: "Email inválido",
        variant: "destructive",
      });
      return false;
    }

    // Remover validação de nível de formação - não é necessário

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Preparar dados para inserção
      const voluntarioData = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        telefone: formData.telefone.trim() || null,
        morada: formData.morada.trim() || null,
        nif: formData.nif.trim() || null,
        data_nascimento: formData.data_nascimento || null,
        profissao: formData.profissao.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        tem_formacao: false,
        ativo: true,
        data_entrada: new Date().toISOString()
      };

      // Inserir voluntário
      const { data: voluntario, error: voluntarioError } = await supabase
        .from('voluntarios')
        .insert(voluntarioData)
        .select()
        .single();

      if (voluntarioError) throw voluntarioError;

      // Não criar progressão inicial - voluntário começa sem formação

      toast({
        title: "Sucesso",
        description: "Voluntário criado com sucesso",
      });

      // Redirecionar para gestão de voluntários
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

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      morada: "",
      nif: "",
      data_nascimento: "",
      profissao: "",
      observacoes: ""
    });
  };

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

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Dados básicos do voluntário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Nome completo do voluntário"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="+351 912 345 678"
                  />
                </div>
                <div>
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    value={formData.nif}
                    onChange={(e) => handleInputChange('nif', e.target.value)}
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input
                    id="profissao"
                    value={formData.profissao}
                    onChange={(e) => handleInputChange('profissao', e.target.value)}
                    placeholder="Profissão do voluntário"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="morada">Morada</Label>
                <Input
                  id="morada"
                  value={formData.morada}
                  onChange={(e) => handleInputChange('morada', e.target.value)}
                  placeholder="Morada completa"
                />
              </div>
            </CardContent>
          </Card>

          {/* Formação será gerida em separado */}

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Informações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
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

          {/* Ações */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Limpar Formulário
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Voluntário
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoVoluntario;