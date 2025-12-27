import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Users,
  Contact,
  IdCard,
  Map
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import UserHeader from "@/components/UserHeader";

interface ClinicaVeterinaria {
  id: string;
  nome: string;
  codigo?: string;
  endereco?: string;
  codigo_postal?: string;
  localidade?: string;
  distrito?: string;
  telefone?: string;
  email?: string;
  website?: string;
  nif?: string;
  especialidades: string[];
  tem_protocolo: boolean;
  desconto_protocolo: number;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface ContactoClinica {
  id: string;
  clinica_id: string;
  nome: string;
  vinculo: string;
  telemovel?: string;
  email?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const GestaoClinicas = () => {
  const [clinicas, setClinicas] = useState<ClinicaVeterinaria[]>([]);
  const [contactos, setContactos] = useState<ContactoClinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroProtocolo, setFiltroProtocolo] = useState('todos');
  const [filtroDistrito, setFiltroDistrito] = useState('todos');
  const [editandoClinica, setEditandoClinica] = useState<ClinicaVeterinaria | null>(null);
  const [clinicaSelecionada, setClinicaSelecionada] = useState<string | null>(null);
  const [novaClinicaOpen, setNovaClinicaOpen] = useState(false);
  const [editarClinicaOpen, setEditarClinicaOpen] = useState(false);
  const [contactosOpen, setContactosOpen] = useState(false);
  const [novoContactoOpen, setNovoContactoOpen] = useState(false);
  
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Formulário para nova clínica
  const [clinicaForm, setClinicaForm] = useState({
    nome: '',
    codigo: '',
    endereco: '',
    codigo_postal: '',
    localidade: '',
    distrito: '',
    telefone: '',
    email: '',
    website: '',
    nif: '',
    especialidades: [] as string[],
    tem_protocolo: false,
    desconto_protocolo: 0,
    observacoes: '',
    ativo: true
  });

  // Formulário para novo contacto
  const [contactoForm, setContactoForm] = useState({
    nome: '',
    vinculo: '',
    telemovel: '',
    email: ''
  });

  // Especialidades e vínculos disponíveis
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

  const vinculosDisponiveis = [
    'Veterinário Principal',
    'Veterinário',
    'Veterinário Especialista',
    'Enfermeiro Veterinário',
    'Auxiliar Veterinário',
    'Recepcionista',
    'Gerente',
    'Diretor Clínico',
    'Técnico de Laboratório',
    'Técnico de Imagiologia'
  ];

  const distritosPortugal = [
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra',
    'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre',
    'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu'
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

  useEffect(() => {
    if (clinicaSelecionada) {
      loadContactos(clinicaSelecionada);
    }
  }, [clinicaSelecionada]);

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

  const loadContactos = async (clinicaId: string) => {
    try {
      const { data, error } = await supabase
        .from('contactos_clinicas')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setContactos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar contactos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contactos da clínica",
        variant: "destructive",
      });
    }
  };

  // Validações
  const validarCodigoPostal = (codigo: string) => {
    const regex = /^\d{4}-\d{3}$/;
    return regex.test(codigo);
  };

  const validarNIF = (nif: string) => {
    const regex = /^\d{9}$/;
    return regex.test(nif);
  };

  const validarTelemovel = (telemovel: string) => {
    const regex = /^9\d{8}$/;
    return regex.test(telemovel);
  };

  const resetForm = () => {
    setClinicaForm({
      nome: '',
      codigo: '',
      endereco: '',
      codigo_postal: '',
      localidade: '',
      distrito: '',
      telefone: '',
      email: '',
      website: '',
      nif: '',
      especialidades: [],
      tem_protocolo: false,
      desconto_protocolo: 0,
      observacoes: '',
      ativo: true
    });
  };

  const resetContactoForm = () => {
    setContactoForm({
      nome: '',
      vinculo: '',
      telemovel: '',
      email: ''
    });
  };

  const handleSalvarClinica = async () => {
    try {
      // Validações
      if (!clinicaForm.nome.trim()) {
        toast({
          title: "Erro",
          description: "O nome da clínica é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (clinicaForm.codigo_postal && !validarCodigoPostal(clinicaForm.codigo_postal)) {
        toast({
          title: "Erro",
          description: "Código postal deve ter o formato ####-###",
          variant: "destructive",
        });
        return;
      }

      if (clinicaForm.nif && !validarNIF(clinicaForm.nif)) {
        toast({
          title: "Erro",
          description: "NIF deve ter 9 dígitos",
          variant: "destructive",
        });
        return;
      }

      if (clinicaForm.telefone && !validarTelemovel(clinicaForm.telefone)) {
        toast({
          title: "Erro",
          description: "Telefone deve ter o formato 9XXXXXXXX",
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

      // Validações
      if (editandoClinica.codigo_postal && !validarCodigoPostal(editandoClinica.codigo_postal)) {
        toast({
          title: "Erro",
          description: "Código postal deve ter o formato ####-###",
          variant: "destructive",
        });
        return;
      }

      if (editandoClinica.nif && !validarNIF(editandoClinica.nif)) {
        toast({
          title: "Erro",
          description: "NIF deve ter 9 dígitos",
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
          codigo_postal: editandoClinica.codigo_postal,
          localidade: editandoClinica.localidade,
          distrito: editandoClinica.distrito,
          telefone: editandoClinica.telefone,
          email: editandoClinica.email,
          website: editandoClinica.website,
          nif: editandoClinica.nif,
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

  const handleSalvarContacto = async () => {
    try {
      if (!contactoForm.nome.trim() || !contactoForm.vinculo.trim()) {
        toast({
          title: "Erro",
          description: "Nome e vínculo são obrigatórios",
          variant: "destructive",
        });
        return;
      }

      if (contactoForm.telemovel && !validarTelemovel(contactoForm.telemovel)) {
        toast({
          title: "Erro",
          description: "Telemóvel deve ter o formato 9XXXXXXXX",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('contactos_clinicas')
        .insert([{
          ...contactoForm,
          clinica_id: clinicaSelecionada
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contacto adicionado com sucesso",
      });

      setNovoContactoOpen(false);
      resetContactoForm();
      if (clinicaSelecionada) {
        loadContactos(clinicaSelecionada);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar contacto",
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
    if (!confirm(`Tem certeza que deseja remover a clínica '${clinica.nome}'? Esta ação não pode ser desfeita.`)) {
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

  const handleRemoverContacto = async (contacto: ContactoClinica) => {
    if (!confirm(`Tem certeza que deseja remover o contacto '${contacto.nome}'?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contactos_clinicas')
        .delete()
        .eq('id', contacto.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contacto removido com sucesso",
      });

      if (clinicaSelecionada) {
        loadContactos(clinicaSelecionada);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover contacto",
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
                         (clinica.codigo && clinica.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (clinica.localidade && clinica.localidade.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProtocolo = filtroProtocolo === 'todos' || 
                           (filtroProtocolo === 'com_protocolo' && clinica.tem_protocolo) ||
                           (filtroProtocolo === 'sem_protocolo' && !clinica.tem_protocolo);
    const matchesDistrito = filtroDistrito === 'todos' || clinica.distrito === filtroDistrito;
    return matchesSearch && matchesProtocolo && matchesDistrito;
  });

  const distritosUnicos = [...new Set(clinicas.map(c => c.distrito).filter(Boolean))];

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
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
                Gerir clínicas parceiras, contactos e protocolos de desconto
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Clínica</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova clínica veterinária ao sistema
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="dados" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dados">Dados da Clínica</TabsTrigger>
                    <TabsTrigger value="especialidades">Especialidades</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dados" className="space-y-4">
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
                        <Label htmlFor="endereco">Morada</Label>
                        <Input
                          id="endereco"
                          value={clinicaForm.endereco}
                          onChange={(e) => setClinicaForm({...clinicaForm, endereco: e.target.value})}
                          placeholder="Rua, número, andar"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="codigo_postal">Código Postal</Label>
                        <Input
                          id="codigo_postal"
                          value={clinicaForm.codigo_postal}
                          onChange={(e) => setClinicaForm({...clinicaForm, codigo_postal: e.target.value})}
                          placeholder="1000-001"
                          maxLength={8}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="localidade">Localidade</Label>
                        <Input
                          id="localidade"
                          value={clinicaForm.localidade}
                          onChange={(e) => setClinicaForm({...clinicaForm, localidade: e.target.value})}
                          placeholder="Lisboa"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="distrito">Distrito</Label>
                        <Select value={clinicaForm.distrito} onValueChange={(value) => setClinicaForm({...clinicaForm, distrito: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o distrito" />
                          </SelectTrigger>
                          <SelectContent>
                            {distritosPortugal.map((distrito) => (
                              <SelectItem key={distrito} value={distrito}>
                                {distrito}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nif">NIF</Label>
                        <Input
                          id="nif"
                          value={clinicaForm.nif}
                          onChange={(e) => setClinicaForm({...clinicaForm, nif: e.target.value})}
                          placeholder="123456789"
                          maxLength={9}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={clinicaForm.telefone}
                          onChange={(e) => setClinicaForm({...clinicaForm, telefone: e.target.value})}
                          placeholder="913456789"
                          maxLength={9}
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
                      
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={clinicaForm.website}
                          onChange={(e) => setClinicaForm({...clinicaForm, website: e.target.value})}
                          placeholder="https://www.clinica.pt"
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
                  </TabsContent>
                  
                  <TabsContent value="especialidades" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Especialidades Disponíveis</Label>
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded p-4">
                        {especialidadesDisponiveis.map((especialidade) => (
                          <div key={especialidade} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`esp-${especialidade}`}
                              checked={clinicaForm.especialidades.includes(especialidade)}
                              onChange={() => toggleEspecialidade(especialidade, true)}
                              className="rounded"
                            />
                            <Label htmlFor={`esp-${especialidade}`} className="text-sm">
                              {especialidade}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
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
              <CardTitle className="text-sm font-medium">Distritos</CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{distritosUnicos.length}</div>
              <p className="text-xs text-muted-foreground">
                Diferentes distritos
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
              <Select value={filtroDistrito} onValueChange={setFiltroDistrito}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Distritos</SelectItem>
                  {distritosUnicos.map((distrito) => (
                    <SelectItem key={distrito} value={distrito}>
                      {distrito}
                    </SelectItem>
                  ))}
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
                {(clinica.codigo_postal || clinica.localidade) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Map className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {clinica.codigo_postal} {clinica.localidade}
                      {clinica.distrito && `, ${clinica.distrito}`}
                    </span>
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
                {clinica.nif && (
                  <div className="flex items-center text-sm text-gray-600">
                    <IdCard className="h-4 w-4 mr-2" />
                    NIF: {clinica.nif}
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
                      onClick={() => {
                        setClinicaSelecionada(clinica.id);
                        setContactosOpen(true);
                      }}
                    >
                      <Users className="h-3 w-3" />
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
              {searchTerm || filtroProtocolo !== 'todos' || filtroDistrito !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Comece adicionando a primeira clínica veterinária'
              }
            </p>
            {!searchTerm && filtroProtocolo === 'todos' && filtroDistrito === 'todos' && (
              <Button onClick={() => setNovaClinicaOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Clínica
              </Button>
            )}
          </div>
        )}

        {/* Dialog de Edição de Clínica */}
        <Dialog open={editarClinicaOpen} onOpenChange={setEditarClinicaOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Clínica</DialogTitle>
              <DialogDescription>
                Altere as informações da clínica veterinária
              </DialogDescription>
            </DialogHeader>
            {editandoClinica && (
              <Tabs defaultValue="dados" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dados">Dados da Clínica</TabsTrigger>
                  <TabsTrigger value="especialidades">Especialidades</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dados" className="space-y-4">
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
                      <Label htmlFor="edit-endereco">Morada</Label>
                      <Input
                        id="edit-endereco"
                        value={editandoClinica.endereco || ''}
                        onChange={(e) => setEditandoClinica({...editandoClinica, endereco: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-codigo_postal">Código Postal</Label>
                      <Input
                        id="edit-codigo_postal"
                        value={editandoClinica.codigo_postal || ''}
                        onChange={(e) => setEditandoClinica({...editandoClinica, codigo_postal: e.target.value})}
                        placeholder="1000-001"
                        maxLength={8}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-localidade">Localidade</Label>
                      <Input
                        id="edit-localidade"
                        value={editandoClinica.localidade || ''}
                        onChange={(e) => setEditandoClinica({...editandoClinica, localidade: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-distrito">Distrito</Label>
                      <Select 
                        value={editandoClinica.distrito || ''} 
                        onValueChange={(value) => setEditandoClinica({...editandoClinica, distrito: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o distrito" />
                        </SelectTrigger>
                        <SelectContent>
                          {distritosPortugal.map((distrito) => (
                            <SelectItem key={distrito} value={distrito}>
                              {distrito}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-nif">NIF</Label>
                      <Input
                        id="edit-nif"
                        value={editandoClinica.nif || ''}
                        onChange={(e) => setEditandoClinica({...editandoClinica, nif: e.target.value})}
                        maxLength={9}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-telefone">Telefone</Label>
                      <Input
                        id="edit-telefone"
                        value={editandoClinica.telefone || ''}
                        onChange={(e) => setEditandoClinica({...editandoClinica, telefone: e.target.value})}
                        maxLength={9}
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
                    
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="edit-website">Website</Label>
                      <Input
                        id="edit-website"
                        value={editandoClinica.website || ''}
                        onChange={(e) => setEditandoClinica({...editandoClinica, website: e.target.value})}
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
                </TabsContent>
                
                <TabsContent value="especialidades" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Especialidades Disponíveis</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded p-4">
                      {especialidadesDisponiveis.map((especialidade) => (
                        <div key={especialidade} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`edit-esp-${especialidade}`}
                            checked={editandoClinica.especialidades.includes(especialidade)}
                            onChange={() => toggleEspecialidade(especialidade, false)}
                            className="rounded"
                          />
                          <Label htmlFor={`edit-esp-${especialidade}`} className="text-sm">
                            {especialidade}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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

        {/* Dialog de Gestão de Contactos */}
        <Dialog open={contactosOpen} onOpenChange={setContactosOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Contact className="h-5 w-5 mr-2" />
                Contactos da Clínica
              </DialogTitle>
              <DialogDescription>
                Gerir contactos da clínica selecionada
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Lista de Contactos</h4>
                <Dialog open={novoContactoOpen} onOpenChange={setNovoContactoOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={resetContactoForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Contacto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Contacto</DialogTitle>
                      <DialogDescription>
                        Adicione um novo contacto à clínica
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contacto-nome">Nome *</Label>
                        <Input
                          id="contacto-nome"
                          value={contactoForm.nome}
                          onChange={(e) => setContactoForm({...contactoForm, nome: e.target.value})}
                          placeholder="Dr. João Silva"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contacto-vinculo">Vínculo *</Label>
                        <Select value={contactoForm.vinculo} onValueChange={(value) => setContactoForm({...contactoForm, vinculo: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o vínculo" />
                          </SelectTrigger>
                          <SelectContent>
                            {vinculosDisponiveis.map((vinculo) => (
                              <SelectItem key={vinculo} value={vinculo}>
                                {vinculo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contacto-telemovel">Telemóvel</Label>
                        <Input
                          id="contacto-telemovel"
                          value={contactoForm.telemovel}
                          onChange={(e) => setContactoForm({...contactoForm, telemovel: e.target.value})}
                          placeholder="913456789"
                          maxLength={9}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contacto-email">Email</Label>
                        <Input
                          id="contacto-email"
                          type="email"
                          value={contactoForm.email}
                          onChange={(e) => setContactoForm({...contactoForm, email: e.target.value})}
                          placeholder="contacto@clinica.pt"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button variant="outline" onClick={() => setNovoContactoOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSalvarContacto}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Contacto
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-3">
                {contactos.map((contacto) => (
                  <div key={contacto.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{contacto.nome}</h4>
                        <p className="text-sm text-gray-600">{contacto.vinculo}</p>
                        {contacto.telemovel && (
                          <p className="text-xs text-gray-500">📱 {contacto.telemovel}</p>
                        )}
                        {contacto.email && (
                          <p className="text-xs text-gray-500">✉️ {contacto.email}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoverContacto(contacto)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {contactos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Contact className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum contacto cadastrado</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default GestaoClinicas;