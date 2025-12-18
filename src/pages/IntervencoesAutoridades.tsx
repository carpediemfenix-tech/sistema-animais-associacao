import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2,
  Shield,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  MapPin,
  Phone,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import VoluntarioSelector from "@/components/VoluntarioSelector";

interface Intervencao {
  id: string;
  animal_id: string;
  data_intervencao: string;
  tipo_intervencao: string;
  autoridade: string;
  auto_intervencao?: string;
  voluntario_delegado_id?: string;
  status: string;
  prioridade: string;
  data_fim?: string;
  localizacao_intervencao?: string;
  resultado_intervencao?: string;
  valor_multa?: number;
  contacto_autoridade?: string;
  documentos_anexos?: string[];
  observacoes?: string;
  created_at: string;
  // Dados do voluntário (via join)
  voluntarios?: {
    id: string;
    nome: string;
    display_name?: string;
    full_name?: string;
    email: string;
  };
}

interface Animal {
  id: string;
  nome: string;
  especie: string;
}

// Tipos de intervenção predefinidos
const TIPOS_INTERVENCAO = [
  { id: "denuncia", nome: "🚨 Denúncia", cor: "bg-red-500" },
  { id: "multa", nome: "💰 Multa", cor: "bg-orange-500" },
  { id: "resgate", nome: "🚑 Resgate", cor: "bg-blue-500" },
  { id: "queixa", nome: "📋 Queixa", cor: "bg-purple-500" },
  { id: "apreensao", nome: "🔒 Apreensão", cor: "bg-gray-500" },
  { id: "vistoria", nome: "🔍 Vistoria", cor: "bg-green-500" },
  { id: "inspecao", nome: "📊 Inspeção", cor: "bg-teal-500" },
  { id: "outro", nome: "📄 Outro", cor: "bg-indigo-500" }
];

// Autoridades predefinidas
const AUTORIDADES = [
  "CEPNA - Centro de Estudos e Proteção da Natureza",
  "GNR - Guarda Nacional Republicana",
  "ICNF - Instituto da Conservação da Natureza e das Florestas",
  "DGAV - Direção-Geral de Alimentação e Veterinária",
  "Veterinária Municipal",
  "PSP - Polícia de Segurança Pública",
  "Bombeiros",
  "SEPNA - Serviço de Proteção da Natureza e do Ambiente",
  "Câmara Municipal",
  "Outra"
];

// Status predefinidos
const STATUS_OPTIONS = [
  { id: "aberta", nome: "🔴 Aberta", cor: "bg-red-100 text-red-800" },
  { id: "em_andamento", nome: "🟡 Em Andamento", cor: "bg-yellow-100 text-yellow-800" },
  { id: "resolvida", nome: "🟢 Resolvida", cor: "bg-green-100 text-green-800" },
  { id: "arquivada", nome: "⚫ Arquivada", cor: "bg-gray-100 text-gray-800" }
];

// Prioridades predefinidas
const PRIORIDADES = [
  { id: "baixa", nome: "🟢 Baixa", cor: "bg-green-100 text-green-800" },
  { id: "media", nome: "🟡 Média", cor: "bg-yellow-100 text-yellow-800" },
  { id: "alta", nome: "🟠 Alta", cor: "bg-orange-100 text-orange-800" },
  { id: "urgente", nome: "🔴 Urgente", cor: "bg-red-100 text-red-800" }
];

const IntervencoesAutoridades = () => {
  const { id } = useParams(); // ID do animal
  const { toast } = useToast();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNovaIntervencao, setShowNovaIntervencao] = useState(false);
  const [editingIntervencao, setEditingIntervencao] = useState<Intervencao | null>(null);
  
  const [intervencaoForm, setIntervencaoForm] = useState({
    data_intervencao: new Date().toISOString().split('T')[0],
    tipo_intervencao: '',
    autoridade: '',
    auto_intervencao: '',
    voluntario_delegado_id: '',
    status: 'aberta',
    prioridade: 'media',
    data_fim: '',
    localizacao_intervencao: '',
    resultado_intervencao: '',
    valor_multa: '',
    contacto_autoridade: '',
    observacoes: ''
  });

  useEffect(() => {
    if (id) {
      fetchAnimalData();
      loadIntervencoes();
    }
  }, [id]);

const fetchAnimalData = async () => {
    try {
      console.log('Carregando animal com ID:', id);
      
      if (!id) {
        throw new Error('ID do animal não fornecido');
      }
      
      const { data, error } = await supabase
        .from('animais')
        .select('id, nome, especie')
        .eq('id', id)
        .single();

      console.log('Resposta da query animal:', { data, error });
      
      if (error) {
        console.error('Erro na query do animal:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Animal não encontrado');
      }
      
      setAnimal(data);
      console.log('Animal carregado com sucesso:', data);
    } catch (error: any) {
      console.error('Erro ao carregar animal:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar dados do animal",
        variant: "destructive",
      });
    }
  };

  const loadIntervencoes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('intervencoes_autoridades_2025_12_18_04_50')
        .select(`
          *,
          voluntarios(id, nome, display_name, full_name, email)
        `)
        .eq('animal_id', id)
        .order('data_intervencao', { ascending: false });

      if (error) throw error;
      setIntervencoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar intervenções:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar intervenções",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetIntervencaoForm = () => {
    setIntervencaoForm({
      data_intervencao: new Date().toISOString().split('T')[0],
      tipo_intervencao: '',
      autoridade: '',
      auto_intervencao: '',
      voluntario_delegado_id: '',
      status: 'aberta',
      prioridade: 'media',
      data_fim: '',
      localizacao_intervencao: '',
      resultado_intervencao: '',
      valor_multa: '',
      contacto_autoridade: '',
      observacoes: ''
    });
  };

  const openIntervencaoDialog = (intervencao?: Intervencao) => {
    if (intervencao) {
      setEditingIntervencao(intervencao);
      setIntervencaoForm({
        data_intervencao: intervencao.data_intervencao || '',
        tipo_intervencao: intervencao.tipo_intervencao || '',
        autoridade: intervencao.autoridade || '',
        auto_intervencao: intervencao.auto_intervencao || '',
        voluntario_delegado_id: intervencao.voluntario_delegado_id || '',
        status: intervencao.status || 'aberta',
        prioridade: intervencao.prioridade || 'media',
        data_fim: intervencao.data_fim || '',
        localizacao_intervencao: intervencao.localizacao_intervencao || '',
        resultado_intervencao: intervencao.resultado_intervencao || '',
        valor_multa: intervencao.valor_multa?.toString() || '',
        contacto_autoridade: intervencao.contacto_autoridade || '',
        observacoes: intervencao.observacoes || ''
      });
    } else {
      setEditingIntervencao(null);
      resetIntervencaoForm();
    }
    setShowNovaIntervencao(true);
  };

const handleIntervencaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos obrigatórios
    if (!intervencaoForm.data_intervencao || !intervencaoForm.tipo_intervencao || !intervencaoForm.autoridade) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios (Data, Tipo e Autoridade)",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const intervencaoData = {
        animal_id: id,
        data_intervencao: intervencaoForm.data_intervencao,
        tipo_intervencao: intervencaoForm.tipo_intervencao,
        autoridade: intervencaoForm.autoridade,
        auto_intervencao: intervencaoForm.auto_intervencao || null,
        voluntario_delegado_id: intervencaoForm.voluntario_delegado_id || null,
        status: intervencaoForm.status,
        prioridade: intervencaoForm.prioridade,
        data_fim: intervencaoForm.data_fim || null,
        localizacao_intervencao: intervencaoForm.localizacao_intervencao || null,
        resultado_intervencao: intervencaoForm.resultado_intervencao || null,
        valor_multa: intervencaoForm.valor_multa ? parseFloat(intervencaoForm.valor_multa) : null,
        contacto_autoridade: intervencaoForm.contacto_autoridade || null,
        observacoes: intervencaoForm.observacoes || null
      };

      let error;
      
      if (editingIntervencao) {
        // Atualizar intervenção existente
        const { error: updateError } = await supabase
          .from('intervencoes_autoridades_2025_12_18_04_50')
          .update(intervencaoData)
          .eq('id', editingIntervencao.id);
        error = updateError;
      } else {
        // Criar nova intervenção
        const { error: insertError } = await supabase
          .from('intervencoes_autoridades_2025_12_18_04_50')
          .insert(intervencaoData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: editingIntervencao ? "Intervenção atualizada com sucesso!" : "Intervenção criada com sucesso!",
      });

      setShowNovaIntervencao(false);
      setEditingIntervencao(null);
      resetIntervencaoForm();
      await loadIntervencoes();
    } catch (error: any) {
      console.error('Erro ao salvar intervenção:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar intervenção",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIntervencao = async (intervencaoId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta intervenção?')) return;

    try {
      const { error } = await supabase
        .from('intervencoes_autoridades_2025_12_18_04_50')
        .delete()
        .eq('id', intervencaoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Intervenção excluída com sucesso!",
      });

await loadIntervencoes();
      
      // Se não há mais intervenções, recarregar dados do animal
      if (intervencoes.length <= 1) {
        await fetchAnimalData();
      }
} catch (error: any) {
      console.error('Erro ao excluir intervenção:', error);
      
      let errorMessage = "Erro ao excluir intervenção";
      
      // Tratar erro específico de foreign key constraint
      if (error.code === '23503') {
        errorMessage = "Esta intervenção possui movimentos financeiros associados. Os movimentos serão eliminados automaticamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getTipoInfo = (tipo: string) => {
    return TIPOS_INTERVENCAO.find(t => t.id === tipo) || { nome: tipo, cor: "bg-gray-500" };
  };

  const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find(s => s.id === status) || { nome: status, cor: "bg-gray-100 text-gray-800" };
  };

  const getPrioridadeInfo = (prioridade: string) => {
    return PRIORIDADES.find(p => p.id === prioridade) || { nome: prioridade, cor: "bg-gray-100 text-gray-800" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando intervenções...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={`/animal/${id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Ficha
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Intervenções das Autoridades</h1>
              {animal && (
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">{animal.nome}</span> - {animal.especie}
                </p>
              )}
            </div>
          </div>
          <Button onClick={() => openIntervencaoDialog()} className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Intervenção
          </Button>
        </div>

        {/* Lista de Intervenções */}
        {intervencoes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma intervenção registada</h3>
              <p className="text-gray-500 mb-4">
                Este animal ainda não possui intervenções das autoridades registadas.
              </p>
              <Button onClick={() => openIntervencaoDialog()} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Registar Primeira Intervenção
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {intervencoes.map((intervencao) => {
              const tipoInfo = getTipoInfo(intervencao.tipo_intervencao);
              const statusInfo = getStatusInfo(intervencao.status);
              const prioridadeInfo = getPrioridadeInfo(intervencao.prioridade);
              
              return (
                <Card key={intervencao.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge className={`${tipoInfo.cor} text-white`}>
                            {tipoInfo.nome}
                          </Badge>
                          <Badge className={statusInfo.cor}>
                            {statusInfo.nome}
                          </Badge>
                          <Badge className={prioridadeInfo.cor}>
                            {prioridadeInfo.nome}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Data da Intervenção
                            </label>
                            <p className="text-gray-900 font-medium">
                              {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600 flex items-center">
                              <Shield className="h-4 w-4 mr-1" />
                              Autoridade
                            </label>
                            <p className="text-gray-900 font-medium">{intervencao.autoridade}</p>
                          </div>
                          
                          {intervencao.auto_intervencao && (
                            <div>
                              <label className="text-sm font-medium text-gray-600 flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                Auto de Intervenção
                              </label>
                              <p className="text-gray-900 font-medium">{intervencao.auto_intervencao}</p>
                            </div>
                          )}
                          
                          {intervencao.voluntarios && (
                            <div>
                              <label className="text-sm font-medium text-gray-600 flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                Voluntário Delegado
                              </label>
                              <p className="text-gray-900 font-medium">
                                {intervencao.voluntarios.display_name || intervencao.voluntarios.nome}
                              </p>
                            </div>
                          )}
                          
                          {intervencao.valor_multa && (
                            <div>
                              <label className="text-sm font-medium text-gray-600 flex items-center">
                                <Euro className="h-4 w-4 mr-1" />
                                Valor da Multa
                              </label>
                              <p className="text-gray-900 font-medium">€{intervencao.valor_multa}</p>
                            </div>
                          )}
                          
                          {intervencao.data_fim && (
                            <div>
                              <label className="text-sm font-medium text-gray-600 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Data de Resolução
                              </label>
                              <p className="text-gray-900 font-medium">
                                {new Date(intervencao.data_fim).toLocaleDateString('pt-PT')}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {intervencao.observacoes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <label className="text-sm font-medium text-gray-600">Observações</label>
                            <p className="text-gray-900 mt-1">{intervencao.observacoes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openIntervencaoDialog(intervencao)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteIntervencao(intervencao.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal de Nova/Editar Intervenção */}
        <Dialog open={showNovaIntervencao} onOpenChange={setShowNovaIntervencao}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIntervencao ? 'Editar Intervenção' : 'Nova Intervenção das Autoridades'}
              </DialogTitle>
              <DialogDescription>
                {animal && `Registar intervenção para ${animal.nome} - ${animal.especie}`}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleIntervencaoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data da Intervenção */}
                <div>
                  <Label htmlFor="data_intervencao">Data da Intervenção *</Label>
                  <Input
                    id="data_intervencao"
                    type="date"
                    value={intervencaoForm.data_intervencao}
                    onChange={(e) => setIntervencaoForm({ ...intervencaoForm, data_intervencao: e.target.value })}
                    required
                  />
                </div>

                {/* Tipo de Intervenção */}
                <div>
                  <Label htmlFor="tipo_intervencao">Tipo de Intervenção *</Label>
                  <Select 
                    value={intervencaoForm.tipo_intervencao} 
                    onValueChange={(value) => setIntervencaoForm({ ...intervencaoForm, tipo_intervencao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_INTERVENCAO.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Autoridade */}
                <div>
                  <Label htmlFor="autoridade">Autoridade *</Label>
                  <Select 
                    value={intervencaoForm.autoridade} 
                    onValueChange={(value) => setIntervencaoForm({ ...intervencaoForm, autoridade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar autoridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTORIDADES.map((autoridade) => (
                        <SelectItem key={autoridade} value={autoridade}>
                          {autoridade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Auto de Intervenção */}
                <div>
                  <Label htmlFor="auto_intervencao">Auto de Intervenção</Label>
                  <Input
                    id="auto_intervencao"
                    value={intervencaoForm.auto_intervencao}
                    onChange={(e) => setIntervencaoForm({ ...intervencaoForm, auto_intervencao: e.target.value })}
                    placeholder="Número/referência oficial"
                  />
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={intervencaoForm.status} 
                    onValueChange={(value) => setIntervencaoForm({ ...intervencaoForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prioridade */}
                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select 
                    value={intervencaoForm.prioridade} 
                    onValueChange={(value) => setIntervencaoForm({ ...intervencaoForm, prioridade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORIDADES.map((prioridade) => (
                        <SelectItem key={prioridade.id} value={prioridade.id}>
                          {prioridade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data de Fim */}
                <div>
                  <Label htmlFor="data_fim">Data de Resolução</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={intervencaoForm.data_fim}
                    onChange={(e) => setIntervencaoForm({ ...intervencaoForm, data_fim: e.target.value })}
                  />
                </div>

                {/* Valor da Multa */}
                <div>
                  <Label htmlFor="valor_multa">Valor da Multa (€)</Label>
                  <Input
                    id="valor_multa"
                    type="number"
                    step="0.01"
                    value={intervencaoForm.valor_multa}
                    onChange={(e) => setIntervencaoForm({ ...intervencaoForm, valor_multa: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Voluntário Delegado */}
              <div>
                <VoluntarioSelector
                  value={intervencaoForm.voluntario_delegado_id}
                  onValueChange={(voluntarioId) => {
                    setIntervencaoForm({ ...intervencaoForm, voluntario_delegado_id: voluntarioId });
                  }}
                  label="Voluntário Delegado"
                  placeholder="Selecionar voluntário responsável (opcional)..."
                  showFullName={true}
                  required={false}
                />
              </div>

              {/* Localização da Intervenção */}
              <div>
                <Label htmlFor="localizacao_intervencao">Localização da Intervenção</Label>
                <Input
                  id="localizacao_intervencao"
                  value={intervencaoForm.localizacao_intervencao}
                  onChange={(e) => setIntervencaoForm({ ...intervencaoForm, localizacao_intervencao: e.target.value })}
                  placeholder="Onde ocorreu a intervenção"
                />
              </div>

              {/* Contacto da Autoridade */}
              <div>
                <Label htmlFor="contacto_autoridade">Contacto da Autoridade</Label>
                <Input
                  id="contacto_autoridade"
                  value={intervencaoForm.contacto_autoridade}
                  onChange={(e) => setIntervencaoForm({ ...intervencaoForm, contacto_autoridade: e.target.value })}
                  placeholder="Telefone/email do responsável"
                />
              </div>

              {/* Resultado da Intervenção */}
              <div>
                <Label htmlFor="resultado_intervencao">Resultado da Intervenção</Label>
                <Textarea
                  id="resultado_intervencao"
                  value={intervencaoForm.resultado_intervencao}
                  onChange={(e) => setIntervencaoForm({ ...intervencaoForm, resultado_intervencao: e.target.value })}
                  placeholder="Descreva o resultado ou resolução da intervenção"
                  rows={3}
                />
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={intervencaoForm.observacoes}
                  onChange={(e) => setIntervencaoForm({ ...intervencaoForm, observacoes: e.target.value })}
                  placeholder="Detalhes adicionais sobre a intervenção"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowNovaIntervencao(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingIntervencao ? 'Atualizar' : 'Criar'} Intervenção
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default IntervencoesAutoridades;