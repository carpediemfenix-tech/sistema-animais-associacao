import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  X, 
  Shield, 
  Heart, 
  Brain, 
  Truck, 
  Calendar, 
  Camera, 
  Share, 
  FileText, 
  DollarSign, 
  BookOpen,
  Star,
  Award,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Especialidade {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: string;
  cor: string;
  icone: string;
  pontos_bonus: number;
  requer_certificacao: boolean;
  ativo: boolean;
}

interface VoluntarioEspecialidade {
  id: string;
  especialidade_id: string;
  nivel_experiencia: string;
  data_certificacao?: string;
  certificado_valido_ate?: string;
  observacoes?: string;
  ativo: boolean;
  especialidade: Especialidade;
}

interface EspecialidadesVoluntarioProps {
  voluntarioId: string;
  readOnly?: boolean;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Shield, Heart, Brain, Truck, Calendar, Camera, Share, FileText, DollarSign, BookOpen, Star, Award
};

const corMap: Record<string, string> = {
  red: 'bg-red-100 text-red-800 border-red-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200'
};

const nivelMap: Record<string, { label: string; cor: string }> = {
  iniciante: { label: 'Iniciante', cor: 'bg-slate-100 text-slate-700' },
  intermediario: { label: 'Intermediário', cor: 'bg-blue-100 text-blue-700' },
  avancado: { label: 'Avançado', cor: 'bg-purple-100 text-purple-700' },
  expert: { label: 'Expert', cor: 'bg-gold-100 text-gold-700' }
};

const EspecialidadesVoluntario: React.FC<EspecialidadesVoluntarioProps> = ({ 
  voluntarioId, 
  readOnly = false 
}) => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [voluntarioEspecialidades, setVoluntarioEspecialidades] = useState<VoluntarioEspecialidade[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [novaEspecialidade, setNovaEspecialidade] = useState({
    especialidade_id: '',
    nivel_experiencia: 'iniciante',
    data_certificacao: '',
    certificado_valido_ate: '',
    observacoes: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [voluntarioId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar todas as especialidades disponíveis
      const { data: especialidadesData, error: especialidadesError } = await supabase
        .from('especialidades_voluntarios_2025_12_21_22_00')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (especialidadesError) throw especialidadesError;

      // Carregar especialidades do voluntário
      const { data: voluntarioEspecialidadesData, error: voluntarioError } = await supabase
        .from('voluntario_especialidades_2025_12_21_22_00')
        .select(`
          *,
          especialidade:especialidades_voluntarios_2025_12_21_22_00(*)
        `)
        .eq('voluntario_id', voluntarioId)
        .eq('ativo', true);

      if (voluntarioError) throw voluntarioError;

      setEspecialidades(especialidadesData || []);
      setVoluntarioEspecialidades(voluntarioEspecialidadesData || []);
    } catch (error: any) {
      console.error('Erro ao carregar especialidades:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar especialidades do voluntário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEspecialidade = async () => {
    if (!novaEspecialidade.especialidade_id) {
      toast({
        title: "Erro",
        description: "Selecione uma especialidade",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('voluntario_especialidades_2025_12_21_22_00')
        .insert({
          voluntario_id: voluntarioId,
          especialidade_id: novaEspecialidade.especialidade_id,
          nivel_experiencia: novaEspecialidade.nivel_experiencia,
          data_certificacao: novaEspecialidade.data_certificacao || null,
          certificado_valido_ate: novaEspecialidade.certificado_valido_ate || null,
          observacoes: novaEspecialidade.observacoes || null,
          ativo: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Especialidade adicionada com sucesso",
      });

      setDialogOpen(false);
      setNovaEspecialidade({
        especialidade_id: '',
        nivel_experiencia: 'iniciante',
        data_certificacao: '',
        certificado_valido_ate: '',
        observacoes: ''
      });
      
      await loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar especialidade:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar especialidade",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveEspecialidade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('voluntario_especialidades_2025_12_21_22_00')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Especialidade removida com sucesso",
      });

      await loadData();
    } catch (error: any) {
      console.error('Erro ao remover especialidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover especialidade",
        variant: "destructive",
      });
    }
  };

  const getEspecialidadeIcon = (icone: string) => {
    const IconComponent = iconMap[icone] || Star;
    return <IconComponent className="h-4 w-4" />;
  };

  const getEspecialidadeCor = (cor: string) => {
    return corMap[cor] || corMap.gray;
  };

  const especialidadesDisponiveis = especialidades.filter(
    esp => !voluntarioEspecialidades.some(ve => ve.especialidade_id === esp.id)
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Especialidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Award className="h-5 w-5" />
          <span>Especialidades</span>
        </CardTitle>
        {!readOnly && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Especialidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Especialidade</Label>
                  <Select
                    value={novaEspecialidade.especialidade_id}
                    onValueChange={(value) => setNovaEspecialidade(prev => ({ ...prev, especialidade_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {especialidadesDisponiveis.map((esp) => (
                        <SelectItem key={esp.id} value={esp.id}>
                          <div className="flex items-center space-x-2">
                            {getEspecialidadeIcon(esp.icone)}
                            <span>{esp.nome}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Nível de Experiência</Label>
                  <Select
                    value={novaEspecialidade.nivel_experiencia}
                    onValueChange={(value) => setNovaEspecialidade(prev => ({ ...prev, nivel_experiencia: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Data de Certificação (opcional)</Label>
                  <Input
                    type="date"
                    value={novaEspecialidade.data_certificacao}
                    onChange={(e) => setNovaEspecialidade(prev => ({ ...prev, data_certificacao: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Certificado Válido Até (opcional)</Label>
                  <Input
                    type="date"
                    value={novaEspecialidade.certificado_valido_ate}
                    onChange={(e) => setNovaEspecialidade(prev => ({ ...prev, certificado_valido_ate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Observações (opcional)</Label>
                  <Textarea
                    value={novaEspecialidade.observacoes}
                    onChange={(e) => setNovaEspecialidade(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Notas sobre a especialidade..."
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleAddEspecialidade} 
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Adicionando..." : "Adicionar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {voluntarioEspecialidades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma especialidade registada</p>
            {!readOnly && (
              <p className="text-sm">Clique em "Adicionar" para registar especialidades</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {voluntarioEspecialidades.map((ve) => (
              <div key={ve.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className={`${getEspecialidadeCor(ve.especialidade.cor)} border`}>
                    {getEspecialidadeIcon(ve.especialidade.icone)}
                    <span className="ml-2">{ve.especialidade.nome}</span>
                  </Badge>
                  <Badge variant="outline" className={nivelMap[ve.nivel_experiencia]?.cor}>
                    {nivelMap[ve.nivel_experiencia]?.label}
                  </Badge>
                  {ve.especialidade.pontos_bonus > 0 && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      +{ve.especialidade.pontos_bonus} pts
                    </Badge>
                  )}
                  {ve.especialidade.requer_certificacao && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                {!readOnly && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveEspecialidade(ve.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EspecialidadesVoluntario;