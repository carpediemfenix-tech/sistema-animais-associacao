import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  User,
  Percent,
  Clock,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";

interface ClinicaVeterinaria {
  id: string;
  nome: string;
  codigo?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  website?: string;
  contacto_responsavel?: string;
  especialidades: string[];
  tem_protocolo: boolean;
  desconto_protocolo: number;
  horario_funcionamento?: any;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const GestaoClinicas = () => {
  const [clinicas, setClinicas] = useState<ClinicaVeterinaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroProtocolo, setFiltroProtocolo] = useState('todos');
  const [editandoClinica, setEditandoClinica] = useState<ClinicaVeterinaria | null>(null);
  const [novaClinicaOpen, setNovaClinicaOpen] = useState(false);
  const [editarClinicaOpen, setEditarClinicaOpen] = useState(false);
  
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Formulário para nova clínica
  const [clinicaForm, setClinicaForm] = useState({
    nome: '',
    codigo: '',
    endereco: '',
    telefone: '',
    email: '',
    website: '',
    contacto_responsavel: '',
    especialidades: [] as string[],
    tem_protocolo: false,
    desconto_protocolo: 0,
    observacoes: '',
    ativo: true
  });

  // Especialidades disponíveis
  const especialidadesDisponiveis = [
    'Clínica Geral',
    'Cirurgia',
    'Medicina Interna',
    'Emergências',
    'Cardiologia',
    'Dermatologia',
    'Oftalmologia',
    'Ortopedia',
    'Oncologia',
    'Neurologia',
    'Imagiologia',
    'Análises Clínicas',
    'Medicina Preventiva',
    'Vacinação',
    'Consultas de Rotina'
  ];

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem gerir clínicas veterinárias
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/configuracoes">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar às Configurações
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadClinicas();
  }, []);

  const loadClinicas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinicas_veterinarias')
        .select('*')
        .order('nome');

      if (error) throw error;
      setClinicas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar clínicas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clínicas veterinárias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClinicaForm({
      nome: '',
      codigo: '',
      endereco: '',
      telefone: '',
      email: '',
      website: '',
      contacto_responsavel: '',
      especialidades: [],
      tem_protocolo: false,
      desconto_protocolo: 0,
      observacoes: '',
      ativo: true
    });
  };

  const handleSalvarClinica = async () => {
    try {
      if (!clinicaForm.nome.trim()) {
        toast({
          title: "Erro",
          description: "O nome da clínica é obrigatório",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('clinicas_veterinarias')
        .insert([{
          ...clinicaForm,
          especialidades: clinicaForm.especialidades.length > 0 ? clinicaForm.especialidades : ['Clínica Geral']
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Clínica cadastrada com sucesso",
      });

      setNovaClinicaOpen(false);
      resetForm();
      loadClinicas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar clínica",
        variant: "destructive",
      });
    }
  };

  const handleEditarClinica = async () => {
    try {
      if (!editandoClinica || !editandoClinica.nome.trim()) {
        toast({
          title: "Erro",
          description: "O nome da clínica é obrigatório",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('clinicas_veterinarias')
        .update({
          nome: editandoClinica.nome,
          codigo: editandoClinica.codigo,
          endereco: editandoClinica.endereco,
          telefone: editandoClinica.telefone,
          email: editandoClinica.email,
          website: editandoClinica.website,
          contacto_responsavel: editandoClinica.contacto_responsavel,
          especialidades: editandoClinica.especialidades,
          tem_protocolo: editandoClinica.tem_protocolo,
          desconto_protocolo: editandoClinica.desconto_protocolo,
          observacoes: editandoClinica.observacoes,
          ativo: editandoClinica.ativo
        })
        .eq('id', editandoClinica.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Clínica atualizada com sucesso",
      });

      setEditarClinicaOpen(false);
      setEditandoClinica(null);
      loadClinicas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar clínica",
        variant: "destructive",
      });
    }
  };

  const handleToggleAtivo = async (clinica: ClinicaVeterinaria) => {
    try {
      const { error } = await supabase
        .from('clinicas_veterinarias')
        .update({ ativo: !clinica.ativo })
        .eq('id', clinica.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Clínica ${!clinica.ativo ? 'ativada' : 'desativada'} com sucesso`,
      });

      loadClinicas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status da clínica",
        variant: "destructive",
      });
    }
  };

  const handleRemoverClinica = async (clinica: ClinicaVeterinaria) => {
    if (!confirm(`Tem certeza que deseja remover a clínica "${clinica.nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clinicas_veterinarias')
        .delete()
        .eq('id', clinica.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Clínica removida com sucesso",
      });

      loadClinicas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover clínica",
        variant: "destructive",
      });
    }
  };

  const toggleEspecialidade = (especialidade: string, isForm = true) => {
    if (isForm) {
      const especialidades = clinicaForm.especialidades.includes(especialidade)
        ? clinicaForm.especialidades.filter(e => e !== especialidade)
        : [...clinicaForm.especialidades, especialidade];
      setClinicaForm({ ...clinicaForm, especialidades });
    } else if (editandoClinica) {
      const especialidades = editandoClinica.especialidades.includes(especialidade)
        ? editandoClinica.especialidades.filter(e => e !== especialidade)
        : [...editandoClinica.especialidades, especialidade];
      setEditandoClinica({ ...editandoClinica, especialidades });
    }
  };

  const clinicasFiltradas = clinicas.filter(clinica => {
    const matchesSearch = clinica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (clinica.codigo && clinica.codigo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProtocolo = filtroProtocolo === 'todos' || 
                           (filtroProtocolo === 'com_protocolo' && clinica.tem_protocolo) ||
                           (filtroProtocolo === 'sem_protocolo' && !clinica.tem_protocolo);
    return matchesSearch && matchesProtocolo;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando clínicas...</p>
            </div>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/configuracoes">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="h-8 w-8 mr-3 text-blue-600" />
                Gestão de Clínicas Veterinárias
              </h1>
              <p className="text-gray-600 mt-1">
                Gerir clínicas parceiras e protocolos de desconto
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={loadClinicas} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Dialog open={novaClinicaOpen} onOpenChange={setNovaClinicaOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Clínica
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Clínica</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova clínica veterinária ao sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Clínica *</Label>
                    <Input
                      id="nome"
                      value={clinicaForm.nome}
                      onChange={(e) => setClinicaForm({...clinicaForm, nome: e.target.value})}
                      placeholder="Ex: Clínica Veterinária Central"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      value={clinicaForm.codigo}
                      onChange={(e) => setClinicaForm({...clinicaForm, codigo: e.target.value})}
                      placeholder="Ex: CVC001"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={clinicaForm.endereco}
                      onChange={(e) => setClinicaForm({...clinicaForm, endereco: e.target.value})}
                      placeholder="Endereço completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={clinicaForm.telefone}
                      onChange={(e) => setClinicaForm({...clinicaForm, telefone: e.target.value})}
                      placeholder="213456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clinicaForm.email}
                      onChange={(e) => setClinicaForm({...clinicaForm, email: e.target.value})}
                      placeholder="contacto@clinica.pt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={clinicaForm.website}
                      onChange={(e) => setClinicaForm({...clinicaForm, website: e.target.value})}
                      placeholder="https://www.clinica.pt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contacto_responsavel">Contacto Responsável</Label>
                    <Input
                      id="contacto_responsavel"
                      value={clinicaForm.contacto_responsavel}
                      onChange={(e) => setClinicaForm({...clinicaForm, contacto_responsavel: e.target.value})}
                      placeholder="Dr. João Silva"
                    />
                  </div>
                  
                  {/* Protocolo e Desconto */}
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={clinicaForm.tem_protocolo}
                        onCheckedChange={(checked) => setClinicaForm({...clinicaForm, tem_protocolo: checked})}
                      />
                      <Label>Tem protocolo/convénio</Label>
                    </div>
                    {clinicaForm.tem_protocolo && (
                      <div className="mt-2">
                        <Label htmlFor="desconto">Desconto (%)</Label>
                        <Input
                          id="desconto"
                          type="number"
                          min="0"
                          max="100"
                          value={clinicaForm.desconto_protocolo}
                          onChange={(e) => setClinicaForm({...clinicaForm, desconto_protocolo: parseFloat(e.target.value) || 0})}
                          placeholder="15"
                        />
                      </div>
                    )}
                  </div>

                  {/* Especialidades */}
                  <div className="space-y-2 col-span-2">
                    <Label>Especialidades</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                      {especialidadesDisponiveis.map((especialidade) => (
                        <div key={especialidade} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`esp-${especialidade}`}
                            checked={clinicaForm.especialidades.includes(especialidade)}
                            onChange={() => toggleEspecialidade(especialidade, true)}
                            className="rounded"
                          />
                          <Label htmlFor={`esp-${especialidade}`} className="text-xs">
                            {especialidade}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={clinicaForm.observacoes}
                      onChange={(e) => setClinicaForm({...clinicaForm, observacoes: e.target.value})}
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setNovaClinicaOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSalvarClinica}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Clínica
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clínicas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinicas.length}</div>
              <p className="text-xs text-muted-foreground">
                {clinicas.filter(c => c.ativo).length} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Protocolo</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinicas.filter(c => c.tem_protocolo).length}</div>
              <p className="text-xs text-muted-foreground">
                {((clinicas.filter(c => c.tem_protocolo).length / clinicas.length) * 100).toFixed(0)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desconto Médio</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clinicas.filter(c => c.tem_protocolo).length > 0 
                  ? (clinicas.filter(c => c.tem_protocolo).reduce((acc, c) => acc + c.desconto_protocolo, 0) / clinicas.filter(c => c.tem_protocolo).length).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Nas clínicas com protocolo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...new Set(clinicas.flatMap(c => c.especialidades))].length}
              </div>
              <p className="text-xs text-muted-foreground">
                Diferentes especialidades
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Pesquisar clínicas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filtroProtocolo} onValueChange={setFiltroProtocolo}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Clínicas</SelectItem>
                  <SelectItem value="com_protocolo">Com Protocolo</SelectItem>
                  <SelectItem value="sem_protocolo">Sem Protocolo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Clínicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinicasFiltradas.map((clinica) => (
            <Card key={clinica.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{clinica.nome}</CardTitle>
                    {clinica.codigo && (
                      <p className="text-sm text-gray-500">{clinica.codigo}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={clinica.ativo ? "default" : "secondary"}>
                      {clinica.ativo ? "Ativa" : "Inativa"}
                    </Badge>
                    {clinica.tem_protocolo && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        -{clinica.desconto_protocolo}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {clinica.endereco && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{clinica.endereco}</span>
                  </div>
                )}
                {clinica.telefone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {clinica.telefone}
                  </div>
                )}
                {clinica.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">{clinica.email}</span>
                  </div>
                )}
                {clinica.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2" />
                    <span className="truncate">{clinica.website}</span>
                  </div>
                )}
                
                {clinica.especialidades && clinica.especialidades.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {clinica.especialidades.slice(0, 3).map((esp, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {esp}
                      </Badge>
                    ))}
                    {clinica.especialidades.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{clinica.especialidades.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditandoClinica(clinica);
                        setEditarClinicaOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleAtivo(clinica)}
                    >
                      {clinica.ativo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoverClinica(clinica)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {clinica.contacto_responsavel && (
                    <div className="flex items-center text-xs text-gray-500">
                      <User className="h-3 w-3 mr-1" />
                      {clinica.contacto_responsavel}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {clinicasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma clínica encontrada</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filtroProtocolo !== 'todos' 
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Comece adicionando a primeira clínica veterinária'
              }
            </p>
            {!searchTerm && filtroProtocolo === 'todos' && (
              <Button onClick={() => setNovaClinicaOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Clínica
              </Button>
            )}
          </div>
        )}

        {/* Dialog de Edição */}
        <Dialog open={editarClinicaOpen} onOpenChange={setEditarClinicaOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Clínica</DialogTitle>
              <DialogDescription>
                Altere as informações da clínica veterinária
              </DialogDescription>
            </DialogHeader>
            {editandoClinica && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome da Clínica *</Label>
                  <Input
                    id="edit-nome"
                    value={editandoClinica.nome}
                    onChange={(e) => setEditandoClinica({...editandoClinica, nome: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-codigo">Código</Label>
                  <Input
                    id="edit-codigo"
                    value={editandoClinica.codigo || ''}
                    onChange={(e) => setEditandoClinica({...editandoClinica, codigo: e.target.value})}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-endereco">Endereço</Label>
                  <Input
                    id="edit-endereco"
                    value={editandoClinica.endereco || ''}
                    onChange={(e) => setEditandoClinica({...editandoClinica, endereco: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-telefone">Telefone</Label>
                  <Input
                    id="edit-telefone"
                    value={editandoClinica.telefone || ''}
                    onChange={(e) => setEditandoClinica({...editandoClinica, telefone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editandoClinica.email || ''}
                    onChange={(e) => setEditandoClinica({...editandoClinica, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Website</Label>
                  <Input
                    id="edit-website"
                    value={editandoClinica.website || ''}
                    onChange={(e) => setEditandoClinica({...editandoClinica, website: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contacto">Contacto Responsável</Label>
                  <Input
                    id="edit-contacto"
                    value={editandoClinica.contacto_responsavel || ''}
                    onChange={(e) => setEditandoClinica({...editandoClinica, contacto_responsavel: e.target.value})}
                  />
                </div>
                
                {/* Protocolo e Desconto */}
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editandoClinica.tem_protocolo}
                      onCheckedChange={(checked) => setEditandoClinica({...editandoClinica, tem_protocolo: checked})}
                    />
                    <Label>Tem protocolo/convénio</Label>
                  </div>
                  {editandoClinica.tem_protocolo && (
                    <div className="mt-2">
                      <Label htmlFor="edit-desconto">Desconto (%)</Label>
                      <Input
                        id="edit-desconto"
                        type="number"
                        min="0"
                        max="100"
                        value={editandoClinica.desconto_protocolo}
                        onChange={(e) => setEditandoClinica({...editandoClinica, desconto_protocolo: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  )}
                </div>

                {/* Status Ativo */}
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editandoClinica.ativo}
                      onCheckedChange={(checked) => setEditandoClinica({...editandoClinica, ativo: checked})}
                    />
                    <Label>Clínica ativa</Label>
                  </div>
                </div>

                {/* Especialidades */}
                <div className="space-y-2 col-span-2">
                  <Label>Especialidades</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                    {especialidadesDisponiveis.map((especialidade) => (
                      <div key={especialidade} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-esp-${especialidade}`}
                          checked={editandoClinica.especialidades.includes(especialidade)}
                          onChange={() => toggleEspecialidade(especialidade, false)}
                          className="rounded"
                        />
                        <Label htmlFor={`edit-esp-${especialidade}`} className="text-xs">
                          {especialidade}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-observacoes">Observações</Label>
                  <Textarea
                    id="edit-observacoes"
                    value={editandoClinica.observacoes || ''}
                    onChange={(e) => setEditandoClinica({...editandoClinica, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setEditarClinicaOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditarClinica}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GestaoClinicas;