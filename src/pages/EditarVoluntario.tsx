import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";

// Função helper para extrair primeiro e último nome
const getDisplayNameFromFullName = (fullName: string): string => {
  const names = fullName.trim().split(' ').filter(name => name.length > 0);
  
  if (names.length === 0) return '';
  if (names.length === 1) return names[0]; // Apenas um nome
  if (names.length === 2) return `${names[0]} ${names[1]}`; // Primeiro e segundo
  
  // Mais de 2 nomes: primeiro + último
  return `${names[0]} ${names[names.length - 1]}`;
};

interface VoluntarioData {
  id: string;
  nome: string;
  nickname: string;
  display_name: string;
  full_name: string;
  email: string;
  telefone: string;
  morada: string;
  nif: string;
  data_nascimento: string;
  profissao: string;
  especialidade: string;
  observacoes: string;
  ativo: boolean;
  tem_formacao: boolean;
}

const EditarVoluntario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [voluntario, setVoluntario] = useState<VoluntarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados do voluntário
  useEffect(() => {
    if (id) {
      loadVoluntario();
    }
  }, [id]);

  const loadVoluntario = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setVoluntario(data);
    } catch (error: any) {
      console.error('Erro ao carregar voluntário:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do voluntário",
        variant: "destructive",
      });
      navigate('/voluntarios/gestao');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!voluntario) return;

    try {
      setSaving(true);

      // Preparar dados para atualização (apenas campos que existem na tabela)
const nickname = voluntario.nickname?.trim() || null;
      const nome = voluntario.nome?.trim() || '';
      
      const updateData = {
        nome: nome,
        nickname: nickname,
display_name: nickname || getDisplayNameFromFullName(nome), // REGRA: nickname ou primeiro+último nome
        full_name: nome, // Nome completo sempre preservado
        email: voluntario.email?.trim() || '',
        telefone: voluntario.telefone?.trim() || null,
        morada: voluntario.morada?.trim() || null,
        nif: voluntario.nif?.trim() || null,
        data_nascimento: voluntario.data_nascimento || null,
        profissao: voluntario.profissao?.trim() || null,
        especialidade: voluntario.especialidade || 'Geral',
        observacoes: voluntario.observacoes?.trim() || null,
        ativo: voluntario.ativo,
        tem_formacao: voluntario.tem_formacao || false
      };

      const { error } = await supabase
        .from('voluntarios')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Voluntário atualizado com sucesso",
      });

      navigate('/voluntarios/gestao');
    } catch (error: any) {
      console.error('Erro ao salvar voluntário:', error);
      
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Erro ao salvar alterações do voluntário",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof VoluntarioData, value: any) => {
    if (voluntario) {
      setVoluntario({
        ...voluntario,
        [field]: value
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!voluntario) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Voluntário não encontrado</p>
            <Button onClick={() => navigate('/voluntarios/gestao')} className="mt-4">
              Voltar à Gestão
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/voluntarios/gestao')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Gestão
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Voluntário</h1>
              {voluntario && (
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">
                    {voluntario.nome}
                  </Badge>
                  <Badge variant={voluntario.ativo ? "default" : "secondary"}>
                    {voluntario.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Voluntário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={voluntario.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                />
</div>
              
              <div>
                <Label htmlFor="nickname">Nickname/Apelido</Label>
                <Input
                  id="nickname"
                  value={voluntario.nickname || ''}
onChange={(e) => handleInputChange('nickname', e.target.value)}
                  placeholder="Como gosta de ser chamado"
                />
<p className="text-xs text-gray-500 mt-1">
                  💡 <strong>Display Name:</strong> Se preenchido, este será o nome exibido. Caso contrário, usará "Primeiro Último"
                </p>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={voluntario.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={voluntario.telefone || ''}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  value={voluntario.nif || ''}
                  onChange={(e) => handleInputChange('nif', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={voluntario.data_nascimento || ''}
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="profissao">Profissão</Label>
                <Input
                  id="profissao"
                  value={voluntario.profissao || ''}
                  onChange={(e) => handleInputChange('profissao', e.target.value)}
                />
              </div>
            </div>

            {/* Morada */}
            <div>
              <Label htmlFor="morada">Morada</Label>
              <Input
                id="morada"
                value={voluntario.morada || ''}
                onChange={(e) => handleInputChange('morada', e.target.value)}
              />
            </div>

            {/* Especialidade */}
            <div>
              <Label htmlFor="especialidade">Especialidade</Label>
              <Select
                value={voluntario.especialidade || 'Geral'}
                onValueChange={(value) => handleInputChange('especialidade', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geral">Geral</SelectItem>
                  <SelectItem value="Veterinária">Veterinária</SelectItem>
                  <SelectItem value="Resgate">Resgate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ativo">Status</Label>
                <Select
                  value={voluntario.ativo ? 'true' : 'false'}
                  onValueChange={(value) => handleInputChange('ativo', value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tem_formacao">Tem Formação</Label>
                <Select
                  value={voluntario.tem_formacao ? 'true' : 'false'}
                  onValueChange={(value) => handleInputChange('tem_formacao', value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={voluntario.observacoes || ''}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditarVoluntario;