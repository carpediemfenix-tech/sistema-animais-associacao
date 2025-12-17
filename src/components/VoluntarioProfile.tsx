import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  User, 
  Edit, 
  Save, 
  X, 
  UserCheck, 
  Mail, 
  Phone,
  Calendar,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Voluntario {
  id: string;
  full_name: string;
  nickname?: string;
  short_name: string;
  display_name: string;
  email: string;
  telefone?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface VoluntarioProfileProps {
  voluntarioId: string;
  onUpdate?: (voluntario: Voluntario) => void;
  showEditButton?: boolean;
  isCurrentUser?: boolean;
}

const VoluntarioProfile: React.FC<VoluntarioProfileProps> = ({
  voluntarioId,
  onUpdate,
  showEditButton = true,
  isCurrentUser = false
}) => {
  const { toast } = useToast();
  const [voluntario, setVoluntario] = useState<Voluntario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    nickname: ''
  });
  const [saving, setSaving] = useState(false);

  const loadVoluntario = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('obter_voluntario_display', { p_voluntario_id: voluntarioId });

      if (error) throw error;

      if (data && data.length > 0) {
        const vol = data[0];
        setVoluntario(vol);
        setEditForm({
          full_name: vol.full_name || '',
          nickname: vol.nickname || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar voluntário:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do voluntário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNickname = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .rpc('atualizar_nickname_voluntario', {
          p_voluntario_id: voluntarioId,
          p_novo_nickname: editForm.nickname
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Apelido atualizado com sucesso!",
      });

      // Recarregar dados
      await loadVoluntario();
      setEditDialogOpen(false);

      if (onUpdate && voluntario) {
        onUpdate({ ...voluntario, nickname: editForm.nickname });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar apelido:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar apelido",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFullName = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .rpc('atualizar_full_name_voluntario', {
          p_voluntario_id: voluntarioId,
          p_novo_full_name: editForm.full_name
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nome completo atualizado com sucesso!",
      });

      // Recarregar dados
      await loadVoluntario();
      setEditDialogOpen(false);

      if (onUpdate && voluntario) {
        onUpdate({ ...voluntario, full_name: editForm.full_name });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar nome completo:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar nome completo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (voluntarioId) {
      loadVoluntario();
    }
  }, [voluntarioId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <User className="h-8 w-8 animate-pulse mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Carregando perfil...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!voluntario) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Voluntário não encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{voluntario.display_name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Voluntário Ativo
                </Badge>
                {isCurrentUser && (
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    Seu Perfil
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {showEditButton && (
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>
                    Altere as informações do voluntário. O nome de exibição é calculado automaticamente.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Nome completo legal"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Apenas administradores podem alterar o nome completo
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="nickname">Apelido (Opcional)</Label>
                    <Input
                      id="nickname"
                      value={editForm.nickname}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                      placeholder="Nome operacional escolhido"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se preenchido, será usado como nome de exibição
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700">Pré-visualização:</Label>
                    <div className="mt-1">
                      <div className="text-sm">
                        <strong>Nome de exibição:</strong> {
                          editForm.nickname?.trim() || 
                          (editForm.full_name ? editForm.full_name.split(' ').filter((word, index, arr) => 
                            index === 0 || (index === arr.length - 1 && !['da', 'de', 'do', 'dos', 'das', 'e'].includes(word.toLowerCase()))
                          ).join(' ') : '')
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveNickname}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Apelido
                  </Button>
                  <Button
                    onClick={handleSaveFullName}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Nome
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações de Nome */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Nome Completo</Label>
            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{voluntario.full_name}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Nome de Exibição</Label>
            <p className="text-sm mt-1 p-2 bg-blue-50 rounded font-medium text-blue-900">
              {voluntario.display_name}
            </p>
          </div>
          
          {voluntario.nickname && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Apelido</Label>
              <p className="text-sm mt-1 p-2 bg-green-50 rounded text-green-900">
                {voluntario.nickname}
              </p>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Nome Curto</Label>
            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{voluntario.short_name}</p>
          </div>
        </div>
        
        <Separator />
        
        {/* Informações de Contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <p className="text-sm">{voluntario.email}</p>
            </div>
          </div>
          
          {voluntario.telefone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <Label className="text-sm font-medium text-gray-700">Telefone</Label>
                <p className="text-sm">{voluntario.telefone}</p>
              </div>
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Informações do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <div>
              <span>Criado em: </span>
              <span>{new Date(voluntario.created_at).toLocaleDateString('pt-PT')}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <div>
              <span>Atualizado em: </span>
              <span>{new Date(voluntario.updated_at).toLocaleDateString('pt-PT')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoluntarioProfile;